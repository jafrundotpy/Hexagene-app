package com.zeroner.bledemo.bean;

import androidx.recyclerview.widget.RecyclerView;
import android.view.View;
import android.widget.TextView;

import com.github.vipulasri.timelineview.TimelineView;
import com.zeroner.bledemo.R;


/**
 * 作者：hzy on 2018/1/9 14:41
 * <p>
 * 邮箱：hezhiyuan@iwown.com
 */

public class TimeLineViewHolder extends RecyclerView.ViewHolder {

    TextView sleepType;
    TextView start;
    TextView end;

    TimelineView mTimelineView;

    private void findByIdView(View view) {
         sleepType = view.findViewById(R.id.text_timeline_sleepType);
         start = view.findViewById(R.id.text_timeline_start);
         end = view.findViewById(R.id.text_timeline_end);
         mTimelineView = view.findViewById(R.id.time_marker);
    }

    public TimeLineViewHolder(View itemView, int viewType) {
        super(itemView);
        findByIdView(itemView);
        mTimelineView.initLine(viewType);
    }
}
