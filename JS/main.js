socket = io.connect('http://the-ants-knapsack.herokuapp.com/')

pages = {
  landing: document.getElementById('landing-page-container'),
  register: document.getElementById('register-container'),
  login: document.getElementById('login-container'),
  game: document.getElementById('game-container'),
}

navButtons = {
  register: document.getElementById('register-button'),
  login: document.getElementById('login-button')
}

let currentPage = pages['login']
let gameRunning = false

function switchPage(page) {
  if (currentPage && currentPage.style) currentPage.style.display = 'none'
  pages[page].style.display = 'flex'
  currentPage = pages[page]

  if (page === 'game' && !gameRunning) {
    pages['landing'].style.display = 'none'
    gameRunning = true
    runGame()
    runMap()
    listenForInfo()
  }

  if (page === 'login') loginSetup()
  if (page === 'register') registerSetup()
}


navButtons.register.addEventListener('click', e => {
  e.preventDefault()  
  switchPage('register')
})

navButtons.login.addEventListener('click', e => {
  e.preventDefault()  
  switchPage('login')
})

switchPage('login')