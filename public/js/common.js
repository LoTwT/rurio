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

$("#submitPostButton").click(() => {
    const textbox = $("#postTextarea")
    const data = {
        content: textbox.val()
    }

    // 发起请求
    // /api/posts => http://localhost:3333/api/posts
    $.post("/api/posts", data, (postData, status, xhr) => {
        console.log(postData)
    })
})