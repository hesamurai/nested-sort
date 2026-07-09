import NestedSort from '../src/main'

function updateNestingLevels() {
  if (window.ns) window.ns.destroy()
  window.ns = new NestedSort({
    actions: {
      onDrop: function (data) {
        const resultWrap = document.querySelector('.result-wrap')!
        resultWrap.innerHTML = JSON.stringify(data, null, '  ')
        console.log(data)
      },
    },
    el: '#draggable',
    droppingEdge: 5,
    nestingLevels: (document.getElementById('nesting-level') as HTMLInputElement).value,
  })
}

// exposed for the inline onchange handler in the HTML, since module scripts
// don't leak their top-level bindings onto window like classic scripts do
window.updateNestingLevels = updateNestingLevels

updateNestingLevels()
