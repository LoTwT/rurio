// 控制 button 的 disabled 属性
$("#postTextarea").keyup(event => {
    const textbox = $(event.target)
    const value = textbox.val().trim()

    const submitButton = $("#submitPostButton")

    if (value == "") {
        submitButton.prop("disabled", true)
        return
    }

    submitButton.prop("disabled", false)
})

/**
 * 发布
 */
$("#submitPostButton").click((event) => {
    const button = $(event.target)
    const textbox = $("#postTextarea")
    const data = {
        content: textbox.val()
    }

    // 发起请求
    // /api/posts => http://localhost:3333/api/posts
    $.post("/api/posts", data, (postData, status, xhr) => {
        const html = createPostInfoHtml(postData)
        $(".postsContainer").prepend(html)
        textbox.val("")
        button.prop("disabled", true)
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

function getPostIdFromElement(element) {
    const isRoot = element.hasClass("post")
    const rootElement = isRoot === true ? element : element.closest(".post")
    const postId = rootElement.data().id

    if (postId == undefined) return alert("postId undefined")

    return postId
}

function createPostInfoHtml(postData) {
    const postedBy = postData.postedBy
    const timestamp = timeDifference(new Date(), new Date(postData.createdAt))
    const isLikeButtonActive = postData.likes.includes(currentUser._id) ? "active" : ""

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
                    <div class="postBody">
                        <span>${postData.content}</span>
                    </div>
                    <div class="postFooter">
                        <div class="postButtonContainer">
                            <button>
                                <i class="fa fa-comment"></i>
                            </button>
                        </div>
                        <div class="postButtonContainer">
                            <button>
                                <i class="fa fa-retweet"></i>
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