const express = require("express")
const router = express.Router()
const PostInfo = require("../../schemas/PostInfoSchema")
const UserInfo = require("../../schemas/UserInfoSchema")

// 接口优化
async function getPosts(filter) {
    let results = await PostInfo.find(filter)
        .populate("postedBy")
        .populate("retweetData")
        .populate("replyTo")
        .sort({ "createdAt": -1 })
        .catch(error => res.sendStatus(400).json(error))

    results = await UserInfo.populate(results, { path: "replyTo.postedBy" })
    results = await UserInfo.populate(results, { path: "retweetData.postedBy" })

    return results
}

/**
 * @route       get /
 * @description 获取所有信息接口
 * @access      private
 */
router.get("/", async (req, res, next) => {
    const searchTarget = req.query

    if (searchTarget.isReply !== undefined) {
        const isReply = searchTarget.isReply == "true"
        searchTarget.replyTo = { $exists: isReply }
        delete searchTarget.isReply
    }

    if (searchTarget.followingOnly !== undefined) {
        const followingOnly = searchTarget.followingOnly == "true"

        if (followingOnly) {
            // 获取所有关注的用户 id
            const objectIds = [req.session.user._id]

            req.session.user.following.forEach(user => objectIds.push(user))

            searchTarget.postedBy = { $in: objectIds }
        }

        delete searchTarget.followingOnly
    }

    const results = await getPosts(searchTarget)
    res.status(200).send(results)
})

/**
 * @route       get /:id
 * @description 获取单个信息接口
 * @access      private
 */
router.get("/:id", async (req, res, next) => {
    const postId = req.params.id
    let postData = await getPosts({ _id: postId })

    // 单个消息
    postData = postData[0]

    const results = {
        postData: postData
    }

    // 所有评论
    if (postData.replyTo !== undefined) {
        results.replyTo = postData.replyTo
    }

    results.replies = await getPosts({ replyTo: postId })

    res.status(200).send(results)
})

/**
 * @route       post /
 * @description 创建信息接口
 * @access      private
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

    // 回复相关
    if (req.body.replyTo) {
        postData.replyTo = req.body.replyTo
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
 * @access      private
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

/**
 * @route       post /:id/retweet
 * @description 转发和取消转发接口
 * @access      private
 */
router.post("/:id/retweet", async (req, res, next) => {
    // 1. 哪条消息被转发、谁转发的
    const postId = req.params.id
    const userId = req.session.user._id

    // 2. 用户有没有对这条消息转发过，如果转发过，要将该条转发消息删除
    const deletedPost = await PostInfo.findOneAndDelete({ postedBy: userId, retweetData: postId }).catch(error => res.sendStatus(400).json(error))
    const option = deletedPost != null ? "$pull" : "$addToSet"

    // 3. 未转发 复制 post 数据
    if (deletedPost == null) {
        await PostInfo.create({ postedBy: userId, retweetData: postId }).catch(error => res.sendStatus(400).json(error))
    }

    // 4. 更新用户是否转发的标记
    req.session.user = await UserInfo.findByIdAndUpdate(userId, { [option]: { retweets: postId } }, { new: true }).catch(error => res.sendStatus(400).json(error))

    // 5. 更新信息是否转发的标记
    const post = await PostInfo.findByIdAndUpdate(postId, { [option]: { retweetUsers: userId } }, { new: true }).catch(error => res.sendStatus(400).json(error))

    // 6. 将更新的数据返回
    res.status(200).send(post)
})

/**
 * @route       delete /:id
 * @description 消息删除接口
 * @access      private
 */
router.delete("/:id", (req, res, next) => {
    PostInfo.findByIdAndDelete(req.params.id).then(() => res.sendStatus(202)).catch(error => res.sendStatus(400).json(error))
})

module.exports = router