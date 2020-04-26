import firebase from "gatsby-plugin-firebase"
import React, { useCallback, useContext, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { DIALOG_CLOSED_REASON } from "../constants"
import { GalleryContext } from "../contexts/gallery"
import { LanguageContext } from "../contexts/language"
import { NotifyContext } from "../contexts/notify"
import { TangramsContext } from "../contexts/tangrams"
import { UserContext } from "../contexts/user"
import { Badge } from "./badge"
import { DangerButton, PrimaryButton } from "./button"
import { Dialog } from "./dialog"
import { Input } from "./input"
import { Error, Similink, Title } from "./primitives"
import { Text } from "./text"
import { View } from "./view"
import { useIntl } from "react-intl"

const ChangeEmailForm = ({ currentUser, onClose }) => {
  const intl = useIntl()

  const { updateEmail } = useContext(UserContext)

  const notify = useContext(NotifyContext)
  const { handleSubmit, register, setError, errors, formState } = useForm()

  const onSubmit = useCallback(
    async ({ password, newEmail }) => {
      try {
        await updateEmail(currentUser, password, newEmail)
        notify(intl.formatMessage({ id: "Email address updated sucessfuly" }))
        onClose()
      } catch (error) {
        switch (error.code) {
          case "auth/email-already-in-use":
            setError(
              "newEmail",
              "alreadyExists",
              intl.formatMessage({ id: "Email address already in use" })
            )
            break
          case "auth/invalid-email":
            setError(
              "newEmail",
              "invalid",
              intl.formatMessage({ id: "Invalid email address" })
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
            notify(
              intl.formatMessage({ id: "An error occured, please retry later" })
            )
            throw error
        }
      }
    },
    [currentUser, updateEmail, setError, onClose, notify, intl]
  )

  return (
    <View
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ flex: "1", gap: 4 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
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
        </View>
        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "New email address" })}</label>
          <Input
            type="email"
            name="newEmail"
            ref={register({
              required: intl.formatMessage({ id: "Email address is required" }),
            })}
          ></Input>
          {errors.newEmail && <Error>{errors.newEmail.message}</Error>}
        </View>
      </View>

      <View css={{ gap: 3 }}>
        <PrimaryButton disabled={formState.isSubmitting} type="submit">
          {intl.formatMessage({ id: "Change email address" })}
        </PrimaryButton>

        <View
          css={{
            alignItems: "center",
          }}
        >
          <Similink onClick={onClose}>
            {intl.formatMessage({ id: "Back" })}
          </Similink>
        </View>
      </View>
    </View>
  )
}

const ChangeUsernameForm = ({ currentUser, onClose }) => {
  const intl = useIntl()

  const { updateUsername } = useContext(UserContext)

  const notify = useContext(NotifyContext)
  const { handleSubmit, register, errors, formState } = useForm()

  const onSubmit = useCallback(
    async ({ newUsername }) => {
      try {
        await updateUsername(currentUser, newUsername)
        notify(intl.formatMessage({ id: "Username updated sucessfuly" }))
        onClose()
      } catch (error) {
        notify(
          intl.formatMessage({ id: "An error occured, please retry later" })
        )
        throw error
      }
    },
    [currentUser, updateUsername, onClose, notify, intl]
  )

  return (
    <View
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ flex: "1", gap: 4 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "New username" })}</label>
          <Input
            type="text"
            name="newUsername"
            ref={register({
              required: intl.formatMessage({ id: "Username is required" }),
            })}
          ></Input>
          {errors.newUsername && <Error>{errors.newUsername.message}</Error>}
        </View>
      </View>

      <View css={{ gap: 3 }}>
        <PrimaryButton disabled={formState.isSubmitting} type="submit">
          {intl.formatMessage({ id: "Change username" })}
        </PrimaryButton>
        <View
          css={{
            alignItems: "center",
          }}
        >
          <Similink onClick={onClose}>
            {intl.formatMessage({ id: "Back" })}
          </Similink>
        </View>
      </View>
    </View>
  )
}

const ChangePasswordForm = ({ currentUser, onClose }) => {
  const intl = useIntl()

  const { updateUsername } = useContext(UserContext)

  const notify = useContext(NotifyContext)

  const {
    handleSubmit,
    register,
    watch,
    setError,
    errors,
    formState,
  } = useForm()

  const newPassword = watch("newPassword")

  const onSubmit = useCallback(
    async ({ password, newPassword }) => {
      try {
        await updateUsername(currentUser, password, newPassword)
        notify(intl.formatMessage({ id: "Password changed sucessfuly" }))
        onClose()
      } catch (error) {
        switch (error.code) {
          case "auth/weak-password":
            setError(
              "newPassword",
              "weakPassword",
              intl.formatMessage({ id: "Password is too weak" })
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
            notify(
              intl.formatMessage({ id: "An error occured, please retry later" })
            )
            return
        }
      }
    },
    [currentUser, updateUsername, onClose, setError, notify, intl]
  )

  return (
    <View
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      css={{ flex: "1", gap: 4 }}
    >
      <View css={{ gap: 3, overflow: "auto", flex: "1" }}>
        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Current password" })}</label>
          <Input
            type="password"
            name="password"
            ref={register({
              required: intl.formatMessage({ id: "Password is required" }),
            })}
          ></Input>
          {errors.password && <Error>{errors.password.message}</Error>}
        </View>
        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "New password" })}</label>
          <Input
            type="password"
            name="newPassword"
            ref={register({
              required: intl.formatMessage({ id: "Password is required" }),
            })}
          ></Input>
          {errors.newPassword && <Error>{errors.newPassword.message}</Error>}
        </View>

        <View css={{ gap: 2 }}>
          <label>{intl.formatMessage({ id: "Confirm new password" })}</label>
          <Input
            type="password"
            name="newPasswordConfirm"
            ref={register({
              required: "Password is required",
              validate: (newPasswordConfirm) =>
                newPasswordConfirm === newPassword ||
                intl.formatMessage({ id: "Passwords must match" }),
            })}
          ></Input>
          {errors.newPasswordConfirm && (
            <Error>{errors.newPasswordConfirm.message}</Error>
          )}
        </View>
      </View>

      <View css={{ gap: 3 }}>
        <PrimaryButton disabled={formState.isSubmitting} type="submit">
          {intl.formatMessage({ id: "Change password" })}
        </PrimaryButton>
        <View
          css={{
            alignItems: "center",
          }}
        >
          <Similink onClick={onClose}>
            {intl.formatMessage({ id: "Back" })}
          </Similink>
        </View>
      </View>
    </View>
  )
}
export const ProfileDialog = ({ uid, deferred }) => {
  const intl = useIntl()
  const notify = useContext(NotifyContext)

  const { language } = useContext(LanguageContext)
  const { completedTangrams } = useContext(GalleryContext)
  const { currentUser, usersMetadata } = useContext(UserContext)
  const { username, signupDate } = usersMetadata[uid]
  const [changeEmailRequested, setChangeEmailRequested] = useState(false)
  const [changeUsernameRequested, setChangeUsernameRequested] = useState(false)
  const [changePasswordRequested, setChangePasswordRequested] = useState(false)
  const { approvedTangrams } = useContext(TangramsContext)

  const { claps, completed, created } = useMemo(() => {
    let claps = 0
    let created = 0
    for (const tangram of approvedTangrams) {
      if (tangram.uid === uid) {
        claps += tangram.claps || 0
        created++
      }
    }
    return {
      claps,
      completed: completedTangrams[uid]
        ? Object.keys(completedTangrams[uid]).length
        : 0,
      created,
    }
  }, [completedTangrams, approvedTangrams, uid])

  const handleLogout = async () => {
    if (
      window.confirm(
        intl.formatMessage({ id: "Are you sure you want to log out?" })
      )
    ) {
      await firebase.auth().signOut()
      deferred.reject(DIALOG_CLOSED_REASON)
      notify(intl.formatMessage({ id: "Logged out" }))
    }
  }

  return (
    <Dialog
      onClose={() => deferred.reject(DIALOG_CLOSED_REASON)}
      css={{
        flex: "1",
        minWidth: "268px",
        overflow: "auto",
        pt: 4,
        mt: -4,
        gap: 3,
      }}
    >
      {changeEmailRequested ? (
        <ChangeEmailForm
          currentUser={currentUser}
          onClose={() => setChangeEmailRequested(false)}
        ></ChangeEmailForm>
      ) : changeUsernameRequested ? (
        <ChangeUsernameForm
          currentUser={currentUser}
          onClose={() => setChangeUsernameRequested(false)}
        ></ChangeUsernameForm>
      ) : changePasswordRequested ? (
        <ChangePasswordForm
          currentUser={currentUser}
          onClose={() => setChangePasswordRequested(false)}
        />
      ) : (
        <View css={{ gap: 4 }}>
          <View css={{ gap: 3, alignItems: "center" }}>
            <Badge uid={uid} size={86} css={{}}></Badge>
            <Title>{username}</Title>
            <View css={{ gap: 2, fontSize: 2, alignItems: "center" }}>
              {currentUser && uid === currentUser.uid && (
                <Text css={{ fontSize: 2 }}>
                  {currentUser.firebaseUser.email}
                </Text>
              )}
              <Text css={{ fontSize: 2 }}>
                {intl.formatMessage(
                  { id: "Joined {signupDate}" },
                  {
                    signupDate: new Intl.DateTimeFormat(language).format(
                      signupDate
                    ),
                  }
                )}
              </Text>
              <Text>
                {intl.formatMessage(
                  { id: "Completed {completed}/{total} tangrams" },
                  {
                    completed,
                    total: approvedTangrams.length,
                  }
                )}
              </Text>
              <Text>
                {intl.formatMessage(
                  { id: "Created {created} tangrams" },
                  {
                    created,
                  }
                )}
              </Text>
              <Text>
                {intl.formatMessage(
                  { id: "Earned {claps} 👏" },
                  {
                    claps,
                  }
                )}
              </Text>
            </View>
          </View>
          <View css={{ gap: 3, alignItems: "center" }}>
            <Similink onClick={() => setChangeEmailRequested(true)}>
              {intl.formatMessage({ id: "Change email address" })}
            </Similink>
            <Similink onClick={() => setChangeUsernameRequested(true)}>
              {intl.formatMessage({ id: "Change username" })}
            </Similink>
            <Similink onClick={() => setChangePasswordRequested(true)}>
              {intl.formatMessage({ id: "Change password" })}
            </Similink>
          </View>

          <DangerButton onClick={handleLogout}>
            {intl.formatMessage({ id: "Log out" })}
          </DangerButton>
        </View>
      )}
    </Dialog>
  )
}
