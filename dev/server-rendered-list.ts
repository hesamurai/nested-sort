import NestedSort from '../src/main'

const logData = (data) => {
  const resultWrap = document.querySelector('.result-wrap')!
  resultWrap.innerHTML = JSON.stringify(data, null, 2)
}

document.getElementById('add-new-item')!.addEventListener('click', () => {
  if (!window.ns) return

  const item_name = prompt('New item name:')
  if (!item_name) return

  const item_id = item_name.toLowerCase().replaceAll(' ', '-')
  if (document.querySelector(`#draggable [data-id="${item_id}"]`)) {
    return alert('This is a duplicate item! Try another one please.')
  }

  const usePropertyMapping = (document.getElementById('property-mapping') as HTMLInputElement).checked
  const asLastChild = (document.getElementById('new-item-position') as HTMLInputElement).checked

  const item = usePropertyMapping
    ? { item_id, item_name }
    : { id: item_id, text: item_name }

  const { data } = window.ns.addNewItem({ item, asLastChild })
  logData(data)
})

function updateList() {
  if (window.ns) window.ns.destroy()

  const usePropertyMapping = (document.getElementById('property-mapping') as HTMLInputElement).checked
  window.ns = new NestedSort({
    actions: {
      onDrop: function (data) {
        logData(data)
        console.log(`data ${usePropertyMapping ? 'with' : 'without'} property mapping`, data)
      },
    },
    propertyMap: usePropertyMapping ? {
      id: 'item_id',
      order: 'position',
      parent: 'child_of',
      text: 'item_name',
    } : undefined,
    el: '#draggable',
    droppingEdge: 5,
  })
}

// exposed for the inline onchange handler in the HTML, since module scripts
// don't leak their top-level bindings onto window like classic scripts do
window.updateList = updateList

updateList()
