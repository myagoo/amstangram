import { test, expect } from "@playwright/test"
import { solveGenerated } from "./solveGenerated"
import { holeGenerationCases } from "./generationSeeds"

test.use({ viewport: { width: 627, height: 863 }, deviceScaleFactor: 1 })
test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("sound", "off")
    localStorage.setItem("showParticles", "false")
  })
})

test("16 generated holes survive conversion, four rotations and two scales with valid solutions", async ({
  page,
}) => {
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible()
  const results = await page.evaluate(
    async (seeds) => {
      const { inspectConvertedFixtures } = await import(
        "/tests/generationGeometry.ts"
      )
      return [0, 90, 180, 270].flatMap((rotation) =>
        [0.75, 1.6].map((scale) =>
          inspectConvertedFixtures(seeds, rotation, scale)
        )
      )
    },
    holeGenerationCases.map((fixture) => fixture.seed)
  )
  expect(results).toEqual(
    Array.from({ length: 8 }, () => ({
      checked: 16,
      rejected: 0,
      holes: 16,
      mirrored: true,
      remainingItems: 0,
    }))
  )
})

for (const fixture of holeGenerationCases) {
  test(`seed ${fixture.querySeed}: ${fixture.sides}-sided hole renders in canvas and preview and is mouse-solvable`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(
      fixture.querySeed % 2
        ? { width: 1100, height: 650 }
        : { width: 627, height: 863 }
    )
    await page.goto(`/?seed=${fixture.querySeed}`)
    await expect(page.locator("canvas")).toBeVisible()
    await page.locator('svg[viewBox="0 0 24 24"]').first().click()
    await page
      .getByRole("button", { name: "Random tangram", exact: true })
      .click()
    await page.getByRole("slider").fill(String(22 - fixture.edges))
    await page.getByRole("button", { name: "Start", exact: true }).click()
    await expect(page.locator("#dialogContainer")).toBeEmpty({ timeout: 20000 })
    const { preview } = await page.evaluate(async () =>
      (await import("/tests/generationGeometry.ts")).readHoleRendering()
    )
    // Switch through the real settings UI, leaving the same generated puzzle active.
    await page.locator('svg[viewBox="0 0 24 24"]').first().click()
    await page.getByRole("button", { name: "Settings", exact: true }).click()
    await page.getByText("Hard", { exact: true }).click()
    const svg = page.locator(
      `svg[viewBox="0 0 ${preview.width} ${preview.height}"]`
    )
    await expect(svg).toHaveCount(1)
    const raster = await svg.evaluate(async (element, samples) => {
      const copy = element.cloneNode(true) as SVGSVGElement
      copy.setAttribute("width", String(samples.width))
      copy.setAttribute("height", String(samples.height))
      const image = new Image()
      image.src = `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(copy))}`
      await image.decode()
      const canvas = document.createElement("canvas")
      canvas.width = samples.width
      canvas.height = samples.height
      const context = canvas.getContext("2d")!
      context.drawImage(image, 0, 0)
      return {
        holes: samples.holes.map(({ x, y }) => [
          ...context.getImageData(Math.round(x), Math.round(y), 1, 1).data,
        ]),
        painted: context
          .getImageData(0, 0, canvas.width, canvas.height)
          .data.some((value, index) => index % 4 === 3 && value > 0),
      }
    }, preview)
    expect(raster).toEqual({ holes: [[0, 0, 0, 0]], painted: true })
    await page.getByText("Easy", { exact: true }).click()
    await page
      .getByRole("button", { name: "Close", exact: true })
      .last()
      .click()
    await page.getByRole("button", { name: "Close", exact: true }).click()
    // Recorded placement orders keep the next tan visible in each seeded layout.
    await solveGenerated(
      page,
      fixture.seed,
      fixture.edges,
      fixture.smallFirst
        ? ["rh", "sq", "st1", "st2", "mt1", "lt1", "lt2"]
        : undefined
    )
    const rendering = await page.evaluate(async () =>
      (await import("/tests/generationGeometry.ts")).readHoleRendering()
    )
    expect(rendering.holes).toEqual([
      { sides: fixture.sides, filled: false, pixel: [0, 0, 0, 0] },
    ])
    expect(rendering.solidPixel[3]).toBe(255)
    if ([28, 141].includes(fixture.querySeed))
      await page.screenshot({ path: testInfo.outputPath("solved-hole.png") })
  })
}
