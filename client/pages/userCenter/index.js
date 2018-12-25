var qcloud = require('../../vendor/wafer2-client-sdk/index')
var config = require('../../config')
const app = getApp()
const innerAudioContext = wx.createInnerAudioContext()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isCurrent: '0',
    userInfo: app.globalData.userInfo,
    collectList: [],
    publishList: [],
    isCollected: true,
    isPublished: false,
    playing: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  getInitData(id) {
    wx.showLoading({
      title: '数据加载中'
    })
    qcloud.request({
      url: config.service.getUserPreviewList,
      data: {
        userId: id
      },
      login: true,
      success: res => {
        const result = res.data
        wx.hideLoading()
        if (result.code === 0) {
          this.setData({
            collectList: result.data
          })
        } else {
          wx.showToast({
            icon: 'none',
            title: '获取数据失败'
          })
        }
      },
      fail: error => {
        wx.hideLoading()
        wx.showToast({
          icon: 'none',
          title: '获取数据失败'
        })
      },
      complete: () => {
        wx.hideLoading()
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
  onShow() {
    const _this = this
    app.checkSession({
      success: ({ userInfo }) => {
        console.log('success', userInfo)
        this.setData({
          userInfo
        }, () => {
          _this.getInitData(userInfo.openId)
        })
      },
      error: () => {
        wx.navigateTo({
          url: '/pages/login/index'
        })
      }
    })
  },

  onPlay: function(event) {
    const { collectList, publishList } = this.data
    const type = event.currentTarget.dataset.type
    if (type === 'publish') {
      this.handlePlay(event, publishList)
    } else if (type === 'collect') {
      this.handlePlay(event, collectList)
    }
  },

  handlePlay(event, array) {
    const index = event.currentTarget.dataset.index
    const src = event.currentTarget.dataset.url
    const type = event.currentTarget.dataset.type
    let playing = array[index].playing
    if (!playing) {
      // 如果列表中之前有播放状态，则需要置为false,只让当前点击的playing状态为true
      array.forEach(item => {
        if (item.playing) {
          item.playing = false
        }
      })
      array[index].playing = true
      const key = type === 'publish' ? 'publishList' : 'collectList'
      this.setData({
        [key]: array
      })
      innerAudioContext.stop()
      innerAudioContext.src = src
      innerAudioContext.play()
    } else {
      array[index].playing = false
      this.setData({
        [key]: array
      })
      innerAudioContext.stop()
    }
  },

  // 切换收藏和发布状态
  handleChange(event) {
    const isCurrent = event.currentTarget.dataset.type
    const { publishList, collectList } = this.data
    // 切换页面时清空播放状态
    publishList.forEach(item => {
      if (item.playing) {
        item.playing = false
      }
    })
    collectList.forEach(item => {
      if (item.playing) {
        item.playing = false
      }
    })
    innerAudioContext.stop()
    this.setData({
      isCurrent,
      isCollected: isCurrent === '0',
      isPublished: isCurrent === '1',
      collectList,
      publishList
    }, () => {
      if (publishList.length > 0) return
      this.getPublishData()
    })
  },

  getPublishData() {
    const { userInfo } = this.data
    wx.showLoading({
      title: '数据加载中'
    })
    qcloud.request({
      url: config.service.getPublistList,
      data: {
        userId: userInfo.openId
      },
      login: true,
      success: res => {
        wx.hideLoading()
        const result = res.data;
        if (result.code === 0) {
          this.setData({
            publishList: result.data
          })
        } else {
          wx.showToast({
            title: '获取数据失败'
          })
        }
      },
      fail: (err) => {
        console.log(err)
        wx.hideLoading()
        wx.showToast({
          title: '获取数据失败'
        })
      }
    })
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