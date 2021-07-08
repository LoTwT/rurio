$(document).ready(() => {
    if (selectedTab == "replies") {
        loadReplies();
    } else {
        loadPosts();
    }
})

function loadPosts() {
    // 发起请求
    $.get("/api/posts", { postedBy: profileUserId, isReply: false }, results => {
        // 展示数据
        showPosts(results, $(".postsContainer"))
    })
}

function loadReplies() {
    $.get("/api/posts", { postedBy: profileUserId, isReply: true }, results => {
        outputPosts(results, $(".postsContainer"));
    })
}
