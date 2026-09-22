import { expect, type Page } from "@playwright/test"

export async function solveGenerated(
  page: Page,
  seed = 1083814273,
  edges = 14
) {
  // Orient the mirrored tan before placing neighbors that could obscure it.
  for (const id of ["rh", "lt1", "lt2", "mt1", "st1", "st2", "sq"]) {
    for (let turn = 0; turn < 17; turn++) {
      const move = await page.evaluate(
        async ({ id, seed, edges }) =>
          (await import("/tests/generationGeometry.ts")).nextMove(
            id,
            seed,
            edges
          ),
        { id, seed, edges }
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
}
