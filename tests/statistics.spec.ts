import { test, expect } from "@playwright/test"

test("leaderboard and profile exclude star-only activity from completions", async ({
  page,
}) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("language", "en")
    localStorage.setItem("hideTips", "true")
    localStorage.setItem("sound", "off")
    localStorage.setItem("showParticles", "false")
    localStorage.setItem("test-statistics", "true")
  })
  await page.goto("/?seed=42")
  await expect(page.locator("canvas")).toBeVisible({ timeout: 15000 })
  await page.locator("svg").first().click()
  await page.getByText("Leaderboard", { exact: true }).click()
  await page.getByRole("combobox").selectOption("completed")
  const tester = page.getByText("Tester", { exact: true }).locator("..")
  await expect(tester.getByText("1", { exact: true })).toBeVisible()
  await tester.locator("img").click()
  await expect(
    page.getByText("Completed 1/2 tangrams", { exact: true })
  ).toBeVisible()
  await expect(
    page.getByText("Created 0 tangrams", { exact: true })
  ).toBeVisible()
})
