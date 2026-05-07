package com.zeroner.bledemo.firmware;

import android.annotation.SuppressLint;
import android.annotation.TargetApi;
import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothManager;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanResult;
import android.content.BroadcastReceiver;
import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.Looper;

import androidx.annotation.RequiresApi;
import androidx.constraintlayout.widget.ConstraintLayout;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import android.os.PowerManager;
import android.provider.DocumentsContract;
import android.text.TextUtils;
import android.util.Log;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.TextView;
import android.widget.Toast;

import com.goodix.ble.gr.libdfu.task.DeviceResourceUpdate;
import com.goodix.ble.gr.toolbox.app.libfastdfu.DfuProgressCallback;
import com.goodix.ble.gr.toolbox.app.libfastdfu.EasyDfu2;
import com.leon.lfilepickerlibrary.LFilePicker;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver;
import com.zeroner.bledemo.setting.DfuService;
import com.zeroner.bledemo.setting.ScannerServiceParser;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.BleReceiverHelper;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.bledemo.utils.FileIOUtils;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl;
import com.zeroner.blemidautumn.bluetooth.impl.BleService;
import com.zeroner.blemidautumn.bluetooth.impl.ProtoBle;
import com.zeroner.blemidautumn.library.KLog;
import com.zeroner.blemidautumn.task.BackgroundThreadManager;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

import io.netopen.hotbitmapgg.library.view.RingProgressBar;
import no.nordicsemi.android.dfu.DfuBaseService;
import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * https://github.com/NordicSemiconductor/Android-nRF-Toolbox
 */
public class ProtoBufFirmwareUpdateActivity extends AppCompatActivity implements DfuProgressCallback,DeviceResourceUpdate.Listener,View.OnClickListener {
    private static final int REQUEST_BLUETOOTH = 222;
    Toolbar toolbarDeviceFirmware;
    RingProgressBar progressBar2;
    Button buttonSelectFile;
    Button buttonStart;
    TextView dfuStatue;

    ConstraintLayout goodixLayoutView;
    ConstraintLayout nobelLayoutView;


    CheckBox upFirBoxView;
    CheckBox upResBoxView;

    TextView firPathTxtView;
    TextView resPathTxtView;

    Button firPathBtnView;
    Button resPathBtnView;

    Button start5515BtnView;

    private Handler mHandler = new Handler(Looper.myLooper());
    private static final long SCAN_DURATION = 10000;

    int REQUESTCODE_FROM_ACTIVITY = 1000;
    TextView filePathView;
    private Context context;

    private String firmware_file;
    private String resourceFilePath;
    private InputStream firFileStream=null;
    private InputStream resFileStream=null;

    private BluetoothAdapter mBluetoothAdapter;
    private long mLastTime = 0;
    private long clickTime = 0;
    private Handler handler = new Handler(Looper.myLooper());
    private boolean isUpRes = false;
    //0代表在升级程序，1代表在升级资源
    private int writeFileType=0;
    private String proStr = "";
    private PowerManager.WakeLock mWl;


    private void findByIdView(){
         toolbarDeviceFirmware = findViewById(R.id.toolbar_device_firmware);
         progressBar2 = findViewById(R.id.progress_bar_2);
         buttonSelectFile = findViewById(R.id.button_select_file);
         buttonStart = findViewById(R.id.button_start);
         dfuStatue = findViewById(R.id.dfu_statue);
         goodixLayoutView = findViewById(R.id.goodixLayout);
         nobelLayoutView = findViewById(R.id.nobel_layout);


         upFirBoxView = findViewById(R.id.upFirBox);
         upResBoxView = findViewById(R.id.upResBox);

         firPathTxtView = findViewById(R.id.firPathTxt);
         resPathTxtView = findViewById(R.id.resPathTxt);

         firPathBtnView = findViewById(R.id.firPathBtn);
         resPathBtnView = findViewById(R.id.resPathBtn);

         start5515BtnView = findViewById(R.id.start5515Btn);
         filePathView = findViewById(R.id.file_path);
        buttonSelectFile.setOnClickListener(this);
        buttonStart.setOnClickListener(this);
        findViewById(R.id.firPathBtn).setOnClickListener(this);
        findViewById(R.id.resPathBtn).setOnClickListener(this);
        findViewById(R.id.start5515Btn).setOnClickListener(this);

    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_firmware_update);
        findByIdView();
        context = this;
        initView();
        initListener();
    }

    /**
     *  申请点亮屏幕
     */
    @SuppressLint("InvalidWakeLockTag")
    private void wakeUp() {
        if (mWl==null){
            PowerManager pm = (PowerManager)getSystemService(Context.POWER_SERVICE);
            mWl = pm.newWakeLock(PowerManager.ACQUIRE_CAUSES_WAKEUP| PowerManager.SCREEN_DIM_WAKE_LOCK,"my_tag");
        }
        mWl.acquire(20*60*1000L);//申请锁，这里会调用PowerManagerService里面acquireWakeLock()
    }

    public void releaseLock() {
        if (mWl!=null){
            try{
                mWl.release();
            }catch (Exception e){
                //可能锁已经被释放了
            }
            mWl=null;
        }
    }

    private void initView() {
        wakeUp();
        setSupportActionBar(toolbarDeviceFirmware);
        getSupportActionBar().setHomeButtonEnabled(true);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        toolbarDeviceFirmware.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
        mBluetoothAdapter = ((BluetoothManager) getSystemService(Context.BLUETOOTH_SERVICE)).getAdapter();
        if (mBluetoothAdapter == null) {
            return;
        }

        if(isGoodixDevice()){
            nobelLayoutView.setVisibility(View.GONE);
            goodixLayoutView.setVisibility(View.VISIBLE);
        }else{
            nobelLayoutView.setVisibility(View.VISIBLE);
            goodixLayoutView.setVisibility(View.GONE);
        }
    }

    @Override
    public void onClick(View view) {
        int id = view.getId();
        if (id == R.id.firPathBtn) {
            selectFile(4);
        } else if (id == R.id.button_select_file) {
            new LFilePicker()
                    .withActivity((Activity) context)
                    .withRequestCode(REQUESTCODE_FROM_ACTIVITY)
                    .withMutilyMode(false)
                    .withFileFilter(new String[]{".zip", ".hex", ".img",".bin"})
                    .start();
        } else if (id == R.id.resPathBtn) {
            selectFile(3);
        } else if (id == R.id.start5515Btn || id == R.id.button_start) {
            beginUpdateFirmware();
        }
    }

    private void selectFile(int type){
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
//        intent.setType("application/octet-stream");
//        intent.putExtra(Intent.EXTRA_TITLE, "选择升级固件文件");
//        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//            intent.putExtra(DocumentsContract.EXTRA_INITIAL_URI
//                    , Uri.fromFile(this.getExternalFilesDir("Goodix/SaveData")));
//        }
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        startActivityForResult(intent,type);
    }

    private void beginUpdateFirmware(){
        //设置不进行蓝牙重连
        if (System.currentTimeMillis() - clickTime <= 3000) {
            return;
        }
        if (!checkBluetooth()) {
            return;
        }
        clickTime = System.currentTimeMillis();
        if(isGoodixDevice()){
            if(!upFirBoxView.isChecked() && !upResBoxView.isChecked()){
                Toast.makeText(this,"未勾选任何升级选项，请先勾选",Toast.LENGTH_SHORT).show();
                return;
            }
             if(upResBoxView.isChecked()){
                beginGoodixUpResource();
            }else if(upFirBoxView.isChecked()){
                beginGoodixUpFiwrmware();
            }
        }else{
            writeDfuCmd();
        }

    }

    /**
     * 测试下载固件
     */
    private void downloadFile(){
        Request request = new Request.Builder().url("http://api6.iwown.com/firmware/test_5501.bin").build();
        new OkHttpClient().newCall(request).enqueue(new Callback() {
            @Override
            public void onFailure(Call call, IOException e) {
                e.printStackTrace();
                Log.i("myTag", "下载失败");
            }

            @Override
            public void onResponse(Call call, Response response) throws IOException {
                if (response.isSuccessful()) {
                    Log.i("myTag", "文件下载成功");
                    writeFile(response);
                }
            }
        });
    }

    private void writeFile(Response response) {
        InputStream is = null;
        FileOutputStream fos = null;
        is = response.body().byteStream();
        String path = Environment.getExternalStorageDirectory().getAbsolutePath();
        firmware_file = path+"/test66.bin";
        File file = new File(path+"/test66.bin");
        try {
            fos = new FileOutputStream(file);
            byte[] bytes = new byte[1024];
            int len = 0;
            //获取下载的文件的大小
            long fileSize = response.body().contentLength();
            KLog.i("nokey","瞎子啊的文件大小: "+fileSize);
            long sum = 0;
            int porSize = 0;
            while ((len = is.read(bytes)) != -1) {
                fos.write(bytes);
                sum += len;
                porSize = (int) ((sum * 1.0f / fileSize) * 100);
//                Message message = handler.obtainMessage(1);
//                message.arg1 = porSize;
//                handler.sendMessage(message);
            }
            beginGoodixUpFiwrmware();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (is != null) {
                    is.close();
                }
                if (fos != null) {
                    fos.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        Log.i("myTag", "下载成功");
    }

    private boolean hasEnterDfuStatus = false;
    public void beginGoodixUpResource(){
        writeFileType = 1;
//        KLog.i("nokey","开始汇顶资源升级: "+resourceFilePath);
        if(resFileStream==null){
            dfuStatue.setText("资源文件不存在，无法升级 ");
            return;
        }
        changeViewEnabled(false);
        dfuStatue.setText("正在升级资源文件。。。。");
        proStr = "资源-- ";
        if(!hasEnterDfuStatus) {
            byte[] dfuByte = ProtoBufSendBluetoothCmdImpl.getInstance().enterDfuStatues();
            BackgroundThreadManager.getInstance().addWriteData(this, dfuByte);
            hasEnterDfuStatus = true;
        }

        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                String resAddress = PrefUtil.getString(ProtoBufFirmwareUpdateActivity.this,BaseActionUtils.Action_res_address);
                if(TextUtils.isEmpty(resAddress)){
                    KLog.i("nokey","汇顶地址为空，无法升级: ");
                    dfuStatue.setText("汇顶地址地址为空，无法升级: ");
                    return;
                }
//                File file = new File(resourceFilePath);
                BluetoothDevice bluetoothDevice = ProtoBle.getInstance().getClientDevice();
                    KLog.i("nokey","汇顶资源升级地址，地址是: "+resAddress);
                handler.removeCallbacks(highSpeedRunnable);
                    handler.post(highSpeedRunnable);

                try {
//                    InputStream is = new FileInputStream(file);
                    EasyDfu2 dfu2 = new EasyDfu2();
                    dfu2.setListener(ProtoBufFirmwareUpdateActivity.this);
                    dfu2.startUpdateResource(ProtoBufFirmwareUpdateActivity.this, bluetoothDevice, resFileStream,false, Integer.valueOf(resAddress, 16));
                    resFileStream.close();
                } catch (FileNotFoundException e) {
                    e.printStackTrace();
                } catch (IOException e) {
                    e.printStackTrace();
                }

            }
        },4000);
    }

    public void beginGoodixUpFiwrmware() {
        writeFileType = 0;
        if(firFileStream==null){
            dfuStatue.setText("程序文件不存在，无法升级 ");
            return;
        }
        changeViewEnabled(false);
        dfuStatue.setText("正在升级程序文件。。。。");
        proStr = "程序== ";
        if(!hasEnterDfuStatus) {
            byte[] dfuByte = ProtoBufSendBluetoothCmdImpl.getInstance().enterDfuStatues();
            BackgroundThreadManager.getInstance().addWriteData(this,dfuByte);
            hasEnterDfuStatus = true;
        }
        handler.postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        try {
                            String firAddress = PrefUtil.getString(ProtoBufFirmwareUpdateActivity.this,BaseActionUtils.Action_firmware_address);
//                            String resAddress = PrefUtil.getString(ProtoBufFirmwareUpdateActivity.this,BaseActionUtils.Action_res_address);
                            if(TextUtils.isEmpty(firAddress)){
                                KLog.i("nokey","汇顶地址为空，无法升级: ");
                                changeViewEnabled(true);
                                return;
                            }
                            BluetoothDevice bluetoothDevice = ProtoBle.getInstance().getClientDevice();
                            handler.removeCallbacks(highSpeedRunnable);
                            handler.post(highSpeedRunnable);
//                            File file = new File(firmware_file);
//                            InputStream is = new FileInputStream(file);
                            EasyDfu2 dfu2 = new EasyDfu2();
//                          dfu2.setLogger(this);
                            dfu2.setListener(ProtoBufFirmwareUpdateActivity.this);
                            dfu2.startDfuInCopyMode(ProtoBufFirmwareUpdateActivity.this, bluetoothDevice, firFileStream, Integer.valueOf(firAddress, 16));
                            firFileStream.close();
                        } catch (IOException e) {
                            e.printStackTrace();
                        }
                    }
                },4000);

    }

    int setHighTime=0;
    Runnable highSpeedRunnable = new Runnable() {
        @Override
        public void run() {
            setHighTime++;
            ProtoBle.getInstance().changeWriteSpeed(1);
            if(setHighTime <= 3){
                mHandler.postDelayed(highSpeedRunnable,4000);
            }
            else if(setHighTime<50){
                mHandler.postDelayed(highSpeedRunnable,10000);
            }
        }
    };



    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK) {
            if(requestCode==3 || requestCode==4){
                final Uri uri = data.getData();
                ContentResolver resolver = getContentResolver();
                Cursor query = resolver.query(uri, new String[]{DocumentsContract.Document.COLUMN_DISPLAY_NAME}, null, null, null);
                String filePathAbs = "";
                if (query != null) {
                    if (query.moveToNext()) {
                        filePathAbs = query.getString(0);
                    }
                    query.close();
                }
//                String filePathAbs = FileIOUtils.getPath(this,uri);
                if(requestCode == 4) {
                    try {
                        firFileStream = resolver.openInputStream(uri);
                    } catch (FileNotFoundException e) {
                        e.printStackTrace();
                    }
//                    String[] firArray = filePathAbs.split("/");
//                    firPathTxtView.setText("程序: "+filePathAbs);
                    filePathView.setText("程序: "+filePathAbs);
                    isUpRes = false;
                }else {
                    try {
                        resFileStream = resolver.openInputStream(uri);
                    } catch (FileNotFoundException e) {
                        e.printStackTrace();
                    }
//                    String[] resArray = filePathAbs.split("/");
                    resPathTxtView.setText("资源: "+filePathAbs);
//                    resourceFilePath = filePathAbs;
                    isUpRes = true;
                }
                return;
            }


            if (requestCode == REQUESTCODE_FROM_ACTIVITY) {
                final Uri uri = data.getData();
                if(uri!=null) {
                    KLog.i("nokey", "文件选的路径: "+uri.toString());
                }
                List<String> list = data.getStringArrayListExtra("paths");
                if (list.size() > 0) {
                    String filePathAbs = list.get(0);
                    if (TextUtils.isEmpty(filePathAbs)) {
                        buttonStart.setVisibility(View.GONE);
                        buttonStart.setClickable(false);
                    } else {
                        firmware_file = filePathAbs;
                        filePathView.setText(filePathAbs);
                        buttonStart.setVisibility(View.VISIBLE);
                        buttonStart.setClickable(true);
                    }
                }
            }
        }
    }

    private boolean checkBluetooth() {
        if (mBluetoothAdapter.isEnabled()) {
            return true;
        }
        Intent intent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        startActivityForResult(intent, REQUEST_BLUETOOTH);
        return false;
    }

    private void initListener() {
        LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(this);
        localBroadcastManager.registerReceiver(mDfuUpdateReceiver, makeDfuUpdateIntentFilter());
        localBroadcastManager.registerReceiver(bleReceiver, new IntentFilter(BleService.BLE_CHARACTERISTIC_WRITE));
    }

    private BroadcastReceiver mDfuUpdateReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(final Context context, final Intent intent) {
            // DFU is in progress or an error occurred
            final String action = intent.getAction();
            if (DfuService.BROADCAST_PROGRESS.equals(action)) {
                final int progress = intent.getIntExtra(DfuService.EXTRA_DATA, 0);
                final int currentPart = intent.getIntExtra(DfuService.EXTRA_PART_CURRENT, 1);
                final int totalParts = intent.getIntExtra(DfuService.EXTRA_PARTS_TOTAL, 1);
                KLog.e("num : " + progress);
                updateProgressBar(progress, currentPart, totalParts, false);
            } else if (DfuService.BROADCAST_ERROR.equals(action)) {
                final int error = intent.getIntExtra(DfuService.EXTRA_DATA, 0);
                updateProgressBar(error, 0, 0, true);
            }
        }
    };

    private IntentFilter makeDfuUpdateIntentFilter() {
        final IntentFilter intentFilter = new IntentFilter();
        intentFilter.addAction(DfuService.BROADCAST_PROGRESS);
        intentFilter.addAction(DfuService.BROADCAST_ERROR);
        intentFilter.addAction(DfuService.BROADCAST_LOG);
        return intentFilter;
    }

    private void startScan() {
        if (isBack()) {
            return;
        }
        if (BluetoothUtil.isScanning()) {
            BluetoothUtil.stopScan();
        }
        Intent intent = new Intent(this, DfuService.class);
        stopService(intent);
        KLog.e("固件升级 startScan   " + Thread.currentThread().getId());
//        mBluetoothAdapter.startLeScan(mLEScanCallback);
        mBluetoothAdapter.getBluetoothLeScanner().startScan(scanCallback);
        mHandler.postDelayed(mScanTimeOutRunnable, SCAN_DURATION);
        mLastTime = 0;
    }

    private void stopScan() {
        mHandler.removeCallbacks(mScanTimeOutRunnable);
        mHandler.post(new Runnable() {
            @Override
            public void run() {
                try {
                    KLog.e("firmware stopScan    " + Thread.currentThread().getId());
//                    if (mLEScanCallback == null) {
//                        KLog.e("firmware stopScan    mLEScanCallback==null");
//                    }
                    mBluetoothAdapter.getBluetoothLeScanner().stopScan(scanCallback);
//                    mBluetoothAdapter.stopLeScan(mLEScanCallback);
                } catch (Exception e) {
                    KLog.e("firmware error : " + e.toString());
                }
            }
        });
    }

    Runnable mScanTimeOutRunnable = new Runnable() {
        @Override
        public void run() {
            stopScan();
        }
    };


    @TargetApi(Build.VERSION_CODES.LOLLIPOP)
    private ScanCallback scanCallback = new ScanCallback() {
        @Override
        public void onScanResult(int callbackType, ScanResult result) {
            super.onScanResult(callbackType, result);
            String address = result.getDevice().getAddress();
            String name = result.getDevice().getName();

            if (TextUtils.isEmpty(name)) {
                return;
            }
            KLog.i("----------" + address + "---------" + name);
            //nordic
            if (ScannerServiceParser.decodeDeviceAdvData(result.getScanRecord().getBytes(), BaseActionUtils.NODIC_UPDATE_SERVICE) || ScannerServiceParser.decodeDeviceAdvData(result.getScanRecord().getBytes(), BaseActionUtils.UPDATE_SERVICE_MAIN_DFU)) {
                if (judgeRepeat(address)) {
                    return;
                }
                mHandler.removeCallbacks(mScanTimeOutRunnable);
                stopScan();
                dfuStatue.setText(R.string.update_step_connect_device);
                Intent updateIntent = new Intent(context, DfuService.class);
                updateIntent.putExtra(DfuService.EXTRA_DEVICE_ADDRESS, address);
                KLog.e("(nordic) DFU　search MAC ：" + address);
                updateIntent.putExtra(DfuService.EXTRA_DEVICE_NAME, result.getDevice().getName());
                updateIntent.putExtra(DfuService.EXTRA_DEVICE_ADDRESS, address);
//						updateIntent.putExtra(DfuService.EXTRA_FILE_MIME_TYPE, DfuService.MIME_TYPE_OCTET_STREAM);
                updateIntent.putExtra(DfuService.EXTRA_FILE_PATH, firmware_file);
                updateIntent.putExtra(DfuService.EXTRA_FILE_TYPE, DfuService.TYPE_AUTO);
//						updateIntent.putExtra(DfuService.EXTRA_FILE_URI, uri);
                    startService(updateIntent);
            }
        }

        @Override
        public void onBatchScanResults(List<ScanResult> results) {
            super.onBatchScanResults(results);
        }

        @Override
        public void onScanFailed(int errorCode) {
            super.onScanFailed(errorCode);
        }
    };

    private synchronized boolean judgeRepeat(String address) {
        long nowTime = System.currentTimeMillis();
        if (nowTime - mLastTime < 60000) {
            return true;
        }
        mLastTime = nowTime;
        if (!TextUtils.isEmpty(address) && !TextUtils.isEmpty(PrefUtil.getString(context, BaseActionUtils.ACTION_DEVICE_ADDRESS))) {
            if (address.equals(getNewMac(PrefUtil.getString(context, BaseActionUtils.ACTION_DEVICE_ADDRESS), 1))) {
                return false;
            } else {
                mLastTime = 0;
                return true;
            }
        }
        return false;
    }

    private String getNewMac(String mac, int type) {
        if (isDialog()) {
            return mac;
        }
        String newMac = "";
        String oneMac = mac.substring(0, mac.lastIndexOf(":") + 1);
        String twoMac = mac.substring(mac.lastIndexOf(":") + 1, mac.length());
        int newTwoMac = Integer.parseInt(twoMac, 16);
        if (type == 1) {
            if (newTwoMac == 0xff) {
                newTwoMac = 0;
            } else {
                newTwoMac = newTwoMac + 1;
            }
        } else if (type == 2) {
            if (newTwoMac == 0) {
                newTwoMac = 0xff;
            } else {
                newTwoMac = newTwoMac - 1;
            }
        }
        String last = Integer.toHexString(newTwoMac);
        newMac = oneMac + (last.length() == 1 ? (0 + last) : last);
//        newMac = oneMac + last;

        KLog.e("lod mac====>" + mac + "new mac" + newMac);
        return newMac.toUpperCase();
    }

    private boolean isBack() {
        return isDestroyed();
    }


    @Override
    protected void onDestroy() {
        super.onDestroy();
        LocalBroadcastManager.getInstance(this).unregisterReceiver(mDfuUpdateReceiver);
        BleReceiverHelper.unregisterBleReceiver(this, bleReceiver);
        releaseLock();
    }

    public boolean isDialog() {
        return getModel().contains("I6HR") || getModel().contains("I6NH") || getModel().contains("I6PB") || getModel().contains("I6H9");
    }

    public String getModel() {
        return PrefUtil.getString(context, BaseActionUtils.Action_device_Model);
    }

    private void writeDfuCmd() {
        proStr="";
        writeFileType = -1;
        if (BluetoothUtil.isConnected()) {
            final boolean flag = ProtoBufSendBluetoothCmdImpl.getInstance().setUpgradeNotification();
            BluetoothUtil.setNeedReconnect(false);
            mHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    if (flag) {
                        ProtoBufSendBluetoothCmdImpl.getInstance().setUpgradeCmd();
                        mHandler.removeCallbacks(mWriteDFUTimeoutRunnable);
                        mHandler.postDelayed(mWriteDFUTimeoutRunnable, 5000);
                    }
                }
            }, 3000);
            return;
        } else {
            //already dfu
            mHandler.postDelayed(new Runnable() {
                @Override
                public void run() {
                    if (isDestroyed()) {
                        return;
                    }
                    startScan();
                }
            }, 1000);
        }
    }

    Runnable mWriteDFUTimeoutRunnable = new Runnable() {
        @Override
        public void run() {
            dfuStatue.setText(R.string.dfu_command_write_fail);
        }
    };

    private BluetoothCallbackReceiver bleReceiver = new BluetoothCallbackReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            super.onReceive(context, intent);
            String action = intent.getAction();
            if (BleService.BLE_CHARACTERISTIC_WRITE.equals(action)) {
                byte[] data = intent.getByteArrayExtra(BleService.EXTRA_DATA);
                if (data.length == 1 && data[0] == 1) {
                    com.socks.library.KLog.e("---------protobuf写入DFU指令成功");
                    //成功写入dfu指令
                    mHandler.removeCallbacks(mWriteDFUTimeoutRunnable);
                    mHandler.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            if (isDestroyed()) {
                                return;
                            }
                            startScan();
                        }
                    }, 3000);
                }else if(data.length == 3 && data[1] == 1){
                    //成功写入dfu指令
                    mHandler.removeCallbacks(mWriteDFUTimeoutRunnable);
                    mHandler.postDelayed(new Runnable() {
                        @Override
                        public void run() {
                            if (isDestroyed()) {
                                return;
                            }
                            startScan();
                        }
                    }, 3000);
                }
            }
        }
    };

    private void updateProgressBar(final int progress, final int part, final int total, final boolean error) {
        if (isDestroyed()) {
            return;
        }
        if (error) {
            updateUI(true);
//            updateUI(mNowStep, true);
        }
        switch (progress) {
            case DfuService.PROGRESS_CONNECTING:
                stopScan();
                // mProgressBar.setIndeterminate(true);
                // mProgressBar.setProgressText(getString(R.string.dfu_status_connecting));
//                mProgressBar.setProgressText(getString(R.string.dfu_status_connecting));
                break;
            case DfuService.PROGRESS_STARTING:
                // mProgressBar.setIndeterminate(true);
                // mProgressBar.setProgressText(getString(R.string.dfu_status_starting));
                dfuStatue.setText(getString(R.string.dfu_status_starting));
                break;
            case DfuService.PROGRESS_VALIDATING:
                // mProgressBar.setIndeterminate(true);
                // mTextPercentage.setText(R.string.dfu_status_validating);
                // mProgressBar.setProgressText(getString(R.string.dfu_status_validating));
                dfuStatue.setText(getString(R.string.dfu_status_validating));
                break;
            case DfuService.PROGRESS_DISCONNECTING:
                // mProgressBar.setIndeterminate(true);
                // mTextPercentage.setText(R.string.dfu_status_disconnecting);
                // mProgressBar.setProgressText(getString(R.string.dfu_status_disconnecting));
                dfuStatue.setText(getString(R.string.dfu_status_disconnecting));
//			startScan();
                break;
            case DfuService.PROGRESS_COMPLETED:
                // mProgressBar.setProgress(100);
                // mProgressBar.setCircleColor(false);
                // mProgressBar.setProgressText(getString(R.string.activity_update_over));
                // UserConfig.getInstance(mContext).setDerviceAddress(deviceName);
                // UserConfig.getInstance(mContext).save(mContext);
                // mTextPercentage.setText(R.string.dfu_status_completed);
                // let's wait a bit until we cancel the notification. When canceled
                // immediately it will be recreated by service again.
                // new Handler().postDelayed(new Runnable() {
                // @Override
                // public void run() {
                // onTransferCompleted();
                // // if this activity is still open and upload process was
                // // completed, cancel the notification
                // final NotificationManager manager = (NotificationManager)
                // getSystemService(Context.NOTIFICATION_SERVICE);
                // manager.cancel(DfuService.NOTIFICATION_ID);
                // }
                // }, 200);
                dfuStatue.setText(getString(R.string.activity_update_over));
                finish();
                break;
            case DfuService.PROGRESS_ABORTED:
                // mTextPercentage.setText(R.string.dfu_status_aborted);
                // let's wait a bit until we cancel the notification. When canceled
                // immediately it will be recreated by service again.
                // new Handler().postDelayed(new Runnable() {
                // @Override
                // public void run() {
                // onUploadCanceled();
                // // if this activity is still open and upload process was
                // // completed, cancel the notification
                // final NotificationManager manager = (NotificationManager)
                // getSystemService(Context.NOTIFICATION_SERVICE);
                // manager.cancel(DfuService.NOTIFICATION_ID);
                // }
                // }, 200);
                break;
            default:
                if (error) {
//                    updateUI(STEP_WRITE_HARDWARE_TO_DEVICE, true);
                    updateUI(true);
                } else {
                    int result = (int) (progress);
                    progressBar2.setVisibility(View.VISIBLE);
                    progressBar2.setProgress(result);
                    updateUI(false);
//                    mTvStep.setUpdateText(getString(R.string.update_step_write_device_progress, progress));
                    dfuStatue.setText(proStr+getString(R.string.update_step_write_device));
                    if (progress >= 100) {
                        progressBar2.setProgress(100);
                    }
                }
                break;
        }
    }


    private void updateUI(boolean flag) {
        if (flag) {
            buttonStart.setClickable(true);
            buttonSelectFile.setClickable(true);
            buttonStart.setText(R.string.update_step_write_retry);
        } else {
            buttonStart.setClickable(false);
            buttonSelectFile.setClickable(false);
        }
    }

static String TAG = "nokey";
    int lastUiPro = -1;
    @Override
    public void onDfuStart() {
        Log.i(TAG, "onDfuStart() called");
    }

    @Override
    public void onDfuProgress(int i) {
        if(lastUiPro!=i) {
            Log.i(TAG, "onDfuProgress() called with: i = [" + i + "]");
            lastUiPro = i;
            updateProgressBar(i, 0, 0, false);
        }
    }

    @Override
    public void onDfuComplete() {
        Log.d(TAG, "onDfuComplete() called");
        if(writeFileType==1){
            if(upFirBoxView.isChecked()){
                //开始升级程序文件
                beginGoodixUpFiwrmware();
                return;
            }else{
//                byte[] dfuByte = ProtoBufSendBluetoothCmdImpl.getInstance().enterNormalStatus();
//                BackgroundThreadManager.getInstance().addWriteData(this,dfuByte);
            }

        }
        goodixFinish();
    }

    private void goodixFinish(){
        dfuStatue.setText("升级完成");
        firPathTxtView.setText("程序:");
        resPathTxtView.setText("资源:");
        resFileStream = null;
        firFileStream = null;
        changeViewEnabled(true);
    }

    private void changeViewEnabled(boolean isEnabled){
        upFirBoxView.setEnabled(isEnabled);
        upResBoxView.setEnabled(isEnabled);
        firPathBtnView.setEnabled(isEnabled);
        resPathBtnView.setEnabled(isEnabled);
        start5515BtnView.setEnabled(isEnabled);
    }


    @Override
    public void onDfuError(String s, Error error) {
        Log.i(TAG, "onDfuError() called with: s = [" + s + "], error = [" + error + "]");
        updateProgressBar(0,0,0,true);
        byte[] dfuByte = ProtoBufSendBluetoothCmdImpl.getInstance().enterNormalStatus();
        BackgroundThreadManager.getInstance().addWriteData(this,dfuByte);
        dfuStatue.setText("升级错误: "+error.getMessage());
        changeViewEnabled(true);
    }

    @Override
    public void onDruStart() {
//        Log.d(TAG, "onDruStart() 开始了");
    }

    @Override
    public void onDruProgressUpdate(int i) {
        Log.i(TAG, "onDruProgressUpdate() 进度: "+i);
    }

    @Override
    public void onDruComplete() {
//        Log.i(TAG, "onDruComplete() 升级完成: ");
    }

    @Override
    public void onDruCanceled() {

    }

    @Override
    public void onDruError(String s, Error error) {
        Log.i(TAG, "onDruError() 升级错误: "+error.getMessage());
    }

    private boolean isGoodixDevice(){
        int type = PrefUtil.getInt(this,BaseActionUtils.Action_device_FotaType);
        if(type==6){
            return true;
        }
        return false;
    }


}
