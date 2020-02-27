import { useCss } from "@css-system/use-css"
import React, { useContext } from "react"
import { ThemeContext } from "../contexts/theme"

const createGapRules = (flexDirection, gap) => {
  if (!Array.isArray(flexDirection)) {
    const isDirectionVertical =
      flexDirection === "column" || flexDirection === "column-reverse"

    return {
      "& > * + *": {
        [isDirectionVertical ? "mt" : "ml"]: gap,
      },
    }
  }

  let lastFlexDirection
  let lastGap

  const gaps = Array.isArray(gap) ? gap : [gap]
  const flexDirections = flexDirection

  const breakpointsLength = Math.max(flexDirections.length, gaps.length)

  const marginTops = new Array(breakpointsLength)
  const marginLefts = new Array(breakpointsLength)

  for (let index = 0; index < breakpointsLength; index++) {
    const directionForCurrentBreakPoint =
      flexDirections[index] != null ? flexDirections[index] : lastFlexDirection
    lastFlexDirection = directionForCurrentBreakPoint

    const gapForCurrentBreakpoint = gaps[index] != null ? gaps[index] : lastGap
    lastGap = gapForCurrentBreakpoint

    const isDirectionVertical =
      directionForCurrentBreakPoint === "column" ||
      directionForCurrentBreakPoint === "column-reverse"

    if (isDirectionVertical) {
      marginTops[index] = gapForCurrentBreakpoint
      marginLefts[index] = 0
    } else {
      marginTops[index] = 0
      marginLefts[index] = gapForCurrentBreakpoint
    }
  }
  return {
    "& > * + *": {
      mt: marginTops,
      ml: marginLefts,
    },
  }
}

export const View = React.forwardRef(
  ({ as: Component = "div", css, deps, ...props }, ref) => {
    const { gap, ...otherCssProps } = {
      display: "flex",
      minWidth: 0,
      minHeight: 0,
      flex: "none",
      alignSelf: "auto",
      alignItems: "stretch",
      flexDirection: "column",
      justifyContent: "flex-start",
      ...css,
    }

    const theme = useContext(ThemeContext)

    const className = useCss(
      gap
        ? {
            ...otherCssProps,
            ...createGapRules(otherCssProps.flexDirection, gap),
          }
        : otherCssProps,
      theme,
      deps
    )

    return <Component ref={ref} className={className} {...props} />
  }
)
