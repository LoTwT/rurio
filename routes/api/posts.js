const express = require("express")
const router = express.Router()
const PostInfo = require("../../schemas/PostInfoSchema")
const UserInfo = require("../../schemas/UserInfoSchema")

/**
 * @route       get /
 * @description 获取信息接口
 * @access      public
 */
router.get("/", (req, res, next) => {
    PostInfo.find()
        .populate("postedBy")
        .sort({ "createdAt": -1 })
        .then(results => res.status(200).send(results))
        .catch(error => res.sendStatus(400).json(error))
})

/**
 * @route       post /
 * @description posts 接口
 * @access      public
 */
router.post("/", (req, res, next) => {
    // 判断参数是否有效
    if (!req.body.content) {
        return res.status(400).json({ error: "params are invalid" })
    }

    // 参数有效 准备数据
    const postData = {
        content: req.body.content,
        postedBy: req.session.user,
    }

    // 插入数据 到 数据库
    // 状态码 201 表示创建内容成功
    PostInfo.create(postData)
        .then(async newPostInfo => {
            // 返回值加上 user
            newPostInfo = await UserInfo.populate(newPostInfo, { path: "postedBy" })
            res.status(201).send(newPostInfo)
        })
        .catch(error => res.status(400).json({ error: "insert content failed! " + error }))
})

/**
 * @route       put /:id/like
 * @description 点赞和取消点赞接口
 * @access      public
 */
router.put("/:id/like", async (req, res, next) => {
    // 1. 哪条消息被点赞、谁点的
    const postId = req.params.id
    const userId = req.session.user._id

    // 2. 用户有没有对这条消息点过赞
    const isLiked = req.session.user.likes && req.session.user.likes.includes(postId)
    const option = isLiked ? "$pull" : "$addToSet"

    // 3. 未点赞 被点击后标记为点赞，否则取反，存储 用户表 中
    req.session.user = await UserInfo.findByIdAndUpdate(userId, { [option]: { likes: postId } }, { new: true }).catch(error => res.sendStatus(400).json(error))

    // 4. 未点赞 被点击后标记为点赞，否则取反，存储 信息表 中
    const post = await PostInfo.findByIdAndUpdate(postId, { [option]: { likes: userId } }, { new: true }).catch(error => res.sendStatus(400).json(error))

    // 5. 将更新的数据返回
    res.status(200).send(post)
})


module.exports = router