import {
  calculatePlayerStats,
  EMPTY_PLAYER_STATS,
} from "../utils/calculatePlayerStats"
import React, { useContext, useMemo, useState } from "react"
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

export const LeaderboardDialog = ({ onClose }: { onClose(): void }) => {
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
    const stats = calculatePlayerStats(
      approvedTangrams!,
      tangramsStarredBy!,
      tangramsCompletedBy!
    )
    return Object.entries(usersMetadata!).map(([uid, metadata]) => ({
      uid,
      ...metadata,
      ...(stats[uid] ?? EMPTY_PLAYER_STATS),
    }))
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
      onClose={onClose}
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
