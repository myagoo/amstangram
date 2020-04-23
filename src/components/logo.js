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
        points="150.42 449.71 88.07 512 300.84 512 407.19 405.64 407.19 255.22 331.99 180.01 331.99 135.95 438.39 135.95 331.99 29.54 256.77 104.81 256.77 255.22 300.84 299.29 0 299.29 150.42 449.71"
      />
      <g>
        <polygon
          fill={theme.colors.pieces.mt1}
          points="284.96 75.53 284.96 226.53 360.44 302.06 435.97 377.59 435.97 226.53 360.44 151.06 360.44 106.78 467.27 106.78 360.44 0 284.96 75.53"
        />
        <polygon
          fill={theme.colors.pieces.st1}
          points="115.62 484.37 329.19 484.37 435.97 377.59 329.19 270.81 115.62 484.37"
        />
        <polygon
          fill={theme.colors.pieces.lt2}
          points="178.15 421.81 253.66 346.3 329.18 270.79 27.13 270.79 178.15 421.81"
        />
      </g>
    </View>
  )
}
