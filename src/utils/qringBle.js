/**
 * HexaGene Official Wearable BLE Engine (X3 Protocol)
 * 
 * UUIDs (FULL FORMAT):
 * SERVICE_UUID: 0000fff0-0000-1000-8000-00805f9b34fb
 * TX_UUID:      0000fff6-0000-1000-8000-00805f9b34fb
 * RX_UUID:      0000fff7-0000-1000-8000-00805f9b34fb
 */

const SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';
const TX_UUID      = '0000fff6-0000-1000-8000-00805f9b34fb';
const RX_UUID      = '0000fff7-0000-1000-8000-00805f9b34fb';

export function calculateCRC(pkt) {
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    sum += pkt[i];
  }
  return sum & 0xFF;
}

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
    
    this.onData = null;
    this.onRawHex = null;
    this.onStatus = null;
    this.onConnection = null;
  }

  async connect() {
    // 5. Reconnect-safe logic: disconnect previous GATT before reconnect attempt
    if (this.device && this.device.gatt.connected) {
      this.logStatus("Disconnecting previous session...");
      await this.device.gatt.disconnect();
    }

    try {
      this.logStatus("Requesting X3 device (Accept All)...");
      this.device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [SERVICE_UUID]
      });

      this.device.addEventListener('gattserverdisconnected', () => {
        this.logStatus("GATT Disconnected");
        if (this.onConnection) this.onConnection(false, null);
      });

      this.logStatus(`Connecting to ${this.device.name}...`);
      this.server = await this.device.gatt.connect();

      // 4. 2-second delay after GATT connection before service discovery
      this.logStatus("GATT Connected. Waiting 2s for saturation...");
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.logStatus("Discovering X3 Service (Full UUID)...");
      
      // 3. Fallback service discovery
      try {
        this.service = await this.server.getPrimaryService(SERVICE_UUID);
      } catch (e) {
        this.logStatus(`Primary lookup failed: ${e.message}. Scanning all services...`);
        const services = await this.server.getPrimaryServices();
        
        for (const s of services) {
          this.logStatus(`Discovered Service: ${s.uuid}`);
          if (s.uuid === SERVICE_UUID || s.uuid.includes('fff0')) {
            this.service = s;
            this.logStatus(`Found Matching Service: ${s.uuid}`);
            break;
          }
        }
      }

      if (!this.service) {
        throw new Error("No compatible X3 services found in device.");
      }

      this.logStatus("Discovering Characteristics...");
      const chars = await this.service.getCharacteristics();
      for (const c of chars) {
        this.logStatus(`Discovered Char: ${c.uuid}`);
        if (c.uuid === TX_UUID) this.txChar = c;
        if (c.uuid === RX_UUID) this.rxChar = c;
      }

      if (!this.txChar || !this.rxChar) {
        throw new Error("Missing TX or RX characteristics.");
      }

      this.logStatus("Subscribing to RX Notifications...");
      this.rxChar.addEventListener('characteristicvaluechanged', (event) => {
        this._handleRx(new Uint8Array(event.target.value.buffer));
      });
      await this.rxChar.startNotifications();

      this.logStatus("X3 Engine Ready");
      if (this.onConnection) this.onConnection(true, this.device.name);

      await this.enableRealtimeStreaming();
      return true;
    } catch (err) {
      this.logStatus(`Engine Error: ${err.message}`);
      throw err;
    }
  }

  async disconnect() {
    if (this.device && this.device.gatt.connected) {
      await this.device.gatt.disconnect();
    }
  }

  async enableRealtimeStreaming() {
    const pkt = buildPacket(0x09, [0x01, 0x01]);
    await this.txChar.writeValueWithResponse(pkt);
  }

  _handleRx(data) {
    const hex = Array.from(data).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
    if (this.onRawHex) this.onRawHex(hex);

    const cmd = data[0];
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
      steps: (data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24)) >>> 0,
      heartRate: data.length >= 26 ? (data[22] > 0 ? data[22] : null) : null,
      spo2: data.length >= 26 ? (data[25] > 0 ? data[25] : null) : null,
    };
    if (data.length >= 26) {
      const tempRaw = data[23] | (data[24] << 8);
      metrics.temperature = tempRaw > 0 ? (tempRaw / 10).toFixed(1) : null;
    }
    if (this.onData) this.onData(metrics);
  }

  _parseBattery(data) {
    if (this.onData) this.onData({ battery: { level: data[1], charging: data[2] === 1 } });
  }

  logStatus(msg) {
    console.log(`[X3-BLE] ${msg}`);
    if (this.onStatus) this.onStatus(msg);
  }
}
