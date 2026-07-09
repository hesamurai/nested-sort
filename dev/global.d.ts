import NestedSort from '../src/main'

// dev-only globals the sample pages stash on window for inline HTML
// event handlers / manual console poking - not part of the library API
declare global {
  interface Window {
    ns?: NestedSort
    serverRenderedList?: NestedSort
    dataDrivenList?: NestedSort
    updateList?: () => void
    updateNestingLevels?: () => void
  }
}
