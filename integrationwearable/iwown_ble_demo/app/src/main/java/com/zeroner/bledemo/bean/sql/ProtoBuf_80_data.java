package com.zeroner.bledemo.bean.sql;

import org.litepal.annotation.Column;
import org.litepal.crud.DataSupport;

public class ProtoBuf_80_data extends DataSupport {

    /** 不进入数据库,仅用于计算*/
    @Column(ignore = true)
    public int endStep=0;
    @Column(ignore = true)
    public float endDis=0;
    @Column(ignore = true)
    public float endClo=0;
//============以上不进入数据库,仅用于计算

    /**
     * data
     */
    private int year;
    private int month;
    private int day;
    private int hour;
    private int minute;
    private int second;

    /**
     * 时间戳(单位s)
     */
    private int time;
    /**
     * 排序用的
     */
    private int seq;
    /**
     * 设备名
     */
    private String data_from;
    /**
     * 睡眠数据,睡眠算法用
     */
    private String sleepData;
    /**
     * 健康
     */
    //运动类型
    private int type;
    //运动状态 0-正常状态，1-运动开始，2-运动结束 3-运动中 4-运动暂停
    private int state;
    //卡路里，单位千卡
    private float calorie;
    //步数
    private int step;
    //距离，单位米
    private float distance;
    /**
     * 心率
     */
    //最低心率
    private int min_bpm;
    //最高心率
    private int max_bpm;
    //平均心率，一般使用这个值
    private int avg_bpm;
    /**
     * 疲劳度 0-100
     */
    private float fatigue;

    /**
     * 血压
     *
     */
    //收缩压
    private int sbp;
    //舒张压
    private int dbp;
    //时间戳，秒数
    private int bpTime;


    /**
     * 血氧数据
     */
    //平均血氧，一般使用这个值
    private int avgSpo2;
    private int maxSpo2;
    private int minSpo2;


    /**
     * 温度数据
     */
    private int temperType;
    //环境温度
    private int temperEnv;
    //体表温度
    private int temperBody;
    //预设温度
    private int temperDef;
    //腋下温度
    private int temperArm;


    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public int getDay() {
        return day;
    }

    public void setDay(int day) {
        this.day = day;
    }

    public int getHour() {
        return hour;
    }

    public void setHour(int hour) {
        this.hour = hour;
    }

    public int getMinute() {
        return minute;
    }

    public void setMinute(int minute) {
        this.minute = minute;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }

    public int getState() {
        return state;
    }

    public void setState(int state) {
        this.state = state;
    }

    public float getCalorie() {
        return calorie;
    }

    public void setCalorie(float calorie) {
        this.calorie = calorie;
    }

    public int getStep() {
        return step;
    }

    public void setStep(int step) {
        this.step = step;
    }

    public float getDistance() {
        return distance;
    }

    public void setDistance(float distance) {
        this.distance = distance;
    }

    public int getMin_bpm() {
        return min_bpm;
    }

    public void setMin_bpm(int min_bpm) {
        this.min_bpm = min_bpm;
    }

    public int getMax_bpm() {
        return max_bpm;
    }

    public void setMax_bpm(int max_bpm) {
        this.max_bpm = max_bpm;
    }

    public int getAvg_bpm() {
        return avg_bpm;
    }

    public void setAvg_bpm(int avg_bpm) {
        this.avg_bpm = avg_bpm;
    }

    public float getFatigue() {
        return fatigue;
    }

    public void setFatigue(float fatigue) {
        this.fatigue = fatigue;
    }

    public String getData_from() {
        return data_from;
    }

    public void setData_from(String data_from) {
        this.data_from = data_from;
    }

    public String getSleepData() {
        return sleepData;
    }

    public void setSleepData(String sleepData) {
        this.sleepData = sleepData;
    }

    public int getSeq() {
        return seq;
    }

    public void setSeq(int seq) {
        this.seq = seq;
    }


    public int getSbp() {
        return sbp;
    }

    public void setSbp(int sbp) {
        this.sbp = sbp;
    }

    public int getDbp() {
        return dbp;
    }

    public void setDbp(int dbp) {
        this.dbp = dbp;
    }

    public int getBpTime() {
        return bpTime;
    }

    public void setBpTime(int bpTime) {
        this.bpTime = bpTime;
    }

    public int getTime() {
        return time;
    }

    public void setTime(int time) {
        this.time = time;
    }

    public int getSecond() {
        return second;
    }

    public void setSecond(int second) {
        this.second = second;
    }


    public int getAvgSpo2() {
        return avgSpo2;
    }

    public void setAvgSpo2(int avgSpo2) {
        this.avgSpo2 = avgSpo2;
    }

    public int getMaxSpo2() {
        return maxSpo2;
    }

    public void setMaxSpo2(int maxSpo2) {
        this.maxSpo2 = maxSpo2;
    }

    public int getMinSpo2() {
        return minSpo2;
    }

    public void setMinSpo2(int minSpo2) {
        this.minSpo2 = minSpo2;
    }

    public int getTemperType() {
        return temperType;
    }

    public void setTemperType(int temperType) {
        this.temperType = temperType;
    }

    public int getTemperEnv() {
        return temperEnv;
    }

    public void setTemperEnv(int temperEnv) {
        this.temperEnv = temperEnv;
    }

    public int getTemperBody() {
        return temperBody;
    }

    public void setTemperBody(int temperBody) {
        this.temperBody = temperBody;
    }

    public int getTemperDef() {
        return temperDef;
    }

    public void setTemperDef(int temperDef) {
        this.temperDef = temperDef;
    }

    public int getTemperArm() {
        return temperArm;
    }

    public void setTemperArm(int temperArm) {
        this.temperArm = temperArm;
    }
}

