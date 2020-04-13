import { useCallback, useRef } from "react"

const isTouchEvent = (event) => {
  return "touches" in event
}

const preventDefault = (event) => {
  if (!isTouchEvent(event)) return

  if (event.touches.length < 2 && event.preventDefault) {
    event.preventDefault()
  }
}

export const useLongPress = (
  callback,
  { isPreventDefault = false, delay = 1000 } = {}
) => {
  const timeout = useRef()
  const target = useRef()

  const start = useCallback(
    (event) => {
      // prevent ghost click on mobile devices
      if (isPreventDefault && event.target) {
        event.target.addEventListener("touchend", preventDefault, {
          passive: false,
        })
        target.current = event.target
      }
      timeout.current = setTimeout(() => callback(event), delay)
    },
    [callback, delay]
  )

  const clear = useCallback(() => {
    // clearTimeout and removeEventListener
    timeout.current && clearTimeout(timeout.current)

    if (isPreventDefault && target.current) {
      target.current.removeEventListener("touchend", preventDefault)
    }
  }, [])

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchEnd: clear,
  }
}
