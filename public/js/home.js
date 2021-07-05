$(document).ready(() => {
    // 发起请求
    $.get("/api/posts", results => {
        // 展示数据
        showPosts(results, $(".postsContainer"))
    })
})

function showPosts(results, container) {
    container.html("")

    results.forEach(result => {
        const html = createPostInfoHtml(result)
        container.append(html)
    })

    // 如果数据为空 显示的内容
    if (results.length === 0) {
        container.append(`<span class="noResults">Nothing to show...</span>`)
    }
}