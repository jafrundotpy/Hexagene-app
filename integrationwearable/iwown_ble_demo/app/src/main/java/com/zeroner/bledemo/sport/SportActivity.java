package com.zeroner.bledemo.sport;
import android.content.Context;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.appcompat.widget.Toolbar;
import android.view.View;
import android.widget.TextView;
import com.zeroner.bledemo.R;
import com.zeroner.bledemo.bean.ComViewHolder;
import com.zeroner.bledemo.bean.CommonRecyAdapter;
import com.zeroner.bledemo.bean.RecycleViewDivider;
import com.zeroner.bledemo.bean.WrapContentLinearLayoutManager;
import com.zeroner.bledemo.bean.data.SportDetail;
import com.zeroner.bledemo.data.viewData.ViewData;
import com.zeroner.bledemo.utils.BaseActionUtils;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.PrefUtil;
import java.util.ArrayList;
import java.util.List;

public class SportActivity extends AppCompatActivity {

    Toolbar toolbarSport;
    RecyclerView lvSportDetail;

    private Context context;
    MyAdapter myAdapter;

    List<SportDetail> data = new ArrayList<>();

    private void findByIdView() {
        toolbarSport = findViewById(R.id.toolbar_device_sport);
        lvSportDetail = findViewById(R.id.lv_sport_detail);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_sport);
        findByIdView();
        context = this;
        initView();
    }

    private void initData() {
        DateUtil date=new DateUtil();
        data=ViewData.getSportDetail(context, PrefUtil.getString(context, BaseActionUtils.ACTION_DEVICE_NAME),date.getYear(),date.getMonth(),date.getDay());
    }

    private void initView() {
        setSupportActionBar(toolbarSport);
        getSupportActionBar().setHomeButtonEnabled(true);
        getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        toolbarSport.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });

        LinearLayoutManager layoutManager = new WrapContentLinearLayoutManager(context);
        layoutManager.setOrientation(LinearLayoutManager.VERTICAL);
        lvSportDetail.setLayoutManager(layoutManager);
        lvSportDetail.addItemDecoration(new RecycleViewDivider(context, LinearLayoutManager.HORIZONTAL, 1, getResources().getColor(R.color.device_bgk)));
        initData();
        myAdapter = new MyAdapter(context, data, R.layout.sport_item_detail);
        lvSportDetail.setAdapter(myAdapter);
        myAdapter.notifyDataSetChanged();
        myAdapter.setOnItemClickListener(new ComViewHolder.OnItemClickListener() {
            @Override
            public void onItemClick(int position, View view) {

            }
        });
    }

    class MyAdapter extends CommonRecyAdapter<SportDetail> {
        private Context context;

        public MyAdapter(Context context, List<SportDetail> dataList, int layoutId) {
            super(context, dataList, layoutId);
            this.context = context;
        }

        @Override
        public int getItemCount() {
            return super.getItemCount();
        }

        @Override
        protected ComViewHolder setComViewHolder(View view, int viewType) {
            return new ViewHolder(view);
        }

        @Override
        public void onBindItem(RecyclerView.ViewHolder holder, int position, SportDetail sportDetail) {
            super.onBindItem(holder, position, sportDetail);
            if (holder instanceof ViewHolder) {
                ((ViewHolder) holder).sportName.setText(sportDetail.getSportName());
                ((ViewHolder) holder).itemSportStartTime.setText(sportDetail.getStartTime());
                ((ViewHolder) holder).itemSportEndTime.setText(sportDetail.getEndTime());
                ((ViewHolder) holder).sportDetailSteps.setText(sportDetail.getSteps());
                ((ViewHolder) holder).sportDetailDistance.setText(sportDetail.getDistance());
                ((ViewHolder) holder).sportDetailCal.setText(sportDetail.getCalorie());
            }
        }

    }

    static class ViewHolder extends ComViewHolder{
        TextView sportName;
        TextView itemSportStartTime;
        TextView itemSportEndTime;
        TextView sportDetailSteps;
        TextView sportDetailDistance;
        TextView sportDetailCal;

        ViewHolder(View view) {
            super(view);
             sportName = view.findViewById(R.id.sport_name);
             itemSportStartTime = view.findViewById(R.id.item_sport_start_time);
             itemSportEndTime = view.findViewById(R.id.item_sport_end_time);
             sportDetailSteps = view.findViewById(R.id.sport_detail_steps);
             sportDetailDistance = view.findViewById(R.id.sport_detail_distance);
            sportDetailCal = view.findViewById(R.id.sport_detail_cal);
        }
    }
}
