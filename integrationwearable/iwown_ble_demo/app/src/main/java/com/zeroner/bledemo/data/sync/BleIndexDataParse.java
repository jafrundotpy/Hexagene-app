package com.zeroner.bledemo.data.sync;

import com.google.gson.Gson;
import com.zeroner.bledemo.bean.sql.TB_61_data;
import com.zeroner.bledemo.bean.sql.TB_62_data;
import com.zeroner.bledemo.bean.sql.TB_64_data;
import com.zeroner.bledemo.bean.sql.TB_64_index_table;
import com.zeroner.bledemo.bean.sql.TB_f1_index;
import com.zeroner.bledemo.bean.sql.TB_mtk_statue;
import com.zeroner.bledemo.data.MtkDataParsePresenter;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.blemidautumn.bluetooth.model.IndexTable;

import org.litepal.crud.DataSupport;

import java.util.Collections;
import java.util.LinkedList;
import java.util.List;

/**
 * @author Gavin
 * @date 2020-04-05
 */
public class BleIndexDataParse {

    /**
     * 解析61的index
     * @param result
     * @param uid
     * @param dataFrom
     * @return
     */
    public LinkedList<TB_f1_index> parse62IndexData(String result, long uid, String dataFrom){
        IndexTable indexTable=new Gson().fromJson(result,IndexTable.class);
        MtkDataParsePresenter.map62.clear();
        List<IndexTable.TableItem> tableItems=indexTable.getmTableItems();
        DateUtil todayDate = new DateUtil();
        LinkedList<TB_f1_index> f1IndexList = new LinkedList<>();
        if(tableItems.size()>0){
            for (IndexTable.TableItem tableItem : tableItems) {
                if(tableItem.getYear()!=todayDate.getYear() && (tableItem.getYear()+1)!=todayDate.getYear()) {
                    continue;
                }
                if(tableItem.getStart_index() >= tableItem.getEnd_index()){
                    continue;
                }
                int mfend=tableItem.getEnd_index();
                if(mfend>1023){
                    mfend=mfend-1024;
                }

                DateUtil dateUtil = new DateUtil(tableItem.getYear(),tableItem.getMonth(),tableItem.getDay());
                long fTime=dateUtil.getUnixTimestamp();
                //TB_f1_index为了防止数据的日期与seq对不上问题，导致每次刷新都有几天数据
                TB_f1_index f1Index = DataSupport.where("uid=? and start_seq=? and end_seq=? and data_from=?",uid+"",tableItem.getStart_index()+"",mfend+"",dataFrom).findFirst(TB_f1_index.class);

                if(f1Index!=null && f1Index.getOk()==1){
                    continue;
                }else{

                    //今天是数据一直在变化 ，start_seq不变
                    if(dateUtil.getSyyyyMMddDate().equals(todayDate.getSyyyyMMddDate())){
                        DataSupport.deleteAll(TB_f1_index.class,"uid=? and data_from=? and date=? and start_seq=?",uid+"",dataFrom,todayDate.getSyyyyMMddDate(),tableItem.getStart_index()+"");
                    }
                    boolean isTbNull = false;
                    if(f1Index == null){
                        isTbNull = true;
                        f1Index = new TB_f1_index();
                        f1Index.setSendStartSeq(tableItem.getStart_index());
                    }else{
                        TB_62_data data_62 = DataSupport.where("uid=? and year=? and month=? and day=? and data_from=? ",
                                String.valueOf(uid)
                                , String.valueOf(tableItem.getYear())
                                , String.valueOf(tableItem.getMonth())
                                , String.valueOf(tableItem.getDay())
                                , dataFrom).order("time desc").findFirst(TB_62_data.class);
                        if(data_62!=null && tableItem.getStart_index()<data_62.getSeq()){
                            f1Index.setSendStartSeq(data_62.getSeq());
                        }

                    }

                    f1Index.setUid(uid);
                    f1Index.setDate(dateUtil.getSyyyyMMddDate());
                    f1Index.setData_from(dataFrom);
                    f1Index.setTime(fTime);
                    f1Index.setStart_seq(tableItem.getStart_index());
                    f1Index.setEnd_seq(mfend);
                    f1Index.setEnd_seq_index(tableItem.getEnd_index());
                    f1Index.setOk(0);
                    f1Index.setType("62");
                    f1Index.setType_int(0x62);
                    f1Index.setHas_file(1);
                    f1Index.setHas_up(1);
                    if(isTbNull){
                        f1Index.save();
                    }else{
                        f1Index.update(f1Index.getId());
                    }
                    f1IndexList.add(f1Index);


                    TB_mtk_statue mtk_statue = new TB_mtk_statue();
                    mtk_statue.setUid(uid);
                    mtk_statue.setData_from(dataFrom);
                    mtk_statue.setType(62);
                    mtk_statue.setYear(tableItem.getYear());
                    mtk_statue.setMonth(tableItem.getMonth());
                    mtk_statue.setDay(tableItem.getDay());
                    mtk_statue.setHas_file(2);
                    mtk_statue.setHas_up(2);
                    mtk_statue.setHas_tb(2);
                    mtk_statue.setDate(dateUtil.getUnixTimestamp());
                    mtk_statue.saveOrUpdate("uid=? and data_from=? and type=? and date=?",
                            uid+"",dataFrom,"62",dateUtil.getUnixTimestamp()+"");
                    MtkDataParsePresenter.map62.put(dateUtil.getSyyyyMMddDate(),1);
                }

            }
        }
        //按时间倒序排序
        Collections.sort(f1IndexList);
        return f1IndexList;
    }


    /**
     * 解析64的index
     * @param result
     * @param uid
     * @param dataFrom
     * @return
     */
    public LinkedList<TB_f1_index> parseIndexData(int type,String result,long uid,String dataFrom){

        String typeStr = "61";
        int maxEndSeq = 4096;
        if(type == 0x64){
            maxEndSeq = 1280;
            typeStr = "64";
        }else if(type == 0x61){
            maxEndSeq = 4096;
            typeStr = "61";
        }else if(type == 0x6a){
            maxEndSeq = 2048;
            typeStr = "6a";
        }else if(type == 0x6b){
            maxEndSeq = 4096;
            typeStr = "6b";
        }else if(type == 0x6c){
            maxEndSeq = 2048;
            typeStr = "6c";
        }

        IndexTable indexTable=new Gson().fromJson(result,IndexTable.class);
        List<IndexTable.TableItem> tableItems=indexTable.getmTableItems();
        DateUtil todayDate = new DateUtil();
        LinkedList<TB_f1_index> f1IndexList = new LinkedList<>();
        if(tableItems.size()>0){
            for (IndexTable.TableItem tableItem : tableItems) {
                if(tableItem.getYear()!=todayDate.getYear() && (tableItem.getYear()+1)!=todayDate.getYear()) {
                    continue;
                }
                if(tableItem.getStart_index()==tableItem.getEnd_index()){
                    continue;
                }
                int mFend=tableItem.getEnd_index();
                if(mFend >= maxEndSeq){
                    mFend=mFend-maxEndSeq;
                }

//                DateUtil dateUtil = new DateUtil(tableItem.getYear(),tableItem.getMonth(),tableItem.getDay());
                DateUtil dateUtil = new DateUtil(tableItem.getYear(),tableItem.getMonth(),tableItem.getDay(),tableItem.getHour(),tableItem.getMin(),tableItem.getSecond());
                long fTime=dateUtil.getUnixTimestamp();
                long stTime = dateUtil.getUnixTimestamp();
                //TB_f1_index为了防止数据的日期与seq对不上问题，导致每次刷新都有几天数据
                TB_f1_index f1Index = DataSupport.where("uid=? and start_seq=? and end_seq=? and data_from=? and date=? and type=?",
                        uid+"",tableItem.getStart_index()+"",mFend+"",dataFrom,dateUtil.getSyyyyMMddDate(),typeStr).findFirst(TB_f1_index.class);
                if(f1Index!=null && f1Index.getOk()==1){
                    continue;
                }else{

                    int mStSeq = -1;
                    //今天是数据一直在变化 ，start_seq不变
                    if(dateUtil.getSyyyyMMddDate().equals(todayDate.getSyyyyMMddDate())){
                        TB_f1_index todayIndex = DataSupport.where("uid=? and start_seq=? and data_from=? and date=? and type=?",
                                uid+"",tableItem.getStart_index()+"",dataFrom,dateUtil.getSyyyyMMddDate(),typeStr).findFirst(TB_f1_index.class);
                        if(todayIndex!=null){
                            if(todayIndex.getOk()==1 && todayIndex.getEnd_seq_index()>0) {
                                mStSeq = todayIndex.getEnd_seq_index();
                            }
                            f1Index = todayIndex;
                        }
                    }
                    boolean isTbNull = false;
                    if(f1Index == null){
                        isTbNull = true;
                        f1Index = new TB_f1_index();
                        f1Index.setSendStartSeq(tableItem.getStart_index());
                    }else{
                        if(mStSeq != -1){
                            f1Index.setSendStartSeq(mStSeq);
                        }else {
                            int sendSeq = getSendStartSeq(type, uid, dataFrom, tableItem.getYear(), tableItem.getMonth(), tableItem.getDay());
                            if (tableItem.getStart_index() < sendSeq) {
                                f1Index.setSendStartSeq(sendSeq);
                            }
                        }

                    }

                    f1Index.setUid(uid);
                    f1Index.setDate(dateUtil.getSyyyyMMddDate());
                    f1Index.setData_from(dataFrom);
                    f1Index.setTime(fTime);
                    f1Index.setStart_seq(tableItem.getStart_index());
                    f1Index.setEnd_seq(mFend);
                    f1Index.setEnd_seq_index(tableItem.getEnd_index());
                    f1Index.setOk(0);
                    f1Index.setType(typeStr);
                    f1Index.setType_int(type);
                    f1Index.setHas_file(1);
                    f1Index.setHas_up(1);

                    //存一份64表,ecg使用

                    if(isTbNull){
                        f1Index.save();
                    }else{
                        f1Index.update(f1Index.getId());
                    }
                    f1IndexList.add(f1Index);

                    if(type == 0x64){
                        TB_64_index_table index_table = new TB_64_index_table();
                        index_table.setUid(uid);
                        index_table.setData_from(dataFrom);
                        index_table.setData_ymd(dateUtil.getSyyyyMMddDate());
                        index_table.setSeq_start(tableItem.getStart_index());
                        index_table.setSeq_end(mFend);
                        index_table.setSync_seq(tableItem.getStart_index());
                        index_table.setDate(dateUtil.getY_M_D_H_M_S());
                        index_table.setUnixTime(dateUtil.getUnixTimestamp());
                        index_table.saveOrUpdate("uid=? and data_from =? and date=?" ,
                                String.valueOf(uid),dataFrom,dateUtil.getY_M_D_H_M_S());
                    }

                }

//                byte[] b = new byte[4];
//                b[0] = (byte) (startSeq & 0xff);
//                b[1] = (byte) (startSeq >>> 8);
//                b[2] = (byte) (tableItem.getEnd_index() & 0xff);
//                b[3] = (byte) (tableItem.getEnd_index() >>> 8);
            }
        }
        //按时间倒序-排序
        Collections.sort(f1IndexList);
        return f1IndexList;
    }

    private int getSendStartSeq(int type,long uid,String dataFrom,int year,int month,int day){
        if(type == 0x61){
            TB_61_data data_61 = DataSupport.where("uid=? and year=? and month=? and day=? and data_from=? ",
                    String.valueOf(uid)
                    , String.valueOf(year)
                    , String.valueOf(month)
                    , String.valueOf(day)
                    , dataFrom).order("time desc").findFirst(TB_61_data.class);
            if(data_61!=null){
                return data_61.getSeq();
            }
        }else if(type == 0x64){
            TB_64_data data_64 = DataSupport.where("uid=? and year=? and month=? and day=? and data_from=? ",
                    String.valueOf(uid)
                    , String.valueOf(year)
                    , String.valueOf(month)
                    , String.valueOf(day)
                    , dataFrom).order("time desc").findFirst(TB_64_data.class);
            if(data_64!=null) {
                return data_64.getSeq();
            }
        }
        return 0;
    }

}
