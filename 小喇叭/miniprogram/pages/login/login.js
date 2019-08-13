// pages/login/login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    Code:null
  },

  Done: function (e) //This function is actually called when the txtbox loses focus 
  {
    this.setData
    ({
      Code: e.detail.value
    })
  }, 

  ConfirmCode: function ()
  {
    const db = wx.cloud.database() 
    db.collection('promo').where({
      code:this.data.Code
    })
      .get({
        success: function (res) {
          if (res.data.length != 0)
          {
            wx.navigateBack({})
            wx.showToast({ 
              title:'Success', 
              icon:'success', 
              duration:2000
            })
            var app = getApp() 
            app.globalData.logined = true
          }
          else 
          {
            wx.navigateBack({})
            wx.showToast({ 
              title:'Try Again', 
              icon: 'none', 
              duration:2000
            })
          }
        }, 
        fail: function (res)
        {
          console.log("error")
        }
      })
  }
})