/**
 * BridgeServer.js
 * Exposes a local HTTP API on the mobile device to share ring data with the web app.
 */

import HttpBridge from 'react-native-http-bridge-refurbished';

let serverRunning = false;
let ringData = {
  steps: 0,
  heartRate: 0,
  sleep: 0,
  hrv: 0,
  spo2: 0,
  battery: 0,
  lastSync: null
};

/**
 * Updates the internal data store with new values from the ring.
 * @param {Object} newData 
 */
export const updateRingData = (newData) => {
  ringData = { ...ringData, ...newData, lastSync: new Date().toISOString() };
};

/**
 * Starts the local API server.
 * @param {number} port 
 */
export const startServer = (port = 8080) => {
  if (serverRunning) return;

  HttpBridge.start(port, 'hexagene-bridge', (request) => {
    if (request.type === 'GET' && request.url === '/data') {
      HttpBridge.respond(request.requestId, 200, 'application/json', JSON.stringify(ringData));
    } else if (request.type === 'POST' && request.url === '/sync') {
      // Logic to trigger a sync could be implemented here via a callback
      HttpBridge.respond(request.requestId, 200, 'application/json', JSON.stringify({ status: 'sync_triggered' }));
    } else {
      HttpBridge.respond(request.requestId, 404, 'text/plain', 'Not Found');
    }
  });

  serverRunning = true;
  console.log(`Bridge server started on port ${port}`);
};

export const stopServer = () => {
  if (!serverRunning) return;
  HttpBridge.stop();
  serverRunning = false;
};
