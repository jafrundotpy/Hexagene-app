package com.zeroner.bledemo.utils;

import com.blankj.utilcode.util.LogUtils;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;
import java.util.LinkedList;

/**
 * 数据传输统计工具类
 * 用于计算传输速率、丢包率、延时、抖动等
 */
public class DataTransferStats {

    /** 传输数据总量 bit */
    private BigInteger mTransferSum = new BigInteger("0");
    /** 传输总时间 s */
    private int mTransferTime = 0;
    /** 传输数据包数量 */
    private int mPacketCount = 0;
    /** 起始seq */
    private int mStartSeq = 0;
    /** 当前seq */
    private int mLatestSeq = 0;
    /** 数据延时总量 ms */
    private BigInteger mSensorDelaySum = new BigInteger("0");
    /** 抖动总量 ms */
    private BigInteger mJitterSum = new BigInteger("0");
    /**  数据时间队列：用于存储数据的时间，先进先出，保证只保留最新3个 */
    private final LinkedList<Integer> mSensorSecondsQueue = new LinkedList<>();

    /**
     * 重置统计数据
     */
    public void reset() {
        mTransferSum = new BigInteger("0");
        mTransferTime = 0;
        mStartSeq = 0;
        mLatestSeq = 0;
        mPacketCount = 0;
        mSensorDelaySum = new BigInteger("0");
        mJitterSum = new BigInteger("0");
        mSensorSecondsQueue.clear();
    }

    /**
     * 添加传输数据量
     * @param byteLength 数据字节长度
     */
    public void addTransferData(int byteLength) {
        int bit = byteLength * 8;
        mTransferSum = mTransferSum.add(BigInteger.valueOf(bit));
    }

    /**
     * 记录序列号
     * @param seq 当前序列号
     */
    public void recordSeq(int seq) {
        if (seq < mLatestSeq) {
            // 避免seq发生翻转导致异常
            seq = seq + mLatestSeq;
        }

        mLatestSeq = seq;
        if (mPacketCount == 0) {
            mStartSeq = mLatestSeq;
        }
    }

    /**
     * 记录数据时间，仅保留最新的3个
     * @param sensorSeconds 数据生成的秒时间戳
     */
    public void recordSensorSeconds(int sensorSeconds) {
        mSensorSecondsQueue.offer(sensorSeconds);
        if (mSensorSecondsQueue.size() > 3) {
            mSensorSecondsQueue.poll();
        }

        // 添加数据延时
        addSensorDelay(sensorSeconds);
        // 添加数据抖动
        addJitter();
    }

    /**
     * 添加数据延时
     * @param sensorSeconds 数据生成的秒时间戳
     */
    private void addSensorDelay(int sensorSeconds) {
        long currentTime = System.currentTimeMillis();
        long delay = currentTime - sensorSeconds * 1000L;
        LogUtils.dTag("AAAAA", "delay : " + delay);
        mSensorDelaySum = mSensorDelaySum.add(new BigInteger(String.valueOf(delay)));
    }

    /**
     * 添加抖动
     */
    private void addJitter() {
        if (mSensorSecondsQueue.size() < 3) {
            return;
        }
        long time0 = mSensorSecondsQueue.get(0) * 1000L;
        long time1 = mSensorSecondsQueue.get(1) * 1000L;
        long time2 = mSensorSecondsQueue.get(2) * 1000L;
        long jitter = Math.abs(Math.abs(time2 - time1) - Math.abs(time1 - time0));
        LogUtils.dTag("AAAAA", "jitter : " + jitter);
        mJitterSum = mJitterSum.add(new BigInteger(String.valueOf(jitter)));
    }

    /**
     * 获取当前数据包数量
     * @return 数据包数量
     */
    public int getPacketCount() {
        return mPacketCount;
    }

    /**
     * 增加数据包数量
     */
    public void incrementPacketCount() {
        mPacketCount++;
    }

    /**
     * 增加传输时间（通常每秒调用一次）
     */
    public void incrementTime() {
        LogUtils.dTag("AAAAA", "incrementTime");
        mTransferTime++;
    }

    /**
     * 获取传输速率 (kbps)
     * @return 传输速率字符串
     */
    public String getTransferRate() {
        if (mTransferTime == 0) return "0.0";
        long milliseconds = 1000L * mTransferTime;
        return new BigDecimal(mTransferSum)
                .setScale(1, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(milliseconds), RoundingMode.HALF_UP)
                .toString();
    }

    /**
     * 获取丢包率
     * @return 丢包率字符串
     */
    public String getPacketErrorRate() {
        int packetLoss = mLatestSeq - mStartSeq - mPacketCount + 1;
        if (mLatestSeq == 0 || packetLoss <= 0 || (mLatestSeq - mStartSeq) == 0) {
            return "0";
        } else {
            return String.valueOf(1f * packetLoss / (mLatestSeq - mStartSeq));
        }
    }

    /**
     * 获取平均延时 (ms)
     * @return 平均延时字符串
     */
    public String getAverageDelay() {
        if (mPacketCount == 0) return "0";
        return new BigDecimal(mSensorDelaySum)
                .setScale(0, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(mPacketCount), RoundingMode.HALF_UP)
                .toString();
    }

    /**
     * 获取平均抖动 (ms)
     * @return 平均抖动字符串
     */
    public String getAverageJitter() {
        if (mPacketCount == 0) return "0";
        return new BigDecimal(mJitterSum)
                .setScale(0, RoundingMode.HALF_UP)
                .divide(BigDecimal.valueOf(mPacketCount), RoundingMode.HALF_UP)
                .toString();
    }
}
