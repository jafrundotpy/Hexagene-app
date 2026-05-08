package com.zeroner.bledemo.fragment;

import android.os.Bundle;
import android.text.format.DateFormat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.zeroner.bledemo.MainActivity;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.bridge.HexaGeneDataCache;
import com.zeroner.bledemo.utils.BluetoothUtil;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;
import org.json.JSONObject;

import java.util.Date;

public class LiveMetricsFragment extends Fragment {

    private TextView tvStatus, tvBattery, tvLastSync;
    private View statusIndicator;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_live_metrics, container, false);
        
        tvStatus = view.findViewById(R.id.tv_connection_status);
        tvBattery = view.findViewById(R.id.tv_battery);
        tvLastSync = view.findViewById(R.id.tv_last_sync);
        statusIndicator = view.findViewById(R.id.status_indicator);

        view.findViewById(R.id.btn_sync_now).setOnClickListener(v -> {
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).navigateToExport();
            }
        });

        updateUI(HexaGeneDataCache.getInstance());
        return view;
    }

    @Override
    public void onStart() {
        super.onStart();
        EventBus.getDefault().register(this);
    }

    @Override
    public void onStop() {
        super.onStop();
        EventBus.getDefault().unregister(this);
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onDataUpdate(HexaGeneDataCache cache) {
        updateUI(cache);
    }

    private void updateUI(HexaGeneDataCache cache) {
        JSONObject data = cache.getAsJson();
        
        boolean connected = BluetoothUtil.isConnected();
        tvStatus.setText(connected ? "QRing Connected" : "QRing Disconnected");
        statusIndicator.setBackgroundTintList(android.content.res.ColorStateList.valueOf(
                getResources().getColor(connected ? R.color.status_connected : R.color.status_disconnected)));

        tvBattery.setText(data.optInt("battery") + "%");
        
        long lastUpdate = data.optLong("lastUpdate");
        if (lastUpdate > 0) {
            tvLastSync.setText("Last updated: " + DateFormat.format("HH:mm:ss", new Date(lastUpdate)));
        }

        updateCard(getView().findViewById(R.id.card_hr), "Heart Rate", data.optInt("heartRate"), "bpm", R.drawable.ic_heart);
        updateCard(getView().findViewById(R.id.card_spo2), "SpO2", data.optInt("spo2"), "%", R.drawable.ic_spo2);
        updateCard(getView().findViewById(R.id.card_hrv), "HRV", data.optInt("hrv"), "ms", R.drawable.ic_hrv);
        updateCard(getView().findViewById(R.id.card_stress), "Stress", data.optInt("stress"), "/100", R.drawable.ic_stress);
        updateCard(getView().findViewById(R.id.card_steps), "Steps", data.optInt("steps"), "steps", R.drawable.ic_steps);
        updateCard(getView().findViewById(R.id.card_sleep), "Sleep", data.optInt("sleep"), "hrs", R.drawable.ic_sleep);
    }

    private void updateCard(View card, String label, int value, String unit, int iconRes) {
        if (card == null) return;
        ((TextView) card.findViewById(R.id.metric_label)).setText(label);
        ((TextView) card.findViewById(R.id.metric_value)).setText(value > 0 ? String.valueOf(value) : "--");
        ((TextView) card.findViewById(R.id.metric_unit)).setText(unit);
        ((ImageView) card.findViewById(R.id.metric_icon)).setImageResource(iconRes);
    }
}
