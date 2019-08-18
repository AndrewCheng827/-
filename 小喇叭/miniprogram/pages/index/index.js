import lottie from 'lottie-miniapp';

const canvasContext = wx.createCanvasContext('test-canvas');
// 请求lottie的路径。注意开启downloadFile域名并且返回格式是json
const animationData = require('../../utils/rainbowCat.js');
const app = getApp();
const db = wx.cloud.database();
const _ = db.command;

//设置lottie动画canvas
canvasContext.canvas = {
  width: 100,
  height: 100
};

//表单参数，Todo：优化为Form形式
var openId = "";
var gradeChosen = 'Class of 2020';
var classChosen = 0;
var codeChosen = '';
var validationChosen = '';
var roomChosen = '';
var descChosen = '';
var nameChosen = '';
var chosenText = '';

var count = 0;

const conf = {
  data: {
    calendarConfig: {
      inverse: true, // 单选模式下是否支持取消选中,
      disablePastDay: false, // 是否禁选过去的日期
      firstDayOfWeek: 'Mon', // 每周第一天为周一还是周日，默认按周日开始
      onlyShowCurrentMonth: true, // 日历面板是否只显示本月日期
      showHandlerOnWeekMode: true, // 周视图模式是否显示日历头部操作栏，hideHeadOnWeekMode 优先级高于此配置
      /**
       * 初始化日历时指定默认选中日期，如：'2018-3-6' 或 '2018-03-06'
       * 注意：若想初始化时不默认选中当天，则将该值配置为除 undefined 以外的其他非值即可，如：空字符串, 0 ,false等。
      */
      noDefault: true, // 初始化后是否自动选中当天日期，优先级高于defaultDay配置，两者请勿一起配置
    },
    gradeIndex: 0,
    gradePicker: ['Class of 2020', 'Class of 2021', 'Class of 2022', 'Class of 2023', 'Class of 2024'],
    isTeacher:false,
    time: '08:30',
    date: '2019-09-01',
    hasSchedules:false,
    buildingChosen: "Xian Mian Building"
  },

  //首次加载页面
  onLoad: function() {
    wx.cloud.init({
      env: 'cloud-o1n8p',
      traceuser: true
    })
    this.onGetopenId();
    this.onGetCalendarShedules();

    //运行动画，如果同时指定 animationData 和 path， 优先取 animationData
    lottie.loadAnimation({
      renderer: 'canvas', // 只支持canvas
      loop: true,
      autoplay: true,
      animationData: animationData,
      rendererSettings: {
        context: canvasContext,
        clearCanvas: true
      }
    });

  },

  //隐藏弹窗
  hideModal(value) {
    this.setData({
      modalName: null,
      isBlur: false,
    });
  },

  //获取Calendar信息，渲染本地Todos
  onGetCalendarShedules: function(){
    var that = this;
    wx.cloud.callFunction({
      name: 'getDB',
      data: {
        dbName: "Visits"
      }
    })
      .then(res => {
        that.parseInfo(res.result.data);
      })
      .catch(console.error);
  },

  //解析Calendar信息，
  parseInfo: function(calendarSchedules){
    var that = this;
    var processingDate = new Date();
    var processingDay = {};
    var processedDays = [];
    console.log(calendarSchedules)
    for(var i = 0; i < calendarSchedules.length; i++){
      processingDate =  new Date(Date.parse(calendarSchedules[i].Date));
      processingDay = {
        year: processingDate.getFullYear(),
        month: processingDate.getMonth()+1,
        day: processingDate.getDate(),
        todoText: calendarSchedules[i].description
      };
      processedDays.push(processingDay);
    }
    console.log(processedDays)
    that.calendar.setTodoLabels({
      // 待办点标记设置
      pos: 'bottom', // 待办点标记位置 ['top', 'bottom']
      dotColor: '#80', // 待办点标记颜色
      circle: false, // 待办圆圈标记设置（如圆圈标记已签到日期），该设置与点标记设置互斥
      showLabelAlways: true, // 点击时是否显示代办标记（圆点/文字），在 circle 为 true 时无效
      days: processedDays,
    });
  },

  //获取用户openId
  onGetopenId: function () {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        openId = res.result.openId;
        app.globalData.openId = res.result.openId;
        this.sync();
      },
      fail: err => {
        wx.showToast({
          title: 'Login Error',
        });
      }
    });
  },

  showModal: function (options) {
    this.setData({
      modalName: options.currentTarget.dataset.modalname
    })
  },

  //彩蛋函数
  easterEgg: function(){
    count += 1;
    if(count == 3){
      wx.showModal({
        title: '提示',
        content: '没有彩蛋哦',
      })
    }
    else if(count == 6){
      wx.showModal({
        title: '噗呲，不是都说没有了吗',
        content: '好吧好吧给你讲个笑话：从前有座山，山上有座庙。庙里有个小和尚，后面的我忘了',
      })
      count = 0;
    }
  },

  //从数据库下载用户信息
  sync: function () {
    var that = this;
    db.collection('user').doc(openId).get({ //建立或者更新数据库信息
      success: function (res) {
        app.globalData.user = res.data;
        // res.data 包含该记录的数据
        wx.showToast({
          title: 'Logged In!',
        });
        that.setData({
          userInfo: res.data.info,
          modalName: null,
        })
        that.checkEmergency(res.data);
        that.isTeacher(res.data);
      },
      fail: function () {
        that.setData({
          modalName: "registerModal"
        });
      }
    });

  },

  //新建活动
  addActivity: function (res) {
    if (descChosen != '' && roomChosen != '') {
      var that = this;
      var location = this.data.buildingChosen + " " + roomChosen;
      wx.showLoading({
        title: 'Processing',
      })
      db.collection('Visits').add({
        data: {
          execTime: that.data.time, // 触发时间。到达这个时间开始执行。
          Time: that.data.time,
          Date: that.data.date,
          location: location,
          description: descChosen,
          lazybugs: []
        },
        success: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: 'Activity Created',
          })
          that.setData({
            modalName: null
          })
          wx.reLaunch({
            url: '../index/index',
          })
        }
      })
    }
    else {
      wx.showToast({
        title: 'Lack of Info',
        icon: "none"
      })
    }

  },

  addAlarm: function () {
    var that = this;
    db.collection('emergencyMessages').add({
      data: {
        content: chosenText
      },
      success: function (res) {
        wx.cloud.callFunction({
          name: 'getDB',
          data: {
            dbName: "user"
          }
        })
          .then(res => {
            for (var i = 0; i < res.result.data.length; i++) {
              wx.cloud.callFunction({
                name: 'updateDB',
                data: {
                  dbName: "user",
                  id: res.result.data[i]._id,
                  isAlarmed: false
                }
              })
            }
          }).then(res => {
            wx.hideLoading();
            wx.showToast({
              title: '全局通知已推送',
            })
            that.setData({
              modalName: null
            })
          })
      }
    })
  },

//以下为活动表单函数

  //改变时间
  TimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },

  //改变日期
  DateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  //获取班级
  getClass: function (e) {
    classChosen = e.detail.value;
  },

  //获取学号
  getCode: function (e) {
    codeChosen = e.detail.value;
  },

  //获取学号
  getName: function (e) {
    nameChosen = e.detail.value;
  },

  //获取校验码
  getValidation: function (e) {
    validationChosen = e.detail.value;
  },

  //获取教室
  getRoom: function (e) {
    roomChosen = e.detail.value;
  },

  //获取活动信息
  getDesc: function (e) {
    descChosen = e.detail.value;
  },

  //获取年级
  PickerChange(e) {
    this.setData({
      gradeIndex: e.detail.value
    })
    gradeChosen = this.data.gradePicker[e.detail.value];
  },

  //监听教学楼变化，获取教学楼信息
  buildingChange: function (e) {
    var buildingTemp = "Xian Mian Building"
    if (this.data.buildingChosen == "Xian Mian Building") {
      buildingTemp = "New Building"
    }
    this.setData({
      buildingChosen: buildingTemp
    })
  },

//以上为活动表单函数

  //用户注册
  register: function (res) {
    var studentCode = "hizuji";
    var teacherCode = "saigo";
    var parentCode = "nvwa"
    var isTeacher = false;
    var isParent = false;
    var isStudent = true;

    if(validationChosen == teacherCode){
      isTeacher = true;
      isStudent = false;
      validationChosen = studentCode;
    }
    else if (validationChosen == parentCode){
      isParent = true;
      isStudent = false;
      validationChosen = parentCode;
    }

    if (classChosen != '' && codeChosen != '' && nameChosen != '' && validationChosen == studentCode && classChosen > 0 && classChosen < 12 && codeChosen.substr(0, 1) == 'G') {
      var that = this;
      var userInfo = res.detail.userInfo;
      app.globalData.user = userInfo;
      db.collection('user').add({
        data: {
          _id: openId,
          info: userInfo,
          name:nameChosen,
          grade: gradeChosen,
          classroom: classChosen,
          code: codeChosen,
          isTeacher: isTeacher,
          isStudent:isStudent,
          isParent:isParent,
          isAlarmed: false
        }
      });
      app.globalData.user = res.data;
      wx.showToast({
        title: 'Registered!',
      });
      wx.reLaunch({
        url: '../index/index',
      })
    }
    else {
      wx.showToast({
        title: 'Info Incorrect',
      })
    }

  },

  //判断是否是Teacher=>是否显示Teacher按钮
  isTeacher: function (user) {
    var that = this;
    if (user.isTeacher == true) {
      that.setData({
        isTeacher: true
      });
    }
  },

  //获取推送内容
  getText: function (e) {
    chosenText = e.detail.value;
  },

  //检查全局推送状态
  checkEmergency: function (user) {
    var that = this;
    console.log(user)
    wx.hideLoading()
    if (user.isAlarmed == false) {
      wx.cloud.callFunction({
        name: 'getDB',
        data: {
          dbName: "emergencyMessages"
        }
      })
        .then(res => {
          console.log(res.result.data)
          wx.showModal({
            title: 'NOTIFICATION',
            content: res.result.data[res.result.data.length - 1].content,
          })
          wx.cloud.callFunction({
            name: 'updateDB',
            data: {
              dbName: "user",
              id: openId,
              isAlarmed: true
            }
          })
        })
    }

  },

  //点击日期
  afterTapDay(e) { 
    this.setData({
      hasSchedules:false
    })
    var that = this
    var dummy = e.detail.month;
    var day = e.detail.day;
    if (e.detail.month < 10) {
      var dummy = String("0" + e.detail.month)
    }
    if (e.detail.day < 10) {
      var day = String("0" + e.detail.day)
    }
    this.setData({
      Selected: String(e.detail.year + "-" + dummy + "-" + day)
    })
    console.log(String(e.detail.year + "-" + dummy + "-" + day))
    const db = wx.cloud.database()
    db.collection('Visits').where({
        Date: this.data.Selected
      })
      .get({
        success: function(res) {
          console.log(res)
          var schedules = [];
          for (var i = 0; i < res.data.length; i++) {
              schedules.push(res.data[i])
          }
          that.setData({
            hasSchedules:true,
            schedules:schedules
          })
        },
        fail: function(res) {
          console.log("Error !")
        }
      })
  },

  //点击月份
  whenChangeMonth(e) {  
    console.log('whenChangeMonth', e.detail);
    this.setData({
      schedules:null
    })
  },

  //显示新建活动弹窗
  showNewActivity: function() {
    this.setData({
modalName:"newActivityModal"
    })
  },

  //设置提醒
  setAlarm: function(event) {
    console.log(event);
    var formId = event.detail.formId;
    wx.cloud.callFunction({
      name: 'updateDB',
      data: {
        dbName: "Visits",
        id: event.currentTarget.id,
        openId: openId,
        formId: formId 
      }
    }).then(res => {
      wx.showToast({
        title: 'Success!',
      })
    }).catch(console.error);
    console.log(event)
  },

  //播放猫咪叫声
  miao: function () {
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    backgroundAudioManager.title = 'MIAO!!!'
    backgroundAudioManager.src = 'http://downsc.chinaz.net/Files/DownLoad/sound1/201807/10310.mp3'
  }
};


Page(conf);