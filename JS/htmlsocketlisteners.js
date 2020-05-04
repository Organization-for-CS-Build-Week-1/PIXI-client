// Create an empty socket so the code doesn't break before io connects
/** Empty Function as a placeholder */
const eF = () => {}

var socket

audioButton = {}
antgameaudio = new Audio('assets/WAV/gameloop.wav')
antgameaudio.loop = true

function toggleGameAudio(muteIt) {
  if (muteIt) {
    antgameaudio.muted = true
    audioButton.src = 'assets/PNG/NoAudio.png'
    audioButton.alt = 'Audio is Off'
    window.localStorage.setItem('audioMuted', true)
  } else {
    antgameaudio.muted = false
    audioButton.src = 'assets/PNG/Audio.png'
    audioButton.alt = 'Audio is On'
    window.localStorage.setItem('audioMuted', false)
  }
}

function audioSetup() {
  audioButton = document.getElementById('audio')
  const audioIsMuted = window.localStorage.getItem('audioMuted')
  if (audioIsMuted === 'true') toggleGameAudio(true)

  antgameaudio.play()

  audioButton.addEventListener('click', (e) => {
    if (antgameaudio.muted) toggleGameAudio(false)
    else toggleGameAudio(true)
  })
}

// ==================== HIGHSCORE SETUP ==================== //

const scoreboardInitState = {
  highscores: [{}, {}, {}],
  player: {},
}

scoreboard = scoreboardInitState

const mockScores = ['Melanoma: 99800', '6k6: 12500', 'Dank: 8400']

function updateHighscores(scores) {
  scoreboard.highscores[0].textContent = scores[0]
  scoreboard.highscores[1].textContent = scores[1]
  scoreboard.highscores[2].textContent = scores[2]
}

function scoreboardSetup() {
  const highscores = Array.from(document.getElementsByClassName('highscore'))
  if (highscores) scoreboard.highscores = highscores
  scoreboard.player = document.getElementById('player-score')
  // Testing
  // updateHighscores(mockScores)
  // scoreboard.player.textContent = '0'
}

// ==================== CHATROOM SETUP ==================== //

const chatContainerInitState = {
  children: [{ remove: eF }],
  append: eF,
  remove: eF,
}
chatContainer = chatContainerInitState

const mockChatMessages = [
  'Dank entered the room',
  'Dank: Hi!',
  'Dank took some trash',
  'Dank took a hammer',
  'Dank dropped a stick',
  'Dank dropped a stick',
  'Dank took a gem',
  'Dank dropped a stick',
  'Dank dropped a stick',
  'Dank dropped a stick',
  '6k6: ...Dude.',
  'Dank dropped a stick',
  'Dank dropped a stick',
  'Dank took a gem',
  '6k6: GG',
]

function updateChat(chatMessage) {
  const pTag = document.createElement('p')

  if (/: .*(...Dude.|Hi!|GG)/.test(chatMessage)) {
    // If the incoming message has one of the template chats,
    // put the chat message in a span
    chatMessage = chatMessage.split(':')
    pTag.textContent = chatMessage[0]
    const spanTag = document.createElement('span')
    spanTag.textContent = chatMessage[1]
    pTag.append(spanTag)
  }
  // Otherwise, just stick it all together
  else pTag.textContent = chatMessage

  if (chatContainer.append) {
    chatContainer.prepend(pTag)
  }
  if (chatContainer.children.length > 15) {
    chatContainer.children[chatContainer.children.length - 1].remove()
  }
}

function chatSend(e) {
  e.preventDefault()
  socket.emit('chat', e.target.textContent)
}

function chatSetup() {
  const chatDiv = document.getElementById('chat-container')
  if (chatDiv) chatContainer = chatDiv

  const chatOptionButtons = document.querySelectorAll('.chat-options button')
  chatOptionButtons.forEach((button) => {
    button.addEventListener('click', chatSend)
  })

  // Testing
  // mockChatMessages.map(updateChat)
}

// ==================== INVENTORY SETUP ==================== //

let playerItemsForSale

playerCurrent = {}

const mockItems = [
  { id: 0, name: 'Gem', weight: 25, score: 4500 },
  { id: 0, name: 'Gem', weight: 25, score: 4500 },
  { id: 0, name: 'Gem', weight: 25, score: 4500 },
  { id: 0, name: 'Gem', weight: 25, score: 4500 },
]

function updateInventory(items) {
  playerItemsForSale = items
  const cb = function() {
    socket.emit('drop', this.id)
  }

  const currentItems = items.map((item) => new ItemContainer(item, cb))
  playerCurrent.inventory.innerHTML = ''
  currentItems.forEach((item) => playerCurrent.inventory.prepend(item.div))
}

function inventorySetup() {
  playerCurrent = {
    inventory: document.getElementById('inventory-container'),
    weight: document.getElementById('total-weight'),
    score: document.getElementById('total-score'),
  }
  // Testing
  // updateInventory(mockItems)
}

function inventoryTotal(weight, score) {
  playerCurrent.weight.textContent = weight
  playerCurrent.score.textContent = score
}

// ===================== ERROR HANDLING ==================== //
let gameErrorElements = {
  customAlert: {},
  alertMsg: {},
  closeAlertBtn: {},
}

let gameErrorFunctions = {
  closeTimeout: null,
  closeAlert: () => {
    gameErrorElements.customAlert.classList.remove('game-alert-visible')
  },
  sendAlert: (errorObj) => {
    if (gameErrorFunctions.closeTimeout)
      clearTimeout(gameErrorFunctions.closeTimeout)
    gameErrorElements.alertMsg.textContent = errorObj.error
    gameErrorElements.customAlert.classList.add('game-alert-visible')
    gameErrorFunctions.closeTimeout = setTimeout(
      () => gameErrorFunctions.closeAlert(),
      5000
    )
  },
}

function gameErrorSetup() {
  gameErrorElements = {
    customAlert: document.getElementById('game-alert'),
    alertMsg: document.getElementById('game-alert-msg'),
    closeAlertBtn: document.getElementById('game-alert-close'),
  }

  gameErrorElements.closeAlertBtn.addEventListener('click', (e) => {
    e.preventDefault()
    gameErrorFunctions.closeAlert()
  })
}

// ==================== SOCKET.ON ==================== //

function listenForInfo() {
  scoreboardSetup()
  chatSetup()
  inventorySetup()
  audioSetup()
  gameErrorSetup()
  socket.on('roomupdate', ({ chat }) => updateChat(chat))

  socket.on('highscoreupdate', updateHighscores)

  socket.on('playerupdate', (player) => {
    scoreboard.player.textContent = player.score
    updateInventory(player.items)
    inventoryTotal(player.weight, player.score)
  })
  socket.on('moveError', gameErrorFunctions.sendAlert)
  socket.on('barterError', gameErrorFunctions.sendAlert)
  socket.on('full', gameErrorFunctions.sendAlert)
  socket.on('takeError', gameErrorFunctions.sendAlert)
  socket.on('dropError', gameErrorFunctions.sendAlert)
}
