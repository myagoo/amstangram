import { test, expect } from "@playwright/test"

test("authentication failures retain their field message", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  await page.addInitScript(() => localStorage.setItem("test-guest", "true"))
  await page.goto("/")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Log in", { exact: true }).click()
  await page.getByText("I already have an account", { exact: true }).click()
  await page.locator('form[name="signin"] input[name="email"]').fill("tester@example.test")
  await page.locator('form[name="signin"] input[name="password"]').fill("fixture-only-password")
  await page.getByRole("button", { name: "Sign me in!", exact: true }).click()
  await expect(page.getByText("Incorrect password", { exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, route => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("showParticles", "false")
    localStorage.setItem("sound", "off")
  })
})

test("gallery play, tan transforms, and saving the current arrangement", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  await page.goto("/")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  // Select the existing gallery entry through the visible menu.
  await page.locator("svg").first().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  await expect(page.getByText("Geometric", { exact: true })).toBeVisible()
  await page.getByText("Play now !", { exact: true }).click()
  await expect(page.locator("#dialogContainer")).toBeEmpty()

  // Use the same public Paper.js scene and geometry helpers as gameplay.
  const geometry = await page.evaluate(async () => {
    const modulePath = "/tests/geometry.ts"
    const { checkGeometry } = await import(modulePath)
    return checkGeometry()
  })
  expect(geometry.originalArea).toBeGreaterThan(0)
  expect(geometry.rotated).toBe(true)
  expect(geometry.reflected).toBe(true)
  expect(geometry.snapped).toBe(true)
  expect(geometry.difficulties).toEqual([2, 2, 1, 1, 0, 0])
  expect(geometry.edges).toBe(21)
  expect(geometry.complete).toBe(true)
  await page.locator("svg").first().click()
  await page.getByText("Save tangram", { exact: true }).click()
  await expect(page.getByText("Submit your tangram", { exact: true })).toBeVisible()
  const previewPath = await page.locator("#dialogContainer svg path").first().getAttribute("d")
  expect(await page.evaluate(async ({ expected, actual }) => {
    const modulePath = "/tests/geometry.ts"
    return (await import(modulePath)).sameOutline(expected, actual)
  }, { expected: geometry.path, actual: previewPath })).toBe(true)
  await page.locator('#dialogContainer button[type="submit"]').click()
  await expect(page.locator("#dialogContainer")).toBeEmpty()
  const writes = await page.evaluate(async () => {
    const modulePath = "/tests/firebase.ts"
    return (await import(modulePath)).writes
  })
  expect(writes).toHaveLength(1)
  expect(writes[0]).toMatchObject({
    collection: "tangrams", data: {
      path: previewPath, edges: 21, uid: "tester", approved: false,
    }
  })
  expect(errors).toEqual([])
})
