import React, { useContext } from "react"
import { GalleryContext } from "../contexts/gallery"
import { useTranslate } from "../contexts/language"
import { UserContext } from "../contexts/user"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { Title } from "./primitives"
import { View } from "./view"
import { DialogContext } from "../contexts/dialog"
import { DIALOG_CLOSED_REASON } from "../constants"

export const ChallengeDialog = ({ uid, tangrams, deferred }) => {
  const t = useTranslate()
  const { showProfile, showTangram } = useContext(DialogContext)
  const { usersMetadata } = useContext(UserContext)
  const { setPlaylist } = useContext(GalleryContext)
  const username = usersMetadata[uid] ? usersMetadata[uid].username : null

  return (
    <Dialog
      title={
        <Title>
          {username
            ? t("{username} challenged you", { username })
            : t("Rise to the challenge")}
        </Title>
      }
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      css={{ gap: 3, minWidth: "268px", maxWidth: "500px" }}
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
            onBadgeClick={showProfile}
            onLongPress={showTangram}
          ></Card>
        ))}
      </View>

      <PrimaryButton
        onClick={() => {
          setPlaylist(tangrams)
          deferred.resolve()
        }}
      >
        {t("Let's go !")}
      </PrimaryButton>
    </Dialog>
  )
}
