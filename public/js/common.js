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

function createPostInfoHtml(postData) {
    const postedBy = postData.postedBy
    return `
        <div class="post">
            <div class="mainContentContainer">
                <div class="userImageContainer">
                    <img src="${postedBy.avatar}" alt="">
                </div>
                <div class="postContentContainer">
                    <div class="header">
                        <a href="/profile/${postedBy.username}" class="displayName">${postedBy.name}</a>
                        <span class="username">@${postedBy.username}</span>
                        <span class="date">${postedBy.createdAt}</span>
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
                        <div class="postButtonContainer">
                            <button>
                                <i class="fa fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
}