package com.zeroner.bledemo.setting;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.widget.Button;
import android.widget.Switch;

import com.zeroner.bledemo.R;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.task.BackgroundThreadManager;

public class SwitchListActivity extends AppCompatActivity {

    private boolean isCheckedSleep;
    private boolean isCheckedAf;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_switch_list);

        Button bt_sleep = findViewById(R.id.bt_sleep);
        Button bt_af = findViewById(R.id.bt_af);
        Switch switchAf = findViewById(R.id.switchAf);
        Switch switchSleep = findViewById(R.id.switchSleep);

        switchAf.setOnCheckedChangeListener((buttonView, isChecked) -> {
            isCheckedAf = isChecked;
        });

        switchSleep.setOnCheckedChangeListener((buttonView, isChecked) -> {
            isCheckedSleep = isChecked;
        });

        bt_af.setOnClickListener(v->{
            byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setAfConf(isCheckedAf,0);
            BackgroundThreadManager.getInstance().addWriteData(this,bytes);
        });
        bt_sleep.setOnClickListener(v->{
            byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setHealthSleep(isCheckedSleep);
            BackgroundThreadManager.getInstance().addWriteData(this,bytes);
        });

    }
}
