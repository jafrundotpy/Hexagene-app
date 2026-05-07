package com.zeroner.bledemo.setting;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.KeyEvent;
import android.view.View;

import com.bigkoo.pickerview.OptionsPickerView;
import com.blankj.utilcode.util.ToastUtils;
import com.blankj.utilcode.util.VibrateUtils;
import com.zeroner.bledemo.DeviceInfoActivity;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.bean.sql.BraceletSetting;
import com.zeroner.bledemo.data.sync.ProtoBufSync;
import com.zeroner.bledemo.eventbus.SyncDataEvent;
import com.zeroner.bledemo.firmware.ProtoBufFirmwareUpdateActivity;
import com.zeroner.bledemo.firmware.jx.JXFirmwareUpgradeActivity;
import com.zeroner.bledemo.setting.alarm.AddClockActivity;
import com.zeroner.bledemo.setting.apn.ApnSettingActivity;
import com.zeroner.bledemo.setting.schedule.ScheduleActivity;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.OptionsPickerViewUtils;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.bledemo.utils.SqlBizUtils;
import com.zeroner.bledemo.utils.UI;
import com.zeroner.bledemo.view.LSettingItem;
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.bluetooth.model.ContactCmdBean;
import com.zeroner.blemidautumn.bluetooth.model.ProtoBufRealTimeData;
import com.zeroner.blemidautumn.bluetooth.model.WeatherEvent;
import com.zeroner.blemidautumn.bluetooth.proto.RealtimeData;
import com.zeroner.blemidautumn.task.BackgroundThreadManager;
import com.zeroner.blemidautumn.task.BleWriteDataTask;

import org.greenrobot.eventbus.EventBus;
import org.greenrobot.eventbus.Subscribe;
import org.greenrobot.eventbus.ThreadMode;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;




public class ProtoBufSettingActivity extends AppCompatActivity {

    Toolbar toolbar;
    LSettingItem item_alarm;
    LSettingItem item_calendar;
    LSettingItem item_time;
    LSettingItem item_motor;
    LSettingItem item_time_unit;
    LSettingItem item_date_unit;
    LSettingItem item_all_measure;
    LSettingItem item_data_upload_url;
    LSettingItem item_temp_unit;
    LSettingItem item_auto_sport;
    LSettingItem item_habit_hand;
    LSettingItem item_language;
    LSettingItem item_firmware_update;
    LSettingItem item_swim;
    LSettingItem item_sitDown;
    LSettingItem contactCmd;
    LSettingItem mRealData;
    LSettingItem mHistoryData;
    LSettingItem mSwitchSleep;
    LSettingItem itemWeather;

    private int alarmId = 0;

    private Context context;

    LSettingItem itemBPActivity;
    LSettingItem lSfindWatch;
    LSettingItem itemDeviceInfo;

    LSettingItem aqi;
    LSettingItem item_factory_test_result;
    LSettingItem itemApnSet;

    private void findByIdView() {
         toolbar = findViewById(R.id.toolbar);
         item_alarm = findViewById(R.id.item_alarm);
         item_calendar = findViewById(R.id.item_calendar);
         item_time = findViewById(R.id.item_time);
        item_motor = findViewById(R.id.item_motor);
        item_time_unit = findViewById(R.id.item_time_unit);
         item_date_unit = findViewById(R.id.item_date_unit);
         item_all_measure = findViewById(R.id.item_all_measure);
         item_data_upload_url = findViewById(R.id.item_data_upload_url);
         item_temp_unit = findViewById(R.id.item_temp_unit);
         item_auto_sport = findViewById(R.id.item_auto_sport);
         item_habit_hand = findViewById(R.id.item_habit_hand);
         item_language = findViewById(R.id.item_language);
         item_firmware_update = findViewById(R.id.item_firmware_update);
         item_swim = findViewById(R.id.item_swim);
         item_sitDown = findViewById(R.id.item_sitDown);
         contactCmd = findViewById(R.id.contact);
         mRealData = findViewById(R.id.real_ppg);
         mHistoryData = findViewById(R.id.item_history_data);
         mSwitchSleep = findViewById(R.id.switchSleep);
         itemWeather = findViewById(R.id.item_weather);

         itemBPActivity = findViewById(R.id.bp_file_update);
         lSfindWatch = findViewById(R.id.findWatch);
         itemDeviceInfo = findViewById(R.id.item_device_info);

         aqi = findViewById(R.id.aqi);
         item_factory_test_result = findViewById(R.id.factory_test_result);
        itemApnSet = findViewById(R.id.apnSetIt);
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_i7b_setting);
        findByIdView();
        context = this;

        setSupportActionBar(toolbar);
        getSupportActionBar().setHomeButtonEnabled(true);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        toolbar.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });


        initListener();


    }

    @Override
    protected void onStart() {
        super.onStart();
        EventBus.getDefault().register(this);
    }

    @Override
    protected void onStop() {
        super.onStop();
        EventBus.getDefault().unregister(this);
    }

    private void initListener() {

        item_alarm.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                UI.startActivity(ProtoBufSettingActivity.this,AddClockActivity.class);
            }
        });
        item_calendar.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                UI.startActivity((Activity) context,ScheduleActivity.class);
            }
        });

        item_time.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                byte[] bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(ProtoBufSettingActivity.this).setTime();
                BackgroundThreadManager.getInstance().addWriteData(ProtoBufSettingActivity.this,bytes);
                byte[] bytes1 = ProtoBufSendBluetoothCmdImpl.getInstance().setHealthVisible(0x1ff);
                BackgroundThreadManager.getInstance().addWriteData(ProtoBufSettingActivity.this,bytes1);
            }
        });

        aqi.setmOnLSettingItemClick(isChecked -> {
            OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getAqi(context), new OptionsPickerView.OnOptionsSelectListener() {

                @Override
                public void onOptionsSelect(int i, int i1, int i2, View view) {
                    byte[] aqi = ProtoBufSendBluetoothCmdImpl.getInstance().setAqi(OptionsPickerViewUtils.getAqiIndex(context)[i]);
                    BackgroundThreadManager.getInstance().addWriteData(context,aqi);
                }
            });
            option.show();
        });

        item_motor.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(ProtoBufSettingActivity.this, OptionsPickerViewUtils.getShakeName(ProtoBufSettingActivity.this), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        item_motor.setRightText(OptionsPickerViewUtils.getShakeName(ProtoBufSettingActivity.this).get(i));
                        PrefUtil.save(ProtoBufSettingActivity.this, BaseActionUtils.Action_Setting_Shake, OptionsPickerViewUtils.getShakeName(ProtoBufSettingActivity.this).get(i));
                        byte[] bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(context).setMotorVibrate(OptionsPickerViewUtils.getZGShakeModel(ProtoBufSettingActivity.this)[i],2);
                        BleWriteDataTask task = new BleWriteDataTask(getApplicationContext(), bytes);
                        BackgroundThreadManager.getInstance().addTask(task);
                    }

                });
                option.show();
            }
        });
        item_sitDown.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(ProtoBufSettingActivity.this, OptionsPickerViewUtils.getSitDown(ProtoBufSettingActivity.this), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        String s = OptionsPickerViewUtils.getSitDown(ProtoBufSettingActivity.this).get(i);
                        int duration  = Integer.parseInt(s);
                        item_sitDown.setRightText(duration  *  5 + "");
                        DateUtil dateUtil = new DateUtil();
                        byte[] clear = ProtoBufSendBluetoothCmdImpl.getInstance().clearSedentariness();
                        BackgroundThreadManager.getInstance().addWriteData(getApplicationContext(),clear);
                        byte[] bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(context).setSedentariness(true,0,0xff,0,23,duration,50);
                        BleWriteDataTask task = new BleWriteDataTask(getApplicationContext(), bytes);
                        BackgroundThreadManager.getInstance().addTask(task);
                    }

                });
                option.show();
            }
        });

        item_time_unit.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getTimeItemOptions(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        item_time_unit.setRightText(OptionsPickerViewUtils.getTimeItemOptions(context).get(i));
                        BraceletSetting bs1 = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Time_Format);
                        bs1.setKey(BaseActionUtils.Action_Setting_Time_Format);
                        bs1.setValue(i);
                        SqlBizUtils.saveBraceletSetting(bs1);
                        byte[] bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(context).setHourFormat(i == 1);
                        BackgroundThreadManager.getInstance().addWriteData(context,bytes);
                    }
                });
                option.show();
            }
        });

        item_date_unit.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getDateItemOptions(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        item_date_unit.setRightText(OptionsPickerViewUtils.getDateItemOptions(context).get(i));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Date_Format, OptionsPickerViewUtils.getDateItemOptions(context).get(i));
                        BraceletSetting setting = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Date_Format);
                        setting.setKey(BaseActionUtils.Action_Setting_Date_Format);
                        setting.setValue(i);
                        SqlBizUtils.saveBraceletSetting(setting);
                        byte[] bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(context).setDateFormat(i == 1);
                        BackgroundThreadManager.getInstance().addWriteData(context,bytes);
                    }
                });
                option.show();
            }
        });

        item_all_measure.setmOnLSettingItemClick(isChecked -> {
            UI.startActivity((Activity) context, MeasureHealthActivity.class);
        });

        item_data_upload_url.setmOnLSettingItemClick(isChecked -> {
            UI.startActivity((Activity) context, DataUploadUrlSettingActivity.class);
        });

        item_temp_unit.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getWeatherItemOptions(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        item_temp_unit.setRightText(OptionsPickerViewUtils.getWeatherItemOptions(context).get(i));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Weather_Unit, OptionsPickerViewUtils.getWeatherItemOptions(context).get(i));
                        BraceletSetting setting = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Weather_Unit);
                        setting.setKey(BaseActionUtils.Action_Setting_Weather_Unit);
                        setting.setValue(i);
                        SqlBizUtils.saveBraceletSetting(setting);
                        byte[] bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(context).setTemperatureUnit(i == 1);
                        BackgroundThreadManager.getInstance().addWriteData(context,bytes);
                    }
                });
                option.show();
            }
        });
        item_habit_hand.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getHandItemOptions(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        byte[] bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(context).setHabitualHand(i == 1);
                        BackgroundThreadManager.getInstance().addWriteData(context,bytes);
                    }
                });
                option.show();
            }
        });

        item_language.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getLanguage(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        SuperBleSDK.getSDKSendBluetoothCmdImpl(context).setLanguage(context,i);
                    }
                });
                option.show();
            }
        });

        item_auto_sport.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setAutoSport(true);
                BackgroundThreadManager.getInstance().addWriteData(context,bytes);
            }
        });

        item_firmware_update.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                if(BluetoothUtil.bleFota == 6){
                    //5515升级
                    UI.startActivity((Activity) context,ProtoBufFirmwareUpdateActivity .class);
                }else if(BluetoothUtil.bleFota == 7){
                    //炬芯升级
                    UI.startActivity((Activity) context, JXFirmwareUpgradeActivity.class);
                }else{
                    byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().getHardwareFeatures();
                    BackgroundThreadManager.getInstance().addWriteData(ProtoBufSettingActivity.this,bytes);
                }

            }
        });

        item_swim.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                ToastUtils.showShort("开始同步");
                ProtoBufSync.getInstance().syncData(ProtoBufSync.SWIM_DATA);
            }
        });
        mRealData.setmOnLSettingItemClick((isChecked)->{
            UI.startActivity(this,RealDataActivity.class);
        });
        mHistoryData.setmOnLSettingItemClick(isChecked -> {
            UI.startActivity(this, HistoryDataActivity.class);
        });
        item_factory_test_result.setmOnLSettingItemClick(isChecked -> {
            UI.startActivity(this, FactoryTestResultActivity.class);
        });
        itemApnSet.setmOnLSettingItemClick(isChecked -> {
            UI.startActivity(this, ApnSettingActivity.class);
        });


        contactCmd.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                List<ContactCmdBean> contacts = new ArrayList<>();
                ContactCmdBean bean = new ContactCmdBean();
                bean.setId(new Date().hashCode());
                bean.setName("彭工");
                bean.setPhone("15817362080");
                bean.setStatus(1);
                contacts.add(bean);
                byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().sendContactCmd(contacts);
                BackgroundThreadManager.getInstance().addWriteData(context,bytes);
            }
        });

        lSfindWatch.setmOnLSettingItemClick(isChecked -> {
            byte[] watch = ProtoBufSendBluetoothCmdImpl.getInstance().findWatch();
            BackgroundThreadManager.getInstance().addWriteData(context,watch);
        });

        mSwitchSleep.setmOnLSettingItemClick(isChecked -> {
            startActivity(new Intent(this,SwitchListActivity.class));
        });

        itemWeather.setmOnLSettingItemClick(isChecked -> {

            OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(ProtoBufSettingActivity.this, OptionsPickerViewUtils.getWeather(ProtoBufSettingActivity.this), new OptionsPickerView.OnOptionsSelectListener() {

                @Override
                public void onOptionsSelect(int i0, int i1, int i2, View view) {
                    String s = OptionsPickerViewUtils.getWeather(ProtoBufSettingActivity.this).get(i0);
                    int duration  = Integer.parseInt(s);
                    itemWeather.setRightText(duration + "");
                    List<WeatherEvent> weatherEventList = new ArrayList<>();
                    DateUtil dateUtil = new DateUtil();
                    DateUtil dateUtil1 = new DateUtil(dateUtil.getYear(),dateUtil.getMonth(),dateUtil.getDay(),dateUtil.getHour(),0,0);
                    int  unixTimestamp = (int) dateUtil1.getUnixTimestamp();

                    for (int i = 0;i< 1;i++) {
                        int timeMils = unixTimestamp + i * 3600;
                        WeatherEvent weatherEvent = new WeatherEvent();
                        weatherEvent.setDegreeMax(30 + i);
                        weatherEvent.setDegreeMin(20 + i);
                        weatherEvent.setPm2p5(0xff);
                        weatherEvent.setWeatherDesc(duration);
                        weatherEvent.setWeatherType(0);
                        weatherEvent.setTimeMills(timeMils);
                        weatherEventList.add(weatherEvent);
                    }
                    byte[] bytes1 = ProtoBufSendBluetoothCmdImpl.getInstance().clearWeather();
                    BackgroundThreadManager.getInstance().addWriteData(context,bytes1);
                    byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setWeather(weatherEventList);
                    BackgroundThreadManager.getInstance().addWriteData(context,bytes);
                }

            });
            option.show();


        });

        itemDeviceInfo.setmOnLSettingItemClick(isChecked->{
            UI.startActivity(this, DeviceInfoActivity.class);
        });

        itemBPActivity.setmOnLSettingItemClick(isChecked -> UI.startActivity((Activity) context, BPUpgradeActivity.class));

    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onEventMainThread(SyncDataEvent events){
        if (events.getProgress() > 0 && !events.isStop()){
            ToastUtils.showShort("同步:" + events.getProgress());
        }
        if(events.isStop()){
            ToastUtils.showShort("同步完成");
        }
    }

    @Subscribe(threadMode = ThreadMode.MAIN)
    public void onEventMainThread(ProtoBufRealTimeData data){
        boolean isKey = data.isKey();
        if(isKey) {
            int keyMode = data.getKeyMode();
            if (keyMode == RealtimeData.RtKeyEvent.RT_START_FIND_PHONE_VALUE) {
                VibrateUtils.vibrate(2000);
                ToastUtils.showLong("find phone!");
            } else if (keyMode == RealtimeData.RtKeyEvent.RT_STOP_FIND_DEVICE_VALUE) {
                ToastUtils.showLong("stop device!");
                VibrateUtils.vibrate(2000);
            }
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if(keyCode == KeyEvent.KEYCODE_BACK && ProtoBufSync.getInstance().isSync()){
            ToastUtils.showShort("正在同步中.");
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
