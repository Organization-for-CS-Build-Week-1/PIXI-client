function runMap() {
  socket.on('mapinfo', (data) => {
    const rooms = data.map.rooms
    socket.on('roomupdate', (data) => {
      const cur_loc = data.player.world_loc
      drawMap(rooms, cur_loc)
    })
  })

  function drawMap(rooms, cur_loc) {
    const Application = PIXI.Application,
      loader = PIXI.Loader.shared,
      container = document.getElementById('piximap'),
      app = new Application({ resizeTo: container }),
      mapContainer = new PIXI.Container()

    app.renderer.autoDensity = true

    container.appendChild(app.view)

    loader.load(setup)

    app.stage.addChild(mapContainer)

    function setup() {
      for (let i = 0; i < rooms.length; i++) {
        const rectangle = new PIXI.Graphics()
        const roomx = rooms[i][0]
        const roomy = rooms[i][1]
        let color = 0x66ccff
        if (roomx === cur_loc[0] && roomy === cur_loc[1]) color = 0xff0000

        rectangle.beginFill(color)
        rectangle.drawRect(0, 0, 10, 10)
        rectangle.endFill()
        rectangle.x = roomx * 11
        rectangle.y = roomy * 11
        mapContainer.addChild(rectangle)
      }
      mapContainer.position.set(
        app.screen.width / 2 - cur_loc[0] * 11,
        app.screen.height / 2 - cur_loc[1] * 11
      )
      mapContainer.scale.y = -1
    }
  }
}
