// pages/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date:null, 
    time:null,
    description: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  dateChange: function (e)
  {
    var that = this; 
    that.setData({ date:e.detail.value}); 
  }, 

  timeChange: function(e)
  {
    var that = this; 
    that.setData({ time:e.detail.value}); 
  }, 

  Done: function (e)
  {
    var that = this; 
    that.setData({ description:e.detail.value});
  }, 

  ConfirmAdd: function()
  {
    const db = wx.cloud.database()
    db.collection('Visits').add({
      data: {
        Date:this.data.date,
        Time:this.data.time, 
        Description:this.data.description,
      },
      success: function (res) {
        wx.navigateBack({ })
        wx.showToast
        ({
          title:'Success', 
          icon:'Success', 
          duration: 2000
        })
      }, 
      fail: function(res)
      {
        wx.navigateBack({ })
        console.log("Failed !")
      }
    })
  }
})