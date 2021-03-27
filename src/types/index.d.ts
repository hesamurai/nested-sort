export interface Actions {
  onDrop?: (data: Array<object>) => void
}

export type DropLocation = 'before' | 'inside'

export type ListInterface = typeof HTMLOListElement | typeof HTMLUListElement

export type ListElement = HTMLElement | null

export type ListTagName = 'ol' | 'ul'

export type PlaceholderMaintenanceActions = Array<'add' | 'cleanup'>

export interface ClassNames {
  dragged: string
  placeholder: string
  targeted: string
}

export interface Coordinates {
  X: number
  Y: number
}

export interface Cursor extends Coordinates {}

export interface TargetNode extends Coordinates {}

export interface DataItem {
  id: string | number
  order: number
  parent: string | number
  text: string
}

export interface MappedDataItem {
  [key: string]: string | number | undefined
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
  text: string
}

export interface DataEngineOptions {
  data: Array<DataItem>
  propertyMap: Partial<PropertyMap>
}
