package com.zeroner.bledemo;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentTransaction;

import com.zeroner.bledemo.bridge.HexaGeneSyncClient;
import com.zeroner.bledemo.fragment.ExportFragment;
import com.zeroner.bledemo.fragment.LiveMetricsFragment;
import com.zeroner.bledemo.fragment.ScanFragment;
import com.zeroner.bledemo.fragment.WelcomeFragment;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.bledemo.utils.PrefUtil;

public class MainActivity extends AppCompatActivity {

    private static final String PREF_SYNC_EMAIL = "hexagene_sync_email";

    private HexaGeneSyncClient syncClient;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar()
.setTitle("HexaGene Connector");
        }

        syncClient = new HexaGeneSyncClient(this);
        syncClient.start();

        // Smart cold-start routing:
        // 1. Already connected → go straight to live metrics
        // 2. Email already saved (returning user) → skip Welcome, go to BLE scan
        // 3. First-time user → show Welcome (email entry)
        if (BluetoothUtil.isConnected()) {
            navigateToMetrics();
        } else {
            String savedEmail = PrefUtil.getString(this, PREF_SYNC_EMAIL);
            if (savedEmail != null && !savedEmail.isEmpty()) {
                navigateToScan();
            } else {
                navigateToWelcome();
            }
        }
    }

    public void navigateToWelcome() {
        replaceFragment(new WelcomeFragment());
    }

    public void navigateToScan() {
        replaceFragment(new ScanFragment());
    }

    public void navigateToMetrics() {
        replaceFragment(new LiveMetricsFragment());
    }

    public void navigateToExport() {
        replaceFragment(new ExportFragment());
    }

    private void replaceFragment(Fragment fragment) {
        FragmentTransaction transaction = getSupportFragmentManager().beginTransaction();
        transaction.setCustomAnimations(android.R.anim.fade_in, android.R.anim.fade_out);
        transaction.replace(R.id.main_frame_layout, fragment);
        transaction.commit();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (syncClient != null) {
            syncClient.stop();
        }
    }
}
