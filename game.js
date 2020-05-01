function runGame() {
  const Application = PIXI.Application,
    loader = PIXI.Loader.shared,
    resources = loader.resources,
    Container = PIXI.Container,
    Sprite = PIXI.Sprite,
    AnimatedSprite = PIXI.AnimatedSprite,
    container = document.getElementById('container'),
    app = new Application({ resizeTo: container, interactive: true })

  const underLayer = new PIXI.Container()
  app.stage.addChild(underLayer)

  const overLayer = new PIXI.Container()
  app.stage.addChild(overLayer)

  app.renderer.autoDensity = true

  container.appendChild(app.view)

  loader.add('assets/spritesheet.json').load(setup)

  let ant1,
    gameScene,
    roomItems,
    roomInfo,
    exits,
    style,
    itemContainer,
    storekeeper,
    storeItems,
    buyItem,
    sellItems

  let space = keyboard(32)

  const roomInfoInitState = {
    direction: [],
    items: [],
    name: 'base',
    id: 0,
    description: 'base',
    world_loc: [],
  }
  roomInfo = roomInfoInitState

  socket.on('roomupdate', (data) => {
    if (data.room) {
      roomInfo = data.room
      cur_loc = data.room.world_loc
      itemContainer.temp.destroy()
      itemContainer = { temp: new Container() }
      underLayer.addChild(itemContainer.temp)
      generatePaths()
      drawMap()
      if (data.room.name === 'Ant Store') {
        storeItems = data.room.items
        itemContainer.temp.addChild(storekeeper)
      } else {
        roomItems = data.room.items
        generateItems(roomItems)
      }
    }
    console.log(data)

  })

  socket.on('take', (data) => {
    console.log(data)
  })
  socket.on('full', (error) => {
    console.error(error)
  })
  socket.on('barter', (data) => console.log(data))
  socket.on('barterError', console.error)

  function setup() {
    let animations = resources['assets/spritesheet.json'].spritesheet.animations
    id = resources['assets/spritesheet.json'].textures

    gameScene = new Container()
    itemContainer = { temp: new Container() }
    underLayer.addChild(gameScene)
    underLayer.addChild(itemContainer.temp)

    background = new Sprite(id['room-background.png'])
    background.anchor.set(0.5)
    background.position.set(app.screen.width / 2, app.screen.height / 2)
    background.scale.set(1)
    gameScene.addChild(background)

    ant1 = new AnimatedSprite(animations['Ant'])
    ant1.animationSpeed = 0.3
    ant1.anchor.set(0.5)
    // CHANGE BACK
    ant1.x = app.screen.width / 2 - 100
    ant1.y = app.screen.height / 2 - 100
    ant1.vx = 0
    ant1.vy = 0
    overLayer.addChild(ant1)

    storekeeper = new Sprite(id['Store.png'])
    storekeeper.x = app.screen.width / 2
    storekeeper.y = app.screen.height / 2
    storekeeper.anchor.set(0.5)

    style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
    })

    exits = {
      north: createPath('n'),
      south: createPath('s'),
      east: createPath('e'),
      west: createPath('w'),
    }

    function createPath(direction) {
      if (direction === 'n') {
        const north = new Sprite(id['path.png'])
        north.position.set(app.screen.width / 2 - 20, 0)
        north.height = 35
        return north
      }
      if (direction === 'e') {
        const east = new Sprite(id['path.png'])
        east.position.set(app.screen.width, app.screen.height / 2 + 20)
        east.anchor.set(1)
        east.width = 35
        return east
      }
      if (direction === 's') {
        const south = new Sprite(id['path.png'])
        south.position.set(app.screen.width / 2 + 20, app.screen.height)
        south.anchor.set(1)
        south.height = 35
        return south
      }
      if (direction === 'w') {
        const west = new Sprite(id['path.png'])
        west.position.set(0, app.screen.height / 2 - 20)
        west.width = 35
        return west
      }
    }

    let left = keyboard(65),
      up = keyboard(87),
      right = keyboard(68),
      down = keyboard(83)

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

    socket.emit('init')
    app.ticker.add(() => play())
  }

  //Space
  space.press = () => itemCollision(ant1, roomInfo.items)

  function play() {
    ant1.x += ant1.vx
    ant1.y += ant1.vy

    checkPaths()
    contain(ant1, {
      x: 50,
      y: 40,
      width: gameScene.width - 10,
      height: gameScene.height - 10,
    })
    if (roomInfo.name === 'Ant Store') {
      generateStore()
    }
  }

  //ant collision with items
  function itemCollision(player, items) {
    for (item of items) {
      if (testForAABB(player, item[1].sprite)) {
        takeItem(item[1].id)
        gameScene.removeChild(
          item[1][`${item[1].id}_infoBox`],
          item[1][`${item[1].id}_infoBoxText`]
        )
        return
      }
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
    if (!object1 || !object2) return
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

      item['sprite'].hitArea = new PIXI.Rectangle(-10, -10, 20, 20)

      //setup infoBox elements
      item[`${item.id}_infoBox`] = new PIXI.Graphics() //change to using item id when using real data
      item[`${item.id}_infoBoxText`] = new PIXI.Text(
        `Score: ${item.score}\nWeight: ${item.weight}`,
        style
      )

      //hovering over item
      item['sprite'].mouseover = (mouseData) => {
        item[`${item.id}_infoBox`].lineStyle(2, 0x000000, 1)
        item[`${item.id}_infoBox`].beginFill(0xffffff)
        if (x < 390) {
          item[`${item.id}_infoBox`].drawRect(x, y, 96, 60)
          item[`${item.id}_infoBoxText`].x = x + 14
          item[`${item.id}_infoBoxText`].y = y + 14
        } else {
          item[`${item.id}_infoBox`].drawRect(x - 96, y - 60, 96, 60)
          item[`${item.id}_infoBoxText`].x = x - 82
          item[`${item.id}_infoBoxText`].y = y - 46
        }
        item[`${item.id}_infoBox`].endFill()

        itemContainer.temp.addChild(
          item[`${item.id}_infoBox`],
          item[`${item.id}_infoBoxText`]
        )
      }

      //stop hovering over item
      item['sprite'].mouseout = (mouseData) => {
        try {
          itemContainer.temp.removeChild(
            item[`${item.id}_infoBox`],
            item[`${item.id}_infoBoxText`]
          )
          // Just in case there's an error somehow,
          // This will silently catch it
        } catch (e) {}
      }
      itemContainer.temp.addChild(item['sprite'])
    }
    console.log(itemContainer.temp)
  }

  function generatePaths() {
    if (!roomInfo) return
    const dir_string = roomInfo.direction.join('')
    if (dir_string.includes('n')) {
      gameScene.addChild(exits.north)
    } else {
      gameScene.removeChild(exits.north)
    }
    if (dir_string.includes('e')) {
      gameScene.addChild(exits.east)
    } else {
      gameScene.removeChild(exits.east)
    }
    if (dir_string.includes('s')) {
      gameScene.addChild(exits.south)
    } else {
      gameScene.removeChild(exits.south)
    }
    if (dir_string.includes('w')) {
      gameScene.addChild(exits.west)
    } else {
      gameScene.removeChild(exits.west)
    }
  }

  function checkPaths() {
    if (!roomInfo) return
    const dir_string = roomInfo.direction.join('')
    if (dir_string.includes('n') && testForAABB(ant1, exits.north)) {
      ant1.y = app.screen.height - 60
      socket.emit('move', 'n')
    }
    if (dir_string.includes('e') && testForAABB(ant1, exits.east)) {
      ant1.x = 60
      socket.emit('move', 'e')
    }
    if (dir_string.includes('s') && testForAABB(ant1, exits.south)) {
      ant1.y = 60
      socket.emit('move', 's')
    }
    if (dir_string.includes('w') && testForAABB(ant1, exits.west)) {
      ant1.x = app.screen.width - 60
      socket.emit('move', 'w')
    }
  }
  // DOM Manipulation helper functions for lazy devs
  const create = (el) => document.createElement(el),
    getId = (id) => document.getElementById(id),
    text = (el, textToAdd) => (el.textContent = textToAdd),
    append = (el, parentEl) => parentEl.appendChild(el),
    addClass = (el, aClass) => el.classList.add(aClass)

  function generateStore() {
    if (!roomInfo) return

    if (getId('item-elements')) return

    if (testForAABB(ant1, storekeeper)) {
      ant1.position.set(app.screen.width / 2 - 100, app.screen.height / 2 - 100)

      const storeContents = getId('store-contents'),
        itemElements = create('div'),
        store = getId('store'),
        close = getId('close')

      close.onclick = () => {
        store.style.display = 'none'
        itemElements.remove()
        sellItems = []
      }
      store.style.display = 'block'
      itemElements.setAttribute('id', 'item-elements')

      for (let i = 0; i < storeItems.length; i++) {
        const item = create('div'),
          name = create('p'),
          score = create('p'),
          weight = create('p')

        item.onclick = () => {
          console.log(storeItems[i])
          buyItem = storeItems[i][1]
          itemElements.remove()
          inventoryScreen()
        }
        addClass(item, 'item-link')
        text(name, `${storeItems[i][1].name}`)
        text(score, `${storeItems[i][1].score}`)
        text(weight, `${storeItems[i][1].weight}`)

        append(name, item)
        append(score, item)
        append(weight, item)
        append(item, itemElements)
      }
      append(itemElements, storeContents)
    }
  }

  function inventoryScreen() {
    const storeContents = getId('store-contents'),
      itemElements = create('div'),
      close = getId('close')

    close.onclick = () => {
      store.style.display = 'none'
      itemElements.remove()
      sellItems = []
    }
    sellItems = []
    itemElements.setAttribute('id', 'item-elements')
    if (playerItemsForSale.length > 0) {
      for (let i = 0; i < playerItemsForSale.length; i++) {
        const item = create('div'),
          name = create('p'),
          score = create('p'),
          weight = create('p')

        item.onclick = () => {
          sellItems.push(playerItemsForSale[i])
          item.remove()
        }
        addClass(item, 'item-link')
        text(name, `${playerItemsForSale[i].name}`)
        text(score, `${playerItemsForSale[i].score}`)
        text(weight, `${playerItemsForSale[i].weight}`)

        append(name, item)
        append(score, item)
        append(weight, item)
        append(item, itemElements)
      }
    } else {
      const emptyMessage = create('p')
      text(emptyMessage, 'You have nothing to sell')
      append(emptyMessage, itemElements)
    }
    const next = create('button')
    text(next, 'Review')
    addClass(next, 'game-button')
    next.onclick = () => {
      reviewScreen()
      itemElements.remove()
    }
    append(next, itemElements)
    append(itemElements, storeContents)
  }

  function reviewScreen() {
    const storeContents = getId('store-contents'),
      itemElements = create('div'),
      close = getId('close')

    close.onclick = () => {
      store.style.display = 'none'
      itemElements.remove()
      sellItems = []
    }

    itemElements.setAttribute('id', 'item-elements')
    const itemToBuy = create('div'),
      name = create('p'),
      score = create('p'),
      weight = create('p')

    addClass(itemToBuy, 'item-to-buy')
    text(name, `${buyItem.name}`)
    text(score, `${buyItem.score}`)
    text(weight, `${buyItem.weight}`)

    append(name, itemToBuy)
    append(score, itemToBuy)
    append(weight, itemToBuy)
    append(itemToBuy, itemElements)

    if (sellItems.length > 0) {
      for (let i = 0; i < sellItems.length; i++) {
        const item = create('div'),
          name = create('p'),
          score = create('p'),
          weight = create('p')

        item.onclick = () => {
          sellItems = sellItems.filter(
            (rmItem) => rmItem !== playerItemsForSale[i]
          )
          item.remove()
        }
        addClass(item, 'item-link')
        text(name, `${sellItems[i].name}`)
        text(score, `${sellItems[i].score}`)
        text(weight, `${sellItems[i].weight}`)

        append(name, item)
        append(score, item)
        append(weight, item)
        append(item, itemElements)
      }
    } else {
      const emptyMessage = create('p')
      text(emptyMessage, 'You are not trading anything.')
      append(emptyMessage, itemElements)
    }
    const submit = create('button')
    text(submit, 'Barter!')
    addClass(submit, 'game-button')
    const sellIds = sellItems.map((item) => item.id)
    const buyId = buyItem.id
    submit.onclick = () => {
      socket.emit('barter', {
        player_item_ids: sellIds,
        store_item_id: buyId,
      })
      store.style.display = 'none'
      itemElements.remove()
      sellItems = []
    }
    append(submit, itemElements)
    append(itemElements, storeContents)
  }

  function takeItem(id) {
    socket.emit('take', id)
  }
}
