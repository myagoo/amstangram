import { test, expect, type Page } from "@playwright/test"
import { solveGenerated } from "./solveGenerated"

test.use({ viewport: { width: 627, height: 863 }, deviceScaleFactor: 1 })
test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("sound", "off")
    localStorage.setItem("showParticles", "false")
  })
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
})

async function openGeneration(page: Page) {
  await page.locator('svg[viewBox="0 0 24 24"]').first().click()
  await page
    .getByRole("button", { name: "Random tangram", exact: true })
    .click()
}

async function startGeneration(page: Page) {
  await openGeneration(page)
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await expect(page.locator("#dialogContainer")).toBeEmpty({ timeout: 20000 })
}

const readTarget = (page: Page) =>
  page.evaluate(async () =>
    (await import("/tests/generationGeometry.ts")).readGeneratedTarget()
  )

test("difficulty persists without starting; styled native slider remains keyboard accessible", async ({
  page,
}) => {
  await openGeneration(page)
  const slider = page.getByRole("slider", { name: "Difficulty", exact: true })
  await slider.focus()
  await page.keyboard.press("ArrowRight")
  await expect(slider).toHaveValue("9")
  await expect(slider).toHaveCSS("outline-style", "solid")
  await expect(slider).toHaveCSS("height", "44px")
  await expect(
    page.getByRole("button", { name: "Cancel", exact: true })
  ).toHaveCount(0)
  await page.getByRole("button", { name: "Close", exact: true }).last().click()
  await page
    .getByRole("button", { name: "Random tangram", exact: true })
    .click()
  await expect(slider).toHaveValue("9")
  await page.reload()
  await expect(page.locator("canvas")).toBeVisible()
  await openGeneration(page)
  await expect(slider).toHaveValue("9")
  await expect(page.locator("#notificationContainer")).toBeEmpty()
  await expect(slider.locator("../..")).toHaveScreenshot(
    "generation-settings.png",
    { animations: "disabled" }
  )
  await page.getByRole("button", { name: "Close", exact: true }).last().click()
  await page.getByRole("button", { name: "Settings", exact: true }).click()
  await page
    .locator("label")
    .filter({ hasText: /^Theme$/ })
    .locator("..")
    .locator("svg")
    .last()
    .click()
  await page.getByRole("button", { name: "Close", exact: true }).last().click()
  await page
    .getByRole("button", { name: "Random tangram", exact: true })
    .click()
  await expect(slider).toHaveCSS("color", "rgb(26, 108, 189)")
  await page.setViewportSize({ width: 390, height: 844 })
  await expect(slider.locator("../..")).toHaveScreenshot(
    "generation-settings-dark-mobile.png",
    { animations: "disabled" }
  )
})

test("invalid or unavailable preference storage does not break generation settings", async ({
  page,
}) => {
  for (const invalid of ["null", '"9"', "-1", "18", "1.5", "bad json"]) {
    await page.evaluate(
      (value) => localStorage.setItem("generationDifficulty", value),
      invalid
    )
    await openGeneration(page)
    await expect(page.getByRole("slider")).toHaveValue("8")
    await page
      .getByRole("button", { name: "Close", exact: true })
      .last()
      .click()
    await page.getByRole("button", { name: "Close", exact: true }).click()
  }
  await page.evaluate(() => {
    const get = Storage.prototype.getItem
    const set = Storage.prototype.setItem
    Storage.prototype.getItem = function (key) {
      if (key === "generationDifficulty") throw new Error("Unavailable")
      return get.call(this, key)
    }
    Storage.prototype.setItem = function (key, value) {
      if (key === "generationDifficulty") throw new Error("Unavailable")
      set.call(this, key, value)
    }
  })
  await openGeneration(page)
  await page.getByRole("slider").fill("7")
  await expect(page.getByRole("slider")).toHaveValue("7")
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await expect(page.locator("#dialogContainer")).toBeEmpty({ timeout: 20000 })
  expect((await readTarget(page)).edges).toBe(15)
})

test("prefetch starts during play; victory waits, then Next consumes one ready puzzle and prefetches again", async ({
  page,
}) => {
  let requests = 0
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route("**/src/generation/generate.worker.ts*", async (route) => {
    requests++
    if (requests === 2) await gate
    await route.continue().catch(() => {})
  })
  try {
    await startGeneration(page)
    await expect.poll(() => requests).toBe(2)
    const first = await readTarget(page)
    // A newly selected preference does not change the active game's difficulty.
    await openGeneration(page)
    await page.getByRole("slider").fill("7")
    await page
      .getByRole("button", { name: "Close", exact: true })
      .last()
      .click()
    await page.getByRole("button", { name: "Close", exact: true }).click()
    await solveGenerated(page)
    const waiting = page.getByRole("button", {
      name: "Generating…",
      exact: true,
    })
    await expect(waiting).toBeDisabled({ timeout: 10000 })
    await expect(waiting).toHaveAttribute("aria-busy", "true")
    expect(await readTarget(page)).toEqual(first)
    release()
    const next = page.getByRole("button", { name: "Next", exact: true })
    await expect(next).toBeEnabled({ timeout: 20000 })
    expect(requests).toBe(2)
    await next.click()
    await expect(page.getByText("🎲", { exact: true })).toHaveCount(0)
    await expect.poll(() => requests).toBe(3)
    const second = await readTarget(page)
    expect(second.edges).toBe(first.edges)
    expect(second.path).not.toBe(first.path)
    await solveGenerated(page, 378494188)
    await expect(next).toBeEnabled({ timeout: 20000 })
    expect(requests).toBe(3)
    expect(
      await page.evaluate(
        async () => (await import("/tests/firebase.ts")).writes
      )
    ).toEqual([])
  } finally {
    release()
  }
})

test("leaving generated play terminates prefetch and late results cannot replace the gallery", async ({
  page,
}) => {
  let requests = 0
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.evaluate(() => {
    const state = window as Window & { terminatedWorkers: number }
    state.terminatedWorkers = 0
    const terminate = Worker.prototype.terminate
    Worker.prototype.terminate = function () {
      state.terminatedWorkers++
      terminate.call(this)
    }
  })
  await page.route("**/src/generation/generate.worker.ts*", async (route) => {
    requests++
    if (requests === 2) await gate
    await route.continue().catch(() => {})
  })
  try {
    await startGeneration(page)
    await expect.poll(() => requests).toBe(2)
    await page.locator('svg[viewBox="0 0 24 24"]').first().click()
    await page
      .getByRole("button", { name: "Tangram gallery", exact: true })
      .click()
    await page.getByRole("button", { name: "Play now !", exact: true }).click()
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as Window & { terminatedWorkers: number }).terminatedWorkers
        )
      )
      .toBe(2)
    release()
    await page.waitForTimeout(200)
    expect((await readTarget(page)).edges).toBe(4)
    expect(requests).toBe(2)
  } finally {
    release()
  }
})

test("failed background work offers retry without replacing the solved puzzle", async ({
  page,
}) => {
  let requests = 0
  await page.route("**/src/generation/generate.worker.ts*", async (route) => {
    requests++
    if (requests === 2) await route.abort()
    else await route.continue()
  })
  await startGeneration(page)
  const first = await readTarget(page)
  await solveGenerated(page)
  await expect(page.getByRole("alert")).toHaveText(
    "Generation failed. Please try again.",
    { timeout: 10000 }
  )
  await page.getByRole("button", { name: "Retry", exact: true }).click()
  await expect(
    page.getByRole("button", { name: "Next", exact: true })
  ).toBeEnabled({ timeout: 20000 })
  expect(requests).toBe(3)
  expect(await readTarget(page)).toEqual(first)
})

test("explicit save during generated play still submits the live arrangement, not the target", async ({
  page,
}) => {
  await startGeneration(page)
  const target = await readTarget(page)
  const geometry = await page.evaluate(async () =>
    (await import("/tests/geometry.ts")).checkGeometry()
  )
  await page.locator('svg[viewBox="0 0 24 24"]').first().click()
  await page.getByRole("button", { name: "Save tangram", exact: true }).click()
  await expect(
    page.getByText("Submit your tangram", { exact: true })
  ).toBeVisible()
  const path = await page
    .locator("#dialogContainer svg path")
    .first()
    .getAttribute("d")
  expect(path).not.toBe(target.path)
  expect(
    await page.evaluate(
      async ({ a, b }) =>
        (await import("/tests/geometry.ts")).sameOutline(a, b),
      { a: geometry.path, b: path }
    )
  ).toBe(true)
  expect(
    await page.evaluate(async () => (await import("/tests/firebase.ts")).writes)
  ).toEqual([])
  await page.getByRole("button", { name: "Submit!", exact: true }).click()
  const writes = await page.evaluate(
    async () => (await import("/tests/firebase.ts")).writes
  )
  expect(writes).toHaveLength(1)
  expect(writes[0]).toMatchObject({
    collection: "tangrams",
    data: { path, edges: 21, uid: "tester", approved: false },
  })
})
