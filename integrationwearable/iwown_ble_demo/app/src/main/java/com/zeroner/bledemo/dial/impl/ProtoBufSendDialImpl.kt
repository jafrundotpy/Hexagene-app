package com.zeroner.bledemo.dial.impl

import android.os.Handler
import android.os.Looper
import com.blankj.utilcode.util.Utils
import com.zeroner.bledemo.data.sync.ProtoBufUpdate
import com.zeroner.bledemo.eventbus.DialProgressEvent
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl
import com.zeroner.blemidautumn.task.BackgroundThreadManager
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import org.greenrobot.eventbus.ThreadMode

class ProtoBufSendDialImpl:IBaseDialContact {


    private lateinit var iBaseDialProgress: IBaseDialContact.IBaseDialProgress
    private var fileByte:ByteArray? = null
    private var pbBin:ByteArray? = null
    private val handler = Handler(Looper.getMainLooper())

    init {
        registerEventBus()
    }

    override fun onSetDialInit(iBaseDialProgress: IBaseDialContact.IBaseDialProgress) {
        this.iBaseDialProgress = iBaseDialProgress
    }

    override fun setDialToDevice(byteArray: List<ByteArray>) {
        if(byteArray.size >= 2) {
            fileByte = byteArray[0]
            pbBin = byteArray[1]
            setProtoBufDial()
        }
    }

    override fun downloadDialFile(device: String, dialId: String, urlList: MutableList<String>) {

    }

    override fun finishAllProcess() {

    }

    override fun onDestroy() {
        unregisterEventBus()
        ProtoBufUpdate.getInstance().stopWriteDial()
        handler.removeCallbacksAndMessages(null)
    }

    private fun registerEventBus(){
        EventBus.getDefault().register(this)
    }

    private fun unregisterEventBus(){
        EventBus.getDefault().unregister(this)
    }


    private fun setProtoBufDial(): Boolean{
        when (ProtoBufUpdate.getInstance().startUpdateDial()) {
            1 -> {
                //断连了
                iBaseDialProgress.writeDialHasStop(DialWriteStopType.BLE_DISCONNECT)
                return false
            }
            2 -> {
                //正在同步数据(agps也是同步的一部分)
                iBaseDialProgress.writeDialHasStop(DialWriteStopType.SYNC)
                return false
            }
            else -> {
                //正在写入表盘，进度通过eventBus返回
                iBaseDialProgress.onDownloadStart()
                iBaseDialProgress.onProgress(ProgressType.WRITE, 0)
                return true
            }
        }
    }

    /**
     * protobuf写入文件返回的进度条
     */
    @Subscribe(threadMode = ThreadMode.MAIN)
    fun onEventMainThread(writeEvent: DialProgressEvent) {
        if(writeEvent.isClear){
            //清除回应，下发指令 必须在清除指令之后发送
            ProtoBufUpdate.getInstance().beginWriteDial(fileByte)
            return
        }

        iBaseDialProgress.onProgress(ProgressType.WRITE, writeEvent.progress)
        if(writeEvent.isOk){
            //表盘已经写入结束
            iBaseDialProgress.writeDialHasStop(DialWriteStopType.SUCCESS)
        }else if(writeEvent.progress == 100){
            iBaseDialProgress.onDownloadFinish()
            handler.removeCallbacksAndMessages(null)
            handler.postDelayed({
                val cmd = ProtoBufSendBluetoothCmdImpl.getInstance().setCustomDial(pbBin,1)
                BackgroundThreadManager.getInstance().addWriteData(Utils.getApp(),cmd)
            }, 600)
        }
    }
}