package com.zeroner.bledemo.eventbus;

/**
 * @author gavin
 * @data 2019/10/11
 */
public class DialProgressEvent {

    public int progress;
    public boolean ok;
    public boolean isClear = false;
    public int type;
    public DialProgressEvent(){}

    public DialProgressEvent(boolean isClear){
        this.isClear = isClear;
    }

    public DialProgressEvent(int progress){
        this.progress = progress;
        this.ok = false;
    }

    public int getProgress() {
        return progress;
    }

    public void setProgress(int progress) {
        this.progress = progress;
    }

    public boolean isOk() {
        return ok;
    }

    public void setOk(boolean ok) {
        this.ok = ok;
    }

    public int getType() {
        return type;
    }

    public void setType(int type) {
        this.type = type;
    }
}
