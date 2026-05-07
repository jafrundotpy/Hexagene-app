package com.zeroner.bledemo.data.sync;

import android.os.Looper;
import android.text.TextUtils;

import com.socks.library.KLog;
import com.zeroner.bledemo.BleApplication;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.bean.sql.File_protobuf_80data;
import com.zeroner.bledemo.bean.sql.TB_61_data;
import com.zeroner.bledemo.bean.sql.TB_62_data;
import com.zeroner.bledemo.bean.sql.TB_rri_data;
import com.zeroner.bledemo.bean.sql.TB_sum_61_62_64;
import com.zeroner.bledemo.data.MtkDataParsePresenter;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.FileUtils;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.blemidautumn.Constants;
import com.zeroner.blemidautumn.bluetooth.model.HealthMinData;
import com.zeroner.blemidautumn.utils.ByteUtil;
import com.zeroner.blemidautumn.utils.JsonTool;

import org.litepal.crud.DataSupport;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.LinkedBlockingDeque;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;

/**
 * 作者：hzy on 2018/3/26 10:05
 * <p>
 * 邮箱：hezhiyuan@iwown.com
 */

public class MtkDataToServer {
    private static boolean isTwo;
    private static android.os.Handler mHandler = new android.os.Handler(Looper.getMainLooper());

    private static ThreadPoolExecutor fixedThreadPool = new ThreadPoolExecutor(1,1,10, TimeUnit.SECONDS,new LinkedBlockingDeque<Runnable>());


    public static long Fictitious_Uid = 10087;

    public static void upCmdToServer(){
        isTwo=true;
        List<TB_sum_61_62_64> httpList = DataSupport.findAll(TB_sum_61_62_64.class);
        Set<String> set =new HashSet<>();
        final String deviceName= PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
        for(int i=0;i<httpList.size();i++){
            String date=httpList.get(i).getDate();
            String log_file=BaseActionUtils.FilePath.Mtk_Ble_61_Data_Log_Dir + BleApplication.getInstance().getString(R.string.file_61_name_format, Fictitious_Uid+"", date, deviceName) + ".txt";
            FileUtils.clearInfoForFile(log_file,BaseActionUtils.FilePath.Mtk_Ble_61_Data_Log_Dir);
            if(FileUtils.checkFileExists(log_file)){
                FileUtils.deleteFile(log_file);
            }


            String sd1=  BaseActionUtils.FilePath.Mtk_Ble_61_Sleep_Dir+date+"/";
            String fileName= BleApplication.getInstance().getString(R.string.file_61_name_format, Fictitious_Uid+"", date, deviceName);
            FileUtils.clearInfoForFile(sd1+fileName,BaseActionUtils.FilePath.Mtk_Ble_61_Sleep_Dir);
            if(FileUtils.checkFileExists(sd1+fileName)){
                FileUtils.deleteFile(sd1+fileName);
            }
            set.add(date);
            List<TB_61_data> list61= DataSupport.where("data_from=? and year=? and month=? and day=?",
                    String.valueOf(PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+""),httpList.get(i).getYear()+"",httpList.get(i).getMonth()+"",httpList.get(i).getDay()+"").order("time asc").find(TB_61_data.class);
            for(int j=0;j<list61.size();j++){
                isTwo=true;
                sleepCmdSaveToFile(list61.get(j));
            }
        }


    }


    private static void sleepCmdSaveToFile(TB_61_data data) {
        String date = new DateUtil(data.getYear(), data.getMonth(), data.getDay()).getSyyyyMMddDate();
            String deviceName = PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
            String fileName = BleApplication.getInstance().getString(R.string.file_61_name_format, Fictitious_Uid+"", date, deviceName);
            String path = BaseActionUtils.FilePath.Mtk_Ble_61_Sleep_Dir + date + "/";
            FileUtils.write2SDFromString_1(path, fileName, data.getCmd());
            String fileName_1 = fileName+".txt";
            FileUtils.write2SDFromString_1(BaseActionUtils.FilePath.Mtk_Ble_61_Data_Log_Dir,fileName_1,data.getCmd());
    }

    public static void syncSaveTodayCmd(){
        fixedThreadPool.execute(new Runnable() {
            @Override
            public void run() {
                saveTodayCmd();
            }
        });
    }




    public static void saveTodayCmd(){
        isTwo=false;
        String deviceName=PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
        DateUtil dateUtil=new DateUtil();
        List<MyDay> days = new ArrayList<>();
        days.add(new MyDay(dateUtil.getYear(),dateUtil.getMonth(),dateUtil.getDay(),dateUtil.getSyyyyMMddDate()));
        dateUtil.addDay(-1);
        days.add(new MyDay(dateUtil.getYear(),dateUtil.getMonth(),dateUtil.getDay(),dateUtil.getSyyyyMMddDate()));

        for (int i = 0; i < days.size(); i++) {
            List<TB_61_data> list61= DataSupport.where("data_from=? and year=? and month=? and day=?",
                    deviceName,days.get(i).getYear()+"",days.get(i).getMonth()+"",days.get(i).getDay()+"").order("time asc").find(TB_61_data.class);
            if(list61.size()>0){
                if(isTwo) {
                    break;
                }
                String[] pathAndName = getPathAndName(new DateUtil(days.get(i).getYear(),days.get(i).getMonth(),days.get(i).getDay()));
                String date=days.get(i).getDate();
                mtkJsonSleepChange(list61, date,pathAndName);
                DateUtil dateUtil1=new DateUtil();
                String[] twoDaysPath = getTwoDaysPath(dateUtil1);
                MtkToIvHandler.save61FileSleep(twoDaysPath[0],twoDaysPath[1],dateUtil1,deviceName);
            }

        }
    }

    /**
     * @param dateUtil
     * @return string[] 0 昨天 1 今天
     */
    public static String[] getTwoDaysPath(DateUtil dateUtil) {
        String[] path = new String[2];
        DateUtil yesDateUtil = new DateUtil(dateUtil.getUnixTimestamp(), true);
        yesDateUtil.addDay(-1);
        String rootPath = BaseActionUtils.FilePath.Mtk_Ble_61_Sleep_Dir + dateUtil.getSyyyyMMddDate() + "/";
        String fileName = "uid-" + MtkDataParsePresenter.TestUid + "-date-" + dateUtil.getSyyyyMMddDate() + "-source-" + MtkDataParsePresenter.getDataFrom() + ".json";
        String yesRootPath = BaseActionUtils.FilePath.Mtk_Ble_61_Sleep_Dir + yesDateUtil.getSyyyyMMddDate() + "/";
        String yesFileName = "uid-" + MtkDataParsePresenter.TestUid + "-date-" + yesDateUtil.getSyyyyMMddDate() + "-source-" + MtkDataParsePresenter.getDataFrom() + ".json";
        path[0] = yesRootPath + yesFileName;
        path[1] = rootPath + fileName;
        return path;
    }

    private static String[] getPathAndName(DateUtil dateUtil) {
        String[] path = new String[2];
        String rootPath = BaseActionUtils.FilePath.Mtk_Ble_61_Sleep_Dir + dateUtil.getSyyyyMMddDate() + "/";
        String fileName = "uid-" + MtkDataParsePresenter.TestUid + "-date-" + dateUtil.getSyyyyMMddDate() + "-source-" + MtkDataParsePresenter.getDataFrom() + ".json";
        path[0] = rootPath;
        path[1] = fileName;
        return path;
    }


    public static void upCmd62ToServer(){

        String deviceName=PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
        List<TB_62_data> list= DataSupport.where("data_from =? ",
                String.valueOf(deviceName))
                .order("time asc").find(TB_62_data.class);

        Set<String> set =new HashSet<>();
        KLog.i("62dataUp"+list.size());
        if(list.size()>0){
            for (int i = 0; i <list.size() ; i++) {
                TB_62_data data=list.get(i);
                String date=  new DateUtil(data.getYear(),data.getMonth(),data.getDay()).getSyyyyMMddDate();
                String path= BaseActionUtils.FilePath.Mtk_Ble_62_Data_Log_Dir + date+"_"+deviceName+".txt";
                FileUtils.clearInfoForFile(path,BaseActionUtils.FilePath.Mtk_Ble_62_Data_Log_Dir);
                try {
                    if(FileUtils.checkFileExists(path)){
                        FileUtils.deleteFile(path);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }
                set.add(date);
            }
            for (int i = 0; i <list.size() ; i++) {
                gnssCmdSaveToFile(list.get(i));
            }

        }

    }

    private static String getNewSleep(String cmd){
        byte[] datas = ByteUtil.hexToBytes(cmd);
        if(datas==null || datas.length<20){
            return "";
        }
        HealthMinData healthMinData = new HealthMinData().parseData(Constants.Bluetooth.Zeroner_Mtk_Sdk,datas);
        if(healthMinData!=null){
            return healthMinData.getSleep();
        }else{
            return "";
        }
    }

    private static List<File_protobuf_80data> getSleepBean(List<TB_61_data> data61s){
        //保存到本地
        List<File_protobuf_80data> protoBufLists = new ArrayList<>();
        for (TB_61_data index : data61s) {
            File_protobuf_80data file_protobuf_80data = new File_protobuf_80data();

            File_protobuf_80data.Sleep sleep = new File_protobuf_80data.Sleep();

            //重置sleep
            if(TextUtils.isEmpty(index.getSleep())){
                index.setSleep(getNewSleep(index.getCmd()));
            }

            sleep.setA(JsonTool.fromJson(index.getSleep(), int[].class));
            sleep.setS(index.getShutdown());
            sleep.setC(0);
            File_protobuf_80data.HeartRate heartRate = new File_protobuf_80data.HeartRate();
            heartRate.setX(index.getMax_bpm());
            heartRate.setN(index.getMin_bpm());
            heartRate.setA(index.getAvg_bpm());

            File_protobuf_80data.HRV hrv = new File_protobuf_80data.HRV();
            hrv.setS(index.getSdnn());
            hrv.setR(index.getLf());
            hrv.setP(index.getHf());
            hrv.setM(index.getLf_hf());
            hrv.setF(index.getBpm_hr());

            File_protobuf_80data.Pedo pedo = new File_protobuf_80data.Pedo();
            pedo.setS(index.getStep());
            pedo.setD((int) index.getDistance());
            pedo.setC(index.getCalorie());
            pedo.setT(index.getSport_type());
            pedo.setA(index.getState_type());

            file_protobuf_80data.setQ(index.getSeq());
            file_protobuf_80data.setT(file_protobuf_80data.parseTime(index.getHour(), index.getMin()));
            file_protobuf_80data.setE(sleep);
            file_protobuf_80data.setP(pedo);
            file_protobuf_80data.setH(heartRate);
            file_protobuf_80data.setV(hrv);

            protoBufLists.add(file_protobuf_80data);

        }
        return protoBufLists;
    }

    /**
     * MTK使用pb json格式处理睡眠
     */
    private static void mtkJsonSleepChange(List<TB_61_data> list61,String date,String[] pathAndName){
        String sd1=  BaseActionUtils.FilePath.Mtk_Ble_61_Sleep_Dir+date+"/";
//        String fileName="uid-"+uid+"-date-"+date+"-source-"+deviceName + ".json";
//        String path1=sd1+fileName;
//        FileUtils.clearInfoForFile(path1,BaseActionUtils.FilePath.Mtk_Ble_61_Sleep_Dir);
//        if(FileUtils.checkFileExists(path1)){
//            FileUtils.deleteFile(path1);
//        }
        List<File_protobuf_80data> sleepBean = getSleepBean(list61);
        //解析
        ComplexPropertyPreFilter filter = new ComplexPropertyPreFilter();
        Map<Class<?>, String[]> includes = new HashMap<>();
        Map<Class<?>, String[]> excludes = new HashMap<>();
        excludes.put(File_protobuf_80data.Pedo.class, new String[]{"t", "a", "c", "s", "d"});
        excludes.put(File_protobuf_80data.HeartRate.class, new String[]{"n", "x", "a"});
        excludes.put(File_protobuf_80data.HRV.class, new String[]{"s", "r", "p", "m", "f"});
        excludes.put(File_protobuf_80data.Sleep.class, new String[]{"a", "c", "s"});
        includes.put(File_protobuf_80data.class, new String[]{"Q", "T", "E", "H", "P", "V"});
        filter.setExcludes(excludes);
        filter.setIncludes(includes);
        String s = JsonTool.toJson(sleepBean, filter);

        String path = BaseActionUtils.FilePath.Mtk_Ble_61_Sleep_Dir + date + "/";

        FileUtils.write2SDFromString(pathAndName[0], pathAndName[1], s,false);
    }

    private static void gnssCmdSaveToFile(TB_62_data data){
        String deviceName=PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
        String date=  new DateUtil(data.getYear(),data.getMonth(),data.getDay()).getSyyyyMMddDate();
        String fileName = date+"_"+deviceName+ ".txt";
        FileUtils.write2SDFromString_1(BaseActionUtils.FilePath.Mtk_Ble_62_Data_Log_Dir, fileName , data.getCmd());
    }

    public static double[] getRriData(long uid, String date, String dataFrom) {
        String rriHasDataFrom = dataFrom;
        List<Integer> list = new ArrayList<>();
        //查询数据库
        String seqMsg ="uid=? and data_from=? and date=?";
        List<TB_rri_data> tbRriData = DataSupport.where(seqMsg, uid + "", rriHasDataFrom, date).find(TB_rri_data.class);

        Collections.sort(tbRriData);
        for (TB_rri_data rriData:tbRriData) {
            List<Integer> listJson = JsonTool.getListJson(rriData.getRawData(), Integer.class);
            list.addAll(listJson);
        }

        double[] rri = new double[list.size()];
        int index = 0;
        for (int i : list) {
            rri[index++] = i;
        }
        return rri;

    }
}
