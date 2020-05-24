class DataEngine {
  /**
   * @constructor
   * @param {array} data
   */
  constructor({ data }) {
    this.data = data
  }

  getListItemsDom() {
    return this.data.map(item => {
      const listItem = document.createElement('li')
      listItem.dataset.id = item.id
      listItem.innerHTML = item.text
      return listItem
    })
  }

  render() {
    const list = document.createElement('ul')
    this.getListItemsDom().forEach(listItem => list.appendChild(listItem))
    return list
  }
}

export default DataEngine
