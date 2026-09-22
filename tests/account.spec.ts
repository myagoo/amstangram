import { test, expect } from "@playwright/test"

test("email change reauthenticates with the current account and preserves its profile", async ({
  page,
}) => {
  await page.getByText("Change email address", { exact: true }).click()
  await page.locator('input[name="password"]').fill("fixture-current-password")
  await page.locator('input[name="newEmail"]').fill("updated@example.test")
  await page
    .getByRole("button", { name: "Change email address", exact: true })
    .click()
  await expect(
    page.getByText("Email address updated successfuly", { exact: true })
  ).toBeVisible()
  await expect(page.locator('input[name="newEmail"]')).toHaveCount(0)
  await expect(
    page.getByText("updated@example.test", { exact: true })
  ).toBeVisible()
  await expect(page.getByText("Tester", { exact: true })).toBeVisible()
  expect(
    await page.evaluate(async () => {
      const path = "/tests/firebase.ts"
      const { account, writes } = await import(path)
      return { ...account, writes }
    })
  ).toEqual({
    password: "fixture-current-password",
    profileUpdates: [],
    writes: [],
  })
})

test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("showParticles", "false")
    localStorage.setItem("sound", "off")
  })
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("See my profile", { exact: true }).click()
})

for (const { name, password, code, message } of [
  {
    name: "wrong password",
    password: "wrong-password",
    message: "Incorrect password",
  },
  {
    name: "invalid email",
    code: "auth/invalid-email",
    message: "Invalid email address",
  },
  {
    name: "occupied email",
    code: "auth/email-already-in-use",
    message: "Email address already in use",
  },
  {
    name: "service failure",
    code: "auth/network-request-failed",
    message: "An error occured, please retry later",
  },
]) {
  test(`email change rejects ${name} without changing the account`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    if (code)
      await page.evaluate(
        (value) => localStorage.setItem("test-email-error", value),
        code
      )
    await page.getByText("Change email address", { exact: true }).click()
    await page
      .locator('input[name="password"]')
      .fill(password ?? "fixture-current-password")
    await page.locator('input[name="newEmail"]').fill("updated@example.test")
    await page
      .getByRole("button", { name: "Change email address", exact: true })
      .click()
    await expect(page.getByText(message, { exact: true })).toBeVisible()
    await expect(page.locator('input[name="newEmail"]')).toBeVisible()
    await expect(
      page.getByText("Email address updated successfuly", { exact: true })
    ).toHaveCount(0)
    await page.getByText("Back", { exact: true }).click()
    await expect(
      page.getByText("tester@example.test", { exact: true })
    ).toBeVisible()
    await expect(page.getByText("Tester", { exact: true })).toBeVisible()
    expect(
      await page.evaluate(async () => {
        const path = "/tests/firebase.ts"
        const { account, writes } = await import(path)
        return { ...account, writes }
      })
    ).toEqual({
      password: "fixture-current-password",
      profileUpdates: [],
      writes: [],
    })
    expect(errors).toEqual([])
  })
}

test("password change updates credentials without writing profile metadata", async ({
  page,
}) => {
  await page.getByText("Change password", { exact: true }).click()
  await page.locator('input[name="password"]').fill("fixture-current-password")
  await page.locator('input[name="newPassword"]').fill("fixture-new-password")
  await page
    .locator('input[name="newPasswordConfirm"]')
    .fill("fixture-new-password")
  await page
    .getByRole("button", { name: "Change password", exact: true })
    .click()
  await expect(
    page.getByText("Password changed successfuly", { exact: true })
  ).toBeVisible()
  await expect(page.locator('input[name="newPassword"]')).toHaveCount(0)
  await expect(page.getByText("Tester", { exact: true })).toBeVisible()
  expect(
    await page.evaluate(async () => {
      const path = "/tests/firebase.ts"
      const { account, writes } = await import(path)
      return { ...account, writes }
    })
  ).toEqual({
    password: "fixture-new-password",
    profileUpdates: [],
    writes: [],
  })
})

for (const { name, password, confirmation, code, message } of [
  {
    name: "wrong current password",
    password: "wrong-password",
    message: "Incorrect password",
  },
  {
    name: "weak new password",
    code: "auth/weak-password",
    message: "Password is too weak",
  },
  {
    name: "service failure",
    code: "auth/network-request-failed",
    message: "An error occured, please retry later",
  },
  {
    name: "confirmation mismatch",
    confirmation: "different-password",
    message: "Passwords must match",
  },
]) {
  test(`password change rejects ${name} without changing credentials or profile`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    if (code)
      await page.evaluate(
        (value) => localStorage.setItem("test-password-error", value),
        code
      )
    await page.getByText("Change password", { exact: true }).click()
    await page
      .locator('input[name="password"]')
      .fill(password ?? "fixture-current-password")
    await page.locator('input[name="newPassword"]').fill("fixture-new-password")
    await page
      .locator('input[name="newPasswordConfirm"]')
      .fill(confirmation ?? "fixture-new-password")
    await page
      .getByRole("button", { name: "Change password", exact: true })
      .click()
    await expect(page.getByText(message, { exact: true })).toBeVisible()
    await expect(page.locator('input[name="newPassword"]')).toBeVisible()
    await expect(
      page.getByText("Password changed successfuly", { exact: true })
    ).toHaveCount(0)
    expect(
      await page.evaluate(async () => {
        const path = "/tests/firebase.ts"
        const { account, writes } = await import(path)
        return { ...account, writes }
      })
    ).toEqual({
      password: "fixture-current-password",
      profileUpdates: [],
      writes: [],
    })
    expect(errors).toEqual([])
  })
}
