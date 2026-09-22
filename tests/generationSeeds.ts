// Each seed's first engine candidate matches the edge count. No probabilistic test waits.
export const generationSeeds: Record<number, number> = {
  5: 162433768,
  6: 1954353670,
  7: 674279000,
  8: 1630677591,
  9: 1252726738,
  10: 679978409,
  11: 3916973947,
  12: 3291432712,
  13: 3186830815,
  14: 42,
  15: 545465640,
  16: 3706458397,
  17: 3617218695,
  18: 1322922697,
  19: 1528634578,
  20: 3788647902,
  21: 635092570,
  22: 464449016,
}

// First worker result for each ?seed= value: no engine mocks or hole-only production mode.
// Found by scanning query seeds 0–141; includes triangular/quadrilateral holes and both mirrors.
export const holeGenerationCases = [
  { querySeed: 28, seed: 1060510923, edges: 20, sides: 3 },
  { querySeed: 35, seed: 1072162598, edges: 16, sides: 3 },
  { querySeed: 41, seed: 1082149748, edges: 19, sides: 3 },
  { querySeed: 44, seed: 1087143323, edges: 18, sides: 3, smallFirst: true },
  { querySeed: 47, seed: 1092136898, edges: 13, sides: 3 },
  { querySeed: 50, seed: 1097130473, edges: 16, sides: 3 },
  { querySeed: 59, seed: 1112111198, edges: 16, sides: 4 },
  { querySeed: 61, seed: 1115440248, edges: 16, sides: 4 },
  { querySeed: 69, seed: 1128756448, edges: 13, sides: 3, smallFirst: true },
  { querySeed: 76, seed: 1140408123, edges: 16, sides: 3 },
  { querySeed: 95, seed: 1172034098, edges: 18, sides: 3 },
  { querySeed: 115, seed: 1205324598, edges: 16, sides: 3 },
  { querySeed: 124, seed: 1220305323, edges: 16, sides: 4 },
  { querySeed: 125, seed: 1221969848, edges: 16, sides: 4 },
  { querySeed: 129, seed: 1228627948, edges: 15, sides: 3, smallFirst: true },
  { querySeed: 141, seed: 1248602248, edges: 13, sides: 4, smallFirst: true },
]
