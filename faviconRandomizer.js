potentialFavicons = [
    "assets/PNG/Gem.png",
    "assets/PNG/Hammer.png",
    "assets/PNG/Stick.png",
    "assets/PNG/Trash.png"
]

faviconLinkInHTML = document.getElementById('favicon')
randomFaviconIndex = Math.floor(Math.random()*potentialFavicons.length)
randomFaviconPath = potentialFavicons[randomFaviconIndex]
faviconLinkInHTML.setAttribute('href', randomFaviconPath)