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

  let state, ant1, gameScene, path, nextRoom, roomInfo, style
  
  const roomInfoInitState = {
    direction: [],
    items: [],
    name: 'base',
    id: 0,
    description: 'base',
    world_loc: []
  }
  roomInfo = roomInfoInitState
  
  socket.on('roomupdate', data => {
    console.log(data)
    if (data.room) {
      generateItems(data.room.items)
      roomInfo = data.room
    }
  })

  function setup() {
    nextRoom = false
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
    // gameScene.addChild(path)

    ant1 = new AnimatedSprite(animations['Ant'])
    ant1.animationSpeed = 0.3
    ant1.anchor.set(0.5)
    ant1.x = app.screen.width / 2
    ant1.y = app.screen.height / 2
    ant1.vx = 0
    ant1.vy = 0
    gameScene.addChild(ant1)

    style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
    })

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
    console.log('test')
    socket.emit('init')
    app.ticker.add((delta) => gameLoop(delta))
  }

  function gameLoop(delta) {
    //Update the current game state:
    state(delta)
  }

  function checkAnt() {
    if (nextRoom) {
      ant1.x = app.screen.width / 2
      ant1.y = app.screen.height / 2
      nextRoom = false
    }
  }

  function play(delta) {
    ant1.x += ant1.vx
    ant1.y += ant1.vy

    checkAnt()
    //generatePaths()

    //if scaled up multiply values by same, variable would be good for that.
    contain(ant1, {
      x: 50,
      y: 40,
      width: gameScene.width - 10,
      height: gameScene.height - 10,
    })
    if (testForAABB(ant1, path)) {
      nextRoom = true
      socket.emit('move', 'e')
    }

    // itemCollision(ant1, roomItems)
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
      //animatedSprite.play()
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

  function generateItems(roomItems) {
    if (!roomItems || !roomItems.length) return
    for (i = 0; i < roomItems.length; i++) {
      const item = roomItems[i][1]
      const x = roomItems[i][0][0] + 32
      const y = roomItems[i][0][1] + 32

      //console.log("Item:", item)
      //console.log("Item id", item.id)
      item['sprite'] = new Sprite(id[`${item.name}.png`])
      item['sprite'].anchor.set(0.5)
      item['sprite'].position.set(x, y)
      item['sprite'].interactive = true
      item['sprite'].cursor = 'pointer'
      item['sprite'].hitArea = new PIXI.Rectangle(-10, -10, 20, 20)

      //setup infoBox elements
      item[`${item.id}_infoBox`] = new PIXI.Graphics() //change to using item id when using real data
      item[`${item.id}_infoBoxText`] = new PIXI.Text(
        `Score: ${item.score}\nWeight: ${item.weight}`,
        style
      )
      item[`${item.id}_infoBoxText`].x = x + 14
      item[`${item.id}_infoBoxText`].y = y + 14

      //hovering over item
      item['sprite'].mouseover = (mouseData) => {
        item[`${item.id}_infoBox`].lineStyle(2, 0x000000, 1)
        item[`${item.id}_infoBox`].beginFill(0xffffff)
        item[`${item.id}_infoBox`].drawRect(x, y, 96, 60)
        item[`${item.id}_infoBox`].endFill()

        gameScene.addChild(
          item[`${item.id}_infoBox`],
          item[`${item.id}_infoBoxText`]
        )
      }

      //stop hovering over item
      item['sprite'].mouseout = (mouseData) =>
        gameScene.removeChild(
          item[`${item.id}_infoBox`],
          item[`${item.id}_infoBoxText`]
        )

      //click on an item
      item['sprite'].on('pointerdown', () =>
        console.log(`clicked on ${item.name}`)
      )

      gameScene.addChild(item['sprite'])
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
