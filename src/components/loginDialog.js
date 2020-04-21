import firebase from "gatsby-plugin-firebase"
import React, { useCallback, useState, useContext } from "react"
import { useForm } from "react-hook-form"
import { useTranslate } from "../contexts/language"
import { PrimaryButton } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Error, Similink, Title } from "./primitives"
import { View } from "./view"
import { NotifyContext } from "../contexts/notify"
import { DIALOG_CLOSED_REASON } from "../constants"

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

        const userMetadata = { username, signupDate: Date.now() }

        await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .set(userMetadata)

        onSignup({
          uid: user.uid,
          ...userMetadata,
          firebaseUser: user,
        })
      } catch (error) {
        switch (error.code) {
          case "auth/weak-password":
            setError("password", "weakPassword", t("Password is too weak"))
            break
          case "auth/email-already-in-use":
            setError(
              "email",
              "alreadyExists",
              t("Email address already in use")
            )
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
        <View css={{ gap: 2 }}>
          <label>{t("Email address")}</label>
          <Input
            type="email"
            name="email"
            ref={register({ required: t("Email address is required") })}
          ></Input>
          {errors.email && <Error>{errors.email.message}</Error>}
        </View>

        <View css={{ gap: 2 }}>
          <label>{t("Username")}</label>
          <Input
            name="username"
            ref={register({ required: t("Username is required") })}
          ></Input>
          {errors.username && <Error>{errors.username.message}</Error>}
        </View>

        <View css={{ gap: 2 }}>
          <label>{t("Password")}</label>
          <Input
            type="password"
            name="password"
            ref={register({ required: t("Password is required") })}
          ></Input>
          {errors.password && <Error>{errors.password.message}</Error>}
        </View>

        <View css={{ gap: 2 }}>
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
      >
        <Similink onClick={switchTab}>
          {t("I already have an account")}
        </Similink>
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

        const snapshot = await firebase
          .firestore()
          .collection("users")
          .doc(user.uid)
          .get()

        const userMetadata = snapshot.data()

        onSignin({
          uid: user.uid,
          ...userMetadata,
          firebaseUser: user,
        })
      } catch (error) {
        switch (error.code) {
          case "auth/invalid-email":
          case "auth/user-not-found":
          case "auth/user-disabled":
            setError("email", "invalid", t("Unknown email address"))
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
        <View css={{ gap: 2 }}>
          <label>{t("Email address")}</label>
          <Input
            type="email"
            name="email"
            ref={register({ required: t("Email address is required") })}
          ></Input>
          {errors.email && <Error>{errors.email.message}</Error>}
        </View>

        <View css={{ gap: 2 }}>
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
      >
        <Similink onClick={switchTab}>{t("I don't have an account")}</Similink>
      </View>
    </View>
  )
}

export const LoginDialog = ({ deferred }) => {
  const t = useTranslate()
  const notify = useContext(NotifyContext)

  const [tab, setTab] = useState("signup")

  const handleLogin = (currentUser) => {
    deferred.resolve(currentUser)
    notify(t("Logged in as {username}", { username: currentUser.username }))
  }

  return (
    <Dialog
      title={
        tab === "signup" ? (
          <Title>{t("Create your account")}</Title>
        ) : (
          <Title>{t("Connect to your account")}</Title>
        )
      }
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      css={{ gap: 3 }}
    >
      {tab === "signup" ? (
        <SignupTab
          onSignup={handleLogin}
          switchTab={() => setTab("signin")}
        ></SignupTab>
      ) : (
        <SignInTab
          onSignin={handleLogin}
          switchTab={() => setTab("signup")}
        ></SignInTab>
      )}
    </Dialog>
  )
}
