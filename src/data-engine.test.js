import DataEngine from './data-engine'

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

  describe('createItemElement method', () => {
    describe('when no nodeName argument is passed', () => {
      it('should return an LI node', () => {
        const item = { id: 1, text: 'Hi' }
        const engine = new DataEngine({})
        expect(engine.createItemElement(item).nodeName).toBe('LI')
      })

      it('should set the innerHtml correctly', () => {
        const text = 'Hello world'
        const item = { id: 1, text }
        const engine = new DataEngine({})
        expect(engine.createItemElement(item).innerHTML).toBe(text)
      })
    })

    describe('when `ul` ias passed as the nodeName argument', () => {
      it('should NOT set the innerHtml', () => {
        const text = 'Hello world'
        const item = { id: 1, text }
        const engine = new DataEngine({})
        expect(engine.createItemElement(item, 'ul').innerHTML).toBe('')
      })
    })

    it('should set the data-id attribute with the correct value', () => {
      const id = 1
      const item = { id, text: 'Hi' }
      const engine = new DataEngine({})
      expect(engine.createItemElement(item).dataset.id).toBe(`${id}`)
    })
  })

  describe('render method', () => {
    it('should return a flat list when data items do not have any parent property', () => {
      const data = [
        { id: 1, text: 'One' },
        { id: 2, text: 'Two' },
        { id: 3, text: 'Three' },
      ]
      const dataEngineConfig = {
        data
      }

      const list = document.createElement('ul')
      list.innerHTML =
        '<li data-id="1">One</li>' +
        '<li data-id="2">Two</li>' +
        '<li data-id="3">Three</li>'

      expect((new DataEngine(dataEngineConfig)).render()).toEqual(list)
    })

    it('should return a nested list when data items have parent property and have a child-parent structure', () => {
      const data = [
        { id: 1, text: 'One' },
        { id: 11, text: 'One-One', parent: 1 },
        { id: 2, text: 'Two' },
        { id: 3, text: 'Three' },
        { id: 1121, text: 'One-One-Two-One', parent: 112 },
        { id: 1122, text: 'One-One-Two-Two', parent: 112 },
        { id: 1123, text: 'One-One-Two-Three', parent: 112 },
        { id: 4, text: 'Four' },
        { id: 41, text: 'Four-One', parent: 4 },
        { id: 42, text: 'Four-Two', parent: 4 },
        { id: 421, text: 'Four-Two-One', parent: 42 },
        { id: 422, text: 'Four-Two-Two', parent: 42 },
        { id: 423, text: 'Four-Two-Three', parent: 42 },
        { id: 5, text: 'Five' },
        { id: 12, text: 'One-Two', parent: 1 },
        { id: 111, text: 'One-One-One', parent: 11 },
        { id: 112, text: 'One-One-Two', parent: 11 },
        { id: 113, text: 'One-One-Three', parent: 11 },
      ]
      const dataEngineConfig = {
        data
      }

      expect((new DataEngine(dataEngineConfig)).render()).toEqual(list)
      expect(list.querySelectorAll('li').length).toEqual(data.length)
    })
  })

  describe('convertDomToData method', () => {
    it('should correctly convert a nested list of elements to an array of objects', () => {
      const data = [
        { id: "1" },
        { id: "11", parent: "1" },
        { id: "111", parent: "11" },
        { id: "112", parent: "11" },
        { id: "1121", parent: "112" },
        { id: "1122", parent: "112" },
        { id: "1123", parent: "112" },
        { id: "113", parent: "11" },
        { id: "12", parent: "1" },
        { id: "2" },
        { id: "3" },
        { id: "4" },
        { id: "41", parent: "4" },
        { id: "42", parent: "4" },
        { id: "421", parent: "42" },
        { id: "422", parent: "42" },
        { id: "423", parent: "42" },
        { id: "5" },
      ]

      const engine = new DataEngine({})
      expect(engine.convertDomToData(list)).toEqual(data)
    })
  })
})
