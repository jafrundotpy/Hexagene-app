package com.zeroner.bledemo.yylpfe

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.lifecycle.ViewModelProvider
import com.zeroner.bledemo.BleApplication
import com.zeroner.bledemo.R
import com.zeroner.bledemo.databinding.ActivityYylpfeMainBinding
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl
import com.zeroner.blemidautumn.task.BackgroundThreadManager

/**
 *
 * @author Gavin
 * @date 2024/6/17
 */
class YylpfeDemoActivity  : AppCompatActivity(){
    private lateinit var viewModel: YylpfeDemoViewModel
    private lateinit var binding: ActivityYylpfeMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityYylpfeMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        initToolBar()

        viewModel = ViewModelProvider(this, ViewModelProvider.NewInstanceFactory())
            .get(YylpfeDemoViewModel::class.java)
        viewModel.baseMutableLiveData.observe(this) {
            for (s in it) {
                addOneShowText(s)
            }
        }
        initView()
        viewModel.getTabListYYData()
    }

    private fun initView(){
        binding.yyIsModel.setOnClickListener {
            val bytes = ProtoBufSendBluetoothCmdImpl.getInstance().setYYLpfeModeling(true)
            BackgroundThreadManager.getInstance().addWriteData(BleApplication.getInstance(), bytes)
        }
    }

    private fun addOneShowText(msg:String){
        val view = TextView(this)
        view.text = msg
        view.setPadding(20,20,20,20)
        view.textSize = 20f
        binding.yylpfeMainLayout.addView(view)
    }

    private fun initToolBar(){
        val toolbar = findViewById<Toolbar>(R.id.toolbar_device_setting)
        setSupportActionBar(toolbar)
        supportActionBar?.setHomeButtonEnabled(true)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        toolbar.setNavigationOnClickListener {
            finish()
        }
        toolbar.setTitle(R.string.yylpfe_title)

    }
}