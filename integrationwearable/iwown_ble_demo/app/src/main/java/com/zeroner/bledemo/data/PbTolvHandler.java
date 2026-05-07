package com.zeroner.bledemo.data;

import com.zeroner.bledemo.bean.sql.ProtoBuf_80_data;
import com.zeroner.bledemo.bean.sql.TB_spo2_data;
import com.zeroner.bledemo.bean.sql.TB_temper;
import com.zeroner.bledemo.bean.sql.TB_v3_sport_data;
import com.zeroner.bledemo.bean.sql.TB_yylpfe_data;
import com.zeroner.bledemo.utils.DateUtil;
import com.zeroner.bledemo.utils.SqlBizUtils;
import com.zeroner.blemidautumn.bluetooth.model.ProtobufYyLpfeData;
import com.zeroner.blemidautumn.library.KLog;
import com.zeroner.blemidautumn.utils.ByteUtil;
import com.zeroner.blemidautumn.utils.JsonTool;

import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;

public class PbTolvHandler {
    public static void saveYYLpfeToDb(ProtobufYyLpfeData lpfeData,String dataFrom){
        TB_yylpfe_data data = new TB_yylpfe_data();
        data.setData_from(dataFrom);
        data.setSeq(lpfeData.getSeq());
        data.setTimes(lpfeData.getTimes());
        data.setValue(lpfeData.getDataValue());
        data.saveOrUpdate("data_from=? and times=? and seq=?",dataFrom,String.valueOf(data.getTimes()),String.valueOf(data.getSeq()));
    }

}
