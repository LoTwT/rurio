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
    let followButton = ""

    const isFollowing = currentUser.following && currentUser.following.includes(userData._id)
    const text = isFollowing ? "已关注" : "关注"
    const buttonClass = isFollowing ? "followButton following" : "followButton"

    if (currentUser._id != userData._id) {
        followButton = `
            <div class="followButtonContainer">
                <button class="${buttonClass}" data-user="${userData._id}">${text}</button>
            </div>
        `
    }

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
            ${followButton}
        </div>
    `
}
