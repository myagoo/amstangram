import { test, expect } from "@playwright/test"

test.use({ viewport: { width: 627, height: 863 }, deviceScaleFactor: 1 })

test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("showParticles", "false")
    localStorage.setItem("sound", "off")
    localStorage.setItem("test-guest", "true")
  })
})

test("settings preserve layout, theme switching and the saved theme", async ({
  page,
}) => {
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await expect(
    page.getByRole("link", { name: "Version 0.2.8 🥟.🐼.💬", exact: true })
  ).toBeVisible()
  await page.getByText("Settings", { exact: true }).click()
  const select = page.getByRole("combobox")
  await expect(select).toHaveCSS("padding", "8px")
  await expect(select).toHaveCSS("border-radius", "8px")
  await expect(page.getByRole("button", { name: "Reset tips" })).toHaveCSS(
    "padding",
    "16px"
  )
  await expect(
    page.locator("#dialogContainer > div").last().locator(":scope > div")
  ).toHaveScreenshot("settings-light.png", { animations: "disabled" })
  const theme = page
    .locator("label")
    .filter({ hasText: /^Theme$/ })
    .locator("..")
  await theme.locator("svg").last().click()
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(21, 20, 26)"
  )
  await expect(select).toHaveCSS("background-color", "rgb(89, 89, 89)")
  await expect(
    page.locator("#dialogContainer > div").last().locator(":scope > div")
  ).toHaveScreenshot("settings-dark.png", { animations: "disabled" })
  await page.reload()
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(21, 20, 26)"
  )
})

test("gallery preserves card layout, selection and nested icon styling", async ({
  page,
}) => {
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  await expect(page.getByRole("button", { name: "Play now !" })).toBeVisible()
  await expect(
    page.locator("#dialogContainer > div").last().locator(":scope > div")
  ).toHaveScreenshot("gallery.png", { animations: "disabled" })
  await page.locator('#dialogContainer svg[viewBox="0 0 200 200"]').click()
  await expect(
    page.getByRole("button", { name: "Start 1 tangram !" })
  ).toBeVisible()
  await expect(
    page.locator("#dialogContainer > div").last().locator(":scope > div")
  ).toHaveScreenshot("gallery-selected.png", { animations: "disabled" })
})

test("sound controls enable real audio playback and mute subsequent actions", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const start = AudioBufferSourceNode.prototype.start
    const playback = { count: 0 }
    Object.assign(window, { testPlayback: playback })
    AudioBufferSourceNode.prototype.start = function (...args) {
      // Observe the browser boundary without replacing Howler or audio playback.
      if (this.buffer && this.buffer.length > 1) playback.count++
      return start.apply(this, args)
    }
  })
  const starts = () =>
    page.evaluate(
      () =>
        (window as Window & { testPlayback: { count: number } }).testPlayback
          .count
    )
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Settings", { exact: true }).click()
  expect(await starts()).toBe(0)
  const sounds = page
    .locator("label")
    .filter({ hasText: /^Sounds$/ })
    .locator("..")
  await sounds.locator("svg").last().click()
  await expect.poll(starts).toBeGreaterThan(0)
  await sounds.locator("svg").first().click()
  const mutedStarts = await starts()
  const theme = page
    .locator("label")
    .filter({ hasText: /^Theme$/ })
    .locator("..")
  await theme.locator("svg").last().click()
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(21, 20, 26)"
  )
  expect(await starts()).toBe(mutedStarts)
  expect(await page.evaluate(() => localStorage.getItem("sound"))).toBe("off")
})
