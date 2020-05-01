socket = io.connect('http://localhost:5000')

pages = {
  landing: document.getElementById('landing-page-container'),
  register: document.getElementById('register-container'),
  login: document.getElementById('login-container'),
  game: document.getElementById('game-container'),
}

navButtons = {
  register: document.getElementById('register-button'),
  login: document.getElementById('login-button'),
  game: document.getElementById('game-button'),
  home: document.getElementById('home-button'),
}

let currentPage = pages['login']
let gameRunning = false

function switchPage(page) {
  if (currentPage && currentPage.style) currentPage.style.display = 'none'
  pages[page].style.display = 'flex'
  currentPage = pages[page]

  if (page === 'game' && !gameRunning) {
    gameRunning = true
    runGame()
    runMap()
    listenForInfo()
  }

  if (page === 'login') loginSetup()
  if (page === 'register') registerSetup()
}

// window.onload = () => switchPage('register')

navButtons.register.addEventListener('click', () => switchPage('register'))
navButtons.login.addEventListener('click', () => switchPage('login'))
navButtons.game.addEventListener('click', () => switchPage('game'))
navButtons.home.addEventListener('click', () => switchPage('landing'))
