// client/pages/home/index.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData()
  },

  getInitData() {
    wx.showLoading({
      title: '数据加载中'
    })

    qcloud.request({
      url: config.service.home,
      success: res => {
        const { data = {} } = res;
        if (data.code === 0) {
          this.setData({
            data: data.data
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

  handleNavigateDetail() {
    const data = this.data.data;
    wx.setStorage({
      key: 'movieDetail',
      data,
      success: () => {
        wx.navigateTo({
          url: `/pages/detail/index?id=${data.movie_id}`
        })
      }
    })
  },

  // 跳转到影评详情页
  handleNavigatePrerview() {
    const { user_id, movie_id, id } = this.data.data
    wx.navigateTo({
      url: `/pages/reviewPreview/index?movieId=${movie_id}&commentId=${id}&userId=${user_id}`,
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