# amstangram

Community driven tangrams

## Development

Use Bun 1.4.2 (pinned in `.bun-version` and `packageManager`). Install with
`bun install --frozen-lockfile`, then `bun run dev`. Application code is strict TypeScript; Vite config and maintenance
scripts outside `src` remain JavaScript.

- `bun run typecheck`: application and browser geometry harness types.
- `bun run build`: typecheck and production bundle.
- `bun run preview`: serve the production bundle locally.
- `bun run lint`: application TypeScript (not vendored scripts); existing hook and
  unused-code warnings remain.
- `bun run test:unit`: Vitest tests for seeded random streams.
- `bun run test:e2e`: Playwright browser tests, including square completion,
  theme/layout snapshots and real Web Audio playback. `bun run test` runs both suites.
- `bun run --bun playwright install chromium`, then `bun run test`: gallery → play → tan
  geometry → save submission and rejected-login smoke tests. To use installed Chrome instead:
  `PLAYWRIGHT_CHANNEL=chrome bun run test`.
- `bun run deploy`: explicitly build before publishing with the existing gh-pages
  workflow. Bun does not automatically run npm-style pre/post script hooks.

Development, production builds, typechecking, linting, preview and Playwright
explicitly select Bun, including the Vite subprocess used by tests. Playwright
was upgraded to 1.63.0 and verified with Bun 1.4.2; the older 1.51.1/Bun 1.4.0
combination silently exited without executing tests. Use `bun run test`, not
`bun test` (which invokes Bun's own test runner). Bun is the only package manager;
commit `bun.lock` and do not regenerate a Yarn/npm lockfile.

The browser test replaces Firebase only in its own Vite config and blocks remote
requests. It checks submitted metadata in memory, never writes community data,
and does not verify real authentication or Firestore permissions.

### Reproducible randomness

Open `/?seed=42` to reproduce all game-owned randomness: tan positions and
orientations, gallery shuffling, random emojis, particles and victory effects.
The seed is an unsigned 32-bit decimal integer (0–4294967295); missing or invalid
seeds keep normal random play. Each puzzle initialization starts a fresh layout
sequence. Playlist and emoji streams advance independently until page reload;
particles have independent streams so animation timing cannot affect gameplay.

Replay with the same puzzle data, viewport, settings and actions. Seeding does
not freeze time or network data: animation screenshots also need a controlled
clock/frame boundary. Tests use Firebase fixtures and freeze animation frames
when comparing initial particle geometry and colors. Third-party internals and
security-sensitive randomness are not globally overridden.

Unit tests can use `createRandom("42")` from `src/utils/createRandom.ts` and pass
the returned function to `shuffle`, `getRandomEmoji`, `createPiecesGroup`, or
`scrambleGroup` without changing global `Math.random`.

The `seeded square` E2E test replays a manually recorded solution at 627×863 using
only mouse clicks/drags, then checks the victory emoji and Quit button. It uses the
existing square fixture and a guest account, not direct geometry mutation or a
mock completion check. Run it with:

```sh
PLAYWRIGHT_CHANNEL=chrome bun run test:e2e --grep "seeded square"
```

### Styling and React/Vite upgrade

React/DOM 19.3.0, Vite 8.3.0, its React plugin 6.1.1, Panda 1.12.1 and Vitest
5.0.1 run under the pinned Bun version. React Intl, React Hook Form, React Icons
and use-sound were upgraded with React. TypeScript stays at 5.7.3 until the
Biome task: TypeScript 7 removes the compiler API required by the existing
ESLint parser (even the current parser's peer range excludes TypeScript 7).

Panda replaces css-system; `bun install` generates the ignored `styled-system/`
directory via `prepare`. Run `bun run prepare` after changing Panda configuration.
Vite's PostCSS integration extracts CSS during development and production builds.
No runtime stylesheet injection or old `deps` props remain.

`src/theme.ts` holds plain TypeScript palettes/scales shared by Panda and Paper.js.
The existing `css-system-theme` storage key is intentionally retained. The root
`data-theme` attribute themes dialogs/notifications as well as the main page.
Token indices are strings (`p: "3"` means 16px); `boxSize` sets width and height.
Use literal style alternatives, token references, or inline `style` for values
computed at runtime—Panda cannot extract arbitrary runtime values. Native flex
gap replaces the old sibling-margin helper. These web components are not React
Native components; the plain tokens can be reused in the later native UI port.

Visual baselines were captured before replacing css-system on macOS/Chrome at
627×863. Run visual tests on the same platform/browser; inspect intentional
changes before updating snapshots. The existing large-bundle warning and a
harmless misplaced PURE annotation warning from Panda's generated code remain.

## Migration baseline and known issues

The TypeScript migration starts from `7003b42762d7c48eaec354720c641e8ce4fb4915`.
Puzzle metadata/storage shapes and Paper.js algorithms are unchanged. Panda now
supplies styling types; use-sound 5 exports its own declarations, so the old
TypeScript path workaround has been removed.

Existing defects found while typing, **not fixed by this migration**:

- **Security-sensitive:** the change-password form calls `updateUsername` with
  the entered current password. This can expose that password as the username;
  do not use this form until it is fixed. The change-email form also reverses
  the email/password arguments. No real accounts were used during verification.
- Secondary snapping reads an absent `shape` property from a Paper.js path.
- The unused local sound helper's invalid effect-dependency object was replaced
  with an empty dependency array; the game uses the external `use-sound` package.
- The unused recomputation helper now supplies the canvas size required by
  Paper.js's typed project constructor. It was not run against stored data.

Generator integration and the random-puzzle menu are separate follow-up work.

## TODOS

- Fix filled holes in cards path
