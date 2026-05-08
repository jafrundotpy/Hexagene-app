package com.zeroner.bledemo.bridge;

import org.greenrobot.eventbus.EventBus;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Thread-safe cache to store the latest BLE metrics from the Merlin Ring.
 * Posts an event to EventBus on every update to notify UI fragments.
 */
public class HexaGeneDataCache {

    private static final HexaGeneDataCache INSTANCE = new HexaGeneDataCache();

    private final AtomicInteger heartRate = new AtomicInteger(0);
    private final AtomicInteger steps = new AtomicInteger(0);
    private final AtomicInteger sleep = new AtomicInteger(0);
    private final AtomicInteger spo2 = new AtomicInteger(0);
    private final AtomicInteger hrv = new AtomicInteger(0);
    private final AtomicInteger stress = new AtomicInteger(0);
    private final AtomicInteger calories = new AtomicInteger(0);
    private final AtomicInteger activeMinutes = new AtomicInteger(0);
    private final AtomicInteger battery = new AtomicInteger(0);
    private final AtomicLong lastUpdateTime = new AtomicLong(0);

    private HexaGeneDataCache() {}

    public static HexaGeneDataCache getInstance() {
        return INSTANCE;
    }

    private void notifyUpdate() {
        lastUpdateTime.set(System.currentTimeMillis());
        EventBus.getDefault().post(this);
    }

    public void updateHeartRate(int hr) { heartRate.set(hr); notifyUpdate(); }
    public void updateSteps(int s) { steps.set(s); notifyUpdate(); }
    public void updateSleep(int hours) { sleep.set(hours); notifyUpdate(); }
    public void updateSpo2(int s) { spo2.set(s); notifyUpdate(); }
    public void updateHrv(int h) { hrv.set(h); notifyUpdate(); }
    public void updateStress(int s) { stress.set(s); notifyUpdate(); }
    public void updateCalories(int cal) { calories.set(cal); notifyUpdate(); }
    public void updateActiveMinutes(int min) { activeMinutes.set(min); notifyUpdate(); }
    public void updateBattery(int level) { battery.set(level); notifyUpdate(); }

    public long getLastUpdateTime() {
        return lastUpdateTime.get();
    }

    public JSONObject getAsJson() {
        JSONObject obj = new JSONObject();
        try {
            obj.put("heartRate", heartRate.get());
            obj.put("steps", steps.get());
            obj.put("sleep", sleep.get());
            obj.put("spo2", spo2.get());
            obj.put("hrv", hrv.get());
            obj.put("stress", stress.get());
            obj.put("calories", calories.get());
            obj.put("activeMinutes", activeMinutes.get());
            obj.put("battery", battery.get());
            obj.put("lastUpdate", lastUpdateTime.get());
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return obj;
    }
}
