const mongoose = require("mongoose")
const Schema = mongoose.Schema

const PostInfoSchema = new Schema({
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "UserInfo" },
    likes: [{ type: Schema.Types.ObjectId, ref: "UserInfo" }],
}, { timestamps: true })

module.exports = mongoose.model("PostInfo", PostInfoSchema)