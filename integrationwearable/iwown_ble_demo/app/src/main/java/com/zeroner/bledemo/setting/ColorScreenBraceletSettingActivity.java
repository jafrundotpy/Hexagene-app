package com.zeroner.bledemo.setting;
import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import androidx.annotation.NonNull;
import com.google.android.material.appbar.AppBarLayout;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import android.view.View;
import com.bigkoo.pickerview.OptionsPickerView;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.bean.sql.BraceletSetting;
import com.zeroner.bledemo.setting.alarm.AddClockActivity;
import com.zeroner.bledemo.setting.schedule.ScheduleActivity;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.OptionsPickerViewUtils;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.bledemo.utils.SqlBizUtils;
import com.zeroner.bledemo.utils.UI;
import com.zeroner.bledemo.view.LSettingItem;
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK;
import com.zeroner.blemidautumn.task.BackgroundThreadManager;
import com.zeroner.blemidautumn.task.BleWriteDataTask;

import java.util.HashMap;
import java.util.List;
import java.util.Map;




public class ColorScreenBraceletSettingActivity extends AppCompatActivity {

    Toolbar toolbarDevice;
    LSettingItem itemShake;
    LSettingItem itemTime;
    LSettingItem itemDate;
    LSettingItem itemUnit;
    LSettingItem itemWeather;
    LSettingItem itemGesture;
    LSettingItem itemHand;
    LSettingItem itemGestureTime;
    LSettingItem itemLanguage;
    LSettingItem itemFirmwareUpdate;
    LSettingItem itemAlarm;
    LSettingItem itemSchedule;
    LSettingItem itemShakeSettingMode;
    AppBarLayout container;
    private Context context;

    private void findByIdView() {
         toolbarDevice = findViewById(R.id.toolbar_device_setting);
         itemShake = findViewById(R.id.item_shake);
         itemTime = findViewById(R.id.item_time);
         itemDate = findViewById(R.id.item_date);
        itemUnit = findViewById(R.id.item_unit);
         itemWeather = findViewById(R.id.item_weather);
         itemGesture = findViewById(R.id.item_gesture);
         itemHand = findViewById(R.id.item_hand);
         itemGestureTime = findViewById(R.id.item_gesture_time);
         itemLanguage = findViewById(R.id.item_language);
         itemFirmwareUpdate = findViewById(R.id.item_firmware_update);
         itemAlarm = findViewById(R.id.item_alarm);
         itemSchedule = findViewById(R.id.item_schedule);
        itemShakeSettingMode = findViewById(R.id.item_shake_setting_mode);
         container = findViewById(R.id.container);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.color_screen_bracelet_activity_setting);
        findByIdView();
        context = this;
        initView();
    }

    private void initView() {
        setSupportActionBar(toolbarDevice);
        getSupportActionBar().setHomeButtonEnabled(true);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        toolbarDevice.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
        itemShake.setRightText(PrefUtil.getString(context, BaseActionUtils.Action_Setting_Shake));
        itemTime.setRightText(PrefUtil.getString(context, BaseActionUtils.Action_Setting_Time_Format));
        itemDate.setRightText(PrefUtil.getString(context, BaseActionUtils.Action_Setting_Date_Format));
        itemUnit.setRightText(PrefUtil.getString(context, BaseActionUtils.Action_Setting_Unit));
        itemWeather.setRightText(PrefUtil.getString(context, BaseActionUtils.Action_Setting_Weather_Unit));
        itemGesture.setChecked(PrefUtil.getInt(context, BaseActionUtils.Action_Setting_Roll) == 1 ? true : false);
        itemGestureTime.setRightText(PrefUtil.getString(context, BaseActionUtils.Action_Setting_Roll_Time));
        itemHand.setRightText(PrefUtil.getString(context, BaseActionUtils.Action_Setting_Hand));
        itemLanguage.setRightText(PrefUtil.getString(context, BaseActionUtils.Action_Setting_Language));


        itemShake.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean b) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getShakeName(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        itemShake.setRightText(OptionsPickerViewUtils.getShakeName(context).get(i));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Shake, OptionsPickerViewUtils.getShakeName(context).get(i));
                        byte[] bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(getApplicationContext()).testShake(OptionsPickerViewUtils.getZGShakeModel(context)[i], 5);
                        BleWriteDataTask task = new BleWriteDataTask(getApplicationContext(), bytes);
                        BackgroundThreadManager.getInstance().addTask(task);
                    }

                });
                option.show();
            }
        });
        itemTime.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean b) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getTimeItemOptions(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        itemTime.setRightText(OptionsPickerViewUtils.getTimeItemOptions(context).get(i));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Time_Format, OptionsPickerViewUtils.getTimeItemOptions(context).get(i));
                        BraceletSetting bs1 = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Time_Format);
                        bs1.setKey(BaseActionUtils.Action_Setting_Time_Format);
                        bs1.setValue(i);
                        SqlBizUtils.saveBraceletSetting(bs1);
                        SuperBleSDK.getSDKSendBluetoothCmdImpl(getApplicationContext()).setTimeDisplay(context,i);
                    }
                });
                option.show();
            }
        });

        itemDate.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean b) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getDateItemOptions(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        itemDate.setRightText(OptionsPickerViewUtils.getDateItemOptions(context).get(i));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Date_Format, OptionsPickerViewUtils.getDateItemOptions(context).get(i));
                        BraceletSetting setting = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Date_Format);
                        setting.setKey(BaseActionUtils.Action_Setting_Date_Format);
                        setting.setValue(i);
                        SqlBizUtils.saveBraceletSetting(setting);
                    }
                });
                option.show();
            }
        });
        itemUnit.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean b) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getUnitItemOptions(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        itemUnit.setRightText(OptionsPickerViewUtils.getUnitItemOptions(context).get(i));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Unit, OptionsPickerViewUtils.getUnitItemOptions(context).get(i));
                        BraceletSetting setting = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Unit);
                        setting.setKey(BaseActionUtils.Action_Setting_Unit);
                        setting.setValue(i);
                        SqlBizUtils.saveBraceletSetting(setting);
                        SuperBleSDK.getSDKSendBluetoothCmdImpl(getApplicationContext()).setUnitSwitch(context,i);
                    }
                });
                option.show();
            }
        });
        itemWeather.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean b) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getWeatherItemOptions(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        itemWeather.setRightText(OptionsPickerViewUtils.getWeatherItemOptions(context).get(i));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Weather_Unit, OptionsPickerViewUtils.getWeatherItemOptions(context).get(i));
                        BraceletSetting setting = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Weather_Unit);
                        setting.setKey(BaseActionUtils.Action_Setting_Weather_Unit);
                        setting.setValue(i);
                        SqlBizUtils.saveBraceletSetting(setting);
                        SuperBleSDK.getSDKSendBluetoothCmdImpl(getApplicationContext()).setTemperatureUnitSwitch(context,i);
                    }
                });
                option.show();
            }
        });

        itemGesture.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean b) {
                if (b) {
                    PrefUtil.save(context, BaseActionUtils.Action_Setting_Roll, 1);
                } else {
                    PrefUtil.save(context, BaseActionUtils.Action_Setting_Roll, 0);
                }
                BraceletSetting setting = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Roll_Time);
                setting.setKey(BaseActionUtils.Action_Setting_Roll_Time);
                setting.setValue(b ? 1 : 0);
                SqlBizUtils.saveBraceletSetting(setting);
                SuperBleSDK.getSDKSendBluetoothCmdImpl(getApplicationContext()).setGesture(context,b ? 1 : 0,0,24);

            }
        });

        itemGestureTime.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean b) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getHourOptions()[0], OptionsPickerViewUtils.getHourOptions()[1], new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        List<String> start = (List<String>) OptionsPickerViewUtils.getHourOptions()[0];
                        List<List<String>> end = (List<List<String>>) OptionsPickerViewUtils.getHourOptions()[1];
                        itemGestureTime.setRightText(start.get(i) + "-" + end.get(i).get(i1));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Roll_Time, start.get(i) + "-" + end.get(i).get(i1));
                        BraceletSetting setting = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Roll_Time);
                        setting.setKey(BaseActionUtils.Action_Setting_Roll_Time);
                        setting.setStartTime(getHour(start.get(i)));
                        setting.setEndTime(getHour(end.get(i).get(i1)));
                        SqlBizUtils.saveBraceletSetting(setting);
                        SuperBleSDK.getSDKSendBluetoothCmdImpl(getApplicationContext()).setGesture(context,1,getHour(start.get(i)),getHour(end.get(i).get(i1)));
                    }
                });
                option.show();
            }
        });


        itemHand.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean b) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getHandItemOptions(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        itemHand.setRightText(OptionsPickerViewUtils.getHandItemOptions(context).get(i));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Hand, OptionsPickerViewUtils.getHandItemOptions(context).get(i));
                        BraceletSetting setting = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Hand);
                        setting.setKey(BaseActionUtils.Action_Setting_Hand);
                        setting.setValue(i);
                        SqlBizUtils.saveBraceletSetting(setting);

                    }
                });
                option.show();
            }
        });

        itemLanguage.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                OptionsPickerView option = OptionsPickerViewUtils.getOptionsPickerView(context, OptionsPickerViewUtils.getLanguage(context), new OptionsPickerView.OnOptionsSelectListener() {

                    @Override
                    public void onOptionsSelect(int i, int i1, int i2, View view) {
                        itemLanguage.setRightText(OptionsPickerViewUtils.getLanguage(context).get(i));
                        PrefUtil.save(context, BaseActionUtils.Action_Setting_Language, OptionsPickerViewUtils.getLanguage(context).get(i));
                        BraceletSetting setting = SqlBizUtils.querySetting(BaseActionUtils.Action_Setting_Language);
                        setting.setKey(BaseActionUtils.Action_Setting_Language);
                        setting.setValue(i);
                        SqlBizUtils.saveBraceletSetting(setting);
                        SuperBleSDK.getSDKSendBluetoothCmdImpl(context).setLanguage(context,i);
                    }
                });
                option.show();
            }
        });

        itemFirmwareUpdate.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                UI.startActivity((Activity) context, FirmwareUpdateActivity.class);
            }
        });

        itemAlarm.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                UI.startActivity((Activity) context,AddClockActivity.class);
            }
        });

        itemSchedule.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                UI.startActivity((Activity) context,ScheduleActivity.class);
            }
        });

        itemShakeSettingMode.setmOnLSettingItemClick(new LSettingItem.OnLSettingItemClick() {
            @Override
            public void click(boolean isChecked) {
                /**
                 *<array name="shake_mode_zg">
                 <item>1</item>
                 <item>2</item>
                 <item>3</item>
                 <item>4</item>
                 <item>5</item>
                 <item>6</item>
                 <item>7</item>
                 </array>
                 */
                SuperBleSDK.getSDKSendBluetoothCmdImpl(context).setShake(context,1,10
                        ,2,10
                        ,3,10
                        ,4,10
                );
            }
        });

    }

    @NonNull
    private static Map<String, Integer> createMap(int mode, int num, int type) {
        Map<String, Integer> phoneMap = new HashMap<>();
        phoneMap.put("index", mode);
        phoneMap.put("number", num);
        phoneMap.put("type", type);
        return phoneMap;
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

}
