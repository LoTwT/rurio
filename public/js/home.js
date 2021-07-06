$(document).ready(() => {
    // 发起请求
    $.get("/api/posts", results => {
        // 展示数据
        showPosts(results, $(".postsContainer"))
    })
})