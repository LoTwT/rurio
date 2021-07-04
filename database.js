const mongoose = require("mongoose")
mongoose.set("useNewUrlParser", true)
mongoose.set("useUnifiedTopology", true)
mongoose.set("useFindAndModify", false)
mongoose.set("useCreateIndex", true)

class Database {
    constructor() {
        this.connectMongoDB()
    }

    /**
     * 连接 mongoDB
     */
    connectMongoDB() {
        mongoose.connect("mongodb+srv://test:test1234@msonline.8yii4.mongodb.net/msonlineDB?retryWrites=true&w=majority").then(() => {
            console.log("database connect successfully")
        }).catch((error) => {
            console.log("database connect error" + error)
        })
    }
}

module.exports = new Database()