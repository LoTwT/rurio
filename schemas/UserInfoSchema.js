const mongoose = require("mongoose")
const Schema = mongoose.Schema

const UserInfoSchema = new Schema({
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "/images/avatar.png" },
    likes: [{ type: Schema.Types.ObjectId, ref: "PostInfo" }],
}, { timestamps: true })

module.exports = mongoose.model("UserInfo", UserInfoSchema)