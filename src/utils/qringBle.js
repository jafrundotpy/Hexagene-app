/**
 * QRing X6 BLE Driver — Web Bluetooth Implementation
 * Shenzhen Youhong Technology Co., Ltd. Protocol v1.1
 *
 * Service UUID : 0xFFF0
 * TX (App→Ring): 0xFFF6  (write)
 * RX (Ring→App): 0xFFF7  (notify)
 *
 * Packet format: [CMD(1), PAYLOAD(14), CRC(1)] = 16 bytes
 * CRC = sum(bytes[0..14]) & 0xFF
 */

const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const TX_UUID      = '0000fff6-0000-1000-8000-00805f9b34fb'; // App → Ring
const RX_UUID      = '0000fff7-0000-1000-8000-00805f9b34fb'; // Ring → App

export const CMD = {
  SET_TIME          : 0x01,
  GET_TIME          : 0x41,
  SET_USER_INFO     : 0x02,
  READ_BATTERY      : 0x13,
  REALTIME_MODE     : 0x09, // Steps/HR/SpO2/Temp streaming (31 bytes/sec)
  MEASUREMENT       : 0x28, // HR / SpO2 / HRV measurement control
  GET_HRV_HISTORY   : 0x56,
  GET_HR_HISTORY    : 0x55,
  GET_SPO2_HISTORY  : 0x66,
  GET_STEPS_TOTAL   : 0x51,
  GET_SLEEP_HISTORY : 0x53,
  MCU_RESET         : 0x2E,
};

function calcCRC(pkt) {
  let s = 0;
  for (let i = 0; i < 15; i++) s += pkt[i];
  return s & 0xFF;
}

export function buildPacket(cmd, payload = []) {
  const pkt = new Uint8Array(16);
  pkt[0] = cmd;
  for (let i = 0; i < Math.min(payload.length, 14); i++) pkt[i + 1] = payload[i];
  pkt[15] = calcCRC(pkt);
  return pkt;
}

export class QRingBLE {
  constructor() {
    this.device           = null;
    this.server           = null;
    this.txChar           = null;
    this.rxChar           = null;
    this.onRealtimeData   = null;  // (parsedMetrics) → live UI update
    this.onConnectionChange = null; // (connected, deviceName)
    this._responseResolve = null;
    this._variableCollector = null;
  }

  // ─── Connect ─────────────────────────────────────────────────────────────

  async connect() {
    // 0xFFF0 is the 16-bit short UUID. Browsers handle the expansion.
    const shortServiceId = 0xfff0; 

    this.device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: [shortServiceId, SERVICE_UUID],
    });

    this.device.addEventListener('gattserverdisconnected', () => {
      if (this.onConnectionChange) this.onConnectionChange(false, null);
    });

    this.server = await this.device.gatt.connect();
    
    // 🔍 Smart Service Discovery
    // Some rings advertise 0xFFF0 as a secondary service or use a hidden variant.
    // We try the official UUID first, then iterate all services to find our TX/RX characteristics.
    try {
      this.service = await this.server.getPrimaryService(SERVICE_UUID);
    } catch (e) {
      console.warn("Primary service UUID 0xFFF0 not found, scanning all services...");
      const services = await this.server.getPrimaryServices();
      for (const s of services) {
        try {
          // Check if this service contains the TX characteristic (0xFFF6)
          await s.getCharacteristic(TX_UUID);
          this.service = s;
          console.log("Found compatible QRing service:", s.uuid);
          break;
        } catch (err) { continue; }
      }
    }

    if (!this.service) {
      throw new Error("No compatible QRing service found. Please ensure you are connecting to an X6 Smart Ring.");
    }

    this.txChar = await this.service.getCharacteristic(TX_UUID);
    this.rxChar = await this.service.getCharacteristic(RX_UUID);

    this.rxChar.addEventListener('characteristicvaluechanged', (e) => {
      this._onRx(new Uint8Array(e.target.value.buffer));
    });
    await this.rxChar.startNotifications();

    if (this.onConnectionChange) this.onConnectionChange(true, this.device.name);
    return this.device.name;
  }

  disconnect() {
    if (this.device?.gatt?.connected) this.device.gatt.disconnect();
  }

  get isConnected() {
    return !!(this.device?.gatt?.connected);
  }

  // ─── Internal RX handler ─────────────────────────────────────────────────

  _onRx(data) {
    const cmd = data[0];

    // 1. Real-time streaming packets (0x09) → live metrics callback
    if (cmd === 0x09 && data.length >= 26) {
      if (this.onRealtimeData) this.onRealtimeData(parseRealtimeUpdate(data));
    }

    // 2. Variable-length multi-packet responses (history data)
    if (this._variableCollector) {
      const { cmdByte, packets, resolve, timer } = this._variableCollector;
      if (cmd === cmdByte) {
        if (data[1] === 0xFF) {
          // End-of-data marker
          clearTimeout(timer);
          this._variableCollector = null;
          resolve(packets);
        } else {
          packets.push(data);
        }
        return;
      }
    }

    // 3. Single 16-byte command responses
    if (this._responseResolve) {
      this._responseResolve(data);
      this._responseResolve = null;
    }
  }

  // ─── Write helpers ───────────────────────────────────────────────────────

  async _write(pkt) {
    await this.txChar.writeValueWithResponse(pkt);
  }

  _waitSingle(ms = 3000) {
    return new Promise((resolve, reject) => {
      const t = setTimeout(() => {
        this._responseResolve = null;
        reject(new Error('BLE timeout'));
      }, ms);
      this._responseResolve = (data) => { clearTimeout(t); resolve(data); };
    });
  }

  async _sendRecv(cmd, payload = [], ms = 3000) {
    const promise = this._waitSingle(ms);
    await this._write(buildPacket(cmd, payload));
    return promise;
  }

  _collectMulti(cmdByte, ms = 4000) {
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this._variableCollector = null;
        resolve([]);
      }, ms);
      this._variableCollector = { cmdByte, packets: [], resolve, timer };
    });
  }

  // ─── Public API ──────────────────────────────────────────────────────────

  /** Sync ring clock to device time */
  async setTime() {
    const n = new Date();
    const p = [
      n.getFullYear() % 100, n.getMonth() + 1, n.getDate(),
      n.getHours(), n.getMinutes(), n.getSeconds(),
      0, 0, 0, 0, 0, 0, 0, 0,
    ];
    return this._sendRecv(CMD.SET_TIME, p);
  }

  /** Write user profile to ring (used for calorie/distance accuracy) */
  async setUserInfo({ gender = 1, age = 30, height = 170, weight = 70 } = {}) {
    return this._sendRecv(CMD.SET_USER_INFO, [gender & 0xFF, age & 0xFF, height & 0xFF, weight & 0xFF]);
  }

  /** Read battery level → { level: 0-100, charging: bool } */
  async readBattery() {
    const r = await this._sendRecv(CMD.READ_BATTERY);
    if (r[0] === CMD.READ_BATTERY) return { level: r[1], charging: r[2] === 1 };
    return { level: 0, charging: false };
  }

  /**
   * Enable real-time streaming mode (0x09).
   * Ring pushes a 31-byte packet every second containing:
   *   HR, SpO2, Steps, Calories, Distance, Temperature.
   * Results delivered to this.onRealtimeData callback.
   */
  async startRealtimeMode() {
    // AA=1 enable steps, BB=1 enable temperature
    await this._write(buildPacket(CMD.REALTIME_MODE, [1, 1]));
  }

  async stopRealtimeMode() {
    await this._write(buildPacket(CMD.REALTIME_MODE, [0, 0]));
  }

  /** Start on-demand HR measurement. SpO2+HR visible in realtime stream. */
  async startHRMeasurement(durationSec = 30) {
    return this._sendRecv(CMD.MEASUREMENT, [0x02, 0x01, 0x00, 0x00, durationSec & 0xFF, (durationSec >> 8) & 0xFF]);
  }

  /** Start on-demand SpO2 measurement. SpO2 visible in realtime stream. */
  async startSpO2Measurement(durationSec = 30) {
    return this._sendRecv(CMD.MEASUREMENT, [0x03, 0x01, 0x00, 0x00, durationSec & 0xFF, (durationSec >> 8) & 0xFF]);
  }

  /** Start HRV/stress measurement (60s recommended). Results → 0x56 history. */
  async startHRVMeasurement(durationSec = 60) {
    return this._sendRecv(CMD.MEASUREMENT, [0x01, 0x01, 0x00, 0x00, durationSec & 0xFF, (durationSec >> 8) & 0xFF]);
  }

  async stopMeasurement(type) {
    // type: 0x01=HRV, 0x02=HR, 0x03=SpO2
    return this._sendRecv(CMD.MEASUREMENT, [type, 0x00]);
  }

  /** Read latest HRV record → { hrv, heartRate, fatigue, systolic, diastolic } */
  async getLatestHRV() {
    const collectP = this._collectMulti(CMD.GET_HRV_HISTORY, 4000);
    await this._write(buildPacket(CMD.GET_HRV_HISTORY, [0x00]));
    return collectP;
  }

  /** Read latest heart rate record → [ { heartRate } ] */
  async getLatestHR() {
    const collectP = this._collectMulti(CMD.GET_HR_HISTORY, 4000);
    await this._write(buildPacket(CMD.GET_HR_HISTORY, [0x00]));
    return collectP;
  }

  /** Read latest SpO2 record → [ { spo2 } ] */
  async getLatestSpO2() {
    const collectP = this._collectMulti(CMD.GET_SPO2_HISTORY, 4000);
    await this._write(buildPacket(CMD.GET_SPO2_HISTORY, [0x00]));
    return collectP;
  }

  /** Read today's total step count → { steps, calories, distance, exerciseMinutes } */
  async getTotalSteps() {
    const collectP = this._collectMulti(CMD.GET_STEPS_TOTAL, 4000);
    await this._write(buildPacket(CMD.GET_STEPS_TOTAL, [0x00]));
    return collectP;
  }
}

// ─── Parser functions (exported for use in UI components) ─────────────────────

/** Parse 0x09 real-time 31-byte packet */
export function parseRealtimeUpdate(data) {
  if (!data || data.length < 26 || data[0] !== 0x09) return null;
  const steps     = readU32LE(data, 1);
  const calRaw    = readU32LE(data, 5);
  const distRaw   = readU32LE(data, 9);
  const hr        = data[22];
  const tempRaw   = readU16LE(data, 23);
  const spo2      = data[25];
  return {
    steps,
    calories       : +(calRaw / 100).toFixed(2),
    distance       : +(distRaw / 100).toFixed(2),
    heartRate      : hr > 30 && hr < 220 ? hr : null,
    temperature    : tempRaw > 0 ? +(tempRaw / 10).toFixed(1) : null,
    spo2           : spo2 > 50 ? spo2 : null,
  };
}

/** Parse 0x13 battery response */
export function parseBattery(data) {
  if (!data || data[0] !== 0x13) return null;
  return { level: data[1], charging: data[2] === 1 };
}

/** Parse 0x56 HRV history packets array → latest entry */
export function parseHRVPackets(packets) {
  if (!packets?.length) return null;
  const p = packets[0]; // most recent
  if (p.length < 15) return null;
  return {
    hrv       : p[9],   // HRV value
    heartRate : p[11],  // heart rate
    fatigue   : p[12],  // stress/fatigue 0-100
    systolic  : p[13],  // BP systolic
    diastolic : p[14],  // BP diastolic
  };
}

/** Parse 0x55 HR history packets → latest HR */
export function parseHRPackets(packets) {
  if (!packets?.length || packets[0].length < 10) return null;
  return { heartRate: packets[0][9] };
}

/** Parse 0x66 SpO2 history packets → latest SpO2 */
export function parseSpO2Packets(packets) {
  if (!packets?.length || packets[0].length < 10) return null;
  return { spo2: packets[0][9] };
}

/** Parse 0x51 total steps packets → today's totals */
export function parseStepsPackets(packets) {
  if (!packets?.length || packets[0].length < 21) return null;
  const p = packets[0];
  return {
    steps          : readU32LE(p, 5),
    exerciseMinutes: Math.round(readU32LE(p, 9) / 60),
    distance       : +(readU32LE(p, 13) / 100).toFixed(2),
    calories       : +(readU32LE(p, 17) / 100).toFixed(2),
  };
}

function readU32LE(d, o) {
  return ((d[o] | (d[o+1]<<8) | (d[o+2]<<16) | (d[o+3]<<24)) >>> 0);
}
function readU16LE(d, o) {
  return d[o] | (d[o+1] << 8);
}
