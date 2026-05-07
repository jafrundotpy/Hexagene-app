package com.zeroner.bledemo;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.view.View;
import android.widget.TextView;

import com.iwown.app.nativeinvoke.SA_SleepBufInfo;
import com.iwown.app.nativeinvoke.SA_SleepDataInfo;
import com.zeroner.bledemo.bean.ComViewHolder;
import com.zeroner.bledemo.bean.CommonRecyAdapter;
import com.zeroner.bledemo.data.sync.MtkToIvHandler;
import com.zeroner.bledemo.utils.DateUtil;

import java.util.Arrays;




public class SportWatchSleepActivity extends AppCompatActivity {

    RecyclerView mSleepRcy;
    TextView mTop;
    private SA_SleepBufInfo mSleepBufInfo;

    private void findByIdView() {
         mSleepRcy= findViewById(R.id.sleep_rcy);
         mTop= findViewById(R.id.top);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sport_watch_sleep);
        findByIdView();
        mSleepBufInfo = MtkToIvHandler.getP1Sleep(new DateUtil().getSyyyyMMddDate());

        if (null!=mSleepBufInfo) {
            mTop.setText(mSleepBufInfo.inSleepTime.year+2000+"/"+mSleepBufInfo.inSleepTime.month+"/"+mSleepBufInfo.inSleepTime.day+" "
                +mSleepBufInfo.inSleepTime.hour+":"+mSleepBufInfo.inSleepTime.minute+"-" +(mSleepBufInfo.outSleepTime.year+2000)+"/"+mSleepBufInfo.outSleepTime.month+"/"+mSleepBufInfo.outSleepTime.day+" "
                    +mSleepBufInfo.outSleepTime.hour+":"+mSleepBufInfo.outSleepTime.minute);
        }

        if (mSleepBufInfo.sleepdata != null && mSleepBufInfo.sleepdata.length != 0) {
            mSleepRcy.setLayoutManager(new LinearLayoutManager(this));
            mSleepRcy.setAdapter(new CommonRecyAdapter<SA_SleepDataInfo>(this, Arrays.asList(mSleepBufInfo.sleepdata), R.layout.sport_watch_sleep_item_layout) {
                @Override
                protected ComViewHolder setComViewHolder(View view, int viewType) {
                    return new ViewHolder(view);
                }

                @Override
                public void onBindItem(RecyclerView.ViewHolder holder, int position, SA_SleepDataInfo item) {
                    super.onBindItem(holder, position, item);
                    if (item.sleepMode == 4) {
                        ((ViewHolder) holder).mTitle.setText(getString(R.string.sleep_detail_light_1) + ": "
                                + item.startTime.hour + ":" + item.startTime.minute + "-" + item.stopTime.hour + ":" + item.stopTime.minute);
                    } else if (item.sleepMode == 3) {
                        ((ViewHolder) holder).mTitle.setText(getString(R.string.sleep_detail_deep_1) + ": "
                                + item.startTime.hour + ":" + item.startTime.minute + "-" + item.stopTime.hour + ":" + item.stopTime.minute);
                    }
                }
            });
        }


    }

    static class ViewHolder extends ComViewHolder {
        TextView mTitle;


        ViewHolder(View view) {
            super(view);
            mTitle = view.findViewById(R.id.title);
        }
    }
}
