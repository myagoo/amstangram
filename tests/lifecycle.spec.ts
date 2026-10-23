import { test, expect, type Page } from "@playwright/test"
import { solveSquare } from "./solveSquare"

async function expectVictoryAnimation(page: Page) {
  await expect(page.locator("canvas")).toHaveCSS(
    "animation-name",
    "victoryPulse"
  )
}

test.use({ viewport: { width: 627, height: 863 }, deviceScaleFactor: 1 })
test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("sound", "off")
    localStorage.setItem("test-guest", "true")
    localStorage.setItem("test-two-puzzles", "true")
    localStorage.setItem("showParticles", "true")
  })
})

for (const { particles, motion } of [
  { particles: true, motion: "no-preference" },
  { particles: false, motion: "no-preference" },
  { particles: true, motion: "reduce" },
] as const) {
  test(`victory keeps the puzzle visible and Next immediate: particles ${particles}, motion ${motion}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: motion })
    await page.addInitScript(
      (particles) => localStorage.setItem("showParticles", String(particles)),
      particles
    )
    await page.goto("/?seed=42")
    await expect(page.locator("canvas")).toBeVisible()
    await solveSquare(page)
    await expect(
      page.getByRole("button", { name: "Next", exact: true })
    ).toBeEnabled({ timeout: 300 })
    expect(
      await page.evaluate(async () =>
        (await import("/tests/geometry.ts")).readProjectOpacity()
      )
    ).toBe(1)
    await expect(page.locator("canvas")).toHaveCSS(
      "animation-name",
      motion === "reduce" ? "none" : "victoryPulse"
    )
    await page.getByRole("button", { name: "Next", exact: true }).click()
    await expect(page.getByText("🟦", { exact: true })).toHaveCount(0)
    await expect(page.locator("canvas")).toHaveCSS("animation-name", "none")
  })
}

test("switching puzzles during victory cannot complete the replacement puzzle", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  await page
    .locator('#dialogContainer svg[viewBox="0 0 200 200"]')
    .nth(0)
    .click()
  await page
    .getByRole("button", { name: "Start 1 tangram !", exact: true })
    .click()
  await solveSquare(page)
  await expectVictoryAnimation(page)
  // Victory controls now mount immediately; the menu follows gameplay in the DOM.
  await page.locator("svg").last().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  await page
    .locator('#dialogContainer svg[viewBox="0 0 200 200"]')
    .nth(1)
    .click()
  await page
    .getByRole("button", { name: "Start 1 tangram !", exact: true })
    .click()
  // Cross the old puzzle's 1.5-second victory deadline after replacing it.
  await page.waitForTimeout(1800)
  await expect(page.getByText("🟦", { exact: true })).toHaveCount(0)
  await expect(page.locator("canvas")).toBeVisible()
  expect(errors).toEqual([])
})

test("replacing an advanced playlist initializes only its first puzzle", async ({
  page,
}) => {
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  const cards = page.locator('#dialogContainer svg[viewBox="0 0 200 200"]')
  await cards.nth(0).click()
  await cards.nth(1).click()
  await page
    .getByRole("button", { name: "Start 2 tangrams !", exact: true })
    .click()
  await solveSquare(page)
  await page
    .getByRole("button", { name: "Next", exact: true })
    .click({ timeout: 10000 })
  await page.evaluate(async () => {
    const path = "/tests/geometry.ts"
    ;(await import(path)).trackProjectSetups()
  })
  await page.locator("svg").first().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  await page
    .locator('#dialogContainer svg[viewBox="0 0 200 200"]')
    .nth(0)
    .click()
  await page
    .getByRole("button", { name: "Start 1 tangram !", exact: true })
    .click()
  await expect(page.locator("#dialogContainer")).toBeEmpty()
  expect(
    await page.evaluate(async () => {
      const path = "/tests/geometry.ts"
      return (await import(path)).projectSetups.count
    })
  ).toBe(1)
  await expect(page.getByText("🟦", { exact: true })).toHaveCount(0)
})

test("turning particles off during victory still completes safely", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await solveSquare(page)
  await expectVictoryAnimation(page)
  await page.locator("svg").last().click()
  await page.getByText("Settings", { exact: true }).click()
  await page
    .locator("label")
    .filter({ hasText: /^Show particles$/ })
    .locator("..")
    .getByText("No", { exact: true })
    .click()
  await expect(page.getByText("🟦", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Next", exact: true })
  ).toBeVisible({ timeout: 10000 })
  expect(errors).toEqual([])
})

test("unmount during victory disposes the project and remount starts a fresh puzzle", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/tests/lifecycle.html?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  const read = () =>
    page.evaluate(async () => {
      const path = "/tests/geometry.ts"
      const { countProjects, readScene } = await import(path)
      return {
        projects: countProjects(),
        tans: countProjects() ? readScene().tans : [],
      }
    })
  const initial = await read()
  expect(initial.projects).toBe(1)
  await solveSquare(page)
  await expectVictoryAnimation(page)
  await page.getByRole("button", { name: "Unmount game", exact: true }).click()
  await expect(page.locator("canvas")).toHaveCount(0)
  await page.waitForTimeout(1800)
  expect(await read()).toEqual({ projects: 0, tans: [] })
  await page.getByRole("button", { name: "Mount game", exact: true }).click()
  await expect(page.locator("canvas")).toBeVisible()
  expect(await read()).toEqual(initial)
  await expect(page.getByText("🟦", { exact: true })).toHaveCount(0)
  expect(errors).toEqual([])
})
