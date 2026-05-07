package com.zeroner.bledemo.dial.impl

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import com.zeroner.bledemo.utils.FileIOUtils
import com.zeroner.blemidautumn.utils.ByteUtil
import java.util.*

object DialUtils {


    /**
     * @param filePathList 所有图片的本地存储路径,背景以bg-1开头，自定义也是最好
     * 第一张必须是背景图片,顺序不能乱
     * 最新的设备都支持图片格式，后面两个参数可不传，默认不需要转换
     */
    fun allPictureToProtoBytes(filePathList:MutableList<String>,bgConvert:Boolean = false,otherConvert:Boolean = false):ByteArray{
        val imgHead = ByteArray(512)
        var begin = 4
        var sumSize = 0
        var allImgBytes = ByteArray(0)
        for (filePath in filePathList) {
            val fileBytes = if(filePath.startsWith("bg-1")){
                //背景处理
                makeOneImageToByte(filePath,bgConvert)
            }else{
                //其他小图片元素
                makeOneImageToByte(filePath,otherConvert)
            }
            allImgBytes += fileBytes
            sumSize += fileBytes.size
            Log.i("guannfengjun", "每张图片的大小的大小: ${fileBytes.size} - $filePath")
            val bSize: ByteArray = ByteUtil.intToByte(sumSize, 4)
            for (b in bSize) {
                imgHead[begin] = b
                begin++
            }
        }
        if(allImgBytes.size>512*1000){
            Log.e("dial error", "总图片超过512kb，无法转换图片: " )
            allImgBytes = ByteArray(0)
        }
        val result = imgHead + allImgBytes
        Log.i("guannfengjun", "发送的总图片大小加头文件: " + result.size + " - " + allImgBytes.size )
        return result
    }

    /**
     * @param needConvert 是否需要转为rgb
     * 无需转换的直接将图片转为byte
     */
    private fun makeOneImageToByte(filePath:String,needConvert:Boolean):ByteArray{
        return if(needConvert){
            bitmap2ByteArray(BitmapFactory.decodeFile(filePath))
        }else{
            FileIOUtils.readFile2BytesByChannel(filePath)
        }
    }

    fun makeAllPictureToPngByte(mFileStringList: List<String>): ByteArray {
        val imgHead = ByteArray(512)
        var begin = 4
        var sumSize = 0
        val fileByte: MutableList<Byte> = ArrayList()
        for (str in mFileStringList) {
            var fileBytes: ByteArray = FileIOUtils.readFile2BytesByChannel(str)
            if (fileBytes.size > 150000) {
                fileBytes = bitmap2ByteArray(BitmapFactory.decodeFile(str))
            }
            val value: Int = com.zeroner.blemidautumn.utils.Util.crc16Modem(fileBytes)
            val high = (value and 0xff00 shr 8).toByte()
            val low = (value and 0xff).toByte()
            val cyc16Bytes = ByteArray(2)
            cyc16Bytes[0] = low
            cyc16Bytes[1] = high
            val concat: ByteArray = com.zeroner.blemidautumn.utils.Util.concat(fileBytes, cyc16Bytes)
            for (b in concat) {
                fileByte.add(b)
            }
            sumSize += concat.size
            val bSize: ByteArray = ByteUtil.intToByte(sumSize, 4)
            for (b in bSize) {
                imgHead[begin] = b
                begin++
            }
        }
        val second = ByteArray(fileByte.size)
        for (i in fileByte.indices) {
            second[i] = fileByte[i]
        }
        val result = imgHead.copyOf(imgHead.size + second.size)
        System.arraycopy(second, 0, result, imgHead.size, second.size)
        return result
    }


    private fun bitmap2ByteArray(bitmap: Bitmap): ByteArray {
        val width = bitmap.width
        val height = bitmap.height
        val pixels = IntArray(bitmap.width * bitmap.height)
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
        val fileBytes = ByteArray(pixels.size * 2)
        var number = 0
        for (i in pixels.indices) {
            val clr = pixels[i]
            val red = clr and 0x00ff0000 shr 16
            val green = clr and 0x0000ff00 shr 8
            val blue = clr and 0x000000ff
            val cRed = red shr 3
            val cGreen = green shr 2
            val cBlue = blue shr 3
            val data = (cRed shl 11) + (cGreen shl 5) + cBlue
            val df = ByteUtil.intToByte(data, 2)
            fileBytes[number] = df[0]
            fileBytes[number + 1] = df[1]
            number += 2
        }
        return fileBytes
    }

    fun hexToBytes(hex: String): ByteArray {
        return if (hex.isEmpty()) {
            ByteArray(0)
        } else {
            val result = ByteArray(hex.length / 2)
            var j = 0
            var i = 0
            while (i < hex.length) {
                result[j++] = hex.substring(i, i + 2).toInt(16).toByte()
                i += 2
            }
            result
        }
    }

    /**
     * 将本地图片转为 protobuf表盘需要的字节数组
     * 第一张必须为背景图片
     * @param mFileStringList
     * @return
     */
    fun getPicturePixel(mFileStringList: List<String>): ByteArray {
        val bitmapList: MutableList<Bitmap> = ArrayList(mFileStringList.size)
        for (filePath in mFileStringList) {
            bitmapList.add(BitmapFactory.decodeFile(filePath))
        }
        return bitmapListToBytes(bitmapList)
    }


    /**
     * 将bitmap集合 表盘需要的字节数组（protobuf协议）
     * firstBytes 表示
     * @return
     */
    private fun bitmapListToBytes(mFileStringList: List<Bitmap>): ByteArray {
        val imgHead = ByteArray(512)
        var begin = 4
        var sumSize = 0
        val fileByte: MutableList<Byte> = ArrayList()
        for (bitmap in mFileStringList) {
            val width = bitmap.width
            val height = bitmap.height
            val bitList: List<Byte> = bitmap2ListByte(bitmap)
            fileByte.addAll(bitList)
            sumSize += width * height * 2
            val bSize = ByteUtil.intToByte(sumSize, 4)
            for (b in bSize) {
                imgHead[begin] = b
                begin++
            }
        }
        val second = ByteArray(fileByte.size)
        for (i in fileByte.indices) {
            second[i] = fileByte[i]
        }
        val result = Arrays.copyOf(imgHead, imgHead.size + second.size)
        System.arraycopy(second, 0, result, imgHead.size, second.size)
        return result
    }

    private fun bitmap2ListByte(bitmap: Bitmap): List<Byte> {
        val width = bitmap.width
        val height = bitmap.height
        val fileByte: MutableList<Byte> = ArrayList()
        val pixels = IntArray(bitmap.width * bitmap.height)
        bitmap.getPixels(pixels, 0, width, 0, 0, width, height)
        for (i in pixels.indices) {
            val clr = pixels[i]
            val red = clr and 0x00ff0000 shr 16
            val green = clr and 0x0000ff00 shr 8
            val blue = clr and 0x000000ff
            val cRed = red shr 3
            val cGreen = green shr 2
            val cBlue = blue shr 3
            val data = (cRed shl 11) + (cGreen shl 5) + cBlue
            val df = ByteUtil.intToByte(data, 2)
            fileByte.add(df[0])
            fileByte.add(df[1])
        }
        return fileByte
    }
}