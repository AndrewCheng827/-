const conf = {
  data: {
    calendarConfig: {},
    Today:null, 
    Selected:null,
    DisplayTime:null, // Time to be displayed 
    DisplayDes:null, // Description to be displayed 
    ToDelete:null
  },
  
  onLoad: function ()
  {
    wx.cloud.init({ 
      env:'cloud-o1n8p',
      traceuser:true
    }) 
  },

  setTodo() {
    const data = [
      {

      }
    ];
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
    if (e.detail.month < 10)
    {
      var dummy = String("0" + e.detail.month)
    }
    this.setData({
      Selected:String(e.detail.year + "-" + dummy + "-" + e.detail.day)
    })
    const db = wx.cloud.database()
    db.collection('Visits').where({
      Date:this.data.Selected
    })
      .get({
        success: function (res) {
          var TimeDummy = [] 
          var DesDummy = []
          var AmountDummy = []
          for(var i = 0; i < res.data.length; i++)
          {
            TimeDummy.push(res.data[i].Time)
            DesDummy.push(res.data[i].Description)
          }
          that.setData({
            DisplayTime:TimeDummy, 
            DisplayDes:DesDummy
          })
        },
        fail: function (res) {
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

  login: function ()
  {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  }, 
  
  add: function ()
  {
    var app = getApp() 
    if (app.globalData.logined == true)
    {
      wx.navigateTo({
        url: '/pages/add/add',
      })
    }
    else 
    {
      wx.showModal({
        title:'Error', 
        content:'Please Login First'
      })
    }
  }, 

  warn: function()
  {
    
  }, 

  remove: function(e)
  {
    //get button id : e.target.id
    var it = this
    var app = getApp()
    var dummy = ''
    if (app.globalData.logined == true) {
      wx.showModal({
        title:'Warning', 
        content:'Are you sure you want to proceed?',
        success: function (res)
        {
          if (res.confirm)
          {
            const db = wx.cloud.database() 
            db.collection("Visits").where({
              Date:it.data.Selected,
              Time:it.data.DisplayTime[e.target.id],
              Description:it.data.DisplayDes[e.target.id]
            }).get({
              success: function (res)
              {
                dummy = res.data[0]._id
                db.collection("Visits").doc(dummy).remove({
                  success: function()
                  {
                    console.log("Deleted")
                  }
                })
              }
            })
          } 
        }
      })
    }
    else {
      wx.showModal({
        title: 'Error',
        content: 'Please Login First'
      })
    }
  }
};

Page(conf); 