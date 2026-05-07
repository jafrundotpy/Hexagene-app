package com.zeroner.bledemo.bean.sql;

import org.litepal.crud.DataSupport;

public class ProtoBuf_index_record extends DataSupport {

    private String data_from;
    private int start_idx;
    private int end_idx;
    private long time;
    private int type;
    private String type_str;
    private long up_time;
    private int over;
    private long data_time;

    public long getData_time() {
        return data_time;
    }

    public void setData_time(long data_time) {
        this.data_time = data_time;
    }

    public String getData_from() {
        return data_from;
    }

    public void setData_from(String data_from) {
        this.data_from = data_from;
    }

    public int getStart_idx() {
        return start_idx;
    }

    public void setStart_idx(int start_idx) {
        this.start_idx = start_idx;
    }

    public int getEnd_idx() {
        return end_idx;
    }

    public void setEnd_idx(int end_idx) {
        this.end_idx = end_idx;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }

    public long getUp_time() {
        return up_time;
    }

    public void setUp_time(long up_time) {
        this.up_time = up_time;
    }

    public int getOver() {
        return over;
    }

    public void setOver(int over) {
        this.over = over;
    }

    public String getType_str() {
        return type_str;
    }

    public void setType_str(String type_str) {
        this.type_str = type_str;
    }

    public long getId(){
        return getBaseObjId();
    }
}
