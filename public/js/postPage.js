// 加载数据
$(document).ready(() => {
    $.get(`/api/posts/${postId}`, results => showPostsWithReplies(results, $(".postsContainer")))
})