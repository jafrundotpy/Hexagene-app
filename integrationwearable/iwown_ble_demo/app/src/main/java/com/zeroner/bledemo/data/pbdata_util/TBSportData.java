package com.zeroner.bledemo.data.pbdata_util;

import com.zeroner.blemidautumn.library.klog.FileLog;

import java.io.Serializable;
import java.util.List;

public class TBSportData implements Serializable{
    // 运动类型
    private int sport_type;
    // 数据来源
    private String data_from;
    // 消耗卡路里
    private double calorie;

    //运动分钟数,剔除暂停时间
    private int activity;
    private int step;
    //单位 米
    private float distance;
    // 年
    private int year;
    // 月
    private int month;
    // 日
    private int day;

    private long start_uxtime;
    private long end_uxtime;
    //走路（sport_type==1）以下三个List都是没有的
    private List<Integer> heartList;

    //这两个参数一般用于跑步，快走，爬山，游泳运动（游泳distanceList无效）
    private List<Integer> stepList;
    private List<Float> distanceList;

    public int getSport_type() {
        return sport_type;
    }

    public void setSport_type(int sport_type) {
        this.sport_type = sport_type;
    }

    public String getData_from() {
        return data_from;
    }

    public void setData_from(String data_from) {
        this.data_from = data_from;
    }

    public double getCalorie() {
        return calorie;
    }

    public void setCalorie(double calorie) {
        this.calorie = calorie;
    }

    public int getActivity() {
        return activity;
    }

    public void setActivity(int activity) {
        this.activity = activity;
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

    public long getStart_uxtime() {
        return start_uxtime;
    }

    public void setStart_uxtime(long start_uxtime) {
        this.start_uxtime = start_uxtime;
    }

    public long getEnd_uxtime() {
        return end_uxtime;
    }

    public void setEnd_uxtime(long end_uxtime) {
        this.end_uxtime = end_uxtime;
    }

    public List<Integer> getStepList() {
        return stepList;
    }

    public void setStepList(List<Integer> stepList) {
        this.stepList = stepList;
    }

    public List<Float> getDistanceList() {
        return distanceList;
    }

    public void setDistanceList(List<Float> distanceList) {
        this.distanceList = distanceList;
    }

    public List<Integer> getHeartList() {
        return heartList;
    }

    public void setHeartList(List<Integer> heartList) {
        this.heartList = heartList;
    }

    @Override
    public boolean equals(Object obj) {
        if(obj==null){
            return false;
        }else if(!(obj instanceof TBSportData)){
            return false;
        }else{
            return ((TBSportData) obj).getData_from()!=null &&
                    ((TBSportData) obj).getData_from().equals(this.data_from) &&
                    this.getStart_uxtime()==((TBSportData) obj).getStart_uxtime() &&
                    this.sport_type==((TBSportData) obj).getSport_type();

        }
    }

}
