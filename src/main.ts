import DataEngine from './data-engine'
import {
  Actions,
  ClassNames,
  ClassNamesList,
  Cursor,
  DataItem,
  Dimensions,
  Distances,
  DropLocation,
  EventListeners,
  ListElement,
  ListInterface,
  ListTagName,
  Options,
  PlaceholderMaintenanceActions,
  PropertyMap,
  TargetNode,
} from './types'

class NestedSort {
  actions: Actions
  data: Array<DataItem>
  dataEngine: DataEngine
  draggedNode: HTMLElement
  initialised: boolean
  listClassNames: Array<string>
  listItemClassNames: Array<string>
  mainListClassName: string
  placeholderList: HTMLElement
  placeholderInUse: HTMLElement
  propertyMap: Partial<PropertyMap>
  el: HTMLElement
  selector: string
  sortableList: ListElement
  targetedNode: HTMLElement
  targetNode: TargetNode
  distances: Distances
  dimensions: Dimensions
  cursor: Cursor
  classNames: ClassNames
  listEventListeners: EventListeners
  nestingLevels: number
  listInterface: ListInterface

  constructor({
    actions = {},
    data,
    droppingEdge = 15,
    el,
    init = true,
    listClassNames,
    listItemClassNames,
    nestingLevels,
    propertyMap = {},
  }: Options) {
    this.data = data
    this.el = el instanceof HTMLElement ? el : document.querySelector(el)
    this.selector = typeof el === 'string' ? el : undefined
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
      onDrop: actions.onDrop,
    }
    this.initialised = false
    this.targetNode = {
      X: null,
      Y: null,
    }
    this.distances = {
      droppingEdge,
      mouseTo: {
        targetedElTop: undefined,
        targetedElTopAbs: undefined,
        targetedElBot: undefined,
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

  getListInterface(): ListInterface {
    if (Array.isArray(this.data) && this.data.length) return HTMLOListElement

    const el = this.el instanceof HTMLElement
      ? this.el
      : document.querySelector(this.selector)

    return el instanceof HTMLOListElement ? HTMLOListElement : HTMLUListElement
  }

  getDataEngine(): DataEngine {
    if (this.dataEngine instanceof DataEngine) {
      return this.dataEngine
    }
    this.dataEngine = new DataEngine({data: this.data, propertyMap: this.propertyMap})
    return this.dataEngine
  }

  createListClassNamesArray(listClassNames: ClassNamesList): Array<string> {
    if (!listClassNames) return []
    return Array.isArray(listClassNames) ? listClassNames : listClassNames.split(' ')
  }

  maybeInitDataDom(): void {
    if (!(Array.isArray(this.data) && this.data.length)) return

    const wrapper = document.querySelector(this.selector)
    const list = this.getDataEngine().render()
    wrapper.innerHTML = ''
    wrapper.appendChild(list)
  }

  getListTagName(): ListTagName {
    return this.listInterface === HTMLOListElement ? 'ol' : 'ul'
  }

  getSortableList(): ListElement {
    if (this.sortableList instanceof this.listInterface) return this.sortableList

    if (this.el instanceof this.listInterface) {
      this.sortableList = this.el
    } else {
      const list = document.querySelector(this.selector) as HTMLElement
      this.sortableList = list instanceof this.listInterface
        ? list
        : list.querySelector(this.getListTagName())
    }

    return this.sortableList
  }

  addListAttributes(): void {
    const list = this.getSortableList()

    list.classList.add(...this.listClassNames.concat(this.mainListClassName))
    list.querySelectorAll(this.getListTagName()).forEach(l => {
      l.classList.add(...this.listClassNames)
    })

    list.querySelectorAll('li').forEach(li => {
      li.classList.add(...this.listItemClassNames)
    })
  }

  toggleMainListLifeCycleClassName(enabled = true): void {
    const className = `${this.mainListClassName}--enabled`
    const classList = this.getSortableList().classList
    return enabled
      ? classList.add(className)
      : classList.remove(className)
  }

  toggleListItemAttributes(enable = true): void {
    this.getSortableList().querySelectorAll('li').forEach(el => {
      el.setAttribute('draggable', enable.toString())
    })
  }

  toggleListEventListeners(remove = false): void {
    const list = this.getSortableList()
    Object.keys(this.listEventListeners).forEach(event => {
      if (remove) {
        list.removeEventListener(event, this.listEventListeners[event])
      } else {
        list.addEventListener(event, this.listEventListeners[event], false)
      }
    })
  }

  initDragAndDrop(): void {
    if (this.initialised) return

    this.toggleListEventListeners()
    this.initPlaceholderList()
    this.toggleListItemAttributes()
    this.toggleMainListLifeCycleClassName()
    this.initialised = true
  }

  init(): void {
    this.initDragAndDrop()
  }

  destroy(): void {
    this.toggleListEventListeners(true)
    this.toggleListItemAttributes(false)
    this.toggleMainListLifeCycleClassName(false)
    this.initialised = false
  }

  removeClassFromEl(el: HTMLElement, className: string): void {
    if (el && el.classList.contains(className)) {
      el.classList.remove(className)
    }
  }

  canBeTargeted(el: HTMLElement): boolean {
    if (!this.draggedNode || this.draggedNode === el) return false
    return el.nodeName === 'LI' || (el instanceof this.listInterface && el.classList.contains(this.classNames.placeholder))
  }

  onDragStart(e: DragEvent): void {
    this.draggedNode = e.target as HTMLElement
    this.draggedNode.classList.add(this.classNames.dragged)
    e.dataTransfer.setData('text', 'Drag started!') // Hack for Firefox!
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault() // prevent default to allow drop
    this.updateCoordination(e)
    this.managePlaceholderLists()
  }

  onDragEnter(e: DragEvent): void {
    if (!this.canBeTargeted(e.target as HTMLElement)) return

    this.removeClassFromEl(this.targetedNode, this.classNames.targeted)
    this.targetedNode = e.target as HTMLElement
    this.targetedNode.classList.add(this.classNames.targeted)
  }

  onDragEnd(e: DragEvent): void {
    e.stopPropagation()
    this.removeClassFromEl(this.draggedNode, this.classNames.dragged)
    this.removeClassFromEl(this.targetedNode, this.classNames.targeted)
    this.cleanupPlaceholderLists()
    this.draggedNode = null
    this.targetedNode = null
  }

  onDrop(e: DragEvent): void {
    e.stopPropagation()
    this.maybeDrop()
    this.cleanupPlaceholderLists()

    if (typeof this.actions.onDrop === 'function') {
      this.actions.onDrop(this.getDataEngine().convertDomToData(this.getSortableList()))
    }
  }

  updateCoordination(e: DragEvent): void {
    this.calcMouseCoords(e)
    this.calcMouseToTargetedElDist()
  }

  getDropLocation(): DropLocation {
    if (this.canBeDropped()) {
      if (this.targetedNode.nodeName === 'LI' && !this.cursorIsIndentedEnough()) return 'before'
      else if (this.targetedNode instanceof this.listInterface) return 'inside'
    }
  }

  maybeDrop(): void {
    const location = this.getDropLocation()
    if (location) this.dropTheItem(location)
  }

  dropTheItem(place: DropLocation): void {
    switch (place) {
      case 'before':
        this.targetedNode.parentNode.insertBefore(this.draggedNode, this.targetedNode)
        break
      case 'inside':
        this.targetedNode.appendChild(this.draggedNode)
        break
    }
  }

  calcMouseCoords(e: DragEvent): void {
    // we're having the client coords because on the next lines, we use getBoundingClientRect which behaves in the same way
    this.cursor.X = e.clientX
    this.cursor.Y = e.clientY
  }

  calcMouseToTargetedElDist(): void {
    if (!this.targetedNode) {
      return
    }

    const offset = this.targetedNode.getBoundingClientRect()
    this.targetNode.X = offset.left
    this.targetNode.Y = offset.top

    const result = this.targetNode.Y - this.cursor.Y
    this.distances.mouseTo.targetedElTop = result
    this.distances.mouseTo.targetedElTopAbs = Math.abs(result)
    this.dimensions.targetedEl.H = this.targetedNode.clientHeight
    this.distances.mouseTo.targetedElBot = this.distances.mouseTo.targetedElTopAbs - this.dimensions.targetedEl.H
  }

  areNested(child: HTMLElement, parent: HTMLElement): boolean {
    return parent && Array.from(parent.querySelectorAll('li')).some(li => li === child)
  }

  cursorIsIndentedEnough(): boolean {
    return this.cursor.X - this.targetNode.X > 50
  }

  mouseIsTooCloseToTop(): boolean {
    return this.cursor.Y - this.targetNode.Y < this.distances.droppingEdge
  }

  managePlaceholderLists(): void {
    const actions = this.analysePlaceHolderSituation()

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

  targetedNodeIsPlaceholder(): boolean {
    return this.targetedNode instanceof this.listInterface
      && this.targetedNode.classList.contains(this.classNames.placeholder)
  }

  getTargetedNodeDepth(): number {
    let depth = 0
    let el = this.targetedNode
    const list = this.getSortableList()

    while (list !== el.parentElement) {
      if (el.parentElement instanceof this.listInterface) depth++
      el = el.parentElement
    }

    return depth
  }

  nestingThresholdReached(): boolean {
    if (this.nestingLevels < 0) return false
    if (this.nestingLevels === 0) return true

    return this.getTargetedNodeDepth() >= this.nestingLevels
  }

  analysePlaceHolderSituation(): PlaceholderMaintenanceActions {
    if (!this.targetedNode || this.areNested(this.targetedNode, this.draggedNode)) {
      return []
    }

    const actions = []

    if (!this.cursorIsIndentedEnough() || this.mouseIsTooCloseToTop()) {
      if (!this.targetedNodeIsPlaceholder()) {
        actions.push('cleanup')
      }
    } else if (this.targetedNode !== this.draggedNode
      && this.targetedNode.nodeName === 'LI'
      && !this.targetedNode.querySelectorAll(this.getListTagName()).length
      && !this.nestingThresholdReached()) {
      actions.push('add')
    }

    return actions
  }

  animatePlaceholderList(): void {
    this.placeholderInUse.style.minHeight = '0'
    this.placeholderInUse.style.transition = 'min-height ease .2s'
    this.placeholderInUse.style.minHeight = `${this.draggedNode.offsetHeight}px`
  }

  addPlaceholderList(): void {
    this.getPlaceholderList()
    this.targetedNode.appendChild(this.placeholderInUse)
    this.animatePlaceholderList()
  }

  targetNodeIsIdentified(): boolean {
    return !!this.targetedNode
  }

  targetNodeIsBeingDragged(): boolean {
    return this.targetNodeIsIdentified()
      && this.targetedNode === this.draggedNode
  }

  targetNodeIsListWithItems(): boolean {
    return this.targetNodeIsIdentified()
      && this.targetedNode instanceof this.listInterface
      && !!this.targetedNode.querySelectorAll('li').length
  }

  canBeDropped(): boolean {
    return this.targetNodeIsIdentified()
      && !this.targetNodeIsBeingDragged()
      && !this.targetNodeIsListWithItems()
      && !this.areNested(this.targetedNode, this.draggedNode)
  }

  cleanupPlaceholderLists(): void {
    const tag = this.getListTagName()
    const listsArray = this.getSortableList().querySelectorAll(tag)
    Array.from(listsArray).forEach(ul => {
      if (!ul.querySelectorAll('li').length) {
        ul.remove()
      } else if (ul.classList.contains(this.classNames.placeholder)) {
        ul.classList.remove(this.classNames.placeholder)
        ul.style.minHeight = 'auto'
        ul.dataset.id = (ul.parentNode as HTMLElement).dataset.id
      }
    })
  }

  initPlaceholderList(): void {
    this.placeholderList = document.createElement(this.getListTagName())
    this.placeholderList.classList.add(this.classNames.placeholder, ...this.listClassNames)
  }

  getPlaceholderList(): HTMLElement {
    this.placeholderInUse = this.placeholderList.cloneNode(true) as HTMLElement
    return this.placeholderInUse
  }
}

export default NestedSort
