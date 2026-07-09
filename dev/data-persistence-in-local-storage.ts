import NestedSort from '../src/main'

const originalData = [
  { item_id: 1, item_title: 'One', position: 5 },
  { item_id: 2, item_title: 'Two', position: 4 },
  { item_id: 3, item_title: 'Three', position: 3 },
  { item_id: 4, item_title: 'Four', position: 2 },
  { item_id: 5, item_title: 'Five', position: 1 },
]
const dataKey = 'nestedSortDataDataPersistenceSample'
const data = JSON.parse(localStorage.getItem(dataKey) ?? 'null') || originalData

function onDrop(data) {
  const resultWrap = document.querySelector('.result-wrap')!
  resultWrap.innerHTML = JSON.stringify(data, null, '  ')
  console.log(data)
  const newData = originalData.map(origItem => {
    const newItem = data.find(item => parseInt(item.item_id) === origItem.item_id)
    return Object.assign({}, origItem, {
      position: newItem.position,
      item_parent: newItem.item_parent,
    })
  })
  localStorage.setItem(dataKey, JSON.stringify(newData))
}

new NestedSort({
  actions: {
    onDrop,
  },
  data: data,
  propertyMap: {
    id: 'item_id',
    parent: 'item_parent',
    text: 'item_title',
    order: 'position',
  },
  el: '#draggable',
  droppingEdge: 5,
})
