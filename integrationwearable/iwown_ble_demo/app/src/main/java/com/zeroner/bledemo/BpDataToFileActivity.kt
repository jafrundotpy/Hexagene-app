package com.zeroner.bledemo

import android.os.Bundle
import android.util.Log
import android.view.View
import android.view.WindowManager
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.zeroner.bledemo.bean.data.BpDayFile
import com.zeroner.bledemo.bean.data.BpOneFileData
import com.zeroner.bledemo.databinding.ActivityBpToFileBinding
import com.zeroner.bledemo.utils.DateUtil
import com.zeroner.bledemo.utils.FileUtils
import com.zeroner.bledemo.utils.JsonUtils
import com.zeroner.bledemo.utils.ShareUtil
import com.zeroner.bledemo.view.BirthdayDialog
import okhttp3.Call
import okhttp3.Callback
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import java.io.File
import java.io.IOException

/**
 *
 * @author Gavin
 * @date 2021/5/13
 */
class BpDataToFileActivity: AppCompatActivity() {
    private lateinit var binding: ActivityBpToFileBinding
    private  var mDateUtil = DateUtil()
    private lateinit var dateDialog:BirthdayDialog

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        binding = ActivityBpToFileBinding.inflate(layoutInflater)
        setContentView(binding.root)
        dateDialog = BirthdayDialog(this,mDateUtil)
        binding.bpChooseDate.text = mDateUtil.y_M_D
        binding.bpChooseDate.setOnClickListener {
            dateDialog.show()
        }
        binding.downBpBtn.setOnClickListener {
            downloadOneDayBp()
        }

        dateDialog.setOnDismissListener {
            val birthday = mDateUtil.y_M_D
            binding.bpChooseDate.text = birthday
        }

    }

    private fun downloadOneDayBp(){
        var mDevID = binding.deviceIdEdit.text.toString().trim()
//        mDevID = "860132061268488"
        if(mDevID.isEmpty()){
            Toast.makeText(this,"请输入deviceId",Toast.LENGTH_SHORT).show()
            return
        }
        showNoDataUi(false,"无数据")
        val mUrl = "http://cloud.01fit.com/cgoservice/pb/history_bporiginal/download?device_id=${mDevID}&record_date=${mDateUtil.y_M_D}"
        val request = Request.Builder().url(mUrl).build()
        OkHttpClient().newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                e.printStackTrace()
                Log.i("myTag", "下载失败")
                showNoDataUi(true,"下载失败")

            }

            @Throws(IOException::class)
            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    Log.i("myTag", "数据获取成功")
                    response.body()?.let {
                        val mreStr =  it.string()
                        Log.i("myTag",mreStr)
                        val bpDataNet = JsonUtils.fromJson(mreStr,BpOneFileData::class.java)
                        if(bpDataNet.returnCode==0 && bpDataNet.data.size>0){
                            writeBpToFile(bpDataNet.data)
                        }else{
                            showNoDataUi(true,"无数据")
                        }
                    }

                }else{
                    showNoDataUi(true,"下载失败")
                }
            }
        })
    }

    private fun writeBpToFile(dataList:MutableList<BpOneFileData.BpBinData>){
        var setNumber = -1
        var timeList = mutableListOf<String>()
        var lastTime = ""
        var bpFileList = mutableListOf<BpDayFile>()
        for (bpBinData in dataList) {
            val mTime = bpBinData.bp_Time
            if(!timeList.contains(mTime)){
                timeList.add(mTime)
            }
            if(lastTime==mTime){
                bpFileList[setNumber].dataArray.add(bpBinData.bp_Data)
            }else{
                //时间有变
                lastTime = mTime
                val bpFile = BpDayFile()
                bpFile.time = mTime
                bpFile.deviceId = bpBinData.deviceid
                bpFile.dataArray.add(bpBinData.bp_Data)
                setNumber++
                bpFileList.add(bpFile)
            }
        }

        try {
            //复制文件到本地
            this.externalCacheDir?.let {
//                val filePar = File(it.parent!!+"/files").absolutePath+"/bpBin/"+mDateUtil.y_M_D+"/"
                val filePar = "bpBin/"+mDateUtil.y_M_D+"/"
                for (bpDayFile in bpFileList) {
                    val fileNameAbs = bpDayFile.deviceId+"&"+bpDayFile.time.replace(":","_")+".txt"
                    FileUtils.write2SDFromString(filePar,fileNameAbs,JsonUtils.toJson(bpDayFile),false)
                }
                showFileToUi(bpFileList)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }




    }

    private fun showNoDataUi(isShow:Boolean,cotent:String){
        runOnUiThread {
            if(isShow){
                binding.bpFileNoData.visibility = View.VISIBLE
                binding.bpFileNoData.text = cotent
            }else{
                binding.bpFileNoData.visibility = View.GONE
            }
        }
    }

    private fun showFileToUi(bpFileList:MutableList<BpDayFile>){
        runOnUiThread {
            val filePar = File(this.externalCacheDir!!.parent!!+"/files").absolutePath+"/bpBin/"+mDateUtil.y_M_D+"/"
            for(i in 0 until bpFileList.size){
                val fileNameAbs = bpFileList[i].deviceId+"&"+bpFileList[i].time.replace(":","_")+".txt"
                val b1 = TextView(this)
                b1.text = "${bpFileList[i].time}【${bpFileList[i].dataArray.size}条】 >点击分享<"
                b1.tag = filePar+fileNameAbs
                b1.setPadding(0,20,0,20)
                binding.bpFileLayout.addView(b1)
                b1.setOnClickListener {
                val mFile = File(it.tag.toString())
                    ShareUtil.shareFile(this,mFile)
                }
            }
        }

    }
}