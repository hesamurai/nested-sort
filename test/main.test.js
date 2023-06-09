import NestedSort from '../src/main'
import DataEngine from '../src/data-engine'
import {
  createEvent,
  initDataDrivenList,
  initServerRenderedList,
} from './utils/dom'
import {
  DYNAMIC_LIST_WRAPPER_ID,
  STATIC_LIST_WRAPPER_ID,
} from './utils/constants'

describe('NestedSort', () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="${DYNAMIC_LIST_WRAPPER_ID}"></div>`
  })

  describe('upon instantiation', () => {
    it('should set default value for mainListClassName property if listClassNames option does not include valid class names', () => {
      const ns = initDataDrivenList({ listClassNames: '' })
      expect(ns.mainListClassName).toBe('nested-sort')
    })

    it('should set the value of mainListClassName property to the first class name passed via listClassNames option', () => {
      const ns = initDataDrivenList({ listClassNames: 'main-class subsidiary-class' })
      expect(ns.mainListClassName).toBe('main-class')
    })

    it('should not invoke the initDragAndDrop method when the init option is falsy', () => {
      const spy = jest.spyOn(NestedSort.prototype, 'initDragAndDrop')
      initDataDrivenList({ init: false })
      expect(spy).not.toHaveBeenCalled()
    })

    it('should invoke the initDragAndDrop method when the init option is true or undefined', () => {
      [undefined, true].forEach(init => {
        const spy = jest.spyOn(NestedSort.prototype, 'initDragAndDrop')
        initDataDrivenList({ init })
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockRestore()
      })
    })

    it('should set the value of the listInterface property', () => {
      const ns = initDataDrivenList()
      expect(ns.listInterface).toBe(HTMLOListElement)
    })

    it('should set the value of the renderListItem property', () => {
      const renderListItem = jest.fn().mockImplementation(() => document.createElement('li'))
      const ns = initDataDrivenList({ renderListItem })
      expect(ns.renderListItem).toBe(renderListItem)
    })

    describe('nestingLevels property assignment', () => {
      it('should be set to -1 if nestingLevels option cannot be converted to an integer', () => {
        [null, undefined, NaN, '', 'foo'].forEach(nestingLevels => {
          const ns = initDataDrivenList({ nestingLevels })
          expect(ns.nestingLevels).toBe(-1)
        })
      })

      it('should be set to the integer equivalent of the nestingLevels option if it is greater than or equal to -1', () => {
        ['-6', -4, '-1', -1, 0, '0', 1, '1', 37, '114'].forEach(nestingLevels => {
          const ns = initDataDrivenList({ nestingLevels })
          expect(ns.nestingLevels).toBe(parseInt(nestingLevels))
        })
      })
    })

    describe('when it is data-driven', () => {
      it('should set the value of dataEngine property with a correct instance of DataEngine', () => {
        const renderListItem = jest.fn().mockImplementation(() => document.createElement('li'))
        const ns = initDataDrivenList({ renderListItem })

        expect(ns.dataEngine).toBeInstanceOf(DataEngine)
        // TODO: not ideal to test the inner working of a dependency but ok for now
        expect(ns.dataEngine.renderListItem).toEqual(renderListItem)
      })
    })
  })

  describe('How it deals with List Class Names', () => {
    describe('when listClassNames option does not include valid class names', () => {
      it('should add the default class name to the main list but not the nested ones', () => {
        [undefined, null, '', []].forEach(listClassNames => {
          const ns = initDataDrivenList({
            data: [
              { id: 1, text: 'Item 1' },
              { id: 11, text: 'Item 1-1', parent: 1 },
              { id: 111, text: 'Item 1-1-1', parent: 11 },
            ],
            init: false,
            listClassNames,
          })

          const list = ns.getSortableList()
          const nestedLists = list.querySelectorAll('ol')

          expect(nestedLists.length).toBe(2)
          expect(Object.values(list.classList)).toEqual(['nested-sort'])
          nestedLists.forEach(l => {
            expect(Object.values(l.classList)).toEqual([])
          })
        })
      })
    })

    describe('when listClassNames option includes valid class names', () => {
      it('should convert the listClassNames prop on the initialisation and assign it to this.listClassNames', () => {
        [
          'class1 class2',
          ['class1', 'class2'],
        ].forEach(listClassNames => {
          const ns = initDataDrivenList({
            listClassNames,
          })

          expect(ns.listClassNames).toEqual([
            'class1',
            'class2',
          ])
        })
      })

      it('should assign the class names to the main list and all the nested ones', () => {
        const listClassNames = ['class1', 'class2']
        const ns = initDataDrivenList({
          data: [
            { id: 1, text: 'Item 1' },
            { id: 11, text: 'Item 1-1', parent: 1 },
            { id: 2, text: 'Item 2' },
            { id: 21, text: 'Item 2-1', parent: 2 },
            { id: 3, text: 'Item 3' },
          ],
          init: false,
          listClassNames,
        })

        const list = ns.getSortableList()
        const nestedLists = list.querySelectorAll('ol')
        const lists = [
          list,
          ...nestedLists
        ]

        expect(nestedLists.length).toBe(2)
        lists.forEach(l => {
          expect(Object.values(l.classList)).toEqual(listClassNames)
        })
      })

      it('should assign the class names to the placeholder list when initialising it', () => {
        const listClassNames = ['class1', 'class2']
        const ns = initDataDrivenList({
          listClassNames,
        })

        ns.initPlaceholderList()

        expect(ns.placeholderList.nodeName).toBe('OL')
        expect(Object.values(ns.placeholderList.classList)).toEqual(expect.arrayContaining(listClassNames))
      })
    })
  })

  describe('How it deals with List Item Class Names', () => {
    it('should convert the listItemClassNames prop on the initialisation and assign it to this.listItemClassNames', () => {
      [
        'class1 class2',
        ['class1', 'class2'],
      ].forEach(listItemClassNames => {
        const ns = initDataDrivenList({
          listItemClassNames,
        })

        expect(ns.listItemClassNames).toEqual([
          'class1',
          'class2',
        ])
      })
    })

    it('should assign the listItemClassNames to all the list items', () => {
      const listItemClassNames = ['class1', 'class2']
      const ns = initDataDrivenList({
        listItemClassNames,
      })

      const list = ns.getSortableList()
      list.querySelectorAll('li').forEach(li => {
        expect(Object.values(li.classList)).toEqual(listItemClassNames)
      })
    })
  })

  describe('Drag and Drop interactions', () => {
    describe('dragstart event', () => {
      it('adds the designated class name to the dragged item', () => {
        initDataDrivenList()
        const item = document.querySelector('[data-id="1"]')
        item.dispatchEvent(
          createEvent('dragstart')
        )

        expect(item.classList).toContain('ns-dragged')
      })

      it('assigns the event target element to the draggedNode property of the instance', () => {
        const ns = initDataDrivenList()
        const item = document.querySelector('[data-id="1"]')
        item.dispatchEvent(
          createEvent('dragstart')
        )

        expect(ns.draggedNode).toEqual(item)
      })

      it('runs the event dataTransfer.setDate method', () => {
        initDataDrivenList()
        const item = document.querySelector('[data-id="1"]')
        const setData = jest.fn()
        item.dispatchEvent(
          createEvent('dragstart', {
            dataTransfer: { setData }
          })
        )

        expect(setData).toHaveBeenCalledTimes(1)
        expect(setData).toHaveBeenCalledWith('text', '')
      })
    })

    describe('dragenter event', () => {
      describe('when it goes through the early return', () => {
        it('should return if canBeTargeted method returns false', () => {
          const spy = jest.spyOn(NestedSort.prototype, 'canBeTargeted').mockReturnValue(false)
          const ns = initDataDrivenList()
          ns.targetedNode = document.querySelector('[data-id="2"]')
          const newTargetedNode = document.querySelector('[data-id="1"]')
          newTargetedNode.classList.add = jest.fn()
          const dragEnterEvent = createEvent('dragenter', {
            preventDefault: jest.fn(),
          })
          newTargetedNode.dispatchEvent(dragEnterEvent)

          expect(ns.targetedNode).toBe(document.querySelector('[data-id="2"]'))
          expect(newTargetedNode.classList.add).not.toHaveBeenCalled()

          spy.mockRestore()
        })
      })

      describe('when event target element can be targeted', () => {
        beforeEach(() => {
          jest.spyOn(NestedSort.prototype, 'canBeTargeted').mockReturnValueOnce(true)
        })

        it('should remove the ns-targeted class from the current targeted item', () => {
          const ns = initDataDrivenList()

          const oldTargetedItem = document.querySelector('li[data-id="1"]')
          oldTargetedItem.classList.add(ns.classNames.targeted)
          ns.targetedNode = oldTargetedItem

          const newTargetedItem = document.querySelector('li[data-id="2"]')
          const dragEnterEvent = createEvent('dragenter')

          newTargetedItem.dispatchEvent(dragEnterEvent)

          expect(oldTargetedItem.classList).not.toContain(ns.classNames.targeted)
        })

        it('should add the ns-targeted class name to the newly targeted item', () => {
          initDataDrivenList()
          const item1 = document.querySelector('li[data-id="1"]')
          const dragEnterEvent = createEvent('dragenter')

          item1.dispatchEvent(dragEnterEvent)
          expect(item1.classList).toContain('ns-targeted')
        })

        it('should set this.targetedNode to the event target element', () => {
          const ns = initDataDrivenList()
          const item1 = document.querySelector('li[data-id="1"]')
          const dragEnterEvent = createEvent('dragenter')

          item1.dispatchEvent(dragEnterEvent)
          expect(ns.targetedNode).toEqual(item1)
        })
      })
    })

    describe('dragover event', () => {
      it('should prevent the default behaviour to allow dropping', () => {
        initDataDrivenList()
        const item = document.querySelector('[data-id="1"]')
        const preventDefault = jest.fn()

        item.dispatchEvent(
          createEvent('dragover', {
            preventDefault,
          })
        )

        expect(preventDefault).toHaveBeenCalledTimes(1)
      })

      it('should fire the updateCoordination method with the event as its argument', () => {
        const spy = jest.spyOn(NestedSort.prototype, 'updateCoordination')
        initDataDrivenList()
        const item = document.querySelector('li[data-id="1"]')
        const event = createEvent('dragover', { bubbles: false })

        item.dispatchEvent(event)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(event)

        spy.mockRestore()
      })

      it('should fire the managePlaceholderLists', () => {
        const spy = jest.spyOn(NestedSort.prototype, 'managePlaceholderLists')
        initDataDrivenList()
        const item = document.querySelector('li[data-id="1"]')
        const event = createEvent('dragover', { bubbles: false })

        item.dispatchEvent(event)

        expect(spy).toHaveBeenCalledTimes(1)

        spy.mockRestore()
      })
    })

    describe('dragend event', () => {
      it('should stop event propagation', () => {
        initDataDrivenList()
        const item = document.querySelector('[data-id="1"]')

        const stopPropagation = jest.fn()
        item.dispatchEvent(
          createEvent('dragend', {
            stopPropagation,
          })
        )

        expect(stopPropagation).toHaveBeenCalledTimes(1)
      })

      it('should call the removeClassFromEl method', () => {
        const ns = initDataDrivenList()
        ns.removeClassFromEl = jest.fn()

        const item = document.querySelector('[data-id="1"]')
        const stopPropagation = jest.fn()
        item.dispatchEvent(
          createEvent('dragend', {
            stopPropagation,
          })
        )

        expect(ns.removeClassFromEl).toHaveBeenNthCalledWith(1, 'ns-dragged', ns.draggedNode)
        expect(ns.removeClassFromEl).toHaveBeenNthCalledWith(2, 'ns-targeted', ns.targetedNode)
      })

      it('should call the cleanupPlaceholderLists method', () => {
        const ns = initDataDrivenList()
        ns.cleanupPlaceholderLists = jest.fn()

        const item = document.querySelector('[data-id="1"]')
        const stopPropagation = jest.fn()
        item.dispatchEvent(
          createEvent('dragend', {
            stopPropagation,
          })
        )

        expect(ns.cleanupPlaceholderLists).toHaveBeenCalledTimes(1)
      })

      it('should set the draggedNode property to null', () => {
        const ns = initDataDrivenList()
        ns.draggedNode = document.querySelector('[data-id="1"]')
        const stopPropagation = jest.fn()

        ns.draggedNode.dispatchEvent(
          createEvent('dragend', {
            stopPropagation,
          })
        )

        expect(ns.draggedNode).toBeUndefined()
      })

      it('should set the targetedNode property to null', () => {
        const ns = initDataDrivenList()
        ns.draggedNode = document.querySelector('[data-id="1"]')
        ns.targetedNode = document.querySelector('[data-id="2"]')
        const stopPropagation = jest.fn()

        ns.draggedNode.dispatchEvent(
          createEvent('dragend', {
            stopPropagation,
          })
        )

        expect(ns.targetedNode).toBeUndefined()
      })
    })

    describe('drop event', () => {
      it('should stop event propagation', () => {
        initDataDrivenList()
        const item = document.querySelector('[data-id="1"]')
        const stopPropagation = jest.fn()
        item.dispatchEvent(
          createEvent('drop', {
            stopPropagation,
          })
        )

        expect(stopPropagation).toHaveBeenCalledTimes(1)
      })

      it('should call the maybeDrop method', () => {
        const ns = initDataDrivenList()
        ns.maybeDrop = jest.fn()

        const item = document.querySelector('[data-id="1"]')
        item.dispatchEvent(
          createEvent('drop', {
            stopPropagation: jest.fn(),
          })
        )

        expect(ns.maybeDrop).toHaveBeenCalledTimes(1)
      })

      it('should call the cleanupPlaceholderLists method', () => {
        const ns = initDataDrivenList()
        ns.cleanupPlaceholderLists = jest.fn()

        const item = document.querySelector('[data-id="1"]')
        item.dispatchEvent(
          createEvent('drop', {
            stopPropagation: jest.fn(),
          })
        )

        expect(ns.cleanupPlaceholderLists).toHaveBeenCalledTimes(1)
      })

      it('should call the onDrop action', () => {
        const onDrop = jest.fn()
        initDataDrivenList({
          actions: {
            onDrop,
          },
        })

        const item = document.querySelector('[data-id="1"]')
        item.dispatchEvent(
          createEvent('drop', {
            stopPropagation: jest.fn(),
          })
        )

        expect(onDrop).toHaveBeenCalledWith([
          { id: '1', order: 1 },
          { id: '2', order: 2 },
        ])
      })
    })
  })

  describe('When the list is server rendered', () => {
    beforeEach(() => {
      initServerRenderedList()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should not call the getDataEngine method (upon instantiating) which resides inside the maybeInitDataDom method which goes through the early return', () => {
      jest.spyOn(NestedSort.prototype, 'getDataEngine').mockImplementation(jest.fn)
      const ns = new NestedSort({
        el: `#${STATIC_LIST_WRAPPER_ID}`,
      })

      expect(ns.getDataEngine).not.toHaveBeenCalled()
    })

    it('should assign the config el property value to this.sortableList if it is an instance of HTMLOListElement', () => {
      const el = document.getElementById(STATIC_LIST_WRAPPER_ID)
      const ns = new NestedSort({
        el,
      })

      expect(ns.sortableList).toEqual(el)
    })
  })

  describe('When the list is data-driven', () => {
    describe('maybeInitDataDom method', () => {
      it('should not create multiple lists inside the list wrapper if Nested Sort is initialised more than once', () => {
        initDataDrivenList()
        const wrapper = document.getElementById(DYNAMIC_LIST_WRAPPER_ID)

        expect(wrapper.getElementsByTagName('ol').length).toBe(1)
      })
    })
  })

  describe('toggleListEventListeners method', () => {
    beforeEach(() => {
      initServerRenderedList()
    })

    it('should add all the event listeners upon initiation', () => {
      const el = document.getElementById(STATIC_LIST_WRAPPER_ID)
      el.addEventListener = jest.fn()
      const ns = new NestedSort({ el })
      const eventsNames = Object.keys(ns.listEventListeners)

      expect(el.addEventListener).toHaveBeenCalledTimes(eventsNames.length)
      eventsNames.forEach((event, i) => {
        expect(el.addEventListener).toHaveBeenNthCalledWith(
          i + 1,
          event,
          ns.listEventListeners[event],
          false
        )
      })
    })

    it('should remove all the event listeners when the remove arg equals true', () => {
      const el = document.getElementById(STATIC_LIST_WRAPPER_ID)
      el.removeEventListener = jest.fn()
      const ns = new NestedSort({ el })
      const eventsNames = Object.keys(ns.listEventListeners)

      ns.toggleListEventListeners(true)

      expect(el.removeEventListener).toHaveBeenCalledTimes(eventsNames.length)
      eventsNames.forEach((event, i) => {
        expect(el.removeEventListener).toHaveBeenNthCalledWith(
          i + 1,
          event,
          ns.listEventListeners[event]
        )
      })
    })
  })

  describe('canBeDropped method', () => {
    it('should return false if targetNodeIsIdentified() returns false', () => {
      const ns = initDataDrivenList()
      ns.targetNodeIsIdentified = () => false
      ns.targetNodeIsBeingDragged = () => false
      ns.targetNodeIsListWithItems = () => false
      ns.areNested = () => false

      expect(ns.canBeDropped()).toBe(false)
    })

    it('should return false if targetNodeIsBeingDragged() returns true', () => {
      const ns = initDataDrivenList()
      ns.targetNodeIsIdentified = () => true
      ns.targetNodeIsBeingDragged = () => true
      ns.targetNodeIsListWithItems = () => false
      ns.areNested = () => false

      expect(ns.canBeDropped()).toBe(false)
    })

    it('should return false if targetNodeIsListWithItems() returns true', () => {
      const ns = initDataDrivenList()
      ns.targetNodeIsIdentified = () => true
      ns.targetNodeIsBeingDragged = () => false
      ns.targetNodeIsListWithItems = () => true
      ns.areNested = () => false

      expect(ns.canBeDropped()).toBe(false)
    })

    it('should return false if areNested() returns true', () => {
      const ns = initDataDrivenList()
      ns.targetNodeIsIdentified = () => true
      ns.targetNodeIsBeingDragged = () => false
      ns.targetNodeIsListWithItems = () => false
      ns.areNested = () => true

      expect(ns.canBeDropped()).toBe(false)
    })

    it('should return true if all the conditions meet', () => {
      const ns = initDataDrivenList()
      ns.targetNodeIsIdentified = () => true // condition 1
      ns.targetNodeIsBeingDragged = () => false // condition 2
      ns.targetNodeIsListWithItems = () => false // condition 3
      ns.areNested = () => false // condition 4

      expect(ns.canBeDropped()).toBe(true)
    })
  })

  describe('getDropLocation method', () => {
    describe('When canBeDropped() returns false', () => {
      it('should return undefined', () => {
        const ns = initDataDrivenList()
        ns.canBeDropped = () => false

        expect(ns.getDropLocation()).toBeUndefined()
      })
    })

    describe('When canBeDropped() returns true', () => {
      beforeEach(() => {
        jest.spyOn(NestedSort.prototype, 'canBeDropped').mockReturnValue(true)
      })

      it('should return `before` if targetedNode is LI', () => {
        const ns = initDataDrivenList()
        ns.targetedNode = document.querySelector('li[data-id="1"]')
        expect(ns.getDropLocation()).toBe('before')
      })

      it('should return `inside` if targetedNode is OL', () => {
        const ns = initDataDrivenList()
        ns.cursorIsIndentedEnough = () => false

        // let's fake the targetedNode to be an OL
        ns.targetedNode = document.createElement('ol')

        expect(ns.getDropLocation()).toBe('inside')
      })
    })
  })

  describe('maybeDrop method', () => {
    it('should not call dropTheItem() if getDropLocation() returns undefined', () => {
      const ns = initDataDrivenList()
      ns.getDropLocation = () => undefined
      ns.dropTheItem = jest.fn()
      ns.maybeDrop()

      expect(ns.dropTheItem).not.toHaveBeenCalled()
    })

    it('should call dropTheItem() with correct arguments if getDropLocation() returns a string', () => {
      const ns = initDataDrivenList()
      const location = 'before'
      ns.getDropLocation = () => location
      ns.dropTheItem = jest.fn()
      ns.maybeDrop()

      expect(ns.dropTheItem).toHaveBeenCalledTimes(1)
      expect(ns.dropTheItem).toHaveBeenCalledWith(location)
    })
  })

  describe('dropTheItem method', () => {
    it('should insert the dragged node before the targeted node', () => {
      const ns = initDataDrivenList()
      ns.draggedNode = document.querySelector('li[data-id="2"]')
      ns.targetedNode = document.querySelector('li[data-id="1"]')
      ns.targetedNode.parentNode.insertBefore = jest.fn()
      ns.dropTheItem('before')

      expect(ns.targetedNode.parentNode.insertBefore).toHaveBeenCalledTimes(1)
      expect(ns.targetedNode.parentNode.insertBefore).toHaveBeenCalledWith(ns.draggedNode, ns.targetedNode)
    })

    it('should insert the dragged node inside the targeted node', () => {
      const ns = initDataDrivenList()
      ns.draggedNode = document.querySelector('li[data-id="2"]')
      ns.targetedNode = document.createElement('ol')
      ns.targetedNode.appendChild = jest.fn()
      ns.dropTheItem('inside')

      expect(ns.targetedNode.appendChild).toHaveBeenCalledTimes(1)
      expect(ns.targetedNode.appendChild).toHaveBeenCalledWith(ns.draggedNode)
    })
  })

  describe('analysePlaceHolderSituation method', () => {
    describe('when it goes through the early return', () => {
      it('should return an empty array when targetedNode property is falsy', () => {
        const ns = initDataDrivenList()
        ns.areNested = jest.fn()
        ns.cursorIsIndentedEnough = jest.fn()
        const actions = ns.analysePlaceHolderSituation()

        expect(actions).toEqual([])
        expect(ns.areNested).not.toHaveBeenCalled()
        expect(ns.cursorIsIndentedEnough).not.toHaveBeenCalled()
      })

      it('should return an empty array when targetedNode property is truthy but areNested returns true', () => {
        const ns = initDataDrivenList()
        ns.areNested = jest.fn().mockReturnValue(true)
        ns.cursorIsIndentedEnough = jest.fn()
        ns.targetedNode = document.querySelector('li[data-id="1"]')
        ns.draggedNode = document.querySelector('li[data-id="2"]')
        const actions = ns.analysePlaceHolderSituation()

        expect(actions).toEqual([])
        expect(ns.areNested).toHaveBeenCalledTimes(1)
        expect(ns.areNested).toHaveBeenCalledWith(ns.targetedNode, ns.draggedNode)
        expect(ns.cursorIsIndentedEnough).not.toHaveBeenCalled()
      })
    })

    describe('when early return is bypassed', () => {
      describe('when cursorIsIndentedEnough() returns false', () => {
        it('should return an empty array when targetedNodeIsPlaceholder() returns true', () => {
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')
          ns.areNested = jest.fn().mockReturnValue(false)

          ns.cursorIsIndentedEnough = jest.fn().mockReturnValue(false)
          ns.targetedNodeIsPlaceholder = jest.fn().mockReturnValue(true)
          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return an array with `cleanup` as the only item when targetedNodeIsPlaceholder() returns false', () => {
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')
          ns.areNested = jest.fn().mockReturnValue(false)

          ns.cursorIsIndentedEnough = jest.fn().mockReturnValue(false)
          ns.targetedNodeIsPlaceholder = jest.fn().mockReturnValue(false)
          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual(['cleanup'])
        })
      })

      describe('when cursorIsIndentedEnough() and mouseIsTooCloseToTop() both return true', () => {
        it('should return an empty array when targetedNodeIsPlaceholder() returns true', () => {
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')
          ns.areNested = jest.fn().mockReturnValue(false)

          ns.cursorIsIndentedEnough = jest.fn().mockReturnValue(true)
          ns.mouseIsTooCloseToTop = jest.fn().mockReturnValue(true)
          ns.targetedNodeIsPlaceholder = jest.fn().mockReturnValue(true)
          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return an array with `cleanup` as the only item when targetedNodeIsPlaceholder() returns false', () => {
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')
          ns.areNested = jest.fn().mockReturnValue(false)

          ns.cursorIsIndentedEnough = jest.fn().mockReturnValue(true)
          ns.mouseIsTooCloseToTop = jest.fn().mockReturnValue(true)
          ns.targetedNodeIsPlaceholder = jest.fn().mockReturnValue(false)
          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual(['cleanup'])
        })
      })

      describe('when cursorIsIndentedEnough() returns true and mouseIsTooCloseToTop() returns false', () => {
        it('should return an empty array if targetedNode is the same as draggedNode', () => {
          jest.spyOn(NestedSort.prototype, 'areNested').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'cursorIsIndentedEnough').mockReturnValue(true)
          jest.spyOn(NestedSort.prototype, 'mouseIsTooCloseToTop').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'nestingThresholdReached').mockReturnValue(false)
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')

          ns.draggedNode = ns.targetedNode

          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return an empty array if targetedNode name is not LI', () => {
          jest.spyOn(NestedSort.prototype, 'areNested').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'cursorIsIndentedEnough').mockReturnValue(true)
          jest.spyOn(NestedSort.prototype, 'mouseIsTooCloseToTop').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'nestingThresholdReached').mockReturnValue(false)
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.createElement('ol')

          ns.draggedNode = document.querySelector('li[data-id="2"]')

          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return an empty array if targetedNode contains an ol element', () => {
          jest.spyOn(NestedSort.prototype, 'areNested').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'cursorIsIndentedEnough').mockReturnValue(true)
          jest.spyOn(NestedSort.prototype, 'mouseIsTooCloseToTop').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'nestingThresholdReached').mockReturnValue(false)
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')

          ns.draggedNode = document.querySelector('li[data-id="2"]')
          ns.targetedNode.appendChild(document.createElement('ol'))

          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return en empty array if nestingThresholdReached() returns true', () => {
          jest.spyOn(NestedSort.prototype, 'areNested').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'cursorIsIndentedEnough').mockReturnValue(true)
          jest.spyOn(NestedSort.prototype, 'mouseIsTooCloseToTop').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'nestingThresholdReached').mockReturnValue(true)
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')

          ns.draggedNode = document.querySelector('li[data-id="2"]')

          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return en array with `add` as its only item when all conditions meet', () => {
          jest.spyOn(NestedSort.prototype, 'areNested').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'cursorIsIndentedEnough').mockReturnValue(true)
          jest.spyOn(NestedSort.prototype, 'mouseIsTooCloseToTop').mockReturnValue(false)
          jest.spyOn(NestedSort.prototype, 'nestingThresholdReached').mockReturnValue(false)
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')

          ns.draggedNode = document.querySelector('li[data-id="2"]')

          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual(['add'])
        })
      })
    })
  })

  describe('managePlaceholderLists method', () => {
    it('should clean up current placeholder and add a new one when analysePlaceHolderSituation() contains `add`', () => {
      const ns = initDataDrivenList()
      ns.analysePlaceHolderSituation = jest.fn().mockReturnValue(['add'])
      ns.cleanupPlaceholderLists = jest.fn()
      ns.addPlaceholderList = jest.fn()

      ns.managePlaceholderLists()

      expect(ns.cleanupPlaceholderLists).toHaveBeenCalledTimes(1)
      expect(ns.addPlaceholderList).toHaveBeenCalledTimes(1)
    })

    it('should clean up current placeholder when analysePlaceHolderSituation() contains `cleanup`', () => {
      const ns = initDataDrivenList()
      ns.analysePlaceHolderSituation = jest.fn().mockReturnValue(['cleanup'])
      ns.cleanupPlaceholderLists = jest.fn()
      ns.addPlaceholderList = jest.fn()

      ns.managePlaceholderLists()

      expect(ns.cleanupPlaceholderLists).toHaveBeenCalledTimes(1)
      expect(ns.addPlaceholderList).not.toHaveBeenCalled()
    })
  })

  describe('addPlaceholderList method', () => {
    it('should append the placeholderInUse property to the targetedNode and call the animatePlaceholderList method', () => {
      const ns = initDataDrivenList()
      ns.targetedNode = document.querySelector('li[data-id="1"]')
      ns.targetedNode.appendChild = jest.fn()
      ns.animatePlaceholderList = jest.fn()

      ns.addPlaceholderList()

      expect(ns.targetedNode.appendChild).toHaveBeenCalledTimes(1)
      expect(ns.targetedNode.appendChild).toHaveBeenCalledWith(ns.placeholderInUse)
      expect(ns.animatePlaceholderList).toHaveBeenCalledTimes(1)
    })
  })

  describe('cleanupPlaceholderLists method', () => {
    it('should remove any ol list which does not have any list items', () => {
      const ns = initDataDrivenList({
        data: [
          {id: 1, text: 'One'},
          {id: 11, text: 'One-One', parent: 1},
          {id: 2, text: 'Two'},
        ],
      })
      const list = document.createElement('ol')
      document.querySelector('li[data-id="11"]').appendChild(list.cloneNode(true))
      document.querySelector('li[data-id="2"]').appendChild(list.cloneNode(true))

      ns.cleanupPlaceholderLists()
      const lists = ns.getSortableList().querySelectorAll('ol')

      expect(lists.length).toBe(1)
    })

    it('should treat a legit placeholder list correctly', () => {
      const ns = initDataDrivenList()
      const placeholderList = document.createElement('ol')
      placeholderList.classList.add(ns.classNames.placeholder)
      placeholderList.classList.add('test-placeholder')
      placeholderList.style.minHeight = '100px'
      document.querySelector('li[data-id="1"]').appendChild(placeholderList)
      placeholderList.appendChild(document.querySelector('li[data-id="2"]'))

      ns.cleanupPlaceholderLists()
      const list = ns.getSortableList().querySelector('ol.test-placeholder')

      expect(list.classList).not.toContain(ns.classNames.placeholder)
      expect(list.style.minHeight).toBe('auto')
      expect(list.dataset.id).toBe('1')
    })
  })

  describe('canBeTargeted method', () => {
    it('should return false if draggedNode is falsy', () => {
      const ns = initDataDrivenList()
      const result = ns.canBeTargeted(document.querySelector('li[data-id="1"]'))

      expect(result).toBe(false)
    })

    it('should return false if draggedNode equals the passed element', () => {
      const ns = initDataDrivenList()
      ns.draggedNode = document.querySelector('li[data-id="1"]')
      const result = ns.canBeTargeted(ns.draggedNode)

      expect(result).toBe(false)
    })

    describe('when the passed element is a list item', () => {
      let ns
      let li
      beforeEach(() => {
        ns = initDataDrivenList()
        ns.draggedNode = document.querySelector('li[data-id="1"]')
        li = document.querySelector('li[data-id="2"]')
      })

      it('should return true if nestingThresholdReached() return false', () => {
        jest.spyOn(ns, 'nestingThresholdReached').mockReturnValue(false)
        expect(ns.canBeTargeted(li)).toBe(true)
      })

      it('should return false if nestingThresholdReached() return true', () => {
        jest.spyOn(ns, 'nestingThresholdReached').mockReturnValue(true)
        expect(ns.canBeTargeted(li)).toBe(false)
      })
    })

    describe('when the passed element is not a list item', () => {
      it('should return true if the passed element is a placeholder list', () => {
        const ns = initDataDrivenList()
        ns.draggedNode = document.querySelector('li[data-id="1"]')
        const placeholderList = document.createElement('ol')
        placeholderList.classList.add(ns.classNames.placeholder)

        expect(ns.canBeTargeted(placeholderList)).toBe(true)
      })

      it('should return false if the passed element is a list but not a placeholder one', () => {
        const ns = initDataDrivenList()
        ns.draggedNode = document.querySelector('li[data-id="1"]')
        const placeholderList = document.createElement('ol')

        expect(ns.canBeTargeted(placeholderList)).toBe(false)
      })

      it('should return false if the passed element is neither a list item nor a placeholder list', () => {
        const ns = initDataDrivenList()
        ns.draggedNode = document.querySelector('li[data-id="1"]')
        const placeholderList = document.createElement('p')
        placeholderList.classList.add(ns.classNames.placeholder)

        expect(ns.canBeTargeted(placeholderList)).toBe(false)
      })
    })
  })

  describe('initDragAndDrop method', () => {
    describe('when drag and drop is already initialised', () => {
      let ns
      beforeEach(() => {
        ns = initDataDrivenList({ init: true })
      })

      it('should go through the early return', () => {
        const spy1 = jest.spyOn(ns, 'toggleListEventListeners')
        const spy2 = jest.spyOn(ns, 'initPlaceholderList')
        const spy3 = jest.spyOn(ns, 'toggleListItemAttributes')

        ns.initDragAndDrop()

        expect(spy1).not.toHaveBeenCalled()
        expect(spy2).not.toHaveBeenCalled()
        expect(spy3).not.toHaveBeenCalled()
      })
    })

    describe('when drag and drop is NOT initialised', () => {
      let ns
      beforeEach(() => {
        ns = initDataDrivenList({ init: false })
      })

      it('should invoke the toggleListEventListeners method with no arguments', () => {
        const spy = jest.spyOn(ns, 'toggleListEventListeners')
        ns.initDragAndDrop()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith()
      })

      it('should invoke the initPlaceholderList method with no arguments', () => {
        const spy = jest.spyOn(ns, 'initPlaceholderList')
        ns.initDragAndDrop()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith()
      })

      it('should invoke the toggleListItemAttributes method with no arguments', () => {
        const spy = jest.spyOn(ns, 'toggleListItemAttributes')
        ns.initDragAndDrop()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith()
      })

      it('should invoke the toggleMainListLifeCycleClassName method with no arguments', () => {
        const spy = jest.spyOn(ns, 'toggleMainListLifeCycleClassName')
        ns.initDragAndDrop()
        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith()
      })

      it('should set the initialised property value to true', () => {
        expect(ns.initialised).toBe(false)
        ns.initDragAndDrop()
        expect(ns.initialised).toBe(true)
      })
    })
  })

  describe('init method', () => {
    it('should invoke the initDragAndDrop', () => {
      const spy = jest.spyOn(NestedSort.prototype, 'initDragAndDrop')
      const ns = initDataDrivenList({ init: false })

      expect(spy).not.toHaveBeenCalled()
      ns.init()
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('destroy method', () => {
    it('should invoke the toggleListEventListeners method with correct arguments', () => {
      const ns = initDataDrivenList()
      const spy = jest.spyOn(ns, 'toggleListEventListeners')

      ns.destroy()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(true)
    })

    it('should invoke the toggleListItemAttributes method with correct arguments', () => {
      const ns = initDataDrivenList()
      const spy = jest.spyOn(ns, 'toggleListItemAttributes')

      ns.destroy()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(false)
    })

    it('should invoke the toggleMainListLifeCycleClassName method with correct arguments', () => {
      const ns = initDataDrivenList()
      const spy = jest.spyOn(ns, 'toggleMainListLifeCycleClassName')

      ns.destroy()

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(false)
    })

    it('should set the initialised property value to false', () => {
      const ns = initDataDrivenList({ init: true })
      ns.destroy()
      expect(ns.initialised).toBe(false)
    })
  })

  describe('toggleListItemAttributes method', () => {
    it('should set the draggable attribute value to true on all the list items when no argument is passed to it', () => {
      const ns = initDataDrivenList({ init: false })
      Array.from(ns.getSortableList().getElementsByTagName('li')).forEach(li => {
        expect(li.getAttribute('draggable')).toBe(null)
      }) // to make sure instantiation has not set the attribute value

      ns.toggleListItemAttributes()

      Array.from(ns.getSortableList().getElementsByTagName('li')).forEach(li => {
        expect(li.getAttribute('draggable')).toBe('true')
      })
    })

    it('should set the draggable attribute value to false on all the list items when the passed argument equals false', () => {
      const ns = initDataDrivenList({ init: true })
      Array.from(ns.getSortableList().getElementsByTagName('li')).forEach(li => {
        expect(li.getAttribute('draggable')).toBe('true')
      }) // to make sure instantiation has set the attribute value to true

      ns.toggleListItemAttributes(false)

      Array.from(ns.getSortableList().getElementsByTagName('li')).forEach(li => {
        expect(li.getAttribute('draggable')).toBe('false')
      })
    })
  })

  describe('toggleMainListLifeCycleClassName method', () => {
    it('should add the modifier class name to the main list if invoked without argument', () => {
      const ns = initDataDrivenList({ init: false })
      const mainList = ns.getSortableList()
      expect(Object.values(mainList.classList)).not.toContain('nested-sort--enabled')
      ns.toggleMainListLifeCycleClassName()
      expect(Object.values(mainList.classList)).toContain('nested-sort--enabled')
    })

    it('should add the modifier class name to the main list if argument equals true', () => {
      const ns = initDataDrivenList({ init: false })
      const mainList = ns.getSortableList()
      expect(Object.values(mainList.classList)).not.toContain('nested-sort--enabled')
      ns.toggleMainListLifeCycleClassName()
      expect(Object.values(mainList.classList)).toContain('nested-sort--enabled')
    })

    it('should remove the modifier class name from the main list if argument equals false', () => {
      const ns = initDataDrivenList({ init: true })
      const mainList = ns.getSortableList()
      expect(Object.values(mainList.classList)).toContain('nested-sort--enabled')
      ns.toggleMainListLifeCycleClassName(false)
      expect(Object.values(mainList.classList)).not.toContain('nested-sort--enabled')
    })
  })

  describe('getNodeDepth method', () => {
    it('should return the correct depth of the targeted element', () => {
      const ns = initDataDrivenList({
        data: [
          {id: 1, text: '1'},
          {id: 11, text: '1-1', parent: 1},
          {id: 111, text: '1-1-1', parent: 11},
          {id: 1111, text: '1-1-1-1', parent: 111},
          {id: 11111, text: '1-1-1-1-1', parent: 1111},
        ],
      });

      [1, 11, 111, 1111, 11111].forEach(id => {
        const node = document.querySelector(`[data-id="${id}"]`)
        const depth = ns.getNodeDepth(node)
        expect(depth).toBe(id.toString().split('').length - 1)
      })
    })
  })

  describe('nestingThresholdReached method', () => {
    it('should return false if nesting levels equals a negative integer', () => {
      const ns = initDataDrivenList({ nestingLevels: -1 })
      const el = document.querySelector('[data-id="1"]')
      const result = ns.nestingThresholdReached(el)

      expect(result).toBe(false)
    })

    it('should return false if getNodeDepth() returns a value less than the nesting levels', () => {
      [
        {nestingLevels: '2', targetedNodeDepth: 1},
        {nestingLevels: '3', targetedNodeDepth: 1},
        {nestingLevels: '3', targetedNodeDepth: 2},
        {nestingLevels: '11', targetedNodeDepth: 10},
      ].forEach(({nestingLevels, targetedNodeDepth}) => {
        const ns = initDataDrivenList({ nestingLevels })
        const spy = jest.spyOn(ns, 'getNodeDepth').mockReturnValue(targetedNodeDepth) // this does the main trick here
        const el = document.querySelector('[data-id="1"]') // this is passed to nestingThresholdReached() for the sake of being there
        const result = ns.nestingThresholdReached(el)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(result).toBe(false)
      })
    })

    it('should return true if getNodeDepth() returns a value greater than the nesting levels', () => {
      [
        {nestingLevels: '1', targetedNodeDepth: 2},
        {nestingLevels: '1', targetedNodeDepth: 3},
        {nestingLevels: '3', targetedNodeDepth: 4},
        {nestingLevels: '11', targetedNodeDepth: 13},
      ].forEach(({nestingLevels, targetedNodeDepth}) => {
        const ns = initDataDrivenList({ nestingLevels })
        const spy = jest.spyOn(ns, 'getNodeDepth').mockReturnValue(targetedNodeDepth) // this does the main trick here
        const el = document.querySelector('[data-id="1"]') // this is passed to nestingThresholdReached() for the sake of being there
        const result = ns.nestingThresholdReached(el)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(result).toBe(true)
      })
    })

    describe('when isPlaceHolderCheck argument equals true', () => {
      it('should return true if getNodeDepth() returns a value equal to the nesting levels', () => {
        const ns = initDataDrivenList({ nestingLevels: '2' })
        const spy = jest.spyOn(ns, 'getNodeDepth').mockReturnValue(2) // this does the main trick here
        const el = document.querySelector('[data-id="1"]') // this is passed to nestingThresholdReached() for the sake of being there
        const result = ns.nestingThresholdReached(el, true)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(result).toBe(true)
      })
    })
  })

  describe('getListInterface method', () => {
    it('should return HTMLOListElement for a data-driven list', () => {
      const ns = initDataDrivenList({
        data: [
          {id: 1, text: 'One'},
        ]
      })
      expect(ns.getListInterface()).toBe(HTMLOListElement)
    })

    describe('when the list is server rendered', () => {
      describe('when the el option is a selector string', () => {
        it('should return HTMLOListElement if the list is an ordered one', () => {
          initServerRenderedList('ol')
          const ns = new NestedSort({
            el: `#${STATIC_LIST_WRAPPER_ID}`,
          })
          expect(ns.getListInterface()).toBe(HTMLOListElement)
        })

        it('should return HTMLUListElement if the list is an unordered one', () => {
          initServerRenderedList('ul')
          const ns = new NestedSort({
            el: `#${STATIC_LIST_WRAPPER_ID}`,
          })
          expect(ns.getListInterface()).toBe(HTMLUListElement)
        })
      })

      describe('when the el option is a DOM node', () => {
        it('should return HTMLOListElement if the list is an ordered one', () => {
          initServerRenderedList('ol')
          const ns = new NestedSort({
            el: document.getElementById(STATIC_LIST_WRAPPER_ID),
          })
          expect(ns.getListInterface()).toBe(HTMLOListElement)
        })

        it('should return HTMLUListElement if the list is an unordered one', () => {
          initServerRenderedList('ul')
          const ns = new NestedSort({
            el: document.getElementById(STATIC_LIST_WRAPPER_ID),
          })
          expect(ns.getListInterface()).toBe(HTMLUListElement)
        })
      })
    })
  })

  describe('getListTagName method', () => {
    it('should return ol if the listInterface property equals HTMLOListElement', () => {
      const ns = initDataDrivenList()
      ns.listInterface = HTMLOListElement
      expect(ns.getListTagName()).toBe('ol')
    })

    it('should return ul if the listInterface property equals anything but HTMLOListElement', () => {
      const ns = initDataDrivenList()
      ns.listInterface = HTMLUListElement
      expect(ns.getListTagName()).toBe('ul')
    })
  })
})
