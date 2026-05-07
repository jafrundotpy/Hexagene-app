package com.zeroner.bledemo.data.pbdata_util;

public class TbSaveUtil {
    public static TBSportData getTbSport(int sportType, int year, int month, int day, long sUTime, long eUTime, float calorie, int activity, int step, float distance, String dataFrom, int automatic){
        TBSportData sport = new TBSportData();
        sport.setYear(year);
        sport.setMonth(month);
        sport.setDay(day);
        sport.setStart_uxtime(sUTime-automatic* 60L);
        sport.setEnd_uxtime(eUTime);
//        if(sportType==1){
//            sport.setEnd_uxtime(eUTime+60);
//        }
        sport.setCalorie(calorie);
        sport.setActivity(activity);
        sport.setStep(step);
        sport.setDistance(distance);
        sport.setSport_type(sportType);
        sport.setData_from(dataFrom);
        return sport;
    }
}
