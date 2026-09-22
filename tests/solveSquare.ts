import { test, expect, type Page } from "@playwright/test"

// Recorded UI solution: no direct geometry mutation or mocked completion.
export async function solveSquare(page: Page) {
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
}
