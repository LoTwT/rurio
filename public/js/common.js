// 控制 button 的 disabled 属性
$("#postTextarea, #replyTextarea").keyup(event => {
    const textbox = $(event.target)
    const value = textbox.val().trim()

    const isModal = textbox.parents(".modal").length == 1

    const submitButton = isModal ? $("#submitReplyButton") : $("#submitPostButton")

    if (value == "") {
        submitButton.prop("disabled", true)
        return
    }

    submitButton.prop("disabled", false)
})

/**
 * 发布
 */
$("#submitPostButton,#submitReplyButton").click((event) => {
    const button = $(event.target)

    const isModal = button.parents(".modal").length == 1
    const textbox = isModal ? $("#replyTextarea") : $("#postTextarea")

    const data = {
        content: textbox.val()
    }

    if (isModal) {
        const id = button.data().id
        if (id == null) return alert("button id invalid")
        data.replyTo = id
    }

    // 发起请求
    // /api/posts => http://localhost:3333/api/posts
    $.post("/api/posts", data, (postData, status, xhr) => {
        if (postData.replyTo) {
            location.reload()
        } else {
            const html = createPostInfoHtml(postData)
            $(".postsContainer").prepend(html)
            textbox.val("")
            button.prop("disabled", true)
        }
    })
})

$("#replyModal").on("shown.bs.modal", event => {
    const button = $(event.relatedTarget)
    const postId = getPostIdFromElement(button)

    // 传递 id
    $("#submitReplyButton").attr("data-id", postId)

    // 获取当前数据
    $.get(`/api/posts/${postId}`, result => {
        showPosts(result, $("#originalPostContainer"))
    })
})

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""))

/**
 * 点赞
 */
$(document).on("click", ".likeButton", event => {
    const button = $(event.target)
    const postId = getPostIdFromElement(button)

    // 发起请求
    $.ajax({
        url: `/api/posts/${postId}/like`,
        type: "PUT",
        success: postData => {
            button.find("span").text(postData.likes.length || "")

            if (postData.likes.includes(currentUser._id)) {
                button.addClass("active")
            } else {
                button.removeClass("active")
            }
        }
    })
})

/**
 * 转发
 */
$(document).on("click", ".retweetButton", event => {
    const button = $(event.target)
    const postId = getPostIdFromElement(button)

    // 发起请求
    $.ajax({
        url: `/api/posts/${postId}/retweet`,
        type: "POST",
        success: postData => {
            button.find("span").text(postData.retweetUsers.length || "")

            if (postData.retweetUsers.includes(currentUser._id)) {
                button.addClass("active")
                window.location.reload()
            } else {
                button.removeClass("active")
                window.location.reload()
            }
        }
    })
})

function getPostIdFromElement(element) {
    const isRoot = element.hasClass("post")
    const rootElement = isRoot === true ? element : element.closest(".post")
    const postId = rootElement.data().id

    if (postId == undefined) return alert("postId undefined")

    return postId
}

function createPostInfoHtml(postData) {
    if (postData == null) return alert("postData invalid")

    // 判断是不是转发的信息
    const isRetweet = postData.retweetData !== undefined

    postData = isRetweet ? postData.retweetData : postData

    const postedBy = postData.postedBy
    const timestamp = timeDifference(new Date(), new Date(postData.createdAt))
    const isLikeButtonActive = postData.likes && postData.likes.includes(currentUser._id) ? "active" : ""
    const isRetweetButtonActive = postData.retweetUsers && postData.retweetUsers.includes(currentUser._id) ? "active" : ""

    // 评论相关
    let replyFlag = ""

    if (postData.replyTo) {
        if (!postData.replyTo._id) {
            return alert("replyTo is not populated")
        } else if (!postData.replyTo.postedBy._id) {
            return alert("postedBy is not populated")
        }

        const replyToUsername = postData.replyTo.postedBy.username
        replyFlag = `
            <div class="replyFlag">
                <a href="/profile/${replyToUsername}">@${replyToUsername}</a>的评论
            </div>
        `
    }

    return `
        <div class="post" data-id="${postData._id}">
            <div class="mainContentContainer">
                <div class="userImageContainer">
                    <img src="${postedBy.avatar}" alt="">
                </div>
                <div class="postContentContainer">
                    <div class="header">
                        <a href="/profile/${postedBy.username}" class="displayName">${postedBy.name}</a>
                        <span class="username">@${postedBy.username}</span>
                        <span class="date">${timestamp}</span>
                    </div>
                    ${replyFlag}
                    <div class="postBody">
                        <span>${postData.content}</span>
                    </div>
                    <div class="postFooter">
                        <div class="postButtonContainer">
                            <button data-bs-toggle="modal" data-bs-target="#replyModal">
                                <i class="fa fa-comment"></i>
                            </button>
                        </div>
                        <div class="postButtonContainer green">
                            <button class="retweetButton ${isRetweetButtonActive}">
                                <i class="fa fa-retweet"></i>
                                <span>${postData.retweetUsers.length || ""}</span>
                            </button>
                        </div>
                        <div class="postButtonContainer red">
                            <button class="likeButton ${isLikeButtonActive}">
                                <i class="fa fa-heart"></i>
                                <span>${postData.likes.length || ""}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}

function timeDifference(current, previous) {
    const msPerMinute = 60 * 1000;
    const msPerHour = msPerMinute * 60;
    const msPerDay = msPerHour * 24;
    const msPerMonth = msPerDay * 30;
    const msPerYear = msPerDay * 365;

    const elapsed = current - previous;

    if (elapsed < msPerMinute) {
        if (elapsed / 1000 < 30) return "Just now";

        return Math.round(elapsed / 1000) + ' seconds ago';
    }

    else if (elapsed < msPerHour) {
        return Math.round(elapsed / msPerMinute) + ' minutes ago';
    }

    else if (elapsed < msPerDay) {
        return Math.round(elapsed / msPerHour) + ' hours ago';
    }

    else if (elapsed < msPerMonth) {
        return Math.round(elapsed / msPerDay) + ' days ago';
    }

    else if (elapsed < msPerYear) {
        return Math.round(elapsed / msPerMonth) + ' months ago';
    }

    else {
        return Math.round(elapsed / msPerYear) + ' years ago';
    }
}

function showPosts(results, container) {
    container.html("")

    if (!Array.isArray(results)) {
        results = [results]
    }

    results.forEach(result => {
        const html = createPostInfoHtml(result)
        container.append(html)
    })

    // 如果数据为空 显示的内容
    if (results.length === 0) {
        container.append(`<span class="noResults">Nothing to show...</span>`)
    }
}