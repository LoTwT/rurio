const express = require("express")
const router = express.Router()

router.get("/:id", (req, res, next) => {
    const payload = {
        pageTitle: "消息预览",
        currentUser: req.session.user,
        currentUserJson: JSON.stringify(req.session.user),
        postId: req.params.id
    }

    res.status(200).render("postPage", payload)
})

module.exports = router