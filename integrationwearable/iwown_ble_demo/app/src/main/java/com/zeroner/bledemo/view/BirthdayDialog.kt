package com.zeroner.bledemo.view

import android.content.Context
import android.view.Gravity
import com.bigkoo.pickerview.adapter.ArrayWheelAdapter
import com.bigkoo.pickerview.lib.WheelView
import com.blankj.utilcode.util.ConvertUtils
import com.zeroner.bledemo.R
import com.zeroner.bledemo.utils.DateUtil
import java.util.*

class BirthdayDialog(context: Context, private val dateUtil: DateUtil) : NewAbsCustomDialog(context) {

    /** 当前弹框选择到的年月日 */
    private var mDay: Int? = null
    private var mMonth: Int? = null
    private var mYear: Int? = null

    /** 年月日滚轮 */
    private lateinit var wheelViewDay: WheelView
    private lateinit var wheelViewMonth: WheelView
    private lateinit var wheelViewYear: WheelView

    override fun getLayoutResID(): Int {
        return R.layout.my_module_view_birthday_dialog
    }

    override fun initView() {
        wheelViewYear = findViewById(R.id.wheel_view_year)
        wheelViewMonth = findViewById(R.id.wheel_view_month)
        wheelViewDay = findViewById(R.id.wheel_view_day)
    }

    override fun initData() {
        mDay = dateUtil.day
        mMonth = dateUtil.month
        mYear = dateUtil.year

        // 初始化日滚轮。可见项5个，其中一个在顶部一个在底部，实际被压扁不可视；分割线不可视
        wheelViewDay.adapter = ArrayWheelAdapter(getDaysOfMonth())
//        wheelViewDay.setItemsVisible(5)
        wheelViewDay.currentItem = mDay!! - 1
        wheelViewDay.setDividerType(WheelView.DividerType.FILL)
        // 初始化月滚轮
        wheelViewMonth.adapter = ArrayWheelAdapter(getMonthsOfYear())
//        wheelViewMonth.setItemsVisible(5)
        wheelViewMonth.currentItem = mMonth!! - 1
        wheelViewMonth.setDividerType(WheelView.DividerType.FILL)
        // 初始化年滚轮
        wheelViewYear.adapter = ArrayWheelAdapter(getYears())
//        wheelViewYear.setItemsVisible(5)
        wheelViewYear.currentItem = initYearCurrentItem()
        wheelViewYear.setDividerType(WheelView.DividerType.FILL)
    }

    override fun initListener() {
        wheelViewDay.setOnItemSelectedListener {
            // 日份改变。索引从0开始，要加1
            mDay = it + 1
        }

        wheelViewMonth.setOnItemSelectedListener {
            // 月份改变。索引从0开始，要加1
            mMonth = it + 1

            // 日份改变
            val oldDay = mDay!!
            wheelViewDay.adapter = ArrayWheelAdapter(getDaysOfMonth())
            val newDayCount = wheelViewDay.itemsCount
            mDay = if (oldDay > newDayCount) newDayCount else oldDay
            wheelViewDay.currentItem = mDay!! - 1
        }

        wheelViewYear.setOnItemSelectedListener {
            // 年份改变
            mYear = wheelViewYear.adapter.getItem(it).toString().toInt()

            // 月份改变。如果旧选中的年的month比新选中的年的月份数多，新选中年一定为今年
            val oldMonth = mMonth!!
            wheelViewMonth.adapter = ArrayWheelAdapter(getMonthsOfYear())
            val newMonthCount = wheelViewMonth.itemsCount
            mMonth = if (oldMonth > newMonthCount) newMonthCount else oldMonth
            wheelViewMonth.currentItem = mMonth!! - 1

            // 日份改变
            val oldDay = mDay!!
            wheelViewDay.adapter = ArrayWheelAdapter(getDaysOfMonth())
            val newDayCount = wheelViewDay.itemsCount
            mDay = if (oldDay > newDayCount) newDayCount else oldDay
            wheelViewDay.currentItem = mDay!! - 1
        }

    }

    /**
     * 获取选中月的日数。如果是今年，今月，则当前天数
     */
    private fun getDaysOfMonth(): List<String> {
        val calendar = Calendar.getInstance()
        // 今年今月今日
        val thisYear = calendar.get(Calendar.YEAR)
        val thisMonth = calendar.get(Calendar.MONTH) + 1
        val thisDay = calendar.get(Calendar.DAY_OF_MONTH)

        calendar.set(Calendar.YEAR, mYear!!)
        calendar.set(Calendar.MONTH, mMonth!! - 1)
        var days = calendar.getActualMaximum(Calendar.DAY_OF_MONTH)
        val dayList = mutableListOf<String>()

        if (mYear == thisYear && mMonth == thisMonth) {
            days = thisDay
        }
        for (i in 1..days) {
            if (i < 10) dayList.add("0$i") else dayList.add("$i")
        }
        return dayList
    }

    /**
     * 获取选中年的月数。如果不是今年，则12个月；是今年，则当前月数
     */
    private fun getMonthsOfYear(): List<String> {
        val calendar = Calendar.getInstance()
        val thisYear = calendar.get(Calendar.YEAR)
        val monthList = mutableListOf<String>()
        var monthCount = 12

        if (mYear == thisYear) {
            monthCount = calendar.get(Calendar.MONTH) + 1
        }
        for (i in 1..monthCount) {
            if (i < 10) monthList.add("0$i") else monthList.add("$i")
        }
        return monthList
    }

    /**
     * 获取最近100年
     */
    private fun getYears(): List<String> {
        val yearList = mutableListOf<String>()
        val year = Calendar.getInstance().get(Calendar.YEAR)
        for(i in 0..5){
            yearList.add((year-5+i).toString())
        }
        return yearList
    }

    /**
     * 设置年份初始化位置索引
     */
    private fun initYearCurrentItem(): Int {
        val maxYear = Calendar.getInstance().get(Calendar.YEAR)
        val minYear = maxYear - 5
        if (mYear!! > maxYear) mYear = maxYear
        if (mYear!! < minYear) mYear = minYear
        return mYear!! - minYear
    }

    override fun getWidth(): Int {
        return android.view.ViewGroup.LayoutParams.MATCH_PARENT
    }

    override fun getHeight(): Int {
        return ConvertUtils.dp2px(202f)
    }

    override fun getGravity(): Int {
        return Gravity.BOTTOM
    }

    override fun getCancelable(): Boolean {
        return true
    }

    override fun getCanceledOnTouchOutside(): Boolean {
        return true
    }

//    override fun getWindowAnimationsResId(): Int {
//        return R.style.BottomDialogAnim
//    }

    override fun onStop() {
        super.onStop()
        dateUtil.day = mDay!!
        dateUtil.month = mMonth!!
        dateUtil.year = mYear!!
    }
}