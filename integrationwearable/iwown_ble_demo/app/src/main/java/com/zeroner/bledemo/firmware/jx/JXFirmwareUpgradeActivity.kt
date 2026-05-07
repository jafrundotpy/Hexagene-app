package com.zeroner.bledemo.firmware.jx

import android.annotation.SuppressLint
import android.bluetooth.BluetoothDevice
import android.bluetooth.BluetoothManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.SystemClock
import android.provider.DocumentsContract
import android.util.Log
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.actions.bluetooth.ota.OTAManager
import com.actions.bluetooth.ota.RemoteStatus
import com.actions.ibluz.factory.BluzDeviceFactory
import com.actions.ibluz.factory.IBluzDevice
import com.zeroner.bledemo.databinding.DeviceModuleJxUpgradeMainBinding
import com.zeroner.bledemo.utils.BluetoothUtil
import com.zeroner.bledemo.utils.FileUtils
import java.io.File
import java.util.UUID

/**
 *  炬芯固件升级
 *  这里的.bin文件放入Android/data/com.iwown.bledemo/files/文件下，文件路径自行更改
 *
 * 1. 人工确认当前手表是否支持蓝牙3.0，不支持则用4.0升级，默认4.0升级
 * 2. 初始化参数  mBluzConnector: IBluzDevice 和 mOTAManager: OTAManager
 * 3. 确认选择的文件是.bin文件
 * 4. 查看当前手表是否已经被连接，
 *  连接状态下可直接调用mBluzConnector?.connect()连接设备进行升级，实现 IBluzDevice.OnConnectionListener
 *  未连接下则需要调用 mBluzConnector?.startDiscovery(),搜索到设备后再连接设备进行升级,实现IBluzDevice.OnDiscoveryListener
 * 5. 开始升级，需要实现 OTAManager.OTAListener，监听进度和升级状态
 * 6.升级成功，释放资源
 */
class JXFirmwareUpgradeActivity :AppCompatActivity(), OTAManager.OTAListener {
    enum class ConnectType(){
        CLASSIC_TYPE,   //3.0蓝牙升级连接
        BLE_TYPE   //4.0蓝牙连接升级, 默认4.0升级

    }

    private lateinit var binding: DeviceModuleJxUpgradeMainBinding
    var REQUESTCODE_FROM_ACTIVITY = 1000
    //固件升级方式，默认使用4.0升级, 使用3.0升级时需要人工确认手表是否支持
    private var upgradeType = ConnectType.BLE_TYPE
    //升级文件路径
    private var upFilePath = ""
    private var mBluzConnector: IBluzDevice?=null
    private var mOTAManager: OTAManager?=null
    private var mOTAStatus = OTAManager.STATE_IDLE
    private var mConnectDevice : BluetoothDevice?=null
    private var mUpDeviceName = ""
    private var mUpDeviceAddress = ""
    private var upingFirmware = false
    private val fileHashMap = HashMap<String,String>()


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = DeviceModuleJxUpgradeMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.root.keepScreenOn = true
        initToolBar()
        initView()
        initFileList()
    }

    private fun backClick(){

        if(upingFirmware){
            Toast.makeText(this@JXFirmwareUpgradeActivity, "升级中请勿退出！！", Toast.LENGTH_SHORT).show()
            return
        }
        finish()
    }

    private fun initToolBar(){
        setSupportActionBar(binding.toolbarSetting)
        supportActionBar!!.setHomeButtonEnabled(true)
        supportActionBar!!.setDisplayHomeAsUpEnabled(true)
        binding.toolbarSetting.setNavigationOnClickListener {
            backClick()
        }
    }

    private fun initFileList(){
        this.externalCacheDir?.let {
            val filePar = File(it.parent!!+"/files")
            if(filePar.exists() && filePar.isDirectory){
                for (listFile in filePar.listFiles()!!) {
                    if(listFile.isFile && listFile.absolutePath.endsWith(".bin")){
                        addOneFileText(listFile)
                    }
                }
            }
        }
    }

    private fun addOneFileText(file:File){
        fileHashMap[file.name] = file.absolutePath
        val textView = TextView(this)
        textView.text = file.name
        textView.setPadding(20,7,20,7)

        textView.setOnClickListener {
            if(upingFirmware){
                return@setOnClickListener
            }
            val te = (it as TextView).text.toString()
            binding.selectFilePath.text = "升级文件: $te"
            upFilePath = fileHashMap[te].toString()
        }
        binding.filesLayout.addView(textView)
    }

    override fun onBackPressed() {
        backClick()
    }

    private fun initView(){
        binding.selectMyFile.setOnClickListener {
            selectUpFile()
        }

        binding.beginUpBtn.setOnClickListener {
            beginUpgradeDevice()
        }
    }

    private fun selectUpFile(){
        if(upingFirmware){
            Toast.makeText(this@JXFirmwareUpgradeActivity, "正在升级中，请勿重复点击", Toast.LENGTH_SHORT).show()
            return
        }
        val intent = Intent(Intent.ACTION_GET_CONTENT)
        intent.type = "*/*"
        intent.addCategory(Intent.CATEGORY_OPENABLE)
        startActivityForResult(intent, REQUESTCODE_FROM_ACTIVITY)
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (resultCode == RESULT_OK && requestCode==REQUESTCODE_FROM_ACTIVITY) {
            val uri = data!!.data
            val resolver = contentResolver
            val query = resolver.query(uri!!, arrayOf(DocumentsContract.Document.COLUMN_DISPLAY_NAME), null, null, null)
            var fileNameAbs = ""
            if (query != null) {
                if (query.moveToNext()) {
                    fileNameAbs = query.getString(0)
                }
                query.close()
            }
            if(!fileNameAbs.endsWith(".bin")){
                Toast.makeText(this@JXFirmwareUpgradeActivity, "选择的文件格式不对", Toast.LENGTH_SHORT).show()
                return
            }
            try {
                //复制文件到本地
                this.externalCacheDir?.let {
                    val filePar = File(it.parent!!+"/files").absolutePath+"/"
                    val firFileStream = resolver.openInputStream(uri)
                    FileUtils.writeInputStreamFromCompletePath(filePar,fileNameAbs,firFileStream)
                    addOneFileText(File(filePar+fileNameAbs))
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }

        }
    }

    /**
     * 开始升级
     */
    private fun beginUpgradeDevice(){
        if(upingFirmware){
            Toast.makeText(this@JXFirmwareUpgradeActivity, "正在升级中，请勿重复点击", Toast.LENGTH_SHORT).show()
            return
        }

        if(upFilePath.isNullOrEmpty()){
            Toast.makeText(this@JXFirmwareUpgradeActivity, "请在下方列表中选择一个文件，若没有，则先添加一个文件!", Toast.LENGTH_LONG).show()
            return
        }
        if(!upFilePath.endsWith(".bin")){
            Toast.makeText(this@JXFirmwareUpgradeActivity, "文件格式错误！！", Toast.LENGTH_SHORT).show()
            return
        }

        //获取当前绑定的设备
        var device = BluetoothUtil.getWristBand()
        if(device == null && mUpDeviceName.isEmpty()){
            Toast.makeText(this@JXFirmwareUpgradeActivity, "当前未绑定设备", Toast.LENGTH_SHORT).show()
            return
        }
        if(device!=null){
            mUpDeviceName = device.name
            mUpDeviceAddress = device.address
        }

        if (mBluzConnector == null) {
            if (upgradeType == ConnectType.CLASSIC_TYPE) {
                BluzDeviceFactory.setUUID(UUID.fromString("00006666-0000-1000-8000-00805F9B34FB"))
                mBluzConnector = BluzDeviceFactory.getDevice(this, BluzDeviceFactory.ConnectionType.SPP_ONLY)
            } else {
                mBluzConnector = BluzDeviceFactory.getDevice(this, BluzDeviceFactory.ConnectionType.BLE)
            }
            mBluzConnector?.setOnDiscoveryListener(mOnDiscoveryListener)
            mBluzConnector?.setOnConnectionListener(mOnConnectionListener)
        }
        if(upgradeType == ConnectType.CLASSIC_TYPE){
            //3.0一定要先断连重新搜索，确保连接的是3.0
            BluetoothUtil.disconnect(false)
            scanJxDevice()
        }else{
            //已经连接的设备，表明设备处于手机附近中,可以直接连接
            if(BluetoothUtil.isConnected()){
                connectJxDevice()
            }else{
                scanJxDevice()
            }
        }
    }

    private fun scanJxDevice(){
        //开始搜索当前传入的设备名称
        //没有名称时则自行改流程，手动连接搜索到的设备
        mBluzConnector?.startDiscovery()
    }

    @SuppressLint("MissingPermission")
    private fun connectJxDevice() {
        if(mUpDeviceAddress.isNullOrEmpty()){
            Toast.makeText(this@JXFirmwareUpgradeActivity, "连接设备时地址为空！！", Toast.LENGTH_SHORT).show()
            return
        }

        var bluetoothManager = this.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager
        var bluetoothAdapter = bluetoothManager.adapter
        val device = bluetoothAdapter.getRemoteDevice(mUpDeviceAddress)
        Log.v("JXUpgrade", "强行获取的设备: " +  device.name +" // "+device.type)
        mBluzConnector?.connect(device)
    }

    @SuppressLint("MissingPermission")
    private val mOnDiscoveryListener: IBluzDevice.OnDiscoveryListener = object :
        IBluzDevice.OnDiscoveryListener {
        override fun onConnectionStateChanged(device: BluetoothDevice, state: Int) {

        }

        override fun onDiscoveryStarted() {

        }

        override fun onDiscoveryFinished() {

        }

        override fun onFound(device: BluetoothDevice, type: Int) {
            val deviceType = device.type
            Log.v("JXUpgrade", "device " + device.name + " type: " + deviceType + " foundType: " + type)
            if (device.name.isNullOrEmpty() || device.address.isNullOrEmpty()) {
                return
            }
            if(device.name.equals(mUpDeviceName,true)){
                //找到相同名称的设备
                if(upgradeType == ConnectType.CLASSIC_TYPE){
                    //判断是否符合3.0的设备
                    if(device.type == BluetoothDevice.DEVICE_TYPE_CLASSIC || device.type == BluetoothDevice.DEVICE_TYPE_DUAL){
                        mUpDeviceAddress = device.address
                        connectJxDevice()
                    }
                }else{
                    //判断是否符合4.0的设备
                    if(device.type == BluetoothDevice.DEVICE_TYPE_LE || device.type == BluetoothDevice.DEVICE_TYPE_DUAL){
                        mUpDeviceAddress = device.address
                        connectJxDevice()
                    }
                }
            }

        }
    }

    @SuppressLint("MissingPermission")
    private val mOnConnectionListener: IBluzDevice.OnConnectionListener = object :
        IBluzDevice.OnConnectionListener {
        override fun onConnected(device: BluetoothDevice) {
            Log.v("JXUpgrade", "onConnected: " +  device.name +" // " +device.type)
            mConnectDevice = device
            //延迟1.5秒
            SystemClock.sleep(1500)
            startWriteFirmware(device)

        }

        override fun onDisconnected(device: BluetoothDevice) {

        }
    }

    @SuppressLint("MissingPermission")
    private fun startWriteFirmware(device: BluetoothDevice){
        if(upgradeType == ConnectType.CLASSIC_TYPE){
            //3.0升级确保设备支持3.0
            if(device.type == BluetoothDevice.DEVICE_TYPE_LE){
                //设备只有4.0
                setStatusViewMsg("设备不支持经典蓝牙升级!")
                Toast.makeText(this@JXFirmwareUpgradeActivity, "设备不支持经典蓝牙升级!", Toast.LENGTH_SHORT).show()
                return
            }
        }else{
            binding.typeStatusTxt.text ="开始写入固件"
        }
        upingFirmware = true

        if (mOTAManager == null) {
            mOTAManager = OTAManager(this, mBluzConnector!!.io)
            mOTAManager!!.setListener(this)
        }
        //真正的准备升级
        mOTAManager?.let {
            it.setOTAFile(upFilePath)
            it.prepare()
        }
    }

    private fun setStatusViewMsg(msg:String){
        binding.typeStatusTxt.text = msg
    }

    private fun showSuccessOrFailView(isSuccess: Boolean){
        upingFirmware = false
        releaseJx()
        Log.v("JXUpgrade", "OTAManager Status: 释放资源了吗" )
        if(isSuccess) {
            binding.progressTextview.text = "- ${100}% -"
            setStatusViewMsg("升级成功")
        }else{
            setStatusViewMsg("升级失败")
        }

    }

    /**
     *
     */
    private fun releaseJx(){
        mBluzConnector?.let {
            if(mConnectDevice!=null) {
                //要保证调用了断开连接，否则会重复升级
                it.disconnect(mConnectDevice)
            }
            mOTAManager?.cancel()
            mOTAManager?.release()
            it.release()
        }
    }

    /**
     * 释放资源
     */
    override fun onDestroy() {
        super.onDestroy()
        releaseJx()
        binding.root.keepScreenOn = false
    }

    override fun onStatus(state: Int) {
        Log.v("JXUpgrade", "OTAManager Status: $state" )
        if (state == OTAManager.STATE_PREPARED) {
            mOTAStatus = OTAManager.STATE_PREPARED
            //写入文件
            mOTAManager?.upgrade()
        } else if (state == OTAManager.STATE_TRANSFERRED) {
            mOTAStatus = OTAManager.STATE_TRANSFERRED
            //升级成功
            runOnUiThread {
                showSuccessOrFailView(true)
            }
        }else if(state == OTAManager.STATE_UNKNOWN && mOTAStatus == OTAManager.STATE_PREPARING){
            //这里走进异常了，从2没有进3，强行写文件试下
            mOTAStatus = OTAManager.STATE_PREPARED
            //写入文件
            mOTAManager?.upgrade()
        }else{
            mOTAStatus = state
        }
    }

    override fun onAudioDataReceived(p0: Int, p1: Int, p2: ByteArray?) {

    }

    override fun onRemoteStatusReceived(p0: RemoteStatus?) {

    }

    override fun onProgress(progress: Int, total: Int) {
        Log.d("JXUpgrade", "升级的进度： onProgress: $progress - $total" )
        val mP = progress*100/total
        runOnUiThread {
                binding.ctpProgress.progress = mP
                binding.progressTextview.text = "- ${mP}% -"
        }
    }

    override fun onError(errcode: Int, errmsg: String?) {
        Log.v("JXUpgrade", "OTAManager Error: $errcode $errmsg")
        runOnUiThread {
            Toast.makeText(this@JXFirmwareUpgradeActivity, "OTA Error: $errcode $errmsg", Toast.LENGTH_LONG).show()
            showSuccessOrFailView(false)
        }
    }

    override fun onWriteBytes(p0: Int) {
    }
}