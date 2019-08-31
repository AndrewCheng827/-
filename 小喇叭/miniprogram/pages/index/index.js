import lottie from 'lottie-miniapp';//引入lottie动画库

const canvasContext = wx.createCanvasContext('test-canvas'); //初始化动画canvas

const animationData = require('../../utils/rainbowCat.js');// 请求lottie的路径。注意开启downloadFile域名并且返回格式是json

const app = getApp(); //初始化app函数
const db = wx.cloud.database(); //初始化微信云开发数据库函数

//设置lottie动画canvas
canvasContext.canvas = {
  width: 100,
  height: 100
};

var openId = ""; //用户openid
var userInfo = {}; //微信用户信息
var currentActivityId = '';//当前选中活动id

//用户注册表单代码
var studentCode = "hizuji";
var teacherCode = "saigo";
var parentCode = "nvwa"
var validationCode = studentCode;

var isTeacher = false; //教师鉴权参数
var isParent = false; //家长鉴权函数
var count = 0; //彩蛋计数参数

const conf = {
  data: {
    isValidated: false, //表单注册判断参数
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
    imageUrl: "https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1567219211969&di=7928756ed527b0b59433067d29de1970&imgtype=0&src=http%3A%2F%2F5b0988e595225.cdn.sohucs.com%2Fimages%2F20170922%2Fe0eb59d394264cbdaaf1a7f6a588ad28.jpeg",//image Placeholder
    gradeIndex: 0,
    gradePicker: ['Class of 2020', 'Class of 2021', 'Class of 2022', 'Class of 2023', 'Class of 2024'],
    identityIndex: 0,
    identityPicker: ['Student', 'Teacher', 'Parent'],
    identity: 'student',
    isTeacher: false,
    time: '08:30',
    date: '2019-09-01',
    execTime: '08:30',
    hasSchedules: false,
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

  //获取Calendar信息，渲染本地Todos
  onGetCalendarShedules: function() {
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
  parseInfo: function(calendarSchedules) {
    var that = this;
    var processingDate = new Date();
    var processingDay = {};
    var processedDays = [];
    console.log(calendarSchedules)
    for (var i = 0; i < calendarSchedules.length; i++) {
      processingDate = new Date(Date.parse(calendarSchedules[i].execTime));
      console.log(processingDate);
      processingDay = {
        year: processingDate.getFullYear(),
        month: processingDate.getMonth() + 1,
        day: processingDate.getDate(),
        todoText: calendarSchedules[i].description
      };
      processedDays.push(processingDay);
    }
    console.log(processedDays)
    that.calendar.setTodoLabels({
      // 待办点标记设置
      pos: 'bottom', // 待办点标记位置 ['top', 'bottom']
      dotColor: '#80', // ta[待办点标记颜色
      showLabelAlways: true,
      days: processedDays,
    });
  },

  //获取用户openId
  onGetopenId: function() {
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

  //判断是否是Teacher=>是否显示Teacher按钮
  isTeacher: function (user) {
    var that = this;
    if (user.isTeacher == true) {
      that.setData({
        isTeacher: true
      });
    }
  },

  //新建活动
  addActivity: function(res) {
    console.log("res: ", res)
    var that = this;
    var datePure = res.detail.value.date;
    var dateParsed = this.parseTime(res.detail.value.execTime, res.detail.value.date);
    console.log("dateParsed: " + dateParsed);
    if (res.detail.value.desc != '' && res.detail.value.classRoom != '') {
      var location = this.data.buildingChosen + " " + res.detail.value.classRoom;

      wx.showLoading({
        title: 'Processing',
      })
      db.collection('Visits').add({
        data: {
          execTime: dateParsed, // 触发时间。到达这个时间开始执行。
          Time: res.detail.value.time,
          Date: datePure,
          location: location,
          description: res.detail.value.desc,
          lazybugs: []
        },
        success: function(res) {
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
    } else {
      wx.showToast({
        title: 'Lack of Info',
        icon: "none"
      })
    }

  },

  //更新活动
  updateActivity: function (res) {
    console.log("res: ", res)
    var that = this;
    var datePure = res.detail.value.date;
    var dateParsed = this.parseTime(res.detail.value.execTime, res.detail.value.date);
    console.log("dateParsed: " + dateParsed);
    if (res.detail.value.desc != '' && res.detail.value.classRoom != '') {
      var location = this.data.buildingChosen + " " + res.detail.value.classRoom;
      console.log(res.detail.value.time,datePure,dateParsed)
      wx.showLoading({
        title: 'Processing',
      })
      wx.cloud.callFunction({
        name: 'updateActivity',
        data: {
          id: currentActivityId,
          execTime: dateParsed.valueOf(), // 触发时间。到达这个时间开始执行。
          Time: res.detail.value.time,
          Date: datePure,
          location: location,
          description: res.detail.value.desc,
          
        }
      }).then(res => {
        wx.hideLoading();
        wx.showToast({
          title: 'Activity Updated!',
          icon: "none"
        })
        wx.reLaunch({
          url: '../index/index',
        })
      })
    } else {
      wx.showToast({
        title: 'Lack of Info',
        icon: "none"
      })
    }
  },

  //删除活动
  deleteActivity: function (e) {
    wx.showModal({
      title: 'Warning',
      content: 'Are you sure that you want to deletre this activity?',
      cancelText: 'Cancel',
      confirmText: 'Confirm',
      success: res => {
        wx.showLoading({
          title: 'Deleting...',
        })
        wx.cloud.callFunction({
          name: 'removeDB',
          data: {
            dbName: "Visits",
            id: e.currentTarget.id
          }
        }).then(res => {
          wx.hideLoading();
          wx.showToast({
            title: 'Activity Deleted!',
            icon: "none"
          })
          wx.reLaunch({
            url: '../index/index',
          })
        })
      }
    })
  },

  //转换日期数据格式
  parseTime: function (execTime, date) {
    date = new Date(Date.parse(date));
    var hour = execTime.substr(0, 2);
    var minute = execTime.substr(3);
    date.setHours(hour);
    date.setMinutes(minute);
    return date;
  },

  //添加全局推送信息
  addAlarm: function(e) {
    var that = this;
    db.collection('emergencyMessages').add({
      data: {
        content: e.detail.value.emergencyText
      },
      success: function(res) {
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
              title: 'Pushed!',
            })
            that.setData({
              modalName: null
            })
          })
      }
    })
  },

  //改变提醒时间
  timeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },

  //改变提醒时间
  execTimeChange(e) {
    this.setData({
      execTime: e.detail.value
    })
  },

  //改变日期
  dateChange(e) {
    this.setData({
      date: e.detail.value
    })
  },

  //改变身份
  identityPickerChange(e) {
    var identityChosen = this.data.identityPicker[e.detail.value];
    if (identityChosen == 'Student') {
      validationCode = studentCode;
      this.setData({
        identityIndex: e.detail.value,
        identity: 'student'
      })
      isTeacher = false;
      isParent = false;
    }
    else if (identityChosen == 'Teacher') {
      validationCode = teacherCode;
      this.setData({
        identityIndex: e.detail.value,
        identity: 'teacher'
      })
      isTeacher = true;
      isParent =false;
    } 
    else if (identityChosen == 'Parent') {
      validationCode = parentCode;
      this.setData({
        identityIndex: e.detail.value,
        identity: 'parent',
      })
      isTeacher = false;
      isParent = true;
    }

  },

  //改变年级
  PickerChange(e) {
    this.setData({
      gradeIndex: e.detail.value
    })
  },

  //监听教学楼变化，获取教学楼信息
  buildingChange: function(e) {
    var buildingTemp = "Xian Mian Building"
    if (this.data.buildingChosen == "Xian Mian Building") {
      buildingTemp = "New Building"
    }
    this.setData({
      buildingChosen: buildingTemp
    })
  },

  //获取微信用户信息
  getUserInfo: function(res) {
    wx.showLoading({
      title: 'Validating......',
    })
    userInfo = res.detail.userInfo;
    this.setData({
      isValidated: true
    })
    wx.hideLoading();
    
  },

  //用户注册
  register: function(res) {
    console.log(res);
    if ((this.data.identity == 'teacher' || this.data.identity == 'parent') && res.detail.value.validation == validationCode) {
      db.collection('user').add({
        data: {
          _id: openId,
          info: userInfo,
          name: res.detail.value.name,
          grade: res.detail.value.grade,
          code: res.detail.value.code,
          isTeacher: isTeacher,
          isParent: isParent,
          isAlarmed: false
        }
      });
      wx.showToast({
        title: 'Registered!',
      });
      wx.reLaunch({
        url: '../index/index',
      })
    } 
    
    else if (res.detail.value.classRoom != '' && res.detail.value.code != '' && res.detail.value.name != '' && res.detail.value.validation == validationCode && res.detail.value.classRoom > 0 && res.detail.value.classRoom < 12 && res.detail.value.code.substr(0, 1) == 'G') {
      var that = this;
      db.collection('user').add({
        data: {
          _id: openId,
          info: userInfo,
          name: res.detail.value.name,
          grade: res.detail.value.grade,
          classroom: res.detail.value.classRoom,
          code: res.detail.value.code,
          isTeacher: isTeacher,
          isStudent: true,
          isParent: isParent,
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
    } else {
      wx.showToast({
        title: 'Info Incorrect',
      })
    }

  },

  //点击日期
  afterTapDay(e) {
    this.setData({
      hasSchedules: false
    })
    var that = this
    var dummy = e.detail.month;
    var day = e.detail.day;
    console.log(dummy)
    console.log(day)
    if (e.detail.month < 10) {
      dummy = String("0" + e.detail.month)
    }
    if (e.detail.day < 10) {
      day = String("0" + e.detail.day)
    }
    var date = e.detail.year + "-" + dummy + "-" + day;
    console.log(date)
    const db = wx.cloud.database()
    db.collection('Visits').where({
        Date: date
      })
      .get({
        success: function(res) {
          console.log(res)
          var schedules = [];
          for (var i = 0; i < res.data.length; i++) {
            schedules.push(res.data[i])
          }
          that.setData({
            hasSchedules: true,
            schedules: schedules
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
      schedules: null
    })
  },

  //设置提醒
  setAlarm: function(event) {
    console.log(event);
    console.log(event.currentTarget.id)
    var formId = event.detail.formId;
    wx.cloud.callFunction({
      name: 'updateLazybug',
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

  //显示弹窗
  showModal: function (options) {
    currentActivityId = options.currentTarget.id
    console.log(currentActivityId);
    this.setData({
      modalName: options.currentTarget.dataset.modalname
    })
  },

  //隐藏弹窗
  hideModal(value) {
    this.setData({
      modalName: null,
      isBlur: false,
    });
  },

  //播放猫咪叫声
  miao: function () {
    const backgroundAudioManager = wx.getBackgroundAudioManager();
    backgroundAudioManager.title = 'MIAO!!!'
    backgroundAudioManager.src = 'http://downsc.chinaz.net/Files/DownLoad/sound1/201807/10310.mp3'
  },

  //彩蛋函数
  easterEgg: function () {
    count += 1;
    if (count == 3) {
      wx.showModal({
        title: '提示',
        content: '没有彩蛋哦',
      })
    } else if (count == 6) {
      wx.showModal({
        title: '噗呲，不是都说没有了吗',
        content: '好吧好吧给你讲个笑话：从前有座山，山上有座庙。庙里有个小和尚，后面的我忘了',
      })
      count = 0;
    }
  },
};

Page(conf);