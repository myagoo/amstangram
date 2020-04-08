import firebase from "gatsby-plugin-firebase"
import React, { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { PrimaryButton } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Error, Title } from "./primitives"
import { Text } from "./text"
import { View } from "./view"
import { useTranslate } from "../contexts/language"

const SignupTab = ({ onSignup, switchTab }) => {
  const t = useTranslate()
  const {
    handleSubmit,
    register,
    watch,
    setError,
    errors,
    formState,
  } = useForm()

  const password = watch("password")

  const onSubmit = useCallback(
    async ({ email, username, password }) => {
      try {
        const { user } = await firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)

        await user.updateProfile({ displayName: username })

        await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set({ username })

        onSignup(user)
      } catch (error) {
        switch (error.code) {
          case "auth/weak-password":
            setError("password", "weakPassword", t("Password is too weak"))
            break
          case "auth/email-already-in-use":
            setError("email", "alreadyExists", t("Email already exists"))
            break
          case "auth/invalid-email":
            setError("email", "invalid", t("Invalid email address"))
            break
          default:
            return
        }
      }
    },
    [onSignup, setError, t]
  )

  return (
    <View
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ flex: "1", gap: 3 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <View css={{ gap: 1 }}>
          <label>{t("Email address")}</label>
          <Input
            type="email"
            name="email"
            ref={register({ required: t("Email is required") })}
          ></Input>
          {errors.email && <Error>{errors.email.message}</Error>}
        </View>

        <View css={{ gap: 1 }}>
          <label>{t("Username")}</label>
          <Input
            name="username"
            ref={register({ required: t("Username is required") })}
          ></Input>
          {errors.username && <Error>{errors.username.message}</Error>}
        </View>

        <View css={{ gap: 1 }}>
          <label>{t("Password")}</label>
          <Input
            type="password"
            name="password"
            ref={register({ required: t("Password is required") })}
          ></Input>
          {errors.password && <Error>{errors.password.message}</Error>}
        </View>

        <View css={{ gap: 1 }}>
          <label>{t("Confirm password")}</label>
          <Input
            type="password"
            name="passwordConfirm"
            ref={register({
              required: "Password is required",
              validate: (passwordConfirm) =>
                passwordConfirm === password || t("Passwords must match"),
            })}
          ></Input>
          {errors.passwordConfirm && (
            <Error>{errors.passwordConfirm.message}</Error>
          )}
        </View>
      </View>

      <PrimaryButton disabled={formState.isSubmitting} type="submit">
        {t("Sign me up !")}
      </PrimaryButton>

      <View
        css={{
          alignItems: "center",
        }}
        onClick={switchTab}
      >
        <Text
          css={{
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {t("I already have an account")}
        </Text>
      </View>
    </View>
  )
}

const SignInTab = ({ onSignin, switchTab }) => {
  const t = useTranslate()
  const { handleSubmit, register, setError, errors, formState } = useForm()

  const onSubmit = useCallback(
    async ({ email, password }) => {
      try {
        const { user } = await firebase
          .auth()
          .signInWithEmailAndPassword(email, password)

        onSignin(user)
      } catch (error) {
        switch (error.code) {
          case "auth/invalid-email":
          case "auth/user-not-found":
          case "auth/user-disabled":
            setError("email", "weakPassword", t("Unknown email address"))
            break
          case "auth/wrong-password":
            setError("password", "mismatch", t("Incorrect password"))
            break

          default:
            return
        }
      }
    },
    [onSignin, setError, t]
  )

  return (
    <View
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ flex: "1", gap: 3 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <View css={{ gap: 1 }}>
          <label>{t("Email address")}</label>
          <Input
            type="email"
            name="email"
            ref={register({ required: t("Email is required") })}
          ></Input>
          {errors.email && <Error>{errors.email.message}</Error>}
        </View>

        <View css={{ gap: 1 }}>
          <label>{t("Password")}</label>
          <Input
            type="password"
            name="password"
            ref={register({ required: t("Password is required") })}
          ></Input>
          {errors.password && <Error>{errors.password.message}</Error>}
        </View>
      </View>

      <PrimaryButton type="submit" disabled={formState.isSubmitting}>
        {t("Sign me in !")}
      </PrimaryButton>

      <View
        css={{
          alignItems: "center",
        }}
        onClick={switchTab}
      >
        <Text
          css={{
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {t("I don't have an account")}
        </Text>
      </View>
    </View>
  )
}

export const LoginDialog = ({ deferred }) => {
  const t = useTranslate()
  const [tab, setTab] = useState("signup")

  return (
    <Dialog
      title={
        tab === "signup" ? (
          <Title>{t("Create your account")}</Title>
        ) : (
          <Title>{t("Connect to your account")}</Title>
        )
      }
      onClose={() => deferred.reject("CLOSED")}
      css={{ gap: 3 }}
    >
      {tab === "signup" ? (
        <SignupTab
          onSignup={deferred.resolve}
          switchTab={() => setTab("signin")}
        ></SignupTab>
      ) : (
        <SignInTab
          onSignin={deferred.resolve}
          switchTab={() => setTab("signup")}
        ></SignInTab>
      )}
    </Dialog>
  )
}
