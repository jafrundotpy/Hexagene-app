package com.zeroner.bledemo.setting

import android.content.Context
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.zeroner.bledemo.R
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver
import com.zeroner.bledemo.utils.BleReceiverHelper
import com.zeroner.blemidautumn.Constants
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK
import com.zeroner.blemidautumn.bluetooth.model.ProtoBufRealTimeData
import com.zeroner.blemidautumn.task.BackgroundThreadManager
import com.zeroner.blemidautumn.utils.JsonTool
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

/**
 * Time: 2024/1/30
 * Author: ZhengHuaizhi
 * Description:
 */
class MeasureHealthActivity : AppCompatActivity() {

    private lateinit var btnMeasure: Button
    private lateinit var tvMeasureHealthResult: TextView
    private lateinit var mReceiver: MyDataReceive

    private inner class MyDataReceive : BluetoothCallbackReceiver() {
        override fun onDataArrived(context: Context?, ble_sdk_type: Int, dataType: Int, data: String?) {
            super.onDataArrived(context, ble_sdk_type, dataType, data)
            if (ble_sdk_type == Constants.Bluetooth.Zeroner_protobuf_Sdk) {
                if (dataType == 0x70) {
                    val realTimeData = JsonTool.fromJson(data, ProtoBufRealTimeData::class.java)
                    val result = realTimeData.toStringHealthResult()
                    tvMeasureHealthResult.text = result
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_measure_health)

        mReceiver = MyDataReceive()
        BleReceiverHelper.registerBleReceiver(this, mReceiver)

        btnMeasure = findViewById(R.id.btn_measure_health)
        tvMeasureHealthResult = findViewById(R.id.tv_measure_health_result)

        btnMeasure.setOnClickListener {
            val bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(this).setAllMeasure(true)
            BackgroundThreadManager.getInstance().addWriteData(this, bytes)

            btnMeasure.isEnabled = false
            btnMeasure.isClickable = false
            lifecycleScope.launch(Dispatchers.IO) {
                for (count in 59 downTo 0) {
                    withContext(Dispatchers.Main) {
                        btnMeasure.text = "$count"
                    }
                    delay(1000)
                }
                withContext(Dispatchers.Main) {
                    btnMeasure.isEnabled = true
                    btnMeasure.isClickable = true
                    btnMeasure.text = getString(R.string.setting_all_measure)
                }
            }
        }
    }

    override fun onDestroy() {
        BleReceiverHelper.unregisterBleReceiver(this, mReceiver)
        super.onDestroy()
    }
}