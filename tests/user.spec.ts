import { test, expect, type Page } from "@playwright/test"

const metadata = { tester: { username: "Tester", signupDate: 1700000000000 } }
async function emit(
  page: Page,
  events: Array<boolean | typeof metadata | Record<string, never>>
) {
  await page.evaluate(async (events) => {
    const path = "/tests/firebase.ts"
    const { userService } = await import(path)
    for (const event of events) {
      if (typeof event === "boolean") userService.auth(event)
      else userService.metadata(event)
    }
  }, events)
}

test.beforeEach(async ({ page }) => {
  await page.route(/https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort())
  await page.addInitScript(() =>
    localStorage.setItem("test-manual-user", "true")
  )
  await page.goto("/tests/user.html")
  await expect(page.getByLabel("Readiness")).toHaveText("loading")
})

for (const authFirst of [true, false]) {
  test(`user initialization with ${authFirst ? "auth" : "metadata"} first`, async ({
    page,
  }) => {
    await emit(page, [authFirst ? true : metadata])
    await expect(page.getByLabel("Readiness")).toHaveText("loading")
    await expect(page.getByLabel("Current user")).toHaveText("pending")
    await emit(page, [authFirst ? metadata : true])
    await expect(page.getByLabel("Readiness")).toHaveText("ready")
    await expect(page.getByLabel("Current user")).toHaveText("Tester")
    expect(
      await page.evaluate(async () => {
        const path = "/tests/firebase.ts"
        return (await import(path)).userService.reads
      })
    ).toEqual([])
  })
}

test("logout while metadata is loading cannot restore a stale signed-in user", async ({
  page,
}) => {
  await emit(page, [true, false, metadata])
  await expect(page.getByLabel("Readiness")).toHaveText("ready")
  await expect(page.getByLabel("Current user")).toHaveText("guest")
})

test("missing startup metadata does not block readiness or invent a profile", async ({
  page,
}) => {
  await emit(page, [true, {}])
  await expect(page.getByLabel("Readiness")).toHaveText("ready")
  await expect(page.getByLabel("Current user")).toHaveText("pending")
  await emit(page, [false])
  await expect(page.getByLabel("Current user")).toHaveText("guest")
})

test("signup before metadata creation remains safe and follows snapshot updates", async ({
  page,
}) => {
  await emit(page, [false, {}])
  await expect(page.getByLabel("Readiness")).toHaveText("ready")
  await emit(page, [true])
  await expect(page.getByLabel("Readiness")).toHaveText("ready")
  await expect(page.getByLabel("Current user")).toHaveText("pending")
  await emit(page, [metadata])
  await expect(page.getByLabel("Current user")).toHaveText("Tester")
  await emit(page, [{ tester: { ...metadata.tester, username: "Updated" } }])
  await expect(page.getByLabel("Current user")).toHaveText("Updated")
})
