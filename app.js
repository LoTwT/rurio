const middleware = require("./middleware")
const path = require("path")
const session = require("express-session")

const express = require("express")
const app = express()
const port = 3333

const server = app.listen(port, () => console.log(`server is running at http://localhost:${port}`))

// 连接 mongoDB
const mongoose = require("./database")

// 指定静态资源
app.use(express.static(path.join(__dirname, "public")))

// 指定模版引擎
app.set("view engine", "pug")
app.set("views", "views")

// 使用 session
app.use(session({
    secret: "lo",
    resave: true,
    saveUninitialized: false,
}))

// 配置 post 接收的数据类型
app.use(express.json()) // json
app.use(express.urlencoded({ extended: false })) // x-www-form-urlencoded

app.get("/", middleware.requireLogin, (req, res, next) => {
    const payload = {
        pageTitle: "Rurio",
        currentUser: req.session.user,
        currentUserJson: JSON.stringify(req.session.user),
    }

    res.status(200).render("Home", payload)
})

// 关联路由
const loginRoutes = require("./routes/loginRoutes")
const registerRoutes = require("./routes/registerRoutes")
const logoutRoutes = require("./routes/logoutRoutes")
const postRoutes = require("./routes/postRoutes")

app.use("/login", loginRoutes)
app.use("/register", registerRoutes)
app.use("/logout", logoutRoutes)
app.use("/posts", postRoutes)

// Api Routes
const postsApiRoutes = require("./routes/api/posts")

app.use("/api/posts", postsApiRoutes)
