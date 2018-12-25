// client/pages/reviewEdit/index.js
const qcloud = require('../../vendor/wafer2-client-sdk/index')
const config = require('../../config.js')
const app = getApp()
const recorderManager = wx.getRecorderManager()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    data: {},
    type: 'audio',
    val: '',
    isCompleted: false,
    userInfo: app.globalData.userInfo,
    locationAuthType: app.data.locationAuthType,
    recordText: '长按录音',
    startPoint: {},
    sendLock: true,
    starttime: 0,
    endtime: 0,
    status: 0,
    audioSrc: null,
    playing: false,
    time: 0
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

  handleOnInput(event) {
    this.setData({
      val: event.detail.value.trim()
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRecordAuth()
    this.getInitData()
    if (options.type) {
      this.setData({
        type: options.type
      })
    }
  },

  // 完成按钮
  handleCompleted() {
    const {val, audioSrc, type} = this.data
    if ((type==='text' && !val) || (type==='audio'&&!audioSrc)) return
    this.setData({
      isCompleted: true
    })
  },

  // 发布影评
  handleCommitComment() {
    const {val, type, data, audioSrc, time} = this.data
    if ((type==='text' && !val) || (type==='audio'&&!audioSrc)) return
    const commentType = type === 'text' ? 0 : 1;
    wx.showLoading({
      title: '评论上传中..'
    })
    const movieId = data.id
    qcloud.request({
      url: config.service.addComment,
      login: true,
      method: 'POST',
      data: {
        content: val,
        movieId: data.id,
        type: commentType,
        duration: time,
        audioSrc: audioSrc
      },
      success: result => {
        wx.hideLoading()

        let data = result.data

        if (!data.code) {
          wx.showToast({
            title: '发表评论成功'
          })

          setTimeout(() => {
            wx.navigateTo({
              url: `/pages/reviewList/index?id=${movieId}`
            })
          }, 1500)
        } else {
          wx.showToast({
            icon: 'none',
            title: '发表评论失败'
          })
        }
      },
      fail: () => {
        wx.hideLoading()

        wx.showToast({
          icon: 'none',
          title: '发表评论失败'
        })
      }
    })

  },

  // 重新编辑
  handleEdit() {
    this.setData({
      isCompleted: false,
      val: '',
      audioSrc: null,
      time: 0,
      starttime: 0,
      endtime: 0,
      playing: false
    })
  },

  // longpress时触发, 开始触发
  handleStartRecord(e) {
    const { status } = this.data;
    // if (status === 0) return
    if (status === 1) {
      this.startPoint = e.touches[0]
      
      wx.showToast({
        title: "正在录音，上划取消发送",
        icon: "none",
        duration: 60000
      })
      recorderManager.start()
      this.setData({
        recordText: '松开发送',
        starttime: new Date().getTime()
      })
    }
  },

  // 松开发送 touchend手指松开发送
  handleStopRecord() {
    const _this = this
    const { starttime } = this.data
    this.setData({
      recordText: '长按录音'
    })
    wx.hideToast()
    recorderManager.stop()
    const endtime = new Date().getTime()
    const time = endtime - starttime
    this.setData({
      endtime,
      time: parseInt(time / 1000)
    })
    recorderManager.onStop(res => {
      wx.hideToast()
      if (res.duration < 10) {
        wx.showToast({
          title: "录音时间太短",
          icon: "none",
          duration: 1000
        })
        return
      }
      if (_this.data.sendLock) {
        _this.handleUpload(res)
      }
    })
  },

  // 上传录音
  handleUpload(params) {
    const _this = this
    const { tempFilePath } = params;
    wx.uploadFile({
      url: config.service.uploadUrl,
      filePath: tempFilePath,
      name: 'file',
      header: {
        'content-type': 'multipart/form-data'
      },
      success(res) {
        let result = res.data
        if (!result) return
        result = JSON.parse(result)
        if (result.code === 0) {
          const data = result.data
          _this.setData({
            audioSrc: data.imgUrl,
            isCompleted: true
          })
        }
      },
      fail(error) {
        console.log('error', error)
      }
    })
  },

  // 上划取消发送 touchmove时触发
  handleCancelRecord(e) {
    var moveLenght = e.touches[e.touches.length - 1].clientY - this.startPoint.clientY
    if (Math.abs(moveLenght) > 50) {
      wx.showToast({
        title: "松开手指,取消发送",
        icon: "none",
        duration: 60000
      });
      this.sendLock = false
    } else {
      wx.showToast({
        title: "正在录音，上划取消发送",
        icon: "none",
        duration: 60000
      });
      this.sendLock = true
    }
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
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      locationAuthType: app.data.locationAuthType
    })
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

  getRecordAuth() {
    const _this = this;
    // 获取用户录音授权状态
    wx.getSetting({
      success: (res) => {
        console.log('success')
        let auth = res.authSetting['scope.record']
        if (!auth) {
          wx.authorize({
            scope: 'scope.record',
            success () {
              _this.setData({
                status: 1
              })
            },
            fail() {
              wx.showModal({
                title: '提示',
                content: '请授权我们使用录音信息',
                showCancel: false,
                success: () => {
                  wx.openSetting({
                    success: res => {
                      if (res.authSetting['scope.record'] === true) {
                        _this.setData({
                          status: 1
                        })
                      }
                    }
                  })
                }
              })
            }
          })
        } else {
          _this.setData({
            status:1
          })
        }
      },
      fail: error => {
        console.log('dail')
        wx.showModal({
          title: '提示',
          content: '请授权我们使用录音信息',
          showCancel: false,
          success: () => {
            wx.openSetting({
              success: res => {
                if (res.authSetting['scope.record'] === true) {
                  _this.setData({
                    status: 1
                  })
                }
              }
            })
          }
        })
      }
    })
  }
})