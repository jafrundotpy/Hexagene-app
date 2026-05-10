package com.zeroner.bledemo.ble;

import java.util.UUID;

/**
 * Centralized UUID constants for HexaGene Wearable Connection.
 */
public class UUIDConstants {

    // MAIN SERVICE UUIDS
    public static final UUID SERVICE_PRIMARY   = UUID.fromString("00001530-0000-1000-8000-00805f9b34fb");
    public static final UUID SERVICE_SECONDARY = UUID.fromString("0000fe59-0000-1000-8000-00805f9b34fb");
    public static final UUID SERVICE_LEGACY    = UUID.fromString("0000fff0-0000-1000-8000-00805f9b34fb");

    // CHARACTERISTIC UUIDS
    public static final UUID CHAR_CMD_WRITE    = UUID.fromString("8082caa8-41a6-4021-91c6-56f9b954cc34");
    public static final UUID CHAR_DATA_NOTIFY  = UUID.fromString("724249f0-5ec3-4b5f-8804-42345af08651");
    public static final UUID CHAR_STATUS       = UUID.fromString("6c53db25-47a1-45fe-a022-7c92fb334fd4");
    public static final UUID CHAR_CONFIG       = UUID.fromString("9d84b9a3-000c-49d8-9183-855b673fda31");
    public static final UUID CHAR_BATTERY      = UUID.fromString("457871e8-d516-4ca1-9116-57d0b17b9cb2");
    public static final UUID CHAR_EXTENDED     = UUID.fromString("5f78df94-798c-46f5-990a-b3eb6a065c88");

    // LEGACY (0xFFF0)
    public static final UUID CHAR_LEGACY_TX    = UUID.fromString("0000fff6-0000-1000-8000-00805f9b34fb");
    public static final UUID CHAR_LEGACY_RX    = UUID.fromString("0000fff7-0000-1000-8000-00805f9b34fb");

    // DFU / UART / OTA UUIDs
    public static final UUID SERVICE_DFU       = UUID.fromString("8E400001-F315-4F60-9FB8-838830DAEA50");
    
    // STANDARD CCCD
    public static final UUID CCCD_DESCRIPTOR   = UUID.fromString("00002902-0000-1000-8000-00805f9b34fb");

    public static UUID CHAR_LEGACY_TX() { return CHAR_LEGACY_TX; }
    public static UUID CHAR_LEGACY_RX() { return CHAR_LEGACY_RX; }

    public static boolean isSupportedService(UUID uuid) {
        return uuid.equals(SERVICE_PRIMARY) || uuid.equals(SERVICE_SECONDARY) || uuid.equals(SERVICE_LEGACY);
    }
}
