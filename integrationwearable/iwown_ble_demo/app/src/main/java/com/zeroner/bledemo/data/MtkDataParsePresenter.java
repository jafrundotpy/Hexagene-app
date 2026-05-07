package com.zeroner.bledemo.data;

import android.content.Context;
import android.os.Environment;
import android.os.Looper;
import android.text.TextUtils;

import com.google.gson.Gson;
import com.zeroner.bledemo.BleApplication;
import com.zeroner.bledemo.bean.sql.DailyData;
import com.zeroner.bledemo.bean.sql.DataIndex_68;
import com.zeroner.bledemo.bean.sql.RawData68;
import com.zeroner.bledemo.bean.sql.TB_60_data;
import com.zeroner.bledemo.bean.sql.TB_61_data;
import com.zeroner.bledemo.bean.sql.TB_62_data;
import com.zeroner.bledemo.bean.sql.TB_64_data;
import com.zeroner.bledemo.bean.sql.TB_68_data;
import com.zeroner.bledemo.bean.sql.TB_f1_index;
import com.zeroner.bledemo.bean.sql.TB_mtk_statue;
import com.zeroner.bledemo.bean.sql.TB_rri_data;
import com.zeroner.bledemo.data.sync.Ble68DataParse;
import com.zeroner.bledemo.data.sync.BleIndexDataParse;
import com.zeroner.bledemo.data.sync.LongitudeAndLatitude;
import com.zeroner.bledemo.data.sync.MTKHeadSetSync;
import com.zeroner.bledemo.data.sync.MtkBleSync;
import com.zeroner.bledemo.data.sync.MtkDataToServer;
import com.zeroner.bledemo.data.sync.MtkToIvHandler;
import com.zeroner.bledemo.eventbus.DialChooseEvent;
import com.zeroner.bledemo.eventbus.DialProgressEvent;
import com.zeroner.bledemo.eventbus.Event;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.JsonUtils;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK;
import com.zeroner.blemidautumn.bluetooth.model.ECG_Data;
import com.zeroner.blemidautumn.bluetooth.model.FMdeviceInfo;
import com.zeroner.blemidautumn.bluetooth.model.GnssMinData;
import com.zeroner.blemidautumn.bluetooth.model.HealthDailyData;
import com.zeroner.blemidautumn.bluetooth.model.HealthMinData;
import com.zeroner.blemidautumn.bluetooth.model.HealthNewMinData;
import com.zeroner.blemidautumn.bluetooth.model.IWBleParams;
import com.zeroner.blemidautumn.bluetooth.model.IWDevSetting;
import com.zeroner.blemidautumn.bluetooth.model.IWUserInfo;
import com.zeroner.blemidautumn.bluetooth.model.KeyModel;
import com.zeroner.blemidautumn.bluetooth.model.MtkRriData;
import com.zeroner.blemidautumn.bluetooth.model.Power;
import com.zeroner.blemidautumn.bluetooth.model.ProductInfo;
import com.zeroner.blemidautumn.bluetooth.model.ProtoCustomCode;
import com.zeroner.blemidautumn.bluetooth.model.R1HealthMinuteData;
import com.zeroner.blemidautumn.library.KLog;
import com.zeroner.blemidautumn.utils.JsonTool;

import org.greenrobot.eventbus.EventBus;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;


/**
 * Created by admin on 2017/11/25.
 */

public class MtkDataParsePresenter {

   private static String TAG = "MtkDataParsePresenter";
    private static android.os.Handler mHandler = new android.os.Handler(Looper.getMainLooper());
    public static final int Type = com.zeroner.blemidautumn.Constants.Bluetooth.Zeroner_Mtk_Sdk;
    static ExecutorService fixedThreadPool = Executors.newFixedThreadPool(3);
    private static int[] months=new int[3];
    private  static Gson mGson = new Gson();

    private static String DATA62_FILE_PATH = SuperBleSDK.getInstance().getContext().getExternalFilesDir(null).getAbsolutePath() +"/Zeroner/zeroner_5_0/blelog/62_data/";
    private static String DATA62_FILE_DIR_PATH = "/Zeroner/zeroner_5_0/blelog/62_data/";

    public static Map<String,Integer> map62 = new HashMap<>();

    private static String model = "";
    private static String swversion = "";
    private static boolean isTwo;

    private static Context mContext;

    public static final long TestUid = 12345L;


    /**
     * @param context 上下文
     * @param dataType sdk type
     * @param data ble数据
     */
    public static void parseProtoclData(Context context, int dataType, String data) {
        mContext = context.getApplicationContext();

        KLog.d(TAG, "数据接收：0x" + Integer.toHexString(dataType));
        KLog.d(TAG, "数据接收："+ data);
//
        switch (dataType) {
            case 0x00:
                FMdeviceInfo info = mGson.fromJson(data, FMdeviceInfo.class);
                model =info.getModel();
                swversion = info.getSwversion();
                PrefUtil.save(context, BaseActionUtils.Action_device_FirmwareInfo,data);
                PrefUtil.save(context,BaseActionUtils.Action_device_Model,model);
                PrefUtil.save(context,BaseActionUtils.Action_device_version,info.getSwversion());
                break;

            case 0x01:
                Power mPower=mGson.fromJson(data,Power.class);
                String power=String.valueOf(mPower.getPower());
                PrefUtil.save(context, BaseActionUtils.Action_device_Battery,  power);


                HashMap<String,Object> dataMap=new HashMap<>();
                dataMap.put(Event.Ble_Connect_Statue,true);
                EventBus.getDefault().post(new Event(Event.Ble_Connect_Statue,dataMap));
                break;
            case 0x40:
                KeyModel keyModel = mGson.fromJson(data, KeyModel.class);
                break;
            case 0x19: {
                IWDevSetting setting = mGson.fromJson(data, IWDevSetting.class);
                PrefUtil.save(context, BaseActionUtils.Action_device_Settings,data);
                break;
            }
            case 0x0b:
                ProductInfo productInfo = mGson.fromJson(data, ProductInfo.class);
                PrefUtil.save(context,BaseActionUtils.Action_device_Sn,productInfo.getSn());
                break;
            case 0x13:
                //23 FF 13 06 91 00 00 00 00 00
                IWBleParams params=mGson.fromJson(data,IWBleParams.class);
                break;
            case 0x60:
                parse60Data(context.getApplicationContext(), data);
                break;
            case 0x61:
                parse61Data(context,data);
                break;
            case 0x62:
                parse62Data(context,data);
                break;
            case 0x6a:
                parse6aData(context,data);
                break;
            case 0x6b:
                parse6bData(context,data);
                break;
            case 0x6c:
                parse6cData(context, data);
                break;
            case 0x64:
                parse64Data(context,data);
                break;
            case 0x68:
                parse68Data(context,data);
                break;
            case 0x2f:
                if(data != null && !"".equals(data)) {
                    ProtoCustomCode protoCustomCode = JsonTool.fromJson(data, ProtoCustomCode.class);
                    /**
                     * read
                     */
                    if(protoCustomCode.getCode() == 1){
                        DialChooseEvent event = new DialChooseEvent();
                        boolean retType = protoCustomCode.isRetType();
                        if(retType && protoCustomCode.getGroup() != null && protoCustomCode.getGroup().size() > 0) {
                            event.dialIndex = protoCustomCode.getGroup().get(0).getDialIndex();
                            EventBus.getDefault().post(event);
                        }
                    }
                    /**
                     * write
                     */
                    else if(protoCustomCode.getCode() == 0){
                        DialProgressEvent progressEvent = new DialProgressEvent(0);
                        progressEvent.setOk(true);
                        EventBus.getDefault().post(progressEvent);
                    }else if(protoCustomCode.getCode() == 2){
                        //清除指令回应
                        DialProgressEvent progressEvent = new DialProgressEvent(true);
                        EventBus.getDefault().post(progressEvent);
                    }

                }
                break;
            default:
                break;

            }

            KLog.i("data : " + data);
        }


    private static void parse64Data(Context context, final String data) {

        int ctrl64 = 0;
        try {
            ctrl64 = JsonUtils.getInt(data, "ctrl");
        } catch (Exception e) {
            ctrl64 = -100;
            e.printStackTrace();
        }

        final String from=PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
        if (ctrl64 == 0) {
            fixedThreadPool.submit(new Runnable() {
                @Override
                public void run() {
                    LinkedList<TB_f1_index> f1_indices = new BleIndexDataParse().parseIndexData(0x64,data,TestUid,from);
                    MtkBleSync.getInstance().getOneTypeIndexResult(0x64,f1_indices);
                }
            });
        } else {
            fixedThreadPool.submit(new Runnable() {
                @Override
                public void run() {
                    mHandler.removeCallbacks(sync61Runnable);
                    ECG_Data cmd64 = new Gson().fromJson(data, ECG_Data.class);
                    TB_64_data tb_data = new TB_64_data();
                    tb_data.setUid(TestUid);
                    tb_data.setData_from(from);
                    tb_data.setSeq(cmd64.getSeq());
                    tb_data.setYear(cmd64.getYear());
                    tb_data.setMonth(cmd64.getMonth());
                    tb_data.setDay(cmd64.getDay());
                    tb_data.setHour(cmd64.getHour());
                    tb_data.setSecond(cmd64.getSecond());
                    tb_data.setMin(cmd64.getMin());
                    tb_data.setEcg(new Gson().toJson(cmd64.getEcg_raw_data()));
                    DateUtil dateUtil = new DateUtil(cmd64.getYear(), cmd64.getMonth(), cmd64.getDay(), cmd64.getHour(), cmd64.getMin(), cmd64.getSecond());
                    tb_data.setTime(dateUtil.getUnixTimestamp());
                    tb_data.saveOrUpdate("uid=? and data_from=?  and year=? and month=? and day=? and hour=? and min=? and second=? and seq=?"
                            , String.valueOf(TestUid)
                            , String.valueOf(from)
                            , String.valueOf(tb_data.getYear())
                            , String.valueOf(tb_data.getMonth())
                            , String.valueOf(tb_data.getDay())
                            , String.valueOf(tb_data.getHour())
                            , String.valueOf(tb_data.getMin())
                            , String.valueOf(tb_data.getSecond())
                            , String.valueOf(tb_data.getSeq())
                    );

                    boolean isFinish = MtkBleSync.getInstance().receivePracticalResult(0x62,tb_data.getSeq());
                    if(isFinish){
                        mHandler.post(sync61Runnable);
                    }else {
                        mHandler.postDelayed(sync61Runnable, 10000);
                    }
                }
            });
        }
    }


    private static void parse62Data(final Context context, final String data) {
        int ctrl62 = JsonUtils.getInt(data, "ctrl");
        final String from=PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
        if (ctrl62 == 0) {
            fixedThreadPool.submit(new Runnable() {
                @Override
                public void run() {
                    LinkedList<TB_f1_index> f1_indices = new BleIndexDataParse().parse62IndexData(data,TestUid,from);
                    MtkBleSync.getInstance().getOneTypeIndexResult(0x62,f1_indices);
                }
            });
        } else {
            fixedThreadPool.submit(new Runnable() {
                @Override
                public void run() {
                    mHandler.removeCallbacks(sync61Runnable);
                    GnssMinData ble62DataParse = new Gson().fromJson(data, GnssMinData.class);
                    int year = ble62DataParse.getYear();
                    int month = ble62DataParse.getMonth();
                    int day = ble62DataParse.getDay();
                    DateUtil date = new DateUtil(year, month, day);
                    String key = 2 + "_" + date.getYyyyMMddDate();
                    TB_62_data cmd62 = new TB_62_data();
                    cmd62.setUid(TestUid);
                    cmd62.setData_from(from);
                    cmd62.setCtrl(ble62DataParse.getCtrl());
                    cmd62.setSeq(ble62DataParse.getIndex());
                    cmd62.setYear(ble62DataParse.getYear());
                    cmd62.setMonth(ble62DataParse.getMonth());
                    cmd62.setDay(ble62DataParse.getDay());
                    cmd62.setHour(ble62DataParse.getHour());
                    cmd62.setMin(ble62DataParse.getMin());
                    cmd62.setFreq(ble62DataParse.getFreq());
                    cmd62.setNum(ble62DataParse.getNum());
                    cmd62.setCmd(ble62DataParse.getCmd());
                    //存入时间戳
                    DateUtil date62 = new DateUtil(cmd62.getYear(), cmd62.getMonth(), cmd62.getDay(), cmd62.getHour(), cmd62.getMin(), 0);
                    cmd62.setTime(date62.getTimestamp());

                    List<GnssMinData.Gnss> gnssDatas = ble62DataParse.getmGnssMinDataList();
                    List<LongitudeAndLatitude> laData = new ArrayList<>();
                    for (GnssMinData.Gnss gnssData : gnssDatas) {
                        LongitudeAndLatitude la = new LongitudeAndLatitude();
                        la.setLatitude(gnssData.getLatitude());
                        la.setLongitude(gnssData.getLongitude());
                        la.setAltitude(gnssData.getAltitude());
                        la.setGps_speed(gnssData.getGps_speed());
                        laData.add(la);
                    }
                    cmd62.setGnssData(new Gson().toJson(laData));
                    if (cmd62.getYear() - 2000 == 0xff && cmd62.getMonth() - 1 == 0xff && cmd62.getDay() - 1 == 0xff && cmd62.getHour() == 0xff && cmd62.getMin() == 0xff) {
                        return;
                    }

                    if(!map62.containsKey(date62.getSyyyyMMddDate())){
                        addTB62Mtk(date62);
                        map62.put(date62.getSyyyyMMddDate(),1);
                    }
                    cmd62.saveOrUpdate("uid=? and seq=? and year =? and month=? and day=? and hour=? and min=?"
                            , String.valueOf(TestUid)
                            , String.valueOf(cmd62.getSeq())
                            , String.valueOf(cmd62.getYear())
                            , String.valueOf(cmd62.getMonth())
                            , String.valueOf(cmd62.getDay())
                            , String.valueOf(cmd62.getHour())
                            , String.valueOf(cmd62.getMin()));
                    boolean isFinish = MtkBleSync.getInstance().receivePracticalResult(0x62,cmd62.getSeq());
                    if (isFinish) {
                        mHandler.post(sync61Runnable);
                    }
                    mHandler.postDelayed(sync61Runnable, 10000);

                }
            });
        }
    }

    /**
     * 调用此方法说明62总数据和分数据不一致
     */
    private static void addTB62Mtk(DateUtil dateUtil1){
        DateUtil dateUtil = new DateUtil(dateUtil1.getYear(),dateUtil1.getMonth(),dateUtil1.getDay());
        KLog.file("62总数据与分数据异常，"+dateUtil.getSyyyyMMddDate());
        TB_mtk_statue mtk_statue = new TB_mtk_statue();
        mtk_statue.setUid(TestUid);
        mtk_statue.setData_from(getDataFrom());
        mtk_statue.setType(62);
        mtk_statue.setYear(dateUtil.getYear());
        mtk_statue.setMonth(dateUtil.getMonth());
        mtk_statue.setDay(dateUtil.getDay());
        mtk_statue.setHas_file(2);
        mtk_statue.setHas_up(2);
        mtk_statue.setHas_tb(2);
        mtk_statue.setDate(dateUtil.getUnixTimestamp());
        mtk_statue.saveOrUpdate("uid=? and data_from=? and type=? and date=?",
                TestUid+"",getDataFrom(),"62",dateUtil.getUnixTimestamp()+"");
    }

    private static void parse60Data(Context context, String data) {
        String datafrom=SuperBleSDK.createInstance(context).getWristBand().getName()+"";
        HealthDailyData ble60DataParse=new Gson().fromJson(data, HealthDailyData.class);
        com.socks.library.KLog.i("ble60DataParse"+ble60DataParse.toString());
        TB_60_data cmd_60=new TB_60_data();
        cmd_60.setData_from(datafrom);
        cmd_60.setYear(ble60DataParse.getYear());
        cmd_60.setMonth(ble60DataParse.getMonth());
        cmd_60.setDay(ble60DataParse.getDay());
        cmd_60.setData_type(ble60DataParse.getData_type());
        cmd_60.setSteps(ble60DataParse.getSteps());
        cmd_60.setCalorie(ble60DataParse.getCalorie());
        cmd_60.setDistance(ble60DataParse.getDistance());
        cmd_60.setAvg_bpm(ble60DataParse.getAvg_bpm());
        cmd_60.setMax_bpm(ble60DataParse.getMax_bpm());
        cmd_60.setMin_bpm(ble60DataParse.getMin_bpm());
        cmd_60.setAvg_bpm(ble60DataParse.getAvg_bpm());
        cmd_60.setLevel(ble60DataParse.getLevel());
        cmd_60.setSdnn(ble60DataParse.getSdnn());
        cmd_60.setLf(ble60DataParse.getLf());
        cmd_60.setHf(ble60DataParse.getHf());
        cmd_60.setLf_hf(ble60DataParse.getLf_hf());
        cmd_60.setBpm_hr(ble60DataParse.getBpm_hr());
        cmd_60.setSbp(ble60DataParse.getSbp());
        cmd_60.setDbp(ble60DataParse.getDbp());
        cmd_60.setBpm(ble60DataParse.getBpm());

        cmd_60.saveOrUpdate("data_from=? and year=? and month=? and day=? "
                ,datafrom
                ,String.valueOf(cmd_60.getYear())
                ,String.valueOf(cmd_60.getMonth())
                ,String.valueOf(cmd_60.getDay()));


        DailyData dailyData=new DailyData();
        DateUtil date=new DateUtil(cmd_60.getYear(),cmd_60.getMonth(),cmd_60.getDay());
        dailyData.setTimeStamp((int) date.getUnixTimestamp());
        dailyData.setData_from(PrefUtil.getString(context,BaseActionUtils.ACTION_DEVICE_NAME));
        dailyData.setDate(date.getSyyyyMMddDate());
        dailyData.setSteps(cmd_60.getSteps());
        dailyData.setCalories(cmd_60.getCalorie());
        dailyData.setDistance(cmd_60.getDistance());
        dailyData.saveOrUpdate("date=? and data_from=?",date.getSyyyyMMddDate(),PrefUtil.getString(context,BaseActionUtils.ACTION_DEVICE_ADDRESS));
    }

    private static void Data61ToOther(long uid, int year, int month, int day, String dataFrom) {
        List<TB_61_data> list = MtkToIvHandler.sort61DataBySeq(year, month, day, dataFrom);
        MtkToIvHandler.mtk61DataToHeartBle(uid, year, month, day, dataFrom, list);
//        MtkToIvHandler.fatigueDataToIv(uid, year, month, day, dataFrom, list);
        MtkToIvHandler.sportAnd51HeartDataToIv(year, month, day);
//        MtkToIvHandler.saveGpsToBlue(uid,dataFrom,year,month,day);
//        MtkToIvHandler.mtk61DataToBloodData(uid, year, month, day, dataFrom, list);
        MtkToIvHandler.mtkToSpo2(list, dataFrom, uid);
        MtkToIvHandler.mtkToTemper(list,dataFrom,uid);
    }

    static AtomicInteger number = new AtomicInteger(0);
    static final ReentrantLock lock = new ReentrantLock();
    static Runnable sync61Runnable=new Runnable() {
        @Override
        public void run() {
            fixedThreadPool.execute(new Runnable() {
                @Override
                public void run() {
                    lock.lock();
                    number.incrementAndGet();
                    mHandler.removeCallbacks(sync61Runnable);
                    Data61ToOther(TestUid
                            , months[0]
                            , months[1]
                            , months[2]
                            ,getDataFrom());
                    if (number.get() == 1) {
                        //刷新数据
                    }

                    if (number.get() == 2) {
                        MtkDataToServer.syncSaveTodayCmd();
                    }
                    if(BluetoothUtil.isConnected()) {
                        mHandler.postDelayed(sync61Runnable, 15000);
                    }

                    lock.unlock();

                }
            });
        }
    };

    private static void parse61Data(final Context context, final String data) {
        try {
            if (TextUtils.isEmpty(data)) {
                return;
            }
//            AwLog.i(Author.YanXi,data);
            JSONObject jb = new JSONObject(data);
            int ctrl = jb.getInt("ctrl");
            if (ctrl == 0) {
                number.set(0);
                fixedThreadPool.submit(new Runnable() {
                    @Override
                    public void run() {
                        LinkedList<TB_f1_index> f1_indices = new BleIndexDataParse().parseIndexData(0x61,data,TestUid,getDataFrom());
                        //添加指令0x61其他指令
                        MtkBleSync.getInstance().addDataType(MtkBleSync.SyncDeviceType.P1_61);
                        MtkBleSync.getInstance().getOneTypeIndexResult(0x61,f1_indices);
                    }
                });
            } else if(ctrl == 0x6b){
                //添加指令0x6b
                MtkBleSync.getInstance().addDataType(MtkBleSync.SyncDeviceType.P1_6B);
            } else{
                mHandler.removeCallbacks(sync61Runnable);
                fixedThreadPool.submit(new Runnable() {
                    @Override
                    public void run() {
                        HealthMinData ble61DataParse = new Gson().fromJson(data, HealthMinData.class);
                        int year = ble61DataParse.getYear();
                        int month = ble61DataParse.getMonth();
                        int day = ble61DataParse.getDay();
                        DateUtil date = new DateUtil(year, month, day);
                        String key = 1 + "_" + date.getYyyyMMddDate();
                        TB_61_data cmd_61 = new TB_61_data();
                        cmd_61.setUid(TestUid);
                        cmd_61.setData_from(getDataFrom());
                        cmd_61.setCtrl(ble61DataParse.getCtrl());
                        cmd_61.setSeq(ble61DataParse.getSeq());
                        cmd_61.setYear(ble61DataParse.getYear());
                        cmd_61.setMonth(ble61DataParse.getMonth());
                        cmd_61.setDay(ble61DataParse.getDay());
                        cmd_61.setHour(ble61DataParse.getHour());
                        cmd_61.setMin(ble61DataParse.getMin());
                        if (cmd_61.getYear() - 2000 == 0xff && cmd_61.getMonth() - 1 == 0xff && cmd_61.getDay() - 1 == 0xff && cmd_61.getHour() == 0xff && cmd_61.getMin() == 0xff) {
                            return;
                        }
                        months[0] = ble61DataParse.getYear();
                        months[1] = ble61DataParse.getMonth();
                        months[2] = ble61DataParse.getDay();
                        //存入时间戳
                        cmd_61.setTime(new DateUtil(cmd_61.getYear(), cmd_61.getMonth(), cmd_61.getDay(), cmd_61.getHour(), cmd_61.getMin(), ble61DataParse.getSecond()).getTimestamp());
                        cmd_61.setData_type(ble61DataParse.getData_type());
                        cmd_61.setSport_type(ble61DataParse.getSport_type());
                        cmd_61.setCalorie(ble61DataParse.getCalorie());
                        cmd_61.setStep(ble61DataParse.getStep());
                        cmd_61.setDistance(ble61DataParse.getDistance());
                        cmd_61.setState_type(ble61DataParse.getState_type());
                        cmd_61.setAutomatic(ble61DataParse.getAutomaticMin());
                        cmd_61.setReserve(ble61DataParse.getSecond());
                        cmd_61.setMin_bpm(ble61DataParse.getMin_bpm());
                        cmd_61.setMax_bpm(ble61DataParse.getMax_bpm());
                        cmd_61.setAvg_bpm(ble61DataParse.getAvg_bpm());
                        cmd_61.setLevel(ble61DataParse.getLevel());
                        cmd_61.setSdnn(ble61DataParse.getSdnn());
                        cmd_61.setLf_hf(ble61DataParse.getLf());
                        cmd_61.setHf(ble61DataParse.getHf());
                        cmd_61.setLf_hf(ble61DataParse.getLf_hf());
                        cmd_61.setBpm_hr(ble61DataParse.getBpm_hr());
                        cmd_61.setSbp(ble61DataParse.getSbp());
                        cmd_61.setDbp(ble61DataParse.getDbp());
                        cmd_61.setBpm(ble61DataParse.getBpm());
                        cmd_61.setCmd(ble61DataParse.getCmd());
                        cmd_61.setSleep(ble61DataParse.getSleep());
                        cmd_61.saveOrUpdate("uid=? and cmd=?"
                                , String.valueOf(TestUid)
                                , cmd_61.getCmd() + ""
                        );


                        boolean isFinish = MtkBleSync.getInstance().receivePracticalResult(0x61,ble61DataParse.getSeq());
                        if (isFinish) {
                            mHandler.post(sync61Runnable);
                        }
                        mHandler.postDelayed(sync61Runnable, 10000);
                    }
                });
            }
        } catch (JSONException e) {
            e.printStackTrace();
//            if(Integer.parseInt(data) == 0x6b){
//                //添加指令0x6b
//                MtkBleSync.getInstance().addDataType(MtkBleSync.SyncDeviceType.P1_6B);
//            }
        }
    }

    private static void parse68Data(final Context context, final String data) {
        try {
            final String from = PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
            JSONObject jb = new JSONObject(data);
            int ctrl = jb.getInt("ctrl");
            if (ctrl == 0) {
                com.socks.library.KLog.e("receive 68 index data");
                fixedThreadPool.submit(new Runnable() {
                    @Override
                    public void run() {
                        List<DataIndex_68> dataIndex68List = Ble68DataParse.parseCtrl0(data);
                        MTKHeadSetSync.getInstance().syncDetailData(dataIndex68List);
                    }
                });
            } else {
                mHandler.removeCallbacks(sync68Timeout);
                fixedThreadPool.submit(new Runnable() {
                    @Override
                    public void run() {
                        com.socks.library.KLog.e("receive 68 detail data");
                        R1HealthMinuteData ble68DataParse = new Gson().fromJson(data, R1HealthMinuteData.class);

                        //save raw data, prepare for upload
                        RawData68 rawData68 = new RawData68();
                        rawData68.setData_from(from);
                        rawData68.setYear(ble68DataParse.getYear());
                        rawData68.setMonth(ble68DataParse.getMonth());
                        rawData68.setDay(ble68DataParse.getDay());
                        rawData68.setHour(ble68DataParse.getHour());
                        rawData68.setMin(ble68DataParse.getMinute());
                        rawData68.setSecond(ble68DataParse.getSecond());
                        rawData68.setSeq(ble68DataParse.getSeq());
                        rawData68.setRaw_data(data);
                        rawData68.saveOrUpdate("data_from=? and seq=? " +
                                        "and year=? and month=? and day=? and hour=? and min=? and " +
                                        "second=?",
                                from,String.valueOf(rawData68.getSeq()),
                                String.valueOf(rawData68.getYear()),
                                String.valueOf(rawData68.getMonth()),
                                String.valueOf(rawData68.getDay()),
                                String.valueOf(rawData68.getHour()),
                                String.valueOf(rawData68.getMin()),
                                String.valueOf(rawData68.getSecond())
                        );
                        com.socks.library.KLog.e("save raw data 68");
                        TB_68_data data68 = new TB_68_data();
                        data68.setData_from(from);
                        data68.setCtrl(ble68DataParse.getCtrl());
                        data68.setSeq(ble68DataParse.getSeq());
                        data68.setYear(ble68DataParse.getYear());
                        data68.setMonth(ble68DataParse.getMonth());
                        data68.setDay(ble68DataParse.getDay());
                        data68.setHour(ble68DataParse.getHour());
                        data68.setMin(ble68DataParse.getMinute());
                        data68.setSeconds(ble68DataParse.getSecond());

                        MTKHeadSetSync.getInstance().setCounter(MTKHeadSetSync.getInstance().getCounter() + 1);

                        //handle exceptional case
                        if (data68.getYear() - 2000 == 0xff && data68.getMonth() - 1 == 0xff && data68.getDay() - 1 == 0xff && data68.getHour() == 0xff
                                && data68.getMin() == 0xff) {
                            com.socks.library.KLog.e("invalid data");
                            return;
                        }

                        months[0] = ble68DataParse.getYear();
                        months[1] = ble68DataParse.getMonth();
                        months[2] = ble68DataParse.getDay();
                        //存入时间戳
                        data68.setTime(new DateUtil(data68.getYear(), data68.getMonth(), data68.getDay(), data68.getHour(),
                                data68.getMin(), data68.getSeconds()).getTimestamp());
                        data68.setData_type(ble68DataParse.getData_type());
                        if((data68.getData_type() & 240) == 32){
                            com.socks.library.KLog.e("contain sport data");
                            data68.setSport_type(ble68DataParse.getWalk().getSport_type());
                            data68.setCalorie(ble68DataParse.getWalk().getCalorie());
                            data68.setStep(ble68DataParse.getWalk().getStep());
                            data68.setDistance(ble68DataParse.getWalk().getDistance());
                            data68.setState_type(ble68DataParse.getWalk().getState_type());
                            data68.setRateOfStride_avg(ble68DataParse.getWalk().getRateOfStride_avg());
                            data68.setRateOfStride_max(ble68DataParse.getWalk().getRateOfStride_max());
                            data68.setRateOfStride_min(ble68DataParse.getWalk().getRateOfStride_min());
                            data68.setFlight_avg(ble68DataParse.getWalk().getFlight_avg());
                            data68.setFlight_max(ble68DataParse.getWalk().getFlight_max());
                            data68.setFlight_min(ble68DataParse.getWalk().getFlight_min());
                            data68.setTouchDown_avg(ble68DataParse.getWalk().getTouchDown_avg());
                            data68.setTouchDown_max(ble68DataParse.getWalk().getTouchDown_max());
                            data68.setTouchDown_min(ble68DataParse.getWalk().getTouchDown_min());
                            data68.setTouchDownPower_avg(ble68DataParse.getWalk().getTouchDownPower_avg());
                            data68.setTouchDownPower_balance(ble68DataParse.getWalk().getTouchDownPower_balance());
                            data68.setTouchDownPower_max(ble68DataParse.getWalk().getTouchDownPower_max());
                            data68.setTouchDownPower_min(ble68DataParse.getWalk().getTouchDownPower_min());
                            data68.setTouchDownPower_stop(ble68DataParse.getWalk().getTouchDownPower_stop());
                        }
                        if((data68.getData_type() & 15) == 1){
                            com.socks.library.KLog.e("contain hr data");
                            data68.setAvg_hr(ble68DataParse.getHr().getAvg_hr());
                            data68.setMax_hr(ble68DataParse.getHr().getMax_hr());
                            data68.setMin_hr(ble68DataParse.getHr().getMin_hr());
                        }

                        data68.setCmd(ble68DataParse.getCmd());
                        data68.saveOrUpdate("data_from=? and data_type=? and year=? and month=? " +
                                        "and day=? and hour=? and min=? and seconds=? and state_type=? " +
                                        "and sport_type=?"
                                , from
                                , String.valueOf(data68.getData_type())
                                , String.valueOf(data68.getYear())
                                , String.valueOf(data68.getMonth())
                                , String.valueOf(data68.getDay())
                                , String.valueOf(data68.getHour())
                                , String.valueOf(data68.getMin())
                                , String.valueOf(data68.getSeconds())
                                , String.valueOf(data68.getState_type())
                                , String.valueOf(data68.getSport_type())
                        );
                        com.socks.library.KLog.e("save 68 detail data");
                        MTKHeadSetSync.getInstance().reportProgress(MTKHeadSetSync.getInstance().getCounter());
                    }
                });
                mHandler.postDelayed(sync68Timeout, 5000);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private static Runnable sync68Timeout = new Runnable() {
        @Override
        public void run() {
            MTKHeadSetSync.getInstance().reportProgress();
        }
    };

    private static void parse6bData(Context context, String data) {
        try {
            if (TextUtils.isEmpty(data)) {
                return;
            }
            JSONObject jb = new JSONObject(data);
            int ctrl = jb.getInt("ctrl");
            if (ctrl == 0) {
                number.set(0);
                fixedThreadPool.submit(new Runnable() {
                    @Override
                    public void run() {
                        LinkedList<TB_f1_index> f1_indices = new BleIndexDataParse().parseIndexData(0x6b,data,TestUid,getDataFrom());
                        MtkBleSync.getInstance().getOneTypeIndexResult(0x6b,f1_indices);
                    }
                });
            }else if(ctrl == 1){
                mHandler.removeCallbacks(sync61Runnable);
                fixedThreadPool.submit(new Runnable() {
                    @Override
                    public void run() {
                        HealthNewMinData ble61DataParse = JsonUtils.fromJson(data, HealthNewMinData.class);
                        int year = ble61DataParse.getYear();
                        int month = ble61DataParse.getMonth();
                        int day = ble61DataParse.getDay();
                        DateUtil date = new DateUtil(year, month, day);
                        String key = 1 + "_" + date.getYyyyMMddDate();
//                        MtkSync.getInstance().validate_61_62_1_data(1);
                        TB_61_data cmd_61 = new TB_61_data();
                        cmd_61.setUid(TestUid);
                        cmd_61.setData_from(getDataFrom());
                        cmd_61.setCtrl(ble61DataParse.getCtrl());
                        cmd_61.setSeq(ble61DataParse.getSeq());
                        cmd_61.setYear(ble61DataParse.getYear());
                        cmd_61.setMonth(ble61DataParse.getMonth());
                        cmd_61.setDay(ble61DataParse.getDay());
                        cmd_61.setHour(ble61DataParse.getHour());
                        cmd_61.setMin(ble61DataParse.getMin());
//                        MtkSync.getInstance().progressUP(false, cmd_61.getMonth() + "-" + cmd_61.getDay() + " -61-" + (ble61DataParse.getSeq() + 1) + " - " + MtkSync.getInstance().getNowSync());
                        if (cmd_61.getYear() - 2000 == 0xff && cmd_61.getMonth() - 1 == 0xff && cmd_61.getDay() - 1 == 0xff && cmd_61.getHour() == 0xff && cmd_61.getMin() == 0xff) {
                            return;
                        }
                        months[0] = ble61DataParse.getYear();
                        months[1] = ble61DataParse.getMonth();
                        months[2] = ble61DataParse.getDay();
                        //存入时间戳
                        cmd_61.setTime(new DateUtil(cmd_61.getYear(), cmd_61.getMonth(), cmd_61.getDay(), cmd_61.getHour(), cmd_61.getMin(), ble61DataParse.getSecond()).getTimestamp());
                        cmd_61.setData_type(ble61DataParse.getData_type());
                        cmd_61.setSport_type(ble61DataParse.getSport_type());
                        cmd_61.setCalorie(ble61DataParse.getCalorie());
                        cmd_61.setStep(ble61DataParse.getStep());
                        cmd_61.setDistance(ble61DataParse.getDistance());
                        cmd_61.setState_type(ble61DataParse.getState_type());
                        cmd_61.setAutomatic(ble61DataParse.getAutomaticMin());
                        cmd_61.setReserve(ble61DataParse.getSecond());
                        cmd_61.setMin_bpm(ble61DataParse.getMin_bpm());
                        cmd_61.setMax_bpm(ble61DataParse.getMax_bpm());
                        cmd_61.setAvg_bpm(ble61DataParse.getAvg_bpm());
                        cmd_61.setLevel(ble61DataParse.getLevel());
                        cmd_61.setSdnn(ble61DataParse.getSdnn());
                        cmd_61.setLf_hf(ble61DataParse.getLf());
                        cmd_61.setHf(ble61DataParse.getHf());
                        cmd_61.setLf_hf(ble61DataParse.getLf_hf());
                        cmd_61.setBpm_hr(ble61DataParse.getBpm_hr());
                        cmd_61.setSbp(ble61DataParse.getSbp());
                        cmd_61.setDbp(ble61DataParse.getDbp());
                        cmd_61.setBpm(ble61DataParse.getBpm());
                        cmd_61.setMood(ble61DataParse.getMoodLevel());
                        cmd_61.setCmd(ble61DataParse.getCmd());
                        cmd_61.setAf(ble61DataParse.getAf());
                        cmd_61.setSleep(ble61DataParse.getSleep());
                        cmd_61.setShutdown(ble61DataParse.getShutdown());
                        cmd_61.setBreathrate(ble61DataParse.getBreathrate());
                        cmd_61.setBioz_r(ble61DataParse.getBioz_r());
                        cmd_61.setBioz_fat(ble61DataParse.getBioz_fat());
                        cmd_61.setBioz_bmi(ble61DataParse.getBioz_bmi());
                        cmd_61.setBioz_type(ble61DataParse.getBioz_type());
                        cmd_61.setSpo2(ble61DataParse.getSpo2());
//                            cmd_61.save();
                        cmd_61.setTemperEnv(ble61DataParse.getTemperEnv());
                        cmd_61.setTemperType(ble61DataParse.getTemperType());
                        cmd_61.setTemperArm(ble61DataParse.getTemperArm());
                        cmd_61.setTemperBody(ble61DataParse.getTemperBody());
                        cmd_61.setTemperDef(ble61DataParse.getTemperDef());
                        cmd_61.saveOrUpdate("uid=? and cmd=?"
                                , String.valueOf(TestUid)
                                , cmd_61.getCmd() + ""

                        );
                        boolean isFinish = MtkBleSync.getInstance().receivePracticalResult(0x6b,ble61DataParse.getSeq());
                        if (isFinish) {
                            mHandler.post(sync61Runnable);
                        }
                        mHandler.postDelayed(sync61Runnable, 10000);
                    }
                });
            }
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    private static void parse6cData(Context context, String data) {
        try {
            int ctrl = JsonUtils.getInt(data,"ctrl");
            //解析indextable
            if (ctrl == 0) {
                fixedThreadPool.submit(new Runnable() {
                    @Override
                    public void run() {
                        LinkedList<TB_f1_index> f1_indices = new BleIndexDataParse().parseIndexData(0x6c,data,TestUid,getDataFrom());
                        MtkBleSync.getInstance().getOneTypeIndexResult(0x6c,f1_indices);
                    }
                });
            } else if (ctrl == 1) {
                //
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void parse6aData(Context context, String data) {
        try {
            int ctrl = JsonUtils.getInt(data,"ctrl");
            //解析indextable
            if (ctrl == 0) {
                fixedThreadPool.submit(new Runnable() {
                    @Override
                    public void run() {
                        LinkedList<TB_f1_index> f1_indices = new BleIndexDataParse().parseIndexData(0x6a,data,TestUid,getDataFrom());
                        MtkBleSync.getInstance().getOneTypeIndexResult(0x6a,f1_indices);
                    }
                });
            }else if(ctrl == 1){
                mHandler.removeCallbacks(sync61Runnable);
                MtkRriData mtkRriData = JsonUtils.fromJson(data, MtkRriData.class);
//                MtkSync.getInstance().validate_61_62_1_data(5);
//                MtkSync.getInstance().progressUP(false, mtkRriData.getMonth() + "-" + mtkRriData.getDay());
                DateUtil dateUtil = new DateUtil(mtkRriData.getYear(), mtkRriData.getMonth(),
                        mtkRriData.getDay(), mtkRriData.getHour(), mtkRriData.getMinute(),0);
                TB_rri_data rriData = new TB_rri_data();
                rriData.setYear(mtkRriData.getYear());
                rriData.setMonth(mtkRriData.getMonth());
                rriData.setDay(mtkRriData.getDay());
                rriData.setHour(mtkRriData.getHour());
                rriData.setMinute(mtkRriData.getMinute());
                rriData.setSecond(0);
                rriData.setUid(TestUid);
                rriData.setData_from(getDataFrom());
                rriData.setRawData(JsonTool.toJson(mtkRriData.getRawData()));
                rriData.setSeq(mtkRriData.getSeq());
                rriData.setTimeStamp((int) dateUtil.getUnixTimestamp());
                rriData.setDate(dateUtil.getSyyyyMMddDate());
                rriData.saveOrUpdate("uid=? and data_from=?  and year=? and month=? and day=? and hour=? and minute=? and second=? and seq=?"
                        , String.valueOf(TestUid)
                        , String.valueOf(getDataFrom())
                        , String.valueOf(rriData.getYear())
                        , String.valueOf(rriData.getMonth())
                        , String.valueOf(rriData.getDay())
                        , String.valueOf(rriData.getHour())
                        , String.valueOf(rriData.getMinute())
                        , String.valueOf(rriData.getSecond())
                        , String.valueOf(rriData.getSeq()));
                boolean isFinish = MtkBleSync.getInstance().receivePracticalResult(0x6a,mtkRriData.getSeq());
                if (isFinish) {
                   KLog.i("no2855-->> 6a 数据同步结束: " + (mtkRriData.getSeq() + 1) + " == " + dateUtil.getSyyyyMMddDate());
//                    TB_rri_index_table index_table = DataSupport.where("uid=? and end_seq=? and dataFrom=?",
//                            ContextUtil.getCacheUid()+"",MtkSync.getInstance().getNowSync()+"",ContextUtil.getCacheDevice()).findFirst(TB_rri_index_table.class);
//                    if(index_table != null){
//                        index_table.setSyncType(TB_rri_index_table.ISOK);
//                        index_table.update(index_table.getId());
//                    }
                    mHandler.post(sync61Runnable);
                }
                mHandler.postDelayed(sync61Runnable, 10000);
            }
        }catch (Exception e){
        }

    }


    public static String getDataFrom(){
        return PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME)+"";
    }

}


