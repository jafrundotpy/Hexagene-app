package com.zeroner.bledemo.bean.sql;

import org.litepal.annotation.Column;
import org.litepal.crud.DataSupport;

/**
 * Created by nokey on 2017/11/3.
 */

public class TB_f1_index extends DataSupport implements Comparable<TB_f1_index>{

    public static final String TYPE_61 = "61";
    public static final String TYPE_62 = "62";
    public static final String TYPE_64 = "64";

    private long uid;
    private String date;
    private long time;
    private int start_seq;
    private int end_seq;
    private int end_seq_index;
    private String data_from;
    private int ok;
    private String type;
    /**1 未完成  2 已完成(后来加的 ，默认值0不能当成未完成) */
    private int has_file;
    /**1 未完成  2 已完成 */
    private int has_up;
    private int type_int;

    /** 以下不进入数据库,仅用于计算*/
    @Column(ignore = true)
    public boolean hasNext=false;
    @Column(ignore = true)
    public int sendStartSeq;

    public long getId() {
        return getBaseObjId();
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public int getOk() {
        return ok;
    }

    public void setOk(int ok) {
        this.ok = ok;
    }

    public long getUid() {
        return uid;
    }

    public void setUid(long uid) {
        this.uid = uid;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }

    public int getStart_seq() {
        return start_seq;
    }

    public void setStart_seq(int start_seq) {
        this.start_seq = start_seq;
    }

    public int getEnd_seq() {
        return end_seq;
    }

    public void setEnd_seq(int end_seq) {
        this.end_seq = end_seq;
    }

    public int getEnd_seq_index() {
        return end_seq_index;
    }

    public void setEnd_seq_index(int end_seq_index) {
        this.end_seq_index = end_seq_index;
    }

    public String getData_from() {
        return data_from;
    }

    public void setData_from(String data_from) {
        this.data_from = data_from;
    }

    public int getHas_file() {
        return has_file;
    }

    public void setHas_file(int has_file) {
        this.has_file = has_file;
    }

    public int getHas_up() {
        return has_up;
    }

    public void setHas_up(int has_up) {
        this.has_up = has_up;
    }

    public int getType_int() {
        if(type_int == 0){
            return 0x61;
        }
        return type_int;
    }

    public void setType_int(int type_int) {
        this.type_int = type_int;
    }

    public int getTypeInt(){
        if(TYPE_61.equalsIgnoreCase(type)){
            return 0x61;
        }else if(TYPE_62.equalsIgnoreCase(type)){
            return 0x62;
        }else if(TYPE_64.equalsIgnoreCase(type)){
            return 0x64;
        }
        return 0x61;
    }

    public boolean isHasNext() {
        return hasNext;
    }

    public void setHasNext(boolean hasNext) {
        this.hasNext = hasNext;
    }

    public int getTotalSeq(){
        return (end_seq_index - sendStartSeq)>0 ? (end_seq_index - sendStartSeq) : 1;
    }

    public int getDataEndSeq(){
        return end_seq;
    }

    public int getSendStartSeq() {
        return sendStartSeq;
    }

    public void setSendStartSeq(int sendStartSeq) {
        this.sendStartSeq = sendStartSeq;
    }


    @Override
    public int compareTo(TB_f1_index o) {
        return (int) (o.getTime() - this.getTime());
    }
}

