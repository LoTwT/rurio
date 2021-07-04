const express = require("express")
const UserInfo = require("../schemas/UserInfoSchema")
const bcrypt = require("bcryptjs")

const app = express()
const router = express.Router()

// 指定模版引擎
app.set("view engine", "pug")
app.set("views", "views")

/**
 * @route       get /
 * @description 渲染登录页面
 * @access      public
 */
router.get("/", (req, res, next) => {
    res.status(200).render("login")
})

/**
 * @route       get /
 * @description 登录页面
 * @access      public
 */
router.post("/", async (req, res, next) => {
    const payload = req.body

    // 判断表单提交信息是否有效
    if (req.body.username && req.body.password) {
        // 查询数据库
        const user = await UserInfo.findOne({
            $or: [
                { username: req.body.username },
                { email: req.body.username },
            ]
        }).catch(() => {
            payload.errorMessage = "something went wrong!"
            res.status(400).render("login", payload)
        })

        if (user != null) {
            // 校验密码
            const result = await bcrypt.compare(req.body.password, user.password)

            if (result) {
                req.session.user = user
                return res.redirect("/")
            }
        }

        payload.errorMessage = "username or password is incorrect!"
        return res.status(400).render("login", payload)
    }
})

module.exports = router