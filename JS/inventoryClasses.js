class ItemContainer {
  constructor({ id, name, weight, score }, cb = () => {}) {
    this.id = id
    this.name = name
    this.weight = weight
    this.score = score
    this.div = ItemContainer.createDiv(this, name, weight, score)
    this.div.onclick = cb.bind(this)
  }

  static createDiv(itemClass, name, weightNum, scoreNum) {
    const item = document.createElement('div')
    item.className = 'item'

    const imgDiv = document.createElement('div')
    const weightDiv = document.createElement('div')
    const scoreDiv = document.createElement('div')
    imgDiv.className = weightDiv.className = scoreDiv.className = 'third'

    const img = document.createElement('img')
    img.src = `assets/PNG/${name}.png`
    img.alt = name
    const weight = document.createElement('h4')
    weight.textContent = weightNum
    const score = document.createElement('h4')
    score.textContent = scoreNum

    imgDiv.append(img)
    weightDiv.append(weight)
    scoreDiv.append(score)
    item.append(imgDiv, weightDiv, scoreDiv)
    return item
  }
}

class StoreItemContainer extends ItemContainer {
  constructor({ id, name, weight, score }, parent) {
    super({ id, name, weight, score })
    // Store reference to the parent container
    this.parent = parent
    // Click on the div, call the parent's toggleClick function
    this.div.onclick = () => this.parent.toggleClick(this)
  }
}

class PlayerInventory {
  constructor(allItems, itemsContainer, weightContainer, scoreContainer) {
    this.items = itemsContainer
    this.weight = weightContainer
    this.score = scoreContainer
    this.allItems = allItems.map((item) => new StoreItemContainer(item, this))
    this.allItems.forEach((item) => this.items.append(item.div))
    this.selectedItems = []
  }

  toggleClick(item) {
    const indexIfExists = this.selectedItems.findIndex(
      (itemInList) => itemInList.id === item.id
    )

    if (indexIfExists === -1) {
      this.selectedItems.push(item)
      item.div.classList.add('selected')
    } else {
      this.selectedItems = this.selectedItems.filter(
        (itemInList) => itemInList.id !== item.id
      )
      item.div.classList.remove('selected')
    }

    this.updateTotals()
  }

  updateTotals() {
    const { weight, score } = this.selectedItems.reduce(
      (prev, curr) => ({
        weight: prev.weight + curr.weight,
        score: prev.score + curr.score,
      }),
      { weight: 0, score: 0 }
    )

    this.weight.textContent = weight
    this.score.textContent = score
  }
}

class StoreInventory extends PlayerInventory {
  constructor(allItems, itemsContainer, weightContainer, scoreContainer) {
    super(allItems, itemsContainer, weightContainer, scoreContainer)
  }

  toggleClick(item) {
    const selectedItem = this.selectedItems[0]

    if (!selectedItem) {
      // No item currently selected?
      // Then, select our item
      this.selectedItems[0] = item
      item.div.classList.add('selected')
    } else if (selectedItem.id !== item.id) {
      // If there is a selected item and it's not the same
      // as the one we clicked, swap them
      selectedItem.div.classList.remove('selected')
      this.selectedItems[0] = item
      item.div.classList.add('selected')
    } else if (selectedItem.id !== item.id) {
      // If there is a selected item and it IS the same
      // as the item we clicked, unclick it
      this.selectedItems[0] = null
      item.div.classList.remove('selected')
    }

    this.updateTotals()
  }
}
