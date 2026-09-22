import { test, expect, type Page } from "@playwright/test"

test.use({ viewport: { width: 627, height: 863 } })

const preferences = [
  { key: "showParticles", label: "Show particles", on: "Yes", off: "No" },
  {
    key: "showBackgroundPattern",
    label: "Difficulty",
    on: "Easy",
    off: "Hard",
  },
]
async function openSettings(page: Page) {
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator('svg[viewBox="0 0 24 24"]').first().click()
  await page.getByText("Settings", { exact: true }).click()
}
test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("sound", "off")
    localStorage.setItem("test-guest", "true")
  })
})

for (const { name, stored, expected } of [
  { name: "missing", stored: null, expected: true },
  { name: "true", stored: "true", expected: true },
  { name: "false", stored: "false", expected: false },
  { name: "malformed JSON", stored: "not-json", expected: true },
  { name: "non-boolean JSON", stored: "null", expected: true },
]) {
  test(`both boolean preferences handle ${name}, toggle and reload`, async ({
    page,
  }) => {
    await page.addInitScript((stored) => {
      if (sessionStorage.getItem("preferences-seeded")) return
      sessionStorage.setItem("preferences-seeded", "true")
      for (const key of ["showParticles", "showBackgroundPattern"]) {
        if (stored === null) localStorage.removeItem(key)
        else localStorage.setItem(key, stored)
      }
    }, stored)
    await page.goto("/?seed=42")
    await openSettings(page)
    for (const preference of preferences) {
      const row = page
        .getByText(preference.label, { exact: true })
        .locator("..")
      await expect(row.locator('[style*="left:"]')).toHaveCSS(
        "left",
        expected ? "0px" : "20px"
      )
      await row
        .getByText(expected ? preference.off : preference.on, { exact: true })
        .click()
      await expect(row.locator('[style*="left:"]')).toHaveCSS(
        "left",
        expected ? "20px" : "0px"
      )
      expect(
        await page.evaluate((key) => localStorage.getItem(key), preference.key)
      ).toBe(String(!expected))
    }
    await page.reload()
    await openSettings(page)
    for (const preference of preferences) {
      const row = page
        .getByText(preference.label, { exact: true })
        .locator("..")
      await expect(row.locator('[style*="left:"]')).toHaveCSS(
        "left",
        expected ? "20px" : "0px"
      )
    }
    expect(await page.evaluate(() => localStorage.getItem("sound"))).toBe("off")
  })
}

test("unavailable preference storage still permits in-memory toggles", async ({
  page,
}) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.addInitScript(() => {
    for (const method of ["getItem", "setItem"] as const) {
      const original = Storage.prototype[method]
      Storage.prototype[method] = function (key: string, value?: string) {
        if (["showParticles", "showBackgroundPattern"].includes(key))
          throw new DOMException("Storage unavailable", "SecurityError")
        return original.call(this, key, value!)
      }
    }
  })
  await page.goto("/?seed=42")
  await openSettings(page)
  for (const preference of preferences) {
    const row = page.getByText(preference.label, { exact: true }).locator("..")
    await expect(row.locator('[style*="left:"]')).toHaveCSS("left", "0px")
    await row.getByText(preference.off, { exact: true }).click()
    await expect(row.locator('[style*="left:"]')).toHaveCSS("left", "20px")
  }
  expect(errors).toEqual([])
})
