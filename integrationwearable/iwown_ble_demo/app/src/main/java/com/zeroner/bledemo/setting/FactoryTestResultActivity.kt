package com.zeroner.bledemo.setting

import android.content.Context
import android.os.Bundle
import android.os.CountDownTimer
import android.view.View
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import com.blankj.utilcode.util.GsonUtils
import com.zeroner.bledemo.R
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver
import com.zeroner.bledemo.utils.BleReceiverHelper
import com.zeroner.bledemo.view.LoadingDialog
import com.zeroner.blemidautumn.Constants
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl
import com.zeroner.blemidautumn.bluetooth.model.ProtoBufFactoryTestData

/**
 * Time: 2023/11/8
 * Author: ZhengHuaizhi
 * Description:
 */
class FactoryTestResultActivity: AppCompatActivity() {

    companion object {
        const val PROTOBUF_FACTORY_TEST = 0x0F
    }

    private lateinit var mToolbar: Toolbar
    private lateinit var tvMotor: TextView
    private lateinit var tvLight: TextView
    private lateinit var tvTemperature: TextView
    private lateinit var tvHeartRateWear: TextView
    private lateinit var tvEcgTouch: TextView
    private lateinit var tvEcgSignal: TextView
    private lateinit var tvLcd: TextView
    private lateinit var tvTp: TextView
    private lateinit var tvGps: TextView
    private lateinit var tvBioz: TextView
    private lateinit var tvSpo2Leak: TextView
    private lateinit var tvHeartRateLeak: TextView
    private lateinit var tvGreyCard: TextView
    private lateinit var tvGravitySensor: TextView
    private lateinit var tvOffBody: TextView
    private lateinit var tvKey: TextView
    private lateinit var tvSpl17: TextView
    private lateinit var tvLoopTest: TextView
    private lateinit var tvGsm: TextView
    private lateinit var tvWifi: TextView
    private lateinit var tvPressureSensor: TextView
    private lateinit var tvKnob: TextView
    private lateinit var tvOximeter: TextView
    private lateinit var tvProxCali: TextView

    private lateinit var mDialog: LoadingDialog
    private lateinit var mDataReceiver: MyFactoryTestResultReceiver

    /** 工厂测试结果接收器 */
    private inner class MyFactoryTestResultReceiver: BluetoothCallbackReceiver() {

        override fun onDataArrived(context: Context?, ble_sdk_type: Int, dataType: Int, data: String?) {
            super.onDataArrived(context, ble_sdk_type, dataType, data)
            if (ble_sdk_type == Constants.Bluetooth.Zeroner_protobuf_Sdk && dataType == PROTOBUF_FACTORY_TEST) {
                refreshUI(data)
            }
        }
    }

    /** 10s读取报告倒计时 */
    private val mTimer: CountDownTimer by lazy {
        object : CountDownTimer(10 * 1000L, 1000) {
            override fun onTick(millisUntilFinished: Long) {
            }

            override fun onFinish() {
                if (mDialog.isShowing) {
                    mDialog.dismiss()
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_factory_test_result)

        mDataReceiver = MyFactoryTestResultReceiver()
        BleReceiverHelper.registerBleReceiver(this, mDataReceiver)

        initView()

        ProtoBufSendBluetoothCmdImpl.getInstance().getInspectionReport(this)
    }

    override fun onStop() {
        super.onStop()
        mTimer.onFinish()
    }

    private fun initView() {
        mToolbar = findViewById(R.id.factory_test_result_toolbar)
        tvMotor = findViewById(R.id.tv_motor)
        tvLight = findViewById(R.id.tv_light)
        tvTemperature = findViewById(R.id.tv_temperature)
        tvHeartRateWear = findViewById(R.id.tv_hr)
        tvEcgTouch = findViewById(R.id.tv_ecg_touch)
        tvEcgSignal = findViewById(R.id.tv_hrv)
        tvLcd = findViewById(R.id.tv_lcd)
        tvTp = findViewById(R.id.tv_tp)
        tvGps = findViewById(R.id.tv_gps)
        tvBioz = findViewById(R.id.tv_bioz)
        tvSpo2Leak = findViewById(R.id.tv_max32664)
        tvHeartRateLeak = findViewById(R.id.tv_hr_leak)
        tvGreyCard = findViewById(R.id.tv_grey_card)
        tvGravitySensor = findViewById(R.id.tv_gsensor)
        tvOffBody = findViewById(R.id.tv_offbody)
        tvKey = findViewById(R.id.tv_key)
        tvSpl17 = findViewById(R.id.tv_spl17)
        tvLoopTest = findViewById(R.id.tv_looptest)
        tvGsm = findViewById(R.id.tv_gsm)
        tvWifi = findViewById(R.id.tv_wifi)
        tvPressureSensor = findViewById(R.id.tv_pressure_sensor)
        tvKnob = findViewById(R.id.tv_knob)
        tvOximeter = findViewById(R.id.tv_oximeter)
        tvProxCali = findViewById(R.id.tv_prox_cali)

        initTitleBar()

        mDialog = LoadingDialog(this, true)
        mDialog.show()

        mTimer.start()
    }

    private fun initTitleBar() {
        setSupportActionBar(mToolbar)
        supportActionBar?.setHomeButtonEnabled(true)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)
        mToolbar.setNavigationOnClickListener {
            finish()
        }
    }

    private fun refreshUI(data: String?) {
        try {
            val bean = GsonUtils.fromJson(data, ProtoBufFactoryTestData::class.java)
            val strOK = getString(R.string.result_ok)
            val colorOK = ContextCompat.getColor(this, R.color.colorPrimary)
            val strNG = getString(R.string.result_ng)
            val colorNG = ContextCompat.getColor(this, R.color.red_1)

            if (bean.motor == null) {
                findViewById<ConstraintLayout>(R.id.cl_motor).visibility = View.GONE
            } else if (bean.motor != 0) {
                tvMotor.text = strOK
                tvMotor.setTextColor(colorOK)
            } else {
                tvMotor.text = strNG
                tvMotor.setTextColor(colorNG)
            }
            if (bean.light == null) {
                findViewById<ConstraintLayout>(R.id.cl_light).visibility = View.GONE
            } else if (bean.light != 0) {
                tvLight.text = strOK
                tvLight.setTextColor(colorOK)
            } else {
                tvLight.text = strNG
                tvLight.setTextColor(colorNG)
            }
            if (bean.temperature == null) {
                findViewById<ConstraintLayout>(R.id.cl_temperature).visibility = View.GONE
            } else if (bean.temperature != 0) {
                tvTemperature.text = strOK
                tvTemperature.setTextColor(colorOK)
            } else {
                tvTemperature.text = strNG
                tvTemperature.setTextColor(colorNG)
            }
            if (bean.heartRateWear == null) {
                findViewById<ConstraintLayout>(R.id.cl_hr).visibility = View.GONE
            } else if (bean.heartRateWear != 0) {
                tvHeartRateWear.text = strOK
                tvHeartRateWear.setTextColor(colorOK)
            } else {
                tvHeartRateWear.text = strNG
                tvHeartRateWear.setTextColor(colorNG)
            }
            if (bean.ecgTouch == null) {
                findViewById<ConstraintLayout>(R.id.cl_ecg_touch).visibility = View.GONE
            } else if (bean.ecgTouch != 0) {
                tvEcgTouch.text = strOK
                tvEcgTouch.setTextColor(colorOK)
            } else {
                tvEcgTouch.text = strNG
                tvEcgTouch.setTextColor(colorNG)
            }
            if (bean.ecgSignal == null) {
                findViewById<ConstraintLayout>(R.id.cl_hrv).visibility = View.GONE
            } else if (bean.ecgSignal != 0) {
                tvEcgSignal.text = strOK
                tvEcgSignal.setTextColor(colorOK)
            } else {
                tvEcgSignal.text = strNG
                tvEcgSignal.setTextColor(colorNG)
            }
            if (bean.lcd == null) {
                findViewById<ConstraintLayout>(R.id.cl_lcd).visibility = View.GONE
            } else if (bean.lcd != 0) {
                tvLcd.text = strOK
                tvLcd.setTextColor(colorOK)
            } else {
                tvLcd.text = strNG
                tvLcd.setTextColor(colorNG)
            }
            if (bean.tp == null) {
                findViewById<ConstraintLayout>(R.id.cl_tp).visibility = View.GONE
            } else if (bean.tp != 0) {
                tvTp.text = strOK
                tvTp.setTextColor(colorOK)
            } else {
                tvTp.text = strNG
                tvTp.setTextColor(colorNG)
            }
            if (bean.gps == null) {
                findViewById<ConstraintLayout>(R.id.cl_gps).visibility = View.GONE
            } else if (bean.gps != 0) {
                tvGps.text = strOK
                tvGps.setTextColor(colorOK)
            } else {
                tvGps.text = strNG
                tvGps.setTextColor(colorNG)
            }
            if (bean.bioz == null) {
                findViewById<ConstraintLayout>(R.id.cl_bioz).visibility = View.GONE
            } else if (bean.bioz != 0) {
                tvBioz.text = strOK
                tvBioz.setTextColor(colorOK)
            } else {
                tvBioz.text = strNG
                tvBioz.setTextColor(colorNG)
            }
            if (bean.spo2Leak == null) {
                findViewById<ConstraintLayout>(R.id.cl_max32664).visibility = View.GONE
            } else if (bean.spo2Leak != 0) {
                tvSpo2Leak.text = strOK
                tvSpo2Leak.setTextColor(colorOK)
            } else {
                tvSpo2Leak.text = strNG
                tvSpo2Leak.setTextColor(colorNG)
            }
            if (bean.heartRateLeak == null) {
                findViewById<ConstraintLayout>(R.id.cl_hr_leak).visibility = View.GONE
            } else if (bean.heartRateLeak != 0) {
                tvHeartRateLeak.text = strOK
                tvHeartRateLeak.setTextColor(colorOK)
            } else {
                tvHeartRateLeak.text = strNG
                tvHeartRateLeak.setTextColor(colorNG)
            }
            if (bean.greyCard == null) {
                findViewById<ConstraintLayout>(R.id.cl_grey_card).visibility = View.GONE
            } else if (bean.greyCard != 0) {
                tvGreyCard.text = strOK
                tvGreyCard.setTextColor(colorOK)
            } else {
                tvGreyCard.text = strNG
                tvGreyCard.setTextColor(colorNG)
            }
            if (bean.gSensor == null) {
                findViewById<ConstraintLayout>(R.id.cl_gsensor).visibility = View.GONE
            } else if (bean.gSensor != 0) {
                tvGravitySensor.text = strOK
                tvGravitySensor.setTextColor(colorOK)
            } else {
                tvGravitySensor.text = strNG
                tvGravitySensor.setTextColor(colorNG)
            }
            if (bean.offBody == null) {
                findViewById<ConstraintLayout>(R.id.cl_offbody).visibility = View.GONE
            } else if (bean.offBody != 0) {
                tvOffBody.text = strOK
                tvOffBody.setTextColor(colorOK)
            } else {
                tvOffBody.text = strNG
                tvOffBody.setTextColor(colorNG)
            }
            if (bean.key == null) {
                findViewById<ConstraintLayout>(R.id.cl_key).visibility = View.GONE
            } else if (bean.key != 0) {
                tvKey.text = strOK
                tvKey.setTextColor(colorOK)
            } else {
                tvKey.text = strNG
                tvKey.setTextColor(colorNG)
            }
            if (bean.spl17 == null) {
                findViewById<ConstraintLayout>(R.id.cl_spl17).visibility = View.GONE
            } else if (bean.spl17 != 0) {
                tvSpl17.text = strOK
                tvSpl17.setTextColor(colorOK)
            } else {
                tvSpl17.text = strNG
                tvSpl17.setTextColor(colorNG)
            }
            if (bean.loopTest == null) {
                findViewById<ConstraintLayout>(R.id.cl_looptest).visibility = View.GONE
            } else if (bean.loopTest != 0) {
                tvLoopTest.text = strOK
                tvLoopTest.setTextColor(colorOK)
            } else {
                tvLoopTest.text = strNG
                tvLoopTest.setTextColor(colorNG)
            }
            if (bean.gsm == null) {
                findViewById<ConstraintLayout>(R.id.cl_gsm).visibility = View.GONE
            } else if (bean.gsm != 0) {
                tvGsm.text = strOK
                tvGsm.setTextColor(colorOK)
            } else {
                tvGsm.text = strNG
                tvGsm.setTextColor(colorNG)
            }
            if (bean.wifi == null) {
                findViewById<ConstraintLayout>(R.id.cl_wifi).visibility = View.GONE
            } else if (bean.wifi != 0) {
                tvWifi.text = strOK
                tvWifi.setTextColor(colorOK)
            } else {
                tvWifi.text = strNG
                tvWifi.setTextColor(colorNG)
            }
            if (bean.pressureSensor == null) {
                findViewById<ConstraintLayout>(R.id.cl_pressure_sensor).visibility = View.GONE
            } else if (bean.pressureSensor != 0) {
                tvPressureSensor.text = strOK
                tvPressureSensor.setTextColor(colorOK)
            } else {
                tvPressureSensor.text = strNG
                tvPressureSensor.setTextColor(colorNG)
            }
            if (bean.knob == null) {
                findViewById<ConstraintLayout>(R.id.cl_knob).visibility = View.GONE
            } else if (bean.knob != 0) {
                tvKnob.text = strOK
                tvKnob.setTextColor(colorOK)
            } else {
                tvKnob.text = strNG
                tvKnob.setTextColor(colorNG)
            }
            if (bean.oximeter == null) {
                findViewById<ConstraintLayout>(R.id.cl_oximeter).visibility = View.GONE
            } else if (bean.oximeter != 0) {
                tvOximeter.text = strOK
                tvOximeter.setTextColor(colorOK)
            } else {
                tvOximeter.text = strNG
                tvOximeter.setTextColor(colorNG)
            }
            if (bean.proxCali == null) {
                findViewById<ConstraintLayout>(R.id.cl_prox_cali).visibility = View.GONE
            } else if (bean.knob != 0) {
                tvProxCali.text = strOK
                tvProxCali.setTextColor(colorOK)
            } else {
                tvProxCali.text = strNG
                tvProxCali.setTextColor(colorNG)
            }
            mTimer.onFinish()
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}