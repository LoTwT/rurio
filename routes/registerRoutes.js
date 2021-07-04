const UserInfo = require("../schemas/UserInfoSchema")
const express = require("express")

const app = express()
const router = express.Router()

// 配置 post 接收的数据类型
app.use(express.json()) // json
app.use(express.urlencoded({ extended: false })) // x-www-form-urlencoded

// 指定模版引擎
app.set("view engine", "pug")
app.set("views", "views")

/**
 * @route       get /
 * @description 渲染注册页面
 * @access      public
 */
router.get("/", (req, res, next) => {
    res.status(200).render("register")
})

/**
 * @route       post /
 * @description 注册接口
 * @access      public
 */
router.post("/", async (req, res, next) => {
    // {name, username, email, password, passwordConfirm}
    const name = req.body.name.trim()
    const username = req.body.username.trim()
    const email = req.body.email.trim()
    const password = req.body.password
    const passwordConfirm = req.body.passwordConfirm

    let payload = req.body

    if (name && username && email && password && passwordConfirm) {
        // 存储 字段非空

        // 查询 数据库是否存在 username 或 email
        const userInfo = await UserInfo.findOne({
            $or: [
                { username },
                { email },
            ]
        }).catch(() => payload.errorMessage = "Something went wrong...")

        // 判断查询结果
        if (userInfo == null) {
            // 未查到重复
        } else {
            // 查到重复
            if (userInfo.email === email) {
                payload.errorMessage = "email already in use"
            } else if (userInfo.username === username) {
                payload.errorMessage = "username already in use"
            }

            res.status(400).render("register", payload)
        }
    } else {
        // 字段有空值
        payload.errorMessage = "Please input valid value"
        res.status(200).render("register", payload)
    }

    console.log(req.body)
})

module.exports = router