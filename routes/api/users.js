const express = require("express")
const router = express.Router()
const PostInfo = require("../../schemas/PostInfoSchema")
const UserInfo = require("../../schemas/UserInfoSchema")

/**
 * @route       put /:id/follow
 * @description 实现关注接口
 * @access      private
 */
router.put("/:userId/follow", async (req, res, next) => {
    // 被关注者的 id
    const userId = req.params.userId
    // 查询这个 id 是否存在
    const user = await UserInfo.findById(userId)

    if (user == null) return res.status(404).json("userId not found")
    const isFollowing = user.followers && user.followers.includes(req.session.user._id)

    const option = isFollowing ? "$pull" : "$addToSet"

    // 增加/减少 关注者的 following 容器
    req.session.user = await UserInfo.findByIdAndUpdate(
        req.session.user._id,
        { [option]: { following: userId } },
        { new: true }
    )

    // 增加/减少 粉丝的 followers 容器
    await UserInfo.findByIdAndUpdate(userId, { [option]: { followers: req.session.user._id } })

    res.status(200).send(req.session.user)
})

module.exports = router