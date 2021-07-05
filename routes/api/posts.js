const express = require("express")
const router = express.Router()
const PostInfo = require("../../schemas/PostInfoSchema")
const UserInfo = require("../../schemas/UserInfoSchema")

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

module.exports = router