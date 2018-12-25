//app.js
var qcloud = require('./vendor/wafer2-client-sdk/index')
var config = require('./config')

const UNPROMPTED = 0


App({
  data: {
    locationAuthType: UNPROMPTED
  },
  globalData: {
    userInfo: null
  },

  onLaunch() {
    qcloud.setLoginUrl(config.service.loginUrl)
    const _this = this
    wx.getStorageInfo({
      success (res) {
        if (res.keys.length > 0) {
          const key = res.keys.filter(item => {
            return item.includes('weapp_session')
          })[0]
          if (key) {
            wx.getStorage({
              key,
              success(res) {
                _this.globalData.userInfo = res.data.userinfo
              },
              fail() {
                _this.globalData.userInfo = null
              }
            })
          } else {
            _this.globalData.userInfo = null
          }
        } else {
          _this.globalData.userInfo = null
        }
      }
    })
  },

  login({ success, error }) {
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo'] === false) {
          // 已拒绝授权
          wx.showModal({
            title: '提示',
            content: '请授权我们获取您的用户信息',
            showCancel: false,
            success: () => {
              wx.openSetting({
                success: res => {
                  if (res.authSetting['scope.userInfo'] === true) {
                    this.doQcloudLogin({ success, error })
                  }
                }
              })
            }
          })
        } else {
          this.doQcloudLogin({ success, error })
        }
      }
    })
    // this.doQcloudLogin({ success, error })
  },

  doQcloudLogin({ success, error }) {
    qcloud.login({
      success: result => {
        console.log('login success', result)
        if (result) {
          this.globalData.userInfo = result
          success && success({
            userInfo: result
          })
        } else {
          this.getUserInfo({ success, error })
        }
      },
      fail: () => {
        console.log('login fail')
        error && error()
      }
    })
  },

  getUserInfo({ success, error }) {
    if (this.globalData.userInfo) return this.globalData.userInfo
    qcloud.request({
      url: config.service.user,
      login: true,
      success: result => {
        let data = result.data
        console.log('getuserinfo', data)
        if (!data.code) {
          this.globalData.userInfo = data.data

          success && success({
            userInfo:data.data
          })
        } else {
          error && error()
        }
      },
      fail: () => {
        console.log('getuserinfo fail')
        error && error()
      }
    })
  },

  checkSession({ success, error }) {
    if (this.globalData.userInfo) {
      return success && success({
        userInfo: this.globalData.userInfo
      })
    }

    wx.checkSession({
      success: () => {
        console.log('checksession success')
        this.getUserInfo({
          success: res => {
        console.log('getUserINfo success')
              console.log(res)
            this.globalData.userInfo = res.userInfo

            success && success({
              userInfo: this.globalData.userInfo
            })
          },
          error: () => {
        console.log('getUserInfo fail')

            error && error()
          }
        })
      },
      fail: () => {
        console.log('checksession fail')

        error && error()
      }
    })
  }
})