package com.zeroner.bledemo.setting;

import android.content.Context;
import android.os.Bundle;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.util.Log;
import android.util.SparseIntArray;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.bigkoo.pickerview.OptionsPickerView;
import com.blankj.utilcode.util.Utils;
import com.google.gson.Gson;
import com.zeroner.bledemo.DeviceInfoActivity;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.SportWatchFirmwareUpgradeActivity;
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.OptionsPickerViewUtils;
import com.zeroner.bledemo.utils.UI;
import com.zeroner.bledemo.view.LSettingItem;
import com.zeroner.bledemo.view.LoadingDialog;
import com.zeroner.blemidautumn.Constants;
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.BaseSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.MtkSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.bluetooth.model.Day7WeatherInfo;
import com.zeroner.blemidautumn.bluetooth.model.FMdeviceInfo;
import com.zeroner.blemidautumn.bluetooth.model.Hour24WeatherInfo;
import com.zeroner.blemidautumn.bluetooth.model.IWDevSetting;
import com.zeroner.blemidautumn.bluetooth.model.MtkWeatherEvent;
import com.zeroner.blemidautumn.bluetooth.model.ScheduleResult;
import com.zeroner.blemidautumn.library.KLog;
import com.zeroner.blemidautumn.task.BackgroundThreadManager;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.HashMap;
import java.util.List;
import java.util.Map;




import static com.zeroner.bledemo.utils.BluetoothUtil.context;

public class SportWatchSettingActivity extends AppCompatActivity {

    Toolbar mToolbarDeviceSetting;

    LSettingItem mItemTime;
    LSettingItem mItemDate;
    LSettingItem mItemUnit;
    LSettingItem mItemWeather;
    LSettingItem mItemGesture;
    LSettingItem mItemGestureTime;
    LSettingItem mItemHand;
    LSettingItem mItemLanguage;
    LSettingItem mItemFirmwareUpdate;
    LinearLayout mContainer;

    LoadingDialog mDialog = null;
    TextView mFimewareInfo;
    LSettingItem mAutoHr;
    LSettingItem mSmartTrack;
    LSettingItem mAutoSleep;
    TextView mBaseSettingTitle;
    TextView mMoreFunc;
    LSettingItem mItemPushMessage;
    LSettingItem mItemPushCallMessage;
    LSettingItem mItemShake;
    LSettingItem mSetItemShake;
    LSettingItem mNoDisturbAllDay;
    LSettingItem mNoDisturbWhenSleep;
    LSettingItem mNoDisturbAsTimeSegment;
    LSettingItem mGetDisturbSettingInfo;
    TextView mNoDisturbInfo;
    LSettingItem mClearNoDisturbSettings;
    LSettingItem mWriteAlarm;
    LSettingItem mCloseAlarm;
    LSettingItem mGetAlarmInfo;
    TextView mAlarmInfo;
    LSettingItem mWriteSchedule;
    LSettingItem mCloseSchedule;
    LSettingItem mClearAllSchedule;
    TextView mScheduleInfo;
    LSettingItem mGetScheduleSupportInfo;
    LSettingItem mSetSedentary;
    LSettingItem mGetSedentaryInfo;
    TextView mSedentaryInfo;
    LSettingItem mWriteUserInfo;
    LSettingItem mSelfie;
    TextView mKeyModelText;
    LSettingItem m24Weather;
    LSettingItem mRealData;
    LSettingItem mHistoryData;
    LSettingItem itemDeviceInfo;
    LSettingItem itemWriteEpo;
    private IWDevSetting mDevSetting;
    private Calendar mCalendar;


    private void findByIdView() {
         mToolbarDeviceSetting = findViewById(R.id.toolbar_device_setting);
         mItemTime = findViewById(R.id.item_time);
         mItemDate = findViewById(R.id.item_date);
         mItemUnit = findViewById(R.id.item_unit);
         mItemWeather = findViewById(R.id.item_weather);
         mItemGesture = findViewById(R.id.item_gesture);
         mItemGestureTime = findViewById(R.id.item_gesture_time);
         mItemHand = findViewById(R.id.item_hand);
         mItemLanguage = findViewById(R.id.item_language);
         mItemFirmwareUpdate = findViewById(R.id.item_firmware_update);
         mContainer = findViewById(R.id.container);

         mFimewareInfo = findViewById(R.id.fimeware_info);
         mAutoHr = findViewById(R.id.auto_hr);
         mSmartTrack = findViewById(R.id.smart_track);
         mAutoSleep = findViewById(R.id.auto_sleep);
         mBaseSettingTitle = findViewById(R.id.base_setting_title);
         mMoreFunc = findViewById(R.id.more_func);
         mItemPushMessage = findViewById(R.id.item_push_message);
         mItemPushCallMessage = findViewById(R.id.item_push_call_message);
         mItemShake = findViewById(R.id.item_shake);
         mSetItemShake = findViewById(R.id.set_item_shake);
         mNoDisturbAllDay = findViewById(R.id.no_disturb_all_day);
         mNoDisturbWhenSleep = findViewById(R.id.no_disturb_when_sleep);
         mNoDisturbAsTimeSegment = findViewById(R.id.no_disturb_as_time_segment);
         mGetDisturbSettingInfo = findViewById(R.id.get_disturb_setting_info);
         mNoDisturbInfo = findViewById(R.id.no_disturb_info);
         mClearNoDisturbSettings = findViewById(R.id.clear_no_disturb_settings);
         mWriteAlarm = findViewById(R.id.write_alarm);
         mCloseAlarm = findViewById(R.id.close_alarm);
         mGetAlarmInfo = findViewById(R.id.get_alarm_info);
         mAlarmInfo = findViewById(R.id.alarm_info);
         mWriteSchedule = findViewById(R.id.write_schedule);
         mCloseSchedule = findViewById(R.id.close_schedule);
         mClearAllSchedule = findViewById(R.id.clear_all_schedule);
         mScheduleInfo = findViewById(R.id.schedule_info);
         mGetScheduleSupportInfo = findViewById(R.id.get_schedule_support_info);
         mSetSedentary = findViewById(R.id.set_sedentary);
         mGetSedentaryInfo = findViewById(R.id.get_sedentary_info);
         mSedentaryInfo = findViewById(R.id.sedentary_info);
         mWriteUserInfo = findViewById(R.id.write_user_info);
         mSelfie = findViewById(R.id.selfie);
         mKeyModelText = findViewById(R.id.key_model_text);
         m24Weather = findViewById(R.id.item_24_weather);
         mRealData = findViewById(R.id.real_ppg);
         mHistoryData = findViewById(R.id.item_history_data);
         itemDeviceInfo = findViewById(R.id.item_device_info);
         itemWriteEpo = findViewById(R.id.item_write_epo);
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sport_watch_setting);
        findByIdView();
        LocalBroadcastManager.getInstance(this).registerReceiver(myReceiver, BaseActionUtils.getIntentFilter());
        mDialog = new LoadingDialog(this, true);
        mDialog.show();

        byte[] information = getCmdSendImpl().getFirmwareInformation();
        sendCmd(information);
        byte[] settings = getCmdSendImpl().getDeviceStateDate();
        sendCmd(settings);

        initEvent();
    }

    private void initEvent() {

        mWriteUserInfo.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                //wirte user info 2 dev (according your own users' datas)
                /**
                 * param: steps is useless now
                 */
                sendCmd(getCmdSendImpl().setUserProfile(170, 60, true, 25, 10000));
            }
        });


        mItemTime.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                mDevSetting.setIs24Hour(mDevSetting.getIs24Hour() == 0 ? 1 : 0);
                refreshSettingsUi();
                sendBaseSettingCmd();
            }
        });

        mItemDate.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                mDevSetting.setIs_dd_mm_format(mDevSetting.getIs_dd_mm_format() == 0 ? 1 : 0);
                sendBaseSettingCmd();
                refreshSettingsUi();
            }
        });

        mItemUnit.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                mDevSetting.setUnit(mDevSetting.getUnit() == 0 ? 1 : 0);
                sendBaseSettingCmd();
                refreshSettingsUi();
            }
        });

        mItemGesture.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                KLog.e("licl", "mItemGesture: " + isChecked);
                mDevSetting.setGesture(isChecked ? 1 : 0);
                sendBaseSettingCmd();
            }
        });

        mAutoHr.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                mDevSetting.setAutoHr(isChecked ? 1 : 0);
                sendBaseSettingCmd();
            }
        });

        mAutoSleep.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                mDevSetting.setAutoSleep(isChecked ? 1 : 0);
                sendBaseSettingCmd();
            }
        });

        mSmartTrack.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                mDevSetting.setIsSmartTrackOpen(isChecked ? 1 : 0);
                sendBaseSettingCmd();
            }
        });

        mItemGestureTime.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(SportWatchSettingActivity.this, OptionsPickerViewUtils.getHourOptions()[0], OptionsPickerViewUtils.getHourOptions()[1], new OptionsPickerView.OnOptionsSelectListener() {
                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        List<String> start = (List<String>) OptionsPickerViewUtils.getHourOptions()[0];
                        List<List<String>> end = (List<List<String>>) OptionsPickerViewUtils.getHourOptions()[1];
                        mDevSetting.setReverse_light_St(getHour(start.get(i)));
                        mDevSetting.setReverse_light_Et(getHour(end.get(i).get(i1)) - 1);
                        refreshSettingsUi();
                        sendBaseSettingCmd();
                    }
                });
                option.show();
            }
        });


        mItemHand.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                mDevSetting.setWearingManner(mDevSetting.getWearingManner() == 0 ? 1 : 0);
                sendBaseSettingCmd();
                refreshSettingsUi();
            }
        });

        mRealData.setmOnLSettingItemClick((isChecked)->{
            UI.startActivity(this,RealDataActivity.class);
        });

        mHistoryData.setmOnLSettingItemClick(isChecked -> {
            UI.startActivity(this, HistoryDataActivity.class);
        });

        mItemLanguage.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {

                OptionsPickerView option2 = OptionsPickerViewUtils.getOptionsPickerView(SportWatchSettingActivity.this, OptionsPickerViewUtils.getLanguage(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        mDevSetting.setLanguage(i);
                        refreshSettingsUi();
                        sendBaseSettingCmd();
                    }
                });
                option2.show();
            }
        });

        mItemWeather.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                byte[] bytes = getCmdSendImpl().setWeather(0, 25, 0, 13);
                sendCmd(bytes);
            }
        });

        m24Weather.setmOnLSettingItemClick(isChecked->{
            int hour = 24;
            int day = 7;
            DateUtil dateUtil = new DateUtil();
            MtkWeatherEvent event = new MtkWeatherEvent();
            event.setYear(dateUtil.getYear());
            event.setMonth(dateUtil.getMonth());
            event.setDay(dateUtil.getDay());
            event.setHour(0);
            List<Hour24WeatherInfo> hour24WeatherInfos = new ArrayList<>();
            List<Day7WeatherInfo> day7WeatherInfos = new ArrayList<>();
            for (int i = 0 ; i < hour;i++){
                Hour24WeatherInfo info = new Hour24WeatherInfo();
                info.setTemp(15 + i);
                info.setWeatherDesc(0);
                info.setPm25(10);
                hour24WeatherInfos.add(info);
            }
            for (int i = 0 ; i < day;i++){
                Day7WeatherInfo info = new Day7WeatherInfo();
                info.setMinTemp(10 + i);
                info.setWeatherDesc(0);
                info.setMaxTemp(30 + i);
                day7WeatherInfos.add(info);
            }
            event.setHour24WeatherInfoList(hour24WeatherInfos);
            event.setDay7WeatherInfoList(day7WeatherInfos);
            byte[] bytes = MtkSendBluetoothCmdImpl.getInstance(Utils.getApp()).set24HourWeather(event);
            BackgroundThreadManager.getInstance().addWriteDataByMtu(this,bytes,20);
        });

        mItemPushMessage.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                getCmdSendImpl().writeAlertFontLibrary(SportWatchSettingActivity.this, 2, "hello world");
            }
        });

        mItemPushCallMessage.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                getCmdSendImpl().writeAlertFontLibrary(SportWatchSettingActivity.this, 1, "18200717289");
            }
        });


        mItemShake.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                //this method only can be used for experience shake
                /**
                 * 1.type 2
                 * 2.shakeModeIndex 0~16
                 * 3.num >=0
                 * 4.model null
                 */
                getCmdSendImpl().setShakeMode2(2, 4, 3, null);
            }
        });


        mSetItemShake.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                //this method can real set remind mode and remind times to device
                ArrayList<Map<String, Integer>> model = new ArrayList<Map<String, Integer>>();
                Map<String, Integer> messageMap = new HashMap<String, Integer>();
                Map<String, Integer> phoneMap = new HashMap<String, Integer>();
                //index: mode index 0-17
                messageMap.put("index", 4);
                //number: notification counts
                messageMap.put("number", 3);
                //type 0.alarm 1.phone call 2.message 3.seat for long time 4.charging 5.schedule 6.usual
                messageMap.put("type", 2);
                phoneMap.put("index", 3);
                phoneMap.put("number", 4);
                phoneMap.put("type", 1);
                model.add(messageMap);
                model.add(phoneMap);
                /**
                 * 1.type 3
                 * 2.shakeModeIndex 0~16
                 * 3.num >=0
                 * 4.model
                 */
                getCmdSendImpl().setShakeMode2(3, 0, 0, model);
            }
        });

        mNoDisturbAllDay.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                sendCmd(getCmdSendImpl().setQuietMode(1));
            }
        });

        mNoDisturbWhenSleep.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                sendCmd(getCmdSendImpl().setQuietMode(0));
            }
        });

        mNoDisturbAsTimeSegment.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                Calendar calendar = Calendar.getInstance();
                sendCmd(getCmdSendImpl().setQuietMode(calendar.get(Calendar.HOUR), 0, calendar.get(Calendar.HOUR) + 2, 0));
            }
        });

        mGetDisturbSettingInfo.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                sendCmd(getCmdSendImpl().getQuietModeInfo());
            }
        });

        mClearNoDisturbSettings.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                sendCmd(getCmdSendImpl().clearQuietMode());
            }
        });

        mWriteAlarm.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                /**
                 * id :0-7
                 * weekreapt byte
                 * "bit7: if 1, repeat
                 *  bit0: if 1,enable on sunday
                 *  bit1: if 1, enable on saturday
                 *  bit2: if 1,enable on friday
                 *  bit3: if 1, enable on thirsday
                 *  bit4: if 1, enable on wenseday
                 *  bit5: if 1, enable on tuesday
                 *  bit6: if 1, enable on monday"
                 *   hour hour
                 *   min  min
                 */
                Calendar calendar = Calendar.getInstance();
                getCmdSendImpl().writeAlarmClock(context, 1, 0xff, calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE) + 2, "I am Alarm");
            }
        });

        mCloseAlarm.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                getCmdSendImpl().closeAlarm(0, context);
            }
        });

        mGetAlarmInfo.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                getCmdSendImpl().getAlarmClock(context, 0);
            }
        });

        mWriteSchedule.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                mCalendar = Calendar.getInstance();
                getCmdSendImpl().setSchedule(context, mCalendar.get(Calendar.YEAR), mCalendar.get(Calendar.MONTH) + 1,
                        mCalendar.get(Calendar.DAY_OF_MONTH), mCalendar.get(Calendar.HOUR), mCalendar.get(Calendar.MINUTE) + 2, "I am Schedule");
            }
        });

        mCloseSchedule.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                //close acorrding your time
                getCmdSendImpl().closeSchedule(context, 2018, 4, 18, 11, 25);
            }
        });

        mClearAllSchedule.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                getCmdSendImpl().clearAllSchedule(context);
            }
        });

        mGetScheduleSupportInfo.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                getCmdSendImpl().readScheduleInfo(context);
            }
        });

        mSetSedentary.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                /**
                 * id 0-2
                 * * week byte
                 * "bit7: if 1, repeat
                 *  bit0: if 1,enable on sunday
                 *  bit1: if 1, enable on saturday
                 *  bit2: if 1,enable on friday
                 *  bit3: if 1, enable on thirsday
                 *  bit4: if 1, enable on wenseday
                 *  bit5: if 1, enable on tuesday
                 *  bit6: if 1, enable on monday"
                 *   starthour hour
                 *   endHour hour
                 *
                 *   alertDuration && workCount:  in alertDuration time (5 min below) if step less than workCount(below 200)
                 *   watch will remind you
                 */
                sendCmd(getCmdSendImpl().setSedentary(0, 0x00, 8, 20, 1, 200));
            }
        });

        mGetSedentaryInfo.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                sendCmd(getCmdSendImpl().getSedentary());
            }
        });

        mSelfie.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                /**
                 * flag true:open false:cancel
                 * when true: A icon will show on device screen, you can click it for gesture callback
                 */
                sendCmd(getCmdSendImpl().setWristBandSelfie(isChecked));
            }
        });

        mItemFirmwareUpdate.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                if (BluetoothUtil.isConnected()) {
                    UI.startActivity(SportWatchSettingActivity.this, SportWatchFirmwareUpgradeActivity.class);
                }else {
                    Toast.makeText(SportWatchSettingActivity.this, "Please connect device first", Toast.LENGTH_LONG).show();
                }
            }
        });

        itemDeviceInfo.setmOnLSettingItemClick(isChecked -> {
            UI.startActivity(this, DeviceInfoActivity.class);
        });

        itemWriteEpo.setmOnLSettingItemClick(isChecked -> {
            UI.startActivity(this, EpoSettingActivity.class);
        });

    }

    private void sendCmd(byte[] bytes) {
        BackgroundThreadManager.getInstance().addWriteData(context, bytes);
    }

    private BaseSendBluetoothCmdImpl getCmdSendImpl() {
        return SuperBleSDK.getSDKSendBluetoothCmdImpl(SportWatchSettingActivity.this);
    }


    private int getHour(String hour) {
        int iHour = 0;
        try {
            String hours[] = hour.split(":");
            iHour = Integer.parseInt(hours[0]);
            return iHour;
        } catch (NumberFormatException e) {
            e.printStackTrace();
        }
        return iHour;
    }

    private BluetoothCallbackReceiver myReceiver = new BluetoothCallbackReceiver() {
        @Override
        public void onDataArrived(Context context, int ble_sdk_type, int dataType, String data) {
            super.onDataArrived(context, ble_sdk_type, dataType, data);
            //sport_watch mode
            if (ble_sdk_type == Constants.Bluetooth.Zeroner_Mtk_Sdk) {
                //get settings from device
                if (dataType == 0x19) {
                    mDialog.dismiss();
                    mDevSetting = new Gson().fromJson(data, IWDevSetting.class);
                    refreshSettingsUi();

                } else if (dataType == 0x00) {
                    //get firmwareinfo
                    mFimewareInfo.setText(getString(R.string.firmwareinfo) + " " + data);
                    FMdeviceInfo fMdeviceInfo = new Gson().fromJson(data, FMdeviceInfo.class);
                    mItemFirmwareUpdate.setRightText(fMdeviceInfo.getSwversion());
                } else if (dataType == 0x06) {
                    //no disturb info
                    mNoDisturbInfo.setText(data);
                } else if (dataType == 0x15) {
                    //alarm info
                    mAlarmInfo.setText("Alarm: " + data);
                } else if (dataType == 0x1e) {
                    //schedule info
                    mScheduleInfo.setText("Schedule: " + data);
                } else if (dataType == 0x1d) {
                    //judge the schedule is written successfully
                    ScheduleResult scheduleResult = new Gson().fromJson(data, ScheduleResult.class);

                    if (scheduleResult.getResult() == 1) {
                        //success
                        mWriteSchedule.setRightText("Success");
                    } else {
                        //fail
                        mWriteSchedule.setRightText("Fail");
                    }

                    mWriteSchedule.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            mWriteSchedule.setRightText("");
                        }
                    }, 5000);
                } else if (dataType == 0x17) {
                    //sedentary info
                    mSedentaryInfo.setText("SedentaryInfo: " + data);
                } else if(dataType==0x40){
                    mKeyModelText.setText("KeyModel: "+data);
                }
            }
        }


    };

    private void refreshSettingsUi() {
        mItemTime.setRightText(mDevSetting.getIs24Hour() == 0 ? getString(R.string.setting_dialog_time_24)
                : getString(R.string.setting_dialog_time_12));
        mItemDate.setRightText(mDevSetting.getIs_dd_mm_format() == 0 ? getString(R.string.setting_dialog_date_1)
                : getString(R.string.setting_dialog_date_2));
        mItemUnit.setRightText(mDevSetting.getUnit() == 0 ? getString(R.string.setting_dialog_unit_1)
                : getString(R.string.setting_dialog_unit_2));
        mItemGesture.setChecked(mDevSetting.getGesture() == 0 ? false : true);

        //-1 means this device not support this function
        if (mDevSetting.getReverse_light_Et() != -1) {
            mItemGestureTime.setRightText(mDevSetting.getReverse_light_St() + ":00-" + mDevSetting.getReverse_light_Et() + ":00");
        } else {
            mItemGestureTime.setVisibility(View.GONE);
        }


        if (mDevSetting.getWearingManner() != -1) {
            mItemHand.setRightText(mDevSetting.getWearingManner() == 0 ? getString(R.string.setting_dialog_hand_1) :
                    getString(R.string.setting_dialog_hand_2));
        } else {
            mItemHand.setVisibility(View.GONE);
        }

        if (mDevSetting.getAutoHr() != -1) {
            mAutoHr.setChecked(mDevSetting.getAutoHr() == 0 ? false : true);
        } else {
            mAutoHr.setVisibility(View.GONE);
        }


        if (mDevSetting.getIsSmartTrackOpen() != -1) {
            mSmartTrack.setChecked(mDevSetting.getIsSmartTrackOpen() == 0 ? false : true);
        } else {
            mSmartTrack.setVisibility(View.GONE);
        }

        if (mDevSetting.getAutoSleep() != -1) {
            mAutoSleep.setChecked(mDevSetting.getAutoSleep() == 0 ? false : true);
        } else {
            mAutoSleep.setVisibility(View.GONE);
        }

        mItemLanguage.setRightText(getLanguageString(mDevSetting.getLanguage()));
    }


    private String getLanguageString(int ble_language_code) {
        switch (ble_language_code) {
            case 0x00:
                return getString(R.string.language_english);
            case 0x01:
                return getString(R.string.language_chinese);
            case 0x02:
                return getString(R.string.language_italian);
            case 0x03:
                return getString(R.string.language_japan);
            case 0x04:
                return getString(R.string.language_french);
            case 0x05:
                return getString(R.string.language_german);
            case 0x06:
                return getString(R.string.language_portuguese);
            case 0x07:
                return getString(R.string.language_spanish);
            case 0x08:
                return getString(R.string.language_russian);
            case 0x09:
                return getString(R.string.language_korean);
            case 0x10:
                return getString(R.string.language_arabic);
            case 0x11:
                return getString(R.string.language_vietnamese);
            case 0x12:
                return getString(R.string.language_polish);
            case 0xff:
                return getString(R.string.language_simple);
        }
        return getString(R.string.language_english);
    }

    public void sendBaseSettingCmd() {
        SparseIntArray array = new SparseIntArray();
        //gestureSwitch
        array.put(1, mDevSetting.getGesture());
        //unitType
        array.put(2, mDevSetting.getUnit());
        //timeFlag
        array.put(3, mDevSetting.getIs24Hour());
        //sleepFlag
        array.put(4, mDevSetting.getAutoSleep());

        //language
        array.put(8, mDevSetting.getLanguage());

        //dateFormat
        array.put(10, mDevSetting.getIs_dd_mm_format());
        //gb_bl_st
        array.put(11, mDevSetting.getReverse_light_St());
        //gb_bl_et
        array.put(12, mDevSetting.getReverse_light_Et());
        //auto_hr
        array.put(13, mDevSetting.getAutoHr());
        //auto_spt
        array.put(14, mDevSetting.getIsSmartTrackOpen());
        //wearing_manner
        array.put(15, mDevSetting.getWearingManner());
        getCmdSendImpl().setWristBandGestureAndLight2(array);
    }

    @Override
    protected void onDestroy() {
        LocalBroadcastManager.getInstance(this).unregisterReceiver(myReceiver);
        super.onDestroy();
    }
}
