package com.zeroner.bledemo.ble;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Clean Modular BLE Architecture for HexaGene Wearable.
 * Handles robust connection, service discovery, and notification management.
 */
public class BLEManager {
    private static final String TAG = "BLE_CONNECT";
    
    private static final BLEManager INSTANCE = new BLEManager();
    private Context context;
    private BluetoothGatt gatt;
    private boolean isConnected = false;
    private String lastDeviceAddress;
    private Handler mainHandler = new Handler(Looper.getMainLooper());

    private BluetoothGattCharacteristic writeChar;
    private final List<BluetoothGattCharacteristic> notifyChars = new ArrayList<>();

    public static BLEManager getInstance() {
        return INSTANCE;
    }

    public void init(Context context) {
        this.context = context.getApplicationContext();
    }

    public boolean isConnected() {
        return isConnected;
    }

    public void connect(String address) {
        if (address == null || address.isEmpty()) {
            Log.e(TAG, "BLE_CONNECT: Invalid address");
            return;
        }
        
        lastDeviceAddress = address;
        BluetoothAdapter adapter = BluetoothAdapter.getDefaultAdapter();
        if (adapter == null || !adapter.isEnabled()) {
            Log.e(TAG, "BLE_CONNECT: Bluetooth adapter not ready");
            return;
        }

        BluetoothDevice device = adapter.getRemoteDevice(address);
        Log.i(TAG, "BLE_CONNECT: Initiating connection to " + address);
        
        // Auto-reconnect enabled (true)
        gatt = device.connectGatt(context, false, gattCallback);
    }

    public void disconnect() {
        if (gatt != null) {
            Log.i(TAG, "BLE_CONNECT: Disconnecting...");
            gatt.disconnect();
            gatt.close();
            gatt = null;
        }
        isConnected = false;
        notifyChars.clear();
        writeChar = null;
    }

    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            if (status != BluetoothGatt.GATT_SUCCESS) {
                Log.e(TAG, "BLE_CONNECT: Error status " + status + ". Disconnecting.");
                disconnect();
                return;
            }

            if (newState == BluetoothProfile.STATE_CONNECTED) {
                Log.i(TAG, "BLE_CONNECT: Connected. Discovering services...");
                isConnected = true;
                gatt.discoverServices();
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                Log.i(TAG, "BLE_CONNECT: Disconnected.");
                isConnected = false;
                disconnect();
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            if (status != BluetoothGatt.GATT_SUCCESS) {
                Log.e(TAG, "BLE_SERVICE: Discovery failed with status " + status);
                return;
            }

            Log.i(TAG, "BLE_SERVICE: Discovery success. Mapping UUIDs...");
            notifyChars.clear();

            for (BluetoothGattService service : gatt.getServices()) {
                Log.d(TAG, "BLE_SERVICE_FOUND: " + service.getUuid().toString());
                
                for (BluetoothGattCharacteristic characteristic : service.getCharacteristics()) {
                    UUID uuid = characteristic.getUuid();
                    Log.d(TAG, "  └─ BLE_CHAR_FOUND: " + uuid.toString());

                    // Match Write Characteristic
                    if (uuid.equals(UUIDConstants.CHAR_CMD_WRITE) || uuid.equals(UUIDConstants.CHAR_LEGACY_TX())) {
                        writeChar = characteristic;
                        Log.i(TAG, "BLE_NOTIFY: Identified Write channel: " + uuid);
                    }

                    // Match Notification Channels
                    if (isNotifyCharacteristic(uuid)) {
                        notifyChars.add(characteristic);
                        setupNotification(gatt, characteristic);
                    }
                }
            }

            if (notifyChars.isEmpty()) {
                Log.w(TAG, "BLE_SERVICE: No supported notification channels found. Trying fallback...");
                // Fallback: Look for the first notify-capable characteristic in any FFF0 or 1530 service
                searchFallbackService(gatt);
            } else {
                Log.i(TAG, "BLE_SERVICE: Configured " + notifyChars.size() + " notification channels.");
                startInitializationSequence();
            }
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            byte[] data = characteristic.getValue();
            PacketParser.parse(data);
        }

        @Override
        public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor, int status) {
            Log.d(TAG, "BLE_NOTIFY: Descriptor write status: " + status);
        }
    };

    private boolean isNotifyCharacteristic(UUID uuid) {
        return uuid.equals(UUIDConstants.CHAR_DATA_NOTIFY) || 
               uuid.equals(UUIDConstants.CHAR_STATUS) || 
               uuid.equals(UUIDConstants.CHAR_BATTERY) ||
               uuid.equals(UUIDConstants.CHAR_LEGACY_RX());
    }

    private void setupNotification(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
        gatt.setCharacteristicNotification(characteristic, true);
        BluetoothGattDescriptor descriptor = characteristic.getDescriptor(UUIDConstants.CCCD_DESCRIPTOR);
        if (descriptor != null) {
            descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
            gatt.writeDescriptor(descriptor);
            Log.i(TAG, "BLE_NOTIFY: Subscribed to " + characteristic.getUuid());
        }
    }

    private void searchFallbackService(BluetoothGatt gatt) {
        for (BluetoothGattService service : gatt.getServices()) {
            for (BluetoothGattCharacteristic c : service.getCharacteristics()) {
                int props = c.getProperties();
                if ((props & BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0) {
                    Log.i(TAG, "BLE_SERVICE_FALLBACK: Found notify char: " + c.getUuid());
                    setupNotification(gatt, c);
                    notifyChars.add(c);
                    // Also try to find a write char in same service
                    if (writeChar == null && (props & BluetoothGattCharacteristic.PROPERTY_WRITE) != 0) {
                        writeChar = c;
                    }
                }
            }
        }
    }

    private void startInitializationSequence() {
        mainHandler.postDelayed(() -> {
            // Trigger Battery Read
            writeCommand(new byte[]{0x13, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x13});
            // Trigger Realtime Mode
            writeCommand(new byte[]{0x09, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0x0B});
        }, 1000);
    }

    public void writeCommand(byte[] data) {
        if (gatt != null && writeChar != null && data != null) {
            writeChar.setValue(data);
            boolean success = gatt.writeCharacteristic(writeChar);
            Log.d(TAG, "BLE_WRITE: Status=" + success + " CMD=" + String.format("%02X", data[0]));
        }
    }
}
