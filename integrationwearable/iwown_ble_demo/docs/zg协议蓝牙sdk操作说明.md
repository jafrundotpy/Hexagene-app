# ZG协议蓝牙SDK操作说明

## 接入说明
1. 请将SDK中的**xxx.aar**文件拷贝到自己的peoject工程中的lib下
2. 在自己project的app中的build.gradle dependencies下面添加`implementation(name: 'blesdk-debug', ext: 'aar')`然后在build.gradle android中添加如下代码:
```
repositories {
        flatDir {
            dirs 'libs'
        }
    }
```
3. 在Application中启动**BleService.class**和添加`SuperBleSDK.addBleListener(this, new IDataReceiveHandler())`,具体的说明参考示例代码的**BleApplicaiton**.
4. 注册一个广播接收器`MyReceiver.class`继承`BluetoothCallbackReceiver.class`这样全局都可以接收到该接收器的数据,可统一处理分发给需要数据的页面,拷贝Demo中`BaseActionUtils.class`和`BluetoothCallbackReceiver.class`到自己的工程中,可以写在自己Application的`oncrete()`,具体代码如下:
```
IntentFilter intentFilter = BaseActionUtils.getIntentFilter();
MyReceiver receiver = new MyReceiver();
LocalBroadcastManager.getInstance(this).registerReceiver(receiver, intentFilter);
```
5. 复制Demo中`BleApplication.class`中的代码`SuperBleSDK.addBleListener(this, new IDataReceiveHandler())`中的包括实现和发送的广播到代码到自己的Application中.
6. 初始化SDKType:
- 调用代码`SuperBleSDK.switchSDKTYpe(this,Constants.Bluetooth.Zeroner_Zg_Sdk)`.注意第二个参数选择**Bluetooth.Zeroner_Zg_Sdk**,此方法在启动**BleService.class之前调用**,这样就可以在**BleService.class**初始化BLE.
- 也可以在**BleService.class**启动之后初始化SDKType.首先`SuperBleSDK.switchSDKTYpe(this,Constants.Bluetooth.Zeroner_Zg_Sdk)`,然后在启动Service的ServiceConnection回调方法`onServiceConnected`中`mservice.setSDKType(this.getApplicationContext(),Constants.Bluetooth.Zeroner_Zg_Sdk)`,也可以通过`MyApplication.getInstance().getmService().setSDKType(this.getApplicationContext(), Constants.Bluetooth.Zeroner_Zg_Sdk)`.**注意此方法必须在`BleService.class`启动才能**执行,如果启动项目就开始扫描建议加一个延时.如:
```
Handler handler = new Handler(Looper.getMainLooper());
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                MyApplication.getInstance().getmService().setSDKType(this.getApplicationContext(), Constants.Bluetooth.Zeroner_Zg_Sdk);
            }
        },3000);
```

---
## 扫描连接
1. 建议使用`BluetoothUtil.class`来进行操作.扫描调用`BluetoothUtil.startScan()`方法.通过`LocalBroadcastManager.getInstance(context).registerReceiver(你的接收器对象, BaseActionUtils.getIntentFilter())`来回调.有三个回调方法如下解释:
- `onPreConnect()`发起连接回调
- `onScanResult(WristBand band)`扫描结果回调,在此回调方法中返回扫描的手环
- `connectStatue(boolean isConnect)`连接状态回调,断开和连接成功时候此方法
- `onBluetoothInit()`连接成功,可以和蓝牙进行数据交互,收发指令调用此方法,**一般情况在此方法处理蓝牙连接成功的标识.以便可以进行发送接收指令**

2. 调用`BluetoothUtil.stopScan();`来停止扫描,调用`BluetoothUtil.connect(band)`来进行连接.使用`BluetoothUtil.disconnect()`来断开连接.注意**band对象是`onScanResult(WristBand band)`中的band**
---

## 收发指令
1. 发送指令需要在`onBluetoothInit()`之后进行发送数据;
2. 有返回值的命令需要在最后加`BackgroundThreadManager.getInstance().addWriteData(context,cmd)`如:

```
/*设置时间*/
byte[] bytes = ZGSendBluetoothCmdImpl.getInstance().setTimeAndWeather();
BackgroundThreadManager.getInstance().addWriteData(context,bytes);
```

 >### APP下发类型指令
 >>一般下发指令手环返回model解析一样的,通知成功,发送成功或者失败.
 
 - **设置时间**

```

//设置时间 当前系统的实时时间
public byte[] setTimeAndWeather()
//设置时间带参数 ,单位(年,月,日,时,分,秒,星期,天气,温度)
byte[] setTimeAndWeather(int year, int month, int day, int hour, int minute, int second, int week,int weather, int temperature)

public byte[] setTimeAndWeather(int weather, int temperature)

//天气范围
//晴天 fine day weather = 0
//多云；cloudy  weather = 1
//阴天；over cast  weather = 2
//小雨 light rain weather = 3
//中雨；moderate rain  weather = 4
//'大雨' heavy rain  weather = 5
//阵雨： shower weather = 6
//下雪；snow weather = 7
//雾霾；haze； weather = 8
//沙尘暴；sand storm  weather =9
//多云转晴是； = 10；
//雷雨 = 11；
//未知天气 = 12

//温度: -50 - 50

```

 - **设置闹钟 日程**
 
```
    /**
     * 设置闹钟&日程  个数不要超过5个闹钟4个日程
     *
     * @param context
     * @param zgAlarmClockBeanList 闹钟集合 
     * @param scheduleList         日程集合
     */
    @Override
    public void setAlarmClockAndSchedule(Context context, List<ZGAlarmClockScheduleHandler.ZGAlarmClockBean> zgAlarmClockBeanList,List<ZGAlarmClockScheduleHandler.ZGSchedule> scheduleList)
    
    //闹钟类解释说明
     public static class ZGAlarmClockBean {
        //16543210 <(1,0有效无效)周六-周五>4,3,2,1,》周日(0)>
        //最大255 11111111 最高位是使能位设置1闹钟有效 ,后面的依次为周六 - ... - 周日
        //eg:设置周一应为10000010- 0x82 设置周一周二周六应该为11000110 -0xC6
        public int alarmSet;//删除写0
        public int alarmHour; //设置小时
        public int alarmMinute;//分钟
        public int alarmRingSetting = 1;//铃声设置；高三位是 0~7， 对应不同铃声，低
//5 位是反复次数， 默,认是 0x00, 如果铃声设置是 0
        public int alarm_len; //最高 15,为 5 个汉字；15 个字符
    }
    
    //日程类解释
    public static class ZGSchedule {
        public int scheduler_action;////日程是否有效， 删除日程这个 bye 写 0;
        public int scheduler_year;//年
        public int scheduler_month;//月
        public int scheduler_day;//日
        public int scheduler_hour;//时
        public int scheduler_minute;//分
        public int scheringSetting = 1;//铃声设置；高三位是 0~7， 对应不同铃声，低
//5 位是反复次数， 默,认是 0x00, 如果铃声设置是 0
    }
    
    
```

 - **设置语言**
 
```
 /**
     * 设置手环语言，目前支持中文和英文
     *
     * @param context
     * @param type    语言类型，0：英文 1：中文
     * @return
     */
    /**
     * 设置手环语言，目前支持中文和英文
     *
     * @param context
     * @param type    语言类型，0：英文 1：中文 2: 日文  3.德语 4.意大利语 5.韩语 ...
     * @return
     */
    @Override
    public void setLanguage(Context context, int type)

```

 - **计算卡路里开关**
 
```
 /**
     * 计算卡路里开关
     *
     * @param context
     * @param type    0：不计算 1：计算
     * @return
     */
    public void calcKcal(Context context, int type)
    
```

- **公制英制转换 温度转换 时间格式转换**

```
 /**
     * /**
     * 设置公英制
     *
     * @param context
     * @param type    0：公制 1：英制
     * @return
     */
    public void setUnitSwitch(Context context, int type)
    
    //温度转换
    //0 :摄氏 1:华氏
    public void setTemperatureUnitSwitch(Context context, int type)
    
    //0:24小时 1:12小时制
    public void setTimeDisplay(Context context, int type)
    
```

- **设置体重 行走 跑步 行走 信息**

```
    /**
     * 设置用户体重
     *
     * @param context
     * @param weight  user weight (30~255)kg; 默 认 是 65kg
     * @return
     */
    public void setUserWeight(Context context, int weight)


    /**
     * 设置行走步幅
     *
     * @param context
     * @param stride  步幅 (30~160)cm 默认 55cm
     * @return
     */
    public void setWalkStride(Context context, int stride)
    
    /**
     * 设置跑步步幅
     *
     * @param context
     * @param stride  步幅 (40~250)cm 默认 90cm
     * @return
     */
    public void setRunStride(Context context, int stride)
    
    /**
     * 设置行走跑步步幅
     *
     * @param context
     * @param stride  wStride walk  rStride run
     * @return
     */
    public void setStride(Context context, int wStride, int rStride)

```

- **设置目标**
```
    /**
     * 设置步行目标
     *
     * @param context
     * @param target 默认 8000
     * @return
     */
    public void setStepsTarget(Context context, int target)
    /**
     * 卡路里目标
     *
     * @param
     * @param target 单位是大卡,默认是500大卡
     * @return
     */

    public void setKcalTarget(Context context, int target)

    /**
     * 距离目标
     *
     * @param context
     * @param target 单位是 0.1KM, 默认是40(4.0)km
     * @return
     */
    @Override
    public void setDistanceTarget(Context context, int target
```

 - **来电消息提醒**
```
/**
来电提醒开关
 0 off 1 on
*/
public void setCallNotificationSwitch(Context context, int type)


/**
     * 来电提醒生效时间
     *
     * @param context
     * @param startHour
     * @param endHour
     * @return
     */
    @Override
    public void setComingCallHours(Context context, int startHour, int endHour)
    
    /**
     * 来电振动模式和次数
     *
     * @param context
     * @param type  代表来电震动提醒类型，0 不震动
     * @param count 重复的次数
     * @return
     */
    public void comingCallShake(Context context, int type, int count)
    
    
    /**
     * 消息推送开关
     *
     * @param context
     * @param type    0：关 1：开
     * @return
     */
    @Override
    public void setMsgNotificationSwitch(Context context, int type)
    
    
     /**
     * 消息提醒时间设置
     *
     * @param context
     * @param startHour
     * @param endHour
     * @return
     */
    @Override
    public void setComingMessageHours(Context context, int startHour, int endHour)
    
    
    /**
     * 消息振动
     *
     * @param context
     * @param type  同来电
     * @param count
     * @return
     */
    @Override
    public void comingMessageShake(Context context, int type, int count)
    
    
    /**
     * 消息通知
     *
     * @param header  传""
     * @param message  
     * @return
     */
    public byte[][] messageNotification(String header, String message) 
    
    
    /**
     * 电话通知
     *
     * @param header  
     * @param message  电话信息
     * @return
     */
    public byte[][] callNotification(String header, String callInfo)
    
    
    //示例代码
    byte[][] bytes = SuperBleSDK.getSDKSendBluetoothCmdImpl(mContext).callNotification("", message);
    for (int i = 0; i < bytes.length; i++) {
        BackgroundThreadManager.getInstance().addWriteDataAsMsg(mContext, bytes[i]);
    }

```

 - **心率设置**

 ```
 /**
     * 静态心率打开和开始结束时间
     *
     * @param context
     * @param heartOn
     * @param startHour
     * @param endHour
     * @return
     */
    @Override
    public void heartDetection(Context context, int heartOn, int startHour, int endHour)
    
    /**
     * 运动心率预警震动
     *
     * @param context
     * @param type 同来电
     * @param count
     * @return
     */
    @Override
    public void heartWarmingShake(Context context, int type, int count)
    
    
    /**
     * 心率预警开关和预警值设置 只有在运动模式有效
     *
     * @param context
     * @param warmingOn 
     训练模式心率报警开关； 默认=1
    0， 关闭；
    1， 心率过高报警开；
    2， 心率过低报警和过高报警都打开
     * @param heartHighAlarm 最高心率
     * @param heartLowAlarm 最低心率
     * @return
     */
    public void setHeartAlarm(Context context, int warmingOn, int heartHighAlarm, int heartLowAlarm)
    
 ```
 
  - **设置所有震动**
  ```
    /**
     *
     * 设置振动模式全部一起设置
     *
     * @param context
     * @param phoneType 电话 同来电设置
     * @param phoneCount 次数
     * @param msgType 消息类型  同来电设置
     * @param msgCount
     * @param setLongType 久坐  同来电设置
     * @param setLongCount
     * @param heartType 心率 同来电设置
     * @param heartCount
     */
    public void setShake(Context context, int phoneType, int phoneCount, int msgType, int msgCount, int setLongType, int setLongCount, int heartType, int heartCount)
    
  ```
  
   - **振动测试**
   
   ```
    **
     * 测试震动模式（测试马达）
     * 
     *
     * @param mode 振动模式
     * @param times 振动次数
     * @return
     */
    @Ove
    public byte[] testShake(@IntRange(from = 1, to = 7) int mode, @IntRange(from = 0, to = 31) int times)
    
    
   ```

  
   - **久坐设置**
   ```
   /**
     * @param context
     * @param alarm 
        =0，   久坐提醒关闭；
        =1， 久坐提醒打开， 中午免打扰无效；
        =2， 久坐提醒打开， 中午免打扰有效
     * @param startHour 久坐开始时间 默认 8
     * @param endHour   久坐结束时间  默认 18
     * @return
     */
    @Override
    public void setLongSitAlarm(Context context, int alarm, int startHour, int endHour)
    
    /**
     * 久坐提醒
     *
     * @param context
     * @param type  同来电
     * @param count
     * @return
     */
    @Override
    public void comingLongSitShake(Context context, int type, int count)
    
    
   ```
   
   
  - **翻腕亮屏**
   ```
   /**
     * 翻碗亮屏开关
     *
     * @param context
     * @param gestureOn 0：off 1:on
     * @param startHour
     * @param endHour
     * @return
     */
    @Override
    public void setGesture(Context context, int gestureOn, int startHour, int endHour)
   ```
   
>### 手环上报类型指令
>返回值是以json字符串形式返回的,可以根据谷歌Gson或者阿里fastJson解析model

   - **获取固件信息**
   ```
    /**
    *获取固件信息
    /
    public byte[] getHardwareFeatures()
    
    
    返回的model
    
    public class ZGHardwareInfo {
        //版本号
        private int dev_version;
        //版本号的String
        private String dev_version_s;
        //设备有无屏幕
        private int dev_screen;
        //有无按键
        private int dev_key_type;
        //设备的字库 IC 类型,0 是没有字库,1...N 是后面规定
        private int dev_fontic;
        //设备的 Gsensor 类型,0 是没有 G sensor, 1...N 是后面规定型号;
        private int dev_gsensor;
        //设备的马达类型, 0 为没有马达, 1...N 为后面规定的型号;
        private int dev_moto;
        //设备的心率模块, 0 是没有,1...N 是后面规定型号;
        private int dev_heart;
        //设备的 CFCA 模块,0 是没有, 1...N 是后面规定型号;
        private int dev_cfca;
        //设备的 NFC 模块, 0 是没有, 1...N 是后面规定型号;
        private int dev_nfc;
        //设备保留信息;默认是 0;
        private int dev_reserve = 0;
        //model名称
        private String model = "";
    }
    
   ```
   
   
   - 获取手环信息
   
   ```
   /**
     * 获取手环设置信息
     *
     * @return
     */
    @Override
    public byte[] getFirmwareInformation()
    
    //返回的model
    public class DeviceSetting {
        /**
        BIT[7:4]: 0000 = 英语; 0001 = 中文;
        0010 = 日语; 0011 = 德语;
        0100 = 意大利语; 0101 = 韩语;
        BIT[3]: 0/1,分别代表不计算/计算静态卡路里;默认 0；
        BIT[2]: 0/1,分别代表摄氏度/F 默认 0；
        BIT[1]: 0/1 分别代表公制/英制,默认 0
        BIT[0]: 0/1 分别代表 24 小时/12 小时制，默认 0
        */
        private int unitSet;
        /**
        用 户 体 重 , 单 位 kg, 默 认 是 65kg, 范 围 设 定 是
        (30~255)kg;
        */
        private int weight;
        /*
        行走步幅是用户设定的走路时的步幅长度, 一般为身高的
1/3~1/2, 默认 55cm, 范围设定是(30~160)cm;
        */
        private int walkStride;
        /*
        行走步幅是用户设定的走路时的步幅长度, 一般为走路步
长的 1.5 倍左右;默认 90cm; 范围设定是(40~250)cm*/
        private int runStride;
        /*
        用户设定每天运动步数目标, 默认 8000;范围设定是
(0~60000); 0 代表不检测锻炼目标
        */
        private int stepsOnceday;
        /*
        设定每天运动卡路里(注意, 不包含静态消耗卡路里)消耗
目标;单位是大卡,默认是500大卡, 范围是(0~20000); 0代
表不检测卡路里目标
        */
        private int calorieOnceday;
        /*
        用户设定每天运动距离目标;单位是 0.1KM, 默认是
40(4.0)km, 范围是(0~250)
        */
        private int distanceOnceday;
        /*
        
        */
        private int stepsReachRing;
        private int caloriesReachRing;
        private int distanceReachRing;
        /*
        0/1,来电提醒是否关闭/打开；默认打开=1；
        */
        private int comingCallEnable;
        //来电提示设置的时间有效时间的开始小时(>=0)
        private int comingCallStartHour;
        //来电提示设置的有效时间的结束小时(<=23);
        private int comingCallEndHour;
        //高三位代表来电震动提醒类型，0 不震动， 1~7 对应 7 个
        //震动类型， 默认是 1， 低 5 位代表重复的次数， 默认是
        //0x001 00001 = 0x21
        private int comingCallRing;
        //0/1,消息提醒是否关闭/打开；默认打开=1；
        private int messageEnable;
        //消息提醒设置的时间有效时间的开始小时(>=0) 默认 9
        private int messageStartHour;
        //消息提醒设置的有效时间的结束小时(<=23); 默认 20
        private int messageEndHour;
        //同 ComingCallRing;
        private int messageRing;
        //自动后台检测心率是否打开， 默认打开 = 1；
        //=0， 关闭；
        //= 1， 打开；
        private int quietHeartEnable;
        //后台自动测试心率的开始时间，默认全天测试,=0
        private int quietHeartStartHour;
        //后台自动测试心率的结束时间，默认全天测试,=23
        private int quietHeartEndHour;
        //训练模式心率报警开关； 默认=1
        //=0， 关闭；
        //=1， 心率过高报警开；
        //=2， 心率过低报警和过高报警都打开；
        //其他无效
        private int heartAlarmEnable;
        //训练模式心率过高报警， 默认 160
        private int highHeartAlarm;
        //训练模式心率过低报警， 默认 95
        private int lowHeartAlarm;
        //同 ComingCallRing
        private int heartRing;
        //久坐提醒开关，  默认 =0；
        //=0， 久坐提醒关闭；
        //=1， 久坐提醒打开， 中午免打扰无效；
        //=2， 久坐提醒打开， 中午免打扰有效；
        //其他值无效
        private int sitLongAlarmEnable;
        //久坐提醒开始检测时间， 默认 8
        private int sitlongStartHour;
        //久坐提醒结束检测时间， 默认 18
        private int sitlongEndHour;
        //久坐提醒提醒方式：同 ComingCallRing;
        private int sitlongRing;
        //翻腕亮屏是否打开， 默认打开 =1 ；
        //0： 关闭；
        //1： 打开；
        private int rollEnable;
        //翻腕亮屏开启时间， 默认 
        private int rollStartHour;
        //翻腕亮屏结束时间， 默认 22 (7<=有效时间<=22)
        private int rollEndHour;
    
        //0 = 默认表盘， 1 是另外一个表盘；
        private int watchSelect;
        //电量
        private int batteryVolume;
    }
   
   ```
   
   
   - **获取运动的天数**
   ```
   public byte[] getDataDate()
   
   返回model
   
   public class EveryDayInfo {
    public long year;
    public int month;
    public int day;
   }
   
   ```
   
   
   - **获取某天的总数据**
   ```
   public byte[] getTotalData(TDay tday)
        
    // Today, 同步今天的总数据
    // T_1, T-1
    // T_2, ...
    // T_3,
    // T_4,
    // T_5,
    // T_6,
    // T_7
    
    返回model
    public class bh_totalinfo {
        private int year;
        private int month;
        private int day;
    
        private int calorie;//总卡路里
        //距离单位:米
        private int distance; //总距离
        //时间单位:分钟
        private int exerciseMinutes;//训练时长
        private int sleepMinutes; //总睡眠
    
        private int latestHeart;//最近一次的心率
        private int step;//总步数
    }
   
   ```
   
   - **获取某天计步数据**
 
   ```
   //day同getTotalData().0表示今天 1表示昨天...
   public byte[] getDetailWalk(int day)
   
   返回model
   public class ZgDetailWalkData {
        private int year;
        private int month;
        private int day;
    //    private int count;
        //1440个点 ,每分钟的步数
        private List<Integer> data;
    }
   ```
   
   - **获取某天心率数据**
   ```
   public byte[] readHeartData(int day)
   
   返回model
   public class ZGHeartData {

        public int year;
        public int month;
        public int day;
        public int highestHeart;
        public int lowHeart;
        public int averageHeart;
        public int[] staticHeart= new int[144];
    }
   
   ```
   
   - **获取训练数据**
   
```
public byte[] getDetailSport(int day)

//返回model
public class ZgDetailSportData {
    private int year;
    private int month;
    private int day;
    //当天运动的次数
    private int count;
    private List<Sport> sports;

    public static class Sport{
        //运动时长(分钟)
        private int totalMin;
        //距离当天0点的时间(分钟) 120->02:00
        private int startMin;
        //距离当天0点的时间
        private int endMin;
        private int steps;
        //单位 米
        private float distance;
        //单位 千卡
        private float calories;
        //最大步频
        private int spmMax;
        //平均步频
        private int spmAvg;
        private int heartMax;
        private int heartAvg;
        //运动类型
        private int sportType;
        private List<Integer> heart =new ArrayList<Integer>();

```

   
   
   
   

