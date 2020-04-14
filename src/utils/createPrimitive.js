import { useCss, ThemeContext } from "css-system"
import React, { useContext } from "react"

export const extendPrimitive = (Primitive, defaultCss, defaultProps) => {
  const mergeWithDefault =
    typeof defaultCss === "function"
      ? defaultCss
      : (css) => ({
          ...defaultCss,
          ...css,
        })
  return React.forwardRef(({ css, ...props }, ref) => {
    const theme = useContext(ThemeContext)
    const mergedCss = mergeWithDefault(css, theme)

    const mergedProps = {
      ...defaultProps,
      ...props,
    }

    return <Primitive ref={ref} css={mergedCss} {...mergedProps} />
  })
}

export const createPrimitive = (defaultComponent, defaultCss, defaultProps) => {
  const mergeWithDefault =
    typeof defaultCss === "function"
      ? defaultCss
      : (css) => ({
          ...defaultCss,
          ...css,
        })
  return React.forwardRef(
    (
      { as: Component = defaultComponent, css, deps, className, ...props },
      ref
    ) => {
      const theme = useContext(ThemeContext)
      const cssClassName = useCss(mergeWithDefault(css, theme), deps)

      const mergedProps = {
        ...defaultProps,
        ...props,
      }

      return (
        <Component
          ref={ref}
          {...mergedProps}
          className={`${cssClassName} ${className || ""}`}
        />
      )
    }
  )
}