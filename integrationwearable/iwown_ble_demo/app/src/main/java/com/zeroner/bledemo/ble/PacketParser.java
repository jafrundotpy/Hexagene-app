package com.zeroner.bledemo.ble;

import android.util.Log;
import com.zeroner.bledemo.bridge.HexaGeneDataCache;

/**
 * Modular parser for incoming wearable data packets.
 */
public class PacketParser {
    private static final String TAG = "PacketParser";

    public static void parse(byte[] data) {
        if (data == null || data.length == 0) return;

        // Log raw data in HEX for debugging as requested
        StringBuilder sb = new StringBuilder();
        for (byte b : data) {
            sb.append(String.format("%02X ", b));
        }
        Log.d(TAG, "BLE_DATA_RAW: " + sb.toString());

        // Protocol Detection
        if (data.length == 16) {
            parse16ByteProtocol(data);
        } else if (data.length == 31) {
            parse31ByteRealtime(data);
        } else {
            // Handle other variable length packets (could be different vendor)
            Log.d(TAG, "BLE_DATA_UNKNOWN_LEN: " + data.length);
        }
    }

    private static void parse16ByteProtocol(byte[] data) {
        byte cmd = data[0];
        HexaGeneDataCache cache = HexaGeneDataCache.getInstance();

        switch (cmd & 0xFF) {
            case 0x13: // Battery
                int level = data[1] & 0xFF;
                cache.updateBattery(level);
                Log.i(TAG, "BLE_DATA_BATTERY: " + level + "%");
                break;
            case 0x09: // Real-time response
                // Often handles heart rate if the stream was started via 0x09
                int hr = data[22] & 0xFF;
                if (hr > 30 && hr < 220) cache.updateHeartRate(hr);
                break;
            // Add more cases based on protocol spec
        }
    }

    private static void parse31ByteRealtime(byte[] data) {
        // Based on X6 documentation for 0x09 streaming
        int steps = ((data[1] & 0xFF) | ((data[2] & 0xFF) << 8) | ((data[3] & 0xFF) << 16) | ((data[4] & 0xFF) << 24));
        int hr = data[22] & 0xFF;
        int spo2 = data[25] & 0xFF;

        HexaGeneDataCache cache = HexaGeneDataCache.getInstance();
        cache.updateSteps(steps);
        if (hr > 30 && hr < 220) cache.updateHeartRate(hr);
        if (spo2 > 50) cache.updateSpo2(spo2);

        Log.i(TAG, String.format("BLE_DATA_LIVE: HR=%d, SpO2=%d, Steps=%d", hr, spo2, steps));
    }
}
