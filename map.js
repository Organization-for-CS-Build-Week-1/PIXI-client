// socket.on('init', (data) => {
//   console.log(JSON.stringify(data.you))
// })

const data = {
  map: {
    rooms: [
      [5, 0],
      [6, 0],
      [7, 0],
      [8, 0],
      [9, 0],
      [10, 0],
      [11, 0],
      [12, 0],
      [13, 0],
      [14, 0],
      [15, 0],
      [16, 0],
      [17, 0],
      [18, 0],
      [5, 1],
      [7, 1],
      [8, 1],
      [11, 1],
      [12, 1],
      [13, 1],
      [14, 1],
      [18, 1],
      [5, 2],
      [6, 2],
      [7, 2],
      [8, 2],
      [11, 2],
      [12, 2],
      [13, 2],
      [14, 2],
      [15, 2],
      [16, 2],
      [17, 2],
      [18, 2],
      [19, 2],
      [6, 3],
      [7, 3],
      [8, 3],
      [9, 3],
      [10, 3],
      [11, 3],
      [12, 3],
      [13, 3],
      [14, 3],
      [15, 3],
      [16, 3],
      [17, 3],
      [18, 3],
      [19, 3],
      [6, 4],
      [7, 4],
      [8, 4],
      [9, 4],
      [10, 4],
      [11, 4],
      [12, 4],
      [13, 4],
      [14, 4],
      [15, 4],
      [16, 4],
      [17, 4],
      [18, 4],
      [19, 4],
      [11, 5],
      [12, 5],
      [13, 5],
      [14, 5],
      [15, 5],
      [16, 5],
      [11, 6],
      [12, 6],
      [13, 6],
      [16, 6],
      [20, 6],
      [21, 6],
      [11, 7],
      [12, 7],
      [16, 7],
      [20, 7],
      [21, 7],
      [23, 7],
      [24, 7],
      [11, 8],
      [12, 8],
      [13, 8],
      [14, 8],
      [15, 8],
      [16, 8],
      [17, 8],
      [18, 8],
      [19, 8],
      [20, 8],
      [21, 8],
      [22, 8],
      [23, 8],
      [24, 8],
      [8, 9],
      [9, 9],
      [10, 9],
      [11, 9],
      [12, 9],
      [14, 9],
      [15, 9],
      [16, 9],
      [20, 9],
      [21, 9],
      [23, 9],
      [24, 9],
      [8, 10],
      [9, 10],
      [10, 10],
      [11, 10],
      [12, 10],
      [13, 10],
      [14, 10],
      [15, 10],
      [20, 10],
      [21, 10],
      [22, 10],
      [23, 10],
      [24, 10],
      [10, 11],
      [11, 11],
      [12, 11],
      [13, 11],
      [24, 11],
      [10, 12],
      [11, 12],
      [12, 12],
      [13, 12],
      [14, 12],
      [18, 12],
      [19, 12],
      [24, 12],
      [10, 13],
      [11, 13],
      [12, 13],
      [13, 13],
      [14, 13],
      [18, 13],
      [19, 13],
      [24, 13],
      [17, 14],
      [18, 14],
      [19, 14],
      [20, 14],
      [21, 14],
      [22, 14],
      [23, 14],
      [24, 14],
    ],
  },
  you: {
    id: 3,
    username: 'apples',
    world_loc: [7, 0],
    weight: 0,
    highscore: 0,
    items: {},
  },
}

function runMap() {
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
    const youx = data.you.world_loc[0]
    const youy = data.you.world_loc[1]
    for (let i = 0; i < data.map.rooms.length; i++) {
      const rectangle = new PIXI.Graphics()
      const roomx = data.map.rooms[i][0]
      const roomy = data.map.rooms[i][1]
      let color = 0x66ccff
      if (roomx === youx && roomy === youy) color = 0xff0000

      rectangle.beginFill(color)
      rectangle.drawRect(0, 0, 10, 10)
      rectangle.endFill()
      rectangle.x = roomx * 11
      rectangle.y = roomy * 11
      mapContainer.addChild(rectangle)
    }
    mapContainer.position.set(
      app.screen.width / 2 - youx * 11,
      app.screen.height / 2 - youy * 11
    )
    mapContainer.scale.y = -1
  }
}
