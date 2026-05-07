package com.zeroner.bledemo.bean.sql;

import org.litepal.crud.DataSupport;

/**
 * <噢,买噶,木有bug>
 *
 * @author zhouwei
 * 2021/11/23
 */
public class TB_ecg_data_temporary extends DataSupport {

    int seq;
    String dataList;

    public int getSeq() {
        return seq;
    }

    public void setSeq(int seq) {
        this.seq = seq;
    }

    public String getDataList() {
        return dataList;
    }

    public void setDataList(String dataList) {
        this.dataList = dataList;
    }
}
