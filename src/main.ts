import DataEngine from './data-engine'
import {
  Actions,
  AddNewItemArgs,
  ClassNames,
  ClassNamesList,
  Cursor,
  DataItem,
  Distances,
  DropLocation,
  EventListeners,
  ListElement,
  ListInterface,
  ListTagName,
  MappedDataItem,
  Options,
  PlaceholderMaintenanceActions,
  PropertyMap,
  RenderListItemFn,
  TargetNode,
} from './types'

class NestedSort {
  actions: Actions
  classNames: ClassNames
  cursor: Cursor
  data: Array<DataItem>
  dataEngine: DataEngine
  distances: Partial<Distances>
  draggedNode?: HTMLElement
  initialised: boolean
  listClassNames: Array<string>
  listEventListeners: EventListeners
  listInterface: ListInterface
  listItemClassNames: Array<string>
  mainListClassName: string
  nestingLevels: number
  placeholderList: HTMLElement
  placeholderInUse: HTMLElement
  propertyMap: Partial<PropertyMap>
  renderListItem: RenderListItemFn
  sortableList: ListElement
  targetedNode?: HTMLElement
  targetNode: TargetNode
  wrapper?: Element

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
    renderListItem,
  }: Options) {
    this.renderListItem = renderListItem
    const element = typeof el === 'string' ? document.querySelector(el) as HTMLElement : el
    const elementIsAList = element instanceof HTMLOListElement || element instanceof HTMLUListElement
    this.wrapper = elementIsAList ? undefined : element
    this.sortableList = elementIsAList ? element : null

    this.data = data
    this.listClassNames = this.createListClassNamesArray(listClassNames)
    this.mainListClassName = this.listClassNames[0] || 'nested-sort'
    this.listItemClassNames = this.createListClassNamesArray(listItemClassNames)
    this.propertyMap = propertyMap
    this.actions = {
      onDrop: actions.onDrop,
    }
    this.initialised = false
    this.distances = {
      droppingEdge,
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
    return this.sortableList instanceof HTMLOListElement ? HTMLOListElement : HTMLUListElement
  }

  getDataEngine(): DataEngine {
    if (this.dataEngine) return this.dataEngine
    this.dataEngine = new DataEngine({
      data: this.data,
      propertyMap: this.propertyMap,
      renderListItem: this.renderListItem,
    })
    return this.dataEngine
  }

  createListClassNamesArray(listClassNames: ClassNamesList): Array<string> {
    if (!listClassNames) return []
    return Array.isArray(listClassNames) ? listClassNames : listClassNames.split(' ')
  }

  maybeInitDataDom(): void {
    if (!(Array.isArray(this.data) && this.data.length && this.wrapper)) return

    const list = this.getDataEngine().render()
    this.wrapper.innerHTML = ''
    this.wrapper.appendChild(list)
    this.sortableList = list
  }

  getListTagName(): ListTagName {
    return this.listInterface === HTMLOListElement ? 'ol' : 'ul'
  }

  getSortableList(): ListElement {
    if (this.sortableList instanceof this.listInterface) return this.sortableList
    this.sortableList = this.wrapper?.querySelector(this.getListTagName()) as ListElement
    return this.sortableList
  }

  addListAttributes(): void {
    const list = this.getSortableList()
    if (!list) return

    list.classList.add(...this.listClassNames.concat(this.mainListClassName))
    list.querySelectorAll(this.getListTagName()).forEach(l => {
      l.classList.add(...this.listClassNames)
    })

    list.querySelectorAll('li').forEach(li => {
      li.classList.add(...this.listItemClassNames)
    })
  }

  toggleMainListLifeCycleClassName(enabled = true): void {
    const list = this.getSortableList()
    if (!list) return

    const className = `${this.mainListClassName}--enabled`
    enabled ? list.classList.add(className) : list.classList.remove(className)
  }

  toggleListItemAttributes(enable = true): void {
    this.getSortableList()?.querySelectorAll('li').forEach(el => {
      el.setAttribute('draggable', enable.toString())
    })
  }

  toggleListEventListeners(remove = false): void {
    const list = this.getSortableList()
    if (!list) return

    Object.keys(this.listEventListeners).forEach(event => {
      remove
        ? list.removeEventListener(event, this.listEventListeners[event])
        : list.addEventListener(event, this.listEventListeners[event], false)
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

  removeClassFromEl(className: string, el?: HTMLElement): void {
    if (el && el.classList.contains(className)) {
      el.classList.remove(className)
    }
  }

  canBeTargeted(el: HTMLElement): boolean {
    if (!this.draggedNode || this.draggedNode === el) return false
    if (el.nodeName === 'LI') {
      return !this.nestingThresholdReached(el)
    }
    return el instanceof this.listInterface && el.classList.contains(this.classNames.placeholder)
  }

  onDragStart(e: DragEvent): void {
    this.draggedNode = e.target as HTMLElement
    this.draggedNode.classList.add(this.classNames.dragged)
    e.dataTransfer?.setData('text', '') // Hack for mobile devices
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault() // prevent default to allow drop
    this.updateCoordination(e)
    this.managePlaceholderLists()
  }

  onDragEnter(e: DragEvent): void {
    const target = (e.target as HTMLElement)?.closest(`li[data-id],.${this.classNames.placeholder}`) as HTMLElement
    if (!target || !this.canBeTargeted(target)) return

    this.removeClassFromEl(this.classNames.targeted, this.targetedNode)
    this.targetedNode = target
    this.targetedNode.classList.add(this.classNames.targeted)
  }

  onDragEnd(e: DragEvent): void {
    e.stopPropagation()
    this.removeClassFromEl(this.classNames.dragged, this.draggedNode)
    this.removeClassFromEl(this.classNames.targeted, this.targetedNode)
    this.cleanupPlaceholderLists()
    delete this.draggedNode
    delete this.targetedNode
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

  getDropLocation(): DropLocation|undefined {
    if (this.canBeDropped()) {
      if (this.targetedNode?.nodeName === 'LI') return 'before'
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
        this.targetedNode?.parentNode?.insertBefore(this.draggedNode as Node, this.targetedNode as Node)
        break
      case 'inside':
        this.targetedNode?.appendChild(this.draggedNode as Node)
        break
    }
  }

  calcMouseCoords(e: DragEvent): void {
    // we're having the client coords because on the next lines, we use getBoundingClientRect which behaves in the same way
    this.cursor = {
      X: e.clientX,
      Y: e.clientY,
    }
  }

  calcMouseToTargetedElDist(): void {
    if (!this.targetedNode) {
      return
    }

    const offset = this.targetedNode.getBoundingClientRect()
    this.targetNode = {
      X: offset.left,
      Y: offset.top,
    }

    const result = this.targetNode.Y - this.cursor.Y
    const targetedElTopAbs = Math.abs(result)
    this.distances.mouseTo = {
      targetedElTop: result,
      targetedElTopAbs,
      targetedElBot: targetedElTopAbs - this.targetedNode.clientHeight,
    }
  }

  areNested(child: HTMLElement|undefined, parent: HTMLElement|undefined): boolean {
    return !!child && !!parent && Array.from(parent?.querySelectorAll('li')).some(li => li === child)
  }

  cursorIsIndentedEnough(): boolean {
    return this.cursor.X - this.targetNode.X > 50
  }

  mouseIsTooCloseToTop(): boolean {
    if (!this.distances?.droppingEdge) return false
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

  getNodeDepth(el: HTMLElement): number {
    let depth = 0
    const list = this.getSortableList()

    let selfDepth = 0
    if (this.draggedNode) {
      // the dragged node might be a nested list contributing to the final nesting levels
      const depthUL = this.draggedNode.querySelectorAll('ul').length || 0
      const depthOL = this.draggedNode.querySelectorAll('ol').length || 0
      selfDepth = depthUL > depthOL ? depthUL : depthOL
    }

    while (list !== el?.parentElement) {
      if (el?.parentElement instanceof this.listInterface) depth++
      el = el?.parentElement as HTMLElement
    }

    return depth + selfDepth
  }

  nestingThresholdReached(el: HTMLElement, isPlaceHolderCheck = false): boolean {
    if (this.nestingLevels < 0) return false

    return isPlaceHolderCheck
      ? this.getNodeDepth(el) >= this.nestingLevels
      : this.getNodeDepth(el) > this.nestingLevels
  }

  analysePlaceHolderSituation(): PlaceholderMaintenanceActions {
    if (!this.targetedNode || this.areNested(this.targetedNode, this.draggedNode)) {
      return []
    }

    const actions: PlaceholderMaintenanceActions = []

    if (!this.cursorIsIndentedEnough() || this.mouseIsTooCloseToTop()) {
      if (!this.targetedNodeIsPlaceholder()) {
        actions.push('cleanup')
      }
    } else if (this.targetedNode !== this.draggedNode
      && this.targetedNode.nodeName === 'LI'
      && !this.targetedNode.querySelectorAll(this.getListTagName()).length
      && !this.nestingThresholdReached(this.targetedNode, true)) {
      actions.push('add')
    }

    return actions
  }

  animatePlaceholderList(): void {
    this.placeholderInUse.style.minHeight = '0'
    this.placeholderInUse.style.transition = 'min-height ease .2s'
    this.placeholderInUse.style.minHeight = `${this.draggedNode?.offsetHeight}px`
  }

  addPlaceholderList(): void {
    this.getPlaceholderList()
    this.targetedNode?.appendChild(this.placeholderInUse)
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
    const listsArray = this.getSortableList()?.querySelectorAll(tag) || []
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

  addNewItem({ item, asLastChild = false }: AddNewItemArgs): { data: MappedDataItem[] } {
    const listItem = this.getDataEngine()
      .addNewItem({
        item,
        asLastChild,
      })
    listItem.setAttribute('draggable', String(this.initialised))
    this.getSortableList()?.[asLastChild ? 'append' : 'prepend'](listItem)

    return {
      data: this.getDataEngine().convertDomToData(this.getSortableList()),
    }
  }
}

export default NestedSort
