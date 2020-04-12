class nestedSort {

  constructor(opt = {}) {
    this.selector = opt.selector || '';

    this.sortableList = null;
    this.placeholderUl = null;
    this.placeholderInUse = null;
    this.draggedNode = null;
    this.targetedNode = null;

    this.distances = {
      mouseTo: {
        targetedElTop: undefined
      }
    };

    this.dimensions = {
      targetedEl: {
        H: undefined
      }
    };

    this.cursorX = null;
    this.cursorY = null;
    this.targetedNodeX = null;
    this.targetedNodeY = null;

    this.dropEvent = new Event('drop');

    this.selector = opt.el;
    this.distances.droppingEdge = opt.droppingEdge || 15;
    this.distances.droppingEdgeNegative = this.distances.droppingEdge * -1;

    this.initDragAndDrop();
  }

  initDragAndDrop() {

    document.addEventListener('dragover', this.dragListener.bind(this), false);
    // document.addEventListener('touchmove', this.dragListener.bind(this), false);

    this.initPlaceholderList();

    this.sortableList = document.getElementById(this.selector);

    this.sortableList.querySelectorAll('li').forEach(el => {
      el.setAttribute('draggable', 'true');

      el.addEventListener('dragstart', this.onDragStart.bind(this), false);
      // el.addEventListener('touchstart', onDragStart, false);

      el.addEventListener('dragenter', this.onDragEnter.bind(this), false);
      // el.addEventListener('dragexit', removeStyles, false);
      el.addEventListener('dragleave', this.onDragLeave.bind(this), false);
      el.addEventListener('dragend', this.onDragEnd.bind(this), false);
      el.addEventListener('drop', this.onDrop.bind(this), false);
    });
  }

  onDragStart(e) {
    this.draggedNode = e.target;
    this.draggedNode.classList.add('dragged');
    e.dataTransfer.setData('text', 'Drag started!'); // Hack for Firefox!
  }

  onDragEnter(e) {
    e.preventDefault();

    if (['LI', 'UL'].indexOf(e.target.nodeName) > -1) {
      this.targetedNode = e.target;
    }
  }

  dragListener(e) {
    this.updateCoordination(e);
    this.managePlaceholderLists(e);
    this.dropIf(e);
  }

  updateCoordination(e) {
    this.calcMouseCoords(e);
    this.calcMouseToTargetedElDist();
  }

  dropIf(e) {
    if (!this.canBeDropped()) {
      return;
    }

    if (this.targetedNode.nodeName === 'LI' && !this.cursorIsIndentedEnough()) {
      if (
        this.distances.mouseTo.targetedElTop < 0
        && this.distances.mouseTo.targetedElTop > this.distances.droppingEdgeNegative
        // && mouseHasMovedUp()
      ) {
        this.dropTheItem('before');
      } else if (
        this.distances.mouseTo.targetedElBot < 0
        && this.distances.mouseTo.targetedElBot > this.distances.droppingEdgeNegative
        // && mouseHasMovedDown()
      ) {
        this.dropTheItem('after');
      }
    } else if (this.targetedNode.nodeName === 'UL') {
      this.dropTheItem('inside');
    }
  }

  dropTheItem(place) {
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

    this.draggedNode.dispatchEvent(this.dropEvent);
  }

  calcMouseCoords(e) {
    // cursorX = e.screenX;
    // cursorY = e.screenY;

    // we're having the client coords because on the next lines, we use getBoundingClientRect which behaves in the same way
    this.cursorX = e.clientX;
    this.cursorY = e.clientY;
  }

  calcMouseToTargetedElDist() {
    if (!this.targetedNode) {
      return;
    }

    let offset = this.targetedNode.getBoundingClientRect();
    this.targetedNodeX = offset.left;
    this.targetedNodeY = offset.top;

    let result = this.targetedNodeY - this.cursorY;
    this.distances.mouseTo.targetedElTop = result;
    this.distances.mouseTo.targetedElTopAbs = Math.abs(result);
    this.dimensions.targetedEl.H = this.targetedNode.clientHeight;
    this.distances.mouseTo.targetedElBot = this.distances.mouseTo.targetedElTopAbs - this.dimensions.targetedEl.H;
  }

  onDragLeave(e) {
    e.preventDefault();
  }

  onDragEnd(e) {
    e.preventDefault();
    this.draggedNode.classList.remove('dragged');
    this.cleanupPlaceholderLists();
  }

  areNested(child, parent) {
    let isChild = false;
    parent.querySelectorAll('li').forEach(li => {
      if (li === child) {
        isChild = true;
      }
    });
    return isChild;
  }

  cursorIsIndentedEnough() {
    return this.cursorX - this.targetedNodeX > 50;
  }

  mouseHasMovedUp() {
    return this.draggedNode.getBoundingClientRect().top > this.cursorY;
  }

  mouseHasMovedDown() {
    return !this.mouseHasMovedUp();
  }

  mouseIsTooCloseToTop() {
    return this.cursorY - this.targetedNodeY < this.distances.droppingEdge;
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
          return;
          break;
      }
    });
  }

  targetedNodeIsPlaceholder() {
    return this.targetedNode.nodeName === 'UL' && this.targetedNode.classList.contains('placeholder');
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
    this.targetedNode.appendChild(this.getPlaceholderList());
  }

  canBeDropped() {
    let result = true;

    result &= !!this.targetedNode && this.targetedNode !== this.draggedNode;
    result &= !(this.targetedNode.nodeName === 'UL' && this.targetedNode.querySelectorAll('li').length);
    result &= !this.areNested(this.targetedNode, this.draggedNode);

    return result;
  }

  cleanupPlaceholderLists() {
    this.sortableList.querySelectorAll('ul').forEach(ul => {
      if (!ul.querySelectorAll('li').length) {
        ul.remove();
      } else if (ul.classList.contains('placeholder')) {
        ul.classList.remove('placeholder');
      }
    });
  }

  initPlaceholderList() {
    this.placeholderUl = document.createElement('ul');
    this.placeholderUl.classList.add("placeholder");
  }

  getPlaceholderList() {
    this.placeholderInUse = this.placeholderUl.cloneNode(true);
    return this.placeholderInUse;
  }

  onDrop() {
    this.cleanupPlaceholderLists();
  }
}

export default nestedSort;
