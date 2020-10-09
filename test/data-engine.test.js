import DataEngine from '../src/data-engine'

describe('DataEngine class', () => {
  let list

  beforeEach(() => {
    list = document.createElement('ul')
    list.innerHTML =
      '<li data-id="1">One' +
        '<ul data-id="1">' +
          '<li data-id="11">One-One' +
            '<ul data-id="11">' +
              '<li data-id="111">One-One-One</li>' +
              '<li data-id="112">One-One-Two' +
                '<ul data-id="112">' +
                  '<li data-id="1121">One-One-Two-One</li>' +
                  '<li data-id="1122">One-One-Two-Two</li>' +
                  '<li data-id="1123">One-One-Two-Three</li>' +
                '</ul>' +
              '</li>' +
              '<li data-id="113">One-One-Three</li>' +
            '</ul>' +
          '</li>' +
          '<li data-id="12">One-Two</li>' +
        '</ul>' +
      '</li>' +
      '<li data-id="2">Two</li>' +
      '<li data-id="3">Three</li>' +
      '<li data-id="4">Four' +
        '<ul data-id="4">' +
          '<li data-id="41">Four-One</li>' +
          '<li data-id="42">Four-Two' +
            '<ul data-id="42">' +
              '<li data-id="421">Four-Two-One</li>' +
              '<li data-id="422">Four-Two-Two</li>' +
              '<li data-id="423">Four-Two-Three</li>' +
            '</ul>' +
          '</li>' +
        '</ul>' +
      '</li>' +
      '<li data-id="5">Five</li>'
  })

  describe('constructor method', () => {
    it('should set the instance properties correctly', () => {
      const data = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]
      const dataEngineConfig = {
        data
      }

      expect((new DataEngine(dataEngineConfig)).data).toEqual(data)
      expect((new DataEngine(dataEngineConfig)).sortedData).toEqual([])
      expect((new DataEngine(dataEngineConfig)).sortedDataDomArray).toEqual([])
    })
  })

  describe('sortListItems method', () => {
    describe('when items do not have the order prop', () => {
      it('should gather all the items without any parent at the beginning of the array', () => {
        const data = [
          { id: 4, parent: 3 },
          { id: 1 },
          { id: 2, parent: 6 },
          { id: 3 },
          { id: 5, parent: null },
          { id: 6, parent: '' },
        ]
        const dataEngineConfig = {
          data
        }

        expect((new DataEngine(dataEngineConfig)).sortListItems()).toEqual([
          { id: 1 },
          { id: 3 },
          { id: 5, parent: null },
          { id: 6, parent: '' },
          { id: 4, parent: 3 },
          { id: 2, parent: 6 },
        ])
      })
    })

    describe('when items have the order prop', () => {
      it('it should sort the items based on the order value', () => {
        const data = [
          { id: 10, parent: 8, order: 2 },
          { id: 4, parent: 3, order: 2 },
          { id: 1, order: 5 },
          { id: 7, parent: 6, order: 1 },
          { id: 2, parent: 6, order: 2 },
          { id: 9, parent: 8, order: 1 },
          { id: 3, order: 3 },
          { id: 8, parent: 3, order: 1 },
          { id: 11, parent: 3, order: 4 },
          { id: 5, parent: null, order: 1 },
          { id: 6, parent: '', order: 2 },
        ]
        const expected = [
          { id: 5, parent: null, order: 1 },
          { id: 6, parent: '', order: 2 },
          { id: 3, order: 3 },
          { id: 1, order: 5 },
          { id: 8, parent: 3, order: 1 },
          { id: 4, parent: 3, order: 2 },
          { id: 11, parent: 3, order: 4 },
          { id: 7, parent: 6, order: 1 },
          { id: 2, parent: 6, order: 2 },
          { id: 9, parent: 8, order: 1 },
          { id: 10, parent: 8, order: 2 },
        ]
        const dataEngineConfig = {
          data
        }
        const actual = (new DataEngine(dataEngineConfig)).sortListItems()

        expect(actual).toEqual(expected)
      })
    })
  })

  describe('createItemElement method', () => {
    describe('when no nodeName argument is passed', () => {
      it('should return an LI node', () => {
        const item = { id: 1, text: 'Hi', order: 1 }
        const engine = new DataEngine({data: [item]})
        expect(engine.createItemElement(item).nodeName).toBe('LI')
      })

      it('should set the innerHtml correctly', () => {
        const text = 'Hello world'
        const item = { id: 1, text, order: 2 }
        const engine = new DataEngine({data: [item]})
        expect(engine.createItemElement(item).innerHTML).toBe(text)
      })
    })

    describe('when `ul` is passed as the nodeName argument', () => {
      it('should NOT set the innerHtml', () => {
        const text = 'Hello world'
        const item = { id: 1, text }
        const engine = new DataEngine({data: [item]})
        expect(engine.createItemElement(item, 'ul').innerHTML).toBe('')
      })
    })

    it('should set the data-id attribute with the correct value', () => {
      const id = 1
      const item = { id, text: 'Hi' }
      const engine = new DataEngine({data: [item]})
      expect(engine.createItemElement(item).dataset.id).toBe(`${id}`)
    })
  })

  describe('render method', () => {
    it('should return a flat list when data items do not have any parent property', () => {
      const data = [
        { id: 3, text: 'Three', order: 2 },
        { id: 1, text: 'One', order: 1 },
        { id: 2, text: 'Two', order: 3 },
      ]
      const dataEngineConfig = {
        data
      }

      const list = document.createElement('ul')
      list.innerHTML =
        '<li data-id="1">One</li>' +
        '<li data-id="3">Three</li>' +
        '<li data-id="2">Two</li>'

      expect((new DataEngine(dataEngineConfig)).render()).toEqual(list)
    })

    it('should return a nested list when data items have parent property and have a child-parent structure', () => {
      const data = [
        { id: 112, text: 'One-One-Two', parent: 11, order: 1 },
        { id: 11, text: 'One-One', parent: 1, order: 2 },
        { id: 5, text: 'Five', order: 4 },
        { id: 3, text: 'Three', order: 3 },
        { id: 1121, text: 'One-One-Two-One', parent: 112, order: 3 },
        { id: 111, text: 'One-One-One', parent: 11, order: 2 },
        { id: 1123, text: 'One-One-Two-Three', parent: 112, order: 2 },
        { id: 2, text: 'Two', order: 2 },
        { id: 4, text: 'Four', order: 5 },
        { id: 1122, text: 'One-One-Two-Two', parent: 112, order: 1 },
        { id: 12, text: 'One-Two', parent: 1, order: 1 },
        { id: 1, text: 'One', order: 1 },
      ]
      const dataEngineConfig = {
        data
      }

      const list = document.createElement('ul')
      list.innerHTML =
        '<li data-id="1">One' +
          '<ul data-id="1">' +
            '<li data-id="12">One-Two</li>' +
            '<li data-id="11">One-One' +
              '<ul data-id="11">' +
                '<li data-id="112">One-One-Two' +
                  '<ul data-id="112">' +
                    '<li data-id="1122">One-One-Two-Two</li>' +
                    '<li data-id="1123">One-One-Two-Three</li>' +
                    '<li data-id="1121">One-One-Two-One</li>' +
                  '</ul>' +
                '</li>' +
                '<li data-id="111">One-One-One</li>' +
              '</ul>' +
            '</li>' +
          '</ul>' +
        '</li>' +
        '<li data-id="2">Two</li>' +
        '<li data-id="3">Three</li>' +
        '<li data-id="5">Five</li>' +
        '<li data-id="4">Four</li>'

      expect((new DataEngine(dataEngineConfig)).render()).toEqual(list)
      expect(list.querySelectorAll('li').length).toEqual(data.length)
    })
  })

  describe('convertDomToData method', () => {
    it('should correctly convert a nested list of elements to an array of objects', () => {
      const data = [
        { id: "1", parent: undefined, order: 1 },
        { id: "11", parent: "1", order: 1 },
        { id: "111", parent: "11", order: 1 },
        { id: "112", parent: "11", order: 2 },
        { id: "1121", parent: "112", order: 1 },
        { id: "1122", parent: "112", order: 2 },
        { id: "1123", parent: "112", order: 3 },
        { id: "113", parent: "11", order: 3 },
        { id: "12", parent: "1", order: 2 },
        { id: "2", parent: undefined, order: 2 },
        { id: "3", parent: undefined, order: 3 },
        { id: "4", parent: undefined, order: 4 },
        { id: "41", parent: "4", order: 1 },
        { id: "42", parent: "4", order: 2 },
        { id: "421", parent: "42", order: 1 },
        { id: "422", parent: "42", order: 2 },
        { id: "423", parent: "42", order: 3 },
        { id: "5", parent: undefined, order: 5 },
      ]

      const engine = new DataEngine({data})
      expect(engine.convertDomToData(list)).toEqual(data)
    })

    it('should correctly convert a nested list of elements to an array of mapped objects', () => {
      const list = document.createElement('ul')
      list.innerHTML =
        '<li data-id="1">One' +
          '<ul data-id="1">' +
            '<li data-id="11">One-One' +
              '<ul data-id="11">' +
                '<li data-id="111">One-One-One</li>' +
                '<li data-id="112">One-One-Two' +
                  '<ul data-id="112">' +
                    '<li data-id="1121">One-One-Two-One</li>' +
                    '<li data-id="1122">One-One-Two-Two</li>' +
                  '</ul>' +
                '</li>' +
              '</ul>' +
            '</li>' +
            '<li data-id="12">One-Two</li>' +
          '</ul>' +
        '</li>' +
        '<li data-id="2">Two</li>' +
        '<li data-id="3">Three</li>' +
        '<li data-id="4">Four</li>'

      const data = [
        { item_id: "1", item_parent: undefined, position: 1 },
        { item_id: "11", item_parent: "1", position: 1 },
        { item_id: "111", item_parent: "11", position: 1 },
        { item_id: "112", item_parent: "11", position: 2 },
        { item_id: "1121", item_parent: "112", position: 1 },
        { item_id: "1122", item_parent: "112", position: 2 },
        { item_id: "12", item_parent: "1", position: 2 },
        { item_id: "2", item_parent: undefined, position: 2 },
        { item_id: "3", item_parent: undefined, position: 3 },
        { item_id: "4", item_parent: undefined, position: 4 },
      ]
      const propertyMap = {
        id: 'item_id',
        parent: 'item_parent',
        order: 'position',
      }
      const engine = new DataEngine({data, propertyMap})
      expect(engine.convertDomToData(list)).toEqual(data)
    })
  })

  describe('when we have property mapping', () => {
    it('should map the properties correctly', () => {
      const data = [
        { item_id: 1, item_title: 'One' },
        { item_id: 11, item_title: 'One-One', item_parent: 1 },
        { item_id: 2, item_title: 'Two' },
        { item_id: 3, item_title: 'Three' },
        { item_id: 1121, item_title: 'One-One-Two-One', item_parent: 112 },
        { item_id: 1122, item_title: 'One-One-Two-Two', item_parent: 112 },
        { item_id: 1123, item_title: 'One-One-Two-Three', item_parent: 112 },
        { item_id: 4, item_title: 'Four' },
        { item_id: 41, item_title: 'Four-One', item_parent: 4 },
        { item_id: 42, item_title: 'Four-Two', item_parent: 4 },
        { item_id: 421, item_title: 'Four-Two-One', item_parent: 42 },
        { item_id: 422, item_title: 'Four-Two-Two', item_parent: 42 },
        { item_id: 423, item_title: 'Four-Two-Three', item_parent: 42 },
        { item_id: 5, item_title: 'Five' },
        { item_id: 12, item_title: 'One-Two', item_parent: 1 },
        { item_id: 111, item_title: 'One-One-One', item_parent: 11 },
        { item_id: 112, item_title: 'One-One-Two', item_parent: 11 },
        { item_id: 113, item_title: 'One-One-Three', item_parent: 11 },
      ]
      const dataEngineConfig = {
        data,
        propertyMap: {
          id: 'item_id',
          parent: 'item_parent',
          text: 'item_title',
        }
      }

      expect((new DataEngine(dataEngineConfig)).render()).toEqual(list)
      expect(list.querySelectorAll('li').length).toEqual(data.length)
    })
  })
})
