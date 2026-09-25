# TangramGenerator engine

Vendored from `myagoo/TangramGenerator` commit
`5c975f77d734aab78d09d02d131081eb3d04b5c6` (`src/*.ts`).
Only the generation engine is included, not the standalone game or telemetry.
This makes clean checkouts independent of a sibling repository or registry release.

Copyright (c) 2019 Wiebke Köpp. MIT license: see
`../../public/TangramGenerator-LICENSE.txt`, also distributed with the website.
Local performance patches backported from Tangramix:

- Exact coefficient determinants avoid temporary geometry objects.
- Convex tan containment and strict segment crossing checks avoid redundant work.
- Eight-direction sign codes preserve orientation probabilities without vector division.
- Single-candidate searches omit unused symmetry/convexity scores; engine callers retain evaluated and sorted output by default.

`tests/generationPerformance.test.ts` checks geometry against the original formulas,
1,000 layouts against their original seeded fingerprint, and scored/unscored
equivalence including the random stream. Maximum-difficulty seed `42` still
searches 2,392 candidates. Browser worker and hole regressions cover conversion,
rendering and solvability; native timing measurements belong to Tangramix.

Amstangram's conversion and worker live in
`src/generation/`. Update this pinned snapshot deliberately when updating the engine.
