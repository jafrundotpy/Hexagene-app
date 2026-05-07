package com.zeroner.bledemo.bean.sql;

import org.litepal.crud.DataSupport;

/**
 * @author Gavin
 * @date 2024/6/17
 */
public class TB_yylpfe_data  extends DataSupport {
    private int seq;

    private String data_from;
    //时间戳-秒数, 时间相同的数据视为同一份中医报告的数据
    private long times;
    private String value;

    public int getSeq() {
        return seq;
    }

    public void setSeq(int seq) {
        this.seq = seq;
    }

    public String getData_from() {
        return data_from;
    }

    public void setData_from(String data_from) {
        this.data_from = data_from;
    }

    public long getTimes() {
        return times;
    }

    public void setTimes(long times) {
        this.times = times;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
