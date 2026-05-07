package com.zeroner.bledemo.bean.data;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Gavin
 * @date 2024/10/28
 */
public class BpDayFile {
    private String time;
    private String deviceId;
    private List<String> dataArray = new ArrayList<>();

    public String getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(String deviceId) {
        this.deviceId = deviceId;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public List<String> getDataArray() {
        return dataArray;
    }

    public void setDataArray(List<String> dataArray) {
        this.dataArray = dataArray;
    }
}
