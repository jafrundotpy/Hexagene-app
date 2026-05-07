package com.zeroner.bledemo.eventbus;

/**
 * @author gavin
 * @data 2019/10/11
 */
public class DialChooseEvent {

    public int dialIndex;

    public DialChooseEvent(){}

    public DialChooseEvent(int dialIndex) {
        this.dialIndex = dialIndex;
    }


}
