package com.zeroner.bledemo.utils

import com.blankj.utilcode.util.Utils
import com.zeroner.bledemo.BuildConfig
import java.io.File


/**
 * @author yanxi
 * @date 2020/8/21
 */


class PathUtils {

    enum class BleType(val value: String){
        MTK("MTK"),
        PROTO_BUF("PROTO_BUF"),
        NONE("NONE")
    }

    companion object {
        /**
         * 根路径
         */
        private fun getRootPath(): String {
            val rootPath = "${Utils.getApp().filesDir.absoluteFile}" +
                    "${BuildConfig.ROOT_PATH}${File.separator}"
            val file = File(rootPath)
            if (!file.exists()) {
                file.mkdirs()
            }
            return rootPath
        }

        /**
         * 表盘路径
         */
        fun getDialPath(dialIndex: String, bleType: BleType): String {
            val path = "${getRootPath()}dial${File.separator}" +
                    "$bleType${File.separator}dial$dialIndex${File.separator}"
            val file = File(path)
            if (!file.exists()) {
                file.mkdirs()
            }
            return path
        }

    }
}