package com.zeroner.bledemo.data.pbdata_util;

public class TbOtherData {
    //数据类型名称
    private String name;
    //数值,当类型为体温时，获取的体温除以10获取浮点型体温
    //当类型为血压时，value为 sbp,value2为dbp
    private int value;
    private int value2;
    //时间戳，秒数
    private long time;

    public TbOtherData(String name){
        this.name = name;
    }

    public void saveValueAndTime(int value,long time){
        this.value = value;
        this.time = time;
    }

    //当类型为血压时，value2的值才有意义
    public void saveAllValueAndTime(int value,int value2,long time){
        this.value = value;
        this.value2 = value2;
        this.time = time;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getValue() {
        return value;
    }

    public void setValue(int value) {
        this.value = value;
    }

    public int getValue2() {
        return value2;
    }

    public void setValue2(int value2) {
        this.value2 = value2;
    }

    public long getTime() {
        return time;
    }

    public void setTime(long time) {
        this.time = time;
    }
}
