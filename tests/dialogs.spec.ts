import { test, expect, type Page } from "@playwright/test"

test.use({ viewport: { width: 627, height: 863 } })
test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("sound", "off")
    localStorage.setItem("showParticles", "false")
    localStorage.setItem("test-guest", "true")
  })
})

async function openSaveLogin(page: Page) {
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.evaluate(async () => {
    const path = "/tests/geometry.ts"
    ;(await import(path)).checkGeometry()
  })
  await page.locator("svg").first().click()
  await page.getByText("Save tangram", { exact: true }).click()
  await expect(
    page.getByText("Create your account", { exact: true })
  ).toBeVisible()
}

test("cancelling save-flow login returns to the game without opening a tangram dialog", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await openSaveLogin(page)
  await page.mouse.click(1, 1)
  await expect(page.locator("#dialogContainer")).toBeEmpty()
  expect(
    await page.evaluate(async () => {
      const path = "/tests/firebase.ts"
      return (await import(path)).writes
    })
  ).toEqual([])
  expect(errors).toEqual([])
})

test("successful save-flow login continues to submission", async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem("test-signin-success", "true")
  )
  await openSaveLogin(page)
  await page.getByText("I already have an account", { exact: true }).click()
  await page.locator('input[name="email"]').fill("tester@example.test")
  await page.locator('input[name="password"]').fill("fixture-current-password")
  await page.locator('#dialogContainer button[type="submit"]').click()
  await expect(
    page.getByText("Submit your tangram", { exact: true })
  ).toBeVisible()
  await page.getByRole("button", { name: "Submit!", exact: true }).click()
  await expect(page.locator("#dialogContainer")).toBeEmpty()
  const writes = await page.evaluate(async () => {
    const path = "/tests/firebase.ts"
    return (await import(path)).writes
  })
  expect(writes).toHaveLength(1)
  expect(writes[0]).toMatchObject({
    collection: "tangrams",
    data: { uid: "tester", approved: false },
  })
})

test("gallery can start without a parent menu", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/tests/lifecycle.html?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.getByRole("button", { name: "Open gallery", exact: true }).click()
  await page.getByRole("button", { name: "Play now !", exact: true }).click()
  await expect(page.locator("#dialogContainer")).toBeEmpty()
  await expect(page.locator("canvas")).toBeVisible()
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  )
  expect(errors).toEqual([])
})

test("closing a nested profile preserves gallery selection and its parent menu", async ({
  page,
}) => {
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  await page.locator('#dialogContainer svg[viewBox="0 0 200 200"]').click()
  await page.locator("#dialogContainer img").click()
  await expect(page.getByText("Tester", { exact: true })).toBeVisible()
  await page.mouse.click(1, 1)
  await expect(
    page.getByRole("button", { name: "Start 1 tangram !", exact: true })
  ).toBeVisible()
  await page.mouse.click(1, 1)
  await expect(page.getByText("Tangram gallery", { exact: true })).toBeVisible()
  await page.mouse.click(1, 1)
  await expect(page.locator("#dialogContainer")).toBeEmpty()
})

for (const accept of [true, false]) {
  test(`challenge startup can ${accept ? "accept" : "cancel"} and reach the game`, async ({
    page,
  }) => {
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.goto("/?seed=42&tangrams=square&uid=tester")
    await expect(
      page.getByText("Tester challenged you", { exact: true })
    ).toBeVisible()
    if (accept)
      await page.getByRole("button", { name: "Let's go!", exact: true }).click()
    else await page.mouse.click(1, 1)
    await expect(page.locator("#dialogContainer")).toBeEmpty()
    await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
    expect(new URL(page.url()).search).toBe("")
    expect(errors).toEqual([])
  })
}
