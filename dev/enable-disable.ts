import NestedSort from '../src/main'

// Local storage persistent data-driven list
const originalData = [
  { item_id: 1, item_title: 'One', position: 5 },
  { item_id: 2, item_title: 'Two', position: 4 },
  { item_id: 3, item_title: 'Three', position: 3 },
  { item_id: 4, item_title: 'Four', position: 2 },
  { item_id: 5, item_title: 'Five', position: 1 },
]
const dataKey = 'nestedSortDataEnableDisableSample'
let data = JSON.parse(localStorage.getItem(dataKey) ?? 'null') || originalData

function onDropHandler(orderedItems) {
  console.log(orderedItems)
  const newData = originalData.map(origItem => {
    const newItem = orderedItems.find(item => parseInt(item.item_id) === origItem.item_id)
    return Object.assign({}, origItem, {
      position: newItem.position,
      item_parent: newItem.item_parent,
    })
  })
  data = newData
  localStorage.setItem(dataKey, JSON.stringify(newData))
}

const propertyMap = {
  id: 'item_id',
  parent: 'item_parent',
  text: 'item_title',
  order: 'position',
}

// Server rendered list
const startServerRenderedList = () => {
  window.serverRenderedList = new NestedSort({
    actions: {
      onDrop(data) {
        const resultWrap = document.querySelector('.result-wrap-1')!
        resultWrap.innerHTML = JSON.stringify(data, null, '  ')
        onDropHandler(data)
      },
    },
    propertyMap,
    init: false,
    el: '.draggable',
    droppingEdge: 5,
  })
}

const destroyServerRenderedList = () => {
  if (window.serverRenderedList) {
    window.serverRenderedList.destroy()
  }
}

const initServerRenderedList = () => {
  window.serverRenderedList!.init()
}

startServerRenderedList()

const startDataDrivenList = () => {
  window.dataDrivenList = new NestedSort({
    actions: {
      onDrop(data) {
        const resultWrap = document.querySelector('.result-wrap-2')!
        resultWrap.innerHTML = JSON.stringify(data, null, '  ')
        onDropHandler(data)
      },
    },
    data,
    init: false,
    propertyMap,
    el: '#draggable',
    droppingEdge: 5,
  })
}

const destroyDataDrivenList = () => {
  if (window.dataDrivenList) {
    window.dataDrivenList.destroy()
  }
}

const initDataDrivenList = () => {
  window.dataDrivenList!.init()
}

startDataDrivenList()

// exposed for the inline onclick handlers in the HTML, since module scripts
// don't leak their top-level bindings onto window like classic scripts do
Object.assign(window, {
  initServerRenderedList,
  destroyServerRenderedList,
  initDataDrivenList,
  destroyDataDrivenList,
})
