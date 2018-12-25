/**
 * ajax 服务路由集合
 */
const router = require('koa-router')({
    prefix: '/weapp'
})
const controllers = require('../controllers')

// 从 sdk 中取出中间件
// 这里展示如何使用 Koa 中间件完成登录态的颁发与验证
const { auth: { authorizationMiddleware, validationMiddleware } } = require('../qcloud')

// --- 登录与授权 Demo --- //
// 登录接口
router.get('/login', authorizationMiddleware, controllers.login)
// 用户信息接口（可以用来验证登录态）
router.get('/user', validationMiddleware, controllers.user)

// --- 图片上传 Demo --- //
// 图片上传接口，小程序端可以直接将 url 填入 wx.uploadFile 中
router.post('/upload', controllers.upload)

// --- 信道服务接口 Demo --- //
// GET  用来响应请求信道地址的
router.get('/tunnel', controllers.tunnel.get)
// POST 用来处理信道传递过来的消息
router.post('/tunnel', controllers.tunnel.post)

// --- 客服消息接口 Demo --- //
// GET  用来响应小程序后台配置时发送的验证请求
router.get('/message', controllers.message.get)
// POST 用来处理微信转发过来的客服消息
router.post('/message', controllers.message.post)
// get 热门电影列表
router.get('/hotList', controllers.movies.hotList)

// get 首页
router.get('/home', controllers.movies.homeData)

// 添加评论
router.post('/addComment', validationMiddleware, controllers.movies.addComment)

// 获取评论列表
router.get('/getCommentList', controllers.movies.getCommentList)

// 获取影评详情
router.get('/getCommentDetail', controllers.movies.getCommentDetail)

// 收藏影评
router.post('/addCollectMovie', controllers.movies.addCollectMovie)

// 取消收藏
router.post('/cancelCollectMovie', controllers.movies.cancelCollectMovie)

// 查看个人单个电影影评详情页
router.get('/getUserPreview', validationMiddleware, controllers.movies.getUserPreview)

// 查看个人收藏的电影影评
router.get('/getUserPreviewList', validationMiddleware, controllers.movies.getUserPreviewList)

// 查看个人发布列表
router.get('/getPublistList', controllers.movies.getPublistList)

// 查看用户是否已经评价该条电影
router.get('/getUserComment', controllers.movies.getUserComment)

module.exports = router
