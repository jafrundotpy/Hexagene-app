package com.zeroner.bledemo;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.view.View;
import android.widget.Button;

import com.zeroner.bledemo.eventbus.Event;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.blemidautumn.Constants;
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK;

import org.greenrobot.eventbus.EventBus;





public class SwitchSdkTypeActivity extends AppCompatActivity implements View.OnClickListener {

    Button mWristSdk;
    Button mZgWristSdk;
    Button mSportWatchSdk;


    private void findByIdView() {
         mWristSdk = findViewById(R.id.wrist_sdk);
         mZgWristSdk = findViewById(R.id.zg_wrist_sdk);
         mSportWatchSdk = findViewById(R.id.sport_watch_sdk);
         findViewById(R.id.wrist_sdk).setOnClickListener(this);
         findViewById(R.id.zg_wrist_sdk).setOnClickListener(this);
         findViewById(R.id.sport_watch_sdk).setOnClickListener(this);
         findViewById(R.id.i7B_sdk).setOnClickListener(this);
         findViewById(R.id.voice).setOnClickListener(this);
         findViewById(R.id.btn_jl).setOnClickListener(this);

    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_launch);
        findByIdView();
    }


    @Override
    public void onClick(View view) {
        BluetoothUtil.disconnect();
        int id = view.getId();
        if (id == R.id.wrist_sdk) {
            SuperBleSDK.switchSDKTYpe(this.getApplicationContext(), Constants.Bluetooth.Zeroner_Ble_Sdk);
            BleApplication.getInstance().getmService().setSDKType(this.getApplicationContext(), Constants.Bluetooth.Zeroner_Ble_Sdk);
        } else if (id == R.id.zg_wrist_sdk) {
            SuperBleSDK.switchSDKTYpe(this.getApplicationContext(), Constants.Bluetooth.Zeroner_Zg_Sdk);
            BleApplication.getInstance().getmService().setSDKType(this.getApplicationContext(), Constants.Bluetooth.Zeroner_Zg_Sdk);
        } else if (id == R.id.sport_watch_sdk) {
            SuperBleSDK.switchSDKTYpe(this.getApplicationContext(), Constants.Bluetooth.Zeroner_Mtk_Sdk);
            BleApplication.getInstance().getmService().setSDKType(this.getApplicationContext(), Constants.Bluetooth.Zeroner_Mtk_Sdk);
        } else if (id == R.id.i7B_sdk) {
            SuperBleSDK.switchSDKTYpe(this.getApplicationContext(), Constants.Bluetooth.Zeroner_protobuf_Sdk);
            BleApplication.getInstance().getmService().setSDKType(this.getApplicationContext(), Constants.Bluetooth.Zeroner_protobuf_Sdk);
        } else if (id == R.id.voice) {
            SuperBleSDK.switchSDKTYpe(this.getApplicationContext(), Constants.Bluetooth.ZERONER_PROTOBUF_VOICE_SDK);
            BleApplication.getInstance().getmService().setSDKType(this.getApplicationContext(), Constants.Bluetooth.ZERONER_PROTOBUF_VOICE_SDK);
        } else if (id == R.id.btn_jl) {
            SuperBleSDK.switchSDKTYpe(this.getApplicationContext(), Constants.Bluetooth.ZERONER_JL_SDK);
            BleApplication.getInstance().getmService().setSDKType(this.getApplicationContext(), Constants.Bluetooth.ZERONER_JL_SDK);
        }

        PrefUtil.save(this, BaseActionUtils.ACTION_DEVICE_NAME, "");
        PrefUtil.save(this, BaseActionUtils.ACTION_DEVICE_ADDRESS, "");
        PrefUtil.save(this, BaseActionUtils.Action_device_Model, "");
        PrefUtil.save(this, BaseActionUtils.Action_device_version, "");
        PrefUtil.save(this, BaseActionUtils.HAS_SELECT_SDK_FIRST, true);
        EventBus.getDefault().post(Event.Ble_Connect_Statue);
        finish();
    }
}
