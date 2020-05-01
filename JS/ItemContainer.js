class ItemContainer {
  constructor({ id, name, weight, score, cb}) {
    this.id = id
    this.name = name
    this.weight = weight
    this.score = score
    this.div = this.createDiv()
    this.div.onclick = cb.bind(this)
  }

  createDiv() {
    const item = document.createElement('div')
    item.className = 'item'

    const imgDiv = document.createElement('div')
    const weightDiv = document.createElement('div')
    const scoreDiv = document.createElement('div')
    imgDiv.className = weightDiv.className = scoreDiv.className = 'third'

    const img = document.createElement('img')
    img.src = `assets/PNG/${this.name}.png`
    img.alt = this.name
    const weight = document.createElement('h4')
    weight.textContent = this.weight
    const score = document.createElement('h4')
    score.textContent = this.score

    imgDiv.append(img)
    weightDiv.append(weight)
    scoreDiv.append(score)
    item.append(imgDiv, weightDiv, scoreDiv)
    return item
  }
}

