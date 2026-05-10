/**
 * HexaGene Official Wearable BLE Engine (X3 Protocol)
 * 
 * Protocol Specification:
 * - 16-byte command packets
 * - CRC-8 checksum: sum of first 15 bytes & 0xFF
 * - Service: 0xFFF0
 * - TX: 0xFFF6 (Write)
 * - RX: 0xFFF7 (Notify)
 */

const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const TX_UUID      = '0000fff6-0000-1000-8000-00805f9b34fb';
const RX_UUID      = '0000fff7-0000-1000-8000-00805f9b34fb';

/**
 * Calculate X3 CRC-8 Checksum
 * @param {Uint8Array} pkt 16-byte packet
 * @returns {number} 8-bit checksum
 */
export function calculateCRC(pkt) {
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    sum += pkt[i];
  }
  return sum & 0xFF;
}

/**
 * Build a standard 16-byte X3 command packet
 */
export function buildPacket(command, payload = []) {
  const pkt = new Uint8Array(16);
  pkt[0] = command;
  for (let i = 0; i < Math.min(payload.length, 14); i++) {
    pkt[i + 1] = payload[i];
  }
  pkt[15] = calculateCRC(pkt);
  return pkt;
}

export class X3BleEngine {
  constructor() {
    this.device = null;
    this.server = null;
    this.service = null;
    this.txChar = null;
    this.rxChar = null;
    
    this.onData = null;       // (parsedData) -> void
    this.onRawHex = null;     // (hexString) -> void
    this.onStatus = null;     // (statusString) -> void
    this.onConnection = null; // (connected, name) -> void
  }

  async connect() {
    try {
      this.logStatus("Requesting QRing/X3 device...");
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [0xFFF0, SERVICE_UUID]
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.logStatus("Disconnected");
        if (this.onConnection) this.onConnection(false, null);
      });

      this.logStatus("Connecting to GATT Server...");
      this.server = await this.device.gatt.connect();

      this.logStatus("Discovering X3 Service...");
      // Try multiple ways to get the service
      try {
        this.service = await this.server.getPrimaryService(0xFFF0);
      } catch (e) {
        try {
          this.service = await this.server.getPrimaryService(SERVICE_UUID);
        } catch (e2) {
          this.logStatus("Direct service lookup failed, scanning all services...");
          const services = await this.server.getPrimaryServices();
          this.logStatus(`Found ${services.length} total services.`);
          
          for (const s of services) {
            this.logStatus(`Checking service: ${s.uuid}`);
            // Check for fff0 in any form
            if (s.uuid.includes('fff0')) {
              this.service = s;
              break;
            }
          }
        }
      }

      if (!this.service) {
        throw new Error(`No Services matching UUID ${SERVICE_UUID} found in Device.`);
      }

      this.logStatus("Discovering Characteristics...");
      try {
        this.txChar = await this.service.getCharacteristic(TX_UUID);
      } catch (e) {
        this.txChar = await this.service.getCharacteristic(0xFFF6);
      }
      
      try {
        this.rxChar = await this.service.getCharacteristic(RX_UUID);
      } catch (e) {
        this.rxChar = await this.service.getCharacteristic(0xFFF7);
      }

      this.logStatus("Subscribing to RX Notifications...");
      this.rxChar.addEventListener('characteristicvaluechanged', (event) => {
        this._handleRx(new Uint8Array(event.target.value.buffer));
      });
      await this.rxChar.startNotifications();

      this.logStatus("Connection established");
      if (this.onConnection) this.onConnection(true, this.device.name);

      // Phase 4: Automatically send realtime streaming command (0x09)
      await this.enableRealtimeStreaming();

      return true;
    } catch (err) {
      this.logStatus(`Connection failed: ${err.message}`);
      throw err;
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
  }

  async enableRealtimeStreaming() {
    this.logStatus("Activating Realtime Stream (0x09)...");
    // 0x09 01 01 ... CRC
    // 01 01 enables steps and temperature
    const pkt = buildPacket(0x09, [0x01, 0x01]);
    await this.txChar.writeValueWithResponse(pkt);
  }

  _handleRx(data) {
    // Phase 6: Raw HEX Packet Debug
    const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    if (this.onRawHex) this.onRawHex(hex);

    const cmd = data[0];
    
    // Phase 3 & 4: Parse Realtime Packet (0x09 is usually 31 bytes or 16 depending on firmware)
    // Most X3 rings use 31-byte response for 0x09, but the 16-byte format is also common for status.
    if (cmd === 0x09) {
      this._parseRealtime(data);
    } else if (cmd === 0x13) {
      this._parseBattery(data);
    }
  }

  _parseRealtime(data) {
    if (data.length < 16) return;

    const metrics = {
      timestamp: Date.now(),
      steps: 0,
      heartRate: null,
      spo2: null,
      temperature: null,
    };

    if (data.length >= 26) {
      // 31-byte variant
      metrics.steps = (data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24)) >>> 0;
      metrics.heartRate = data[22] > 0 ? data[22] : null;
      const tempRaw = data[23] | (data[24] << 8);
      metrics.temperature = tempRaw > 0 ? (tempRaw / 10).toFixed(1) : null;
      metrics.spo2 = data[25] > 0 ? data[25] : null;
    } else {
      // 16-byte variant (fallback)
      metrics.steps = (data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24)) >>> 0;
    }

    if (this.onData) this.onData(metrics);
  }

  _parseBattery(data) {
    const battery = {
      level: data[1],
      charging: data[2] === 1
    };
    if (this.onData) this.onData({ battery });
  }

  logStatus(msg) {
    console.log(`[X3-BLE] ${msg}`);
    if (this.onStatus) this.onStatus(msg);
  }
}
