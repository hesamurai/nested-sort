import NestedSort from '../src/main'

document.querySelectorAll<HTMLElement>('.draggable').forEach(function (list) {
  new NestedSort({
    actions: {
      onDrop: function (data) {
        const resultWrap = document.querySelector(`.result-wrap-${list.dataset.resultScreenId}`)!
        resultWrap.innerHTML = JSON.stringify(data, null, '  ')
        console.log(data)
      },
    },
    droppingEdge: 5,
    el: list,
  })
})
