const express = require("express")

const app = express()
const router = express.Router()

// 指定模版引擎
app.set("view engine", "pug")
app.set("views", "views")

router.get("/", (req, res, next) => {
    res.status(200).render("login")
})

module.exports = router