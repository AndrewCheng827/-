const app = getApp();
const db = wx.cloud.database();
const _ = db.command;
var openid = "";
var gradeChosen = 'Class of 2020';
var classChosen = 0;
var codeChosen = '';
var validationChosen = '';

const conf = {
  data: {
    gradeIndex: 0,
    gradePicker: ['Class of 2020', 'Class of 2021', 'Class of 2022', 'Class of 2023', 'Class of 2024'],
    calendarConfig: {},
    isTeacher:false,
    Today: null,
    Selected: null,
    DisplayTime: null, // Time to be displayed 
    DisplayDes: null, // Description to be displayed 
    ToDelete: null
  },

  onLoad: function() {
    wx.cloud.init({
      env: 'cloud-o1n8p',
      traceuser: true
    })
    this.onGetOpenid();
  },

  //隐藏弹窗
  hideModal(value) {
    this.setData({
      modalName: null,
      isBlur: false,
    });
  },

  //获取用户openid
  onGetOpenid: function () {
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        openid = res.result.openid;
        app.globalData.openid = res.result.openid;
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
    db.collection('user').doc(openid).get({ //建立或者更新数据库信息
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

  //获取年级
  PickerChange(e) {
    this.setData({
      gradeIndex: e.detail.value
    })
    gradeChosen = this.data.gradePicker[e.detail.value];
  },

  //用户注册
  register: function (res) {
    var secretCode = '11-1=2';
    if (classChosen != '' && codeChosen != '' && validationChosen == secretCode && classChosen > 0 && classChosen < 11 && codeChosen.substr(0, 1) == 'G') {
      var that = this;
      var userInfo = res.detail.userInfo;
      app.globalData.user = userInfo;
      db.collection('user').add({
        data: {
          _id: openid,
          info: userInfo,
          grade: gradeChosen,
          classroom: classChosen,
          code: codeChosen,
          isTeacher: false,
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
    var that = this
    if (e.detail.month < 10) {
      var dummy = String("0" + e.detail.month)
    }
    this.setData({
      Selected: String(e.detail.year + "-" + dummy + "-" + e.detail.day)
    })
    const db = wx.cloud.database()
    db.collection('Visits').where({
        Date: this.data.Selected
      })
      .get({
        success: function(res) {
          var TimeDummy = []
          var DesDummy = []
          var AmountDummy = []
          for (var i = 0; i < res.data.length; i++) {
            TimeDummy.push(res.data[i].Time)
            DesDummy.push(res.data[i].Description)
          }
          that.setData({
            DisplayTime: TimeDummy,
            DisplayDes: DesDummy
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

  navigate: function() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  add: function() {
      wx.navigateTo({
        url: '/pages/add/add',
      })
  },

  setAlarm: function() {

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