$(document).ready(() => {
    if (selectedTab == "followers") {
        loadFollowers();
    } else {
        loadFollowing();
    }
})

function loadFollowers() {
    // 发起请求
    $.get(`/api/users/${profileUserId}/followers`, results => {
        // 展示数据
        showUsers(results.followers, $(".resultsContainer"))
    })
}

function loadFollowing() {
    $.get(`/api/users/${profileUserId}/following`, results => {
        showUsers(results.following, $(".resultsContainer"));
    })
}

function showUsers(results, container) {
    container.html("")

    results.forEach(result => {
        const html = createUserInfoHtml(result)
        container.append(html)
    })

    // 如果数据为空 显示的内容
    if (results.length === 0) {
        container.append(`<span class="noResults">Nothing to show...</span>`)
    }
}

function createUserInfoHtml(userData) {
    return `
        <div class="user">
            <div class="userImageContainer">
                <img src="${userData.avatar}" alt="">
            </div>
            <div class="userDetailsContainer">
                <div class="header">
                    <a href="/profile/${userData.username}" class="displayName">${userData.name}</a>
                    <span class="username">@${userData.username}</span>
                </div>
            </div>
        </div>
    `
}
