import { serve } from 'bun'
import index from './index.html'
import customRender from './custom-render.html'
import dataDrivenList from './data-driven-list.html'
import dataPersistenceInLocalStorage from './data-persistence-in-local-storage.html'
import enableDisable from './enable-disable.html'
import mappedDataDrivenList from './mapped-data-driven-list.html'
import nestingLevels from './nesting-levels.html'
import orderedDataDrivenList from './ordered-data-driven-list.html'
import serverRenderedList from './server-rendered-list.html'
import serverRenderedMultipleLists from './server-rendered-multiple-lists.html'
import stylingDataDrivenList from './styling-data-driven-list.html'

const server = serve({
  port: 3000,
  routes: {
    '/': index,
    '/custom-render': customRender,
    '/data-driven-list': dataDrivenList,
    '/data-persistence-in-local-storage': dataPersistenceInLocalStorage,
    '/enable-disable': enableDisable,
    '/mapped-data-driven-list': mappedDataDrivenList,
    '/nesting-levels': nestingLevels,
    '/ordered-data-driven-list': orderedDataDrivenList,
    '/server-rendered-list': serverRenderedList,
    '/server-rendered-multiple-lists': serverRenderedMultipleLists,
    '/styling-data-driven-list': stylingDataDrivenList,
  },
  development: {
    hmr: true,
    console: true,
  },
})

console.log(`Nested Sort dev server running at ${server.url}`)
