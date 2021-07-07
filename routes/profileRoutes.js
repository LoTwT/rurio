const express = require("express")
const UserInfo = require("../schemas/UserInfoSchema")
const router = express.Router()

async function getPayload(username, currentUser) {
    const user = await UserInfo.findOne({ username })

    if (user == null) {
        return {
            pageTitle: "user not found",
            currentUser: currentUser,
            currentUserJson: JSON.stringify(currentUser),
        }
    }

    return {
        pageTitle: user.username,
        currentUser: currentUser,
        currentUserJson: JSON.stringify(currentUser),
        profileUser: user,
    }
}

router.get("/", (req, res, next) => {
    const payload = {
        pageTitle: req.session.user.username,
        currentUser: req.session.user,
        currentUserJson: JSON.stringify(req.session.user),
        profileUser: req.session.user,
    }

    res.status(200).render("profilePage", payload)
})

router.get("/:username", async (req, res, next) => {
    const payload = await getPayload(req.params.username, req.session.user)

    res.status(200).render("profilePage", payload)
})


module.exports = router