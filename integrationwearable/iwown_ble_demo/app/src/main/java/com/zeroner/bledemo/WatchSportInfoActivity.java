package com.zeroner.bledemo;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.view.View;
import android.widget.TextView;

import com.zeroner.bledemo.bean.ComViewHolder;
import com.zeroner.bledemo.bean.CommonRecyAdapter;
import com.zeroner.bledemo.bean.data.Detail_data;
import com.zeroner.bledemo.bean.sql.TB_v3_sport_data;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.PrefUtil;
import com.zeroner.bledemo.utils.Util;
import com.zeroner.blemidautumn.library.KLog;
import com.zeroner.blemidautumn.utils.JsonTool;

import org.litepal.crud.DataSupport;

import java.util.List;




public class WatchSportInfoActivity extends AppCompatActivity {

    RecyclerView mSportRcy;

    List<TB_v3_sport_data> mDataList = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_watch_sport_info);
        mSportRcy = findViewById(R.id.sport_rcy);

        DateUtil dateUtil = new DateUtil();

        mDataList = DataSupport.where("data_from=? and year=? and month=? and day=?", PrefUtil.getString(BleApplication.getInstance(), BaseActionUtils.ACTION_DEVICE_NAME),
                dateUtil.getYear()+"", dateUtil.getMonth()+"", dateUtil.getDay()+"").find(TB_v3_sport_data.class);

        KLog.e(JsonTool.toJson(mDataList));

        mSportRcy.setLayoutManager(new LinearLayoutManager(this));

        if (null==mDataList || mDataList.size()==0) {
            return;
        }

        mSportRcy.setAdapter(new CommonRecyAdapter<TB_v3_sport_data>(this, mDataList, R.layout.watch_sport_item_layout) {
            @Override
            protected ComViewHolder setComViewHolder(View view, int viewType) {
                return new ViewHolder(view);
            }

            @Override
            public void onBindItem(RecyclerView.ViewHolder holder, int position, TB_v3_sport_data item) {
                super.onBindItem(holder, position, item);

                ((ViewHolder)holder).mTitle.setText(Util.getSporyImgOrName(0, item.getSport_type()));
                Detail_data detail_data = JsonTool.fromJson(item.getDetail_data(), Detail_data.class);
                ((ViewHolder)holder).mTime.setText(item.getYear()+"/"+item.getMonth()+"/"+item.getDay()+" "+
                    item.getStart_time()/60+":"+item.getStart_time()%60+"-"+item.getEnd_time()/60+":"+item.getEnd_time()%60);

                if(item.getSport_type()==0x01 || item.getSport_type()==0x07 || item.getSport_type()==0x93){
                    ((ViewHolder)holder).mFirst.setText("steps: "+detail_data.getStep());
                    ((ViewHolder)holder).mSec.setText("distance: "+detail_data.getDistance()+ " m");
                    ((ViewHolder)holder).mThird.setText("active: "+detail_data.getActivity()+ " min");
                    ((ViewHolder)holder).mFourth.setText("calories: "+Util.doubleToFloat(1, item.getCalorie())+ " Kcal");

                }else{
                    ((ViewHolder)holder).mFirst.setText("active: "+detail_data.getActivity()+ " min");
                    ((ViewHolder)holder).mSec.setText("calories: "+Util.doubleToFloat(1, item.getCalorie())+ " Kcal");
                }
            }
        });

    }

    static class ViewHolder extends ComViewHolder {
        TextView mTitle;
        TextView mFirst;
        TextView mSec;
        TextView mThird;
        TextView mTime;
        TextView mFourth;

        ViewHolder(View view) {
            super(view);
             mTitle = view.findViewById(R.id.title);
             mFirst = view.findViewById(R.id.first_1);
             mSec = view.findViewById(R.id.second);
             mThird = view.findViewById(R.id.third);
             mTime = view.findViewById(R.id.time);
             mFourth = view.findViewById(R.id.fourth);
        }
    }
}
