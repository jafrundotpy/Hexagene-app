package com.zeroner.bledemo.dial.impl


/**
 * @author yanxi
 * @date 2020/10/29
 *
 * 表盘设置接口契约
 * 通过此接口来设置表盘 监听进度信息
 */

interface IBaseDialContact {

    /**
     * 设置表盘信息开始一些准备
     * 包括设置监听
     */
    fun onSetDialInit(iBaseDialProgress: IBaseDialProgress)

    /**
     * 设置表盘给设备
     * 接收一个byte 数组,
     * dialWriteModel : 表盘的ui设置项
     */
    fun setDialToDevice(byteArray: List<ByteArray>)

    /**
     * 下载所有的文件
     */
    fun downloadDialFile(device: String,dialId: String,urlList: MutableList<String>)

    /**
     * 结束所有的下载操作
     * 包括接口订阅等操作
     */
    fun finishAllProcess()

    fun onDestroy()

    interface IBaseDialProgress{

        /**
         * 开始下载
         */
        fun onDownloadStart()

        /**
         * 下载中或者写入文件的进度条
         */
        fun onProgress(type :ProgressType, progress: Int)

        /**
         * 结束下载
         */
        fun onDownloadFinish()

        /**
         * 写入表盘操作已经停止
         */
        fun writeDialHasStop(stopType: DialWriteStopType)

    }

}

enum class ProgressType{
    HTTP,
    WRITE
}

enum class DialWriteStopType{
    SUCCESS,
    WRITE,
    SYNC,
    BLE_DISCONNECT,
    UNKOWN_ERROR
}