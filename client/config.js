/**
 * 小程序配置文件
 */

// 此处主机域名修改成腾讯云解决方案分配的域名
var host = '';

var config = {

    // 下面的地址配合云端 Demo 工作
    service: {
        host,

        // 登录地址，用于建立会话
        loginUrl: `${host}/weapp/login`,

        // 测试的请求地址，用于测试会话
        requestUrl: `${host}/weapp/user`,

        // 测试的信道服务地址
        tunnelUrl: `${host}/weapp/tunnel`,

        // 上传图片接口
        uploadUrl: `${host}/weapp/upload`,

        // 热门列表
        hotList: `${host}/weapp/hotList`,

        // 首页
        home: `${host}/weapp/home`,

        // 添加评论
        addComment: `${host}/weapp/addComment`,

        // 获取影评列表
        getCommentList: `${host}/weapp/getCommentList`,

        // 影评详情
        getCommentDetail: `${host}/weapp/getCommentDetail`,

        // 收藏影评
        addCollectMovie: `${host}/weapp/addCollectMovie`,

        // 取消收藏
        cancelCollectMovie: `${host}/weapp/cancelCollectMovie`,

        // 单个电影影评详情
        getUserPreview: `${host}/weapp/getUserPreview`,

        // 个人发布影评列表
        getUserPreviewList: `${host}/weapp/getUserPreviewList`,

        // 个人发布列表
        getPublistList: `${host}/weapp/getPublistList`,

        // 个人是否评价过一个电影
        getUserComment: `${host}/weapp/getUserComment`
    }
};

module.exports = config;
