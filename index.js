const express = require("express")
const middleware = require("./middleware")
const loginRoutes = require("./routes/loginRoutes")
const path = require("path")

const app = express()
const port = 3333

const server = app.listen(port, () => console.log(`server is running at http://localhost:${port}`))

// 指定静态资源
app.use(express.static(path.join(__dirname, "public")))

// 指定模版引擎
app.set("view engine", "pug")
app.set("views", "views")

app.get("/", middleware.requireLogin, (req, res, next) => {
    const payload = {
        pageTitle: "Rurio"
    }

    res.status(200).render("Home", payload)
})

// 关联路由
app.use("/login", loginRoutes)