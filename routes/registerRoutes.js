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
router.post("/", (req, res, next) => {
    // {name, username, email, password, passwordConfirm}
    const name = req.body.name.trim()
    const username = req.body.username.trim()
    const email = req.body.email.trim()
    const password = req.body.password
    const passwordConfirm = req.body.passwordConfirm

    let payload = req.body

    if (name && username && email && password && passwordConfirm) {
        // 字段非空
    } else {
        // 字段有空值
        payload.errorMessage = "Please input valid value"
        res.status(200).render("register", payload)
    }

    console.log(req.body)
})

module.exports = router