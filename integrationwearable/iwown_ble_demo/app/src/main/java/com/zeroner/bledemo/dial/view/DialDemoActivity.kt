package com.zeroner.bledemo.dial.view

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.KeyEvent
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.lifecycle.ViewModelProvider
import com.blankj.utilcode.util.LogUtils
import com.zeroner.bledemo.R
import com.zeroner.bledemo.databinding.ActivityDialDemoBinding
import com.zeroner.bledemo.dial.impl.*
import com.zeroner.bledemo.dial.viewmodel.DialDemoViewModel
import com.zeroner.bledemo.utils.BluetoothUtil
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK
import kotlinx.coroutines.*

const val TIMEOUT = 30 * 1000L

class DialDemoActivity : AppCompatActivity(), IBaseDialContact.IBaseDialProgress {

    private lateinit var viewModel: DialDemoViewModel
    private lateinit var binding: ActivityDialDemoBinding
    private lateinit var sendImpl: IBaseDialContact

    private val runnable: MyRunnable = MyRunnable()
    private val handler:Handler = Handler(Looper.getMainLooper())

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityDialDemoBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.progressBar.visibility = View.VISIBLE

        initToolBar()


        viewModel = ViewModelProvider(this, ViewModelProvider.NewInstanceFactory())
                .get(DialDemoViewModel::class.java)

        if(SuperBleSDK.isMtk(this)){
            /**
             * only mtk now
             */
            sendImpl = MtkSendDialImpl()
        }else if(SuperBleSDK.isProtoBuf(this)){
            /**
             * only protoBuf now
             */
            sendImpl = ProtoBufSendDialImpl()
        }

        /**
         * init SendDialImpl class
         */
        sendImpl.onSetDialInit(this)



        initListener()


    }

    private fun initToolBar(){
        val toolbar = findViewById<Toolbar>(R.id.toolbar_device_setting)
        setSupportActionBar(toolbar)
        supportActionBar?.setHomeButtonEnabled(true)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        toolbar.setNavigationOnClickListener {
            if(viewModel.isSetDial){
                Toast.makeText(this@DialDemoActivity,"set dial,please wait",Toast.LENGTH_SHORT).show()
                return@setNavigationOnClickListener
            }

            finish()
        }
        toolbar.setTitle(R.string.dial_title)

    }

    private fun initListener(){

        viewModel.unZipLiveData.observe(this) {
            if (it) {
                binding.progressBar.visibility = View.GONE
                Toast.makeText(this@DialDemoActivity, "unzip success", Toast.LENGTH_SHORT).show()
                viewModel.isCanSetDial = true

            }
        }


        viewModel.imageAndCommandLiveData.observe(this) {
            //发送表盘信息
            sendImpl.setDialToDevice(it)
            handler.removeCallbacks(runnable)
            handler.postDelayed(runnable, TIMEOUT)
        }


        binding.setDial.setOnClickListener {
            if(viewModel.isCanSetDial){
                viewModel.isSetDial = true
                binding.setDial.isEnabled = false
                getImageAndCommand()
            }
        }

    }

    override fun onDestroy() {
        super.onDestroy()
        sendImpl.onDestroy()
        handler.removeCallbacksAndMessages(null)
    }


    private fun getImageAndCommand(){
        if(SuperBleSDK.isMtk(this)){
            viewModel.handleLocalImageFile()
        }else{
            viewModel.handleLocalImageFilePb()
        }

    }

    override fun onDownloadStart() {
    }

    override fun onProgress(type: ProgressType, progress: Int) {
        LogUtils.i("类型：${type.name}  进度：$progress  线程进度：${Thread.currentThread().name}")
        handler.removeCallbacks(runnable)
        handler.postDelayed(runnable, TIMEOUT)
        handler.post {
            binding.progress.progress = progress
        }
    }

    override fun onDownloadFinish() {
        handler.removeCallbacks(runnable)
        handler.post {
            clearSetting()
            Toast.makeText(this@DialDemoActivity,"send image success",Toast.LENGTH_SHORT).show()
        }
    }

    override fun writeDialHasStop(stopType: DialWriteStopType) {
        Toast.makeText(this@DialDemoActivity,stopType.name,Toast.LENGTH_SHORT).show()
        clearSetting()
    }

    private inner class MyRunnable:Runnable{

        override fun run() {
            clearSetting()
        }

    }

    private fun clearSetting(){
        viewModel.isSetDial = false
        binding.progress.progress = 0
        binding.setDial.isEnabled = true
        handler.removeCallbacks(runnable)
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {

        if(event?.action == KeyEvent.ACTION_DOWN && keyCode == KeyEvent.KEYCODE_BACK){
            if(viewModel.isSetDial){
//                ToastUtils.showShort("set dial,please wait")
                return true
            }
        }

        return super.onKeyDown(keyCode, event)
    }


}