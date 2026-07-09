import { JSDOM } from 'jsdom'
const dom = new JSDOM()
global.jsdom = dom
global.document = dom.window.document
global.window = dom.window

// Bun's runtime has no DOM, unlike Jest's old default jsdom test environment
// which exposed the whole window (HTMLOListElement, HTMLElement, Event, ...)
// as globals. Replicate that here so src/test code can reference them bare.
Object.getOwnPropertyNames(dom.window).forEach(prop => {
  try {
    global[prop] = dom.window[prop]
  } catch {
    // a handful of window properties are non-configurable getters; skip those
  }
})
