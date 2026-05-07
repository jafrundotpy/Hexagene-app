package com.zeroner.bledemo

import android.graphics.Color
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.Message
import android.text.Editable
import android.text.TextWatcher
import android.view.KeyEvent
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import com.blankj.utilcode.util.ToastUtils
import com.zeroner.bledemo.databinding.ActivityNotificationTestBinding
import com.zeroner.bledemo.utils.BluetoothUtil
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK
import com.zeroner.blemidautumn.bluetooth.cmdimpl.MtkSendBluetoothCmdImpl
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl
import com.zeroner.blemidautumn.task.BackgroundThreadManager
import java.lang.ref.WeakReference

const val OPTION_NOTIFY = 1

class NotificationTest : AppCompatActivity() {

    private val handler:MyHandler = MyHandler(this)

    private var delay = 5
    private var currentDelay = 0
    private var isCanBack = true
    private var number=1;

    private lateinit var binding: ActivityNotificationTestBinding;


    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        binding = ActivityNotificationTestBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.etDelay.setText(delay.toString())


        binding.send.setOnClickListener {
            isCanBack = true
            delay = binding.etDelay.text.toString().toInt()
            handler.removeMessages(OPTION_NOTIFY)
            handler.sendEmptyMessage(OPTION_NOTIFY)
            binding.send.isEnabled = false
            binding.send.setBackgroundColor(Color.GRAY);
        }

        binding.stop.setOnClickListener {
            isCanBack = false
            binding.send.isEnabled = true
            binding.send.setBackgroundResource(R.color.blue)
            handler.removeMessages(OPTION_NOTIFY)
        }

    }
    companion object{

        private class MyHandler(instance:NotificationTest) : Handler(Looper.getMainLooper()){

            private var myWeakReference:WeakReference<NotificationTest> = WeakReference(instance)

            override fun handleMessage(msg: Message) {
                super.handleMessage(msg)
                val activity = myWeakReference.get()
                when(msg.what){
                    OPTION_NOTIFY->{
                        activity?.let {
                            it.currentDelay = it.currentDelay + 1
                            if(it.currentDelay >= it.delay){
                                it.currentDelay = 0
                                it.sendCmd()
                            }
                            removeMessages(OPTION_NOTIFY)
                            sendEmptyMessageDelayed(OPTION_NOTIFY,1000L)
                            it.binding.send.text = "继续发送 ${it.delay - it.currentDelay}"
                        }

                    }
                }
            }

        }
    }


    private fun sendCmd(){
        if(BluetoothUtil.isConnected()){
            val title:String? = binding.etTitle.text.toString().trim()
            var content:String? = binding.etContent.text.toString().trim();
            if(title.isNullOrEmpty()){
                ToastUtils.showShort("请输入标题")
                return
            }
            if(content.isNullOrEmpty()){
                ToastUtils.showShort("请输入内容")
                return
            }
            content = "$number-$content"
            number++
            if(SuperBleSDK.isMtk(this)){
                MtkSendBluetoothCmdImpl.getInstance(this).writeAlertFontLibrary(this, 0,"$title|$content")
            }else if(SuperBleSDK.isProtoBuf(this)){
                val cmd = ProtoBufSendBluetoothCmdImpl.getInstance().setMsgNotificationNotifyBySMS(1,title,content)
                BackgroundThreadManager.getInstance().addWriteData(this,cmd);
            }
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if(keyCode == KeyEvent.KEYCODE_BACK && event!!.action == KeyEvent.ACTION_DOWN){
            if(isCanBack){
                ToastUtils.showShort("退出请点击停止按钮")
                return true
            }

        }
        return super.onKeyDown(keyCode, event)
    }


}