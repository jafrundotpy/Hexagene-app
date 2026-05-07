package com.zeroner.bledemo.dial.impl

import android.os.Handler
import android.os.Looper
import androidx.localbroadcastmanager.content.LocalBroadcastManager
import com.blankj.utilcode.util.Utils
import com.zeroner.bledemo.data.sync.MtkBleSync
import com.zeroner.bledemo.eventbus.DialProgressEvent
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver
import com.zeroner.bledemo.utils.BaseActionUtils
import com.zeroner.bledemo.utils.BluetoothUtil
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK
import com.zeroner.blemidautumn.bluetooth.cmdimpl.MtkSendBluetoothCmdImpl
import coms.mediatek.ctrl.epo.EpoDownloadChangeListener
import coms.mediatek.ctrl.epo.EpoDownloadController
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import org.greenrobot.eventbus.ThreadMode


class MtkSendDialImpl : IBaseDialContact, EpoDownloadChangeListener {

    private lateinit var iBaseDialProgress: IBaseDialContact.IBaseDialProgress
    private var lastProgress = 0
    private var fileByte:ByteArray? = null
    private var mtk1:ByteArray? = null
    private var mtk2:ByteArray? = null
    /** 蓝牙连接的广播 */
    private val bleStatueReceiver by lazy { BleStatueReceiver() }

    private val handler = Handler(Looper.getMainLooper())

    init {
        registerEventBus()
    }

    override fun onSetDialInit(iBaseDialProgress: IBaseDialContact.IBaseDialProgress) {
        this.iBaseDialProgress = iBaseDialProgress
        LocalBroadcastManager.getInstance(Utils.getApp()).registerReceiver(bleStatueReceiver, BaseActionUtils.getIntentFilter())
        EpoDownloadController.removeAllListener()
        EpoDownloadController.addListener(this)
    }

    /**
     * size = 3
     */
    override fun setDialToDevice(byteArray: List<ByteArray>) {
        if(byteArray.size >= 3) {
            this.fileByte = byteArray[0]
            this.mtk1 = byteArray[1]
            this.mtk2 = byteArray[2]
            setMtkDial()
//            MtkSendBluetoothCmdImpl.getInstance(Utils.getApp()).setCustomDial(Utils.getApp(), byteArray[0], byteArray[1])
        }
    }

    /**
     * mtk写入表盘字节
     */
    private fun setMtkDial(){
        if (!BluetoothUtil.isConnected()) {
            //断连
            iBaseDialProgress.writeDialHasStop(DialWriteStopType.BLE_DISCONNECT)
        }else if(MtkBleSync.getInstance().isSyncing){
            //正在同步数据
            iBaseDialProgress.writeDialHasStop(DialWriteStopType.SYNC)
        }else{
            MtkSendBluetoothCmdImpl.getInstance(Utils.getApp()).clearCustomDial()
            iBaseDialProgress.onDownloadStart()
            iBaseDialProgress.onProgress(ProgressType.WRITE, 0)
        }
    }

    override fun downloadDialFile(device: String, dialId: String, urlList: MutableList<String>) {

    }

    override fun finishAllProcess() {
    }


    override fun notifyProgressChanged(percent: Float) {
        //mtk写入图片文件的回调
        try {
            val progress = (percent * 100f).toInt()
            if(lastProgress != progress){
                iBaseDialProgress.onProgress(ProgressType.WRITE, progress)
                lastProgress = progress
            }
            if(progress >= 100) {
                iBaseDialProgress.onDownloadFinish()
                handler.removeCallbacksAndMessages(null)
                handler.postDelayed({
                    MtkSendBluetoothCmdImpl.getInstance(Utils.getApp()).setCustomDial(Utils.getApp(),mtk1!!, mtk2!!)
                }, 600)
            }

        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun notifyDownloadResult(result: Int) {
    }

    override fun notifyConnectionChanged(state: Int) {
    }


    private fun registerEventBus(){
        EventBus.getDefault().register(this)
    }

    private fun unregisterEventBus(){
        EventBus.getDefault().unregister(this)
    }

    /**
     * 退出activity时调用此方法
     */
    override fun onDestroy(){
        LocalBroadcastManager.getInstance(Utils.getApp()).unregisterReceiver(bleStatueReceiver)
        unregisterEventBus()
        clearDeviceDial()
        handler.removeCallbacksAndMessages(null)
    }

    private inner class BleStatueReceiver : BluetoothCallbackReceiver() {
        override fun onBluetoothInit() {}
        override fun connectStatue(isConnect: Boolean) {
            super.connectStatue(isConnect)
            if (!isConnect) {
                iBaseDialProgress.writeDialHasStop(DialWriteStopType.BLE_DISCONNECT)
            }
        }
    }

    /**
     * 清除表盘指令
     */
    fun clearDeviceDial(){
        EpoDownloadController.removeAllListener()
        EpoDownloadController.getInstance().cancelWriteDial()
    }

    /**
     * protobuf写入文件返回的进度条
     */
    @Subscribe(threadMode = ThreadMode.MAIN)
    fun onEventMainThread(writeEvent: DialProgressEvent) {
        if(writeEvent.isClear){
            //清除回应，下发指令 必须在清除指令之后发送
            EpoDownloadController.getInstance().writeCustomDialBytes(fileByte)
            return
        }

//        iBaseDialProgress.onProgress(ProgressType.WRITE, writeEvent.progress)
        if(writeEvent.isOk){
            //表盘已经写入结束
            iBaseDialProgress.writeDialHasStop(DialWriteStopType.SUCCESS)
        }else if(writeEvent.progress == 100){
            iBaseDialProgress.onDownloadFinish()
        }
    }
}