import { useCss } from "css-system"
import React from "react"

export const extendPrimitive = (Primitive, defaultCss, defaultProps) => {
  return React.forwardRef(({ css, ...props }, ref) => {
    const mergedCss = {
      ...defaultCss,
      ...css,
    }

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
      const cssClassName = useCss(mergeWithDefault(css), deps)

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
