import NestedSort from '../src/main'
import {
  createEvent,
} from './utils/dom'

describe('NestedSort', () => {
  const dynamicListWrapperId = 'dynamic-list-wrapper-id'

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
        it('should prevent the default behaviour to allow dropping', () => {
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

          const items = [
            document.querySelector('li[data-id="1"]'),
            document.querySelector('ul[data-id="1"]'),
          ]

          items.forEach(item => {
            const preventDefault = jest.fn()
            item.dispatchEvent(
              createEvent('dragenter', {
                preventDefault,
              })
            )

            expect(preventDefault).toHaveBeenCalledTimes(1)
          })
        })

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
  })
})
