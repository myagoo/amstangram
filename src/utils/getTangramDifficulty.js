export const getTangramDifficulty = (tangram) =>
  tangram.edges > 16 ? 0 : tangram.edges > 8 ? 1 : 2
