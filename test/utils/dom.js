import {
  STATIC_LIST_WRAPPER_ID
} from './constants'

export const createEvent = (type, props = {}) => {
  const event = new Event(type, { bubbles: props.bubbles || true })
  delete props.bubbles // this property cannot be set on the event object
  Object.assign(
    event,
    {
      clientX: 0,
      clientY: 0,
      dataTransfer: {
        setData: jest.fn()
      }
    },
    props
  )

  return event
}

export const initServerRenderedList = () => {
  document.body.innerHTML = `
    <div>
      <ul id="${STATIC_LIST_WRAPPER_ID}">
        <li data-id="1">One</li>
        <li data-id="2">Two</li>
        <li data-id="3">Three</li>
      </ul>
    </div>
  `
}
