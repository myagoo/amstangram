import { SCALE_BIAS } from "../constants"

export const getScaleFactor = canvas => {
  const minSize = Math.min(canvas.width, canvas.height)

  return minSize / window.devicePixelRatio / SCALE_BIAS
}
