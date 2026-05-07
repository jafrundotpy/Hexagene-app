package com.zeroner.bledemo

import android.content.Intent
import android.os.Bundle
import android.view.WindowManager
import androidx.appcompat.app.AppCompatActivity
import com.zeroner.bledemo.databinding.ActivityTestDeviceBinding

/**
 *
 * @author Gavin
 * @date 2021/5/13
 */
class TestDeviceActivity: AppCompatActivity() {
    private lateinit var binding: ActivityTestDeviceBinding;

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        binding = ActivityTestDeviceBinding.inflate(layoutInflater)
        setContentView(binding.root)

        binding.testNotibizBtn.setOnClickListener {
            val intent = Intent(this, NotificationTest::class.java)
            startActivity(intent)
        }

        binding.testAlmCallBtn.setOnClickListener {
            val intent = Intent(this, TestAlarmAndCallActivity::class.java)
            startActivity(intent)
        }
    }
}