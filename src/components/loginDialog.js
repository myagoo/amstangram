import firebase from "gatsby-plugin-firebase"
import React, { useCallback, useState } from "react"
import { useForm } from "react-hook-form"
import { PrimaryButton } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Error, Title } from "./primitives"
import { Text } from "./text"
import { View } from "./view"

const SignupTab = ({ onClose, onSignup, switchTab }) => {
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
            setError("password", "weakPassword", "Password is too weak")
            break
          case "auth/email-already-in-use":
            setError("email", "alreadyExists", "Email already exists")
            break
          case "auth/invalid-email":
            setError("email", "invalid", "Invalid email address")
            break
          default:
            return
        }
      }
    },
    [onSignup, setError]
  )

  return (
    <View
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ flex: "1", gap: 3 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <View css={{ gap: 1 }}>
          <label>Email address</label>
          <Input
            type="email"
            name="email"
            ref={register({ required: "Email is required" })}
          ></Input>
          {errors.email && <Error>{errors.email.message}</Error>}
        </View>

        <View css={{ gap: 1 }}>
          <label>Username</label>
          <Input
            name="username"
            ref={register({ required: "Username is required" })}
          ></Input>
          {errors.username && <Error>{errors.username.message}</Error>}
        </View>

        <View css={{ gap: 1 }}>
          <label>Password</label>
          <Input
            type="password"
            name="password"
            ref={register({ required: "Password is required" })}
          ></Input>
          {errors.password && <Error>{errors.password.message}</Error>}
        </View>

        <View css={{ gap: 1 }}>
          <label>Confirm password</label>
          <Input
            type="password"
            name="passwordConfirm"
            ref={register({
              required: "Password is required",
              validate: (passwordConfirm) =>
                passwordConfirm === password || "Passwords must match",
            })}
          ></Input>
          {errors.passwordConfirm && (
            <Error>{errors.passwordConfirm.message}</Error>
          )}
        </View>
      </View>

      <PrimaryButton disabled={formState.isSubmitting} type="submit">
        Sign me up !
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
          I already have an account
        </Text>
      </View>
    </View>
  )
}

const SignInTab = ({ onClose, onSignin, switchTab }) => {
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
            setError("email", "weakPassword", "Unknown email address")
            break
          case "auth/wrong-password":
            setError("password", "mismatch", "Incorrect password")
            break

          default:
            return
        }
      }
    },
    [onSignin, setError]
  )

  return (
    <View
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ flex: "1", gap: 3 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <View css={{ gap: 1 }}>
          <label>Email adress</label>
          <Input
            type="email"
            name="email"
            ref={register({ required: "Email is required" })}
          ></Input>
          {errors.email && <Error>{errors.email.message}</Error>}
        </View>

        <View css={{ gap: 1 }}>
          <label>Password</label>
          <Input
            type="password"
            name="password"
            ref={register({ required: "Password is required" })}
          ></Input>
          {errors.password && <Error>{errors.password.message}</Error>}
        </View>
      </View>

      <PrimaryButton type="submit" disabled={formState.isSubmitting}>
        Sign me in !
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
          I don't have an account
        </Text>
      </View>
    </View>
  )
}

export const LoginDialog = ({ deferred }) => {
  const [tab, setTab] = useState("signup")

  return (
    <Dialog
      title={
        tab === "signup" ? (
          <Title>Create your account</Title>
        ) : (
          <Title>Connect to your account</Title>
        )
      }
      onClose={() => deferred.reject("CLOSED")}
      css={{ gap: 3 }}
    >
      {tab === "signup" ? (
        <SignupTab
          onClose={() => deferred.reject("CLOSED")}
          onSignup={deferred.resolve}
          switchTab={() => setTab("signin")}
        ></SignupTab>
      ) : (
        <SignInTab
          onClose={() => deferred.reject("CLOSED")}
          onSignin={deferred.resolve}
          switchTab={() => setTab("signup")}
        ></SignInTab>
      )}
    </Dialog>
  )
}
