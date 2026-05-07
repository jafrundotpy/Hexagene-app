package com.zeroner.bledemo.setting;

import android.content.ContentResolver;
import android.content.Context;
import android.content.Intent;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.DocumentsContract;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.blankj.utilcode.util.ToastUtils;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.data.ProtoBufDataParsePersenter;
import com.zeroner.bledemo.data.sync.ProtoBufUpdate;

import com.zeroner.bledemo.utils.FileUtils;

import java.io.File;
import java.io.InputStream;


import io.netopen.hotbitmapgg.library.view.RingProgressBar;

public class BPUpgradeActivity extends AppCompatActivity implements ProtoBufUpdate.OnUpgradeListener {
    int REQUESTCODE_FROM_ACTIVITY = 1000;
    private Context context;
    private Button button, startBtn;
    private String bp_file;
    private TextView pathView;
    private TextView dfuStatue;
    private EditText etDelayMs;



    RingProgressBar progressBar2;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_bpupgrade);
        context=this;
        initView();
        etDelayMs.setText(String.valueOf(30));
    }

    private void selectFile(){
        Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
        intent.setType("*/*");
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        startActivityForResult(intent, REQUESTCODE_FROM_ACTIVITY);
    }

    private void initView() {
        button=findViewById(R.id.button_select_file);
        dfuStatue=findViewById(R.id.dfu_statue);
        startBtn =findViewById(R.id.button_start);
        pathView=findViewById(R.id.file_path);
        etDelayMs=findViewById(R.id.delay_ms);
        dfuStatue.setText("手表Bp版本: "+ ProtoBufDataParsePersenter.mBpVersion);
        progressBar2=findViewById(R.id.progress_bar_2);
        button.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                selectFile();
            }
        });

        startBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if(bp_file==null){
                    return;
                }
                startBtn.setText("升级中。。。");
                startBtn.setEnabled(false);
                etDelayMs.setEnabled(false);
                ProtoBufUpdate.getInstance().setUpdate(false);
                ProtoBufUpdate.getInstance().setDelay(30);
                ProtoBufUpdate.getInstance().setOnUpgradeListener(BPUpgradeActivity.this);
                ProtoBufUpdate.getInstance().setFilePath(bp_file);
                ProtoBufUpdate.getInstance().startUpdate(ProtoBufUpdate.Type.TYPE_BP);
            }
        });
    }


    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode == RESULT_OK) {
            if (requestCode == REQUESTCODE_FROM_ACTIVITY) {
                Uri uri = data.getData();
                ContentResolver resolver = getContentResolver();
                Cursor query = resolver.query(uri, new String[]{DocumentsContract.Document.COLUMN_DISPLAY_NAME}, null, null, null);
                String fileNameAbs = "";
                if (query != null) {
                    if (query.moveToNext()) {
                        fileNameAbs = query.getString(0);
                    }
                    query.close();
                }

                if (!fileNameAbs.endsWith(".bin")) {
                    Toast.makeText(BPUpgradeActivity.this, "选择的文件格式不对", Toast.LENGTH_SHORT).show();
                    return;
                }

                try {
                    File externalCacheDir = getExternalCacheDir();
                    if (externalCacheDir != null) {
                        String filePar = new File(externalCacheDir.getParent() + "/files").getAbsolutePath() + "/";
                        InputStream firFileStream = resolver.openInputStream(uri);
                        if (firFileStream != null) {
                            // 假设FileUtils.writeInputStreamToFile是一个自定义方法，需要根据你的实际方法进行调整
                            // 这里我们假设它接受文件路径、文件名和输入流
                            FileUtils.writeInputStreamFromCompletePath(filePar, fileNameAbs, firFileStream);
                            File file = new File(filePar + fileNameAbs);
                            addOneFileText(file);
                            // 记得关闭输入流
                            firFileStream.close();
                        }
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }


            }
        }
    }

    private void addOneFileText(File file){
        bp_file = file.getAbsolutePath();
        pathView.setText(file.getName());
    }

//    @Subscribe(threadMode = ThreadMode.MAIN)
//    public void onEventMainThread(SyncDataEvent events){
//        if (events.getProgress() > 0 && !events.isStop()){
//            progressBar2.setVisibility(View.VISIBLE);
//            progressBar2.setProgress(events.getProgress());
//        }
//        if(events.isStop()){
//            ToastUtils.showShort("同步完成");
//        }
//    }

    @Override
    protected void onStart() {
        super.onStart();
//        EventBus.getDefault().register(this);
    }

    @Override
    protected void onStop() {
        super.onStop();
//        EventBus.getDefault().unregister(this);
    }

    @Override
    public void onFailed(int type) {
        if(type == 1){
            Toast.makeText(this,"数据无效，无法升级",Toast.LENGTH_SHORT).show();
        }else{
            Toast.makeText(this,"升级失败",Toast.LENGTH_SHORT).show();
        }
        startBtn.setText(R.string.sync_progress_text_start_upgrade);
        startBtn.setEnabled(true);
        etDelayMs.setEnabled(true);
    }

    @Override
    public void onSuccess() {
        startBtn.setText(R.string.sync_progress_text_start_upgrade);
        startBtn.setEnabled(true);
        etDelayMs.setEnabled(true);
        Toast.makeText(this,"同步完成",Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onProgress(int progress) {
        progressBar2.setVisibility(View.VISIBLE);
        progressBar2.setProgress(progress);
    }
}
