import React, { useContext, useMemo, useState } from "react"
import { DIALOG_CLOSED_REASON } from "../constants"
import { DialogContext } from "../contexts/dialog"

import { TangramsContext } from "../contexts/tangrams"
import { UserContext } from "../contexts/user"
import { Badge } from "./badge"
import { Dialog } from "./dialog"
import { Select } from "./input"
import { Title, InlineIcon } from "./primitives"
import { Text } from "./text"
import { View } from "./view"
import { useIntl } from "react-intl"
import { FiStar } from "react-icons/fi"
import { GalleryContext } from "../contexts/gallery"

export const LeaderboardDialog = ({
  deferred,
}: {
  deferred: import("../utils/deferred").Deferred
}) => {
  const intl = useIntl()

  const { showProfile } = useContext(DialogContext)

  const { currentUser, usersMetadata } = useContext(UserContext)
  const { approvedTangrams } = useContext(TangramsContext)
  const { tangramsStarredBy, tangramsCompletedBy } = useContext(GalleryContext)
  const [selected, setSelected] = useState(() => {
    const storedSelectedLeaderBoard = window.localStorage.getItem(
      "selectedLeaderboard"
    )

    return ["stars", "completed", "created"].includes(
      storedSelectedLeaderBoard!
    )
      ? storedSelectedLeaderBoard!
      : "stars"
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelected(e.target.value)
    window.localStorage.setItem("selectedLeaderboard", e.target.value)
  }

  const handleBadgeClick = (uid: string) => {
    showProfile(uid)
  }

  const users = useMemo(() => {
    const starsByUserId: Record<string, number> = {}
    const createdTangramsByUserId: Record<string, number> = {}
    const completedTangramsByUserId: Record<string, number> = {}
    for (const { id, uid } of approvedTangrams!) {
      if (!createdTangramsByUserId[uid]) {
        createdTangramsByUserId[uid] = 0
        starsByUserId[uid] = 0
      }

      for (const starredByUid in tangramsStarredBy![id]) {
        if (starredByUid !== uid && tangramsStarredBy![id][starredByUid]) {
          starsByUserId[uid] += 1
        }
      }

      createdTangramsByUserId[uid] += 1

      for (const completedByUid in tangramsCompletedBy![id]) {
        if (!completedTangramsByUserId[completedByUid]) {
          completedTangramsByUserId[completedByUid] = 0
        }
        completedTangramsByUserId[completedByUid] += 1
      }
    }

    return Object.keys(usersMetadata!).map((uid) => {
      const userMetadata = usersMetadata![uid]

      return {
        uid,
        ...userMetadata,
        stars: starsByUserId[uid] || 0,
        completed: completedTangramsByUserId[uid] || 0,
        created: createdTangramsByUserId[uid] || 0,
      }
    })
  }, [approvedTangrams, tangramsStarredBy, tangramsCompletedBy, usersMetadata])

  const sortedUsers = useMemo(() => {
    if (!users) {
      return
    }
    return users.sort(
      (userA, userB) =>
        userB[selected as "stars" | "completed" | "created"] -
        userA[selected as "stars" | "completed" | "created"]
    )
  }, [users, selected])

  return (
    <Dialog
      title={<Title>{intl.formatMessage({ id: "Leaderboard" })}</Title>}
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      css={{
        gap: "3",
      }}
    >
      {
        <>
          <Select value={selected} onChange={handleChange}>
            <option value="stars">
              {intl.formatMessage({ id: "Stars earned" })}
            </option>
            <option value="completed">
              {intl.formatMessage({ id: "Completed tangrams" })}
            </option>
            <option value="created">
              {intl.formatMessage({ id: "Created tangrams" })}
            </option>
          </Select>

          <View css={{ flex: "1", overflow: "auto", gap: "2" }}>
            {sortedUsers!.map(({ uid, username, ...stats }, index) => (
              <View
                key={uid}
                css={{
                  flexDirection: "row",
                  gap: "2",
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
              >
                <Badge
                  uid={uid}
                  size="badge"
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
                >
                  {username}
                </Text>
                <Text>
                  {stats[selected as "stars" | "completed" | "created"]}
                  {selected === "stars" && (
                    <>
                      {" "}
                      <InlineIcon
                        icon={FiStar}
                        css={{ fill: "currentColor" }}
                      />
                    </>
                  )}
                </Text>
              </View>
            ))}
          </View>
        </>
      }
    </Dialog>
  )
}
