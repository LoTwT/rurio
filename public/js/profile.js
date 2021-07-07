$(document).ready(() => {
    loadPosts()
})

function loadPosts() {
    // 发起请求
    $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
        // 展示数据
        showPosts(results, $(".postsContainer"))
    })
}