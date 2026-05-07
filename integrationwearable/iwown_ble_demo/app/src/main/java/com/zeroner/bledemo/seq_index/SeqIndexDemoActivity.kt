package com.zeroner.bledemo.seq_index

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.lifecycle.ViewModelProvider
import com.zeroner.bledemo.BleApplication
import com.zeroner.bledemo.R
import com.zeroner.bledemo.bean.sql.ProtoBuf_index_record
import com.zeroner.bledemo.databinding.ActivitySeqIndexMainBinding
import com.zeroner.bledemo.databinding.ActivityYylpfeMainBinding
import com.zeroner.bledemo.utils.DateUtil
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl
import com.zeroner.blemidautumn.task.BackgroundThreadManager
import org.litepal.crud.DataSupport

/**
 *
 * @author Gavin
 * @date 2024/6/17
 */
class SeqIndexDemoActivity  : AppCompatActivity(){
    private lateinit var binding: ActivitySeqIndexMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySeqIndexMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        initToolBar()
        initView()
    }

    private fun initView(){
        val dateU = DateUtil()
        dateU.addDay(-2)
        dateU.zeroTime
        val tbList = DataSupport.where("time>?",dateU.zeroTime.toString()).find(ProtoBuf_index_record::class.java)
        for (protobufIndexRecord in tbList) {
            addOneShowText(protobufIndexRecord)
        }
    }

    private fun addOneShowText(tb:ProtoBuf_index_record){
        val view = TextView(this)
        val timeD = DateUtil(tb.time,true)
        if(tb.type==-1){
            val sf = if(tb.over==1){
                "已结束"
            }else{
                "未完成"
            }
            val dfB = StringBuilder().append("同步数据：").append(timeD.y_M_D_H_M_S)
                .append(" *手表: ").append(tb.data_from)
            view.text = dfB
            view.textSize = 20f
        }else{
            val time11 = DateUtil(tb.data_time,true)
            val time22 = DateUtil(tb.up_time,true)
            val dfB = StringBuilder().append("类型：【").append(tb.type_str).append("】")
                .append(" *数据日期: ").append(time11.y_M_D)
                .append(" *seq开始-结束: ").append(tb.start_idx).append("-").append(tb.end_idx)
                .append(" *同步时间: ").append(time22.y_M_D_H_M_S)
            view.text = dfB
            view.textSize = 14f
        }
        view.setPadding(20,20,20,20)
        binding.seqAddLayout.addView(view)
    }

    private fun initToolBar(){
        val toolbar = findViewById<Toolbar>(R.id.toolbar_device_setting)
        setSupportActionBar(toolbar)
        supportActionBar?.setHomeButtonEnabled(true)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        toolbar.setNavigationOnClickListener {
            finish()
        }
        toolbar.setTitle("数据同步类型Index")

    }
}