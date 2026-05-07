package com.zeroner.bledemo.bean.sql;

import com.zeroner.blemidautumn.utils.ByteUtil;

import org.litepal.crud.DataSupport;

import java.util.Arrays;

public class BpMeasure extends DataSupport {
    private long timeStamp;
    /**IR*/
    private int led1;
    /**RED*/
    private int led2;
    private int led3;
    private int led4;
    private int bpStatus;
    private int progress;
    private int heart;
    private int sbPressure;
    private int dbPressure;
    private int spo2;
    private int r;
    private int pulseFlag;
    private int lbl;
    private int so2Conf;

    public int getLed1() {
        return led1;
    }

    public void setLed1(int led1) {
        this.led1 = led1;
    }

    public int getLed2() {
        return led2;
    }

    public void setLed2(int led2) {
        this.led2 = led2;
    }

    public int getLed3() {
        return led3;
    }

    public void setLed3(int led3) {
        this.led3 = led3;
    }

    public int getLed4() {
        return led4;
    }

    public void setLed4(int led4) {
        this.led4 = led4;
    }

    public int getBpStatus() {
        return bpStatus;
    }

    public void setBpStatus(int bpStatus) {
        this.bpStatus = bpStatus;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public int getHeart() {
        return heart;
    }

    public void setHeart(int heart) {
        this.heart = heart;
    }

    public int getSbPressure() {
        return sbPressure;
    }

    public void setSbPressure(int sbPressure) {
        this.sbPressure = sbPressure;
    }

    public int getDbPressure() {
        return dbPressure;
    }

    public void setDbPressure(int dbPressure) {
        this.dbPressure = dbPressure;
    }

    public int getSpo2() {
        return spo2;
    }

    public void setSpo2(int spo2) {
        this.spo2 = spo2;
    }

    public int getR() {
        return r;
    }

    public void setR(int r) {
        this.r = r;
    }

    public int getPulseFlag() {
        return pulseFlag;
    }

    public void setPulseFlag(int pulseFlag) {
        this.pulseFlag = pulseFlag;
    }

    public int getLbl() {
        return lbl;
    }

    public void setLbl(int lbl) {
        this.lbl = lbl;
    }

    public int getSo2Conf() {
        return so2Conf;
    }


    public void setSo2Conf(int so2Conf) {
        this.so2Conf = so2Conf;
    }


    public long getTimeStamp() {
        return timeStamp;
    }

    public void setTimeStamp(long timeStamp) {
        this.timeStamp = timeStamp;
    }

    public static BpMeasure parseData(byte[] data, long timeStamp){
        BpMeasure measure=new BpMeasure();
        int led1= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 0, 3));
        int led2= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 3, 6));
        int led3= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 6, 9));
        int led4= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 9, 12));
        int bpStatus= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 12, 13));
        int progress= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 13, 14));
        int heart= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 14, 16));
        int sbPressure= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 16, 17));
        int dbPressure= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 17, 18));
        int spo2= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 18, 20));
        int r= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 20, 22));
        int pulseFlag= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 22, 23));
        int lbl= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 23, 25));
        int so2Conf= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 25, 26));
        measure.setLed1(led1);
        measure.setLed2(led2);
        measure.setLed3(led3);
        measure.setLed4(led4);
        measure.setBpStatus(bpStatus);
        measure.setProgress(progress);
        measure.setHeart(heart);
        measure.setSbPressure(sbPressure);
        measure.setDbPressure(dbPressure);
        measure.setSpo2(spo2);
        measure.setR(r);
        measure.setPulseFlag(pulseFlag);
        measure.setLbl(lbl);
        measure.setSo2Conf(so2Conf);
        measure.setTimeStamp(timeStamp);
        measure.save();
        return measure;
    }

    public static BpMeasure parseCmd(byte[] data, long timeStamp){
        BpMeasure measure=new BpMeasure();
        if(data.length < 20){
            return measure;
        }
        int led4= ByteUtil.bytesToInt(Arrays.copyOfRange(data, 0, 4));
        int status= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 4, 5));
        int progress= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 5, 6));
        int heart= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 6, 8));
        int sbPressure= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 8, 9));
        int dbPressure= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 9, 10));
        int spo2= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 10, 12));
        int r= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 12, 14));
        int pulseFlag= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 14, 15));
        int lbl= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 15, 17));
        int so2Conf= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 17, 18));
        int bptFlag= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 18, 19));
        int spo2Flag= ByteUtil.bytesToIntBp(Arrays.copyOfRange(data, 19, 20));
        measure.setProgress(progress);
        measure.setHeart(heart);
        measure.setSbPressure(sbPressure);
        measure.setDbPressure(dbPressure);
        measure.setSpo2(spo2);
        measure.setR(r);
        measure.setPulseFlag(pulseFlag);
        measure.setLbl(lbl);
        measure.setSo2Conf(so2Conf);
        measure.setTimeStamp(timeStamp);
        measure.setBpStatus(status);
        measure.setLed4(led4);
        return measure;
    }
}