const Application = PIXI.Application,
  loader = PIXI.Loader.shared,
  resources = loader.resources,
  Container = PIXI.Container,
  Sprite = PIXI.Sprite,
  container = document.getElementById('container'),
  app = new Application({ resizeTo: container })

app.renderer.autoDensity = true

container.appendChild(app.view)

loader.add('assets/spritesheet.json').load(setup)

let state, ant1, gameScene, room

function setup() {
  id = resources['assets/spritesheet.json'].textures

  gameScene = new Container()
  app.stage.addChild(gameScene)

  background = new Sprite(id['room-background.png'])
  background.anchor.set(0.5)
  background.position.set(app.screen.width / 2, app.screen.height / 2)
  background.scale.set(1)
  gameScene.addChild(background)

  ant1 = new Sprite(id['Ant1.png'])
  ant1.anchor.set(0.5)
  ant1.x = app.screen.width / 2
  ant1.y = app.screen.height / 2
  ant1.vx = 0
  ant1.vy = 0
  gameScene.addChild(ant1)

  let left = keyboard(37),
    up = keyboard(38),
    right = keyboard(39),
    down = keyboard(40)

  //Up
  up.press = function () {
    ant1.vy = -5
    ant1.vx = 0
  }
  up.release = function () {
    if (!down.isDown && ant1.vx === 0) {
      ant1.vy = 0
    }
  }

  //Left
  left.press = function () {
    ant1.vx = -5
    ant1.vy = 0
    ant1.scale.x = -1
  }
  left.release = function () {
    if (!right.isDown && ant1.vy === 0) {
      ant1.vx = 0
    }
  }

  //Right
  right.press = function () {
    ant1.vx = 5
    ant1.vy = 0
    ant1.scale.x = 1
  }
  right.release = function () {
    if (!left.isDown && ant1.vy === 0) {
      ant1.vx = 0
    }
  }

  //Down
  down.press = function () {
    ant1.vy = 5
    ant1.vx = 0
  }
  down.release = function () {
    if (!up.isDown && ant1.vx === 0) {
      ant1.vy = 0
    }
  }

  state = play

  app.ticker.add((delta) => gameLoop(delta))
}

function gameLoop(delta) {
  //Update the current game state:
  state(delta)
}

function play(delta) {
  ant1.x += ant1.vx
  ant1.y += ant1.vy

  contain(ant1, {
    x: 50,
    y: 40,
    width: gameScene.width - 10,
    height: gameScene.height - 10,
  })
}

function contain(sprite, container) {
  let collision = undefined

  //Left
  if (sprite.x < container.x) {
    sprite.x = container.x
    collision = 'left'
  }

  //Top
  if (sprite.y < container.y) {
    sprite.y = container.y
    collision = 'top'
  }

  //Right
  if (sprite.x + sprite.width > container.width) {
    sprite.x = container.width - sprite.width
    collision = 'right'
  }

  //Bottom
  if (sprite.y + sprite.height > container.height) {
    sprite.y = container.height - sprite.height
    collision = 'bottom'
  }

  //Return the `collision` value
  return collision
}

function keyboard(keyCode) {
  var key = {}
  key.code = keyCode
  key.isDown = false
  key.isUp = true
  key.press = undefined
  key.release = undefined
  //The `downHandler`
  key.downHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press()
      key.isDown = true
      key.isUp = false
    }
    event.preventDefault()
  }

  //The `upHandler`
  key.upHandler = function (event) {
    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release()
      key.isDown = false
      key.isUp = true
    }
    event.preventDefault()
  }

  //Attach event listeners
  window.addEventListener('keydown', key.downHandler.bind(key), false)
  window.addEventListener('keyup', key.upHandler.bind(key), false)
  return key
}
