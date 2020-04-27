const Application = PIXI.Application,
  loader = PIXI.Loader.shared,
  resources = loader.resources,
  Container = PIXI.Container,
  Sprite = PIXI.Sprite,
  app = new Application({
    width: 500,
    height: 500,
    antialiasing: true,
    transparent: false,
    resolution: 1,
  }),
  container = document.getElementById('container')

container.appendChild(app.view)

loader.add('assets/spritesheet.json').load(setup)

let state, ant1, gameScene, room

function setup() {
  id = resources['assets/spritesheet.json'].textures

  gameScene = new Container()
  app.stage.addChild(gameScene)

  background = new Sprite(id['room-background.png'])
  gameScene.addChild(background)

  ant1 = new Sprite(id['Ant1.png'])
  gameScene.addChild(ant1)
}
