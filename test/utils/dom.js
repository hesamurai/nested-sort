import {
  DYNAMIC_LIST_WRAPPER_ID,
  STATIC_LIST_WRAPPER_ID,
} from './constants'
import NestedSort from '../../src/main'

export const createEvent = (type, props = {}) => {
  const event = new Event(type, { bubbles: props.bubbles || true })
  delete props.bubbles // this property cannot be set on the event object
  Object.assign(
    event,
    {
      clientX: 0,
      clientY: 0,
      dataTransfer: {
        setData: jest.fn(),
      },
    },
    props,
  )

  return event
}

export const initServerRenderedList = (tag = 'ol') => {
  document.body.innerHTML = `
    <div>
      <${tag} id="${STATIC_LIST_WRAPPER_ID}">
        <li data-id="1">One</li>
        <li data-id="2">Two</li>
        <li data-id="3">Three</li>
      </${tag}>
    </div>
  `
}

export const initDataDrivenList = (options = {}) => {
  return new NestedSort({
    data: [
      {id: 1, text: 'One'},
      {id: 2, text: 'Two'},
    ],
    el: `#${DYNAMIC_LIST_WRAPPER_ID}`,
    ...options,
  })
}
