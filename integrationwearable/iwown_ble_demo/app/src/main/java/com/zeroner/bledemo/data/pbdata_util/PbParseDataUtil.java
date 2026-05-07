package com.zeroner.bledemo.data.pbdata_util;

import com.zeroner.bledemo.bean.sql.ProtoBuf_80_data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;
import java.util.TreeSet;

/**
 *
 * 这个类的 dataList一天的手表80数据，必须按照seq的正序排序后传进来，否则计算数据错误
 *
 */
public class PbParseDataUtil {

    /**
     * @param dataList 一天的手表80数据，必须按照seq的正序排序后传进来
     *
     */
    public static void pb80DataToAllData(int year, int month, int day, List<ProtoBuf_80_data> dataList,String dataFrom){
        //计算心率
        int[] heartArray = pbOneDataToMyHeart(dataList);
        //计算运动和步数
        TreeSet<TBSportData> walkAndSportList = pbOneDataToMySport(year,month,day,dataList,dataFrom);
        //计算一下其他数据，比如压力值，温度
        pbOneDataToOther(dataList);
    }

    /**
     * 将一天的数据转为 1440个心率点，每分钟1个值
     * @param dataList 一天的手表80数据，必须按照seq的正序排序后传进来
     */
    public static int[] pbOneDataToMyHeart(List<ProtoBuf_80_data> dataList){
        int[] myHeartNew = new int[1440];
        if(dataList!=null){
            for (int i = 0; i < dataList.size(); i++) {
                int nowTime = dataList.get(i).getHour()*60+dataList.get(i).getMinute();
                if(nowTime>=1440) {
                    continue;
                }
                myHeartNew[nowTime] = dataList.get(i).getAvg_bpm();
            }
        }
        return myHeartNew;
    }

    /**
     * 将一天的数据转为 运动数据,包过走路
     * 最后一段数据有可能传过来的数据最后一条的数据时间后移结束时间会变化，入库去重根据 开始时间 判断
     * @param dataList 一天单个的手表80数据，必须按照seq的正序排序后传进来,
     */
    public static TreeSet<TBSportData> pbOneDataToMySport(int year,int month,int day,List<ProtoBuf_80_data> dataList,String dataFrom){
        if(dataList==null){
            return new TreeSet<TBSportData>();
        }

        int mSize=dataList.size();
        //用于计算走路的原始数据
        List<ProtoBuf_80_data> walkData=new ArrayList<>();
        //用于计算其他运动原始数据(跑步等)
        List<ProtoBuf_80_data> sportData=new ArrayList<>();

        //每小时的步数，卡路里，活动时间，有需求的可自行保存,不需要的可删除
        int[] stepOne = new int[24];
        float[] calOne = new float[24];
        int[] activityOne = new int[24];

        int active = 0;
        //体重用来计算辅助计算1分钟的卡路里是否达标活要求
        float weight = (float) Math.max(20f, 65);
        for (int i = 0; i < mSize; i++) {
            if(dataList.get(i).getStep()>2000){
                continue;
            }
            //计算每小时的卡路里和步数,不需要的可将if这里删除
            if(dataList.get(i).getHour()>=0 && dataList.get(i).getHour()<=23) {
                int mSportType = dataList.get(i).getType();
                if (mSportType == 0x04 || mSportType == 0x02 || mSportType == 0x83) {
                }else{
                    stepOne[dataList.get(i).getHour()] += dataList.get(i).getStep();
                }
                calOne[dataList.get(i).getHour()] += dataList.get(i).getCalorie();
                if(isActive(weight,dataList.get(i).getCalorie())){
                    active++;
                    activityOne[dataList.get(i).getHour()]++;
                }
            }

            //这里开始计算运动
            if(dataList.get(i).getType()==1){
                //取出符合走路的原始数据
                if(!walkData.contains(dataList.get(i))) {
                    walkData.add(dataList.get(i));
                }
            }else{
                //取出其它运动的原始数据
                sportData.add(dataList.get(i));

                byte mStatue = (byte) (0xff & dataList.get(i).getState());
                int state = mStatue&0x0f;
                int automatic = mStatue>>4;
                if(state==1 && automatic>0){
                    long nT = dataList.get(i).getTime()-automatic*60;
                    for(int j=1;j<10;j++){
                        if(i-j>0 && dataList.get(i-j).getTime()>nT){
                            if(dataList.get(i-j).getType()==1){
                                walkData.remove(walkData.size()-1);
                            }
                            if(dataList.get(i-j).getMinute()!=dataList.get(i).getMinute()){
                                dataList.get(i).endStep += dataList.get(i-j).getStep();
                                dataList.get(i).endDis += dataList.get(i-j).getDistance();
                                dataList.get(i).endClo += dataList.get(i-j).getCalorie();
                            }
                        }else{
                            break;
                        }
                    }
                }
            }
        }

        PbDateUtil dateUtil = new PbDateUtil(year,month,day);
        //保存每个小时步数，sdk用户自行选择是否保存
//        DataUtil.minuteDataToOneHourStep(uid,dataFrom,year,month,day,stepOne,calOne,activityOne,active);
        //计算出来的分段步数布标
        TreeSet<TBSportData> walkSport = pb80ToWalkSport(year,month,day,dataFrom,walkData);
        //计算出来的分段运动
        TreeSet<TBSportData> exerciseSport = pb80ToExerciseSport(year,month,day,dataFrom,sportData);
        //将一天的运动合并到一起(自动正序排序)
        walkSport.addAll(exerciseSport);
        return walkSport;
    }

    /**
     * 计算1分钟的卡路里是否达到活动
     * @param weight
     * @param calorie
     * @return
     */
    private static boolean isActive(float weight,float calorie){
        if(calorie/weight>0.06){
            return true;
        }
        return false;
    }

    /**
     * 一天的80数据转为一段一段的走路数据
     * @param dataFrom 数据来源
     * @param walkData 一天全部的走路数据
     * @return
     */
    private static TreeSet<TBSportData> pb80ToWalkSport(int year, int month, int day, String dataFrom, List<ProtoBuf_80_data> walkData){

        TreeSet<TBSportData> sport_data1 = new TreeSet<>(new SportDataComparator());
        float distance=0;
        long startUTime=0;
        long endUTime=0;
        int stTime=0;
        int edTime=0;
        float calorie=0;
        int activity=0;
        int step=0;

        if(!walkData.isEmpty()) {
            distance=walkData.get(0).getDistance();

            startUTime = new PbDateUtil(year,month,day,walkData.get(0).getHour(),walkData.get(0).getMinute(),0).getUnixTimestamp();
            endUTime = startUTime;
            stTime=walkData.get(0).getHour()*60+walkData.get(0).getMinute();
            edTime=walkData.get(0).getHour()*60+walkData.get(0).getMinute();
            calorie=walkData.get(0).getCalorie();
            activity=1;
            step=walkData.get(0).getStep();
            for (int i = 0; i < walkData.size(); i++) {
                if (i > 0) {
                    walkData.get(i).setSecond(0);
                    int nowT=walkData.get(i).getHour()*60+walkData.get(i).getMinute();
                    //走路时间间隔大于5分钟
                    if((nowT<edTime) || (nowT-edTime>5)){
                        if(step>0 || distance>0) {
                            sport_data1.add(TbSaveUtil.getTbSport(1, year, month, day, startUTime, endUTime, calorie,activity,step,distance, dataFrom,0));
                        }
                        distance = walkData.get(i).getDistance();
                        startUTime = new PbDateUtil(year,month,day,walkData.get(i).getHour(),walkData.get(i).getMinute(),walkData.get(i).getSecond()).getUnixTimestamp();
                        endUTime = startUTime;
                        stTime=walkData.get(i).getHour()*60+walkData.get(i).getMinute();
                        edTime=walkData.get(i).getHour()*60+walkData.get(i).getMinute();
                        calorie=walkData.get(i).getCalorie();
                        activity=1;
                        step=walkData.get(i).getStep();
                    }else{
                        endUTime=new PbDateUtil(year,month,day,walkData.get(i).getHour(),walkData.get(i).getMinute(),walkData.get(i).getSecond()).getUnixTimestamp();
                        edTime=walkData.get(i).getHour()*60+walkData.get(i).getMinute();
                        distance+=walkData.get(i).getDistance();
                        calorie+=walkData.get(i).getCalorie();
                        activity++;
                        step+=walkData.get(i).getStep();
                    }
                }
                if(i==walkData.size()-1){
                    if(step>0 || distance>0) {
                        sport_data1.add(TbSaveUtil.getTbSport(1, year, month, day, startUTime, endUTime, calorie,activity,step,distance, dataFrom,0));
                    }
                }
            }
        }
        return sport_data1;
    }

    /**
     * 将一天中的一段运动数据抽离并存入运动表(非走路)
     * @param dataFrom
     * @param sportData
     * @return
     */
    private static TreeSet<TBSportData> pb80ToExerciseSport(int year, int month, int day, String dataFrom, List<ProtoBuf_80_data> sportData){
        TreeSet<TBSportData> sport_data = new TreeSet<>(new SportDataComparator());
        float distance=0;
        long startUTime=0;
        long endUTime=0;
        int stTime=0;
        int edTime=0;
        float calorie=0;
        int activity=0;
        int step=0;
        int sportType=0;
        boolean pause=false;
        int pauseTime=0;
        long pauseUt=0;
        long lastTime=0;
        int lastEt=0;
        int automatic=0;
        boolean isOver=true;

        String lastHeartTime = "";
        int lastHeart=0;

        //每分钟的步数或划水次数
        int minStep=0;
        //每分钟的距离
        float minDistance = 0;
        LinkedList<Integer> heartList = new LinkedList<>();
        LinkedList<Integer> stepList = new LinkedList<>();
        LinkedList<Float> distanceList = new LinkedList<>();
        if(!sportData.isEmpty()){
            for (int i = 0; i < sportData.size(); i++) {
                if(sportData.get(i).getType()==0 && sportType==0) {
                    continue;
                }

                byte mStatue = (byte) (0xff & sportData.get(i).getState());
                int state = mStatue&0x0f;
                int mautomatic = mStatue>>4;
                if(!isOver){
                    if(state==1) {
                        //运动时长 秒值
                        int df = (int) (lastTime - startUTime) - pauseTime;
                        //运动时长 分钟
                        activity = df % 60 == 0 ? (df / 60) : (df / 60 + 1);
                        if (activity > 0) {
                            //走到了基本说明这段数据异常
                           TBSportData oneSport = TbSaveUtil.getTbSport(sportType, year, month, day, startUTime, endUTime, calorie,activity+automatic,step,distance, dataFrom,automatic);
                            oneSport.setStepList(stepList);
                            oneSport.setDistanceList(distanceList);
                            oneSport.setHeartList(heartList);
                            sport_data.add(oneSport);
                        }
                        sportType = 0;
                        pauseTime = 0;
                        minStep=0;
                        minDistance=0;
                        pauseUt = 0;
                        pause = false;

                    }
                }
                //运动类型状态
                if(sportType==0){
                    //一段运动开启
                    if(state==1) {
                        calorie=sportData.get(i).endClo;
                        distance=sportData.get(i).endDis;
                        pauseUt = 0;
                        pause = false;
                        pauseTime=0;
                        automatic=mautomatic;
                        heartList.clear();
                        stepList.clear();
                        distanceList.clear();
                        step=sportData.get(i).endStep;
                        isOver=false;

                        //取每一分钟的心率值
                        int heart=sportData.get(i).getAvg_bpm();
                        if(heart<30 || heart>200 ){
                            heart = 0;
                        }
                        minStep=sportData.get(i).getStep();
                        minDistance = sportData.get(i).getDistance();
                        lastHeartTime="";
                        String nowHeartTime = sportData.get(i).getHour()+"/"+sportData.get(i).getMinute();
                        if(!nowHeartTime.equals(lastHeartTime)){
                            if(sportData.get(i).getSecond()==0) {
                                heartList.add(heart);
                                lastHeartTime = nowHeartTime;
                                lastHeart = heart;
                            }
                        }else{
                            if(lastHeart==0 && heart>0 && sportData.get(i).getSecond()==0){
                                if(!heartList.isEmpty()) {
                                    heartList.removeLast();
                                }
                                heartList.add(heart);
                                lastHeart=heart;
                            }
                        }

                        calorie+=sportData.get(i).getCalorie();
                        distance+=sportData.get(i).getDistance();
                        step+=sportData.get(i).getStep();
                        sportType = sportData.get(i).getType();
                        stTime=sportData.get(i).getHour()*60+sportData.get(i).getMinute();
                        startUTime=new PbDateUtil(year,month,day,sportData.get(i).getHour(),sportData.get(i).getMinute(),sportData.get(i).getSecond()).getUnixTimestamp();
                    } else {
                        continue;
                    }
                }else{
                    if(state != 3){
                        calorie += sportData.get(i).getCalorie();
                        distance += sportData.get(i).getDistance();
                        step += sportData.get(i).getStep();
                    }
                    int heart=sportData.get(i).getAvg_bpm();
                    if(heart<30 || heart>200 ){
                        heart = 0;
                    }
                    String nowHeartTime = sportData.get(i).getHour()+"/"+sportData.get(i).getMinute();
                    if(!nowHeartTime.equals(lastHeartTime)){
                        if(sportData.get(i).getSecond()==0) {
                            heartList.add(heart);
                            lastHeartTime = nowHeartTime;
                            lastHeart = heart;
                        }
                        stepList.add(minStep);
                        distanceList.add(minDistance);
                        minStep=sportData.get(i).getStep();
                        minDistance=sportData.get(i).getDistance();
                    }else{
                        if(lastHeart==0 && heart>0 && sportData.get(i).getSecond()==0){
                            if(!heartList.isEmpty()) {
                                heartList.removeLast();
                            }
                            heartList.add(heart);
                            lastHeart=heart;
                        }
                        minStep+=sportData.get(i).getStep();
                        minDistance+=sportData.get(i).getDistance();
                    }

                    lastTime = new PbDateUtil(year, month, day, sportData.get(i).getHour(), sportData.get(i).getMinute(),sportData.get(i).getSecond()).getUnixTimestamp();
                    lastEt=sportData.get(i).getHour()*60+sportData.get(i).getMinute();

                    //手表第一个暂停状态
                    if(state==3 && !pause){
                        //暂停的秒值
                        pauseUt=lastTime;
                        pause=true;
                    }
                    //全部在暂停状态下 0：是代表在休息，如果出现其它状态就是代表暂停结束
                    if(pause &&(state!=3) && state!=0){
                        long time1=lastTime;
                        //算运动暂停时间
                        pauseTime+= (int) (time1-pauseUt);
                        pause=false;
                    }
                    //一段运动结束
                    if(state==2){
                        isOver=true;
                        if(sportType==0) {
                            sportType = sportData.get(i).getType();
                        }
                        endUTime=lastTime;
                        edTime=sportData.get(i).getHour()*60+sportData.get(i).getMinute();
                        int df =(int) (lastTime-startUTime)-pauseTime;
                        //automatic  自动识别
                        activity=df%60==0?(df/60):(df/60+1);
                        stepList.add(minStep);
                        distanceList.add(minDistance);

                        //游泳特殊处理
                        if(sportType==131){
                            //趟数
                            int laps = sportData.get(i).getStep();
                            //泳道长度
                            int poolLength = (int) (sportData.get(i).getDistance()*10);
                            step = step-sportData.get(i).getStep();
                            distance = laps*poolLength;
                        }
                        TBSportData oneSport = TbSaveUtil.getTbSport(sportType, year, month, day, startUTime, endUTime, calorie,activity+automatic,step,distance, dataFrom,automatic);
                        oneSport.setStepList(stepList);
                        oneSport.setDistanceList(distanceList);
                        oneSport.setHeartList(heartList);
                        sport_data.add(oneSport);

                        step=0;
                        sportType=0;
                        calorie=0;
                        distance=0;
                        pauseTime=0;
                        automatic=0;
                    }
                }

                if(i==sportData.size()-1 && !isOver){
                    //走到这里说明这段数据异常，有可能是用户还在运动中就同步数据了，这段运动还没结束
                    int df =(int) (lastTime-startUTime)-pauseTime;
                    activity=df%60==0?(df/60):(df/60+1);
                    if(activity>0) {
                        TBSportData oneSport = TbSaveUtil.getTbSport(sportType, year, month, day, startUTime, endUTime, calorie,activity+automatic,step,distance, dataFrom,automatic);
                        oneSport.setStepList(stepList);
                        oneSport.setDistanceList(distanceList);
                        oneSport.setHeartList(heartList);
                        sport_data.add(oneSport);

                        sportType=0;
                        pauseTime=0;
                    }
                }
            }
        }
        return sport_data;
    }

    /**
     *
     * 以下这些数据根据自身的手表自行判断是否有这些数据功能，没有相应功能的数据则一直返回空数据
     */
    public static void pbOneDataToOther(List<ProtoBuf_80_data> dataList){
        if(dataList==null){
            return;
        }
        //以下这些数据根据自身的手表自行判断是否有这些数据功能，没有相应功能的数据则一直返回空数据
        //以下这些数据根据自身的手表自行判断是否有这些数据功能，没有相应功能的数据则一直返回空数据
        //呼吸率数据
//        List<TbOtherData>breathList = new ArrayList<>();
        //压力数据
        List<TbOtherData> pressureList = new ArrayList<>();
        //温度
        List<TbOtherData>temperatureList = new ArrayList<>();
        //血氧数据
        List<TbOtherData>spo2List = new ArrayList<>();
        //血压
        List<TbOtherData>bpList = new ArrayList<>();
        for (ProtoBuf_80_data protoBuf80Data : dataList) {
            data80ToPressureData(protoBuf80Data,pressureList);
            data80ToTemperatureData(protoBuf80Data,temperatureList);
            data80ToSpo2Data(protoBuf80Data,spo2List);
            data80ToBpData(protoBuf80Data,bpList);
        }

    }

    /**
     * 保存压力值数据
     */
    private static void data80ToPressureData(ProtoBuf_80_data data, List<TbOtherData> otherList){
        if(data.getFatigue()>0 && data.getFatigue()<=100){
            TbOtherData otherData = new TbOtherData("pressure");
            int value = (int) (100-data.getFatigue());
            otherData.saveValueAndTime(value,data.getTime());
            otherList.add(otherData);
        }
    }

    /**
     * 保存体温数据,体温获取后使用时需要除以10.0获得浮点型
     */
    private static void data80ToTemperatureData(ProtoBuf_80_data data, List<TbOtherData> otherList){
        TbOtherData otherData = new TbOtherData("temperature");
        BigDecimal bg = BigDecimal.valueOf(data.getTemperArm());
        float f1 = bg.setScale(1, BigDecimal.ROUND_DOWN).floatValue();
        BigDecimal bg3 = BigDecimal.valueOf(data.getTemperDef());
        float f4 = bg3.setScale(1, BigDecimal.ROUND_DOWN).floatValue();
        if(f1>30 && f1<45){
            otherData.saveValueAndTime((int)(f1*10),data.getTime());
            otherList.add(otherData);
        }else if(f4>=35 && f4<45){
            otherData.saveValueAndTime((int)(f4*10),data.getTime());
            otherList.add(otherData);
        }
    }

    /**
     * 保存血压数据
     */
    private static void data80ToBpData(ProtoBuf_80_data data, List<TbOtherData> otherList){
        boolean isDbpOk = data.getDbp()<=300 && data.getDbp()>0;
        boolean isSbpOk = data.getSbp()<=300 && data.getSbp()>0;
        if(isDbpOk && isSbpOk){
            TbOtherData otherData = new TbOtherData("bp");
            otherData.saveAllValueAndTime(data.getSbp(),data.getDbp(),data.getTime());
            otherList.add(otherData);
        }
    }

    /**
     * 保存血氧数据
     */
    private static void data80ToSpo2Data(ProtoBuf_80_data data, List<TbOtherData> otherList){
        if(data.getAvgSpo2()>80 && data.getAvgSpo2()<110){
            TbOtherData otherData = new TbOtherData("spo2");
            otherData.saveValueAndTime(data.getAvgSpo2(),data.getTime());
            otherList.add(otherData);
        }
    }

    /**
     * 保存心情数据
     * 心情只有5中类型 数字越大心情越好，中文可自定义类型
     * 举例： 沮丧-忧郁-平和-开心-愉悦
     */
//    private static void data80ToMoodData(ProtoBuf_80_data data, List<TbOtherData> otherList){
//        if(data.getFatigue()>=0 && data.getFatigue()<=4){
//            TbOtherData otherData = new TbOtherData("mood");
//            otherList.add(otherData);
//        }
//    }

}
