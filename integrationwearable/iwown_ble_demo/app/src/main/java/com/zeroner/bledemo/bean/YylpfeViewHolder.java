package com.zeroner.bledemo.bean;

import android.app.Activity;
import android.content.Context;
import android.view.ViewGroup;
import android.widget.TextView;

import com.zeroner.bledemo.R;
import com.zeroner.bledemo.bean.data.R1Data;
import com.zeroner.bledemo.bean.data.YylpfeData;
import com.zeroner.bledemo.data.sync.ProtoBufSync;
import com.zeroner.bledemo.dial.view.DialDemoActivity;
import com.zeroner.bledemo.utils.BluetoothUtil;
import com.zeroner.bledemo.utils.UI;
import com.zeroner.bledemo.yylpfe.YylpfeDemoActivity;
import com.zeroner.blemidautumn.library.KLog;

import cn.lemon.view.adapter.BaseViewHolder;

/**
 * 作者：hzy on 2017/12/26 08:44
 * <p>
 * 邮箱：hezhiyuan@iwown.com
 */

public class YylpfeViewHolder extends BaseViewHolder<YylpfeData> {
    public  TextView mTitle;
    private Context context;
    public YylpfeViewHolder(ViewGroup parent, Context context) {
        super(parent, R.layout.fragment_item_heart);
        this.context=context;
    }

    @Override
    public void onInitializeView() {
        super.onInitializeView();
        mTitle= (TextView) findViewById(R.id.card_title_heart);
    }

    @Override
    public void setData(YylpfeData data) {
        super.setData(data);
        mTitle.setText(String.valueOf(data.getTitle()));
    }

    @Override
    public void onItemViewClick(YylpfeData data) {
        super.onItemViewClick(data);
        KLog.i(data.toString());
        if(BluetoothUtil.isConnected()){
            ProtoBufSync.getInstance().writeStopYYLpfeCmd();
        }
        UI.startActivity((Activity) context, YylpfeDemoActivity.class);
    }
}
