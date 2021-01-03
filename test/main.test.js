import NestedSort from '../src/main'
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

  describe('upon initiation', () => {
    describe('list items attributes', () => {
      it('should add the draggable attribute to all the list items', () => {
        const ns = initDataDrivenList()
        Array.from(ns.getSortableList().getElementsByTagName('li')).forEach(li => {
          expect(li.getAttribute('draggable')).toBe('true')
        })
      })
    })
  })

  describe('How it deals with List Class Names', () => {
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
        listClassNames,
      })

      const list = ns.getSortableList()
      const nestedLists = list.querySelectorAll('ul')
      const lists = [
        list,
        ...nestedLists
      ]

      expect(nestedLists.length).toBe(2)
      lists.forEach(ul => {
        expect(Object.values(ul.classList)).toEqual(listClassNames)
      })
    })

    it('should assign the class names to the placeholder list when initialising it', () => {
      const listClassNames = ['class1', 'class2']
      const ns = initDataDrivenList({
        listClassNames,
      })

      ns.initPlaceholderList()

      expect(ns.placeholderUl.nodeName).toBe('UL')
      expect(Object.values(ns.placeholderUl.classList)).toEqual(expect.arrayContaining(listClassNames))
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

      it('should fire the managePlaceholderLists method with the event as its argument', () => {
        const spy = jest.spyOn(NestedSort.prototype, 'managePlaceholderLists')
        initDataDrivenList()
        const item = document.querySelector('li[data-id="1"]')
        const event = createEvent('dragover', { bubbles: false })

        item.dispatchEvent(event)

        expect(spy).toHaveBeenCalledTimes(1)
        expect(spy).toHaveBeenCalledWith(event)

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

        expect(ns.removeClassFromEl).toHaveBeenNthCalledWith(1, ns.draggedNode, 'ns-dragged')
        expect(ns.removeClassFromEl).toHaveBeenNthCalledWith(2, ns.targetedNode, 'ns-targeted')
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

        expect(ns.draggedNode).toBeNull()
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

        expect(ns.targetedNode).toBeNull()
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

    it('should assign the config el property value to this.sortableList if it is an instance of HTMLUListElement', () => {
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
        initDataDrivenList()
        const wrapper = document.getElementById(DYNAMIC_LIST_WRAPPER_ID)

        expect(wrapper.getElementsByTagName('ul').length).toBe(1)
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
      it('should return undefined if targetedNode is LI and cursorIsIndentedEnough() returns true', () => {
        const ns = initDataDrivenList()
        ns.canBeDropped = () => true
        ns.cursorIsIndentedEnough = () => true
        ns.targetedNode = document.querySelector('li[data-id="1"]')

        expect(ns.targetedNode).toBeTruthy() // just to stay on the safe side
        expect(ns.getDropLocation()).toBeUndefined()
      })

      it('should return `before` if targetedNode is LI and cursorIsIndentedEnough() returns false', () => {
        const ns = initDataDrivenList()
        ns.canBeDropped = () => true
        ns.cursorIsIndentedEnough = () => false
        ns.targetedNode = document.querySelector('li[data-id="1"]')

        expect(ns.targetedNode).toBeTruthy() // just to stay on the safe side
        expect(ns.getDropLocation()).toBe('before')
      })

      it('should return `inside` if targetedNode is UL', () => {
        const ns = initDataDrivenList()
        ns.canBeDropped = () => true
        ns.cursorIsIndentedEnough = () => false

        // let's fake the targetedNode to be a UL
        ns.targetedNode = document.createElement('ul')

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
      const event = { foo: 'bar' }
      ns.maybeDrop(event)

      expect(ns.dropTheItem).toHaveBeenCalledTimes(1)
      expect(ns.dropTheItem).toHaveBeenCalledWith(location, event)
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
      ns.targetedNode = document.createElement('ul')
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
        it('should return en empty array if targetedNode is the same as draggedNode', () => {
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')
          ns.areNested = jest.fn().mockReturnValue(false)

          ns.cursorIsIndentedEnough = jest.fn().mockReturnValue(true)
          ns.mouseIsTooCloseToTop = jest.fn().mockReturnValue(false)
          ns.draggedNode = ns.targetedNode

          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return en empty array if targetedNode name is not LI', () => {
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.createElement('ul')
          ns.areNested = jest.fn().mockReturnValue(false)

          ns.cursorIsIndentedEnough = jest.fn().mockReturnValue(true)
          ns.mouseIsTooCloseToTop = jest.fn().mockReturnValue(false)
          ns.draggedNode = document.querySelector('li[data-id="2"]')

          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return en empty array if targetedNode contains a ul element', () => {
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')
          ns.areNested = jest.fn().mockReturnValue(false)

          ns.cursorIsIndentedEnough = jest.fn().mockReturnValue(true)
          ns.mouseIsTooCloseToTop = jest.fn().mockReturnValue(false)
          ns.draggedNode = document.querySelector('li[data-id="2"]')
          ns.targetedNode.appendChild(document.createElement('ul'))

          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return en array with `add` as its only item when all conditions meet', () => {
          const ns = initDataDrivenList()

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')
          ns.areNested = jest.fn().mockReturnValue(false)

          ns.cursorIsIndentedEnough = jest.fn().mockReturnValue(true)
          ns.mouseIsTooCloseToTop = jest.fn().mockReturnValue(false)
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
    it('should append the placeholderInUse property to the targetedNode and call the animatePlaceholderList method', async () => {
      const ns = initDataDrivenList()
      ns.targetedNode = document.querySelector('li[data-id="1"]')
      ns.targetedNode.appendChild = jest.fn()
      ns.animatePlaceholderList = jest.fn()

      await ns.addPlaceholderList()

      expect(ns.targetedNode.appendChild).toHaveBeenCalledTimes(1)
      expect(ns.targetedNode.appendChild).toHaveBeenCalledWith(ns.placeholderInUse)
      expect(ns.animatePlaceholderList).toHaveBeenCalledTimes(1)
    })
  })

  describe('cleanupPlaceholderLists method', () => {
    it('should remove any ul list which does not have any list items', () => {
      const ns = initDataDrivenList({
        data: [
          {id: 1, text: 'One'},
          {id: 11, text: 'One-One', parent: 1},
          {id: 2, text: 'Two'},
        ],
      })
      const ul = document.createElement('ul')
      document.querySelector('li[data-id="11"]').appendChild(ul.cloneNode(true))
      document.querySelector('li[data-id="2"]').appendChild(ul.cloneNode(true))

      ns.cleanupPlaceholderLists()
      const lists = ns.getSortableList().querySelectorAll('ul')

      expect(lists.length).toBe(1)
    })

    it('should treat a legit placeholder list correctly', () => {
      const ns = initDataDrivenList()
      const placeholderList = document.createElement('ul')
      placeholderList.classList.add(ns.classNames.placeholder)
      placeholderList.classList.add('test-placeholder')
      placeholderList.style.minHeight = '100px'
      document.querySelector('li[data-id="1"]').appendChild(placeholderList)
      placeholderList.appendChild(document.querySelector('li[data-id="2"]'))

      ns.cleanupPlaceholderLists()
      const list = ns.getSortableList().querySelector('ul.test-placeholder')

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

    it('should return true if the passed element is a list item', () => {
      const ns = initDataDrivenList()
      ns.draggedNode = document.querySelector('li[data-id="1"]')
      const li = document.querySelector('li[data-id="2"]')

      expect(ns.canBeTargeted(li)).toBe(true)
    })

    it('should return true if the passed element is a placeholder list', () => {
      const ns = initDataDrivenList()
      ns.draggedNode = document.querySelector('li[data-id="1"]')
      const placeholderList = document.createElement('ul')
      placeholderList.classList.add(ns.classNames.placeholder)

      expect(ns.canBeTargeted(placeholderList)).toBe(true)
    })

    it('should return false if the passed element is list but not a placeholder one', () => {
      const ns = initDataDrivenList()
      ns.draggedNode = document.querySelector('li[data-id="1"]')
      const placeholderList = document.createElement('ul')

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
  })
})
