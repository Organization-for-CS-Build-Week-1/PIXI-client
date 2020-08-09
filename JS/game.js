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

  let allAnts = {},
    ant1,
    animations,
    gameScene,
    roomItems,
    roomInfo,
    exits,
    style,
    itemContainer,
    storekeeper,
    storeItems

  const CreatePing = () => {
    let current = Date.now()
    let ping = 0
    const updatePing = () => {
      const now = Date.now()
      ping = now - current
      current = now
    }
    const getPing = () => ping
    return { getPing, updatePing }
  }
  const serverPing = CreatePing()
  const clientPing = CreatePing()

  const space = keyboard(32)
  const left = keyboard(65)
  const up = keyboard(87)
  const right = keyboard(68)
  const down = keyboard(83)

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
      if (roomInfo.id !== data.room.id && checkStore.storeModalIfExists) {
        checkStore.storeModalIfExists.closeTheStore()
      }
      roomInfo = data.room
      cur_loc = data.room.world_loc
      itemContainer.temp.destroy()
      itemContainer = { temp: new Container() }
      underLayer.addChild(itemContainer.temp)
      generatePaths()
      drawMap()
      if (data.room.name === 'Ant Store') {
        storeItems = data.room.items
        const storeText = 'PRESS SPACE\nTO BARTER'
        storekeeper = createSpriteAndMouseOver(
          itemContainer.temp,
          id['Store.png'],
          250,
          250,
          storeText
        )
      } else {
        storekeeper = null
        roomItems = data.room.items
        generateItems(roomItems)
      }
    }
  })
  socket.on('movementupdate', (data) => {
    serverPing.updatePing()
    // =========================================================================================== ////
    // =========================================================================================== ////
    //                                                                                             ////
    //                            Hello. Please comment this                                       ////
    //                            out before deploying. TY <3                                      ////
    console.log("SERVER PING:", serverPing.getPing())
    //                                                                                             ////
    //                                                                                             ////
    //                                                                                             ////
    // =========================================================================================== ////
    // =========================================================================================== ////
    updateAnts(data)
  })

  function setup() {
    animations = resources['assets/spritesheet.json'].spritesheet.animations
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

    ant1 = allAnts[socketID] = new AnimatedSprite(animations['Ant'])
    ant1.animationSpeed = 0.3
    ant1.anchor.set(0.5)
    // CHANGE BACK
    ant1.x = app.screen.width / 2 - 100
    ant1.y = app.screen.height / 2 - 100
    ant1.vx = 0
    ant1.vy = 0
    overLayer.addChild(ant1)

    style = new PIXI.TextStyle({
      fontFamily: 'Arial',
      fontSize: 14,
    })

    exits = createPaths()

    function createPaths() {
      const north = new Sprite(id['path.png'])
      north.position.set(app.screen.width / 2 - 20, 0)
      north.height = 35

      const east = new Sprite(id['path.png'])
      east.position.set(app.screen.width, app.screen.height / 2 + 20)
      east.anchor.set(1)
      east.width = 35

      const south = new Sprite(id['path.png'])
      south.position.set(app.screen.width / 2 + 20, app.screen.height)
      south.anchor.set(1)
      south.height = 35

      const west = new Sprite(id['path.png'])
      west.position.set(0, app.screen.height / 2 - 20)
      west.width = 35

      return { north, south, east, west }
    }

    socket.emit('init')
    app.ticker.add(() => play())
  }

  function createAnt(antID) {
    allAnts[antID] = new AnimatedSprite(animations['Ant'])
    allAnts[antID].animationSpeed = 0.3
    allAnts[antID].anchor.set(0.5)
  }

  function updateSingleAnt(antObj, newLoc) {
    antObj.x = newLoc.x
    antObj.y = newLoc.y
    antObj.vx = newLoc.vx
    antObj.vy = newLoc.vy
    if (antObj.vx > 0) antObj.scale.x = 1
    if (antObj.vx < 0) antObj.scale.x = -1
  }

  const removableAnts = {
    /**
     *
     * Store and/or remove an ant from the room.
     *
     * If we're storing an ant for removal, this means:
     *   - The ant is on screen client-side, but
     *   - the server didn't give any movement data.
     *
     *
     * If the ant DOES NOT already exist in this object:
     *   - it is added with a key of it's antID and a value of Date.now()
     *
     * If the ant ALREADY exists in this object:
     *   - we check if it's been stored in this object for longer than 3 pings.
     *   - If it has, then we remove the ant from the screen.
     */
    storeForRemoval: (antID) => {
      if (!removableAnts[antID]) {
        removableAnts[antID] = Date.now()
        return
      }
      if (Date.now() - removableAnts[antID] > serverPing.getPing() * 3) {
        if (allAnts[antID]) {
          overLayer.removeChild(allAnts[antID])
          delete allAnts[antID]
        }
        delete removableAnts[antID]
      }
    },

    /**
     * Removes ant from storage. Ant will no longer be removed from the screen.
     */
    removeFromStorage: (antId) => {
      delete removableAnts[antID]
    },
  }

  function updateAnts(newData) {
    for (antID in allAnts) {
      if (antID !== socketID && !newData[antID]) {
        removableAnts.storeForRemoval(antID)
      } else removableAnts.removeFromStorage(antID)
    }

    for (antID in newData) {
      newAntLoc = newData[antID]

      if (allAnts[antID]) {
        updateSingleAnt(allAnts[antID], newAntLoc)
      } else {
        createAnt(antID)
        updateSingleAnt(allAnts[antID], newAntLoc)
        overLayer.addChild(allAnts[antID])
      }
    }
  }

  function getPlayerVX() {
    let vx = 0
    if (left.isDown) vx -= 3
    if (right.isDown) vx += 3
    return vx
  }

  function getPlayerVY() {
    let vy = 0
    if (up.isDown) vy -= 3
    if (down.isDown) vy += 3
    return vy
  }

  function play() {
    clientPing.updatePing()
    console.log("CLIENT PING:", clientPing.getPing())
    socket.emit('move', { vx: getPlayerVX(), vy: getPlayerVY() })
    for (antID in allAnts) {
      checkMoving(allAnts[antID])
    }
  }

  //ant collision with items
  function interact() {
    if (storekeeper) {
      return checkStore.collisionCheck()
    }
    for (item of roomInfo.items) {
      if (testForAABB(ant1, item[1].sprite)) {
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
    } else if (animatedSprite.stop) animatedSprite.stop()
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

  function keyboard(keyCode) {
    const key = {}
    key.code = keyCode
    key.isDown = false

    //The `downHandler`
    key.downHandler = function (event) {
      if (event.keyCode === key.code) {
        event.preventDefault()
        if (!key.isDown && key.code == 32) interact() // Spacebar interaction
        key.isDown = true
      }
    }

    //The `upHandler`
    key.upHandler = function (event) {
      if (event.keyCode === key.code) {
        event.preventDefault()
        key.isDown = false
      }
    }

    //Attach event listeners
    window.addEventListener('keydown', key.downHandler, false)
    window.addEventListener('keyup', key.upHandler, false)
    return key
  }

  function createSpriteAndMouseOver(PIXIContainer, spriteID, x, y, infoText) {
    const newSprite = new Sprite(spriteID)
    newSprite.anchor.set(0.5)
    newSprite.position.set(x, y)
    newSprite.interactive = true
    newSprite.hitArea = new PIXI.Rectangle(-10, -10, 20, 20)

    const infoBox = new PIXI.Graphics()
    const infoBoxText = new PIXI.Text(infoText, style)

    newSprite.mouseover = (mouseData) => {
      infoBox.lineStyle(2, 0x000000, 1)
      infoBox.beginFill(0xffffff)
      if (x < 390) {
        infoBox.drawRect(x, y, 96, 60)
        infoBoxText.x = x + 14
        infoBoxText.y = y + 14
      } else {
        infoBox.drawRect(x - 96, y - 60, 96, 60)
        infoBoxText.x = x - 82
        infoBoxText.y = y - 46
      }
      infoBox.endFill()

      PIXIContainer.addChild(infoBox, infoBoxText)
    }

    //stop hovering over item
    newSprite.mouseout = (mouseData) => {
      try {
        PIXIContainer.removeChild(infoBox, infoBoxText)
        // Just in case there's an error somehow,
        // This will silently catch it
      } catch (e) {}
    }
    PIXIContainer.addChild(newSprite)
    return newSprite
  }

  function generateItems(roomItems) {
    if (!roomItems || !roomItems.length) return
    for (i = 0; i < roomItems.length; i++) {
      const item = roomItems[i][1]

      const spriteID = id[`${item.name}.png`]
      const x = roomItems[i][0][0] + 32
      const y = roomItems[i][0][1] + 32
      const infoText = `Score: ${item.score}\nWeight: ${item.weight}`

      item.sprite = createSpriteAndMouseOver(
        itemContainer.temp,
        spriteID,
        x,
        y,
        infoText
      )
    }
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

  checkStore = {
    storeModalIfExists: null,
    collisionCheck: () => {
      if (testForAABB(ant1, storekeeper) && !this.storeModalIfExists)
        generateStore()
    },
  }

  // DOM Manipulation helper functions for lazy devs
  const getId = (id) => document.getElementById(id)

  function generateStore() {
    if (checkStore.storeModalIfExists) return

    // Create the store and player inventory views
    const storeInventory = new StoreInventory(
      storeItems.map((item) => item[1]),
      getId('store-inventory-container'),
      getId('store-barter-weight'),
      getId('store-barter-score')
    )
    const playerInventory = new PlayerInventory(
      playerInfo.items,
      getId('player-inventory-container'),
      getId('player-barter-weight'),
      getId('player-barter-score')
    )

    const modal = getId('modal')
    modal.style.display = 'block'
    const closeTheStore = () => {
      checkStore.storeModalIfExists = null
      modal.style.display = 'none'
      storeInventory.deconstructor()
      playerInventory.deconstructor()
    }
    getId('close').onclick = closeTheStore
    getId('exit').onclick = closeTheStore

    checkStore.storeModalIfExists = new Store(
      storeInventory,
      playerInventory,
      playerInfo.weight,
      getId('barter'),
      getId('store-error'),
      closeTheStore
    )
    checkStore.storeModalIfExists.examineBarter()
  }

  function takeItem(id) {
    socket.emit('take', id)
  }
}
