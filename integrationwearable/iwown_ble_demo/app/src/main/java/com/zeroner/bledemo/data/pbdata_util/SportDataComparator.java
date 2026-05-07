package com.zeroner.bledemo.data.pbdata_util;

import java.util.Comparator;

/**
 * @author Gavin
 * @date 2021/8/31
 */
public class SportDataComparator implements Comparator<TBSportData> {


    @Override
    public int compare(TBSportData o1, TBSportData o2) {
        //-1,倒序输出，1-顺序输出
        if(o2.getStart_uxtime() == o1.getStart_uxtime()){
            return 0;
        }
        return o2.getStart_uxtime()>o1.getStart_uxtime() ? -1 : 1;
    }
}
