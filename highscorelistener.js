/**
 * finds the three span elements that hold the top three scores
 * and adds a socket listener to set the usernames and scores
 */
function listenForInfo() {
    highscores = Array.from(document.getElementsByClassName("highscore"))
    socket.on("highscoreUpdate", data => {
        highscores[0].textContent = data[0]
        highscores[1].textContent = data[1]
        highscores[2].textContent = data[2]
    })
    // Sanity check to make sure text content changes
    // highscores[0].textContent = "data[0]"
    // highscores[1].textContent = "data[1]"
    // highscores[2].textContent = "data[2]"

}