const express = require("express")
const router = express.Router()

/**
 * @route       get /
 * @description 退出登录接口
 * @access      public
 */
router.get("/", (req, res, next) => {
    // 销毁 session
    if (req.session) {
        req.session.destroy(() => res.redirect("/login"))
    }
})

module.exports = router