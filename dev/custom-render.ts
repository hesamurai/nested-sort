import NestedSort from '../src/main'

const data = [
  { id: 1, text: 'One', imageUrl: 'https://dummyimage.com/120x120/485E33/ffffff' },
  { id: 2, text: 'Two', imageUrl: 'https://dummyimage.com/120x120/60744D/ffffff' },
  { id: 3, text: 'Three', imageUrl: 'https://dummyimage.com/120x120/7EA65A/ffffff' },
  { id: 4, text: 'Four', imageUrl: 'https://dummyimage.com/120x120/A9DE78/000000' },
  { id: 5, text: 'Five', imageUrl: 'https://dummyimage.com/120x120/D1E3BF/000000' },
]

new NestedSort({
  renderListItem: (el, { id, imageUrl, text }) => {
    if (id === 2) el.classList.add('very-custom-list-item')
    const img = document.createElement('img')
    img.src = String(imageUrl)
    img.alt = ''
    el.appendChild(img)
    return el
  },
  actions: {
    onDrop: function (data) {
      console.log(data)
    },
  },
  data: data,
  el: '#draggable',
  droppingEdge: 5,
  nestingLevels: 0,
})
