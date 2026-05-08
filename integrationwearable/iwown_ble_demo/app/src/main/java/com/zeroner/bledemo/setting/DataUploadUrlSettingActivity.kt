package com.zeroner.bledemo.setting

import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import com.zeroner.bledemo.R
import com.zeroner.blemidautumn.bluetooth.SuperBleSDK
import com.zeroner.blemidautumn.task.BackgroundThreadManager

/**
 * Time: 2024/8/2
 * Author: ZhengHuaizhi
 * Description: 数据上传地址设置
 */
class DataUploadUrlSettingActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_data_upload_url_setting)

        val edt = findViewById<EditText>(R.id.edt_data_upload_url)
        val btnSend = findViewById<Button>(R.id.btn_data_upload_url)
        btnSend.setOnClickListener {
            val email = edt.text.toString()
            if (email.isNotEmpty()) {
                if (email.contains("@")) {
                    com.zeroner.bledemo.bridge.HexaGeneSyncClient.setUserEmail(this, email)
                    Toast.makeText(this, getString(R.string.url_send_success), Toast.LENGTH_LONG).show()
                    finish()
                } else {
                    Toast.makeText(this, "Please enter a valid email", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}