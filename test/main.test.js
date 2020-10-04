import NestedSort from '../src/main'
import {
  createEvent,
} from './utils/dom'

describe('NestedSort', () => {
  const dynamicListWrapperId = 'dynamic-list-wrapper-id'
  const staticListWrapperId = 'static-list-wrapper-id'

  beforeEach(() => {
    document.body.innerHTML = `<div id="${dynamicListWrapperId}"></div>`
  })

  describe('How it deals with List Class Names', () => {
    it('should convert the listClassNames prop on the initialisation and assign it to this.listClassNames', () => {
      [
        'class1 class2',
        ['class1', 'class2'],
      ].forEach(listClassNames => {
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'Item 1' }
          ],
          el: `#${dynamicListWrapperId}`,
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
      const ns = new NestedSort({
        data: [
          { id: 1, text: 'Item 1' },
          { id: 11, text: 'Item 1-1', parent: 1 },
          { id: 2, text: 'Item 2' },
          { id: 21, text: 'Item 2-1', parent: 2 },
          { id: 3, text: 'Item 3' },
        ],
        el: `#${dynamicListWrapperId}`,
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
      const ns = new NestedSort({
        data: [
          { id: 1, text: 'Item 1' }
        ],
        el: `#${dynamicListWrapperId}`,
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
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'Item 1' }
          ],
          el: `#${dynamicListWrapperId}`,
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
      const ns = new NestedSort({
        data: [
          { id: 1, text: 'Item 1' },
          { id: 2, text: 'Item 2' },
          { id: 3, text: 'Item 3' },
        ],
        el: `#${dynamicListWrapperId}`,
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
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'One' },
            { id: 2, text: 'Two' },
            { id: 3, text: 'Three' },
          ],
          el: `#${dynamicListWrapperId}`,
        })

        const item = document.querySelector('[data-id="1"]')
        item.dispatchEvent(
          createEvent('dragstart')
        )

        expect(item.classList).toContain('ns-dragged')
      })

      it('assigns the event target element to the draggedNode property of the instance', () => {
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'One' },
            { id: 2, text: 'Two' },
            { id: 3, text: 'Three' },
          ],
          el: `#${dynamicListWrapperId}`,
        })

        const item = document.querySelector('[data-id="1"]')
        item.dispatchEvent(
          createEvent('dragstart')
        )

        expect(ns.draggedNode).toEqual(item)
      })

      it('runs the event dataTransfer.setDate method', () => {
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'One' },
            { id: 2, text: 'Two' },
            { id: 3, text: 'Three' },
          ],
          el: `#${dynamicListWrapperId}`,
        })

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
      describe('when event target is either an LI or a UL element', () => {
        it('should remove the ns-targeted class name from the previous targeted item and add it to the newly targeted one', () => {
          const ns = new NestedSort({
            data: [
              { id: 1, text: 'One' },
              { id: 4, text: 'One-One', parent: 1 },
              { id: 2, text: 'Two' },
              { id: 3, text: 'Three' },
            ],
            el: `#${dynamicListWrapperId}`,
          })

          // let's pretend we're dragging the item Three
          const item = document.querySelector('[data-id="3"]')
          const setData = jest.fn()
          item.dispatchEvent(
            createEvent('dragstart', {
              dataTransfer: { setData }
            })
          )

          const item1 = document.querySelector('li[data-id="1"]')
          const item2 = document.querySelector('ul[data-id="1"]')

          const dragEnterEvent = createEvent('dragenter', {
            preventDefault: jest.fn(),
          })

          item1.dispatchEvent(dragEnterEvent)
          expect(item1.classList).toContain('ns-targeted')

          item2.dispatchEvent(dragEnterEvent)
          expect(item1.classList).not.toContain('ns-targeted')
          expect(item2.classList).toContain('ns-targeted')
        })

        it('should set this.targetedNode to the event target element', () => {
          const ns = new NestedSort({
            data: [
              { id: 1, text: 'One' },
              { id: 4, text: 'One-One', parent: 1 },
              { id: 2, text: 'Two' },
              { id: 3, text: 'Three' },
            ],
            el: `#${dynamicListWrapperId}`,
          })

          // let's pretend we're dragging the item Three
          const item = document.querySelector('[data-id="3"]')
          const setData = jest.fn()
          item.dispatchEvent(
            createEvent('dragstart', {
              dataTransfer: { setData }
            })
          )

          const item1 = document.querySelector('li[data-id="1"]')
          const item2 = document.querySelector('ul[data-id="1"]')

          const dragEnterEvent = createEvent('dragenter', {
            preventDefault: jest.fn(),
          })

          item1.dispatchEvent(dragEnterEvent)
          expect(ns.targetedNode).toEqual(item1)

          item2.dispatchEvent(dragEnterEvent)
          expect(ns.targetedNode).toEqual(item2)
        })
      })
    })

    describe('dragover event', () => {
      it('should prevent the default behaviour to allow dropping', () => {
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'One' },
            { id: 2, text: 'Two' },
          ],
          el: `#${dynamicListWrapperId}`,
        })

        const item = document.querySelector('[data-id="1"]')

        const preventDefault = jest.fn()
        item.dispatchEvent(
          createEvent('dragover', {
            preventDefault,
          })
        )

        expect(preventDefault).toHaveBeenCalledTimes(1)
      })
    })

    describe('dragend event', () => {
      it('should stop event propagation', () => {
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'One' },
            { id: 2, text: 'Two' },
          ],
          el: `#${dynamicListWrapperId}`,
        })

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
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'One' },
            { id: 2, text: 'Two' },
          ],
          el: `#${dynamicListWrapperId}`,
        })
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
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'One' },
            { id: 2, text: 'Two' },
          ],
          el: `#${dynamicListWrapperId}`,
        })
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
        const ns = new NestedSort({
          data: [
            { id: 1, text: 'One' },
            { id: 2, text: 'Two' },
          ],
          el: `#${dynamicListWrapperId}`,
        })

        const item = document.querySelector('[data-id="1"]')
        const stopPropagation = jest.fn()
        item.dispatchEvent(
          createEvent('dragend', {
            stopPropagation,
          })
        )

        expect(ns.draggedNode).toBeNull()
      })
    })

    describe('drop event', () => {
      it('should stop event propagation', () => {
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
        })

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
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
        })
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
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
        })
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
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
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
      document.body.innerHTML = `
        <div>
          <ul id="${staticListWrapperId}">
            <li data-id="1">One</li>
            <li data-id="2">Two</li>
            <li data-id="3">Three</li>
          </ul>
        </div>
      `
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should not call the getDataEngine method (upon instantiating) which resides inside the maybeInitDataDom method which goes through the early return', () => {
      jest.spyOn(NestedSort.prototype, 'getDataEngine').mockImplementation(jest.fn)
      const ns = new NestedSort({
        el: `#${staticListWrapperId}`,
      })

      expect(ns.getDataEngine).not.toHaveBeenCalled()
    })

    it('should assign the config el property value to this.sortableList if it is an instance of HTMLUListElement', () => {
      const el = document.getElementById(staticListWrapperId)
      const ns = new NestedSort({
        el,
      })

      expect(ns.sortableList).toEqual(el)
    })
  })

  describe('canBeDropped method', () => {
    it('should return false if targetNodeIsIdentified() returns false', () => {
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
      ns.targetNodeIsIdentified = () => false
      ns.targetNodeIsBeingDragged = () => false
      ns.targetNodeIsListWithItems = () => false
      ns.areNested = () => false

      expect(ns.canBeDropped()).toBe(false)
    })

    it('should return false if targetNodeIsBeingDragged() returns true', () => {
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
      ns.targetNodeIsIdentified = () => true
      ns.targetNodeIsBeingDragged = () => true
      ns.targetNodeIsListWithItems = () => false
      ns.areNested = () => false

      expect(ns.canBeDropped()).toBe(false)
    })

    it('should return false if targetNodeIsListWithItems() returns true', () => {
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
      ns.targetNodeIsIdentified = () => true
      ns.targetNodeIsBeingDragged = () => false
      ns.targetNodeIsListWithItems = () => true
      ns.areNested = () => false

      expect(ns.canBeDropped()).toBe(false)
    })

    it('should return false if areNested() returns true', () => {
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
      ns.targetNodeIsIdentified = () => true
      ns.targetNodeIsBeingDragged = () => false
      ns.targetNodeIsListWithItems = () => false
      ns.areNested = () => true

      expect(ns.canBeDropped()).toBe(false)
    })

    it('should return true if all the conditions meet', () => {
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
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
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
        })
        ns.canBeDropped = () => false

        expect(ns.getDropLocation()).toBeUndefined()
      })
    })

    describe('When canBeDropped() returns true', () => {
      it('should return undefined if targetedNode is LI and cursorIsIndentedEnough() returns true', () => {
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
        })
        ns.canBeDropped = () => true
        ns.cursorIsIndentedEnough = () => true
        ns.targetedNode = document.querySelector('li[data-id="1"]')

        expect(ns.targetedNode).toBeTruthy() // just to stay on the safe side
        expect(ns.getDropLocation()).toBeUndefined()
      })

      it('should return `before` if targetedNode is LI and cursorIsIndentedEnough() returns false', () => {
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
        })
        ns.canBeDropped = () => true
        ns.cursorIsIndentedEnough = () => false
        ns.targetedNode = document.querySelector('li[data-id="1"]')

        expect(ns.targetedNode).toBeTruthy() // just to stay on the safe side
        expect(ns.getDropLocation()).toBe('before')
      })

      it('should return `inside` if targetedNode is UL', () => {
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
        })
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
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
      ns.getDropLocation = () => undefined
      ns.dropTheItem = jest.fn()
      ns.maybeDrop()

      expect(ns.dropTheItem).not.toHaveBeenCalled()
    })

    it('should call dropTheItem() with correct arguments if getDropLocation() returns a string', () => {
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
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
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
      ns.draggedNode = document.querySelector('li[data-id="2"]')
      ns.targetedNode = document.querySelector('li[data-id="1"]')
      ns.targetedNode.parentNode.insertBefore = jest.fn()
      ns.dropTheItem('before')

      expect(ns.targetedNode.parentNode.insertBefore).toHaveBeenCalledTimes(1)
      expect(ns.targetedNode.parentNode.insertBefore).toHaveBeenCalledWith(ns.draggedNode, ns.targetedNode)
    })

    it('should insert the dragged node inside the targeted node', () => {
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
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
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
        })

        ns.areNested = jest.fn()
        ns.cursorIsIndentedEnough = jest.fn()
        const actions = ns.analysePlaceHolderSituation()

        expect(actions).toEqual([])
        expect(ns.areNested).not.toHaveBeenCalled()
        expect(ns.cursorIsIndentedEnough).not.toHaveBeenCalled()
      })

      it('should return an empty array when targetedNode property is truthy but areNested returns true', () => {
        const ns = new NestedSort({
          data: [
            {id: 1, text: 'One'},
            {id: 2, text: 'Two'},
          ],
          el: `#${dynamicListWrapperId}`,
        })

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
          const ns = new NestedSort({
            data: [
              {id: 1, text: 'One'},
              {id: 2, text: 'Two'},
            ],
            el: `#${dynamicListWrapperId}`,
          })

          // to bypass the early return
          ns.targetedNode = document.querySelector('li[data-id="1"]')
          ns.areNested = jest.fn().mockReturnValue(false)

          ns.cursorIsIndentedEnough = jest.fn().mockReturnValue(false)
          ns.targetedNodeIsPlaceholder = jest.fn().mockReturnValue(true)
          const actions = ns.analysePlaceHolderSituation()

          expect(actions).toEqual([])
        })

        it('should return an array with `cleanup` as the only item when targetedNodeIsPlaceholder() returns false', () => {
          const ns = new NestedSort({
            data: [
              {id: 1, text: 'One'},
              {id: 2, text: 'Two'},
            ],
            el: `#${dynamicListWrapperId}`,
          })

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
          const ns = new NestedSort({
            data: [
              {id: 1, text: 'One'},
              {id: 2, text: 'Two'},
            ],
            el: `#${dynamicListWrapperId}`,
          })

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
          const ns = new NestedSort({
            data: [
              {id: 1, text: 'One'},
              {id: 2, text: 'Two'},
            ],
            el: `#${dynamicListWrapperId}`,
          })

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
          const ns = new NestedSort({
            data: [
              {id: 1, text: 'One'},
              {id: 2, text: 'Two'},
            ],
            el: `#${dynamicListWrapperId}`,
          })

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
          const ns = new NestedSort({
            data: [
              {id: 1, text: 'One'},
              {id: 2, text: 'Two'},
            ],
            el: `#${dynamicListWrapperId}`,
          })

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
          const ns = new NestedSort({
            data: [
              {id: 1, text: 'One'},
              {id: 2, text: 'Two'},
            ],
            el: `#${dynamicListWrapperId}`,
          })

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
          const ns = new NestedSort({
            data: [
              {id: 1, text: 'One'},
              {id: 2, text: 'Two'},
            ],
            el: `#${dynamicListWrapperId}`,
          })

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
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
      ns.analysePlaceHolderSituation = jest.fn().mockReturnValue(['add'])
      ns.cleanupPlaceholderLists = jest.fn()
      ns.addPlaceholderList = jest.fn()

      ns.managePlaceholderLists()

      expect(ns.cleanupPlaceholderLists).toHaveBeenCalledTimes(1)
      expect(ns.addPlaceholderList).toHaveBeenCalledTimes(1)
    })

    it('should clean up current placeholder when analysePlaceHolderSituation() contains `cleanup`', () => {
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
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
      const ns = new NestedSort({
        data: [
          {id: 1, text: 'One'},
          {id: 2, text: 'Two'},
        ],
        el: `#${dynamicListWrapperId}`,
      })
      ns.targetedNode = document.querySelector('li[data-id="1"]')
      ns.targetedNode.appendChild = jest.fn()
      ns.animatePlaceholderList = jest.fn()

      await ns.addPlaceholderList()

      expect(ns.targetedNode.appendChild).toHaveBeenCalledTimes(1)
      expect(ns.targetedNode.appendChild).toHaveBeenCalledWith(ns.placeholderInUse)
      expect(ns.animatePlaceholderList).toHaveBeenCalledTimes(1)
    })
  })
})
