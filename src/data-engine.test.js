import DataEngine from './data-engine'

describe('DataEngine class', () => {
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
  })
})
