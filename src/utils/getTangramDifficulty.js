export const getTangramDifficulty = tangram =>
  tangram.percent > 50 ? 0 : tangram.percent > 20 ? 1 : 2
