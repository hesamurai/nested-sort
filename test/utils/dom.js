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
