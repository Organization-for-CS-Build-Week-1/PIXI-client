socket = io.connect("http://localhost:5000")
socket.on("register", data => {
    console.log(data)
    window.location.replace("/game/index.html")
})
socket.on("registerError", console.error)

form = document.getElementById("register-form")

form.addEventListener("submit", (e) => {
    e.preventDefault()
    formData = {username : document.getElementById("username").value,
    password1 : document.getElementById("password1").value,
    password2 : document.getElementById("password2").value}

    socket.emit("registration", formData)

})

