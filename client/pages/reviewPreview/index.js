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
    hideModal: true, //模态框的状态  true-隐藏  false-显示
    animationData: {},//
    collectSrc: './collect.png',
    uncollectSrc: './uncollect.png',
    isCollected: false,
    isCommented: false,
    userInfo: app.globalData.userInfo,
    commentId: null,
    movieId: null,
    isMine: false,
    playing: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      commentId: options.commentId,
      movieId: options.movieId
    })
    this.getInitData(options)
  },

  getInitData(options) {
    const { movieId, commentId, userId } = options
    wx.showLoading({
      title: '数据加载中'
    })

    qcloud.request({
      url: config.service.getCommentDetail,
      data: {
        movieId,
        commentId,
        userId
      },
      success: res => {
        if (!res.data) {
          wx.navigateBack({})
        }
        const { data = {} } = res
        if (data.code === 0) {
          this.setData({
            data: data.data.data,
            isCollected: data.data.isCollected === 0 ? false : true,
            isCommented: data.data.isCommented === 0 ? false : true
          })
        } else {
          wx.navigateBack({})
          wx.showToast({
            icon: 'none',
            title: '数据获取错误',
          })
        }
      },
      fail: () => {
        wx.navigateBack({})
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

  // 收藏影评
  handleCollectMovie() {
    const userId = this.data.userInfo.openId
    const commentId = this.data.commentId
    wx.showLoading({
      title: '数据提交中'
    })
    qcloud.request({
      url: config.service.addCollectMovie,
      data: {
        commentId,
        userId
      },
      method: 'POST',
      success: res => {
        const { data = {} } = res
        if (data.code === 0) {
          this.setData({
            isCollected: true
          })
        } else {
          this.setData({
            isCollected: false
          })
          wx.showToast({
            icon: 'none',
            title: '数据提交失败',
          })
        }
      },
      fail: () => {
        this.setData({
          isCollected: false
        })
        wx.showToast({
          icon: 'none',
          title: '数据提交失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  // 取消收藏影评
  handleCancleMovie() {
    const userId = this.data.userInfo.openId
    const commentId = this.data.commentId
    wx.showLoading({
      title: '数据提交中'
    })
    qcloud.request({
      url: config.service.cancelCollectMovie,
      data: {
        commentId,
        userId
      },
      method: 'POST',
      success: res => {
        const { data = {} } = res
        if (data.code === 0) {
          this.setData({
            isCollected: false
          })
        } else {
          this.setData({
            isCollected: true
          })
          wx.showToast({
            icon: 'none',
            title: '数据提交失败',
          })
        }
      },
      fail: () => {
        this.setData({
          isCollected: false
        })
        wx.showToast({
          icon: 'none',
          title: '数据提交失败',
        })
      },
      complete: () => {
        wx.hideLoading()
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
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

  // 写影评
  handleNavigateToEdit(event) {
    const id = event.currentTarget.dataset.id
    const type = event.currentTarget.dataset.type
    wx.navigateTo({
      url: `/pages/reviewEdit/index?id=${id}&type=${type}`
    })
  },
  
  // 查看影评
  handleReviewComment() {
    const { userInfo, movieId, commentId } = this.data
    wx.navigateTo({
      url: `/pages/myPreview/index?movieId=${movieId}&commentId=${commentId}&userId=${userInfo.openId}`
    })
  },

  // 返回影评列表
  handleNavigateToReviewList() {
    const { movieId } = this.data;
    wx.navigateTo({
      url: `/pages/reviewList/index?id=${movieId}`
    })
  },

  onPlay: function(event) {
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

  // 显示遮罩层
  showModal: function () {
    var that = this
    that.setData({
      hideModal: false
    })
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    this.animation = animation
    setTimeout(function () {
      that.fadeIn()
    }, 100)
  },

  // 隐藏遮罩层
  hideModal: function () {
    var that = this
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    this.animation = animation
    that.fadeDown()
    setTimeout(function () {
      that.setData({
        hideModal: true
      })
    }, 100)

  },

  //动画集
  fadeIn: function () {
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    })
  },
  fadeDown: function () {
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),
    })
  },
})