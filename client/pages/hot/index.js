// client/pages/hot/index.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hotlist: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getHotList()
  },

  getHotList() {
    wx.showLoading({
      title: '数据加载中...',
    })

    qcloud.request({
      url: config.service.hotList,
      success: res => {
        const { data = {} } = res;
        if (data.code === 0) {
          this.setData({
            hotlist: data.data
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '数据获取错误',
          })
        }
      },
      fail: () => {
        wx.showToast({
          icon: 'none',
          title: '数据获取错误',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  handleNavigateToDetail(event) {
    const data = event.currentTarget.dataset.source;
    wx.setStorage({
      key: 'movieDetail',
      data,
      success: () => {
        wx.navigateTo({
          url: `/pages/detail/index?id=${data.id}`
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
 
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})