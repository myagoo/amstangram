import { test, expect } from "@playwright/test"

test("authentication failures retain their field message", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  await page.addInitScript(() => localStorage.setItem("test-guest", "true"))
  await page.goto("/?seed=42")
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
    if (localStorage.getItem("showParticles") === null) localStorage.setItem("showParticles", "false")
    localStorage.setItem("sound", "off")
  })
})

test("a seed reproduces the complete starting layout", async ({ page }) => {
  const layout = async (seed: number) => {
    await page.goto(`/?seed=${seed}`)
    await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
    return page.evaluate(async () => {
      const modulePath = "/tests/geometry.ts"
      const { readTan } = await import(modulePath)
      return ["st1", "st2", "mt1", "lt1", "lt2", "sq", "rh"].map(readTan)
    })
  }
  const initial = await layout(42)
  expect(await layout(42)).toEqual(initial)
  expect(await layout(43)).not.toEqual(initial)
})

test("a seed reproduces playlist shuffling and random emojis", async ({ page }) => {
  const sample = async (seed: number) => {
    await page.goto(`/?seed=${seed}`)
    return page.evaluate(async () => {
      const shufflePath = "/src/utils/shuffle.ts"
      const emojiPath = "/src/utils/getRandomEmoji.ts"
      const { shuffle } = await import(shufflePath)
      const { getRandomEmoji } = await import(emojiPath)
      return Array.from({ length: 3 }, () => ({
        playlist: shuffle([1, 2, 3, 4, 5, 6, 7]),
        emojis: Array.from({ length: 10 }, () => getRandomEmoji()),
      }))
    })
  }
  const initial = await sample(42)
  expect(await sample(42)).toEqual(initial)
  expect(await sample(43)).not.toEqual(initial)
  expect(initial[1]).not.toEqual(initial[0])
})

test("a seed reproduces particle geometry and colors without changing the tan layout", async ({ page }) => {
  // Freeze the animation-frame boundary so snapshots compare the same simulation instant.
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0 })
  const scene = async (seed: number, particles: boolean) => {
    await page.goto(`/?seed=${seed}`)
    await page.evaluate(enabled => localStorage.setItem("showParticles", String(enabled)), particles)
    await page.reload()
    await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
    return page.evaluate(async () => {
      const modulePath = "/tests/geometry.ts"
      return (await import(modulePath)).readScene()
    })
  }
  const initial = await scene(42, true)
  expect(initial.particles).toHaveLength(60)
  expect(await scene(42, true)).toEqual(initial)
  expect((await scene(43, true)).particles).not.toEqual(initial.particles)
  expect((await scene(42, false)).tans).toEqual(initial.tans)
})

test.describe("seeded square", () => {
  // Coordinates recorded from an actual UI solve, independent of Paper.js internals.
  test.use({ viewport: { width: 627, height: 863 }, deviceScaleFactor: 1 })

  test("can be completed using only mouse gestures", async ({ page }) => {
    const errors: string[] = []
    page.on("pageerror", error => errors.push(error.message))
    await page.addInitScript(() => localStorage.setItem("test-guest", "true"))
    await page.goto("/?seed=42")
    await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })

    const rotate = async (x: number, y: number, clicks: number) => {
      for (let click = 0; click < clicks; click++) {
        await page.mouse.click(x, y, { delay: 20 })
      }
    }
    const drag = async (x: number, y: number, toX: number, toY: number) => {
      await page.mouse.move(x, y)
      await page.mouse.down()
      await page.mouse.move(toX, toY, { steps: 12 })
      await page.mouse.up()
    }

    await test.step("Place the parallelogram", async () => {
      await rotate(480, 463, 1)
      await drag(480, 463, 502, 364)
    })
    await test.step("Place the large triangles", async () => {
      await drag(330, 570, 160, 430)
      await rotate(220, 342, 5)
      await drag(220, 342, 135, 417)
      await rotate(376, 451, 4)
      await drag(376, 440, 313, 293)
    })
    await test.step("Place the medium triangle and square", async () => {
      await drag(45, 719, 358, 647)
      await rotate(158, 730, 1)
      await drag(158, 730, 313, 556)
    })
    await test.step("Place the small triangles and finish", async () => {
      await drag(180, 580, 315, 715)
      await rotate(282, 618, 2)
      await drag(270, 620, 185, 632)
      await rotate(267, 124, 7)
      // The game must not declare victory with the final tan still outside the square.
      await expect(page.getByText("🟦", { exact: true })).not.toBeVisible()
      await drag(267, 124, 393, 430)
    })

    await expect(page.getByText("🟦", { exact: true })).toBeVisible()
    await expect(page.getByRole("button", { name: "Quit", exact: true })).toBeVisible({ timeout: 10000 })
    expect(errors).toEqual([])
  })
})

test("mouse clicks rotate and flip the parallelogram; dragging moves it", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  await page.goto("/?seed=42")
  const canvas = page.locator("canvas")
  await expect(canvas).toBeVisible({ timeout: 15000 })
  const bounds = (await canvas.boundingBox())!
  const read = () => page.evaluate(async () => {
    const modulePath = "/tests/geometry.ts"
    return (await import(modulePath)).readTan("rh") as {
      x: number; y: number; area: number; points: number[][]
    }
  })
  const initial = await read()
  let current = initial
  for (let click = 0; click < 4; click++) {
    await page.mouse.click(bounds.x + current.x, bounds.y + current.y, { delay: 20 })
    const next = await read()
    expect(next.points).not.toEqual(current.points)
    current = next
  }
  // Four 45-degree clicks include exactly one reflection, regardless of start orientation.
  expect(current.area).toBeCloseTo(-initial.area, 3)
  const dx = current.x > bounds.width / 2 ? -80 : 80
  const dy = current.y > bounds.height / 2 ? -60 : 60
  await page.mouse.move(bounds.x + current.x, bounds.y + current.y)
  await page.mouse.down()
  await page.mouse.move(bounds.x + current.x + dx, bounds.y + current.y + dy, { steps: 12 })
  await page.mouse.up()
  const dragged = await read()
  expect(Math.hypot(dragged.x - current.x, dragged.y - current.y)).toBeGreaterThan(50)
  expect(dragged.area).toBeCloseTo(current.area, 3)
  expect(errors).toEqual([])
})

test("gallery play, tan transforms, and saving the current arrangement", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", error => errors.push(error.message))
  await page.goto("/?seed=42")
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
