scoreboard = {
    highscores: [{},{},{}],
    player: {}
}

socket.on("highscoreupdate", data => {
    scoreboard.highscores[0].textContent = data[0]
    scoreboard.highscores[1].textContent = data[1]
    scoreboard.highscores[2].textContent = data[2]
})

sokcet.on("playerupdate", player => {
    scoreboard.player.textContent = player.score
})

/**
 * finds the three span elements that hold the top three scores
 * and adds a socket listener to set the usernames and scores
 */
function listenForInfo() {
    scoreboard.highscores = Array.from(document.getElementsByClassName("highscore"))
    scoreboard.player = document.getElementById("player-score")
    scoreboard.highscores[0].textContent = "Melanoma: 99800"
    scoreboard.highscores[1].textContent = "6k6: 12500"
    scoreboard.highscores[2].textContent = "Dank: 8400"
    scoreboard.player.textContent = "0"

}


chatContainer = {
    div: {},
    children: [{}]
}

socket.on("roomupdate", ({chat}) => {
    
})