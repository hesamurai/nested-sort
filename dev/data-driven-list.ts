import NestedSort from '../src/main'

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
