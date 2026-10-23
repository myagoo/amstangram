import { test, expect } from "@playwright/test"
import { solveSquare } from "./solveSquare"

test.use({ viewport: { width: 627, height: 863 }, deviceScaleFactor: 1 })
test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("sound", "off")
    localStorage.setItem("test-guest", "true")
    localStorage.setItem("showParticles", "true")
  })
})

test("outward burst settles without moving the solved tans or hiding the puzzle", async ({
  page,
}, testInfo) => {
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible()
  await solveSquare(page)
  const scene = () =>
    page.evaluate(async () => (await import("/tests/geometry.ts")).readScene())
  const start = await scene()
  expect(start.particles).toHaveLength(60)
  expect(start.particles.some((particle) => particle.opacity > 0)).toBe(true)
  await page.waitForTimeout(120)
  await page.screenshot({ path: testInfo.outputPath("victory-burst.png") })
  await page.waitForTimeout(1000)
  const end = await scene()
  expect(end.tans).toEqual(start.tans)
  expect(end.particles.every((particle) => particle.opacity === 0)).toBe(true)
  expect(
    await page.evaluate(async () =>
      (await import("/tests/geometry.ts")).readProjectOpacity()
    )
  ).toBe(1)
  await page.screenshot({ path: testInfo.outputPath("victory-settled.png") })
  await expect(
    page.getByRole("button", { name: "Quit", exact: true })
  ).toBeEnabled()
})

for (const sound of ["on", "off"]) {
  test(`victory audio is synchronized with completion and respects sound ${sound}`, async ({
    page,
  }) => {
    await page.addInitScript((sound) => {
      localStorage.setItem("sound", sound)
      const playback = { lastRelease: 0, victoryDelays: [] as number[] }
      Object.assign(window, { victoryPlayback: playback })
      window.addEventListener(
        "mouseup",
        () => {
          playback.lastRelease = performance.now()
        },
        true
      )
      const start = AudioBufferSourceNode.prototype.start
      AudioBufferSourceNode.prototype.start = function (...args) {
        // Observe real Web Audio playback of the existing 1.1-second victory asset.
        if (this.buffer && Math.abs(this.buffer.duration - 1.1) < 0.001)
          playback.victoryDelays.push(performance.now() - playback.lastRelease)
        return start.apply(this, args)
      }
    }, sound)
    await page.goto("/?seed=42")
    await expect(page.locator("canvas")).toBeVisible()
    await solveSquare(page)
    await expect(
      page.getByRole("button", { name: "Quit", exact: true })
    ).toBeEnabled({ timeout: 300 })
    const delays = await page.evaluate(
      () =>
        (window as Window & { victoryPlayback: { victoryDelays: number[] } })
          .victoryPlayback.victoryDelays
    )
    if (sound === "on") {
      expect(delays).toHaveLength(1)
      expect(delays[0]).toBeLessThan(300)
    } else expect(delays).toEqual([])
  })
}
