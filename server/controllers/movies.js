const DB = require('../utils/db.js')
module.exports = {
	// 热门列表
  hotList: async ctx => {
    ctx.state.data = await DB.query("SELECT id,title,image,category,description FROM movies;")
  },

	// 首页
  homeData: async ctx => {
  	let data = await DB.query("SELECT mc.id,mc.user_id,mc.user_image,mc.user_name,m.image,m.title,m.description,mc.movie_id FROM movies_comment as mc INNER JOIN movies as m ON mc.movie_id=m.id ORDER BY RAND() LIMIT 1;");
  	if (data.length === 0) {
  		data = await DB.query("SELECT id,description,title,image FROM movies ORDER BY RAND() LIMIT 1;")
  	}
  	ctx.state.data = data[0]
  },
	
	// 添加影评
	addComment: async ctx => {
		let user = ctx.state.$wxInfo.userinfo.openId
    let username = ctx.state.$wxInfo.userinfo.nickName
    let avatar = ctx.state.$wxInfo.userinfo.avatarUrl
    
    let movieId = Number(ctx.request.body.movieId)
    let content = ctx.request.body.content || null
		
		let audioSrc = ctx.request.body.audioSrc || null
		let type = ctx.request.body.type
		let duration = ctx.request.body.duration
		
		if(isNaN(movieId)) {
			ctx.state.data = {};
		} else {
			if (type === 0) {
				await DB.query("INSERT INTO movies_comment (movie_id,user_name,user_image,user_id,content,type) VALUES (?,?,?,?,?,?)", [movieId,username,avatar,user,content,type])
			} else if (type === 1) {
				await DB.query("INSERT INTO movies_comment (movie_id,user_name,user_image,user_id,mp3_url,type, recording_duration) VALUES (?,?,?,?,?,?,?)", [movieId,username,avatar,user,audioSrc,type, duration])
			}
		}
	},

	// 影评列表
	getCommentList: async ctx => {
		let movieId = Number(ctx.request.query.movieId)
		if (isNaN(movieId)) {
			ctx.state.data = []
		} else {
			ctx.state.data = await DB.query("SELECT * FROM movies_comment WHERE movie_id = ?", [movieId])
		}
	},

	// 影评详情
	getCommentDetail: async ctx => {
		let movieId = Number(ctx.request.query.movieId)
		let commentId = Number(ctx.request.query.commentId)
		let userId = ctx.request.query.userId
		let temp = []
		// isCollected 标识符 0:未收藏;1:已收藏
		// isCommented 标识符 0:别人的影评;1:自己的影评
		if (isNaN(movieId) || isNaN(commentId)) {
			ctx.state.data = {
				data: {},
				isCollected: 0,
				isCommented: 0
			}
		} else {
			temp = await DB.query("SELECT user_id,user_name,user_image,content,type,title,image,mp3_url,recording_duration FROM movies_comment as mc LEFT JOIN movies as m ON mc.movie_id=m.id WHERE mc.movie_id = ? AND mc.id = ?",[movieId, commentId])
			let array = await DB.query("SELECT id FROM comment_collection WHERE user_id= ? AND comment_id= ?", [userId, commentId])
			let commentArray = await DB.query("SELECT * FROM movies_comment WHERE movie_id = ? AND user_id = ?", [movieId, userId])
			let isCollected = array.length > 0 ? 1 : 0
			let data = temp.length > 0 ? temp[0] : {}
			let isCommented = commentArray.length > 0 ? 1 : 0
			ctx.state.data = {
				data,
				isCollected,
				isCommented
			}
		}
	},

	// 收藏影评
	addCollectMovie: async ctx => {
		let userId = ctx.request.body.userId
		let commentId = Number(ctx.request.body.commentId)
		if (isNaN(commentId)) {
			ctx.state.data = {}
		}
		await DB.query("INSERT INTO comment_collection (user_id,comment_id) VALUES (?,?);", [userId, commentId])
	},

	// 取消收藏
	cancelCollectMovie: async ctx => {
		let userId = ctx.request.body.userId
		let commentId = Number(ctx.request.body.commentId)
		if (isNaN(commentId)) {
			ctx.state.data = {}
		}
		await DB.query("DELETE FROM comment_collection WHERE user_id = ? AND comment_id = ?", [userId, commentId])
	},

	// 查看个人影评详情页面
	getUserPreview: async ctx => {
		let userId = ctx.request.query.userId
		let movieId = Number(ctx.request.query.movieId)
		if (isNaN(movieId)) {
			ctx.state.data = {}
		} else {
			const temp = await DB.query("SELECT recording_duration, content,mp3_url,type,movie_id,m.image,m.title FROM movies_comment as mc LEFT JOIN movies as m ON mc.movie_id=m.id WHERE user_id= ? AND movie_id = ?", [userId, movieId])
			ctx.state.data = temp[0]
		}
	},

	// 查看个人收藏的影评列表
	getUserPreviewList: async ctx => {
		let userId = ctx.request.query.userId
		let temp = await DB.query("SELECT recording_duration,user_name,user_image,content,mp3_url,type,movie_id,m.image,m.title FROM movies as m LEFT JOIN movies_comment as mc ON mc.movie_id=m.id LEFT JOIN comment_collection as cc ON cc.comment_id=mc.id WHERE cc.user_id= ?", [userId])
		ctx.state.data = temp
	},

	// 查看个人发布的影评列表
	getPublistList: async ctx => {
		let userId = ctx.request.query.userId
		ctx.state.data = await DB.query("SELECT title,image,content,user_image,user_name,mp3_url,recording_duration,type FROM movies_comment LEFT JOIN movies ON movies_comment.movie_id=movies.id WHERE user_id=?;", [userId])
	},

	// 查看用户是否已经评价过改电影--电影详情页使用
	getUserComment: async ctx => {
		let userId = ctx.request.query.userId
		let movieId = Number(ctx.request.query.movieId)
		if (isNaN(movieId)) {
			ctx.state.data = {}
		} else {
			let temp = await DB.query("SELECT * FROM movies_comment WHERE user_id= ? AND movie_id = ?", [userId, movieId])
			ctx.state.data = temp;
		}
	}
}