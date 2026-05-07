package com.zeroner.bledemo.bean.data;

import java.util.List;

/**
 * @author Gavin
 * @date 2024/10/28
 */
public class BpOneFileData {
    private int ReturnCode;
    private List<BpBinData> Data;

    public int getReturnCode() {
        return ReturnCode;
    }

    public void setReturnCode(int returnCode) {
        ReturnCode = returnCode;
    }

    public List<BpBinData> getData() {
        return Data;
    }

    public void setData(List<BpBinData> data) {
        Data = data;
    }

    public static class BpBinData{
        private String Deviceid;
        private String Bp_Time;
        private String Bp_Data;
        private int Seq;

        public String getDeviceid() {
            return Deviceid;
        }

        public void setDeviceid(String deviceid) {
            Deviceid = deviceid;
        }

        public String getBp_Time() {
            return Bp_Time;
        }

        public void setBp_Time(String bp_Time) {
            Bp_Time = bp_Time;
        }

        public String getBp_Data() {
            return Bp_Data;
        }

        public void setBp_Data(String bp_Data) {
            Bp_Data = bp_Data;
        }

        public int getSeq() {
            return Seq;
        }

        public void setSeq(int seq) {
            Seq = seq;
        }
    }
}
