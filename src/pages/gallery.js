import React, { useContext } from "react"
import { useHistory } from "react-router-dom"
import { CardVerso } from "../components/card"
import { GalleryContext } from "../components/gallery-provider"
import { View } from "../components/view"

export const Gallery = () => {
  const { tangrams, setSelectedTangram } = useContext(GalleryContext)
  const history = useHistory()

  return (
    <View
      width="100%"
      height="100%"
      background="#ecf0f1"
      display="flex"
      justifyContent="center"
      alignItems="center"
      overflowY="scroll"
    >
      {tangrams.length > 0 ? (
        <View
          width="100%"
          height="100%"
          display="grid"
          gridTemplateColumns="repeat(auto-fill, 180px)"
          gridColumnGap={10}
          gridRowGap={15}
          gridAutoRows={220}
          justifyContent="center"
          alignContent="center"
        >
          {tangrams.map((tangram, index) => (
            <CardVerso
              key={index}
              tangram={tangram}
              width={128}
              height={178}
              onClick={() => {
                history.push("/")
                setSelectedTangram(tangram.svg)
              }}
              style={{
                cursor: "pointer",
              }}
            />
          ))}
        </View>
      ) : (
        <View>{"Aucun tangram dans la galerie"}</View>
      )}
    </View>
  )
}
