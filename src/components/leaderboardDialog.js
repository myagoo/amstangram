import React, { useContext, useMemo, useState } from "react"
import { DIALOG_CLOSED_REASON } from "../constants"
import { DialogContext } from "../contexts/dialog"
import { GalleryContext } from "../contexts/gallery"

import { TangramsContext } from "../contexts/tangrams"
import { UserContext } from "../contexts/user"
import { Badge } from "./badge"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Title } from "./primitives"
import { Text } from "./text"
import { View } from "./view"
import { useIntl } from "react-intl"

export const LeaderboardDialog = ({ deferred }) => {
  const intl = useIntl()

  const { showProfile } = useContext(DialogContext)

  const { currentUser, usersMetadata } = useContext(UserContext)
  const { approvedTangrams } = useContext(TangramsContext)
  const { completedTangrams } = useContext(GalleryContext)
  const [selected, setSelected] = useState(
    () => window.localStorage.getItem("selectedLeaderboard") || "claps"
  )

  const handleChange = (e) => {
    setSelected(e.target.value)
    window.localStorage.setItem("selectedLeaderboard", e.target.value)
  }

  const handleBadgeClick = (uid) => {
    showProfile(uid)
  }

  const users = useMemo(() => {
    const clapsByUserId = {}
    const createdTangramsByUserId = {}
    for (const { uid, claps } of approvedTangrams) {
      if (!clapsByUserId[uid]) {
        clapsByUserId[uid] = 0
        createdTangramsByUserId[uid] = 0
      }
      clapsByUserId[uid] += claps || 0
      createdTangramsByUserId[uid] += 1
    }

    return Object.keys(usersMetadata).map((uid) => {
      const userMetadata = usersMetadata[uid]

      return {
        uid,
        ...userMetadata,
        claps: clapsByUserId[uid] || 0,
        completed: completedTangrams[uid]
          ? Object.keys(completedTangrams[uid]).length
          : 0,
        created: createdTangramsByUserId[uid] || 0,
      }
    })
  }, [completedTangrams, approvedTangrams, usersMetadata])

  const sortedUsers = useMemo(() => {
    if (!users) {
      return
    }
    return users.sort((userA, userB) => userB[selected] - userA[selected])
  }, [users, selected])

  return (
    <Dialog
      title={<Title>{intl.formatMessage({ id: "Leaderboard" })}</Title>}
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      css={{
        gap: 3,
        minWidth: "268px",
        maxWidth: "500px",
        flex: "1",
        overflow: "auto",
      }}
    >
      {
        <>
          <Input as="select" value={selected} onChange={handleChange}>
            <option value="claps">{intl.formatMessage({ id: "Claps" })}</option>
            <option value="completed">
              {intl.formatMessage({ id: "Completed tangrams" })}
            </option>
            <option value="created">
              {intl.formatMessage({ id: "Created tangrams" })}
            </option>
          </Input>

          <View css={{ flex: "1", overflow: "auto", gap: 2 }}>
            {sortedUsers.map(({ uid, username, ...stats }, index) => (
              <View
                key={uid}
                css={{
                  flexDirection: "row",
                  gap: 2,
                  alignItems: "center",
                  fontSize:
                    index === 0
                      ? "1.6em"
                      : index === 1
                      ? "1.4em"
                      : index === 2
                      ? "1.2em"
                      : undefined,
                }}
                deps={[index]}
              >
                <Badge
                  uid={uid}
                  size={32}
                  onClick={() => handleBadgeClick(uid)}
                ></Badge>
                <Text
                  css={{
                    flex: "1",
                    fontWeight:
                      currentUser && currentUser.uid === uid
                        ? "bold"
                        : undefined,
                  }}
                  deps={[currentUser, uid]}
                >
                  {username}
                </Text>
                <Text>
                  {stats[selected]}
                  {selected === "claps" && "👏"}
                </Text>
              </View>
            ))}
          </View>
        </>
      }
    </Dialog>
  )
}
