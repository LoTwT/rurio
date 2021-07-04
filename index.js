const express = require("express")
const middleware = require("./middleware")
const loginRoutes = require("./routes/loginRoutes")
const registerRoutes = require("./routes/registerRoutes")
const path = require("path")

const app = express()
const port = 3333

const server = app.listen(port, () => console.log(`server is running at http://localhost:${port}`))

// 指定静态资源
app.use(express.static(path.join(__dirname, "public")))

// 指定模版引擎
app.set("view engine", "pug")
app.set("views", "views")

// 配置 post 接收的数据类型
app.use(express.json()) // json
app.use(express.urlencoded({ extended: false })) // x-www-form-urlencoded

app.get("/", middleware.requireLogin, (req, res, next) => {
    const payload = {
        pageTitle: "Rurio"
    }

    res.status(200).render("Home", payload)
})

// 关联路由
app.use("/login", loginRoutes)
app.use("/register", registerRoutes)