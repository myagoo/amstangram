import { test, expect, type Page } from "@playwright/test"
import { solveSquare } from "./solveSquare"

async function scrollToNextBatch(page: Page) {
  await page
    .getByRole("region", { name: "Tangram gallery", exact: true })
    .hover()
  await page.mouse.wheel(0, 10000)
}

test.use({ viewport: { width: 627, height: 863 }, deviceScaleFactor: 1 })
test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("sound", "off")
    localStorage.setItem("showParticles", "false")
    localStorage.setItem("test-large-gallery", "true")
  })
})

test("gallery mounts batches and preserves share and play order across them", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("test-guest", "true")
    // Observe the browser clipboard boundary, not internal sharing logic.
    document.execCommand = () => {
      ;(window as Window & { copied: string }).copied = (
        document.activeElement as HTMLTextAreaElement
      ).value
      return true
    }
  })
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page
    .getByRole("button", { name: "Tangram gallery", exact: true })
    .focus()
  await page.keyboard.press("Enter")
  const cards = page.locator('#dialogContainer svg[viewBox="0 0 200 200"]')
  await expect(cards).toHaveCount(48)
  const results = page.getByRole("region", {
    name: "Tangram gallery",
    exact: true,
  })
  await results.focus()
  await expect(results).toHaveCSS("outline-style", "solid")
  await expect(results).not.toHaveCSS("outline-color", "rgba(0, 0, 0, 0)")
  await page.keyboard.press("End")
  await expect(cards).toHaveCount(96)
  await cards.nth(55).click()
  await cards.nth(0).click()
  await scrollToNextBatch(page)
  await expect(cards).toHaveCount(120)
  await scrollToNextBatch(page)
  await expect(cards).toHaveCount(120)
  await expect(
    page.getByRole("button", { name: "Show more tangrams", exact: true })
  ).toHaveCount(0)
  const start = page.getByRole("button", {
    name: "Start 2 tangrams !",
    exact: true,
  })
  await start.locator("..").getByRole("button").last().click()
  expect(
    await page.evaluate(() => (window as Window & { copied: string }).copied)
  ).toBe("http://127.0.0.1:4179/?tangrams=gallery-055,gallery-000")
  await start.click()
  await solveSquare(page)
  await expect(page.getByText("🟩", { exact: true })).toBeVisible()
  await page
    .getByRole("button", { name: "Next", exact: true })
    .click({ timeout: 10000 })
  await solveSquare(page)
  await expect(page.getByText("🟦", { exact: true })).toBeVisible()
})

test("gallery filters reset batches without losing selected puzzles", async ({
  page,
}) => {
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  const cards = page.locator('#dialogContainer svg[viewBox="0 0 200 200"]')
  await cards.first().click()
  await scrollToNextBatch(page)
  await expect(cards).toHaveCount(96)
  await expect(page.getByText("Stuff", { exact: true })).toBeVisible()
  await page.getByRole("combobox").selectOption("starred")
  await expect(cards).toHaveCount(1)
  await expect(
    page.getByRole("button", { name: "Start 1 tangram !", exact: true })
  ).toBeVisible()
  await cards.first().click()
  await page.getByRole("combobox").selectOption("uncompleted")
  await expect(cards).toHaveCount(48)
  await page.getByRole("combobox").selectOption("pending")
  await expect(cards).toHaveCount(1)
  await page.getByRole("combobox").selectOption("all")
  await expect(cards).toHaveCount(48)
  await expect(cards.first().locator("..")).toHaveCSS("box-shadow", /4px/)
  await expect(
    page.getByRole("button", { name: "Start 2 tangrams !", exact: true })
  ).toBeVisible()
})

test("a touch long-press still opens details for an incrementally loaded card", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("test-guest", "true"))
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  await scrollToNextBatch(page)
  const card = page
    .locator('#dialogContainer svg[viewBox="0 0 200 200"]')
    .nth(55)
  await card.scrollIntoViewIfNeeded()
  const bounds = (await card.boundingBox())!
  const cdp = await page.context().newCDPSession(page)
  await cdp.send("Emulation.setTouchEmulationEnabled", {
    enabled: true,
    maxTouchPoints: 1,
  })
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height / 2 },
    ],
  })
  await page.waitForTimeout(1100)
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  })
  await expect(page.getByText("Earned 1", { exact: true })).toBeVisible()
  await page.mouse.click(1, 1)
  await expect(
    page.getByRole("region", { name: "Tangram gallery", exact: true })
  ).toBeVisible()
  await expect(
    page.locator('#dialogContainer svg[viewBox="0 0 200 200"]')
  ).toHaveCount(96)
})

test("automatic scrolling resumes after an empty filter and resets on reopen", async ({
  page,
}) => {
  await page.addInitScript(() => localStorage.setItem("test-guest", "true"))
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Tangram gallery", { exact: true }).click()
  const cards = page.locator('#dialogContainer svg[viewBox="0 0 200 200"]')
  await page.getByRole("combobox").selectOption("starred")
  await expect(cards).toHaveCount(0)
  await page.getByRole("combobox").selectOption("all")
  await expect(cards).toHaveCount(48)
  await scrollToNextBatch(page)
  await expect(cards).toHaveCount(96)
  await page.mouse.click(1, 1)
  await page.getByText("Tangram gallery", { exact: true }).click()
  await expect(cards).toHaveCount(48)
  await scrollToNextBatch(page)
  await expect(cards).toHaveCount(96)
})
