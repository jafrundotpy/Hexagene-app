package com.zeroner.bledemo.bean.sql;

import org.litepal.crud.DataSupport;

/**
 * 作者：hzy on 2017/7/4 15:08
 * <p>
 * 邮箱：hezhiyuan@iwown.com
 */

public class TB_61_data extends DataSupport {
    private long uid;
    private String data_from;
    private int ctrl;
    private int seq;
    private int year;
    private int month;
    private int day;
    private int hour;
    private int min;
    private int data_type;
    private int sport_type;
    private float calorie;
    private int step;
    private float distance;
    private int state_type;
    private int reserve;
    //自动进入运动模式需要加的分钟数
    private int automatic;

    //    心率
    private int min_bpm;
    private int max_bpm;
    private int avg_bpm;
    private int level;

    //    心率变性性
    private int sdnn;
    private int lf;
    private int hf;
    private int lf_hf;
    private int bpm_hr;

    //    血压
    private int sbp;
    private int dbp;
    private int bpm;

    private long time;

    //心情
    private int mood;

    private int af;

    /**
     * 睡眠
     */

    private String sleep;
    private int shutdown;

    /**
     * 呼吸率数据
     */
    private int breathrate;

    /**
     * 体脂数据  电阻值 体脂率 体重指数 肥胖类型
     */
    private int bioz_r;
    private int bioz_fat;
    private int bioz_bmi;
    private int bioz_type;

    /**
     * 血氧数据
     */
    private int spo2;

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

    //    @Column(unique = true)
    private String cmd;

    public int getAutomatic() {
        return automatic;
    }

    public void setAutomatic(int automatic) {
        this.automatic = automatic;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public String getData_from() {
        return data_from;
    }

    public void setData_from(String data_from) {
        this.data_from = data_from;
    }



    public int getCtrl() {
        return ctrl;
    }

    public void setCtrl(int ctrl) {
        this.ctrl = ctrl;
    }

    public int getSeq() {
        return seq;
    }

    public void setSeq(int seq) {
        this.seq = seq;
    }

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

    public int getMin() {
        return min;
    }

    public void setMin(int min) {
        this.min = min;
    }

    public int getData_type() {
        return data_type;
    }

    public void setData_type(int data_type) {
        this.data_type = data_type;
    }

    public int getSport_type() {
        return sport_type;
    }

    public void setSport_type(int sport_type) {
        this.sport_type = sport_type;
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

    public int getState_type() {
        return state_type;
    }

    public void setState_type(int state_type) {
        this.state_type = state_type;
    }

    public int getReserve() {
        return reserve;
    }

    public void setReserve(int reserve) {
        this.reserve = reserve;
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

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getSdnn() {
        return sdnn;
    }

    public void setSdnn(int sdnn) {
        this.sdnn = sdnn;
    }

    public int getLf() {
        return lf;
    }

    public void setLf(int lf) {
        this.lf = lf;
    }

    public int getHf() {
        return hf;
    }

    public void setHf(int hf) {
        this.hf = hf;
    }

    public int getLf_hf() {
        return lf_hf;
    }

    public void setLf_hf(int lf_hf) {
        this.lf_hf = lf_hf;
    }

    public int getBpm_hr() {
        return bpm_hr;
    }

    public void setBpm_hr(int bpm_hr) {
        this.bpm_hr = bpm_hr;
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

    public int getBpm() {
        return bpm;
    }

    public void setBpm(int bpm) {
        this.bpm = bpm;
    }

    public String getCmd() {
        return cmd;
    }

    public void setCmd(String cmd) {
        this.cmd = cmd;
    }

    public long getUid() {
        return uid;
    }

    public void setUid(long uid) {
        this.uid = uid;
    }

    public int getMood() {
        return mood;
    }

    public void setMood(int mood) {
        this.mood = mood;
    }

    public int getAf() {
        return af;
    }

    public void setAf(int af) {
        this.af = af;
    }

    public String getSleep() {
        return sleep;
    }

    public void setSleep(String sleep) {
        this.sleep = sleep;
    }

    public int getShutdown() {
        return shutdown;
    }

    public void setShutdown(int shutdown) {
        this.shutdown = shutdown;
    }

    public int getBreathrate() {
        return breathrate;
    }

    public void setBreathrate(int breathrate) {
        this.breathrate = breathrate;
    }

    public int getBioz_r() {
        return bioz_r;
    }

    public void setBioz_r(int bioz_r) {
        this.bioz_r = bioz_r;
    }

    public int getBioz_fat() {
        return bioz_fat;
    }

    public void setBioz_fat(int bioz_fat) {
        this.bioz_fat = bioz_fat;
    }

    public int getBioz_bmi() {
        return bioz_bmi;
    }

    public void setBioz_bmi(int bioz_bmi) {
        this.bioz_bmi = bioz_bmi;
    }

    public int getBioz_type() {
        return bioz_type;
    }

    public void setBioz_type(int bioz_type) {
        this.bioz_type = bioz_type;
    }

    public int getSpo2() {
        return spo2;
    }

    public void setSpo2(int spo2) {
        this.spo2 = spo2;
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

    @Override
    public String toString() {
        return "TB_61_data{" +
                ", day=" + day +
                ", hour=" + hour +
                ", min=" + min +
                ", sport_type=" + sport_type +
                ", distance=" + distance +
                '}';
    }
}
