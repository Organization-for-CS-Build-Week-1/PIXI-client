function runGame() {
  const Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = loader.resources,
    Container = PIXI.Container,
    Sprite = PIXI.Sprite,
    AnimatedSprite = PIXI.AnimatedSprite,
    container = document.getElementById('container'),
    app = new Application({ resizeTo: container })

  app.renderer.autoDensity = true

  container.appendChild(app.view)

  loader.add('assets/spritesheet.json').load(setup)

  let state, ant1, gameScene, room, path, roomItems

  function setup() {
    let animations = resources['assets/spritesheet.json'].spritesheet.animations
    id = resources['assets/spritesheet.json'].textures

    gameScene = new Container()
    app.stage.addChild(gameScene)

    background = new Sprite(id['room-background.png'])
    background.anchor.set(0.5)
    background.position.set(app.screen.width / 2, app.screen.height / 2)
    background.scale.set(1)
    gameScene.addChild(background)

    path = new Sprite(id['path.png'])
    path.anchor.set(1)
    path.position.set(app.screen.width, app.screen.height / 2)
    gameScene.addChild(path)

    ant1 = new AnimatedSprite(animations['Ant'])
    ant1.animationSpeed = 0.3
    ant1.anchor.set(0.5)
    ant1.x = app.screen.width / 2
    ant1.y = app.screen.height / 2
    ant1.vx = 0
    ant1.vy = 0
    gameScene.addChild(ant1)

    roomItems = [
      {
        name: 'stick',
        value: 10,
        weight: 5,
        location: { x: 50, y: 50 },
      },
      {
        name: 'gem',
        value: 30,
        weight: 10,
        location: { x: 200, y: 200 },
      },
    ]

    roomItems.length && generateItems()

    let left = keyboard(37),
      up = keyboard(38),
      right = keyboard(39),
      down = keyboard(40)

    //Up
    up.press = function () {
      ant1.vy = -3
      checkMoving(ant1)
    }
    up.release = function () {
      if (down.isDown) ant1.vy = 3
      else ant1.vy = 0
      checkMoving(ant1)
    }

    //Left
    left.press = function () {
      ant1.vx = -3
      ant1.scale.x = -1
      checkMoving(ant1)
    }
    left.release = function () {
      if (right.isDown) ant1.vx = 3
      else ant1.vx = 0
      checkMoving(ant1)
    }

    //Right
    right.press = function () {
      ant1.vx = 3
      ant1.scale.x = 1
      checkMoving(ant1)
    }
    right.release = function () {
      if (left.isDown) ant1.vx = -3
      else ant1.vx = 0
      checkMoving(ant1)
    }

    //Down
    down.press = function () {
      ant1.vy = 3
      checkMoving(ant1)
    }
    down.release = function () {
      if (up.isDown) ant1.vy = -3
      else ant1.vy = 0
      checkMoving(ant1)
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

    //if scaled up multiply values by same, variable would be good for that.
    contain(ant1, {
      x: 50,
      y: 40,
      width: gameScene.width - 10,
      height: gameScene.height - 10,
    })
    if (testForAABB(ant1, path)) {
      console.log('Next room!')
    }

    itemCollision(ant1, roomItems)
  }

  //ant collision with items
  function itemCollision(player, items) {
    if (!items.length) return
    else {
      items.forEach((item) => {
        if (testForAABB(player, item.sprite)) {
          console.log('ITEM!')
        }
      })
    }
  }

  //check if an animatedSprite is moving
  function checkMoving(animatedSprite) {
    if (animatedSprite.vx || (animatedSprite.vy && animatedSprite.play)) {
      animatedSprite.play()
    } else animatedSprite.stop()
  }

  // classic AABB collision test
  function testForAABB(object1, object2) {
    const bounds1 = object1.getBounds()
    const bounds2 = object2.getBounds()

    return (
      bounds1.x < bounds2.x + bounds2.width &&
      bounds1.x + bounds2.width > bounds2.x &&
      bounds1.y < bounds2.y + bounds2.height &&
      bounds1.y + bounds2.height > bounds2.y
    )
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

  function generateItems() {
    for (i = 0; i < roomItems.length; i++) {
      // console.log(roomItems)
      if (roomItems[i].name === 'stick') {
        addItemSprite(i, 'Stick')
      }
      if (roomItems[i].name === 'gem') {
        addItemSprite(i, 'Gem')
      }
      if (roomItems[i].name === 'trash') {
        addItemSprite(i, 'Trash')
      }
      if (roomItems[i].name === 'hammer') {
        addItemSprite(i, 'Hammer')
      }
      function addItemSprite(i, item) {
        roomItems[i]['sprite'] = new Sprite(id[`${item}.png`])
        roomItems[i]['sprite'].anchor.set(0.5)
        roomItems[i]['sprite'].position.set(
          roomItems[i].location.x,
          roomItems[i].location.y
        )
        roomItems[i]['sprite'].interactive = true
        roomItems[i]['sprite'].cursor = 'pointer'

        //hover to see item information
        roomItems[i][`${item}${i + 1}_infoBox`] = new PIXI.Graphics() //change to using item id when using real data
        roomItems[i]['sprite'].hitArea = new PIXI.Rectangle(-10, -10, 20, 20)
        roomItems[i]['sprite'].mouseover = (mouseData) => {
          roomItems[i][`${item}${i + 1}_infoBox`].beginFill(0x66ccff)
          roomItems[i][`${item}${i + 1}_infoBox`].drawRect(
            roomItems[i].location.x,
            roomItems[i].location.y,
            80,
            80
          )
          roomItems[i][`${item}${i + 1}_infoBox`].endFill()
          gameScene.addChild(roomItems[i][`${item}${i + 1}_infoBox`])
        }
        roomItems[i]['sprite'].mouseout = (mouseData) =>
          gameScene.removeChild(roomItems[i][`${item}${i + 1}_infoBox`])

        gameScene.addChild(roomItems[i]['sprite'])
      }
    }
  }

  function generatePaths() {
    for (let i = 0; i < roomInfo.direction.length; i++) {
      const direction = roomInfo.direction[i]
      if (direction === 'n') {
        north = new Sprite(id['path.png'])
        north.position.set(app.screen.width / 2, 0)
        gameScene.addChild(north)
      }
      if (direction === 'e') {
        east = new Sprite(id['path.png'])
        east.position.set(app.screen.width, app.screen.height / 2)
        east.anchor.set(1)
        gameScene.addChild(east)
      }
      if (direction === 's') {
        south = new Sprite(id['path.png'])
        south.position.set(app.screen.width / 2, app.screen.height)
        gameScene.addChild(south)
      }
      if (direction === 'w') {
        west = new Sprite(id['path.png'])
        west.position.set(0, app.screen.height / 2)
        gameScene.addChild(west)
      }
    }
  }
}
