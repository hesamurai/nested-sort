import {
  DataEngineOptions,
  DataItem,
  ListElement,
  MappedDataItem,
  PropertyMap,
  RenderListItemFn,
} from './types'

class DataEngine {
  data: Array<DataItem>
  sortedData: Array<DataItem>
  sortedDataDomArray: Array<HTMLElement>
  propertyMap: Partial<PropertyMap>
  renderListItem: RenderListItemFn

  /**
   * @constructor
   */
  constructor({ data, propertyMap = {}, renderListItem }: DataEngineOptions) {
    this.data = data
    this.sortedData = []
    this.sortedDataDomArray = []
    this.propertyMap = propertyMap
    this.renderListItem = renderListItem

    this.maybeTransformData()
  }

  maybeTransformData(): void {
    if (!Object.keys(this.propertyMap).length || !Array.isArray(this.data)) return

    const getItemPropProxyName = this.getItemPropProxyName.bind(this)

    this.data = this.data.map(item => {
      return new Proxy(item, {
        get(target, prop, receiver) {
          return Reflect.get(target, getItemPropProxyName(prop), receiver)
        },
      })
    })
  }

  getItemPropProxyName(prop: string): string {
    if (Object.prototype.hasOwnProperty.call(this.propertyMap, prop)) {
      return this.propertyMap[prop]
    }
    return prop
  }

  isTopLevelItem(item: DataItem): boolean {
    return !item.parent
  }

  sortListItems(): Array<DataItem> {
    const items = [...this.data]

    const topLevelItems = items
      .filter(a => this.isTopLevelItem(a))
      .sort((a, b) => a.order && b.order ? a.order - b.order : 0)

    const childItems = items
      .filter(a => !this.isTopLevelItem(a))
      .reduce((groups, item) => {
        if (Object.prototype.hasOwnProperty.call(groups, item.parent)) {
          groups[item.parent].push(item)
        } else {
          groups[item.parent] = [item]
        }
        return groups
      }, {}) as Array<DataItem>

    Object.keys(childItems).forEach(parentId => {
      childItems[parentId].sort((a, b) => a.order && b.order ? a.order - b.order : 0)
    })

    this.sortedData = [
      ...topLevelItems,
      ...Object.values(childItems).flat(),
    ]

    return this.sortedData
  }

  createItemElement(item: Partial<DataItem>, nodeName = 'li'): HTMLElement {
    const { id, text } = item
    const el = document.createElement(nodeName)
    el.dataset.id = id as string
    if (nodeName === 'li' && text) el.innerHTML = text

    return nodeName === 'li' && typeof this.renderListItem === 'function'
      ? this.renderListItem(el, item)
      : el
  }

  elementIsParentOfItem(node: HTMLElement, item: DataItem): boolean {
    return node.dataset.id === `${item.parent}`
  }

  getParentNodeOfItem(node: HTMLElement, item: DataItem, nodeName: string): HTMLElement|null {
    return node.querySelector(`${nodeName}[data-id="${item.parent}"]`)
  }

  elementIsAncestorOfItem(node: HTMLElement, item: DataItem): boolean {
    return !!this.getParentNodeOfItem(node, item, 'li')
  }

  getDirectListParentOfItem(node: HTMLElement, item: DataItem): HTMLElement|null {
    return this.getParentNodeOfItem(node, item, 'ol')
  }

  maybeAppendItemToParentDom(item: DataItem): boolean {
    const { parent } = item
    const topParent = this.sortedDataDomArray.find(topLevelListItem => {
      return this.elementIsParentOfItem(topLevelListItem, item) || this.elementIsAncestorOfItem(topLevelListItem, item)
    })

    if (!topParent) return false

    const listItem = this.createItemElement(item)
    let directParentList = this.getDirectListParentOfItem(topParent, item)

    if (!directParentList) {
      // we need to create the direct parent OL and append it to the direct parent LI
      directParentList = this.createItemElement({ id: parent }, 'ol')
      const directParentListItem = this.getParentNodeOfItem(topParent, item, 'li') || topParent
      directParentListItem.appendChild(directParentList)
    }

    directParentList.appendChild(listItem)

    return true
  }

  getListItemsDom(): Array<HTMLElement> {
    this.sortedDataDomArray = []
    let processedItems: string[] = []

    while (processedItems.length !== this.sortListItems().length) {
      processedItems = this.sortedData.reduce((processedItems, item) => {
        const id = item.id.toString()
        if (processedItems.includes(id)) return processedItems

        let itemAdded
        if (!item.parent) {
          const listItem = this.createItemElement(item)
          this.sortedDataDomArray.push(listItem)
          itemAdded = true
        } else {
          itemAdded = this.maybeAppendItemToParentDom(item)
        }

        if (itemAdded) processedItems.push(id)

        return processedItems
      }, processedItems)
    }

    return this.sortedDataDomArray
  }

  convertDomToData(list: ListElement): Array<MappedDataItem> {
    return Array.from(list?.querySelectorAll('li') || []).map(li => {
      const parentListItem = li.parentNode as HTMLElement
      const parent = parentListItem.dataset.id
      const order = Array.from(parentListItem.children).findIndex(item => item === li) + 1

      return {
        [this.getItemPropProxyName('id')]: li.dataset.id,
        [this.getItemPropProxyName('parent')]: parent,
        [this.getItemPropProxyName('order')]: order,
      }
    })
  }

  render(): Node {
    const list = document.createElement('ol')
    this.getListItemsDom().forEach((listItem: HTMLElement) => list.appendChild(listItem))
    return list
  }
}

export default DataEngine
