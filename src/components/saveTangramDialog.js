import React, { useMemo } from "react"
import { useForm } from "react-hook-form"
import { CATEGORIES, DEV } from "../constants"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Title } from "./primitives"
import { View } from "./view"
import { useTranslate } from "../contexts/language"

export const SaveTangramDialog = ({ pathData, deferred }) => {
  const t = useTranslate()
  const { handleSubmit, register, watch } = useForm()

  const onSubmit = ({ category, emoji, order: rawOrder }) => {
    const order = rawOrder ? parseInt(rawOrder, 10) : null
    deferred.resolve({
      ...pathData,
      category,
      label: Date.now().toString(36),
      emoji: emoji.trim() || null,
      order,
    })
  }

  const completedEmoji = watch("emoji")

  const tangram = useMemo(
    () => ({
      difficulty: getTangramDifficulty(pathData),
      ...pathData,
    }),
    [pathData]
  )

  return (
    <Dialog
      title={<Title>{t("Submit your creation")}</Title>}
      onClose={deferred.reject}
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ gap: 3 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <Card
          completedEmoji={completedEmoji}
          selected
          tangram={tangram}
          css={{ alignSelf: "center" }}
        ></Card>

        <View css={{ gap: 1 }}>
          <label>{t("Category")}</label>
          <Input as="select" name="category" ref={register()}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {t(category)}
              </option>
            ))}
          </Input>
        </View>

        <View css={{ gap: 1 }}>
          <label>{t("Victory emoji")}</label>
          <Input
            name="emoji"
            ref={register()}
            placeholder={t("Leave empty for random emoji")}
          />
        </View>

        {DEV && (
          <View css={{ gap: 1 }}>
            <label>{t("Order")}</label>
            <Input name="order" type="number" ref={register()} />
          </View>
        )}
      </View>

      <PrimaryButton type="submit">{t("Submit !")}</PrimaryButton>
    </Dialog>
  )
}
