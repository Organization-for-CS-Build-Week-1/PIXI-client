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
  ant1.position.set(app.screen.width / 2, app.screen.height / 2)
  gameScene.addChild(ant1)
}
