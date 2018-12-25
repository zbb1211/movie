// client/pages/reviewPreview/index.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config.js')
const app = getApp()
const innerAudioContext = wx.createInnerAudioContext()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {},
    userInfo: app.globalData.userInfo,
    playing: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData(options)
  },

  getInitData(options) {
    const { userId, movieId } = options
    wx.showLoading({
      title: '数据加载中'
    })
    qcloud.request({
      url: config.service.getUserPreview,
      data: {
        userId,
        movieId
      },
      login: true,
      success: res => {
        wx.hideLoading()
        const result = res.data
        if (result.code === 0) {
          this.setData({
            data: result.data
          })
        } else {
          wx.hideLoading()
        }
      },
      fail: err => {
        wx.hideLoading()
        wx.navigateBack({})
      }
    })
  },

  // 返回影评列表
  handleNavigateToReviewList() {
    const { data } = this.data;
    wx.navigateTo({
      url: `/pages/reviewList/index?id=${data.movie_id}`
    })
  },

  onPlay: function (event) {
    const src = event.currentTarget.dataset.url
    if (!this.data.playing) {
      this.setData({
        playing: true,
      })
      innerAudioContext.src = src
      innerAudioContext.play()
    } else {
      this.setData({
        playing: false,
      })
      innerAudioContext.stop()
    }
  },
  onShow: function () {
    app.checkSession({
      success: ({ userInfo }) => {
        this.setData({
          userInfo
        })
      },
      error: () => {
        wx.navigateTo({
          url: '/pages/login/index'
        })
      }
    })
  },
})