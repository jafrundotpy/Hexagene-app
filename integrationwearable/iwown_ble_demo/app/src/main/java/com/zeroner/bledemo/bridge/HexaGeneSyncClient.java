package com.zeroner.bledemo.bridge;

import android.content.Context;
import android.util.Log;

import com.zeroner.bledemo.utils.PrefUtil;

import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

/**
 * Production Sync Client: Periodically pushes live QRing data to the HexaGene Cloud Backend.
 * Replaces the legacy local-bridge NanoHTTPD architecture.
 */
public class HexaGeneSyncClient {

    private static final String TAG = "HexaGeneSync";
    private static final String CLOUD_URL = "https://hexagene-app.onrender.com/v2/ingest-wearable";
    private static final String INGEST_TOKEN = "hexagene-ingest-2026";
    private static final String PREF_SYNC_EMAIL = "hexagene_sync_email";

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final OkHttpClient client = new OkHttpClient();
    private final Context context;

    public HexaGeneSyncClient(Context context) {
        this.context = context;
    }

    public void start() {
        Log.i(TAG, "Starting Cloud Sync Client...");
        scheduler.scheduleAtFixedRate(this::syncTask, 10, 30, TimeUnit.SECONDS);
    }

    public void stop() {
        Log.i(TAG, "Stopping Cloud Sync Client...");
        scheduler.shutdown();
    }

    private void syncTask() {
        try {
            syncManual();
        } catch (Exception e) {
            Log.e(TAG, "Background sync failed: " + e.getMessage());
        }
    }

    public void syncManual() throws Exception {
        String email = PrefUtil.getString(context, PREF_SYNC_EMAIL);
        if (email == null || email.isEmpty()) {
            throw new Exception("No user email configured");
        }

        JSONObject cacheData = HexaGeneDataCache.getInstance().getAsJson();
        
        // Construct Ingest Request
        JSONObject payload = new JSONObject();
        payload.put("email", email);
        payload.put("ingest_token", INGEST_TOKEN);
        payload.put("source", "qring_connector_android");
        
        // Map keys from cache to backend schema
        payload.put("daily_steps", cacheData.optInt("steps"));
        payload.put("resting_heart_rate", cacheData.optInt("heartRate"));
        payload.put("hrv", cacheData.optInt("hrv"));
        payload.put("spo2", cacheData.optInt("spo2"));
        payload.put("stress_score", cacheData.optInt("stress"));
        payload.put("avg_sleep_hours", cacheData.optDouble("sleep", 0.0));
        payload.put("calories_burned", cacheData.optInt("calories"));
        payload.put("active_minutes", cacheData.optInt("activeMinutes"));
        payload.put("battery", cacheData.optInt("battery"));
        payload.put("device_id", PrefUtil.getString(context, com.zeroner.bledemo.utils.BaseActionUtils.ACTION_DEVICE_NAME));

        RequestBody body = RequestBody.create(
                payload.toString(),
                MediaType.get("application/json; charset=utf-8")
        );

        Request request = new Request.Builder()
                .url(CLOUD_URL)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (response.isSuccessful()) {
                Log.i(TAG, "✓ Successfully synced live data to HexaGene Cloud for: " + email);
            } else {
                throw new Exception("Sync failed: " + response.code() + " - " + response.message());
            }
        }
    }

    public static void setUserEmail(Context context, String email) {
        PrefUtil.save(context, PREF_SYNC_EMAIL, email);
    }
}
