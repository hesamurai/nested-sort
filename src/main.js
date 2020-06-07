import DataEngine from './data-engine'

class nestedSort {

  /**
   * @constructor
   * @param {{onDrop: function}} actions
   * @param {array} data
   * @param {number} droppingEdge
   * @param {string} el
   * @param {array|string} listClassNames
   * @param {object} [propertyMap={}]
   */
  constructor({
    actions: { onDrop } = {},
    data,
    droppingEdge = 15,
    el,
    listClassNames,
    propertyMap = {}
  } = {}) {
    this.data = data;
    this.selector = el;
    this.sortableList = null;
    this.placeholderUl = null;
    this.placeholderInUse = null;
    this.draggedNode = null;
    this.targetedNode = null;
    this.listClassNames = this.createListClassNamesArray(listClassNames)
    this.propertyMap = propertyMap
    this.actions = {
      onDrop
    }

    this.targetNode = {
      X: null,
      Y: null
    };

    this.distances = {
      droppingEdge,
      droppingEdgeNegative: droppingEdge * -1,
      mouseTo: {
        targetedElTop: undefined
      }
    };

    this.dimensions = {
      targetedEl: {
        H: undefined
      }
    };

    this.cursor = {
      X: null,
      Y: null
    };

    this.classNames = {
      dragged: 'ns-dragged',
      placeholder: 'ns-placeholder',
      targeted: 'ns-targeted',
    }

    this.maybeInitDataDom()
    this.addListAttributes()
    this.initDragAndDrop();
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
    if (!(Array.isArray(this.data) && this.data.length)) return;

    const list = this.getDataEngine().render()
    document.querySelector(this.selector).appendChild(list)
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
    this.getSortableList().classList.add(...this.listClassNames)
  }

  initDragAndDrop() {
    document.addEventListener('dragover', this.dragListener.bind(this), false);

    this.initPlaceholderList();

    this.getSortableList().querySelectorAll('li').forEach(el => {
      el.setAttribute('draggable', 'true');

      el.addEventListener('dragstart', this.onDragStart.bind(this), false);
      el.addEventListener('dragenter', this.onDragEnter.bind(this), false);
      el.addEventListener('dragover', this.onDragOver.bind(this), false);
      el.addEventListener('dragleave', this.onDragLeave.bind(this), false);
      el.addEventListener('dragend', this.onDragEnd.bind(this), false);
      el.addEventListener('drop', this.onDrop.bind(this), false);

      this.addListItemStyles(el)
    });
  }

  getComputedStyleValue(el, prop) {
    return window.getComputedStyle(el, null).getPropertyValue(prop);
  }

  addListItemStyles(li) {
    // let's add a move cursor icon if it does not already have a cursor css property
    const cursor = this.getComputedStyleValue(li, 'cursor');
    if (!cursor || cursor === 'auto') {
      li.style.cursor = 'move';
    }
  }

  onDragStart(e) {
    this.draggedNode = e.target;
    this.draggedNode.classList.add(this.classNames.dragged);
    e.dataTransfer.setData('text', 'Drag started!'); // Hack for Firefox!
  }

  onDragOver(e) {
    e.preventDefault(); // prevent default to allow drop
  }

  onDragEnter(e) {
    if (['LI', 'UL'].includes(e.target.nodeName)) {
      e.preventDefault(); // prevent default to allow drop

      if (this.targetedNode) this.targetedNode.classList.remove(this.classNames.targeted);
      this.targetedNode = e.target;
      e.target.classList.add(this.classNames.targeted);
    }
  }

  onDragLeave(e) {
    e.preventDefault();
    e.target.removeEventListener('dragover', this.onDrop);
    e.target.removeEventListener('drop', this.onDrop);
    e.target.removeEventListener('dragleave', this.onDragLeave);
  }

  onDragEnd(e) {
    e.preventDefault();
    this.draggedNode.classList.remove(this.classNames.dragged);
    this.targetedNode.classList.remove(this.classNames.targeted)
    this.cleanupPlaceholderLists();
  }

  onDrop(e) {
    e.preventDefault();
    e.stopPropagation()
    this.maybeDrop();
    this.cleanupPlaceholderLists();

    if (typeof this.actions.onDrop === 'function') {
      this.actions.onDrop(this.getDataEngine().convertDomToData(this.getSortableList()))
    }
  }

  dragListener(e) {
    this.updateCoordination(e);
    this.managePlaceholderLists(e);
  }

  updateCoordination(e) {
    this.calcMouseCoords(e);
    this.calcMouseToTargetedElDist();
  }

  maybeDrop(e) {
    if (!this.canBeDropped()) {
      return;
    }

    let dropLocation;
    if (this.targetedNode.nodeName === 'LI' && !this.cursorIsIndentedEnough()) {
      dropLocation = 'before';
    } else if (this.targetedNode.nodeName === 'UL') {
      dropLocation = 'inside';
    }

    if (dropLocation) this.dropTheItem(dropLocation, e);
  }

  dropTheItem(place, e) {
    switch (place) {
      case 'before':
        this.targetedNode.parentNode.insertBefore(this.draggedNode, this.targetedNode);
        break;
      case 'after':
        this.insertAfter(this.draggedNode, this.targetedNode);
        break;
      case 'inside':
        this.targetedNode.appendChild(this.draggedNode);
        break;
    }
  }

  calcMouseCoords(e) {
    // we're having the client coords because on the next lines, we use getBoundingClientRect which behaves in the same way
    this.cursor.X = e.clientX;
    this.cursor.Y = e.clientY;
  }

  calcMouseToTargetedElDist() {
    if (!this.targetedNode) {
      return;
    }

    let offset = this.targetedNode.getBoundingClientRect();
    this.targetNode.X = offset.left;
    this.targetNode.Y = offset.top;

    let result = this.targetNode.Y - this.cursor.Y;
    this.distances.mouseTo.targetedElTop = result;
    this.distances.mouseTo.targetedElTopAbs = Math.abs(result);
    this.dimensions.targetedEl.H = this.targetedNode.clientHeight;
    this.distances.mouseTo.targetedElBot = this.distances.mouseTo.targetedElTopAbs - this.dimensions.targetedEl.H;
  }

  areNested(child, parent) {
    return Array.from(parent.querySelectorAll('li')).some(li => li === child)
  }

  cursorIsIndentedEnough() {
    return this.cursor.X - this.targetNode.X > 50;
  }

  mouseIsTooCloseToTop() {
    return this.cursor.Y - this.targetNode.Y < this.distances.droppingEdge;
  }

  insertAfter(newNode, referenceNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
  }

  managePlaceholderLists(e) {

    let actions = this.analysePlaceHolderSituation(e);

    actions.forEach(action => {
      switch (action) {
        case 'add':
          this.cleanupPlaceholderLists();
          this.addPlaceholderList();
          break;
        case 'cleanup':
          this.cleanupPlaceholderLists();
          break;
        default:
          break;
      }
    });
  }

  targetedNodeIsPlaceholder() {
    return this.targetedNode.nodeName === 'UL' && this.targetedNode.classList.contains(this.classNames.placeholder);
  }

  analysePlaceHolderSituation(e) {
    if (!this.targetedNode || this.areNested(this.targetedNode, this.draggedNode)) {
      return [];
    }

    let actions = [];

    if (!this.cursorIsIndentedEnough() || this.mouseIsTooCloseToTop()) {
      if (!this.targetedNodeIsPlaceholder()) {
        actions.push('cleanup');
      }
    } else if (this.targetedNode !== this.draggedNode
      && this.targetedNode.nodeName === 'LI'
      && !this.targetedNode.querySelectorAll('ul').length) {
      actions.push('add');
    }

    return actions;
  }

  addPlaceholderList() {
    const list = this.getPlaceholderList();
    list.style.minHeight = '0';
    this.targetedNode.appendChild(list);
    list.style.transition = 'min-height ease .2s';
    list.style.minHeight = `${this.draggedNode.offsetHeight}px`;
  }

  targetNodeIsIdentified() {
    return !!this.targetedNode;
  }

  canBeDropped() {
    let result = true;

    result &= this.targetNodeIsIdentified() && this.targetedNode !== this.draggedNode;
    result &= this.targetNodeIsIdentified() && !(this.targetedNode.nodeName === 'UL' && this.targetedNode.querySelectorAll('li').length);
    result &= !this.areNested(this.targetedNode, this.draggedNode);

    return result;
  }

  cleanupPlaceholderLists() {
    this.getSortableList().querySelectorAll('ul').forEach(ul => {
      if (!ul.querySelectorAll('li').length) {
        ul.remove();
      } else if (ul.classList.contains(this.classNames.placeholder)) {
        ul.classList.remove(this.classNames.placeholder);
        ul.dataset.id = ul.parentNode.dataset.id
      }
    });
  }

  initPlaceholderList() {
    this.placeholderUl = document.createElement('ul');
    this.placeholderUl.classList.add(this.classNames.placeholder);
  }

  getPlaceholderList() {
    this.placeholderInUse = this.placeholderUl.cloneNode(true);
    return this.placeholderInUse;
  }
}

export default nestedSort;
