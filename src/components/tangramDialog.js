import firebase from "gatsby-plugin-firebase"
import React, { useContext, useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { useIntl, FormattedMessage } from "react-intl"
import { CATEGORIES, DIALOG_CLOSED_REASON, DIGITS, LETTERS } from "../constants"
import { NotifyContext } from "../contexts/notify"
import { UserContext } from "../contexts/user"
import { getRandomEmoji } from "../utils/getRandomEmoji"
import { recomputePathData } from "../utils/recomputePathData"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Error, Hint, Similink, Title, InlineIcon } from "./primitives"
import { Text } from "./text"
import { View } from "./view"
import { FiStar } from "react-icons/fi"
import { GalleryContext } from "../contexts/gallery"

const ReadTangramDialog = ({ tangram, deferred }) => {
  const { tangramsStarredBy } = useContext(GalleryContext)

  const stars = useMemo(() => {
    let stars = 0
    for (const starredByUid in tangramsStarredBy[tangram.id]) {
      if (tangramsStarredBy[tangram.id][starredByUid]) {
        stars += 1
      }
    }
    return stars
  }, [tangram, tangramsStarredBy])

  return (
    <Dialog
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      css={{ gap: 3 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1", alignItems: "center" }}>
        <Card selected tangram={tangram}></Card>
        <Text css={{ fontSize: 2 }}>
          <FormattedMessage
            id="Earned {stars}"
            values={{
              stars,
              starIcon: () => (
                <InlineIcon
                  icon={FiStar}
                  css={{ fill: "currentColor" }}
                ></InlineIcon>
              ),
            }}
          ></FormattedMessage>
        </Text>
      </View>
    </Dialog>
  )
}

const SaveTangramDialog = ({ tangram, deferred }) => {
  const intl = useIntl()
  const notify = useContext(NotifyContext)
  const { currentUser } = useContext(UserContext)
  const [tangramCopy, setTangramCopy] = useState(() => ({ ...tangram }))
  const { tangramsStarredBy } = useContext(GalleryContext)

  const isCreation = currentUser && !tangram.id

  const defaultValues = useMemo(
    () => ({
      path: tangram.path,
      category: tangram.category,
      emoji:
        tangram.category !== "digits" && tangram.category !== "letters"
          ? tangram.emoji
          : getRandomEmoji(),
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

  const {
    handleSubmit,
    register,
    watch,
    errors,
    setError,
    clearError,
  } = useForm({
    defaultValues,
  })

  const { path, category, emoji, letterIndex, digitIndex } = watch()

  useEffect(() => {
    try {
      const pathData = recomputePathData(path)
      setTangramCopy((prevTangramCopy) => ({
        ...prevTangramCopy,
        ...pathData,
      }))
      clearError("path")
    } catch (error) {
      setError("path", "invalid", intl.formatMessage({ id: "Invalid path" }))
    }
  }, [path, setError, clearError, intl])

  useEffect(() => {
    const computedEmoji =
      category === "letters"
        ? LETTERS[letterIndex]
        : category === "digits"
        ? DIGITS[digitIndex]
        : emoji
        ? emoji
        : getRandomEmoji()

    setTangramCopy((prevTangramCopy) => ({
      ...prevTangramCopy,
      emoji: computedEmoji,
    }))
  }, [category, emoji, letterIndex, digitIndex])

  useEffect(() => {
    setTangramCopy((prevTangramCopy) => ({
      ...prevTangramCopy,
      category,
    }))
  }, [category])

  const handleDelete = async () => {
    if (
      window.confirm(
        intl.formatMessage({
          id: "Are you sure you want to delete this tangram?",
        })
      )
    ) {
      await firebase.firestore().collection("tangrams").doc(tangram.id).delete()
      notify(intl.formatMessage({ id: "Tangram deleted successfuly" }))
      deferred.resolve()
    }
  }

  const onSubmit = async () => {
    if (isCreation) {
      await firebase
        .firestore()
        .collection("tangrams")
        .add({
          ...tangramCopy,
          uid: currentUser.uid,
          approved: false,
        })
      notify(intl.formatMessage({ id: "Tangram submitted for review" }))
    } else {
      await firebase
        .firestore()
        .collection("tangrams")
        .doc(tangram.id)
        .update(tangramCopy)
      notify(intl.formatMessage({ id: "Tangram modified successfuly" }))
    }

    deferred.resolve()
  }

  const stars = useMemo(() => {
    if (!tangram.approved) {
      return 0
    }

    let stars = 0

    for (const starredByUid in tangramsStarredBy[tangram.id]) {
      if (tangramsStarredBy[tangram.id][starredByUid]) {
        stars += 1
      }
    }
    return stars
  }, [tangram, tangramsStarredBy])

  return (
    <Dialog
      title={
        <Title>
          {isCreation
            ? intl.formatMessage({ id: "Submit your tangram" })
            : intl.formatMessage({ id: "Edit your tangram" })}
        </Title>
      }
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ gap: 3 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <Card
          showStroke={currentUser.isAdmin}
          selected
          completed
          tangram={tangramCopy}
          css={{ alignSelf: "center" }}
        ></Card>

        {tangram.approved && (
          <Text css={{ alignSelf: "center", fontSize: 2 }}>
            <FormattedMessage
              id="Earned {stars}"
              values={{
                stars,
                starIcon: () => (
                  <InlineIcon
                    icon={FiStar}
                    css={{ fill: "currentColor" }}
                  ></InlineIcon>
                ),
              }}
            ></FormattedMessage>
          </Text>
        )}

        {isCreation && !currentUser.isAdmin && (
          <Hint>
            <FormattedMessage
              id="A moderator will have to approve your tangram. It can be deleted or edited at any time."
              values={{ br: () => <br /> }}
            ></FormattedMessage>
          </Hint>
        )}

        {currentUser && currentUser.isAdmin && (
          <>
            <View css={{ gap: 2 }}>
              <label>{intl.formatMessage({ id: "Path" })}</label>
              <Input as="textarea" name="path" ref={register}></Input>
              {errors.path && <Error>{errors.path.message}</Error>}
            </View>
          </>
        )}

        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Category" })}</label>
          <Input as="select" name="category" ref={register}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {intl.formatMessage({ id: category })}
              </option>
            ))}
          </Input>
        </View>

        {category === "digits" ? (
          <View css={{ gap: 2 }}>
            <label>{intl.formatMessage({ id: "Victory emoji" })}</label>
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
            <label>{intl.formatMessage({ id: "Victory emoji" })}</label>
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
            <label>{intl.formatMessage({ id: "Victory emoji" })}</label>
            <Input name="emoji" ref={register} />
            <Hint>
              {intl.formatMessage({ id: "Leave empty for random emoji" })}
            </Hint>
          </View>
        )}
      </View>
      <PrimaryButton type="submit">
        {isCreation
          ? intl.formatMessage({ id: "Submit!" })
          : intl.formatMessage({ id: "Edit!" })}
      </PrimaryButton>
      {!isCreation && (
        <View
          css={{
            alignItems: "center",
          }}
        >
          <Similink onClick={handleDelete}>
            {intl.formatMessage({ id: "Or delete tangram" })}
          </Similink>
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
