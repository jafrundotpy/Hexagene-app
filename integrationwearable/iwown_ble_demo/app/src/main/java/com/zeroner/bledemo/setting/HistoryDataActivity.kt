package com.zeroner.bledemo.setting

import android.content.Context
import android.os.Bundle
import android.view.View
import android.widget.AdapterView
import android.widget.Button
import android.widget.CheckBox
import android.widget.Spinner
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.Toolbar
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.blankj.utilcode.util.LogUtils
import com.chad.library.adapter.base.BaseMultiItemQuickAdapter
import com.chad.library.adapter.base.BaseQuickAdapter
import com.chad.library.adapter.base.BaseViewHolder
import com.zeroner.bledemo.BuildConfig
import com.zeroner.bledemo.R
import com.zeroner.bledemo.bean.sql.TB_f1_index
import com.zeroner.bledemo.data.MtkDataParsePresenter
import com.zeroner.bledemo.data.sync.BleIndexDataParse
import com.zeroner.bledemo.receiver.BluetoothCallbackReceiver
import com.zeroner.bledemo.utils.BaseActionUtils
import com.zeroner.bledemo.utils.BleReceiverHelper
import com.zeroner.bledemo.utils.JsonUtils
import com.zeroner.bledemo.utils.PrefUtil
import com.zeroner.blemidautumn.Constants
import com.zeroner.blemidautumn.bluetooth.BleFactory
import com.zeroner.blemidautumn.bluetooth.cmdimpl.MtkSendBluetoothCmdImpl
import com.zeroner.blemidautumn.bluetooth.cmdimpl.ProtoBufSendBluetoothCmdImpl
import com.zeroner.blemidautumn.bluetooth.model.MtkRriData
import com.zeroner.blemidautumn.bluetooth.model.ProtoBufHisHealthData
import com.zeroner.blemidautumn.bluetooth.model.ProtoBufHisIndexTable
import com.zeroner.blemidautumn.bluetooth.proto.HisDataOuterClass
import com.zeroner.blemidautumn.task.BackgroundThreadManager
import com.zeroner.blemidautumn.utils.JsonTool
import com.zeroner.blemidautumn.utils.Util
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.*
import java.util.concurrent.locks.ReentrantReadWriteLock

/**
 * Time: 2022/12/8
 * Author: ZhengHuaizhi
 * Description:
 */
class HistoryDataActivity : AppCompatActivity() {

    companion object {
        const val MTK_HEALTH = 0x61
        const val MTK_RRI = 0x6A
        const val MTK_SPO2 = 0x6C

        const val PROTOBUF_HISTORY = 0x0080
        const val PROTOBUF_HEALTH = 0x00
        const val PROTOBUF_RRI = 0x04
        const val PROTOBUF_SPO2 = 0x06
        const val PROTOBUF_HEALTH_ENCRYPT = 0x09
        const val PROTOBUF_RRI_ENCRYPT = 0x12
    }

    private lateinit var mToolbar: Toolbar
    private lateinit var mDataTypeSpinner: Spinner
    private lateinit var mRecyclerView: RecyclerView
    private lateinit var btnStart: Button
    private lateinit var btnStop: Button
    private lateinit var cbSaveFile: CheckBox

    private lateinit var mDataReceiver: MyHistoryDataReceiver

    /** 要同步的协议类型 */
    private var mSdkType: Int = Constants.Bluetooth.Zeroner_Mtk_Sdk

    /** 要同步的历史数据类型 */
    private var mDataType: Int? = null

    /** 是否保存文件 */
    private var isSaveFile = false
    private val readWriteLock = ReentrantReadWriteLock()

    /** 列表数据集合 */
    private var mDataList = mutableListOf<String>()

    private lateinit var mDataAdapter: MyHistoryDataAdapter

    /** 列表适配器 */
    private class MyHistoryDataAdapter : BaseQuickAdapter<String, BaseViewHolder>(R.layout.adapter_history_data_item) {

        override fun convert(helper: BaseViewHolder?, item: String) {
            helper?.setText(R.id.history_data_item_text, item)
        }
    }

    /** 历史数据广播接收器 */
    private inner class MyHistoryDataReceiver : BluetoothCallbackReceiver() {

        private var mIndexList: LinkedList<TB_f1_index>? = null

        //        private var mIndexTable: TB_f1_index? = null
        private var mProtoBufIndexList: MutableList<ProtoBufHisIndexTable.Index>? = null

        override fun onDataArrived(context: Context?, ble_sdk_type: Int, dataType: Int, data: String?) {
            super.onDataArrived(context, ble_sdk_type, dataType, data)
            if (ble_sdk_type == Constants.Bluetooth.Zeroner_Mtk_Sdk) {
                when (dataType) {
                    MTK_SPO2 -> {
                        parseMtkSpo2(data)
                    }
                    MTK_RRI -> {
                        parseMtkRri(data)
                    }
                }
            } else if (ble_sdk_type == Constants.Bluetooth.Zeroner_protobuf_Sdk && dataType == PROTOBUF_HISTORY) {
                when (mDataType) {
                    PROTOBUF_HEALTH, PROTOBUF_HEALTH_ENCRYPT -> {
                        val hisDataCase = JsonTool.getIntValue(data, "hisDataCase")
                        if (hisDataCase == HisDataOuterClass.HisNotification.DataCase.INDEX_TABLE.number) {
                            val protoBufHisIndexTable = JsonTool.fromJson(data, ProtoBufHisIndexTable::class.java)
                            mProtoBufIndexList = protoBufHisIndexTable?.indexList
                        } else if (hisDataCase == HisDataOuterClass.HisNotification.DataCase.HIS_DATA.number) {
                            when (JsonTool.getIntValue(data, "hisDataType")) {
                                HisDataOuterClass.HisData.DataCase.HEALTH.number, HisDataOuterClass.HisData.DataCase.HEALTHENCRYPT.number -> {
                                    parseProtoBufHealth(data!!)
                                }
                            }
                        }
                    }
                }
            }
        }

        private fun parseMtkSpo2(data: String?) {
            if (data != null) {
                val ctrl = JsonUtils.getInt(data, "ctrl")
                if (ctrl == 0) {
                    // index_table
                    val deviceName = PrefUtil.getString(this@HistoryDataActivity, BaseActionUtils.ACTION_DEVICE_NAME)
                    mIndexList =
                        BleIndexDataParse().parseIndexData(MTK_SPO2, data, MtkDataParsePresenter.TestUid, deviceName)
                } else if (ctrl == 1) {
                    // seq
                    val spo2Data = JsonUtils.fromJson(data, MtkRriData::class.java)
                    val dateAndRawDataStr = spo2Data.toDateAndRawDataString()
                    // 刷新recyclerview
                    refreshRecyclerView(dateAndRawDataStr)
                    // 保存文件
                    if (isSaveFile && !mIndexList.isNullOrEmpty()) {
                        // 在文件结尾添加文本
                        var append = true
                        val indexTable = mIndexList!!.first
                        if (indexTable.start_seq == spo2Data.seq) {
                            // 开启新的一段index_table同步
                            append = false
                        }
                        indexTable.let {
                            val date = it.date
                            val seqRange = "${it.start_seq}-${it.end_seq_index}"
                            val fileName = "${mDataType?.toString(16)}_${date}_${seqRange}.txt"
                            // 保存文件
                            saveToFile(fileName, dateAndRawDataStr, append)
                            // 结束判断
                            if (it.end_seq_index - 1 == spo2Data.seq) {
                                mIndexList?.removeFirst()
                            }
                        }
                    }
                }
            }
        }

        private fun parseMtkRri(data: String?) {

        }

        private fun parseProtoBufHealth(data: String) {
            val protoBufHisHealthData = JsonTool.fromJson(data, ProtoBufHisHealthData::class.java)
            // 刷新recyclerview
            refreshRecyclerView(data)
            // 保存文件
            if (isSaveFile && !mProtoBufIndexList.isNullOrEmpty()) {
                // 在文件结尾添加文本
                var append = true
                val indexTable = mProtoBufIndexList!!.last()
                if (indexTable.startSeq == protoBufHisHealthData.seq) {
                    // 开启新的一段index_table同步
                    append = false
                }
                protoBufHisHealthData.let {
                    val date = String.format("%4d%02d%02d", it.year, it.month, it.day)
                    val seqRange = "${indexTable.startSeq}-${indexTable.endSeq}"
                    val fileName = "${mDataType?.toString(16)}_${date}_${seqRange}.txt"
                    val dateAndDataStr = it.dateAndDataStr()
                    LogUtils.vTag("ZhengHuaizhi", "date:$date seqRange:$seqRange fileName:$fileName dateAndDataStr:$dateAndDataStr")
                    // 保存文件
                    saveToFile(fileName, dateAndDataStr, append)
                    // 结束判断
                    if (indexTable.endSeq - 1 == it.seq) {
                        mProtoBufIndexList?.removeLast()
                    }
                }
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContentView(R.layout.activity_history_data)

        mSdkType = BleFactory.readSdkType(this@HistoryDataActivity)

        mDataReceiver = MyHistoryDataReceiver()
        BleReceiverHelper.registerBleReceiver(this, mDataReceiver)

        initView()

        initListener()
    }

    private fun initView() {
        mToolbar = findViewById(R.id.history_data_toolbar)
        mDataTypeSpinner = findViewById(R.id.history_data_spinner)
        mRecyclerView = findViewById(R.id.history_data_recycler_view)
        btnStart = findViewById(R.id.history_data_btn_start)
        btnStop = findViewById(R.id.history_data_btn_stop)
        cbSaveFile = findViewById(R.id.history_data_cb_save_data)

        initTitleBar()

        initDataTypeSpinner()

        initRecyclerView()
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

    private fun initDataTypeSpinner() {
        mDataTypeSpinner.run {
            onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
                override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                    // 根据选中数据类型重置mDataType
                    val stringArray = resources.getStringArray(R.array.history_data_options)
                    if (mSdkType == Constants.Bluetooth.Zeroner_Mtk_Sdk) {
                        when (stringArray[position]) {
                            getString(R.string.history_data_spo2) -> mDataType = MTK_SPO2
                            getString(R.string.history_data_rri) -> mDataType = MTK_RRI
                            getString(R.string.history_data_health) -> mDataType = MTK_HEALTH
                        }
                    } else if (mSdkType == Constants.Bluetooth.Zeroner_protobuf_Sdk) {
                        when (stringArray[position]) {
                            getString(R.string.history_data_spo2) -> mDataType = PROTOBUF_SPO2
                            getString(R.string.history_data_rri) -> {
                                if (needEncryption()) {
                                    mDataType = PROTOBUF_RRI_ENCRYPT
                                } else {
                                    mDataType = PROTOBUF_RRI
                                }
                            }
                            getString(R.string.history_data_health) -> {
                                if (needEncryption()) {
                                    mDataType = PROTOBUF_HEALTH_ENCRYPT
                                } else {
                                    mDataType = PROTOBUF_HEALTH
                                }
                            }
                        }
                    }
                }

                override fun onNothingSelected(parent: AdapterView<*>?) {
                }
            }
        }
    }

    private fun initRecyclerView() {
        mDataAdapter = MyHistoryDataAdapter().apply {
            openLoadAnimation(BaseMultiItemQuickAdapter.ALPHAIN)
            setNewData(mDataList)
        }
        mRecyclerView.run {
            adapter = mDataAdapter
            layoutManager = LinearLayoutManager(context, LinearLayoutManager.VERTICAL, false)
        }
    }

    private fun initListener() {
        btnStart.setOnClickListener {
            mDataList.clear()
            mDataAdapter.notifyDataSetChanged()

            when (mSdkType) {
                Constants.Bluetooth.Zeroner_Mtk_Sdk -> {
                    mDataType?.let { type ->
                        MtkSendBluetoothCmdImpl.getInstance(this).getIndexTableAccordingType(type)
                    }
                }
                Constants.Bluetooth.Zeroner_protobuf_Sdk -> {
                    mDataType?.let { type ->
                        val bytes = ProtoBufSendBluetoothCmdImpl.getInstance().itHisData(type)
                        BackgroundThreadManager.getInstance().addWriteData(this, bytes)
                    }
                }
            }
        }

        btnStop.setOnClickListener {
            when (mSdkType) {
                Constants.Bluetooth.Zeroner_Mtk_Sdk -> {
                    mDataType?.let { type ->
                        MtkSendBluetoothCmdImpl.getInstance(this).stopSyncDetailData(type)
                    }
                }
                Constants.Bluetooth.Zeroner_protobuf_Sdk -> {
                    mDataType?.let { type ->
                        val bytes = ProtoBufSendBluetoothCmdImpl.getInstance().stopHisData(type)
                        BackgroundThreadManager.getInstance().addWriteData(this, bytes)
                    }
                }
            }
        }

        cbSaveFile.setOnCheckedChangeListener { _, isChecked ->
            isSaveFile = isChecked
        }
    }

    private fun refreshRecyclerView(data: String) {
        mDataList.add(data)
        mDataAdapter.notifyItemInserted(mDataList.size - 1)
        mRecyclerView.smoothScrollToPosition(mDataList.size - 1)
    }

    /**
     * 保存文件
     *
     * @param fileName 文件命名为“协议_日期_seq索引范围.txt”
     */
    private fun saveToFile(fileName: String, data: String, append: Boolean) {
        lifecycleScope.launch(Dispatchers.IO) {
            val text = data + "\n"
            readWriteLock.writeLock().lock()
            Util.write2SDFromString(
                BuildConfig.ROOT_PATH + "/historyData/",
                fileName,
                text,
                append
            )
            readWriteLock.writeLock().unlock()
        }
    }

    private fun needEncryption(): Boolean {
        return PrefUtil.getString(this@HistoryDataActivity, BaseActionUtils.ACTION_DEVICE_NAME).contains("BIO")
    }

    override fun onDestroy() {
        super.onDestroy()
        BleReceiverHelper.unregisterBleReceiver(this, mDataReceiver)
    }
}