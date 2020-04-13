import firebase from "gatsby-plugin-firebase"
import React, { useContext, useMemo } from "react"
import { useForm } from "react-hook-form"
import { FiShare2 } from "react-icons/fi"
import { CATEGORIES, DIGITS, LETTERS } from "../constants"
import { useTranslate } from "../contexts/language"
import { NotifyContext } from "../contexts/notify"
import { UserContext } from "../contexts/user"
import { copyToClipboard } from "../utils/copyToClipboard"
import { getRandomEmoji } from "../utils/getRandomEmoji"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Similink, Title } from "./primitives"
import { Text } from "./text"
import { View } from "./view"

const ReadTangramDialog = ({ tangram, deferred }) => {
  return (
    <Dialog onClose={deferred.reject} css={{ gap: 3, minWidth: "250px" }}>
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <Card selected tangram={tangram} css={{ alignSelf: "center" }}></Card>

        <View
          css={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-end",
          }}
        >
          <Text css={{ fontSize: 5 }}>{"👏"}</Text>
          <Text css={{ fontSize: 3 }}>x{tangram.claps || 0}</Text>
        </View>
      </View>
    </Dialog>
  )
}

const SaveTangramDialog = ({ tangram, deferred }) => {
  const { currentUser } = useContext(UserContext)
  const isCreation = currentUser && !tangram.id

  const t = useTranslate()
  const notify = useContext(NotifyContext)

  const defaultValues = useMemo(
    () => ({
      category: tangram.category,
      emoji:
        tangram.category !== "digits" && tangram.category !== "letters"
          ? tangram.emoji
          : undefined,
      letterIndex:
        tangram.category === "letters"
          ? LETTERS.indexOf(tangram.emoji)
          : undefined,
      digitIndex:
        tangram.category === "digits"
          ? DIGITS.indexOf(tangram.emoji)
          : undefined,
    }),
    [tangram]
  )

  const { handleSubmit, register, watch } = useForm({ defaultValues })

  const handleDelete = async () => {
    if (window.confirm(t("Are you sure you want to delete this tangram ?"))) {
      await firebase.firestore().collection("tangrams").doc(tangram.id).delete()
      notify(t("Tangram sucessfuly deleted"))
      deferred.resolve()
    }
  }

  const onSubmit = async ({ category, emoji, letterIndex, digitIndex }) => {
    const computedEmoji =
      category === "letters"
        ? LETTERS[letterIndex]
        : category === "digits"
        ? DIGITS[digitIndex]
        : emoji
        ? emoji
        : getRandomEmoji()

    const newTangram = {
      ...tangram,
      category,
      emoji: computedEmoji,
    }

    if (isCreation) {
      await firebase
        .firestore()
        .collection("tangrams")
        .add({
          ...newTangram,
          uid: currentUser.uid,
          approved: false,
        })
      notify(t("Tangram submitted for review"))
    } else {
      await firebase
        .firestore()
        .collection("tangrams")
        .doc(tangram.id)
        .update(newTangram)
      notify(t("Tangram successfuly modified"))
    }

    deferred.resolve()
  }

  const completedEmoji = watch("emoji")
  const category = watch("category")

  return (
    <Dialog
      title={
        <Title>
          {isCreation ? t("Submit your tangram") : t("Edit your tangram")}
        </Title>
      }
      onClose={deferred.reject}
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ gap: 3, minWidth: "250px" }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <Card
          selected
          tangram={{ ...tangram, emoji: completedEmoji }}
          css={{ alignSelf: "center" }}
        ></Card>

        {tangram.approved && (
          <View
            css={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "flex-end",
            }}
          >
            <Text css={{ fontSize: 5 }}>{"👏"}</Text>
            <Text css={{ fontSize: 3 }}>x{tangram.claps || 0}</Text>
            {tangram.id && (
              <View
                as={FiShare2}
                css={{
                  cursor: "pointer",
                  size: 32,
                }}
                onClick={() => {
                  let challengeLink = `${window.location.origin}?tangram=${tangram.id}`
                  if (currentUser) {
                    challengeLink += `&uid=${currentUser.uid}`
                  }
                  copyToClipboard(challengeLink)
                  notify(t("Challenge link copied to clipboard"))
                }}
              />
            )}
          </View>
        )}

        <View css={{ gap: 2 }}>
          <label>{t("Category")}</label>
          <Input as="select" name="category" ref={register}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {t(category)}
              </option>
            ))}
          </Input>
        </View>

        {category === "digits" ? (
          <View css={{ gap: 2 }}>
            <label>{t("Victory emoji")}</label>
            <Input as="select" name="digitIndex" ref={register}>
              {DIGITS.map((digitEmoji, index) => (
                <option key={index} value={index}>
                  {digitEmoji}
                </option>
              ))}
            </Input>
          </View>
        ) : category === "letters" ? (
          <View css={{ gap: 2 }}>
            <label>{t("Victory emoji")}</label>
            <Input as="select" name="letterIndex" ref={register}>
              {LETTERS.map((letterEmoji, index) => (
                <option key={index} value={index}>
                  {letterEmoji}
                </option>
              ))}
            </Input>
          </View>
        ) : (
          <View css={{ gap: 2 }}>
            <label>{t("Victory emoji")}</label>
            <Input
              name="emoji"
              ref={register}
              placeholder={t("Leave empty for random emoji")}
            />
          </View>
        )}
      </View>
      <PrimaryButton type="submit">
        {isCreation ? t("Submit !") : t("Edit !")}
      </PrimaryButton>
      {!isCreation && (
        <View
          css={{
            alignItems: "center",
          }}
        >
          <Similink onClick={handleDelete}>{t("Or delete tangram")}</Similink>
        </View>
      )}
    </Dialog>
  )
}

export const TangramDialog = ({ tangram, deferred }) => {
  const { currentUser } = useContext(UserContext)
  const isEdit =
    currentUser &&
    (currentUser.isAdmin || !tangram.id || tangram.uid === currentUser.uid)

  return isEdit ? (
    <SaveTangramDialog tangram={tangram} deferred={deferred} />
  ) : (
    <ReadTangramDialog tangram={tangram} deferred={deferred} />
  )
}
