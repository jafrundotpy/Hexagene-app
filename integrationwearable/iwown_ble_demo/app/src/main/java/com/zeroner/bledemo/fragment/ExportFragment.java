package com.zeroner.bledemo.fragment;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.zeroner.bledemo.R;
import com.zeroner.bledemo.bridge.HexaGeneSyncClient;

public class ExportFragment extends Fragment {

    private static final String DASHBOARD_URL = "https://hexagene-app.vercel.app/dashboard/simulations";

    private Button btnExport, btnOpenDashboard;
    private ProgressBar pbExporting;
    private ImageView ivCloud, ivSuccess;
    private TextView tvTitle, tvDesc, tvSuccessMsg;
    private HexaGeneSyncClient syncClient;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_export, container, false);
        
        btnExport = view.findViewById(R.id.btn_export);
        btnOpenDashboard = view.findViewById(R.id.btn_open_dashboard);
        pbExporting = view.findViewById(R.id.pb_exporting);
        ivCloud = view.findViewById(R.id.iv_cloud);
        ivSuccess = view.findViewById(R.id.iv_success_anim);
        tvTitle = view.findViewById(R.id.tv_export_title);
        tvDesc = view.findViewById(R.id.tv_export_desc);
        tvSuccessMsg = view.findViewById(R.id.tv_success_msg);

        syncClient = new HexaGeneSyncClient(getContext());

        btnExport.setOnClickListener(v -> startExport());

        // Open HexaGene dashboard in browser after successful sync
        btnOpenDashboard.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(DASHBOARD_URL));
            startActivity(intent);
        });

        return view;
    }

    private void startExport() {
        btnExport.setEnabled(false);
        btnExport.setVisibility(View.GONE);
        ivCloud.setVisibility(View.GONE);
        pbExporting.setVisibility(View.VISIBLE);
        tvTitle.setText("Exporting Data...");
        tvDesc.setText("Securely transmitting your biometrics to HexaGene Cloud.");

        new Thread(() -> {
            try {
                syncClient.syncManual();
                new Handler(Looper.getMainLooper()).post(this::showSuccess);
            } catch (Exception e) {
                new Handler(Looper.getMainLooper()).post(() -> {
                    Toast.makeText(getContext(), "Export failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
                    resetUI();
                });
            }
        }).start();
    }

    private void showSuccess() {
        pbExporting.setVisibility(View.GONE);
        ivSuccess.setVisibility(View.VISIBLE);
        tvSuccessMsg.setVisibility(View.VISIBLE);
        tvTitle.setText("Sync Complete!");
        tvDesc.setText("Your health metrics are now available on the HexaGene dashboard.");
        btnOpenDashboard.setVisibility(View.VISIBLE);
    }

    private void resetUI() {
        pbExporting.setVisibility(View.GONE);
        btnExport.setVisibility(View.VISIBLE);
        btnExport.setEnabled(true);
        ivCloud.setVisibility(View.VISIBLE);
        tvTitle.setText("Ready to Export");
        tvDesc.setText("Your QRing biometrics are synced locally. Click below to update your HexaGene Dashboard.");
    }
}
