pages = {landing : document.getElementById("landing-page-container"),
register : document.getElementById("register-container"),
login : document.getElementById("login-container"),
game : document.getElementById("game-container")}

navButtons = {register: document.getElementById("register-button"),
login: document.getElementById("login-button"),
game: document.getElementById("game-button"),
home: document.getElementById("home-button")
}

let currentPage;
let gameRunning = false;

function switchPage(page){
    if(currentPage && currentPage.style) currentPage.style.display = "none"
    pages[page].style.display = "flex"
    currentPage = pages[page]

    if(page === "game" && !gameRunning){
        gameRunning = true
        runGame()
    }
}

window.onload = () => switchPage("landing")


navButtons.register.addEventListener("click", () => switchPage("register"))
navButtons.login.addEventListener("click", () => switchPage("login"))
navButtons.game.addEventListener("click", () => switchPage("game"))
navButtons.home.addEventListener("click", () => switchPage("landing"))

