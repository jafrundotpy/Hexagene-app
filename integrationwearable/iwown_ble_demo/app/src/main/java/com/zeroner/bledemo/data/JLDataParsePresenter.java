package com.zeroner.bledemo.data;

import android.content.Context;
import android.util.Log;

import com.jieli_ble.bean.JLDeviceInfo;
import com.jieli_ble.bean.JLParseDataType;
import com.zeroner.bledemo.eventbus.Event;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.JsonUtils;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.blemidautumn.Constants;

import org.greenrobot.eventbus.EventBus;

/**
 * Time: 2023/12/13
 * Author: ZhengHuaizhi
 * Description:
 */
public class JLDataParsePresenter {

    public static final String TAG = "JLDataParsePresenter";

    public static final int Type = Constants.Bluetooth.ZERONER_JL_SDK;


    public static void parseProtocolData(Context context, int dataType, String data) {
        switch (dataType) {
            case JLParseDataType.POWER_DATA:
                JLDeviceInfo powerInfo = JsonUtils.fromJson(data, JLDeviceInfo.class);
                PrefUtil.save(context, BaseActionUtils.Action_device_Battery, powerInfo.getBattery() + "");
                EventBus.getDefault().post(new Event(Event.Ble_Connect_Statue));
                break;
            case JLParseDataType.DEVICE_INFO:
                JLDeviceInfo deviceInfo = JsonUtils.fromJson(data, JLDeviceInfo.class);
                PrefUtil.save(context, BaseActionUtils.Action_device_Model, deviceInfo.getModel());
                PrefUtil.save(context, BaseActionUtils.Action_device_version, deviceInfo.getSwVersion());
                EventBus.getDefault().post(new Event(Event.Ble_Connect_Statue));
                break;
            case JLParseDataType.ZP100_RT_DATA:
            case JLParseDataType.ZP100_RT_RESULT:
                break;
        }
    }
}
