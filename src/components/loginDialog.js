import firebase from "gatsby-plugin-firebase"
import React, { useCallback, useContext, useState } from "react"
import { useForm } from "react-hook-form"
import { useIntl } from "react-intl"
import { DIALOG_CLOSED_REASON } from "../constants"
import { NotifyContext } from "../contexts/notify"
import { PrimaryButton } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Error, Similink, Title } from "./primitives"
import { View } from "./view"

const ResetPasswordTab = ({ setTab }) => {
  const intl = useIntl()
  const notify = useContext(NotifyContext)

  const { handleSubmit, register, setError, errors, formState } = useForm()

  const onSubmit = useCallback(
    async ({ email }) => {
      try {
        await firebase.auth().sendPasswordResetEmail(email)
        setTab("signin")
        notify(intl.formatMessage({ id: "Reset password email sent" }))
      } catch (error) {
        switch (error.code) {
          case "auth/invalid-email":
          case "auth/user-not-found":
          case "auth/user-disabled":
            setError(
              "email",
              "invalid",
              intl.formatMessage({ id: "Unknown email address" })
            )
            break
          default:
            notify(
              intl.formatMessage(
                { id: "An error occured, please retry later" },
                { email }
              )
            )
        }
      }
    },
    [setError, intl]
  )

  return (
    <View
      as="form"
      name="reset"
      onSubmit={handleSubmit(onSubmit)}
      css={{ gap: 4 }}
    >
      <View css={{ gap: 2 }}>
        <label>{intl.formatMessage({ id: "Email address" })}</label>
        <Input
          type="email"
          name="email"
          ref={register({
            required: intl.formatMessage({ id: "Email address is required" }),
          })}
        ></Input>
        {errors.email && <Error>{errors.email.message}</Error>}
      </View>

      <View css={{ gap: 3 }}>
        <PrimaryButton type="submit" disabled={formState.isSubmitting}>
          {intl.formatMessage({ id: "Send the reset mail!" })}
        </PrimaryButton>

        <View
          css={{
            alignItems: "center",
          }}
        >
          <Similink onClick={() => setTab("signin")}>
            {intl.formatMessage({ id: "Back" })}
          </Similink>
        </View>
      </View>
    </View>
  )
}

const SignUpTab = ({ onSignUp, setTab }) => {
  const intl = useIntl()

  const { handleSubmit, register, watch, setError, errors, formState } =
    useForm()

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

        onSignUp({
          uid: user.uid,
          ...userMetadata,
          firebaseUser: user,
        })
      } catch (error) {
        switch (error.code) {
          case "auth/weak-password":
            setError(
              "password",
              "weakPassword",
              intl.formatMessage({ id: "Password is too weak" })
            )
            break
          case "auth/email-already-in-use":
            setError(
              "email",
              "alreadyExists",
              intl.formatMessage({ id: "Email address already in use" })
            )
            break
          case "auth/invalid-email":
            setError(
              "email",
              "invalid",
              intl.formatMessage({ id: "Invalid email address" })
            )
            break
          default:
            return
        }
      }
    },
    [onSignUp, setError, intl]
  )

  return (
    <View
      as="form"
      name="signup"
      autoComplete="off"
      onSubmit={handleSubmit(onSubmit)}
      css={{ gap: 4 }}
    >
      <View css={{ gap: 3 }}>
        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Username" })}</label>
          <Input
            name="username"
            ref={register({
              required: intl.formatMessage({ id: "Username is required" }),
            })}
          ></Input>
          {errors.username && <Error>{errors.username.message}</Error>}
        </View>

        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Email address" })}</label>
          <Input
            type="email"
            name="email"
            ref={register({
              required: intl.formatMessage({ id: "Email address is required" }),
            })}
          ></Input>
          {errors.email && <Error>{errors.email.message}</Error>}
        </View>

        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Password" })}</label>
          <Input
            autoComplete="new-password"
            type="password"
            name="password"
            ref={register({
              required: intl.formatMessage({ id: "Password is required" }),
            })}
          ></Input>
          {errors.password && <Error>{errors.password.message}</Error>}
        </View>

        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Confirm password" })}</label>
          <Input
            autoComplete="off"
            type="password"
            name="passwordConfirm"
            ref={register({
              required: "Password is required",
              validate: (passwordConfirm) =>
                passwordConfirm === password ||
                intl.formatMessage({ id: "Passwords must match" }),
            })}
          ></Input>
          {errors.passwordConfirm && (
            <Error>{errors.passwordConfirm.message}</Error>
          )}
        </View>
      </View>

      <View css={{ gap: 3 }}>
        <PrimaryButton disabled={formState.isSubmitting} type="submit">
          {intl.formatMessage({ id: "Sign me up!" })}
        </PrimaryButton>

        <View
          css={{
            alignItems: "center",
          }}
        >
          <Similink onClick={() => setTab("signin")}>
            {intl.formatMessage({ id: "I already have an account" })}
          </Similink>
        </View>
      </View>
    </View>
  )
}

const SignInTab = ({ onSignIn, setTab }) => {
  const intl = useIntl()

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

        onSignIn({
          uid: user.uid,
          ...userMetadata,
          firebaseUser: user,
        })
      } catch (error) {
        switch (error.code) {
          case "auth/invalid-email":
          case "auth/user-not-found":
          case "auth/user-disabled":
            setError(
              "email",
              "invalid",
              intl.formatMessage({ id: "Unknown email address" })
            )
            break
          case "auth/wrong-password":
            setError(
              "password",
              "mismatch",
              intl.formatMessage({ id: "Incorrect password" })
            )
            break

          default:
            return
        }
      }
    },
    [onSignIn, setError, intl]
  )

  return (
    <View
      as="form"
      name="signin"
      onSubmit={handleSubmit(onSubmit)}
      css={{ gap: 4 }}
    >
      <View css={{ gap: 3 }}>
        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Email address" })}</label>
          <Input
            type="email"
            name="email"
            ref={register({
              required: intl.formatMessage({ id: "Email address is required" }),
            })}
          ></Input>
          {errors.email && <Error>{errors.email.message}</Error>}
        </View>

        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Password" })}</label>
          <Input
            type="password"
            name="password"
            ref={register({
              required: intl.formatMessage({ id: "Password is required" }),
            })}
          ></Input>
          {errors.password && <Error>{errors.password.message}</Error>}
          <Similink
            css={{ alignSelf: "flex-end", fontSize: 2 }}
            onClick={() => setTab("reset")}
          >
            {intl.formatMessage({ id: "Forgot password?" })}
          </Similink>
        </View>
      </View>

      <View css={{ gap: 3 }}>
        <PrimaryButton type="submit" disabled={formState.isSubmitting}>
          {intl.formatMessage({ id: "Sign me in!" })}
        </PrimaryButton>

        <View
          css={{
            alignItems: "center",
          }}
        >
          <Similink onClick={() => setTab("signup")}>
            {intl.formatMessage({ id: "I don't have an account" })}
          </Similink>
        </View>
      </View>
    </View>
  )
}

export const LoginDialog = ({ deferred }) => {
  const intl = useIntl()

  const notify = useContext(NotifyContext)

  const [tab, setTab] = useState("signup")

  const handleLogin = (currentUser) => {
    deferred.resolve(currentUser)
    notify(
      intl.formatMessage(
        { id: "Logged in as {username}" },
        { username: currentUser.username }
      )
    )
  }

  return (
    <Dialog
      title={
        tab === "signup" ? (
          <Title>{intl.formatMessage({ id: "Create your account" })}</Title>
        ) : tab === "signin" ? (
          <Title>{intl.formatMessage({ id: "Connect to your account" })}</Title>
        ) : (
          <Title>{intl.formatMessage({ id: "Reset your password" })}</Title>
        )
      }
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
    >
      {tab === "signup" ? (
        <SignUpTab onSignUp={handleLogin} setTab={setTab}></SignUpTab>
      ) : tab === "signin" ? (
        <SignInTab onSignIn={handleLogin} setTab={setTab}></SignInTab>
      ) : (
        <ResetPasswordTab setTab={setTab} />
      )}
    </Dialog>
  )
}
