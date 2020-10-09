import { JSDOM } from 'jsdom'
const dom = new JSDOM()
global.jsdom = dom
global.document = dom.window.document
global.window = dom.window
