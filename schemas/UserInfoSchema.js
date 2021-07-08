const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserInfoSchema = new Schema({
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "/images/avatar.png" },
    likes: [{ type: Schema.Types.ObjectId, ref: "PostInfo" }],
    // 从用户角度考虑: 该用户转发了哪条消息
    retweets: [{ type: Schema.Types.ObjectId, ref: "PostInfo" }],
    following: [{ type: Schema.Types.ObjectId, ref: "UserInfo" }],
    followers: [{ type: Schema.Types.ObjectId, ref: "UserInfo" }],
}, { timestamps: true })

module.exports = mongoose.model("UserInfo", UserInfoSchema)