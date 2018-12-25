// client/pages/detail/index.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config.js')
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {},
    userInfo: app.globalData.userInfo,
    hideModal:true, //模态框的状态  true-隐藏  false-显示
    animationData:{},
    movieId: null,
    isCommented: false,
    commentId: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // const id = options.id
    // this.getInitData()
    this.setData({
      movieId: options.id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  getInitData() {
    wx.getStorage({
      key: 'movieDetail',
      success: res => {
        this.setData({
          data: res.data
        })
      }
    })
  },

  handleNavigateToEdit(event) {
    const id = event.currentTarget.dataset.id;
    const type = event.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/reviewEdit/index?id=${id}&type=${type}`,
    })
  },

  handleNavigateToReviewList(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/reviewList/index?id=${id}`
    })
  },

  // 该条电影已经评价过，直接跳转至评价页面  
  handleNavigateToReview() {
    const { userInfo, movieId, commentId } = this.data;
    wx.navigateTo({
      url: `/pages/myPreview/index?movieId=${movieId}&commentId=${commentId}&userId=${userInfo.openId}`
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      hideModal: true
    })
    const { movieId } = this.data;
    app.checkSession({
      success: ({ userInfo }) => {
        this.setData({
          userInfo
        }, () => {
          const params = {
            movieId,
            userId: userInfo.openId
          }
          this.getData(params)
          this.getInitData()
        })
      },
      error: () => {
        wx.navigateTo({
          url: '/pages/login/index'
        })
      }
    })
  },

  getData(params) {
    wx.showLoading({
      title: '数据加载中'
    })
    qcloud.request({
      url: config.service.getUserComment,
      data: params,
      success: res => {
        wx.hideLoading()
        const result = res.data
        if (result.code === 0) {
          const data = result.data
          const isCommented = data.length > 0
          let commentId = null
          if (isCommented) {
            commentId = data[0].id
          }
          this.setData({
            isCommented,
            commentId
          })
        } else {
          wx.showToast({
            title: '数据获取失败'
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '数据获取失败'
        })
      }
    })
  },

  // 显示遮罩层
  showModal: function () {
    var that=this;
    that.setData({
      hideModal:false
    })
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    this.animation = animation 
    setTimeout(function(){
      that.fadeIn();
    }, 100)   
  },
  
  // 隐藏遮罩层
  hideModal: function () {
    var that=this; 
    var animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease',
    })
    this.animation = animation
    that.fadeDown();
    setTimeout(function(){
      that.setData({
        hideModal:true
      })
    },100)
    
  },
  
  //动画集
  fadeIn:function(){
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    })    
  },
  fadeDown:function(){
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(),  
    })
  }, 
})