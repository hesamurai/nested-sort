import NestedSort from '../src/main'

const data = [
  { id: 1, text: 'One' },
  { id: 11, text: 'One-One', parent: 1 },
  { id: 2, text: 'Two' },
  { id: 3, text: 'Three' },
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
  listClassNames: ['list-group'],
  listItemClassNames: ['list-group-item'],
})
