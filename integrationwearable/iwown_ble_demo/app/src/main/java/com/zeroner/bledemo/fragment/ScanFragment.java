package com.zeroner.bledemo.fragment;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.zeroner.bledemo.MainActivity;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.blemidautumn.bean.WristBand;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class ScanFragment extends Fragment {

    private RecyclerView rvDevices;
    private DeviceAdapter adapter;
    private List<WristBand> deviceList = new ArrayList<>();
    private HashSet<WristBand> deviceSet = new HashSet<>();
    private Handler handler = new Handler(Looper.getMainLooper());

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_scan, container, false);
        rvDevices = view.findViewById(R.id.rv_devices);
        view.findViewById(R.id.btn_rescan).setOnClickListener(v -> startScan());

        rvDevices.setLayoutManager(new LinearLayoutManager(getContext()));
        adapter = new DeviceAdapter();
        rvDevices.setAdapter(adapter);

        LocalBroadcastManager.getInstance(getContext()).registerReceiver(searchReceiver, BaseActionUtils.getIntentFilter());
        
        startScan();
        return view;
    }

    private void startScan() {
        deviceSet.clear();
        deviceList.clear();
        adapter.notifyDataSetChanged();
        BluetoothUtil.stopScan();
        BluetoothUtil.startScan();
    }

    private BroadcastReceiver searchReceiver = new BluetoothCallbackReceiver() {
        @Override
        public void onScanResult(WristBand device) {
            if (device != null && device.getName() != null) {
                deviceSet.add(device);
                deviceList.clear();
                deviceList.addAll(deviceSet);
                Collections.sort(deviceList);
                handler.post(() -> adapter.notifyDataSetChanged());
            }
        }
    };

    @Override
    public void onDestroyView() {
        super.onDestroyView();
        BluetoothUtil.stopScan();
        LocalBroadcastManager.getInstance(getContext()).unregisterReceiver(searchReceiver);
    }

    class DeviceAdapter extends RecyclerView.Adapter<DeviceAdapter.ViewHolder> {
        @NonNull
        @Override
        public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
            View view = LayoutInflater.from(parent.getContext()).inflate(R.layout.layout_device_list_item_view, parent, false);
            return new ViewHolder(view);
        }

        @Override
        public void onBindViewHolder(@NonNull ViewHolder holder, int position) {
            WristBand device = deviceList.get(position);
            holder.tvName.setText(device.getName());
            holder.tvMac.setText(device.getAddress());
            holder.itemView.setOnClickListener(v -> {
                BluetoothUtil.stopScan();
                BluetoothUtil.connect(device);
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).navigateToMetrics();
                }
            });
        }

        @Override
        public int getItemCount() {
            return deviceList.size();
        }

        class ViewHolder extends RecyclerView.ViewHolder {
            TextView tvName, tvMac;
            ViewHolder(View view) {
                super(view);
                tvName = view.findViewById(R.id.item_device_name);
                tvMac = view.findViewById(R.id.item_device_mac);
            }
        }
    }
}
