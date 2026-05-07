package com.zeroner.bledemo.bridge;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Thread-safe cache to store the latest BLE metrics from the Merlin Ring.
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

    private HexaGeneDataCache() {}

    public static HexaGeneDataCache getInstance() {
        return INSTANCE;
    }

    public void updateHeartRate(int hr) { heartRate.set(hr); }
    public void updateSteps(int s) { steps.set(s); }
    public void updateSleep(int hours) { sleep.set(hours); }
    public void updateSpo2(int s) { spo2.set(s); }
    public void updateHrv(int h) { hrv.set(h); }
    public void updateStress(int s) { stress.set(s); }
    public void updateCalories(int cal) { calories.set(cal); }
    public void updateActiveMinutes(int min) { activeMinutes.set(min); }
    public void updateBattery(int level) { battery.set(level); }

    public JSONObject getAsJson() {
        JSONObject obj = new JSONObject();
        try {
            // Provide data mapped to HexaGene's frontend expectations (as defined in Simulations.jsx)
            obj.put("heartRate", heartRate.get());
            obj.put("steps", steps.get());
            obj.put("sleep", sleep.get());
            obj.put("spo2", spo2.get());
            obj.put("hrv", hrv.get());
            obj.put("stress", stress.get());
            obj.put("calories", calories.get());
            obj.put("activeMinutes", activeMinutes.get());
            obj.put("battery", battery.get());
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return obj;
    }
}
