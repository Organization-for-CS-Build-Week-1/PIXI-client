// Create an empty socket so the code doesn't break before io connects
/** Empty Function as a placeholder */
const eF = () => {}

var socket = { on: eF, emit: eF }

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
  updateHighscores(mockScores)
  scoreboard.player.textContent = '0'
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
    chatContainer.append(pTag)
  }
  if (chatContainer.children.length > 15) {
    chatContainer.children[0].remove()
  }
}

function chatSend(e) {
  e.preventDefault()
  console.log(e.target.textContent)
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


mockChatMessages.map(updateChat)
}

// ==================== INVENTORY SETUP ==================== //

playerInventory = {}

class ItemContainer {
  constructor({ id, name, weight, score }) {
    this.id = id
    this.name = name
    this.weight = weight
    this.score = score
    this.div = this.createDiv()
    this.div.addEventListener('click', this.dropItem)
  }

  createDiv = () => {
    const item = document.createElement('div')
    item.className = 'item'

    const imgDiv = document.createElement('div')
    const weightDiv = document.createElement('div')
    const scoreDiv = document.createElement('div')
    imgDiv.className = weightDiv.className = scoreDiv.className = 'third'

    const img = document.createElement('img')
    img.src = `assets/PNG/${this.name}.png`
    img.alt = this.name
    const weight = document.createElement('h4')
    weight.textContent = this.weight
    const score = document.createElement('h4')
    score.textContent = this.score

    imgDiv.append(img)
    weightDiv.append(weight)
    scoreDiv.append(score)
    item.append(imgDiv, weightDiv, scoreDiv)
    return item
  }

  dropItem = () => {
    console.log(this.id)
    socket.emit('drop', this.id)
  }
}

const mockItems = [
  { id: 0, name: 'Gem', weight: 25, score: 4500 },
  { id: 0, name: 'Gem', weight: 25, score: 4500 },
  { id: 0, name: 'Gem', weight: 25, score: 4500 },
  { id: 0, name: 'Gem', weight: 25, score: 4500 },
]

function updateInventory(items) {
  const currentItems = items.map((item) => new ItemContainer(item))
  playerInventory.innerHTML = ''
  currentItems.forEach((item) => playerInventory.append(item.div))
}

function inventorySetup() {
  playerInventory = document.getElementById('inventory-container')
  console.log(playerInventory.children)
  // Testing
  updateInventory(mockItems)
}

// ==================== SOCKET.ON ==================== //

socket.on('roomupdate', updateChat)

socket.on('highscoreupdate', updateHighscores)

socket.on('playerupdate', (player) => {
  scoreboard.player.textContent = player.score
  updateInventory(player.items)
})

function listenForInfo() {
  scoreboardSetup()
  chatSetup()
  inventorySetup()
}
