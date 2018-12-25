// client/pages/reviewList/index.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: [],
    playing: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getInitData(options.id);
  },

  getInitData(id) {
    wx.showLoading({
      title: '数据加载中'
    })

    qcloud.request({
      url: config.service.getCommentList,
      data: {
        movieId: id
      },
      success: res => {
        const { data = {} } = res;
        if (data.code === 0) {
          this.setData({
            list: data.data
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

  handleNavigateToReviewPreview(event) {
    const movieId = event.currentTarget.dataset.movieId
    const commentId = event.currentTarget.dataset.commentId
    const userId = event.currentTarget.dataset.userId
    wx.navigateTo({
      url: `/pages/reviewPreview/index?movieId=${movieId}&commentId=${commentId}&userId=${userId}`,
    })
  },
})