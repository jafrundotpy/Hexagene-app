package com.zeroner.bledemo.setting.apn

import android.content.Context
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.zeroner.bledemo.BleApplication
import com.zeroner.bledemo.R
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver
import com.zeroner.bledemo.utils.BleReceiverHelper
import com.zeroner.blemidautumn.Constants
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl
import com.zeroner.blemidautumn.bluetooth.model.ProtoBufRealTimeData
import com.zeroner.blemidautumn.task.BackgroundThreadManager
import com.zeroner.blemidautumn.utils.JsonTool
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class ApnSettingActivity : AppCompatActivity() {

    private lateinit var sendBtn: Button
    private lateinit var mccEdit: EditText
    private lateinit var mncEdit: EditText
    private lateinit var apnEdit: EditText

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.apn_set_main)
        sendBtn = findViewById(R.id.sendApnBtn)
        mccEdit = findViewById(R.id.etMcc)
        mncEdit = findViewById(R.id.etMnc)
        apnEdit = findViewById(R.id.etApn)
        initListener()
    }

    override fun onDestroy() {
        super.onDestroy()
    }


    fun initListener(){
        sendBtn.setOnClickListener {
            beginSendCmd()
        }
    }

    fun beginSendCmd(){
        val mccStr = mccEdit.text.toString().trim()
        val mncStr = mncEdit.text.toString().trim()
        val apnStr = apnEdit.text.toString().trim()
        if(mccStr.isEmpty() || mncStr.isEmpty() || apnStr.isEmpty()){
            Toast.makeText(this@ApnSettingActivity,"message is empty", Toast.LENGTH_SHORT).show()
            return
        }

        val bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setDeviceApnInfo("",mccStr.toInt(),mncStr.toInt(),apnStr,0,1,"","")
        BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(), bytes)
        Toast.makeText(this@ApnSettingActivity,"send Success", Toast.LENGTH_SHORT).show()
    }
}