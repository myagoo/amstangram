import React, { useContext, useMemo, useState, useEffect } from "react"
import { useTranslate } from "../contexts/language"
import { TangramsContext } from "../contexts/tangrams"
import { UserContext } from "../contexts/user"
import { Badge } from "./badge"
import { Dialog } from "./dialog"
import { Title } from "./primitives"
import { Text } from "./text"
import { View } from "./view"
import { Input } from "./input"
import firebase from "gatsby-plugin-firebase"
import { Loader } from "./loader"
import { DialogContext } from "../contexts/dialog"
import { DIALOG_CLOSED_REASON } from "../constants"

export const LeaderboardDialog = ({ deferred }) => {
  const t = useTranslate()
  const { showProfile } = useContext(DialogContext)

  const { currentUser, usersMetadata } = useContext(UserContext)
  const tangrams = useContext(TangramsContext)
  const [selected, setSelected] = useState("claps")
  const [users, setUsers] = useState(null)

  const handleChange = (e) => {
    setSelected(e.target.value)
  }

  const handleBadgeClick = (uid) => {
    showProfile(uid)
  }

  useEffect(() => {
    const asyncTask = async () => {
      const clapsByUserId = {}
      const createdTangramsByUserId = {}
      for (const { uid, claps, approved } of tangrams) {
        if (!clapsByUserId[uid]) {
          clapsByUserId[uid] = 0
          createdTangramsByUserId[uid] = 0
        }
        clapsByUserId[uid] += claps || 0
        if (approved) {
          createdTangramsByUserId[uid] += 1
        }
      }

      const users = await Promise.all(
        Object.keys(usersMetadata).map(async (uid) => {
          const userMetadata = usersMetadata[uid]

          // All data stats should be stored under a single collection
          const snapshot = await firebase
            .firestore()
            .collection("users")
            .doc(uid)
            .collection("tangrams")
            .get()

          return {
            uid,
            ...userMetadata,
            claps: clapsByUserId[uid] || 0,
            completed: snapshot.size,
            created: createdTangramsByUserId[uid] || 0,
          }
        })
      )

      setUsers(users)
    }

    asyncTask()
  }, [tangrams, usersMetadata])

  const sortedUsers = useMemo(() => {
    if (!users) {
      return
    }
    return users.sort((userA, userB) => userB[selected] - userA[selected])
  }, [users, selected])

  return (
    <Dialog
      title={<Title>{t("Leaderboard")}</Title>}
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      css={{
        gap: 3,
        minWidth: "268px",
        maxWidth: "500px",
        flex: "1",
        overflow: "auto",
      }}
    >
      {!sortedUsers ? (
        <Loader css={{ m: "auto" }}></Loader>
      ) : (
        <>
          <Input as="select" value={selected} onChange={handleChange}>
            <option value="claps">{t("Claps")}</option>
            <option value="completed">{t("Completed tangrams")}</option>
            <option value="created">{t("Created tangrams")}</option>
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
      )}
    </Dialog>
  )
}
