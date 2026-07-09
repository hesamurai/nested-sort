import NestedSort from '../src/main'

const logData = (data) => {
  const resultWrap = document.querySelector('.result-wrap')!
  resultWrap.innerHTML = JSON.stringify(data, null, 2)
}
let data = [
  { id: 1, text: 'One', order: 5 },
  { id: 11, text: 'One-One', parent: 1, order: 1 },
  { id: 2, text: 'Two', order: 1 },
  { id: 3, text: 'Three', order: 2 },
  { id: 1121, text: 'One-One-Two-One', parent: 112, order: 2 },
  { id: 1123, text: 'One-One-Two-Three', parent: 112, order: 4 },
  { id: 12, text: 'One-Two', parent: 1, order: 2 },
  { id: 111, text: 'One-One-One', parent: 11, order: 1 },
  { id: 112, text: 'One-One-Two', parent: 11, order: 2 },
]
const propertyMap = {
  id: 'item_id',
  parent: 'item_parent',
  text: 'item_title',
  order: 'position',
}

document.getElementById('add-new-item')!.addEventListener('click', () => {
  if (!window.ns) return

  const item_title = prompt('New item name:')
  if (!item_title) return

  const item_id = item_title.toLowerCase().replaceAll(' ', '-')
  if (document.querySelector(`#draggable [data-id="${item_id}"]`)) {
    return alert('This is a duplicate item! Try another one please.')
  }

  const usePropertyMapping = (document.getElementById('property-mapping') as HTMLInputElement).checked
  const asLastChild = (document.getElementById('new-item-position') as HTMLInputElement).checked

  const item = usePropertyMapping
    ? { [propertyMap.id]: item_id, [propertyMap.text]: item_title }
    : { id: item_id, text: item_title }

  const { data } = window.ns.addNewItem({ item, asLastChild })
  logData(data)
})

function updateList() {
  if (window.ns) {
    window.ns.destroy()
  }

  const usePropertyMapping = (document.getElementById('property-mapping') as HTMLInputElement).checked

  window.ns = new NestedSort({
    actions: {
      onDrop: function (data) {
        logData(data)
        console.log(data)
      },
    },
    data: usePropertyMapping
      ? data.map(({ id, text, order, parent }) => ({
        [propertyMap.id]: id,
        [propertyMap.parent]: parent,
        [propertyMap.text]: text,
        [propertyMap.order]: order,
      }))
      : [...data],
    propertyMap: usePropertyMapping ? propertyMap : undefined,
    el: '#draggable',
    droppingEdge: 5,
  })
}

// exposed for the inline onchange handler in the HTML, since module scripts
// don't leak their top-level bindings onto window like classic scripts do
window.updateList = updateList

updateList()
