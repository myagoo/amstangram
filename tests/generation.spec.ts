import { test, expect } from "@playwright/test"
import { generationSeeds } from "./generationSeeds"

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

test("real workers reproduce every slider level and reject invalid difficulty", async ({
  page,
}) => {
  const results = await page.evaluate(async (seeds) => {
    const run = (edges: number, seed: number) =>
      new Promise<{
        puzzle?: { edges: number; path: string }
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
    return {
      puzzles,
      again: await run(14, seeds[14]),
      invalid: await run(4, 42),
    }
  }, generationSeeds)
  expect(results.puzzles.map(({ puzzle }) => puzzle?.edges)).toEqual(
    Array.from({ length: 18 }, (_, i) => i + 5)
  )
  expect(results.again).toEqual(results.puzzles[9])
  expect(results.invalid).toEqual({ error: true })
})

test("real worker generates a reproducible puzzle, playable to victory without community writes", async ({
  page,
}) => {
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
  await expect(slider).toHaveCSS("accent-color", "rgb(16, 172, 132)")
  await slider.fill("17")
  await expect(slider).toHaveCSS("accent-color", "rgb(238, 82, 83)")
  await slider.fill("8")
  await expect(slider).toHaveCSS("accent-color", "rgb(46, 134, 222)")
  await page.getByRole("button", { name: "Start", exact: true }).click()
  await expect(page.locator("#dialogContainer")).toBeEmpty({ timeout: 20000 })
  expect(
    await page.evaluate(
      async () =>
        (await import("/tests/generationGeometry.ts")).readGeneratedTarget()
          .edges
    )
  ).toBe(14)

  for (const id of ["lt1", "lt2", "mt1", "st1", "st2", "sq", "rh"]) {
    for (let turn = 0; turn < 17; turn++) {
      const move = await page.evaluate(
        async (id) =>
          (await import("/tests/generationGeometry.ts")).nextMove(
            id,
            1083814273,
            14
          ),
        id
      )
      if (!move.aligned) {
        if (turn === 16)
          throw new Error(`Unable to orient ${id}: ${JSON.stringify(move)}`)
        await page.mouse.click(move.x, move.y, { delay: 20 })
        continue
      }
      await page.mouse.move(move.x, move.y)
      await page.mouse.down()
      await page.mouse.move(move.toX, move.toY, { steps: 12 })
      await page.mouse.up()
      break
    }
  }
  await expect(page.getByText("🎲", { exact: true })).toBeVisible({
    timeout: 10000,
  })
  const writes = await page.evaluate(
    async () => (await import("/tests/firebase.ts")).writes
  )
  expect(writes).toEqual([])
  expect(errors).toEqual([])
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
    await page.getByRole("button", { name: "Cancel", exact: true }).click()
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
