export const getTangramDifficulty = (
  tangram: Pick<import("../types").Tangram, "edges">
) => (tangram.edges > 16 ? 0 : tangram.edges > 8 ? 1 : 2)
