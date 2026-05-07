package com.zeroner.bledemo.data.sync;


import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.google.protobuf.ByteString;
import com.zeroner.bledemo.BleApplication;
import com.zeroner.bledemo.eventbus.DialProgressEvent;
import com.zeroner.bledemo.eventbus.SyncDataEvent;
import com.zeroner.bledemo.gps.DownloadUtil;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.FileIOUtils;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.bledemo.utils.Util;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.bluetooth.model.ProtoBufFileUpdateInfo;
import com.zeroner.blemidautumn.bluetooth.proto.FilesUpdate;
import com.zeroner.blemidautumn.library.KLog;
import com.zeroner.blemidautumn.task.BackgroundThreadManager;

import org.greenrobot.eventbus.EventBus;

import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

/**
 * protoBuf epo升级
 */
public class ProtoBufUpdate {

    private static final int INIT = 1;
    private static final int DATA = 2;
    private static final int EXIT = 3;
    private static final int DESC = 4;

    public static class Type {
        public static final int TYPE_GPS = FilesUpdate.FUType.GPS_VALUE;
        public static final int TYPE_FONT = FilesUpdate.FUType.FONT_VALUE;
        public static final int TYPE_MGAONLINE = FilesUpdate.FUType.MGAONLINE_VALUE;
        public static final int TYPE_CUSTOMDIAL = FilesUpdate.FUType.CUSTOMDIAL_VALUE;
        public static final int TYPE_BP = FilesUpdate.FUType.BP_VALUE;
    }

    private static final String url1 = "https://offline-live1.services.u-blox.com/GetOfflineData.ashx?token=ALKccrhbDE6DMfGLzob8dQ;gnss=gps;period=1;resolution=1";
    private static final String url2 = "http://online-live1.services.u-blox.com/GetOnlineData.ashx?token=ALKccrhbDE6DMfGLzob8dQ;gnss=gps;datatype=alm";


    private volatile static ProtoBufUpdate instance;

    private static Handler mHandler = new Handler(Looper.getMainLooper());

    /**
     * 当前的position
     */
    private int position = 0;

    private int mProgress=0;
    /**
     * 整个包的最大mtu default 244
     */
    private int maxMtu = 244;
    /**
     * 总文件大小
     */
    private byte[] allBytes;
    /**
     * 总文件的包集合
     */
    private List<byte[]> packageList;
    /**
     * 总文件cyc32
     */
    private long allCyc32;
    /**
     * 已经同步的文件
     */
    private byte[] completeBytes = new byte[0];
    /**
     * 同步文件的偏移量
     */
    private int completeOffset = 0;

    /**
     * 是否更新
     */
    private boolean isUpdate = false;

    /**
     * 更新类别
     */
    private int fuType;

    private String filePath;

    private OnUpgradeListener listener;
    private int delay = 15;



    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public static ProtoBufUpdate getInstance() {
        if (instance == null) {
            synchronized (ProtoBufUpdate.class) {
                if (instance == null) {
                    instance = new ProtoBufUpdate();
                }
            }
        }
        return instance;
    }

    public boolean isUpdate() {
        return isUpdate;
    }

    public void setUpdate(boolean update) {
        isUpdate = update;
    }

    public void setOnUpgradeListener(OnUpgradeListener listener){
        this.listener = listener;
    }

    public void setDelay(int  delay){
        if(delay <=0){
            this.delay = 30;
        }else {
            this.delay = delay;
        }
    }

    /**
     * @param type 传递 Type gps font and mgaonline
     */
    public void startUpdate(int type) {
        if(!BluetoothUtil.isConnected()){
            KLog.e("yanxi....没有连接");
            return;
        }
        /**
         * 如果正在同步则不AGPS升级
         */
        if(ProtoBufSync.getInstance().isSync()){
            return;
        }
        if (isUpdate) {
            KLog.e("yanxi....正在更新");
            return;
        }

        /**
         * 判断是否需要更新有效
         */

        updateInfo(type);

    }

    private void updateInfo(int type){
        this.fuType = type;
        if (type == Type.TYPE_FONT) {
        } else if(type == Type.TYPE_GPS){
            //升级
            downloadFile(url1);
        } else if(type == Type.TYPE_BP){
            downLoadBp();
        }else if(type == Type.TYPE_MGAONLINE){

            downloadFile(url2);
        }
    }

    void downLoadBp(){
        clearInfo();
        mProgress = 0;
        isUpdate = true;
        allBytes = FileIOUtils.readFile2BytesByMap(filePath);
        byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setFileDescUpdate(true);
        BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(),delay, bytes);
    }

    /**
     * 初始化数据
     *
     * @param fileUpdateInfo 获取mtu
     */
    private void initData(ProtoBufFileUpdateInfo fileUpdateInfo) {
        /**
         * 暂时先用本地的数据..
         */
//        String s = SuperBleSDK.getInstance().getContext().getExternalFilesDir(null).getAbsolutePath() + "/1.ubx";
        KLog.e("90返回: "+ fileUpdateInfo.toString());
        if (allBytes == null || allBytes.length == 0) {
            return;
        }
        allCyc32 = Util.CRC_32(allBytes);
        packageList = multipePackage(allBytes, fileUpdateInfo.getMtu());
//        maxMtu = PrefUtil.getInt(BleApplication.getInstance(), BaseActionUtils.PROTOBUF_MTU_INFO);
        //表盘发送不能断点续传
        if(fuType == FilesUpdate.FUType.CUSTOMDIAL_VALUE || fuType==FilesUpdate.FUType.BP_VALUE){
            KLog.e("90返回: 这个类型不能断点续传");
            return;
        }

        //判断是否有断点下载记录
        int fileOffset = fileUpdateInfo.getFileOffset();
        int crc32AtOffset = fileUpdateInfo.getCrc32AtOffset();
        if (fileOffset == 0) {
            clearInfo();
            return;
        }
        //通过偏移量计算position
        int tempOffset = 0;
        byte[] tempBytes = new byte[0];
        int tempPostion = -1;
        for (int i = 0; i < packageList.size(); i++) {
            tempOffset += packageList.get(i).length;
            tempBytes = com.zeroner.blemidautumn.utils.Util.concat(tempBytes, packageList.get(i));
            if (fileOffset == tempOffset) {
                if (crc32AtOffset == Util.CRC_32(tempBytes)) {
                    tempPostion = i;
                    position = i;
                    completeBytes = tempBytes;
                    completeOffset = tempOffset;
                    break;
                }
            }
        }
        if (tempPostion == -1) {
            clearInfo();
        }

    }

    public void updateDetail(int type, ProtoBufFileUpdateInfo fileUpdateInfo) {
        if (type == DESC) {
            //type == 4
            Log.e("update", "desc" + fileUpdateInfo.getStatus());
            if(fuType== FilesUpdate.FUType.GPS_VALUE) {
                if (fileUpdateInfo.isValid()) {
                    isUpdate = false;
                    return;
                }
                initData(fileUpdateInfo);
                if (position != 0) {
                    exeData();
                    return;
                }
            }else{
                initData(fileUpdateInfo);
            }
            exeInit();
        }
        if (type == INIT) {
            if (fileUpdateInfo.getStatus() == 0) {
                exeData();
            } else {
                KLog.e("同步失败");
                onFailed(2);
                isUpdate = false;
            }
        }
        if (type == DATA) {
            if (fileUpdateInfo.getStatus() == 0) {
                exeData();
            } else if (fileUpdateInfo.getStatus() == 1) {
                KLog.e("参数失败");
                onFailed(3);
                initData(fileUpdateInfo);
            } else {
                isUpdate = false;
            }
        }
        if (type == EXIT) {
            if (fileUpdateInfo.getStatus() == 0) {
                if (fileUpdateInfo.isValid()) {
                    //同步完成
                    KLog.e("同步完成");
                    isUpdate = false;
                    EventBus.getDefault().post(new SyncDataEvent(100, true));
                    onSuccess();
                }
            }

        }

    }


    /**
     * 按mtu分包发送
     *
     * @param bytes 需要分包的问题
     * @param mtu   分包的条件
     * @return 返回集合
     */
    private List<byte[]> multipePackage(byte[] bytes, int mtu) {
        List<byte[]> packageList = new LinkedList<>();
        if (mtu <= 0) {
            return packageList;
        }
        if (bytes.length > mtu) {
            //分包处理
            for (int i = 0; i < bytes.length; i += mtu) {
                int to = i + mtu;
                if (to > bytes.length) {
                    to = bytes.length;
                }
                packageList.add(Arrays.copyOfRange(bytes, i, to));
            }
        } else {
            packageList.add(Arrays.copyOfRange(bytes, 0, bytes.length));
        }
        return packageList;
    }


    /**
     * 执行init
     */
    private void exeInit() {
//        KLog.e("yanxi------>>> 90返回的init下发的参数:" + fuType +" // "+allBytes.length +" // "+(int) allCyc32 +" // "+completeOffset +" // "+(int) Util.CRC_32(completeBytes));
        byte[] bytes1 = ProtoBufSendBluetoothCmdImpl.getInstance().setFileInitUpdate(fuType, allBytes.length, (int) allCyc32, "cs",
                completeOffset, (int) Util.CRC_32(completeBytes));
        BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(),delay, bytes1);
    }

    /**
     * 执行data
     */
    private void exeData() {
        if (position < packageList.size()) {
            byte[] bytes = packageList.get(position);

            ByteString bytes1 = ByteString.copyFrom(bytes);

            completeBytes = com.zeroner.blemidautumn.utils.Util.concat(completeBytes, bytes);
            long cyc32Office = Util.CRC_32(completeBytes);
            byte[] allBytes = ProtoBufSendBluetoothCmdImpl.getInstance().setFileDataUpdate(fuType, completeOffset, (int) cyc32Office, bytes1);
            List<byte[]> bytesList = multipePackage(allBytes, maxMtu);
            for (int i = 0; i < bytesList.size(); i++) {
                BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(),delay, bytesList.get(i));
            }
            completeOffset += packageList.get(position).length;
            position++;
        } else {
            byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setFileDataExit(fuType);
            BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(),delay, bytes);
            isUpdate = false;
            EventBus.getDefault().post(new SyncDataEvent(100, true));
            onSuccess();
            //AGPS升级完成.保存AGPS crc32校验码
            long checkCode = Util.CRC_32(allBytes);

            String data = new DateUtil().getY_M_D();
            if(this.fuType == Type.TYPE_GPS){
                //写入GPS
                mHandler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        KLog.e("写入MGAONLINE");
                        updateInfo(Type.TYPE_MGAONLINE);
                    }
                },1000);
            }else{
                isUpdate = false;
                return;
            }
        }
        int progress = position * 100 / packageList.size();
        KLog.e("progress:" + progress);
        String typeDesc = "AGPS";
        if (this.fuType == Type.TYPE_FONT) {
            typeDesc = "FONT";
        }else if(this.fuType == Type.TYPE_MGAONLINE){
            typeDesc = "MGAONLINE";
        }else  if(this.fuType==Type.TYPE_BP){
            typeDesc = "BP";
        }else  if(this.fuType==Type.TYPE_BP){
            typeDesc = "Dial";
        }

        if(fuType == FilesUpdate.FUType.CUSTOMDIAL_VALUE){
            if(progress != mProgress){
                mProgress = progress;
                DialProgressEvent event = new DialProgressEvent(progress);
                event.setType(fuType);
                EventBus.getDefault().post(event);
            }
        }

        EventBus.getDefault().post(new SyncDataEvent(progress, false,typeDesc));

        onProgress(progress);
    }

    public int getFuType() {
        return fuType;
    }

    /**
     * 清除信息从头开始
     */
    private void clearInfo() {
        position = 0;
        mProgress = 0;
        completeBytes = new byte[0];
        completeOffset = 0;
    }

    private void downloadFile(String url) {
        clearInfo();
        DownloadUtil.get().download(url, "protobuf", new DownloadUtil.OnDownloadListener() {
            @Override
            public void onDownloadSuccess(String path) {
                KLog.d("yanxi...PROTOBUF数据下载完成..."+fuType);
                //升级
                Log.e("update", "start");
                isUpdate = true;
                allBytes = FileIOUtils.readFile2BytesByMap(path);

                byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setFileDescUpdate(true);
                BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(),delay, bytes);
            }

            @Override
            public void onDownloading(int progress) {

            }

            @Override
            public void onDownloadFailed() {
                KLog.d(" PROTOBUF数据下载失败");
                isUpdate = false;
                onFailed(0);
            }
        });
    }

    /**
     * 开始升级表盘
     */
    public int startUpdateDial(){
        if(!BluetoothUtil.isConnected()){
            return 1;
        }
        /**
         * 如果正在同步则不AGPS升级
         */
        if(ProtoBufSync.getInstance().isSync()){
            return 2;
        }
        BackgroundThreadManager.getInstance().clearQueue();
        updateInfo(FilesUpdate.FUType.CUSTOMDIAL_VALUE);
        //清除表盘
        byte[] bytes1 = ProtoBufSendBluetoothCmdImpl.getInstance().clearDeviceDial();
        BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(),bytes1);
        return 0;
    }

    public void beginWriteDial(byte[] dialBytes){
        clearInfo();
        mProgress = 0;
        isUpdate = true;
        allBytes = dialBytes;

        //写入文件 准备
        byte[] bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setFileDescUpdate(true);
        BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(),bytes);
    }


    public void stopWriteDial(){
        if(fuType==Type.TYPE_CUSTOMDIAL) {
            isUpdate = false;
            allBytes = null;
            if(packageList!=null){
                packageList.clear();
            }
            position = 0;
        }
    }



    public interface OnUpgradeListener{
        void onFailed(int type);

        void onSuccess();

        void onProgress(int progress);
    }


    private void onFailed(int type){
        if(listener != null){
            listener.onFailed(type);
        }
    }

    public void onSuccess(){
        if(listener != null){
            listener.onSuccess();
        }
    }

    public void onProgress(int progress){
        if(listener != null){
            listener.onProgress(progress);
        }
    }

}
