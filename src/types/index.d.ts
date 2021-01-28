export interface Actions {
  onDrop?: (data: Array<object>) => void
}

export type DropLocation = 'before' | 'inside'

export type ListInterface = typeof HTMLOListElement | typeof HTMLUListElement

export type ListElement = HTMLOListElement | HTMLUListElement

export type ListTagName = 'ol' | 'ul'

export type PlaceholderMaintenanceActions = Array<'add' | 'cleanup'>

export interface ClassNames {
  dragged: string
  placeholder: string
  targeted: string
}

export interface Cursor {
  X: number
  Y: number
}

export interface DataItem {
  id: string | number
  order: number
  parent: string | number
  text: string
}

export interface Dimensions {
  targetedEl: {
    H: number,
  }
}

export interface Distances {
  droppingEdge: number
  mouseTo: {
    targetedElTop: number,
    targetedElTopAbs: number,
    targetedElBot: number,
  }
}

export interface EventListeners {
  dragover: (e: object) => void
  dragstart: (e: object) => void
  dragenter: (e: object) => void
  dragend: (e: object) => void
  drop: (e: object) => void
}

export interface TargetNode {
  X: number
  Y: number
}

export type ClassNamesList = Array<string> | string

export interface Options {
  actions: Actions
  data: Array<DataItem>
  droppingEdge: number
  el: HTMLElement | string
  init: boolean
  listClassNames: ClassNamesList
  listItemClassNames: ClassNamesList
  nestingLevels: string
  propertyMap: Partial<PropertyMap>
}

export interface PropertyMap {
  id: string
  order: string
  parent: string
}

export interface DataEngineOptions {
  data: Array<DataItem>
  propertyMap: PropertyMap | object
}
