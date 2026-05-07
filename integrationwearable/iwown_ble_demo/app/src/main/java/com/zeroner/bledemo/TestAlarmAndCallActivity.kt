package com.zeroner.bledemo

import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import com.blankj.utilcode.util.ToastUtils
import com.zeroner.bledemo.databinding.ActivityAlmCallTestBinding
import com.zeroner.bledemo.notification.NotificationBiz
import com.zeroner.bledemo.utils.BluetoothUtil
import com.zeroner.bledemo.utils.DateUtil
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK
import com.zeroner.blemidautumn.bluetooth.cmdimpl.MtkSendBluetoothCmdImpl
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl
import com.zeroner.blemidautumn.library.KLog
import com.zeroner.blemidautumn.task.BackgroundThreadManager

/**
 *
 * @author Gavin
 * @date 2021/5/13
 */
class TestAlarmAndCallActivity: AppCompatActivity() {
    private lateinit var binding: ActivityAlmCallTestBinding
    private var alarmTime = 0L
    val mHandler = Handler(Looper.getMainLooper())
    private var number=1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        binding = ActivityAlmCallTestBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.testCallSend.setOnClickListener {
            if(sendCmd()){
                binding.testCallSend.isEnabled = false
                binding.testCallSend.setBackgroundColor(Color.GRAY)
                binding.testCallSend.text = "测试中，请勿退出页面"
            }

        }

    }

    fun sendCmd():Boolean{
        var dateUtil = DateUtil()
        var isOk = false
        if(BluetoothUtil.isConnected()) {
            val mTime: String? = binding.etDelay.text.toString().trim()
            val title: String? = binding.etTitle.text.toString().trim()
            val content: String? = binding.etContent.text.toString().trim()

            if(mTime.isNullOrEmpty()){
                ToastUtils.showShort("请输入时间")
                return false
            }

            if(title.isNullOrEmpty()){
                ToastUtils.showShort("请输入标题")
                return false
            }
            if(content.isNullOrEmpty()){
                ToastUtils.showShort("请输入内容")
                return false
            }

            val times = mTime.split(":")
            var hour = dateUtil.hour
            var min = dateUtil.minute
            try {
                hour = times[0].toInt()
                min = times[1].toInt()
            } catch (e: Exception) {
                ToastUtils.showShort("输入的时间有误")
                return false
            }

            val mDateUtil = DateUtil(dateUtil.year, dateUtil.month, dateUtil.day,hour,min,0)
            alarmTime = mDateUtil.timestamp

//            mDateUtil =
//            val f = alarmTime - System.currentTimeMillis()
//            KLog.i("dd","延迟需要的时间: $f")
            if(SuperBleSDK.isProtoBuf(this)){
                val clearAlarmBytes = ProtoBufSendBluetoothCmdImpl.getInstance().clearAlarm()
                BackgroundThreadManager.getInstance().addWriteData(this, clearAlarmBytes)
                //设置闹钟
                val alarmBytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(this).addAlarm(1,true,0xff,hour,min,content)
                BackgroundThreadManager.getInstance().addWriteData(this, alarmBytes)
                mHandler.postDelayed(Runnable {
                    NotificationBiz.addMsg(0x01, "测试来电$number")
                    val smsCmd = ProtoBufSendBluetoothCmdImpl.getInstance().setMsgNotificationNotifyBySMS(1,"测试","$number-有新的消息推送到来")
                    BackgroundThreadManager.getInstance().addWriteData(this,smsCmd)
                    number++
                    val smsCmd1 = ProtoBufSendBluetoothCmdImpl.getInstance().setMsgNotificationNotifyBySMS(1,"测试","$number-有新的消息推送到来")
                    BackgroundThreadManager.getInstance().addWriteData(this,smsCmd1)
                    binding.testCallSend.isEnabled = true
                    binding.testCallSend.setBackgroundResource(R.drawable.button_shape)
                    binding.testCallSend.text = "开始测试"

                }, (alarmTime - System.currentTimeMillis()).coerceAtLeast(1))
                isOk = true
            }else if(SuperBleSDK.isMtk(this)){
                //设置闹钟
                MtkSendBluetoothCmdImpl.getInstance(this).closeAlarm(1,this)
                MtkSendBluetoothCmdImpl.getInstance(this).writeAlarmClock(this,1,0xff,hour,min,content)
                mHandler.postDelayed(Runnable {
                    NotificationBiz.addMsg(0x01, "测试来电$number")
                    MtkSendBluetoothCmdImpl.getInstance(this).writeAlertFontLibrary(this, 0,"测试|$number-有新的消息推送到来")
                    number++
                    binding.testCallSend.isEnabled = true
                    binding.testCallSend.setBackgroundResource(R.drawable.button_shape)
                    binding.testCallSend.text = "开始测试"

                }, (alarmTime - System.currentTimeMillis()).coerceAtLeast(1))
                isOk = true
            }

        }
        return isOk
    }
}