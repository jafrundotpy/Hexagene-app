package com.zeroner.bledemo.data.sync;

import android.content.Context;
import android.util.Log;
import android.util.SparseArray;

import com.blankj.utilcode.util.ToastUtils;
import com.zeroner.bledemo.BleApplication;
import com.zeroner.bledemo.bean.data.ProtobufSyncSeq;
import com.zeroner.bledemo.bean.sql.PbSupportInfo;
import com.zeroner.bledemo.bean.sql.ProtoBuf_index_80;
import com.zeroner.bledemo.bean.sql.ProtoBuf_index_record;
import com.zeroner.bledemo.bean.sql.TB_64_index_table;
import com.zeroner.bledemo.bean.sql.TB_mtk_statue;
import com.zeroner.bledemo.data.ProtoBufDataParsePersenter;
import com.zeroner.bledemo.data.ProtoBufSleepSqlUtils;
import com.zeroner.bledemo.eventbus.SyncDataEvent;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.bluetooth.model.ProtoBufHisIndexTable;
import com.zeroner.blemidautumn.bluetooth.proto.HisDataOuterClass;
import com.zeroner.blemidautumn.library.KLog;
import com.zeroner.blemidautumn.task.BackgroundThreadManager;
import com.zeroner.blemidautumn.utils.Util;

import org.greenrobot.eventbus.EventBus;
import org.litepal.crud.DataSupport;

import java.util.ArrayList;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

/**
 * 同步数据
 */
public class ProtoBufSync {
    /**
     *是否每次下拉需要同步所有的数据，包过记录以前同步过的
     */
    private boolean needSyncAll = false;

    /**
     * <code>HEALTH_DATA = 0;</code>
     */
    /**
     * <code>GNSS_DATA = 1;</code>
     */
    /**
     * <code>ECG_DATA = 2;</code>
     */
    /**
     * <code>PPG_DATA = 3;</code>
     */
    /**
     * <code>RRI_DATA = 4;</code>
     */
    /**
     * <code>MEDIC_DATA = 5;</code>
     */
    /**
     * <code>SPO2_DATA = 6;</code>
     */
    /**
     * <code>SWIM_DATA = 7;</code>
     */
    private volatile static ProtoBufSync instance;
    public static final int HEALTH_DATA = 0;
    public static final int GNSS_DATA = 1;
    public static final int ECG_DATA = 2;
    public static final int PPG_DATA = 3;
    public static final int RRI_DATA = 4;
    public static final int SPO2_DATA = 6;
    public static final int SWIM_DATA = 7;
    //中医数据类型==18
    public static final int YYLPFE_DATA = HisDataOuterClass.HisDataType.YYLPFE_DATA_VALUE;
    private List<Integer> typeArray = new ArrayList<>();
    private SparseArray<List<ProtobufSyncSeq>> totalSeqList = new SparseArray<>();
    private SparseArray<List<ProtoBuf_index_80>> array = new SparseArray<>();
    /**
     * 是否同步
     */
    private boolean isSync = false;
    /**
     * 同步进度上一个位置
     */
    private int lastPosition = -1;
    /**
     * 当前同步的类型
     */
    private int currentType;

    /**
     * 是否结束发送
     */
    private boolean isFinishTag = false;
    /**
     * 在收到90指令之后发送同步指令
     */
    public static boolean isFirstSync = false;
    /**
     * 当前模块的index
     */
    private int position;

    /**
     * 是否同步过数据
     */
    private boolean hasData = false;
    private long syncTimes = 0L;


    /**
     * 总index80数据
     */
    private final List<ProtoBuf_index_80> protoBufIndex80s = new ArrayList<>();

    public static ProtoBufSync getInstance() {
        if (instance == null) {
            synchronized (ProtoBufSync.class) {
                if (instance == null) {
                    instance = new ProtoBufSync();
                }
            }
        }
        return instance;
    }

    private String getTypeString(int type){
        String typeStr = "unknown";
        switch (type){
            case HEALTH_DATA:
                typeStr = "health";
                break;
            case GNSS_DATA:
                typeStr = "gps";
                break;
            case ECG_DATA:
                typeStr = "ecg";
                break;
            case PPG_DATA:
                typeStr = "ppg";
                break;
            case RRI_DATA:
                typeStr = "rri";
                break;
            case SPO2_DATA:
                typeStr = "spo2";
                break;
            case SWIM_DATA:
                typeStr = "swim";
                break;
            case YYLPFE_DATA:
                typeStr = "yylpfe";
                break;
        }

        return typeStr;

    }

    public boolean isNeedSyncAll() {
        return needSyncAll;
    }

    public void setNeedSyncAll(boolean needSyncAll) {
        this.needSyncAll = needSyncAll;
    }

    /**
     * 同步数据,如果想每次都同步所有数据，将needSyncAll的值改为true
     */
    public void syncData() {
        String data_from = PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
        byte[] realHealthData = ProtoBufSendBluetoothCmdImpl.getInstance().getRealHealthData();
        BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(), realHealthData);

        if (isSync) {
            com.socks.library.KLog.d("正在同步..");
            return;
        }
        //查询手表支持哪些数据
        PbSupportInfo protoBufSupportInfo = DataSupport.where("data_from=?", data_from).findFirst(PbSupportInfo.class);
        if(protoBufSupportInfo == null){
            //如果这里为空,则重新获取一下09协议的数据
            byte[] spuData = ProtoBufSendBluetoothCmdImpl.getInstance().getDataInfo();
            BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(), spuData);
            return;
        }
        typeArray = getTypeArray(protoBufSupportInfo);

        EventBus.getDefault().post(new SyncDataEvent(-1,false));

        isFinishTag = false;

        isSync = true;

        hasData = false;

        currentType = 0;
        syncTimes = System.currentTimeMillis()/1000;
        ProtoBuf_index_record record = new ProtoBuf_index_record();
        record.setType(-1);
        record.setTime(syncTimes);
        record.setData_from(ProtoBufDataParsePersenter.getDataFrom());
        record.save();
        initData();

    }


    /**
     * 同步数据
     */
    public void syncData(int type) {

        if (isSync) {
            ToastUtils.showShort("请确保当前没有同步数据");
            return;
        }
        typeArray.clear();
        typeArray.add(type);
        EventBus.getDefault().post(new SyncDataEvent(-1,false));

        isSync = true;

        currentType = 0;

        initData();

    }

    private void initData() {
        if(currentType < typeArray.size()){
            lastType = typeArray.get(currentType);
            byte[] indexTab = ProtoBufSendBluetoothCmdImpl.getInstance().itHisData(typeArray.get(currentType));
            BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(), indexTab);
        }
    }

    public void syncDetailData(List<ProtoBuf_index_80> index) {
        position = 0;
        protoBufIndex80s.clear();
        protoBufIndex80s.addAll(index);

        //查询表中是否有记录
        if (protoBufIndex80s.size() > 0) {
            lastType = protoBufIndex80s.get(0).getIndexType();
            hasData = true;
            com.socks.library.KLog.i("开始同步...." + protoBufIndex80s.get(0).getIndexType());
            int indexType = protoBufIndex80s.get(0).getIndexType();
            array.put(indexType, protoBufIndex80s);
            List<ProtobufSyncSeq> protobufSyncSeqs = new ArrayList<>();
            for (int i = 0; i < protoBufIndex80s.size(); i++) {
                ProtoBuf_index_80 dbIndex = protoBufIndex80s.get(i);
                int startIdx = dbIndex.getStart_idx();
                int endIdx = dbIndex.getEnd_idx();
                int totalSeq = dbIndex.getEnd_idx() - dbIndex.getStart_idx();
                ProtobufSyncSeq protobufSyncSeq = new ProtobufSyncSeq(totalSeq, startIdx, i + 1, endIdx, indexType);
                protobufSyncSeqs.add(protobufSyncSeq);

                saveIndexTable(indexType, dbIndex);
            }
            totalSeqList.put(indexType, protobufSyncSeqs);
            syncDetailByIndex(indexType);
        } else {
            //同步完成
            com.socks.library.KLog.i("数据为空....同步完一条数据");
            currentType++;
            if (currentType < typeArray.size()) {
                initData();
            } else {
                if (!hasData) {
                    com.socks.library.KLog.i("progressbar------------ finish ---has data" + hasData);
                    ProtoBufSync.getInstance().progressFinish();
                }
            }
        }

    }

    private void syncDetailByIndex(int indexType) {

        if (position < protoBufIndex80s.size()) {
            int hisDataType = protoBufIndex80s.get(position).getIndexType();
            ProtoBuf_index_80 index = protoBufIndex80s.get(position);
            final int startSeq = index.getStart_idx();
            final int endSeq = index.getEnd_idx();
            com.socks.library.KLog.i("开始同步:indexType" + protoBufIndex80s.get(0) + "----position / all:" + position + " ----" + protoBufIndex80s.size());
            //同步index table下面的数据指令
            ProtoBufDataParsePersenter.CURRENT_INDEX_TABLE = new DateUtil(index.getYear(),index.getMonth(),index.getDay()).getSyyyyMMddDate() + hisDataType;
            detailData(BleApplication.getInstance(), indexType, startSeq, endSeq);
            com.socks.library.KLog.d("80 data ----- sync ---" + startSeq + "---" + endSeq);
        }
    }

    /**
     * 现在用于手表清除中医的提醒
     */
    public void writeStopYYLpfeCmd(){
        int type = HisDataOuterClass.HisDataType.YYLPFE_DATA_VALUE;
        byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().stopHisData(type);
        BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(), bytes);
    }


    private int lastType = 0;
    /**
     * 结束一条indextable数据
     */
    public void finishOneIndexTable(){
        position ++;
        if (position < protoBufIndex80s.size()) {
            syncDetailByIndex(protoBufIndex80s.get(0).getIndexType());
        }else{
            //同步完一个的指令了.同步下一条
            com.socks.library.KLog.i("同步完一条数据");
            if(lastType == YYLPFE_DATA){
                ProtoBufSync.getInstance().writeStopYYLpfeCmd();
            }
            currentType++;
            if (currentType < typeArray.size()) {
                initData();
            }
        }
    }


    private void detailData(Context context, int type, int startSeq, int endSeq) {
        byte[] hisData = ProtoBufSendBluetoothCmdImpl.getInstance().startHisData(type, startSeq, endSeq);
        BackgroundThreadManager.getInstance().addWriteData(context, hisData);
    }



    public List<ProtoBuf_index_80> parseIndex(ProtoBufHisIndexTable i7BHisIndexTable) {
        if (i7BHisIndexTable == null || i7BHisIndexTable.getIndexList() == null) {
            return null;
        }

        String data_from = PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
        List<ProtoBuf_index_80> index_80s = new ArrayList<>();
        long nowTime = System.currentTimeMillis()/1000;
        for (ProtoBufHisIndexTable.Index index : i7BHisIndexTable.getIndexList()) {
            if (index.getStartSeq() >= index.getEndSeq()) {
                continue;
            }
            int[] ints = parseTime(index.getSecond());
            ProtoBuf_index_record record = new ProtoBuf_index_record();
            record.setType(i7BHisIndexTable.getHisDataType());
            record.setData_time(index.getSecond());
            record.setTime(syncTimes);
            record.setType_str(getTypeString(record.getType()));
            record.setUp_time(nowTime);
            record.setData_from(data_from);
            record.setStart_idx(index.getStartSeq());
            record.setEnd_idx(index.getEndSeq());
            record.save();

            int endSeq = 0;
//            List<ProtoBuf_index_80> index_table;
//            if (dateUtil.getYear() == ints[0] && dateUtil.getMonth() == ints[1] && dateUtil.getDay() == ints[2]) {
            //不需要同步所有数据时，获取上次的endseq,默认上次的数据全部同步完毕
            if(!needSyncAll){
                ProtoBuf_index_80 end_idx = DataSupport.where("year=? and month=? and day=? and data_from=? and start_idx=? and indexType=?",
                        ints[0] + "",
                        ints[1] + "",
                        ints[2] + "",
                        data_from,
                        index.getStartSeq()+"",
                        i7BHisIndexTable.getHisDataType() + "").findLast(ProtoBuf_index_80.class);
                if(end_idx != null){
                    endSeq = end_idx.getEnd_idx();
                }
                com.socks.library.KLog.d("需要同步的80数据endSEQ= "+endSeq);
            }


            KLog.e("更新时间戳"+ints[0] +"--"+ ints[1]  +"--" + ints[2] +"--" + ints[3] +"--" + ints[4] +"--" + ints[5]);


            //index_80的需要同步的数据，和保存进数据库的内容不一致
            ProtoBuf_index_80 index_80 = new ProtoBuf_index_80();
            index_80.setYear(ints[0]);
            index_80.setMonth(ints[1]);
            index_80.setDay(ints[2]);
            index_80.setHour(ints[3]);
            index_80.setMin(ints[4]);
            index_80.setSecond(ints[5]);
            index_80.setTime(index.getSecond());
            index_80.setData_from(data_from);
            if (endSeq > 0 && endSeq <= index.getEndSeq()) {
                index_80.setStart_idx(endSeq);
            } else {
                index_80.setStart_idx(index.getStartSeq());
            }
            index_80.setEnd_idx(index.getEndSeq());
            index_80.setIndexType(i7BHisIndexTable.getHisDataType());
            if(index_80.getStart_idx()<index_80.getEnd_idx()){
                KLog.e("需要同步的80数据"+ index_80.getIndexType() +" // "+index_80.getStart_idx() +" // "+index_80.getEnd_idx());
                index_80s.add(index_80);
            }


            //保存到数据库是原始数据
            ProtoBuf_index_80 tb80 = new ProtoBuf_index_80();
            tb80.setYear(index_80.getYear());
            tb80.setMonth(index_80.getMonth());
            tb80.setDay(index_80.getDay());
            tb80.setHour(index_80.getHour());
            tb80.setMin(index_80.getMin());
            tb80.setSecond(index_80.getSecond());
            tb80.setTime(index_80.getTime());
            tb80.setData_from(data_from);
            tb80.setStart_idx(index.getStartSeq());
            tb80.setEnd_idx(index_80.getEnd_idx());
            tb80.setIndexType(index_80.getIndexType());
            tb80.saveOrUpdate("year=? and month=? and day=? and data_from=? and start_idx=? and indexType=?",
                    ints[0] + "",
                    ints[1] + "",
                    ints[2] + "",
                    data_from,
                    index.getStartSeq() + "",
                    i7BHisIndexTable.getHisDataType() + "");

            KLog.d(index_80.toString());
        }

        //排序
        Collections.sort(index_80s, new Comparator<ProtoBuf_index_80>() {
            @Override
            public int compare(ProtoBuf_index_80 index1, ProtoBuf_index_80 index2) {
                int i = index1.getYear() * 380 + index1.getMonth() * 31 + index1.getDay();
                int i2 = index2.getYear() * 380 + index2.getMonth() * 31 + index2.getDay();
                if (i > i2) {
                    return -1;
                } else if (i == i2) {
                    return 0;
                } else {
                    return 1;
                }
            }
        });

        return index_80s;

    }


    private int[] parseTime(long second) {
        int[] time = new int[6];
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(second * 1000);
        time[0] = calendar.get(Calendar.YEAR);
        time[1] = calendar.get(Calendar.MONTH) + 1;
        time[2] = calendar.get(Calendar.DAY_OF_MONTH);
        time[3] = calendar.get(Calendar.HOUR_OF_DAY);
        time[4] = calendar.get(Calendar.MINUTE);
        time[5] = calendar.get(Calendar.SECOND);
        return time;
    }


    private void syncFinish() {
        ProtoBuf_index_record record = DataSupport.where("time=?",String.valueOf(syncTimes)).findFirst(ProtoBuf_index_record.class);
        if(record!=null){
            record.setOver(1);
        }
        record.update(record.getId());

        ProtoBufSleepSqlUtils.dispSleepData();
        totalSeqList.clear();
        array.clear();
        if(typeArray.contains(GNSS_DATA)) {
            ProtoBufUpdate.getInstance().startUpdate(ProtoBufUpdate.Type.TYPE_GPS);
        }
    }


    public boolean isSync() {
        return isSync;
    }

    public void setSync(boolean sync) {
        isSync = sync;
    }


    public int currentProgress(int type, int seq) {
        int currentIndex = -1;
        String typeDesc = "";
        if (type == HEALTH_DATA) {
            typeDesc = " health ";
        } else if (type == GNSS_DATA) {
            typeDesc = "GPS";
        } else if (type == ECG_DATA) {
            typeDesc = "ECG";
        }else if (type == PPG_DATA) {
            typeDesc = "PPG";
        }else if (type == RRI_DATA) {
            typeDesc = "RRI";
        }else if(type == YYLPFE_DATA){
            typeDesc = "YYLPFE";
        }
        List<ProtobufSyncSeq> protobufSyncSeqs = totalSeqList.get(type);
        if(protobufSyncSeqs == null){
            return 0;
        }
        for (int i = 0; i < protobufSyncSeqs.size(); i++) {
            int startSeq = protobufSyncSeqs.get(i).getStartSeq();
            int endSeq = protobufSyncSeqs.get(i).getEndSeq();
            if (seq >= startSeq && seq <= endSeq) {
                currentIndex = i;
                break;
            }
        }
        if (currentIndex == -1) {
            return 0;
        }
        int progress = (seq - protobufSyncSeqs.get(currentIndex).getStartSeq() + 1) * 100 / protobufSyncSeqs.get(currentIndex).getTotalSeq();
        if (lastPosition != progress) {
            EventBus.getDefault().post(new SyncDataEvent(progress, false, protobufSyncSeqs.size(), protobufSyncSeqs.get(currentIndex).getCurrentDay(), typeDesc));
            lastPosition = progress;
        }
        return progress;
    }

    public void progressFinish() {
        //如果没有执行同步结束指令.执行结束
        if(isSync){
            hasData = false;
            EventBus.getDefault().post(new SyncDataEvent(100, true));
            isSync = false;
            KLog.e("80 data ----- progressFinish");
            syncFinish();
        }
    }



    public void stopSync() {
        isSync = false;
        for (int i = 0; i < typeArray.size(); i++) {
            byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().stopHisData(typeArray.get(i));
            BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(), bytes);
        }
    }


    private void saveIndexTable(int indexType, ProtoBuf_index_80 dbIndex) {
        if (indexType == GNSS_DATA) {
            DateUtil dateUtil = new DateUtil(dbIndex.getYear(), dbIndex.getMonth(), dbIndex.getDay());
            TB_mtk_statue mtk_statue = new TB_mtk_statue();
            mtk_statue.setUid(dbIndex.getUid());
            mtk_statue.setData_from(dbIndex.getData_from());
            mtk_statue.setType(80);
            mtk_statue.setYear(dbIndex.getYear());
            mtk_statue.setMonth(dbIndex.getMonth());
            mtk_statue.setDay(dbIndex.getDay());
            mtk_statue.setHas_file(2);
            mtk_statue.setHas_up(2);
            mtk_statue.setHas_tb(2);
            mtk_statue.setDate(dateUtil.getUnixTimestamp());
            mtk_statue.saveOrUpdate("uid=? and data_from=? and type=? and date=?",
                    dbIndex.getUid() + "", dbIndex.getData_from(), "80", dateUtil.getUnixTimestamp() + "");

        } else if (indexType == ECG_DATA) {
            TB_64_index_table indexTable = new TB_64_index_table();
            DateUtil d = new DateUtil(dbIndex.getYear(), dbIndex.getMonth(), dbIndex.getDay(), dbIndex.getHour(), dbIndex.getMin(), dbIndex.getSecond());
            indexTable.setUid(dbIndex.getUid());
            indexTable.setData_from(dbIndex.getData_from());
            indexTable.setData_ymd(d.getSyyyyMMddDate());
            indexTable.setSeq_start(dbIndex.getStart_idx());
            indexTable.setSeq_end(dbIndex.getEnd_idx());
            indexTable.setSync_seq(dbIndex.getEnd_idx());
            indexTable.setDate(d.getY_M_D_H_M_S());
            indexTable.setUnixTime(d.getUnixTimestamp());
            indexTable.saveOrUpdate("uid=? and data_from =? and date=?",
                    String.valueOf(dbIndex.getUid()), dbIndex.getData_from(), d.getY_M_D_H_M_S());
        }
    }


    /**
     * 将需要的同步类型数据加到集合中
     * 需要先同步什么数据类型可自行添加顺序
     * @return
     */
    private List<Integer> getTypeArray(PbSupportInfo protoBufSupportInfo){
        List<Integer> integers = new ArrayList<>();
        if(protoBufSupportInfo.isSupport_yylpfe()){
            integers.add(YYLPFE_DATA);
        }

        if(protoBufSupportInfo.isSupport_health()){
            integers.add(HEALTH_DATA);
        }
        if(protoBufSupportInfo.isSupport_gnss()){
            integers.add(GNSS_DATA);
        }
        if(protoBufSupportInfo.isSupport_ecg()){
            integers.add(ECG_DATA);
        }
        if(protoBufSupportInfo.isSupport_ppg()){
            integers.add(PPG_DATA);
        }
        if(protoBufSupportInfo.isSupport_rri()){
            integers.add(RRI_DATA);
        }
        if(protoBufSupportInfo.isSupport_spo2()){
            integers.add(SPO2_DATA);
        }

        return integers;
    }

    private List<Integer> getTypeArray(PbSupportInfo protoBufSupportInfo,int type){
        List<Integer> integers = new ArrayList<>();
        switch (type){
            case HEALTH_DATA:
                if(protoBufSupportInfo.isSupport_health()){
                    integers.add(HEALTH_DATA);
                }
                break;
            case GNSS_DATA:
                if(protoBufSupportInfo.isSupport_gnss()){
                    integers.add(GNSS_DATA);
                }
                break;
            case ECG_DATA:
                if(protoBufSupportInfo.isSupport_ecg()){
                    integers.add(ECG_DATA);
                }
                break;
            case PPG_DATA:
                if(protoBufSupportInfo.isSupport_ppg()){
                    integers.add(PPG_DATA);
                }
                break;
            case RRI_DATA:
                if(protoBufSupportInfo.isSupport_rri()){
                    integers.add(RRI_DATA);
                }
                break;
            case SWIM_DATA:
//                if(protoBufSupportInfo.isSupport_swim()){
                    integers.add(SWIM_DATA);
//                }
                break;
                default:
                    break;
        }

        return integers;
    }

}
