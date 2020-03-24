import { useCss, ThemeContext } from "css-system"
import React, { useContext, useMemo } from "react"

const createGapRules = (flexDirection, gap, theme) => {
  if (typeof flexDirection === "string") {
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

  const gaps = typeof gap === "object" ? gap : { _: gap }
  const flexDirections = flexDirection
  const mergedBreakpointsSet = new Set([
    ...Object.keys(flexDirections),
    ...Object.keys(gaps),
  ])

  const marginTops = {}
  const marginLefts = {}
  const themeBreakpoints = ["_", ...Object.keys(theme.breakpoints)]

  for (const themeBreakpoint of themeBreakpoints) {
    if (mergedBreakpointsSet.has(themeBreakpoint) === false) {
      continue
    }

    const mergedBreakpoint = themeBreakpoint

    const directionForCurrentBreakPoint =
      flexDirections[mergedBreakpoint] != null
        ? flexDirections[mergedBreakpoint]
        : lastFlexDirection
    lastFlexDirection = directionForCurrentBreakPoint

    const gapForCurrentBreakpoint =
      gaps[mergedBreakpoint] != null ? gaps[mergedBreakpoint] : lastGap
    lastGap = gapForCurrentBreakpoint

    const isDirectionVertical =
      directionForCurrentBreakPoint === "column" ||
      directionForCurrentBreakPoint === "column-reverse"

    if (isDirectionVertical) {
      marginTops[mergedBreakpoint] = gapForCurrentBreakpoint
      marginLefts[mergedBreakpoint] = 0
    } else {
      marginLefts[mergedBreakpoint] = gapForCurrentBreakpoint
      marginTops[mergedBreakpoint] = 0
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

    const gapCssProps = useMemo(() => {
      if (gap) {
        return createGapRules(otherCssProps.flexDirection, gap, theme)
      }
    }, [gap, otherCssProps.flexDirection, theme])

    const className = useCss(
      gap
        ? {
            ...otherCssProps,
            ...gapCssProps,
          }
        : otherCssProps,
      deps
    )

    return (
      <Component
        ref={ref}
        {...props}
        className={`${className}${
          props.className ? ` ${props.className}` : ""
        }`}
      />
    )
  }
)
