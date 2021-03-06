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

/**
 * 回复弹窗
 */
$("#replyModal").on("shown.bs.modal", event => {
    const button = $(event.relatedTarget)
    const postId = getPostIdFromElement(button)

    // 传递 id
    $("#submitReplyButton").attr("data-id", postId)

    // 获取当前数据
    $.get(`/api/posts/${postId}`, result => {
        showPosts(result.postData, $("#originalPostContainer"))
    })
})

$("#replyModal").on("hidden.bs.modal", () => $("#originalPostContainer").html(""))

/**
 * 删除弹窗
 */
$("#deletePostModal").on("shown.bs.modal", event => {
    const button = $(event.relatedTarget)
    const postId = getPostIdFromElement(button)

    // 传递 id
    $("#deletePostButton").attr("data-id", postId)
})

$("#deletePostModal").click(event => {
    const postId = $(event.target).data("id")

    // 发起删除请求
    $.ajax({
        url: `/api/posts/${postId}`,
        type: "DELETE",
        success: (data, status, xhr) => {
            if (xhr.status !== 202) {
                // 删除失败
                alert("delete this post failed!")
                return
            }

            location.reload()
        }
    })
})

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

/**
 * 关注事件
 */
$(document).on("click", ".followButton", event => {
    const button = $(event.target)
    const userId = button.data().user

    // 发起请求
    $.ajax({
        url: `/api/users/${userId}/follow`,
        type: "PUT",
        success: (data, status, xhr) => {
            if (xhr.status == 404) {
                alert("user not found")
                return
            }

            let count = 1

            if (data.following && data.following.includes(userId)) {
                button.addClass("following")
                button.text("已关注")
            } else {
                button.removeClass("following")
                button.text("关注");
                count = -1;
                window.location.reload()
            }

            // 获取粉丝数
            const followersLabel = $("#followersValue")
            if (followersLabel.length != 0) {
                let followersText = followersLabel.text();
                followersText = parseInt(followersText);
                followersLabel.text(followersText + count)
            }
        }
    })
})

/**
 * 点击消息 进行跳转
 */
$(document).on("click", ".post", event => {
    const element = $(event.target)
    const postId = getPostIdFromElement(element)

    if (postId !== undefined && !element.is("button")) {
        window.location.href = `/posts/${postId}`
    }
})

function getPostIdFromElement(element) {
    const isRoot = element.hasClass("post")
    const rootElement = isRoot === true ? element : element.closest(".post")
    const postId = rootElement.data().id

    if (postId == undefined) return alert("postId undefined")

    return postId
}

function createPostInfoHtml(postData, largeFont = false) {
    if (postData == null) return alert("postData invalid")

    // 判断是不是转发的信息
    const isRetweet = postData.retweetData !== undefined

    postData = isRetweet ? postData.retweetData : postData

    const postedBy = postData.postedBy
    const timestamp = timeDifference(new Date(), new Date(postData.createdAt))
    const isLikeButtonActive = postData.likes && postData.likes.includes(currentUser._id) ? "active" : ""
    const isRetweetButtonActive = postData.retweetUsers && postData.retweetUsers.includes(currentUser._id) ? "active" : ""

    const largeFontClass = largeFont ? "largeFont" : ""

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

    // 删除按钮
    let buttons = ""

    // 判断是否是当前登录用户的消息
    if (postData.postedBy._id === currentUser._id) {
        buttons = `
        <button data-id="${postData._id}" data-bs-toggle="modal" data-bs-target="#deletePostModal">
            <i class="fa fa-times"></i>
        </button>
        `
    }

    return `
        <div class="post ${largeFontClass}" data-id="${postData._id}">
            <div class="mainContentContainer">
                <div class="userImageContainer">
                    <img src="${postedBy.avatar}" alt="">
                </div>
                <div class="postContentContainer">
                    <div class="header">
                        <a href="/profile/${postedBy.username}" class="displayName">${postedBy.name}</a>
                        <span class="username">@${postedBy.username}</span>
                        <span class="date">${timestamp}</span>
                        ${buttons}
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

function showPostsWithReplies(results, container) {
    container.html("")

    // 如果有评论消息，展示评论消息
    if (results.replyTo !== undefined && results.replyTo._id !== undefined) {
        const html = createPostInfoHtml(results.replyTo)
        container.append(html)
    }

    // 展示消息
    const mainPostHtml = createPostInfoHtml(results.postData, true)
    container.append(mainPostHtml)

    results.replies && results.replies.forEach(result => {
        const html = createPostInfoHtml(result)
        container.append(html)
    })
}