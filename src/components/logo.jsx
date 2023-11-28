import React, { useContext } from "react"
import { ThemeContext } from "css-system"
import { View } from "./view"

export const Logo = (props) => {
  const theme = useContext(ThemeContext)
  return (
    <View
      as="svg"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 467.27 512"
      {...props}
    >
      <polygon
        fill={theme.colors.shape}
        points="352.33 159.67 432.16 239.45 432.16 399.13 319.29 512 93.55 512 159.67 445.87 0 286.25 319.29 286.25 272.55 239.45 272.55 79.84 352.33 0 465.26 112.87 352.33 112.87 352.33 159.67"
      />
      <g>
        <polygon
          fill={theme.colors.pieces.mt1}
          points="272.57 79.84 272.57 239.45 352.36 319.29 432.19 399.13 432.19 239.45 352.36 159.67 352.36 112.87 465.29 112.87 352.36 0 272.57 79.84"
        />
        <polygon
          fill={theme.colors.pieces.st1}
          points="93.58 512 319.32 512 432.19 399.13 319.32 286.25 93.58 512"
        />
        <polygon
          fill={theme.colors.pieces.lt2}
          points="159.67 445.87 239.48 366.05 319.31 286.24 0.03 286.24 159.67 445.87"
        />
      </g>
    </View>
  )
}
