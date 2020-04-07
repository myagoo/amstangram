import React, { useMemo } from "react"
import { useForm } from "react-hook-form"
import { CATEGORIES, DEV } from "../constants"
import { getTangramDifficulty } from "../utils/getTangramDifficulty"
import { PrimaryButton } from "./button"
import { Card } from "./card"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { View } from "./view"
import { Title } from "./primitives"

export const SaveTangramDialog = ({ pathData, deferred }) => {
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
      title={<Title>Submit your creation</Title>}
      onClose={deferred.reject}
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ gap: 3 }}
    >
      <Card
        scale={0.75}
        completedEmoji={completedEmoji}
        selected
        tangram={tangram}
        css={{ alignSelf: "center" }}
      ></Card>

      <View css={{ gap: 1 }}>
        <label>Category</label>
        <Input
          as="select"
          name="category"
          ref={register()}
          css={{ textTransform: "capitalize" }}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Input>
      </View>

      <View css={{ gap: 1 }}>
        <label>Victory emoji</label>
        <Input
          name="emoji"
          ref={register()}
          placeholder="Leave empty for random emoji"
        />
      </View>

      {DEV && (
        <View css={{ gap: 1 }}>
          <label>Order</label>
          <Input name="order" type="number" ref={register()} />
        </View>
      )}

      <PrimaryButton type="submit">Submit !</PrimaryButton>
    </Dialog>
  )
}
