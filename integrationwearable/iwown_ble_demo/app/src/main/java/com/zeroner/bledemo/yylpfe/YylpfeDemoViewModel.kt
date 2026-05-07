package com.zeroner.bledemo.yylpfe

import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.zeroner.bledemo.bean.sql.ProtoBuf_index_80
import com.zeroner.bledemo.bean.sql.TB_yylpfe_data
import com.zeroner.bledemo.data.ProtoBufDataParsePersenter
import com.zeroner.bledemo.data.sync.ProtoBufSync
import com.zeroner.bledemo.utils.DateUtil
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.litepal.crud.DataSupport

/**
 *
 * @author Gavin
 * @date 2024/6/17
 */
class YylpfeDemoViewModel  : ViewModel(){

    val baseMutableLiveData: MutableLiveData<List<String>> = MutableLiveData()

    fun getTabListYYData(){
        viewModelScope.launch(context = Dispatchers.IO){
            val dataList = DataSupport
                .where("data_from=? and indexType=?",ProtoBufDataParsePersenter.getDataFrom(),ProtoBufSync.YYLPFE_DATA.toString())
                .order("time asc")
                .find(ProtoBuf_index_80::class.java)
            val showYyList = mutableListOf<String>()
            for (protobufIndex80 in dataList) {
                val timeShow = DateUtil(protobufIndex80.time.toLong(),true).y_M_D_H_M_S
                val showYStr = "$timeShow ,number: ${protobufIndex80.end_idx - protobufIndex80.start_idx}"
                showYyList.add(showYStr)
            }
            baseMutableLiveData.postValue(showYyList)
        }
    }

    fun getAllListYYData(){
        viewModelScope.launch(context = Dispatchers.IO){

            val dataList = DataSupport.where("data_from=?",ProtoBufDataParsePersenter.getDataFrom()).order("times asc")
                                    .find(TB_yylpfe_data::class.java)
            val showYyList = mutableListOf<String>()
            if(dataList.size>0){
                var oneTime = dataList[0].times
                var oneSize = 0
                val timeShow = DateUtil(oneTime,true).y_M_D_H_M_S
                val showYStr = "$timeShow ,number: $oneSize"
                showYyList.add(showYStr)
                baseMutableLiveData.postValue(showYyList)
            }

        }
    }
}