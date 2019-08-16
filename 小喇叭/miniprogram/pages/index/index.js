import lottie from 'lottie-miniapp';

const canvasContext = wx.createCanvasContext('test-canvas');
// 请求lottie的路径。注意开启downloadFile域名并且返回格式是json
const animationPath = 'https://assets7.lottiefiles.com/packages/lf20_jpxsQh.json';

canvasContext.canvas = {
  width: 100,
  height: 100
};

const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
var openId = "";
var gradeChosen = 'Class of 2020';
var classChosen = 0;
var codeChosen = '';
var validationChosen = '';
var roomChosen = '';
var descChosen = '';

const conf = {
  data: {
    gradeIndex: 0,
    gradePicker: ['Class of 2020', 'Class of 2021', 'Class of 2022', 'Class of 2023', 'Class of 2024'],
    calendarConfig: {},
    isTeacher:false,
    time: '08:30',
    date: '2019-09-01',
    Today: null,
    Selected: null,
    ToDelete: null,
    hasSchedules:false,
    buildingChosen: "Xian Mian Building"
  },

  onLoad: function() {
    wx.cloud.init({
      env: 'cloud-o1n8p',
      traceuser: true
    })
    this.onGetopenId();

    // 如果同时指定 animationData 和 path， 优先取 animationData
    lottie.loadAnimation({
      renderer: 'canvas', // 只支持canvas
      loop: true,
      autoplay: true,
      path: animationPath,
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
          title: '出大问题',
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
          title: '您已登录！',
        });
        that.setData({
          userInfo: res.data.info,
          modalName: null,
        })
        that.isTeacher(res.data);
      },
      fail: function () {
        that.setData({
          modalName: "registerModal"
        });
      }
    });

  },

  TimeChange(e) {
    this.setData({
      time: e.detail.value
    })
  },
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

  //获取校验码
  getValidation: function (e) {
    validationChosen = e.detail.value;
  },

  getRoom: function (e) {
    roomChosen = e.detail.value;
  },

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

  dateChange: function (e) {
    this.setData({
      date: e.detail.value
    })
  },

  timeChange: function (e) {
    this.setData({
      time: e.detail.value
    })
  }, 

  //新建活动
  addActivity: function (res) {
    if (descChosen != '' && roomChosen != '') {
      var that = this;
      var location = this.data.buildingChosen + " " + roomChosen;
      wx.showLoading({
        title: '正在处理中',
      })
      db.collection('Visits').add({
        data: {
          execTime: that.data.time, // 触发时间。到达这个时间开始执行。
          Time: that.data.time,
          Date: that.data.date,
          location: location,
          description: descChosen,
          lazybugs:[]
        },
        success: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: '成功创建活动',
          })
          that.setData({
            modalName:null
          })
          wx.reLaunch({
            url: '../index/index',
          })
        }
        })
    }
    else {
      wx.showToast({
        title: '信息未完善',
        icon:"none"
      })
    }

  },

  buildingChange: function(e){
    var buildingTemp = "Xian Mian Building"
    if (this.data.buildingChosen == "Xian Mian Building"){
      buildingTemp = "New Building"
    }
    this.setData({
      buildingChosen: buildingTemp
    })
  },

  //用户注册
  register: function (res) {
    var studentCode = "hizuji";
    var teacherCode = "saigo";
    var isTeacher = false;

    if(validationChosen == teacherCode){
      isTeacher = true;
      validationChosen = studentCode;
    }

    if (classChosen != '' && codeChosen != '' && validationChosen == studentCode && classChosen > 0 && classChosen < 12 && codeChosen.substr(0, 1) == 'G') {
      var that = this;
      var userInfo = res.detail.userInfo;
      app.globalData.user = userInfo;
      db.collection('user').add({
        data: {
          _id: openId,
          info: userInfo,
          grade: gradeChosen,
          classroom: classChosen,
          code: codeChosen,
          isTeacher: isTeacher,
        }
      });
      app.globalData.user = res.data;
      wx.showToast({
        title: '您已注册！',
      });
      that.sync();
    }
    else {
      wx.showToast({
        title: '别想混过去',
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

  setTodo() {
    const data = [{

    }];
    // 异步请求
    setTimeout(() => {
      this.calendar.setTodoLabels({
        // showLabelAlways: true,
        days: data
      });
    }, 1000);
    this.calendar.enableArea(['2019-8-1', '2019-11-30']); //Make sure the calendar is always enabled for the next three months 
  },

  afterTapDay(e) { // Click On Day 
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

  whenChangeMonth(e) { // Change Month 
    console.log('whenChangeMonth', e.detail);
  },

  afterCalendarRender(e) {
    this.setTodo();
    console.log('afterCalendarRender', e);
  },

  showNewActivity: function() {
    this.setData({
modalName:"newActivityModal"
    })
  },

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

  remove: function(e) {
    //get button id : e.target.id
    var it = this
    var app = getApp()
    var dummy = ''
    if (app.globalData.logined == true) {
      wx.showModal({
        title: 'Warning',
        content: 'Are you sure you want to proceed?',
        success: function(res) {
          if (res.confirm) {
            const db = wx.cloud.database()
            db.collection("Visits").where({
              Date: it.data.Selected,
              Time: it.data.DisplayTime[e.target.id],
              Description: it.data.DisplayDes[e.target.id]
            }).get({
              success: function(res) {
                dummy = res.data[0]._id
                db.collection("Visits").doc(dummy).remove({
                  success: function() {
                    console.log("Deleted")
                  }
                })
              }
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: 'Error',
        content: 'Please Login First'
      })
    }
  }
};

Page(conf);