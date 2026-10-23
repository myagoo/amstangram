import { test, expect } from "@playwright/test"
import { generationSeeds } from "./generationSeeds"
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

test("118 converted solutions fit actual game tans, covering all levels, holes and both mirrors", async ({
  page,
}) => {
  const result = await page.evaluate(async () =>
    (await import("/tests/generationGeometry.ts")).inspectConvertedFixtures()
  )
  expect(result).toMatchObject({
    checked: 118,
    rejected: 0,
    mirrored: true,
    remainingItems: 0,
  })
  expect(result.holes).toBeGreaterThan(0)
})

test("real workers reproduce levels and random success emojis and reject invalid difficulty", async ({
  page,
}) => {
  const results = await page.evaluate(async (seeds) => {
    const run = (edges: number, seed: number) =>
      new Promise<{
        puzzle?: { edges: number; path: string; emoji: string }
        error?: boolean
      }>((resolve, reject) => {
        const worker = new Worker("/src/generation/generate.worker.ts", {
          type: "module",
        })
        worker.onmessage = ({ data }) => {
          worker.terminate()
          resolve(data)
        }
        worker.onerror = (event) => {
          worker.terminate()
          reject(new Error(event.message))
        }
        worker.postMessage({ edges, seed: String(seed) })
      })
    const puzzles = []
    for (const [edges, seed] of Object.entries(seeds)) {
      puzzles.push(await run(Number(edges), seed))
    }
    const { getRandomEmoji } = await import("/src/utils/getRandomEmoji.ts")
    return {
      emojiPool: Array.from({ length: 10 }, (_, i) =>
        getRandomEmoji(() => i / 10)
      ),
      puzzles,
      again: await run(14, seeds[14]),
      invalid: await run(4, 42),
    }
  }, generationSeeds)
  expect(results.puzzles.map(({ puzzle }) => puzzle?.edges)).toEqual(
    Array.from({ length: 18 }, (_, i) => i + 5)
  )
  expect(results.again).toEqual(results.puzzles[9])
  const emojis = results.puzzles.map(({ puzzle }) => puzzle!.emoji)
  for (const emoji of emojis) expect(results.emojiPool).toContain(emoji)
  expect(new Set(emojis).size).toBeGreaterThan(1)
  expect(results.invalid).toEqual({ error: true })
})

for (const viewport of [
  { width: 627, height: 863 },
  { width: 1100, height: 650 },
]) {
  test(`generated puzzle fits ${viewport.width}×${viewport.height} and is mouse-solvable without community writes`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport)
    await page.reload()
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    await page.locator('svg[viewBox="0 0 24 24"]').first().click()
    await page
      .getByRole("button", { name: "Random tangram", exact: true })
      .click()
    const slider = page.getByRole("slider", { name: "Difficulty", exact: true })
    await expect(slider).toHaveAttribute("min", "0")
    await expect(slider).toHaveAttribute("max", "17")
    await slider.fill("0")
    await expect(slider).toHaveCSS("--difficulty-progress", "0%")
    await expect(slider).toHaveCSS("color", "rgb(16, 172, 132)")
    await slider.fill("17")
    await expect(slider).toHaveCSS("--difficulty-progress", "100%")
    await expect(slider).toHaveCSS("color", "rgb(238, 82, 83)")
    await slider.fill("8")
    await expect(slider).toHaveCSS("color", "rgb(46, 134, 222)")
    await page.getByRole("button", { name: "Start", exact: true }).click()
    await expect(page.locator("#dialogContainer")).toBeEmpty({ timeout: 20000 })
    expect(
      await page.evaluate(
        async () =>
          (await import("/tests/generationGeometry.ts")).readGeneratedTarget()
            .edges
      )
    ).toBe(14)

    const fit = await page.evaluate(async () =>
      (await import("/tests/generationGeometry.ts")).inspectGeneratedFit()
    )
    const landscape = fit.viewport.width > fit.viewport.height
    const width = Math.min(
      fit.viewport.width * (landscape ? 0.7 : 0.8),
      landscape ? 700 : 600
    )
    const height = Math.min(
      fit.viewport.height * (landscape ? 0.8 : 0.7),
      landscape ? 600 : 700
    )
    const scales = fit.candidates.map((candidate) =>
      Math.min(width / candidate.width, height / candidate.height)
    )
    const best = scales.reduce(
      (best, scale, index) => (scale > scales[best] + 1e-9 ? index : best),
      0
    )
    expect(fit.scale).toBeCloseTo(scales[best], 5)
    expect(fit.candidates[best].difference).toBeLessThan(0.1)
    expect(fit.actual.width).toBeLessThanOrEqual(width + 0.001)
    expect(fit.actual.height).toBeLessThanOrEqual(height + 0.001)

    await solveGenerated(page)
    const writes = await page.evaluate(
      async () => (await import("/tests/firebase.ts")).writes
    )
    expect(writes).toEqual([])
    expect(errors).toEqual([])
  })
}

test("hard-mode preview has the same orientation as the fitted target", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 650 })
  await page.evaluate(() =>
    localStorage.setItem("showBackgroundPattern", "false")
  )
  await page.reload()
  await page.locator('svg[viewBox="0 0 24 24"]').first().click()
  await page
    .getByRole("button", { name: "Random tangram", exact: true })
    .click()
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await expect(page.locator("#dialogContainer")).toBeEmpty({ timeout: 20000 })
  const fit = await page.evaluate(async () =>
    (await import("/tests/generationGeometry.ts")).inspectGeneratedFit()
  )
  const preview = page.locator(
    `svg[viewBox="0 0 ${fit.preview.width} ${fit.preview.height}"] path`
  )
  await expect(preview).toHaveCount(1)
  expect(
    await page.evaluate(
      async ({ a, b }) =>
        (await import("/tests/geometry.ts")).sameOutline(a, b),
      { a: (await preview.getAttribute("d"))!, b: fit.preview.path }
    )
  ).toBe(true)
})

test("cancel preserves the live arrangement and prevents a late worker from replacing gallery play", async ({
  page,
}) => {
  const before = await page.evaluate(
    async () => (await import("/tests/geometry.ts")).readScene().tans
  )
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  await page.route("**/src/generation/generate.worker.ts*", async (route) => {
    await gate
    await route.continue().catch(() => {})
  })
  try {
    await page.locator('svg[viewBox="0 0 24 24"]').first().click()
    await page
      .getByRole("button", { name: "Random tangram", exact: true })
      .click()
    await page.getByRole("button", { name: "Start", exact: true }).click()
    await expect(
      page.getByRole("button", { name: "Generating…", exact: true })
    ).toBeDisabled()
    await expect(page.getByRole("slider")).toBeDisabled()
    await expect(
      page.getByRole("button", { name: "Cancel", exact: true })
    ).toHaveCount(0)
    await page
      .getByRole("button", { name: "Close", exact: true })
      .last()
      .click()
    expect(
      await page.evaluate(
        async () => (await import("/tests/geometry.ts")).readScene().tans
      )
    ).toEqual(before)
    await page
      .getByRole("button", { name: "Tangram gallery", exact: true })
      .click()
    await page
      .locator('#dialogContainer svg[viewBox="0 0 200 200"]')
      .first()
      .click()
    await page
      .getByRole("button", { name: "Start 1 tangram !", exact: true })
      .click()
    release()
    await page.waitForTimeout(500)
    expect(
      await page.evaluate(
        async () =>
          (await import("/tests/generationGeometry.ts")).readGeneratedTarget()
            .edges
      )
    ).toBe(4)
  } finally {
    release()
  }
})

test("worker failure preserves the puzzle and allows retry", async ({
  page,
}) => {
  const before = await page.evaluate(
    async () => (await import("/tests/geometry.ts")).readScene().tans
  )
  await page.route(
    "**/src/generation/generate.worker.ts*",
    (route) => route.abort(),
    { times: 1 }
  )
  await page.locator('svg[viewBox="0 0 24 24"]').first().click()
  await page
    .getByRole("button", { name: "Random tangram", exact: true })
    .click()
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await expect(page.getByRole("alert")).toHaveText(
    "Generation failed. Please try again."
  )
  expect(
    await page.evaluate(
      async () => (await import("/tests/geometry.ts")).readScene().tans
    )
  ).toEqual(before)
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await expect(page.locator("#dialogContainer")).toBeEmpty({ timeout: 20000 })
  expect(
    await page.evaluate(
      async () =>
        (await import("/tests/generationGeometry.ts")).readGeneratedTarget()
          .edges
    )
  ).toBe(14)
})
