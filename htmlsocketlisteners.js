// Create an empty socket so the code doesn't break before io connects
var socket = { on: () => {}, emit: () => {} }

const scoreboardInitState = {
  highscores: [{}, {}, {}],
  player: {},
}

scoreboard = scoreboardInitState

socket.on('highscoreupdate', (data) => {
  scoreboard.highscores[0].textContent = data[0]
  scoreboard.highscores[1].textContent = data[1]
  scoreboard.highscores[2].textContent = data[2]
})

socket.on('playerupdate', (player) => {
  scoreboard.player.textContent = player.score
})

/**
 * finds the three span elements that hold the top three scores
 * and adds a socket listener to set the usernames and scores
 */
function highscoreSetup() {
  const highscores = Array.from(document.getElementsByClassName('highscore'))
  if (highscores) scoreboard.highscores = highscores
  scoreboard.player = document.getElementById('player-score')
  scoreboard.highscores[0].textContent = 'Melanoma: 99800'
  scoreboard.highscores[1].textContent = '6k6: 12500'
  scoreboard.highscores[2].textContent = 'Dank: 8400'
  scoreboard.player.textContent = '0'
}

const chatContainerInitState = {
  div: { children: {} },
}
chatContainer = chatContainerInitState

socket.on('roomupdate', ({ chat }) => {
  const newMessage = document.createElement('p')

  if (/: .*(...Dude.|Hi!|GG)/.test(chat)) {
    // If the incoming message has one of the template chats,
    // put the chat message in a span
    chat = chat.split(':')
    newMessage.textContent = chat[0]
    const chatMessage = document.createElement('span')
    chatMessage.textContent = chat[1]
  }
  // Otherwise, just stick it all together
  else newMessage.textContent = chat

  if (chatContainer.div.append) {
    chatContainer.div.append(newMessage)
  }
  if (chatContainer.div.children.length > 15) {
    chatContainer.div.children[0].remove()
  }
})

function chatSend(e) {
  e.preventDefault()
  console.log(e.target.textContent)
  //   socket.emit('chat', e.target.textContent)
}

function chatSetup() {
    
  const chatDiv = document.getElementById('chat-container')
  if (chatDiv) chatContainer.div = chatDiv

  const chatOptionButtons = document.querySelectorAll('.chat-options button')
  chatOptionButtons.forEach((button) => {
    button.addEventListener('click', chatSend)
  })
}

function listenForInfo() {
  highscoreSetup()
  chatSetup()
}
