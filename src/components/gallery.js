import { graphql, StaticQuery } from "gatsby"
import React, { useContext, useState } from "react"
import { GalleryContext } from "../contexts/gallery"
import { CardVerso } from "./card"
import { View } from "./view"
import { Button } from "./button"
import { FiGrid, FiSave, FiX } from "react-icons/fi"
import { DEV } from "../constants"

export const Gallery = () => {
  const [galleryOpened, setGalleryOpened] = useState(false)

  const { requestSave, setSelectedTangram } = useContext(GalleryContext)

  return (
    <>
      <StaticQuery
        query={graphql`
          query GalleryQuery {
            tangrams: allSvg {
              nodes {
                content
                id
              }
            }
          }
        `}
        render={({ tangrams }) => (
          <View
            css={{
              position: "fixed",
              left: "0",
              transform: `translate3d(${galleryOpened ? 0 : "-100vw"}, 0, 0)`,
              transition: "transform .3s",
              width: "100vw",
              height: "100vh",
              background: "#ecf0f1",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              py: 3,
            }}
            deps={[galleryOpened]}
          >
            {tangrams.nodes.length > 0 ? (
              <View
                css={{
                  width: "100%",
                  height: "100%",
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, 180px)",
                  gridColumnGap: 10,
                  gridRowGap: 15,
                  justifyItems: "center",
                  alignItems: "center",
                  overflow: "auto",
                }}
              >
                {tangrams.nodes.map(tangram => {
                  let difficulty
                  let svgContent

                  try {
                    const parser = new DOMParser()
                    const document = parser.parseFromString(
                      tangram.content,
                      "image/svg+xml"
                    )
                    const svg = document.firstElementChild
                    const percent = svg.getAttribute("data-percent")

                    svgContent = svg.firstElementChild

                    difficulty =
                      percent > 50 ? "Easy" : percent > 20 ? "Medium" : "Hard"
                  } catch (e) {
                    difficulty = null
                  }

                  if (!svgContent) {
                    return null
                  }

                  return (
                    <CardVerso
                      key={tangram.id}
                      svg={tangram.content}
                      difficulty={difficulty}
                      onClick={() => {
                        setSelectedTangram(svgContent)
                        setGalleryOpened(false)
                      }}
                    />
                  )
                })}
              </View>
            ) : (
              <View>{"Aucun tangram dans la galerie"}</View>
            )}
          </View>
        )}
      />
      <Button
        onClick={() => setGalleryOpened(opened => !opened)}
        css={{
          position: "fixed",
          right: 10,
          bottom: 10,
          zIndex: 1,
          animation: "1000ms fadeIn 1000ms ease both",
        }}
      >
        <View
          as={galleryOpened ? FiX : FiGrid}
          css={{ fontSize: "30px", color: "#fff" }}
        />
      </Button>
      {DEV && (
        <Button
          onClick={requestSave}
          css={{
            position: "fixed",
            right: 10,
            bottom: 70,
            zIndex: 1,
            animation: "1000ms fadeIn 1000ms ease both",
          }}
        >
          <View as={FiSave} css={{ fontSize: "30px", color: "#fff" }} />
        </Button>
      )}
    </>
  )
}
