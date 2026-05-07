package com.zeroner.bledemo

import android.content.Context
import android.os.Bundle
import com.blankj.utilcode.util.ToastUtils
import com.zeroner.bledemo.data.MtkDataParsePresenter
import com.zeroner.bledemo.databinding.ActivityDeviceInfoBinding
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver
import com.zeroner.bledemo.utils.BleReceiverHelper
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK
import com.zeroner.blemidautumn.bluetooth.cmdimpl.MtkSendBluetoothCmdImpl
import com.zeroner.blemidautumn.bluetooth.model.IWDevSetting
import com.zeroner.blemidautumn.bluetooth.model.IWUserInfo
import com.zeroner.blemidautumn.task.BackgroundThreadManager
import com.zeroner.blemidautumn.utils.JsonTool

/**
 * @author YanXi
 *  @date 2021/3/23
 */

class DeviceInfoActivity: BaseActivity() {

    private lateinit var binding: ActivityDeviceInfoBinding
    private val callbackReceiver = MyCallBack()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDeviceInfoBinding.inflate(layoutInflater)
        setContentView(binding.root)
        binding.btRetry.setOnClickListener {
            sendCmd()
        }
        BleReceiverHelper.registerBleReceiver(this, callbackReceiver)
        sendCmd()
    }


    private fun sendCmd(){

        if(SuperBleSDK.isMtk(this)){
            val byte = MtkSendBluetoothCmdImpl.getInstance(this).userProfile
            BackgroundThreadManager.getInstance().addWriteData(this, byte)
            val deviceStateDate = MtkSendBluetoothCmdImpl.getInstance(this).deviceStateDate
            BackgroundThreadManager.getInstance().addWriteData(this, deviceStateDate)
        }else if(SuperBleSDK.isProtoBuf(this)){
            ToastUtils.showShort("不支持获取！")
        }

    }


    private fun showInfo(info: IWUserInfo){

        binding.age.setRightText(info.age.toString())
        binding.height.setRightText(info.height.toString())
        binding.weight.setRightText(info.weight.toString())
        binding.run.setRightText(info.distanceSizeRun.toString())
        binding.walk.setRightText(info.distanceSize.toString())
    }


    override fun onDestroy() {
        super.onDestroy()
        BleReceiverHelper.unregisterBleReceiver(this, callbackReceiver)
    }


    inner class MyCallBack:BluetoothCallbackReceiver(){

        override fun onDataArrived(context: Context?, ble_sdk_type: Int, dataType: Int, data: String?) {

            if(dataType == 0x21){
                val userInfo = JsonTool.fromJson(data, IWUserInfo::class.java)
                showInfo(userInfo)
            }else if(dataType == 0x19){
                val setting = JsonTool.fromJson(data, IWDevSetting::class.java)
                binding.step.setRightText(setting.stepLevel.toString())
                binding.light.setRightText(setting.gestureSensitivity.toString())
            }

        }
    }




}