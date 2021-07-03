const express = require("express")
const app = express()
const port = 3333

const server = app.listen(port, () => console.log(`server is running at http://localhost:${port}`))

app.get("/", (request, response, next) => {
    response.send("server is running!")
})