import NestedSort from '../src/main'

const data = [
  { id: 1, text: 'One', order: 2 },
  { id: 11, text: 'One-One', parent: 1, order: 3 },
  { id: 2, text: 'Two', order: 1 },
  { id: 3, text: 'Three', order: 3 },
  { id: 4, text: 'Four', order: 5 },
  { id: 5, text: 'Five', order: 4 },
  { id: 12, text: 'One-Two', parent: 1, order: 1 },
  { id: 111, text: 'One-One-One', parent: 11, order: 3 },
  { id: 112, text: 'One-One-Two', parent: 11, order: 1 },
  { id: 113, text: 'One-One-Three', parent: 11, order: 2 },
]

new NestedSort({
  actions: {
    onDrop: function (data) {
      const resultWrap = document.querySelector('.result-wrap')!
      resultWrap.innerHTML = JSON.stringify(data, null, '  ')
      console.log(data)
    },
  },
  data: data,
  el: '#draggable',
  droppingEdge: 5,
})
