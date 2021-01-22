import DataEngine from './data-engine'

class NestedSort {
  /**
   * @constructor
   * @param {object} [actions={}]
   * @param {array} [data]
   * @param {number} [droppingEdge=15]
   * @param {string|HTMLElement} el
   * @param {boolean} [init=true]
   * @param {array|string} [listClassNames]
   * @param {array|string} [listItemClassNames]
   * @param {number|string} [nestingLevels]
   * @param {object} [propertyMap={}]
   */
  constructor({
    actions: { onDrop } = {},
    data,
    droppingEdge = 15,
    el,
    init = true,
    listClassNames,
    listItemClassNames,
    nestingLevels,
    propertyMap = {},
  }) {
    this.data = data
    this.selector = el
    this.sortableList = null
    this.placeholderList = null
    this.placeholderInUse = null
    this.draggedNode = null
    this.targetedNode = null
    this.listClassNames = this.createListClassNamesArray(listClassNames)
    this.mainListClassName = this.listClassNames[0] || 'nested-sort'
    this.listItemClassNames = this.createListClassNamesArray(listItemClassNames)
    this.propertyMap = propertyMap
    this.actions = {
      onDrop,
    }
    this.initialised = false
    this.targetNode = {
      X: null,
      Y: null,
    }
    this.distances = {
      droppingEdge,
      droppingEdgeNegative: droppingEdge * -1,
      mouseTo: {
        targetedElTop: undefined,
      },
    }
    this.dimensions = {
      targetedEl: {
        H: undefined,
      },
    }
    this.cursor = {
      X: null,
      Y: null,
    }
    this.classNames = {
      dragged: 'ns-dragged',
      placeholder: 'ns-placeholder',
      targeted: 'ns-targeted',
    }
    this.listEventListeners = {
      dragover: this.onDragOver.bind(this),
      dragstart: this.onDragStart.bind(this),
      dragenter: this.onDragEnter.bind(this),
      dragend: this.onDragEnd.bind(this),
      drop: this.onDrop.bind(this),
    }
    const intNestingLevels = parseInt(nestingLevels)
    this.nestingLevels = isNaN(intNestingLevels) ? -1 : intNestingLevels // values less than 0 mean infinite levels of nesting
    this.listInterface = this.getListInterface()

    this.maybeInitDataDom()
    this.addListAttributes()
    if (init) this.initDragAndDrop()
  }

  getListInterface() {
    if (Array.isArray(this.data) && this.data.length) return HTMLOListElement

    const el = this.selector instanceof HTMLElement
      ? this.selector
      : document.querySelector(this.selector)

    return el instanceof HTMLOListElement ? HTMLOListElement : HTMLUListElement
  }

  getDataEngine() {
    if (this.dataEngine instanceof DataEngine) {
      return this.dataEngine
    }
    this.dataEngine = new DataEngine({data: this.data, propertyMap: this.propertyMap})
    return this.dataEngine
  }

  createListClassNamesArray(listClassNames) {
    if (!listClassNames) return []
    return Array.isArray(listClassNames) ? listClassNames : listClassNames.split(' ')
  }

  maybeInitDataDom() {
    if (!(Array.isArray(this.data) && this.data.length)) return

    const wrapper = document.querySelector(this.selector)
    const list = this.getDataEngine().render()
    wrapper.innerHTML = ''
    wrapper.appendChild(list)
  }

  getSortableList() {
    if (this.sortableList instanceof HTMLUListElement) return this.sortableList

    if (this.selector instanceof HTMLUListElement) {
      this.sortableList = this.selector
    } else {
      const list = document.querySelector(this.selector)
      this.sortableList = list.nodeName === 'UL' ? list : list.querySelector('ul')
    }

    return this.sortableList
  }

  addListAttributes() {
    const list = this.getSortableList()

    list.classList.add(...this.listClassNames.concat(this.mainListClassName))
    list.querySelectorAll('ul').forEach(ul => {
      ul.classList.add(...this.listClassNames)
    })

    list.querySelectorAll('li').forEach(li => {
      li.classList.add(...this.listItemClassNames)
    })
  }

  toggleMainListLifeCycleClassName(enabled = true) {
    const className = `${this.mainListClassName}--enabled`
    const classList = this.getSortableList().classList
    return enabled
      ? classList.add(className)
      : classList.remove(className)
  }

  toggleListItemAttributes(enable = true) {
    this.getSortableList().querySelectorAll('li').forEach(el => {
      el.setAttribute('draggable', enable)
    })
  }

  toggleListEventListeners(remove = false) {
    const list = this.getSortableList()
    Object.keys(this.listEventListeners).forEach(event => {
      if (remove) {
        list.removeEventListener(event, this.listEventListeners[event])
      } else {
        list.addEventListener(event, this.listEventListeners[event], false)
      }
    })
  }

  initDragAndDrop() {
    if (this.initialised) return

    this.toggleListEventListeners()
    this.initPlaceholderList()
    this.toggleListItemAttributes()
    this.toggleMainListLifeCycleClassName()
    this.initialised = true
  }

  init() {
    this.initDragAndDrop()
  }

  destroy() {
    this.toggleListEventListeners(true)
    this.toggleListItemAttributes(false)
    this.toggleMainListLifeCycleClassName(false)
    this.initialised = false
  }

  removeClassFromEl(el, className) {
    if (el && el.classList.contains(className)) {
      el.classList.remove(className)
    }
  }

  canBeTargeted(el) {
    if (!this.draggedNode || this.draggedNode === el) return false
    return el.nodeName === 'LI' || (el.nodeName === 'UL' && el.classList.contains(this.classNames.placeholder))
  }

  onDragStart(e) {
    this.draggedNode = e.target
    this.draggedNode.classList.add(this.classNames.dragged)
    e.dataTransfer.setData('text', 'Drag started!') // Hack for Firefox!
  }

  onDragOver(e) {
    e.preventDefault() // prevent default to allow drop
    this.updateCoordination(e)
    this.managePlaceholderLists(e)
  }

  onDragEnter(e) {
    if (!this.canBeTargeted(e.target)) return

    this.removeClassFromEl(this.targetedNode, this.classNames.targeted)
    this.targetedNode = e.target
    this.targetedNode.classList.add(this.classNames.targeted)
  }

  onDragEnd(e) {
    e.stopPropagation()
    this.removeClassFromEl(this.draggedNode, this.classNames.dragged)
    this.removeClassFromEl(this.targetedNode, this.classNames.targeted)
    this.cleanupPlaceholderLists()
    this.draggedNode = null
    this.targetedNode = null
  }

  onDrop(e) {
    e.stopPropagation()
    this.maybeDrop()
    this.cleanupPlaceholderLists()

    if (typeof this.actions.onDrop === 'function') {
      this.actions.onDrop(this.getDataEngine().convertDomToData(this.getSortableList()))
    }
  }

  updateCoordination(e) {
    this.calcMouseCoords(e)
    this.calcMouseToTargetedElDist()
  }

  getDropLocation() {
    if (this.canBeDropped()) {
      if (this.targetedNode.nodeName === 'LI' && !this.cursorIsIndentedEnough()) return 'before'
      else if (this.targetedNode.nodeName === 'UL') return 'inside'
    }
  }

  maybeDrop(e) {
    const location = this.getDropLocation()
    if (location) this.dropTheItem(location, e)
  }

  dropTheItem(place) {
    switch (place) {
      case 'before':
        this.targetedNode.parentNode.insertBefore(this.draggedNode, this.targetedNode)
        break
      case 'inside':
        this.targetedNode.appendChild(this.draggedNode)
        break
    }
  }

  calcMouseCoords(e) {
    // we're having the client coords because on the next lines, we use getBoundingClientRect which behaves in the same way
    this.cursor.X = e.clientX
    this.cursor.Y = e.clientY
  }

  calcMouseToTargetedElDist() {
    if (!this.targetedNode) {
      return
    }

    let offset = this.targetedNode.getBoundingClientRect()
    this.targetNode.X = offset.left
    this.targetNode.Y = offset.top

    let result = this.targetNode.Y - this.cursor.Y
    this.distances.mouseTo.targetedElTop = result
    this.distances.mouseTo.targetedElTopAbs = Math.abs(result)
    this.dimensions.targetedEl.H = this.targetedNode.clientHeight
    this.distances.mouseTo.targetedElBot = this.distances.mouseTo.targetedElTopAbs - this.dimensions.targetedEl.H
  }

  areNested(child, parent) {
    return parent && Array.from(parent.querySelectorAll('li')).some(li => li === child)
  }

  cursorIsIndentedEnough() {
    return this.cursor.X - this.targetNode.X > 50
  }

  mouseIsTooCloseToTop() {
    return this.cursor.Y - this.targetNode.Y < this.distances.droppingEdge
  }

  managePlaceholderLists(e) {

    let actions = this.analysePlaceHolderSituation(e)

    actions.forEach(action => {
      switch (action) {
        case 'add':
          this.cleanupPlaceholderLists()
          this.addPlaceholderList()
          break
        case 'cleanup':
          this.cleanupPlaceholderLists()
          break
      }
    })
  }

  targetedNodeIsPlaceholder() {
    return this.targetedNode.nodeName === 'UL' && this.targetedNode.classList.contains(this.classNames.placeholder)
  }

  getTargetedNodeDepth() {
    let depth = 0
    let el = this.targetedNode
    const list = this.getSortableList()

    while (list !== el.parentElement) {
      if (el.parentElement.nodeName === 'UL') depth++
      el = el.parentElement
    }

    return depth
  }

  nestingThresholdReached() {
    if (this.nestingLevels < 0) return false
    if (this.nestingLevels === 0) return true

    return this.getTargetedNodeDepth() >= this.nestingLevels
  }

  analysePlaceHolderSituation() {
    if (!this.targetedNode || this.areNested(this.targetedNode, this.draggedNode)) {
      return []
    }

    let actions = []

    if (!this.cursorIsIndentedEnough() || this.mouseIsTooCloseToTop()) {
      if (!this.targetedNodeIsPlaceholder()) {
        actions.push('cleanup')
      }
    } else if (this.targetedNode !== this.draggedNode
      && this.targetedNode.nodeName === 'LI'
      && !this.targetedNode.querySelectorAll('ul').length
      && !this.nestingThresholdReached()) {
      actions.push('add')
    }

    return actions
  }

  animatePlaceholderList() {
    this.placeholderInUse.style.minHeight = '0'
    this.placeholderInUse.style.transition = 'min-height ease .2s'
    this.placeholderInUse.style.minHeight = `${this.draggedNode.offsetHeight}px`
  }

  addPlaceholderList() {
    this.getPlaceholderList()
    this.targetedNode.appendChild(this.placeholderInUse)
    this.animatePlaceholderList()
  }

  targetNodeIsIdentified() {
    return !!this.targetedNode
  }

  targetNodeIsBeingDragged() {
    return this.targetNodeIsIdentified()
      && this.targetedNode === this.draggedNode
  }

  targetNodeIsListWithItems() {
    return this.targetNodeIsIdentified()
      && this.targetedNode.nodeName === 'UL'
      && this.targetedNode.querySelectorAll('li').length
  }

  canBeDropped() {
    return this.targetNodeIsIdentified()
      && !this.targetNodeIsBeingDragged()
      && !this.targetNodeIsListWithItems()
      && !this.areNested(this.targetedNode, this.draggedNode)
  }

  cleanupPlaceholderLists() {
    this.getSortableList().querySelectorAll('ul').forEach(ul => {
      if (!ul.querySelectorAll('li').length) {
        ul.remove()
      } else if (ul.classList.contains(this.classNames.placeholder)) {
        ul.classList.remove(this.classNames.placeholder)
        ul.style.minHeight = 'auto'
        ul.dataset.id = ul.parentNode.dataset.id
      }
    })
  }

  initPlaceholderList() {
    this.placeholderList = document.createElement('ul')
    this.placeholderList.classList.add(this.classNames.placeholder, ...this.listClassNames)
  }

  getPlaceholderList() {
    this.placeholderInUse = this.placeholderList.cloneNode(true)
    return this.placeholderInUse
  }
}

export default NestedSort
