# amstangram

Community driven tangrams

## Development

Use Bun 1.4.2 (pinned in `.bun-version` and `packageManager`). Install with
`bun install --frozen-lockfile`, then `bun run dev`. Application code is strict TypeScript; Vite config and maintenance
scripts outside `src` remain JavaScript.

- `bun run typecheck`: application and browser geometry harness types.
- `bun run build`: typecheck and production bundle.
- `bun run preview`: serve the production bundle locally.
- `bun run lint`: Biome application linting; hook, unused-code and Fast Refresh
  warnings remain visible without failing the command.
- `bun run format`: format owned source, tests and root JS/TS/JSON configuration.
- `bun run format:check`: check formatting without changing files.
- `bun run check`: lint, formatting check and explicit TypeScript checking.
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

The gallery-switch regression opts into two distinct puzzle records and leaves
particles enabled. A one-puzzle fixture can reselect the same object without
recreating the game, hiding cleanup-order crashes when switching real puzzles.

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
and use-sound were upgraded with React. TypeScript 7.0.2 now runs after replacing
the incompatible ESLint parser with Biome 2.5.14.

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

### Biome linting and formatting

`biome.json` explicitly maps the former ESLint rules instead of enabling an
unrelated preset. Hook placement and explicit `any` remain errors; exhaustive
dependencies, unused variables/imports/parameters and Fast Refresh remain warnings.
Fast Refresh permits constant exports for Vite. TypeScript still checks names
and props; linting is not a replacement for `bun run typecheck`.

The mapping is not identical: Biome checks more hook dependencies and mixed
exports, unused parameters before used ones, and unused React imports without
the old name exemption. Underscore-prefixed variables/parameters remain exempt.
The baseline is 68 warnings, not a warning-free lint pass. Some legacy React
class/display-name/deprecation and dynamic-RegExp checks have no migrated
equivalent. Biome also rejects more global-name shadows and empty function bodies;
the error-text component was renamed and intentional context no-ops documented.
The two existing effect suppressions in the unused sound helper were translated
with reasons; no hook behavior or blanket suppression was introduced.

Formatting retains two spaces, LF, double quotes, optional semicolons and ES5
trailing commas. Its mechanical changes are committed separately. Import
organization and lint autofixes are not part of `bun run format`. Lint scope
remains `src`; formatting also covers tests and root JS/TS/JSON configuration.
Vendored `public/`, maintenance `tools/`, generated `styled-system/`, dependencies,
build/test artifacts, HTML and documentation are outside this formatting scope.
Panda still depends on Prettier internally for code generation; it is no longer
the project's formatter and its transitive dependency is not overridden.

## Migration baseline and known issues

Non-Firebase dependency maintenance updates Paper.js to 0.12.18, gh-pages to
6.3.0 and Howler types to 2.2.13. Unused npm Sentry and offset-polygon dependencies
were removed after searching application code, tests and maintenance tools;
the separate Sentry CDN integration in `index.html` is unchanged.
Firebase stays at 10.7.0 by explicit scope choice; no Firebase migration or
real-SDK emulator verification is included in this modernization.

The dependency audit is **not clean**. Firebase 10.7.0 is covered by
[CVE-2024-11023](https://github.com/advisories/GHSA-3wf4-68gx-mph8), concerning
attacker-controlled session-sync configuration (patched in 10.9.0). Its existing
dependency tree also includes flagged gRPC, protobufjs, Undici and websocket-driver
versions. An advisory is not proof that this browser app exposes every affected
code path; assess those separately before choosing a Firebase security update.
Do not run the legacy maintenance scripts against production as an audit test.
After removing ESLint, tooling advisories remain in Panda's pinned Browserslist,
PostCSS and postcss-selector-parser dependencies. These require an upstream Panda
update or a separately verified override; they process build inputs, not the
community puzzle data. Run `bun audit` for the current complete list. No forced
dependency overrides have been introduced merely to suppress the report.

The TypeScript migration starts from `7003b42762d7c48eaec354720c641e8ce4fb4915`.
Puzzle metadata/storage shapes and Paper.js algorithms are unchanged. Panda now
supplies styling types; use-sound 5 exports its own declarations, so the old
TypeScript path workaround has been removed.

### Codebase health releases

**0.2.2 🥟.🐼.🔐 — safe password changes (ticket 01).** The profile form now
reauthenticates with the current password and sends the new password to Firebase
Auth, never to the username updater. Success preserves the public username;
wrong passwords, weak passwords, service failures and confirmation mismatches
keep the form open with feedback. Browser regression coverage uses only the
Firebase fixture and checks that neither Auth profile nor Firestore metadata is
written. Run `PLAYWRIGHT_CHANNEL=chrome bun run test:e2e tests/account.spec.ts`.
The old implementation reproduced a false success and changed the fixture's
username before the fix. This does not establish whether real accounts were
affected; no historical account investigation or production data changes were made.

Remaining defects found while typing/reviewing:

- The change-email form reverses email/password arguments (ticket 02).
  No real accounts were used during verification.
- Secondary snapping reads an absent `shape` property from a Paper.js path.
- The unused local sound helper's invalid effect-dependency object was replaced
  with an empty dependency array; the game uses the external `use-sound` package.
- The unused recomputation helper now supplies the canvas size required by
  Paper.js's typed project constructor. It was not run against stored data.

Generator integration and the random-puzzle menu are separate follow-up work.

## TODOS

- Fix filled holes in cards path
