import { useState } from "react"

export const useLongPress = (callback, ms) => {
  const [data, setData] = useState(null)

  const handleStart = (event) => {
    if (data && event.touches && event.touches.length !== 1) {
      clearTimeout(data.timeoutId)
    } else {
      const startEvent = event.touches ? event.touches.item(0) : event
      setData({
        timeoutId: setTimeout(callback, ms),
        startEvent: {
          clientX: startEvent.clientX,
          clientY: startEvent.clientY,
        },
      })
    }
  }

  const handleMove = (event) => {
    if (!data) {
      return
    }
    let moveEvent = event.touches ? event.touches.item(0) : event
    const distance = Math.sqrt(
      Math.pow(moveEvent.clientX - data.startEvent.clientX, 2) +
        Math.pow(moveEvent.clientY - data.startEvent.clientY, 2)
    )
    if (distance > 10) {
      clearTimeout(data.timeoutId)
    }
  }

  const handleEnd = () => {
    if (!data) {
      return
    }
    clearTimeout(data.timeoutId)
  }

  return {
    onMouseDown: handleStart,
    onMouseUp: handleEnd,
    onMouseMove: handleMove,
    onMouseLeave: handleEnd,
    onTouchStart: handleStart,
    onTouchEnd: handleEnd,
    onTouchMove: handleMove,
  }
}
