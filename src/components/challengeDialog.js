import React, { useContext } from "react"
import { useIntl } from "react-intl"
import { DIALOG_CLOSED_REASON } from "../constants"
import { GalleryContext } from "../contexts/gallery"
import { UserContext } from "../contexts/user"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { Title } from "./primitives"
import { View } from "./view"

export const ChallengeDialog = ({ uid, tangrams, deferred }) => {
  const intl = useIntl()
  const { usersMetadata } = useContext(UserContext)
  const { setPlaylist } = useContext(GalleryContext)
  const username = usersMetadata[uid] ? usersMetadata[uid].username : null

  return (
    <Dialog
      title={
        <Title>
          {username
            ? intl.formatMessage(
                { id: "{username} challenged you" },
                {
                  username,
                }
              )
            : intl.formatMessage(
                { id: "Rise to the challenge" },
                {
                  username,
                }
              )}
        </Title>
      }
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      css={{ gap: 3, overflow: "initial", maxWidth: "568px" }}
    >
      <View
        css={{
          flex: "1",
          overflow: "auto",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          m: -1,
        }}
      >
        {tangrams.map((tangram) => (
          <Card
            key={tangram.id}
            selected
            tangram={tangram}
            css={{
              m: 1,
            }}
          ></Card>
        ))}
      </View>

      <PrimaryButton
        onClick={() => {
          setPlaylist(tangrams)
          deferred.resolve()
        }}
      >
        {intl.formatMessage({ id: "Let's go!" })}
      </PrimaryButton>
    </Dialog>
  )
}
