package com.zeroner.bledemo.setting;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.text.TextUtils;
import android.view.View;

import com.leon.lfilepickerlibrary.LFilePicker;
import com.zeroner.bledemo.BaseActivity;
import com.zeroner.bledemo.databinding.ActivityEpoWriteBinding;
import com.zeroner.bledemo.gps.DownloadUtil;
import com.zeroner.bledemo.utils.FileIOUtils;
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.MtkSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.library.KLog;

import java.io.File;
import java.util.List;

import coms.mediatek.ctrl.epo.EpoDownloadChangeListener;
import coms.mediatek.ctrl.epo.EpoDownloadController;

/**
 * @author Gavin
 * @date 2021/7/26
 */
public class EpoSettingActivity extends BaseActivity implements EpoDownloadChangeListener {

    private ActivityEpoWriteBinding binding;
    private String offlinePath="";
    private String onlinePath="";
    private static final int type_offline = 0;
    private static final int type_online = 1;
    private int writeType = type_offline;
    private boolean sendingEpo = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityEpoWriteBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());
        EpoDownloadController.addListener(this);
        initLister();

    }

    public void initLister(){
        binding.epoFileBtn1.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
//                new LFilePicker()
//                        .withActivity(EpoSettingActivity.this)
//                        .withRequestCode(2)
//                        .withMutilyMode(false)
//                        .withFileFilter(new String[]{".ubx"})
//                        .start();
            }
        });

        binding.epoFileBtn2.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
//                new LFilePicker()
//                        .withActivity(EpoSettingActivity.this)
//                        .withRequestCode(3)
//                        .withMutilyMode(false)
//                        .withFileFilter(new String[]{".ubx"})
//                        .start();
//                MtkSendBluetoothCmdImpl.getInstance(EpoSettingActivity.this).writeEpoMga();
            }
        });

        binding.epoSendFileBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(sendingEpo){
                    return;
                }else{
                    downloadEpoOffline();
                }
            }
        });
    }

    public void sendOfflineEpoFileToDevice(){
        writeType = type_offline;
        if(!TextUtils.isEmpty(offlinePath)) {
            File file = new File(offlinePath);
//            try {
                byte[] datas = FileIOUtils.readFile2BytesByChannel(file);
                KLog.e("guan","epo-5515的大小: "+datas.length);
                EpoDownloadController.getInstance().writeEpoOfflineBytes(datas);
//            } catch (FileNotFoundException e) {
//                e.printStackTrace();
//            }
        }
    }

    public void sendOnlineEpoFileToDevice(){
        writeType = type_online;
        if(!TextUtils.isEmpty(onlinePath)) {
            File file = new File(onlinePath);
//            try {
            byte[] datas = FileIOUtils.readFile2BytesByChannel(file);
            EpoDownloadController.getInstance().writeEpoOnlineBytes(datas);
//            } catch (FileNotFoundException e) {
//                e.printStackTrace();
//            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK) {
            if (requestCode == 2 || requestCode==3) {
                final Uri uri = data.getData();
                if(uri!=null) {
                    KLog.i("nokey", "文件选的路径: "+uri.toString());
                }
                List<String> list = data.getStringArrayListExtra("paths");
                if (list.size() > 0) {
                    if (!TextUtils.isEmpty(list.get(0))) {
                        if(requestCode==2){
                            offlinePath = list.get(0);
                            binding.epoFileTxt1.setText("offline文件: "+offlinePath);

                        }else if(requestCode==3){
                            onlinePath = list.get(0);
                            binding.epoFileTxt2.setText("online文件: "+onlinePath);
                        }
                    }
                }
            }
        }
    }

    @Override
    public void notifyProgressChanged(float percent) {
        KLog.i("nokey", "epo-5515-notifyProgressChanged进度: "+percent);
        if(writeType==type_offline){
            int pro = (int) (percent*95);
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    binding.epoSyncTxt.setText(String.valueOf(pro)+"%");
                }
            });

        }else if(writeType == type_online){
            int pro = (int) (percent*5) +95;
            if(percent>0.99){
                sendingEpo = false;
            }
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    binding.epoSyncTxt.setText(String.valueOf(pro)+"%");
                }
            });
        }

        if(writeType==type_offline && percent>0.99){
            new Handler(getMainLooper()).postDelayed(new Runnable() {
                @Override
                public void run() {
                    MtkSendBluetoothCmdImpl.getInstance(EpoSettingActivity.this).writeEpoMga();
//                    sendOnlineEpoFileToDevice();
                }
            },500);
        }
    }

    @Override
    public void notifyDownloadResult(int result) {
        KLog.i("nokey", "epo-5515-notifyDownloadResult: "+result);
        if(result==2){
            sendOfflineEpoFileToDevice();
        }else if(result==3){
            sendOnlineEpoFileToDevice();
        }
    }

    @Override
    public void notifyConnectionChanged(int state) {
    }

    public void downloadEpoOffline(){
        binding.epoSyncTxt.setText("下载epo中...");
//        String ofUrl = "https://offline-live1.services.u-blox.com/GetOfflineData.ashx?token=3L7U4eAeQdKDaBYQkTpbWg;gnss=gps;period=3;resolution=1";
        String ofUrl = "https://api11.iwown.com/ublocks/offline_7020_epo.ubx";
        DownloadUtil.get().download(ofUrl,"epo_ublox", new DownloadUtil.OnDownloadListener() {
            @Override
            public void onDownloadSuccess(String path) {
                offlinePath = path;
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        binding.epoFileTxt1.setText("offline文件: "+offlinePath);
                        downloadEpoOnline();
                    }
                });
            }

            @Override
            public void onDownloading(int progress) {

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        binding.epoSyncTxt.setText("down-"+(progress*90/100));
                    }
                });
            }

            @Override
            public void onDownloadFailed() {
                sendingEpo = false;
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        binding.epoSyncTxt.setText("下载失败...");
                    }
                });

            }
        });
    }

    public void downloadEpoOnline(){
//        String onUrl = "http://online-live1.services.u-blox.com/GetOnlineData.ashx?token=3L7U4eAeQdKDaBYQkTpbWg;gnss=gps;datatype=alm";
        String onUrl = "https://api11.iwown.com/ublocks/online_7020_epo.ubx";
        DownloadUtil.get().download(onUrl,"epo_ublox", new DownloadUtil.OnDownloadListener() {
            @Override
            public void onDownloadSuccess(String path) {
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        binding.epoSyncTxt.setText("开始写入epo-");
                        onlinePath = path;
                        binding.epoFileTxt2.setText("online文件: "+onlinePath);
                        MtkSendBluetoothCmdImpl.getInstance(EpoSettingActivity.this).writeEpo();
                    }
                });
            }

            @Override
            public void onDownloading(int progress) {

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        binding.epoSyncTxt.setText("down-"+(progress*10/100)+90);
                    }
                });
            }

            @Override
            public void onDownloadFailed() {
                sendingEpo = false;

                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        binding.epoSyncTxt.setText("下载失败...");
                    }
                });
            }
        });
    }
}
