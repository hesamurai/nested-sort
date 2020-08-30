export const createEvent = (type, props = {}) => {
  const event = new Event(type, { bubbles: true })
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
