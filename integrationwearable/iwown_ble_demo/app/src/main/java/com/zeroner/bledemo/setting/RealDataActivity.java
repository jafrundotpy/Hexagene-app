package com.zeroner.bledemo.setting;

import android.content.Context;
import android.os.Bundle;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.appcompat.widget.Toolbar;

import android.os.CountDownTimer;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.CompoundButton;
import android.widget.TextView;
import android.widget.Toast;

import com.blankj.utilcode.util.LogUtils;
import com.blankj.utilcode.util.Utils;
import com.chad.library.adapter.base.BaseMultiItemQuickAdapter;
import com.chad.library.adapter.base.BaseQuickAdapter;
import com.chad.library.adapter.base.BaseViewHolder;
import com.jieli_ble.bean.JLParseDataType;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver;
import com.zeroner.bledemo.utils.BleReceiverHelper;
import com.zeroner.bledemo.utils.DataTransferStats;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.FileIOUtils;
import com.zeroner.blemidautumn.Constants;
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.MtkSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl;
import com.jieli_ble.cmd.ZP100Assembler;
import com.zeroner.blemidautumn.bluetooth.model.MtkRealDataInfo;
import com.zeroner.blemidautumn.bluetooth.model.ProtoBufRealTimeData;
import com.zeroner.blemidautumn.bluetooth.model.ZP100RealtimeData;
import com.zeroner.blemidautumn.bluetooth.proto.RealtimeData;
import com.zeroner.blemidautumn.task.BackgroundThreadManager;
import com.zeroner.blemidautumn.utils.JsonTool;
import com.zeroner.blemidautumn.utils.Util;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.locks.ReadWriteLock;
import java.util.concurrent.locks.ReentrantReadWriteLock;




import static com.zeroner.bledemo.BuildConfig.ROOT_PATH;

/**
 * @author yx
 * @date 2020/4/30
 */
public class RealDataActivity extends AppCompatActivity implements CompoundButton.OnCheckedChangeListener, View.OnClickListener {

    Toolbar toolbar;
    CheckBox cb_ecg;
    CheckBox cb_ppg;
    CheckBox cb_mag;
    CheckBox cb_gyro;
    CheckBox cb_aac;
    CheckBox cb_bp;
    CheckBox cb_bp_result;
    CheckBox cb_bioz;
    CheckBox cb_ecg_detect;
    CheckBox cb_factory_ecg;
    CheckBox cb_factory_bioz;
    CheckBox cb_hr_leak;
    CheckBox cb_bp_leak;
    CheckBox cb_spo2;
    CheckBox cb_gps;
    CheckBox cb_oaq;
    CheckBox cb_iaq;
    CheckBox cb_humiture;
    CheckBox cb_air_pressure;
    CheckBox cb_heart_rate;
    CheckBox cb_sport;
    Button start;
    Button pause;
    Button stop;
    RecyclerView recycler_view;
    CheckBox save_data;
    CheckBox cbTemp;
    CheckBox twoEcg;
    CheckBox sixEcg;
    TextView tvTransferRate;
    TextView tvPacketErrorRate;
    TextView tvDelayAvg;
    TextView tvJitter;

    /**
     * 发送类型指令 SensorType
     */
    private int cmdType = 0;
    /**
     * 发送类型指令 RtMode
     */
    private int modeType = 0;
    //运动类型
    private int sportType = 0;
    private static final int START = 0;
    private static final int PAULE = 1;
    private static final int STOP = 2;

    private static final int MTK_START = 1;
    private static final int MTK_PAULE = 2;
    private static final int MTK_STOP = 0;

    private List<String> stringList;
    private MyAdapter adapter;
    private static final int ALL_COUNT = Integer.MAX_VALUE;

    private MyDataReceive receive;

    private boolean isSaveFile = false;
    private ThreadPoolExecutor executor;
    private ReadWriteLock readWriteLock;
    private DateUtil dateUtil;
    private StringBuffer zp100StringBuffer = new StringBuffer();

    /** 数据传输统计工具类 */
    private DataTransferStats mDataStats = new DataTransferStats();

    /** 传输计时器 */
    private final CountDownTimer mTimer = new CountDownTimer(Long.MAX_VALUE, 1000) {
        @Override
        public void onTick(long millisUntilFinished) {
            mDataStats.incrementTime();
            tvTransferRate.setText(getString(R.string.transfer_rate, mDataStats.getTransferRate()));
            tvPacketErrorRate.setText(getString(R.string.packet_error_rate, mDataStats.getPacketErrorRate()));
            tvDelayAvg.setText(getString(R.string.delay_avg, mDataStats.getAverageDelay()));
            tvJitter.setText(getString(R.string.jitter, mDataStats.getAverageJitter()));
        }

        @Override
        public void onFinish() {
        }
    };

    private void findByIdView() {
         toolbar = findViewById(R.id.toolbar);
         cb_ecg = findViewById(R.id.cb_ecg);
         cb_ppg = findViewById(R.id.cb_ppg);
         cb_mag = findViewById(R.id.cb_mag);
         cb_gyro = findViewById(R.id.cb_gyro);
         cb_aac = findViewById(R.id.cb_aac);
         cb_bp = findViewById(R.id.cb_bp);
         cb_bp_result = findViewById(R.id.cb_bp_result);
         cb_bioz = findViewById(R.id.cb_bioz);
         cb_ecg_detect = findViewById(R.id.cb_ecg_detect);
         cb_factory_ecg = findViewById(R.id.cb_factory_ecg);
         cb_factory_bioz = findViewById(R.id.cb_factory_bioz);
         cb_hr_leak = findViewById(R.id.cb_hr_leak);
         cb_bp_leak = findViewById(R.id.cb_bp_leak);
         cb_spo2 = findViewById(R.id.cb_spo2);
         cb_gps = findViewById(R.id.cb_gps);
         cb_oaq = findViewById(R.id.cb_oaq);
         cb_iaq = findViewById(R.id.cb_iaq);
         cb_humiture = findViewById(R.id.cb_humiture);
         cb_air_pressure = findViewById(R.id.cb_air_pressure);
         cb_heart_rate = findViewById(R.id.cb_heart_rate);
         cb_sport = findViewById(R.id.cb_sport);
         start = findViewById(R.id.start);
         pause = findViewById(R.id.pause);
         stop = findViewById(R.id.stop);
         recycler_view = findViewById(R.id.recycler_view);
         save_data = findViewById(R.id.save_data);
         cbTemp = findViewById(R.id.cb_temp);
         twoEcg = findViewById(R.id.cb_two_ecg);
         sixEcg = findViewById(R.id.cb_six_ecg);
         tvTransferRate = findViewById(R.id.tv_transfer_rate);
         tvPacketErrorRate = findViewById(R.id.tv_error_rate);
         tvDelayAvg = findViewById(R.id.tv_delay_avg);
         tvJitter = findViewById(R.id.tv_jitter);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_real_data);
        findByIdView();

        receive = new MyDataReceive();
        dateUtil = new DateUtil();

        BleReceiverHelper.registerBleReceiver(this, receive);

        initToolBar();

        initListener();

        initRecyclerView();

        executor = new ThreadPoolExecutor(2,5,0, TimeUnit.SECONDS, new LinkedBlockingDeque<>(1000));
        readWriteLock = new ReentrantReadWriteLock();
    }

    private void initRecyclerView() {
        stringList = new ArrayList<>();
        adapter = new MyAdapter(stringList);
        LinearLayoutManager manager = new LinearLayoutManager(this);
        manager.setOrientation(LinearLayoutManager.VERTICAL);
        recycler_view.setLayoutManager(manager);
        recycler_view.setAdapter(adapter);
        adapter.openLoadAnimation(BaseMultiItemQuickAdapter.ALPHAIN);
    }

    private void refreshData(String data){
        stringList.add(data);
        if(stringList.size() > ALL_COUNT){
            stringList.remove(0);
            adapter.notifyItemRemoved(0);
        }
        adapter.notifyItemInserted(stringList.size() - 1);
        recycler_view.smoothScrollToPosition(stringList.size() - 1);
    }

    private void initListener(){
        cb_ecg.setOnCheckedChangeListener(this);
        cb_ppg.setOnCheckedChangeListener(this);
        cb_mag.setOnCheckedChangeListener(this);
        cb_gyro.setOnCheckedChangeListener(this);
        cb_aac.setOnCheckedChangeListener(this);
        cb_bp.setOnCheckedChangeListener(this);
        cb_bp_result.setOnCheckedChangeListener(this);
        cbTemp.setOnCheckedChangeListener(this);
        save_data.setOnCheckedChangeListener(this);
        sixEcg.setOnCheckedChangeListener(this);
        twoEcg.setOnCheckedChangeListener(this);
        cb_bioz.setOnCheckedChangeListener(this);
        cb_ecg_detect.setOnCheckedChangeListener(this);
        cb_factory_ecg.setOnCheckedChangeListener(this);
        cb_factory_bioz.setOnCheckedChangeListener(this);
        cb_hr_leak.setOnCheckedChangeListener(this);
        cb_bp_leak.setOnCheckedChangeListener(this);
        cb_spo2.setOnCheckedChangeListener(this);
        cb_gps.setOnCheckedChangeListener(this);
        cb_oaq.setOnCheckedChangeListener(this);
        cb_iaq.setOnCheckedChangeListener(this);
        cb_humiture.setOnCheckedChangeListener(this);
        cb_air_pressure.setOnCheckedChangeListener(this);
        cb_heart_rate.setOnCheckedChangeListener(this);
        cb_sport.setOnCheckedChangeListener(this);
        start.setOnClickListener(this);
        pause.setOnClickListener(this);
        stop.setOnClickListener(this);
    }


    private void initToolBar() {
        setSupportActionBar(toolbar);
        assert getSupportActionBar() != null;
        getSupportActionBar().setHomeButtonEnabled(true);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        toolbar.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mTimer.onFinish();
        BleReceiverHelper.unregisterBleReceiver(this, receive);
        receive = null;
    }

    @Override
    public void onCheckedChanged(CompoundButton buttonView, boolean isChecked) {
        int id = buttonView.getId();
        if(id == R.id.save_data){
            isSaveFile = isChecked;
            return;
        }
        if (SuperBleSDK.isMtk(this)) {
            if (isChecked) {
                if (id == R.id.cb_ecg) {
                    cmdType |= 1;
                } else if (id == R.id.cb_ppg) {
                    cmdType |= 1 << 1;
                } else if (id == R.id.cb_mag) {
                    cmdType |= 1 << 2;
                } else if (id == R.id.cb_gyro) {
                    cmdType |= 1 << 3;
                } else if (id == R.id.cb_aac) {
                    cmdType |= 1 << 4;
                } else if (id == R.id.cb_bp) {
                    cmdType |= 1 << 5;
                } else if (id == R.id.cb_bp_result) {
                    cmdType |= 1 << 6;
                } else if (id == R.id.cb_gps) {
                    cmdType |= 1 << 7;
                }
            } else {
                if (id == R.id.cb_ecg) {
                    cmdType ^= 1;
                } else if (id == R.id.cb_ppg) {
                    cmdType ^= 1 << 1;
                } else if (id == R.id.cb_mag) {
                    cmdType ^= 1 << 2;
                } else if (id == R.id.cb_gyro) {
                    cmdType ^= 1 << 3;
                } else if (id == R.id.cb_aac) {
                    cmdType ^= 1 << 4;
                } else if (id == R.id.cb_bp) {
                    cmdType ^= 1 << 5;
                } else if (id == R.id.cb_bp_result) {
                    cmdType ^= 1 << 6;
                } else if (id == R.id.cb_gps) {
                    cmdType ^= 1 << 7;
                }
            }
            return;
        }

        if(isChecked) {
            if (id == R.id.cb_ecg) {
                cmdType |= RealtimeData.SensorType.ECG_VALUE;
            } else if (id == R.id.cb_ppg) {
                cmdType |= RealtimeData.SensorType.PPG_VALUE;
            } else if (id == R.id.cb_mag) {
                cmdType |= RealtimeData.SensorType.MAG_VALUE;
            } else if (id == R.id.cb_gyro) {
                cmdType |= RealtimeData.SensorType.GYRO_VALUE;
            } else if (id == R.id.cb_aac) {
                cmdType |= RealtimeData.SensorType.ACC_VALUE;
            }else if (id == R.id.cb_bp) {
                cmdType |= RealtimeData.SensorType.BP_VALUE;
            }else if (id == R.id.cb_bp_result) {
                cmdType |= RealtimeData.SensorType.BPRESULT_VALUE;
            }else if(id == R.id.cb_temp){
                cmdType |= RealtimeData.SensorType.TEMPERATURE_VALUE;
            }else if(id == R.id.cb_two_ecg || id == R.id.cb_six_ecg){
                cmdType |= RealtimeData.SensorType.TWO_ECG_VALUE;
            } else if (id == R.id.cb_bioz) {
                cmdType |= RealtimeData.SensorType.BIOZ_VALUE;
            } else if (id == R.id.cb_ecg_detect) {
                cmdType |= RealtimeData.SensorType.ECG_DETECT_VALUE;
            } else if (id == R.id.cb_factory_ecg) {
                cmdType |= RealtimeData.SensorType.FACTORY_ECG_VALUE;
            } else if (id == R.id.cb_factory_bioz) {
                cmdType |= RealtimeData.SensorType.FACTORY_BIOZ_VALUE;
            } else if (id == R.id.cb_hr_leak) {
                cmdType |= RealtimeData.SensorType.HR_LEAK_VALUE;
            } else if (id == R.id.cb_bp_leak) {
                cmdType |= RealtimeData.SensorType.BP_LEAK_VALUE;
            } else if (id == R.id.cb_spo2) {
                cmdType |= RealtimeData.SensorType.SPO2_VALUE;
            } else if (id == R.id.cb_oaq) {
                cmdType |= RealtimeData.SensorType.OAQ_VALUE;
            } else if (id == R.id.cb_iaq) {
                cmdType |= RealtimeData.SensorType.IAQ_VALUE;
            } else if (id == R.id.cb_humiture) {
                cmdType |= RealtimeData.SensorType.HUMITURE_VALUE;
            } else if (id == R.id.cb_air_pressure) {
                cmdType |= RealtimeData.SensorType.AIR_PRESSURE_VALUE;
            } else if (id == R.id.cb_heart_rate) {
                modeType = RealtimeData.RtMode.RT_MODE_HR_MEASURE_VALUE;
            } else if (id == R.id.cb_sport) {
                sportType = 1;
            }
        }else{
            if (id == R.id.cb_ecg) {
                cmdType ^= RealtimeData.SensorType.ECG_VALUE;
            } else if (id == R.id.cb_ppg) {
                cmdType ^= RealtimeData.SensorType.PPG_VALUE;
            } else if (id == R.id.cb_mag) {
                cmdType ^= RealtimeData.SensorType.MAG_VALUE;
            } else if (id == R.id.cb_gyro) {
                cmdType ^= RealtimeData.SensorType.GYRO_VALUE;
            } else if (id == R.id.cb_aac) {
                cmdType ^= RealtimeData.SensorType.ACC_VALUE;
            }else if (id == R.id.cb_bp) {
                cmdType ^= RealtimeData.SensorType.BP_VALUE;
            }else if (id == R.id.cb_bp_result) {
                cmdType ^= RealtimeData.SensorType.BPRESULT_VALUE;
            }else if(id == R.id.cb_temp){
                cmdType ^= RealtimeData.SensorType.TEMPERATURE_VALUE;
            }else if(id == R.id.cb_two_ecg || id == R.id.cb_six_ecg){
                cmdType ^= RealtimeData.SensorType.TWO_ECG_VALUE;
            } else if (id == R.id.cb_bioz) {
                cmdType ^= RealtimeData.SensorType.BIOZ_VALUE;
            } else if (id == R.id.cb_ecg_detect) {
                cmdType ^= RealtimeData.SensorType.ECG_DETECT_VALUE;
            } else if (id == R.id.cb_factory_ecg) {
                cmdType ^= RealtimeData.SensorType.FACTORY_ECG_VALUE;
            } else if (id == R.id.cb_factory_bioz) {
                cmdType ^= RealtimeData.SensorType.FACTORY_BIOZ_VALUE;
            } else if (id == R.id.cb_hr_leak) {
                cmdType ^= RealtimeData.SensorType.HR_LEAK_VALUE;
            } else if (id == R.id.cb_bp_leak) {
                cmdType ^= RealtimeData.SensorType.BP_LEAK_VALUE;
            } else if (id == R.id.cb_spo2) {
                cmdType ^= RealtimeData.SensorType.SPO2_VALUE;
            } else if (id == R.id.cb_oaq) {
                cmdType ^= RealtimeData.SensorType.OAQ_VALUE;
            } else if (id == R.id.cb_iaq) {
                cmdType ^= RealtimeData.SensorType.IAQ_VALUE;
            } else if (id == R.id.cb_humiture) {
                cmdType ^= RealtimeData.SensorType.HUMITURE_VALUE;
            } else if (id == R.id.cb_air_pressure) {
                cmdType ^= RealtimeData.SensorType.AIR_PRESSURE_VALUE;
            } else if (id == R.id.cb_heart_rate) {
                modeType = RealtimeData.RtMode.RT_MODE_BACK_NORMAL_VALUE;
            }else if(id == R.id.cb_sport){
                sportType = 0;
            }
        }
    }

    @Override
    public void onClick(View v) {
        int id = v.getId();
        if(cmdType == 0 && modeType == 0 && sportType == 0){
            Toast.makeText(this,"请选择一个类型!",Toast.LENGTH_SHORT).show();
            return;
        }
        if(SuperBleSDK.isProtoBuf(this)) {
            if (id == R.id.start) {
                if(sportType!=0){
                    //马拉松开启
                    byte[] sportStart = ProtoBufSendBluetoothCmdImpl.getInstance().setMarathonStatusType(START);
                    BackgroundThreadManager.getInstance().addWriteData(Utils.getApp(), sportStart);
                    dateUtil.setTimestamp(new Date().getTime());
                    return;
                }

                if (modeType == RealtimeData.RtMode.RT_MODE_HR_MEASURE_VALUE) {
                    SuperBleSDK.getSDKSendBluetoothCmdImpl(this).measureHeartRate(Utils.getApp());
                    return;
                }
                transferInit();
                byte[] rtSensorData = ProtoBufSendBluetoothCmdImpl.getInstance().getRtSensorData(START, cmdType);
                BackgroundThreadManager.getInstance().addWriteData(Utils.getApp(), rtSensorData);
                dateUtil.setTimestamp(new Date().getTime());
            } else if (id == R.id.pause) {
                if(sportType!=0){
                    //马拉松暂定
                    Toast.makeText(this,"暂不支持暂停功能",Toast.LENGTH_SHORT).show();
                    return;
                }

                //ecg暂定按钮最好不好用
                mTimer.cancel();
                byte[] rtSensorData = ProtoBufSendBluetoothCmdImpl.getInstance().getRtSensorData(PAULE, cmdType);
                BackgroundThreadManager.getInstance().addWriteData(Utils.getApp(), rtSensorData);
            } else if (id == R.id.stop) {
                if(sportType!=0){
                    //马拉松停止
                    byte[] sportStop = ProtoBufSendBluetoothCmdImpl.getInstance().setMarathonStatusType(STOP);
                    BackgroundThreadManager.getInstance().addWriteData(Utils.getApp(), sportStop);
                    return;
                }
                if (modeType != 0) {
                    SuperBleSDK.getSDKSendBluetoothCmdImpl(this).stopMeasurement(Utils.getApp());
                    return;
                }
                mTimer.cancel();
                byte[] rtSensorData = ProtoBufSendBluetoothCmdImpl.getInstance().getRtSensorData(STOP, cmdType);
                BackgroundThreadManager.getInstance().addWriteData(Utils.getApp(), rtSensorData);
            }
        }else if(SuperBleSDK.isMtk(this)){
            if (id == R.id.start) {
                transferInit();
                byte[] rtSensorData = MtkSendBluetoothCmdImpl.getInstance(this).getRtSensorData(MTK_START, cmdType);
                BackgroundThreadManager.getInstance().addWriteData(Utils.getApp(), rtSensorData);
                dateUtil.setTimestamp(new Date().getTime());
            } else if (id == R.id.pause) {
                mTimer.cancel();
                byte[] rtSensorData = MtkSendBluetoothCmdImpl.getInstance(this).getRtSensorData(MTK_PAULE, cmdType);
                BackgroundThreadManager.getInstance().addWriteData(Utils.getApp(), rtSensorData);
            } else if (id == R.id.stop) {
                mTimer.cancel();
                byte[] rtSensorData = MtkSendBluetoothCmdImpl.getInstance(this).getRtSensorData(MTK_STOP, cmdType);
                BackgroundThreadManager.getInstance().addWriteData(Utils.getApp(), rtSensorData);
            }
        } else if (SuperBleSDK.isJL(this)) {
            if (id == R.id.start) {
                if (cb_bp.isChecked()) {
                    // ZP100测试用
                    ZP100Assembler.getInstance().getRtSensorData();
                    dateUtil.setTimestamp(new Date().getTime());
                    mDataStats.reset();
                    zp100StringBuffer = new StringBuffer();
                }
            } else if (id == R.id.stop) {
                if (cb_bp.isChecked()) {
                    ZP100Assembler.getInstance().stopRtSensor();
                }
            }
        }
    }


    public static class MyAdapter extends BaseQuickAdapter<String, BaseViewHolder>{


        public MyAdapter(@Nullable List<String> data) {
            super(R.layout.adapter_real_data_rv_item,data);
        }



        @Override
        protected void convert(BaseViewHolder helper, String item) {
            helper.setText(R.id.text,item);
        }
    }

    private class MyDataReceive extends BluetoothCallbackReceiver {
        @Override
        public void onDataArrived(Context context, int ble_sdk_type, int dataType, String data) {
            super.onDataArrived(context, ble_sdk_type, dataType, data);
            try {
                if(ble_sdk_type == Constants.Bluetooth.Zeroner_protobuf_Sdk) {
                    if (dataType == 0x70) {
                        ProtoBufRealTimeData realTimeData = JsonTool.fromJson(data, ProtoBufRealTimeData.class);
                        LogUtils.d("接搜到实时数据：：："+data);
                        if(realTimeData.getDataType() == RealtimeData.RtNotification.DataCase.RT_SPORT_DATA.getNumber()){
                            //实时运动数据(马拉松)
                            int reHeart = realTimeData.getSportData().getHeart();
                            int stepFrequency = realTimeData.getSportData().getStepFrequency();
                            float reCalorie = realTimeData.getSportData().getCalories();
                            int reStep = realTimeData.getSportData().getSteps();
//                            String msg = new DateUtil().getY_M_D_H_M_S() +" && heart: "+reHeart +" && stepFre: "+stepFrequency;
                            String msg = new DateUtil().getY_M_D_H_M_S() +realTimeData.getSportData().toString();
                            refreshData(msg);

                        }else if (realTimeData.isSensorData()) {
                            mDataStats.recordSeq(realTimeData.getSensorSeq());
                            mDataStats.recordSensorSeconds(realTimeData.getSensorSeconds());
                            mDataStats.incrementPacketCount();
                            String s = realTimeData.toStringSensor();
                            refreshData(s);
                            if (isSaveFile) {
                                saveToFile(realTimeData);
                            }
                        }
                    } else if (dataType == 0x2a37 && sportType==0) {
                        // 0未佩戴、0xFF检测中、1已佩戴、其他为正常心率值
                        switch (data) {
                            case "0":
                                refreshData("未佩戴");
                                break;
                            case "255":
                                refreshData("检测中");
                                break;
                            default:
                                refreshData(data);
                                break;
                        }
                    }
                }else if(ble_sdk_type == Constants.Bluetooth.Zeroner_Mtk_Sdk){
                    if(dataType == 0x44) {
                        MtkRealDataInfo realTimeData = JsonTool.fromJson(data, MtkRealDataInfo.class);
                        mDataStats.recordSeq(realTimeData.getSeq());
                        mDataStats.incrementPacketCount();
                        String s = realTimeData.toString();
                        refreshData(s);
                        if (isSaveFile) {
                            saveToMtkFile(realTimeData);
                        }
                    } else if (dataType == 0x2a37) {
                        // 0未佩戴、0xFF检测中、1已佩戴、其他为正常心率值
                        switch (data) {
                            case "0":
                                refreshData("未佩戴");
                                break;
                            case "255":
                                refreshData("检测中");
                                break;
                            default:
                                refreshData(data);
                                break;
                        }
                    }
                } else if (ble_sdk_type == Constants.Bluetooth.ZERONER_JL_SDK) {
                    if (dataType == JLParseDataType.ZP100_RT_DATA) {
                        ZP100RealtimeData realtimeData = JsonTool.fromJson(data, ZP100RealtimeData.class);
                        if (realtimeData.getDataList() != null) {
                            String json = JsonTool.toJson(realtimeData.getDataList());
                            refreshData(json);
                            if (isSaveFile) {
                                saveToJLFile(dataType, realtimeData);
                            }
                        }
                    } else if (dataType == JLParseDataType.ZP100_RT_RESULT) {
                        if (isSaveFile) {
                            saveToJLFile(dataType, new ZP100RealtimeData());
                        }
                    }
                }
            }catch (Exception e){

            }

        }

        @Override
        public void onCmdReceiver(byte[] data) {
            super.onCmdReceiver(data);
            if (data != null && data.length != 0) {
                // 监听传输速率
                mDataStats.addTransferData(data.length);
            }
        }
    }



    private void saveToFile(final ProtoBufRealTimeData realTimeData){
        executor.execute(new Runnable() {
            @Override
            public void run() {
                int[] sensorDataList = realTimeData.getSensorDataList();
                readWriteLock.writeLock().lock();
                DateUtil dateUtil1 = new DateUtil(realTimeData.getSensorSeconds(),true);
                String txt = dateUtil1.getYyyyMMdd_HHmmssDate() + ":" + realTimeData.getSensorSeq() + "," + JsonTool.toJson(sensorDataList) ;
                Util.write2SDFromString(ROOT_PATH + "/realData/",getType(realTimeData.getSensorType()) + "---" + dateUtil.getY_M_D_H_M_S() + ".txt",txt,true);
                readWriteLock.writeLock().unlock();
            }
        });

    }
    private void saveToMtkFile(final MtkRealDataInfo realTimeData){
        executor.execute(new Runnable() {
            @Override
            public void run() {
                int[] sensorDataList = realTimeData.getSensorRawData();
                readWriteLock.writeLock().lock();
                DateUtil dateUtil1 = new DateUtil(realTimeData.getYear(),realTimeData.getMonth(),
                        realTimeData.getDay(),realTimeData.getHour(),
                        realTimeData.getMin(),realTimeData.getSecond());
                if (realTimeData.getSensorType() == 128) {
                    // GPS数据
                    String txt = realTimeData.getSensorRawDataString()[0];
                    if (!txt.isEmpty()) {
                        Util.write2SDFromString(ROOT_PATH + "/realData/mtk/", getType(realTimeData.getSensorType()) + "---" + dateUtil.getY_M_D_H_M_S() + ".txt", txt, true, false);
                    }
                } else {
                    for (int i : sensorDataList) {
                        String txt = dateUtil1.getYyyyMMdd_HHmmssDate() + ":" + realTimeData.getSeq() + "," + i;
                        Util.write2SDFromString(ROOT_PATH + "/realData/mtk/", getType(realTimeData.getSensorType()) + "---" + dateUtil.getY_M_D_H_M_S() + ".txt", txt, true);
                    }
                }
                readWriteLock.writeLock().unlock();
            }
        });

    }

    private void saveToJLFile(int dataType, ZP100RealtimeData realtimeData) {
        executor.execute(new Runnable() {
            @Override
            public void run() {
                readWriteLock.writeLock().lock();
                if (dataType == JLParseDataType.ZP100_RT_DATA) {
                    ArrayList<ZP100RealtimeData.Data> list = realtimeData.getDataList();
                    if (list != null) {
                        for (int i = 0; i < list.size(); i++) {
                            ZP100RealtimeData.Data data = list.get(i);
                            zp100StringBuffer.append(mDataStats.getPacketCount());
                            zp100StringBuffer.append(",");
                            zp100StringBuffer.append(data.getBp1());
                            zp100StringBuffer.append("\n");
                            mDataStats.incrementPacketCount();
                        }
                    }

                } else if (dataType == JLParseDataType.ZP100_RT_RESULT) {
                    StringBuffer sb = new StringBuffer();
                    // 首行添加header
                    sb.append("序号");
                    sb.append(",");
                    sb.append("原始数据");
                    sb.append(",");
                    sb.append("");
                    sb.append(",");
                    sb.append("0");
                    sb.append(",");
                    sb.append(mDataStats.getPacketCount() - 1);
                    sb.append(",");
                    sb.append("");
                    sb.append(",");
                    sb.append("");
                    sb.append("\n");

                    sb.append("");
                    sb.append(",");
                    sb.append("");
                    sb.append(",");
                    sb.append("5");
                    sb.append(",");
                    sb.append("0");
                    sb.append(",");
                    sb.append("500");
                    sb.append(",");
                    sb.append("5000");
                    sb.append(",");
                    sb.append("500");
                    sb.append("\n");

                    sb.append(zp100StringBuffer);

//                    Util.write2SDFromString(ROOT_PATH + "/realData/",getType(dataType) + "---" + dateUtil.getY_M_D_H_M_S() + ".csv",sb.toString(),true);
                    // csv格式文本写excel文件
                    FileIOUtils.writeExcel2SDFromCsvString(ROOT_PATH + "/realData/", getType(dataType) + "---" + dateUtil.getY_M_D_H_M_S(), sb.toString());
                }
                readWriteLock.writeLock().unlock();
            }
        });
    }

    /**
     * @param type
     *     NONE = 0;
     *     ECG = 0x00000001;
     *     PPG = 0x00000002;
     *     MAG = 0x00000004;
     *     GYRO = 0x00000008;
     *     ACC = 0x00000010;
     *     BP = 0x00000020;
     *     BPRESULT = 0x00000040;
     *     TEMPERATURE = 0x00000080;
     *     TWO_ECG = 0x00000100;
     *     BIOZ = 0x00000200;
     *     ECG_DETECT = 0x00000400;
     *     FACTORY_ECG = 0x00000800;
     *     FACTORY_BIOZ = 0x00001000;
     *     HR_LEAK = 0x00002000;
     *     BP_LEAK = 0x00004000;
     *     SPO2 = 0x00008000;
     *     OAQ = 0x00010000;
     *     IAQ = 0x00020000;
     *     HUMITURE = 0x00040000;
     *     ULTRASONIC = 0x00080000;
     *     AIR_PRESSURE = 0x00100000;
     */
    private String getType(int type){
        switch (type){
            case 0x00000001:
                return "ECG";
            case 0x00000002:
                return "PPG";
            case 0x00000004:
                return "MAG";
            case 0x00000008:
                return "GYRO";
            case 0x00000010:
                return "ACC";
            case 0x00000020:
                return "BP";
            case 0x00000040:
                return "BPRESULT";
            case 0x00000080:
                return "TEMPERATURE";
            case 0x00000100:
                return "TWO_ECG";
            case 0x00000200:
                return "BIOZ";
            case 0x00000400:
                return "ECG_DETECT";
            case 0x00000800:
                return "FACTORY_ECG";
            case 0x00001000:
                return "FACTORY_BIOZ";
            case 0x00002000:
                return "HR_LEAK";
            case 0x00004000:
                return "BP_LEAK";
            case 0x00008000:
                return "SPO2";
            case 0x00010000:
                return "OAQ";
            case 0x00020000:
                return "IAQ";
            case 0x00040000:
                return "HUMITURE";
            case 0x00080000:
                return "ULTRASONIC";
            case 0x00100000:
                return "AIR_PRESSURE";
            case 0x000000CB:
            case 0x000000CC:
                return "ZP100";
            case 0:
            default:
                return "null";

        }
    }

    /**
     * 传输初始化
     */
    private void transferInit() {
        mDataStats.reset();
        mTimer.start();
    }

}
