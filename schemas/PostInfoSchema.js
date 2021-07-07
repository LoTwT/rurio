const mongoose = require("mongoose")
const Schema = mongoose.Schema

const PostInfoSchema = new Schema({
    content: { type: String, trim: true },
    postedBy: { type: Schema.Types.ObjectId, ref: "UserInfo" },
    likes: [{ type: Schema.Types.ObjectId, ref: "UserInfo" }],
    // 从信息角度考虑: 1. 哪条消息被转发了 2. 被谁转发了
    retweetData: { type: Schema.Types.ObjectId, ref: "PostInfo" },
    retweetUsers: [{ type: Schema.Types.ObjectId, ref: "UserInfo" }],
    replyTo: { type: Schema.Types.ObjectId, ref: "PostInfo" },
}, { timestamps: true })

module.exports = mongoose.model("PostInfo", PostInfoSchema)