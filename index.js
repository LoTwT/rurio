const express = require("express")
const app = express()
const port = 3333

const server = app.listen(port, () => console.log(`server is running at http://localhost:${port}`))

// 指定模版引擎
app.set("view engine", "pug")
app.set("views", "views")

app.get("/", (request, response, next) => {
    const payload = {
        pageTitle: "Rurio"
    }

    response.status(200).render("Home", payload)
})