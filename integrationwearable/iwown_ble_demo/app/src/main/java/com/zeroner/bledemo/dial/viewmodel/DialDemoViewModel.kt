package com.zeroner.bledemo.dial.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.blankj.utilcode.util.GsonUtils
import com.blankj.utilcode.util.ResourceUtils
import com.blankj.utilcode.util.Utils
import com.blankj.utilcode.util.ZipUtils
import com.nicdahlquist.pngquant.LibPngQuant
import com.zeroner.bledemo.R
import com.zeroner.bledemo.dial.impl.DialUtils
import com.zeroner.bledemo.dial.model.ConfigJsonBean
import com.zeroner.bledemo.utils.FileIOUtils
import com.zeroner.bledemo.utils.PathUtils
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.launch
import java.io.File

const val DIAL_INDEX = 1

class DialDemoViewModel :ViewModel() {

    /**
     * compress liveData
     */
    private val unZipMutableLiveData:MutableLiveData<Boolean> = MutableLiveData()

    /**
     * image and cmd liveData
     */
    private val imageAndCommandMutableLiveData:MutableLiveData<List<ByteArray>> =  MutableLiveData()

    // whether can set dial
    var isCanSetDial = false
    // whether set dial
    var isSetDial = false

    /**
     * provide Immutable LiveData
     */
    val unZipLiveData: LiveData<Boolean>
        get() = unZipMutableLiveData

    /**
     * provide Immutable LiveData
     */
    val imageAndCommandLiveData: LiveData<List<ByteArray>>
        get() = imageAndCommandMutableLiveData

    private var sourcePath = PathUtils.getDialPath(DIAL_INDEX.toString(),PathUtils.BleType.MTK) + "/resource.zip"

    private var resourceName = "protobuf"

    private var destPath = PathUtils.getDialPath(DIAL_INDEX.toString(),PathUtils.BleType.MTK)
    private var bleType = PathUtils.BleType.MTK
    private var resource = R.raw.resource

    init {
        if(SuperBleSDK.isProtoBuf(Utils.getApp())){
            resourceName = "protobuf"
            bleType = PathUtils.BleType.PROTO_BUF
            sourcePath = PathUtils.getDialPath(DIAL_INDEX.toString(),bleType) + "/protobuf.zip"
            destPath = PathUtils.getDialPath(DIAL_INDEX.toString(),bleType)
            resource = R.raw.protobuf
        }else{
            resourceName = "resource"
            bleType = PathUtils.BleType.MTK
            sourcePath = PathUtils.getDialPath(DIAL_INDEX.toString(),bleType) + "/protobuf.zip"
            destPath = PathUtils.getDialPath(DIAL_INDEX.toString(),bleType)
            resource = R.raw.resource
        }
        unZipMutableLiveData.value = false
        copyFile()
    }


    /**
     * copy file to sandbox
     */
    private fun copyFile(){
        viewModelScope.launch(context = Dispatchers.IO){
            if(File("$destPath/$resourceName").exists()){
                unZipMutableLiveData.postValue(true)
            }else if(File("$destPath/$resourceName.zip").exists()){
                ZipUtils.unzipFile(sourcePath,destPath)
                unZipMutableLiveData.postValue(true)
            }else {
                val isSuccess = ResourceUtils.copyFileFromRaw(resource, PathUtils.getDialPath(DIAL_INDEX.toString(), bleType) + "/$resourceName.zip")
                if (isSuccess) {
                    val sourcePath = PathUtils.getDialPath(DIAL_INDEX.toString(), bleType) + "/$resourceName.zip";
                    val destPath = PathUtils.getDialPath(DIAL_INDEX.toString(), bleType)
                    ZipUtils.unzipFile(sourcePath, destPath)
                    unZipMutableLiveData.postValue(true)
                }
            }
        }
    }

    /**
     * mtk使用
     */
    fun handleLocalImageFile(){
        viewModelScope.launch(context = Dispatchers.Main) {
            flow<List<ByteArray>> {
                val json = FileIOUtils.readFile2String("$destPath/$resourceName/config.json")
                val type = GsonUtils.getType(ConfigJsonBean::class.java)
                val images:ConfigJsonBean = GsonUtils.fromJson(json,type)
                val byteArrayList = mutableListOf<ByteArray>()
                /**
                 * parse image and compress png
                 */
                val byteArray = parseImagesAndCompressBg1(images)
                byteArrayList.add(byteArray)
                /**
                 * parse bin file
                 */
                val path1 = "$destPath/$resourceName/part1.bin"
                val path2 = "$destPath/$resourceName/part2.bin"
                val list = listOf(path1,path2)
                for (item in list){
                    val byteString = com.blankj.utilcode.util.FileIOUtils.readFile2String(item)
                    val byteArrays:ByteArray = DialUtils.hexToBytes(byteString)
                    byteArrayList.add(byteArrays)
                }
                emit(byteArrayList)
            }
                    .flowOn(Dispatchers.IO)
                    .collect {
                        imageAndCommandMutableLiveData.value = it
                    }
        }
    }

    /**
     * protobuf使用
     * 这里是本地示例，config文件已经内置 ，正常情况下需要从服务获取
     */
    fun handleLocalImageFilePb(){
        viewModelScope.launch(context = Dispatchers.Main) {
            flow<List<ByteArray>> {
                val json = FileIOUtils.readFile2String("$destPath/$resourceName/config.json")
                val type = GsonUtils.getType(ConfigJsonBean::class.java)
                val images:ConfigJsonBean = GsonUtils.fromJson(json,type)
                val byteArrayList = mutableListOf<ByteArray>()
                /**
                 * parse image and compress png
                 * 图片转为bytes
                 */
                val byteArray = imageList2PbBytes(images)
                byteArrayList.add(byteArray)
                /**
                 * parse bin file
                 * bin转为bytes
                 */
                val path1 = "$destPath/$resourceName/proto.bin"
                val byteString:ByteArray = com.blankj.utilcode.util.FileIOUtils.readFile2BytesByMap(path1)
                byteArrayList.add(byteString)
                emit(byteArrayList)
            }
                    .flowOn(Dispatchers.IO)
                    .collect {
                        imageAndCommandMutableLiveData.value = it
                    }
        }
    }

    private fun imageList2PbBytes(images:ConfigJsonBean):ByteArray{
        val pathList = mutableListOf<String>()
        for (img in images.imgs) {
            pathList.add("$destPath/$resourceName/${img}")
        }
        return DialUtils.allPictureToProtoBytes(pathList)
    }

    private fun parseImagesFormPb(images:ConfigJsonBean):ByteArray{
        val pathList = mutableListOf<String>()
        images.imgs.forEach {
            if(it.endsWith(".bmp")) {
                pathList.add("$destPath/$resourceName/${it}")
            }else{
                pathList.add("$destPath/$resourceName/${it}.bmp")
            }
        }
        return DialUtils.getPicturePixel(pathList)
    }


    private fun parseImagesAndCompressBg1(images:ConfigJsonBean):ByteArray{
        val pathList = mutableListOf<String>()
        images.imgs.forEach {
            if(it.endsWith(".png")) {
                pathList.add("$destPath/$resourceName/${it}")
            }else{
                pathList.add("$destPath/$resourceName/${it}.png")
            }
        }
        var isSuccessed = false
        var bg1Index = 0
        val outPutFile = "$destPath/$resourceName/bg-1-compress.png"
        if(!File(outPutFile).exists()) {
            for ((index, item) in pathList.withIndex()) {
                val isExit = item.contains("bg-1.png")
                if (isExit) {
                    bg1Index = index
                    /**
                     * compress png image
                     */
                    val libPngQuant = LibPngQuant()
                    val inputFile = item
                    val isSuccess = libPngQuant.pngQuantFile(File(inputFile), File(outPutFile))
                    if (isSuccess) {
                        isSuccessed = true
                        break
                    }
                }
            }
        }else{
            isSuccessed = true
        }
        return if(isSuccessed){
            pathList[bg1Index] = outPutFile
            DialUtils.makeAllPictureToPngByte(pathList)
        }else{
            ByteArray(0)
        }
    }



}