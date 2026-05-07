package com.zeroner.bledemo.data.sync;


import android.os.Handler;
import android.os.Looper;

import com.zeroner.bledemo.BleApplication;
import com.zeroner.bledemo.bean.sql.TB_f1_index;
import com.zeroner.bledemo.eventbus.SyncDataEvent;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.MtkSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.library.KLog;
import com.zeroner.blemidautumn.task.BackgroundThreadManager;

import org.greenrobot.eventbus.EventBus;

import java.util.LinkedList;

import coms.mediatek.ctrl.epo.EpoDownloadChangeListener;
import coms.mediatek.ctrl.epo.EpoDownloadController;

/**
 * @author Gavin
 * @date 2020-04-02
 **
 * 61,62当成1种类型同步数据，逻辑上硬处理,烦
 * 6b协议-> 发送61返回6b，然后在发送 6b的index
 */
public class MtkBleSync implements EpoDownloadChangeListener {

    private static MtkBleSync instance;
    private static final int SYNC_TIME_OUT = 7000;
    private static final int SYNC_FIRST_TIME_OUT = 14000;
    private static Handler mHandler = new Handler(Looper.getMainLooper());

    /** 是否正在同步数据 */
    private boolean syncing;
    /** 升级agps */
    private long upAgpsTime = 0;

    /** 当前指令同步应该到达的最后一条seq*/
    private int needSyncLastSeq;

    private int lastProgress = -1;

    private LinkedList<TB_f1_index> f1IndexList = new LinkedList<>();
    /** 需要同步数据的种类(61,62,64,6a等)*/
    private LinkedList<Integer> dateTypeList = new LinkedList<>();

    /**
     * 收到一条一条的具体数据
     */
    private int oneDayAllNum = 0;
    private int nowOneDayNum = 0;

    /** 一种类型的需要同步的天数-（4条数据天数可能为3） */
    private int typeDayNum = 1;
    /** 一种类型已同步的天数 */
    private int typeHasDayNum = 0;
    private boolean isUpAgpsBeforeSync;
    private boolean hasCheckEpo3Day = false;


    public enum SyncDeviceType{
        /**
         * P1_61 含有61类型的手表
         * EARPHONE_68 耳机
         * P1_6A 含有6A类型的手表
         **/
        P1_61,
        EARPHONE_68,
        P1_6B
    }


    private MtkBleSync(){

    }

    public static MtkBleSync getInstance() {
        if (instance == null) {
            synchronized (MtkBleSync.class) {
                if (instance == null) {
                    instance = new MtkBleSync();
                }
            }
        }
        return instance;
    }

    /**
     * 同步数据
     * @return false 已经在同步数据，true开始同步数据
     */
    public boolean syncData(){
        if(syncing || isUpAgps()){
         return false;
        }
        EpoDownloadController.addListener(this);
        clearData();
        syncing = true;
//        if(PrefUtil.getInt(BleApplication.getInstance(), BaseActionUtils.SharedPreferencesAction.EARPHONE)==1){
//            EventBus.getDefault().post(new SyncDataEvent());
//            initDataType(SyncDeviceType.EARPHONE_68);
//            getSyncNextOneType(true);
//        }else {
            sync60Data();
//            initDataType(SyncDeviceType.P1_61);
            return checkEpo3Day();
//        }
        
//        return true;
    }

    private void beginSyncP1(){
        EventBus.getDefault().post(new SyncDataEvent());
        initDataType(SyncDeviceType.P1_61);
        getSyncNextOneType(true);
    }

    /**
     * 获取60总数据，无需关心是否返回
     */
    public void sync60Data(){
        MtkSendBluetoothCmdImpl.getInstance(BleApplication.getInstance()).dailyHealthDataSwitch(true);
    }

    /**
     * 初始化需要同步数据的类型(61,62合并)
     * 61,62,64,68
     */
    private void initDataType(SyncDeviceType deviceType){
        dateTypeList.clear();
        if(deviceType == SyncDeviceType.P1_61) {
            dateTypeList.add(0x61);
        }else if(deviceType == SyncDeviceType.EARPHONE_68){
            dateTypeList.add(0x68);
        }
        BackgroundThreadManager.getInstance().wakeUp();
    }

    public void addDataType(SyncDeviceType deviceType){
        KLog.i("mtk-sync- 初始化获取的index");
        if(deviceType == SyncDeviceType.P1_6B){
            dateTypeList.add(0x6b);
            dateTypeList.add(0x6a);
            dateTypeList.add(0x6c);
            dateTypeList.add(0x62);
            dateTypeList.add(0x64);
        }else if(deviceType == SyncDeviceType.P1_61){
            dateTypeList.add(0x62);
            dateTypeList.add(0x64);
        }
    }


    /** 61，62数据合并一天同步先加载进列表
     * 需保证 61的列表已添加进f1IndexList
     **/
    private void init6162Index(LinkedList<TB_f1_index> dataList){
        if(dataList.size()>0){
            typeHasDayNum = 0;
            typeDayNum = 0;
            if(f1IndexList.size()>0){
                LinkedList<TB_f1_index> dex61And62 = new LinkedList<>();
                for (int i = 0; i < f1IndexList.size() - 1; i++) {
                    String nowDate = f1IndexList.get(i).getDate();
                    //一天可能存在多条索引index
                    if(nowDate.equalsIgnoreCase(f1IndexList.get(i+1).getDate())){
                        f1IndexList.get(i).setHasNext(true);
                        dex61And62.add(f1IndexList.get(i));
                        continue;
                    }else{
                        typeDayNum++;
                        if( dataList.size()>0 && dataList.getFirst().getDate().equalsIgnoreCase(nowDate)){
                            //将62的添加相同一天的61数据后面
                            f1IndexList.get(i).setHasNext(true);
                            dex61And62.add(f1IndexList.get(i));
                            dex61And62.add(dataList.getFirst());
                            dataList.removeFirst();
                        }else{
                            dex61And62.add(f1IndexList.get(i));
                        }
                    }
                }
                typeDayNum++;
                dex61And62.add(f1IndexList.getLast());
                if(dataList.size()>0) {
                    dex61And62.addAll(dataList);
                    typeDayNum += dataList.size();
                }
                f1IndexList.clear();
                f1IndexList.addAll(dex61And62);
            }else{
                //62数据前面没有61数据
                typeDayNum = dataList.size();
                f1IndexList.addAll(dataList);

            }

        }
        syncOneData(true);
    }

    private void count61Days(){
        //重新计算61的天数，防止睡眠计算第一次计算有误
        typeHasDayNum = 0;
        typeDayNum = 0;
        if(f1IndexList.size()>0){
            for (int i = 0; i < f1IndexList.size() - 1; i++) {
                String nowDate = f1IndexList.get(i).getDate();
                //一天可能存在多条索引index
                if (nowDate.equalsIgnoreCase(f1IndexList.get(i + 1).getDate())) {
                    f1IndexList.get(i + 1).setHasNext(true);
                    continue;
                }else{
                    typeDayNum++;
                }
            }
            typeDayNum++;
        }
    }

    private boolean getSyncNextOneType(boolean isFirst){
        if(dateTypeList.size()>0) {
            beginTimeOut(isFirst);
            KLog.i("mtk-sync开始同步时局 "+dateTypeList.getFirst() + " size: "+dateTypeList.size());
            MtkSendBluetoothCmdImpl.getInstance(BleApplication.getInstance()).getIndexTableAccordingType(dateTypeList.getFirst());
            dateTypeList.removeFirst();
            KLog.i("mtk-sync开始同步时局移除后  size: "+dateTypeList.size());
            return true;
        }else{
            return false;
        }
    }

    /**
     * 获取到的index索引表后开始同步具体数据
     * - 获取到61的索引后继续获取62的索引
     * - 其他类型数据则获取到索引后直接同步相应的具体数据
     * @param dataList 一定要是按时间倒序排序的
     * */
    public void getOneTypeIndexResult(int type,LinkedList<TB_f1_index> dataList){
        KLog.i("mtk-sync- 返回的Index: "+ type);
        beginTimeOut(false);
        if(dataList==null){
            dataList = new LinkedList<>();
        }
        if(type == 0x62){
            init6162Index(dataList);
        }else if(type == 0x61){
            f1IndexList.addAll(dataList);
            count61Days();
            //获取到61的索引后，继续获取62的索引
            getSyncNextOneType(false);
        }else if(type == 0x6b){
            f1IndexList.addAll(dataList);
            count61Days();
            syncOneData(true);
        }else{
            f1IndexList.addAll(dataList);
            typeHasDayNum = 0;
            typeDayNum = dataList.size()>0?dataList.size():1;
            syncOneData(true);
        }

    }

    /**
     * 同步某一种类型的数据(61,62合并在一起,64,6A,6B)
     * @param needClearNum 是否清除一天的计数数据（默认为true）
     */
    private void syncOneData(boolean needClearNum){
        KLog.i("mtk-sync-syncOneData: "+typeDayNum+" = "+typeHasDayNum +" - "+needClearNum);
        if(needClearNum){
            oneDayAllNum = 0;
            nowOneDayNum = 0;
            typeHasDayNum++;
            lastProgress = -1;
        }

        if(f1IndexList.size()>0){
            TB_f1_index f1_index = f1IndexList.getFirst();
            KLog.i("mtk-sync:seq "+f1_index.getSendStartSeq()+" = "+f1_index.getEnd_seq());
            if(oneDayAllNum == 0){
                //同步下一天的数据时一定要保证oneDayAllNum=0
                if(f1_index.isHasNext()){
                    for (TB_f1_index tb_f1_index : f1IndexList) {
                        oneDayAllNum += tb_f1_index.getTotalSeq();
                        if(!tb_f1_index.isHasNext()){
                            break;
                        }
                    }
                }else{
                    oneDayAllNum = f1_index.getTotalSeq();
                }
            }

            needSyncLastSeq = f1_index.getEnd_seq() - 1;
                DateUtil dateUtil = new DateUtil(f1_index.getTime(),true);
                MtkSendBluetoothCmdImpl.getInstance(BleApplication.getInstance()).
                        getDetailDataAsIndex(dateUtil.getYear(),dateUtil.getMonth(),
                                dateUtil.getDay(),
                                f1_index.getSendStartSeq(),
                                f1_index.getEnd_seq_index(),
                                f1_index.getType_int());
        }else{
            if(!getSyncNextOneType(false)){
                //没有数据可同步，同步结束
                syncFinish();
            }
        }


    }


    /**
     * 收到一条一条的具体数据
     * @param type 返会的数据类型
     * @param seq 返回的seq
     */
    public boolean receivePracticalResult(int type,int seq){
        boolean hasChangeProgress = calculateProgress( type);

        if(hasChangeProgress){
//            AwLog.i(Author.GuanFengJun,"mtk-sync-pro: "+lastProgress+" = "+seq+" - "+needSyncLastSeq);
            beginTimeOut(false);
        }

        if(needSyncLastSeq == seq){
            lastProgress =100;
            //一段index已接收完毕
            KLog.i("mtk-sync-同步下一条数据 "+lastProgress);
            sendNextInstruct();
            return true;
        }else{
            return false;
        }
    }

    private void beginTimeOut(boolean isFirst){

        mHandler.removeCallbacks(syncTimeOutRunnable);
        if(isFirst) {
            //第一次可能会出现还在接受其他类型数据，多给一点超时时间
            mHandler.postDelayed(syncTimeOutRunnable, SYNC_FIRST_TIME_OUT);
        }else{
            //第一次可能会出现还在接受其他类型数据，多给一点超时时间
            mHandler.postDelayed(syncTimeOutRunnable, SYNC_TIME_OUT);
        }
    }

    /**
     * 计算百分比
     */
    private boolean calculateProgress(int type){
        nowOneDayNum++;
        int progress = nowOneDayNum*100/oneDayAllNum;
        if(lastProgress != progress){
            lastProgress = progress;

            //主页刷新ui
            EventBus.getDefault().post(new SyncDataEvent(progress, false, typeDayNum, typeHasDayNum, String.valueOf(type)+"-"));
            return true;
        }else{
            if(progress==100){
                //防止意外发生
                return true;
            }
            return false;
        }
    }


    public boolean isUpAgps(){
        return System.currentTimeMillis()/1000-upAgpsTime < 10;
    }

    private void clearData() {
        syncing = false;
        lastProgress = -1;
        f1IndexList.clear();
        dateTypeList.clear();
        oneDayAllNum = 1;
        nowOneDayNum = 0;
        typeDayNum = 1;
        typeHasDayNum = 0;
        mHandler.removeCallbacks(syncTimeOutRunnable);
    }

    /**
     * 此方法需要同步过具体数据上来
     */
    private void sendNextInstruct(){
        if (!BluetoothUtil.isConnected() || !SuperBleSDK.isMtk(BleApplication.getInstance())) {
            syncing = false;
            clearData();
            EventBus.getDefault().post(new SyncDataEvent(100, true));
            return;
        }

        if(f1IndexList.size() == 0){
            //说明index 内容没有回应
            if(!getSyncNextOneType(false)){
                //没有数据可同步，同步结束
                syncFinish();
            }
            return;
        }

        int mProgress = lastProgress;

        //同步完61，后面紧跟62情况或一天有多条61Index
        TB_f1_index firstIndex  = f1IndexList.getFirst();
        boolean hasNext = firstIndex.hasNext;
        if(hasNext){
            int newTotalNum = firstIndex.getTotalSeq();
            mProgress = nowOneDayNum*100/newTotalNum;
        }
        //防止有漏几条数据 ，则也认为同步数据完成
        if(mProgress >=99){
            updateStatus(firstIndex);
        }

        beginTimeOut(false);
        f1IndexList.removeFirst();
        if(f1IndexList.size()>0){
//            boolean needClear = !hasNext ||
            syncOneData(!hasNext);
        }else{
            if(!getSyncNextOneType(false)){
                //没有数据可同步，同步结束
                syncFinish();
            }
        }

    }

    private void syncFinish() {
        EventBus.getDefault().post(new SyncDataEvent(100, true));
        clearData();
        upgradeEpo(false);
    }


    Runnable syncTimeOutRunnable = new Runnable() {
        @Override
        public void run() {
            KLog.i("mtk-sync-超时同步下一条数据 "+lastProgress);
            sendNextInstruct();

        }
    };

    private void updateStatus(TB_f1_index f1_index) {
        f1_index.setOk(1);
        f1_index.update(f1_index.getId());
    }

    private void checkAgpsTimeout(boolean isFirst){
        if(isUpAgps() || isFirst){
            mHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    KLog.i("mtk-sync epo超时检测");
                    checkAgpsTimeout(false);
                }
            },10*1000);
        }else{
            syncing = false;
        }
    }

    @Override
    public void notifyProgressChanged(float v) {
        if(v<0.01){
            KLog.i("epo开始写入");
            setUpEpo(true);
        }else if(v>=1){
            setUpEpo(false);
            KLog.i("epo写入完成");
            if(isUpAgpsBeforeSync){
                isUpAgpsBeforeSync = false;
                beginSyncP1();
            }
        }else{
            setUpEpo(true);
            KLog.i("epo 进度" + (int)v * 100);
        }
    }

    @Override
    public void notifyDownloadResult(int i) {
        KLog.i("epo相关操作 result -> "+i);
    }

    @Override
    public void notifyConnectionChanged(int i) {
        KLog.i("epo相关操作 Changed -> "+i);
    }

    private String mDeviceName;
    private boolean checkEpo3Day(){
        isUpAgpsBeforeSync = false;
        mDeviceName = PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME) + "";
        boolean epoOut = upgradeEpo(true);
        KLog.i("mtk-sync- epoOut: "+epoOut);
        if(!epoOut){
            beginSyncP1();
        }else{
            isUpAgpsBeforeSync = true;
        }
        return !epoOut;
    }

    /**
     *
     * @param isCheck3Day 是否检查太久没有升级agps
     * @return true-超过3天没有升级过agps false-3天内升级过agps
     */
    private boolean upgradeEpo(boolean isCheck3Day){

        String lastEpo = "";

        if(isCheck3Day){
            if(hasCheckEpo3Day){
                return false;
            }
            hasCheckEpo3Day = true;

            return false;
        }
        return false;
    }

    public void setUpEpo(boolean isUpEpo){
        if(isUpEpo){
            upAgpsTime = System.currentTimeMillis()/1000;
        }else{
            //epo升级完成
            syncing = false;
            upAgpsTime = 0;
        }
    }

    public void upAgpsBeforeSync(boolean yes){
        if(yes){
            upgradeEpo(false);
        }else{
            beginSyncP1();
        }
    }

    public void stopSync() {
        clearData();
        mHandler.removeCallbacks(syncTimeOutRunnable);
        MtkSendBluetoothCmdImpl.getInstance(BleApplication.getInstance()).stopSyncDetailData(0x61, 0x62, 0x64);
    }

    public boolean isSyncing() {
        return syncing;
    }

    public void setSyncing(boolean syncing) {
        this.syncing = syncing;
    }
}
