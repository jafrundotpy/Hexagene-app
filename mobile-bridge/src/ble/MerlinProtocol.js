/**
 * MerlinProtocol.js
 * Implements the 16-byte custom protocol for the Merlin Smart Ring.
 */

export const SERVICE_UUID = 'FFF0';
export const TX_UUID = 'FFF6'; // App -> Ring
export const RX_UUID = 'FFF7'; // Ring -> App

export const COMMANDS = {
  SET_TIME: 0x01,
  GET_TIME: 0x41,
  SET_USER_INFO: 0x02,
  GET_USER_INFO: 0x42,
  SET_RING_ID: 0x05,
  READ_BATTERY: 0x13,
  READ_MAC: 0x22,
  READ_FIRMWARE: 0x27,
  RESTORE_FACTORY: 0x12,
  SOFT_RESET: 0x2E,
  REAL_TIME_MODE: 0x09,
  SET_AUTO_INTERVAL: 0x2A,
  GET_AUTO_INTERVAL: 0x2B,
  GET_TOTAL_STEPS: 0x51,
  GET_DETAILED_STEPS: 0x52,
  GET_SLEEP_DATA: 0x53,
  GET_HEART_RATE_HISTORY: 0x54,
  GET_HR_VALUES: 0x55,
  GET_HRV_DATA: 0x56,
  GET_TEMP_HISTORY: 0x62,
  GET_OXYGEN_HISTORY: 0x60,
  MULTI_MEASURE: 0x28,
  EXERCISE_CONTROL: 0x19,
  EXERCISE_DATA_PACKET: 0x18,
  GET_EXERCISE_DATA: 0x5C,
  READ_REALTIME_TEMP: 0x14,
  GET_SLEEP_TEMP: 0x69,
};

/**
 * Calculates the CRC for a 16-byte packet.
 * Formula: (Sum of B1 to B15) & 0xFF
 * @param {Uint8Array} bytes 16-byte array
 * @returns {number} The calculated CRC byte
 */
export const calculateCRC = (bytes) => {
  let sum = 0;
  for (let i = 0; i < 15; i++) {
    sum += bytes[i];
  }
  return sum & 0xFF;
};

/**
 * Creates a 16-byte packet for a given command and payload.
 * @param {number} command The command byte
 * @param {Array|Uint8Array} payload Up to 14 bytes of data
 * @returns {Uint8Array} The full 16-byte packet
 */
export const createPacket = (command, payload = []) => {
  const packet = new Uint8Array(16);
  packet[0] = command;
  
  for (let i = 0; i < 14; i++) {
    packet[i + 1] = payload[i] || 0x00;
  }
  
  packet[15] = calculateCRC(packet);
  return packet;
};

/**
 * Parses a 16-byte response packet.
 * @param {Uint8Array} packet The response from the ring
 * @returns {Object} Parsed data
 */
export const parsePacket = (packet) => {
  if (packet.length !== 16) return null;
  
  const command = packet[0];
  const payload = packet.slice(1, 15);
  const crc = packet[15];
  
  // Verify CRC
  if (crc !== calculateCRC(packet)) {
    console.error('CRC Mismatch in response');
    return null;
  }
  
  return { command, payload };
};

/**
 * Specific parser for Command 0x09 (Real-time data)
 */
export const parseRealTimePacket = (packet) => {
  const { command, payload } = parsePacket(packet) || {};
  if (command !== COMMANDS.REAL_TIME_MODE) return null;

  const steps = (payload[0] << 24) | (payload[1] << 16) | (payload[2] << 8) | payload[3];
  const calories = ((payload[4] << 24) | (payload[5] << 16) | (payload[6] << 8) | payload[7]) / 100;
  const distance = ((payload[8] << 24) | (payload[9] << 16) | (payload[10] << 8) | payload[11]) / 100;
  const heartRate = payload[12];
  const temperature = payload[13] + (payload[14] / 100);

  return { steps, calories, distance, heartRate, temperature };
};

/**
 * Specific parser for Command 0x51 (Total Steps)
 */
export const parseTotalStepsPacket = (packet) => {
  const { command, payload } = parsePacket(packet) || {};
  if (command !== COMMANDS.GET_TOTAL_STEPS) return null;

  // Documentation says year/month/day is in payload[0-2]
  const steps = (payload[3] << 24) | (payload[4] << 16) | (payload[5] << 8) | payload[6];
  return { steps };
};

/**
 * Helper to convert Uint8Array to Base64 (needed for some BLE libs)
 */
export const toBase64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};
