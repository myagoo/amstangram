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
- `bun run test:unit`: Vitest tests for seeded random streams and player statistics.
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
The lifecycle suite also uses an explicitly ordered playlist when checking Next
and replacement, so it cannot accidentally reselect the already active puzzle.

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
The initial migration baseline was 68 warnings; the codebase-health cleanup
reduces it to 60, not a warning-free lint pass. Some legacy React
class/display-name/deprecation and dynamic-RegExp checks have no migrated
equivalent. Biome also rejects more global-name shadows and empty function bodies;
the error-text component was renamed and intentional context no-ops documented.

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

The app displays only the emoji release code (currently `🥟.🎲.🧩`), without
the numeric version. Numeric versions remain in `package.json` and release notes
for tooling and traceability. Release 0.2.11 makes this display-only change; the
menu browser regression checks the exact emoji label and excludes digits.

**0.3.0 🥟.🎲.🧩 — generated puzzles (integration ticket 03).** Choose
**Random tangram** in the menu, select difficulty, then Start. The native slider
has 18 positions (17 intervals), internally matching exactly 22 down to 5 edges;
counts are not displayed. Its green/blue/red colors use the gallery's existing
theme and difficulty thresholds. This does not change the background-pattern setting.
Start shows Generating and disables repeat requests while a dedicated module worker
searches. Cancel or closing the modal terminates the worker, retaining the current
puzzle and arrangement; failures allow retry. Cancel is immediately available,
superseding the original ticket's delayed-cancel animation requirement.

The generation-only TypeScript engine is vendored at a pinned commit under
`vendor/tangram-generator/`; no sibling checkout, runtime server, or new dependency
is required. Its MIT attribution is shipped in `public/TangramGenerator-LICENSE.txt`.
The adapter rebuilds the ordered outline from the tans because upstream evaluation
sorts the stored outer outline in place. It preserves holes and reflected tans,
normalizes the generator's small-triangle scale (6 → 50), verifies total area,
and computes metadata with Paper.js. The worker alone imports the engine. Existing
Paper.js movement, snapping, rotations and completion remain unchanged.

Generated puzzles have no community ID or owner: generation and completion do not
write data, grant stars or offer moderator approval. Explicit Save tangram still
uses the live arrangement. A seeded generation stream advances independently of
layout/UI randomness, including across reopening the modal. Reload with the same
`?seed=…`, settings and actions to reproduce it. Same-difficulty Next is ticket 04,
not part of this first integration; use the menu to generate another puzzle.

Regression checks cover 118 converted solutions (including every slider level,
holes and both parallelogram orientations), real-worker seeded replay and invalid
difficulty, mouse-only completion of a generated puzzle without community writes,
cancellation/late-worker isolation, and failure/retry. Run:
`PLAYWRIGHT_CHANNEL=chrome bun run test:e2e tests/generation.spec.ts`.
The full release check passes 5 unit tests and 53 browser tests; typecheck,
formatting, and production build pass. The existing 60 lint warnings remain.

**Generation latency caveat:** exact-match rejection sampling intentionally has no
timeout or substituted difficulty. A local Bun 1.4.2 seeded sample of 200,000 engine
candidates took 107 seconds; counts for edges 5–22 were respectively
8, 22, 146, 539, 1799, 4768, 9851, 18328, 29423, 38804, 39867, 31456,
17192, 6087, 1451, 230, 25, 3. In a separate seeded scan with conversion, first
matches for all 18 levels appeared within 34,460 candidates (22.4 seconds total);
the 22-edge level was last. These are local engine measurements, not mobile/browser
latency promises. Both slider extremes can take much longer than middle levels,
especially 22 edges. Cancellation remains available; tuning the sampling strategy
is a follow-up, not a silent relaxation of the chosen difficulty.

**0.2.12 🥟.🐼.🌊 — automatic gallery scrolling.** The gallery replaces the
manual load-more button with native intersection observation inside its scroll
area. It reveals another 48 cards when the end is within 200px, and stops once
all matches are displayed. The scroll region is keyboard-focusable with a visible
focus outline; keyboard, wheel and touch scrolling use the same loading trigger.
Filters reset the display limit and scroll position without clearing selection.
Observers are disconnected on filter changes, batch updates and dialog close.

Run `PLAYWRIGHT_CHANNEL=chrome bun run test:e2e tests/gallery.spec.ts` for
keyboard/wheel loading, final-batch bounds, sharing and play order, filter resets,
empty-result recovery, reopening and touch long-press details. This still only
bounds initial rendering: scrolling through everything eventually mounts all
cards, and no server pagination or virtualization is introduced.

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

**0.2.3 🥟.🐼.📧 — correct email changes (ticket 02).** The email form now passes
the new email and current password in the correct order, reauthenticating with
the current account email first. Wrong passwords, invalid/occupied emails and
service failures retain feedback without false success or unhandled rejections.
Five browser checks cover these paths using the existing external-service fixture;
the failure cases verify that email, credentials and profile remain unchanged.
Run the same account test command above. Firebase remains unchanged; these tests
do not verify real account configuration or send verification emails.

**0.2.4 🥟.🐼.🧩 — active-puzzle lifetime (ticket 03).** Playlist and cursor are
updated atomically in the gallery state. Replacing an advanced playlist no longer
initializes an intermediate blank puzzle. The game's setup effect now owns its
disposal: cancel victory timers/tweens, stop particles, detach tan handlers and
remove the captured Paper project. Particle cleanup is idempotent, so disposal
does not depend on effect declaration order. Victory's delayed controls also
cancel their timer on unmount. Disabling particles mid-victory still completes
the solved puzzle safely.

Run `PLAYWRIGHT_CHANNEL=chrome bun run test:e2e tests/lifecycle.spec.ts` for
gallery replacement during victory, Next then playlist replacement, disabling
particles during victory, and actual React unmount/remount. The latter uses a
test-only page with real providers and gameplay; Firebase alone is substituted.
Tests replay the recorded mouse-only square solution and observe the Paper
boundary, without mocking completion. The stale-victory and double-initialization
regressions both failed before their fixes. Geometry, seeded random sequences,
Firebase contracts and generator integration are unchanged.

**0.2.5 🥟.🐼.📊 — shared player statistics (ticket 04).** Profile and leaderboard
use `calculatePlayerStats` for created puzzles, earned stars and completions.
Only approved puzzles contribute, self-stars do not count as earned stars, and
completion values are checked for presence rather than truthiness (zero counts).
Star-only records no longer inflate completed totals. No Firebase data migration
or writes are needed: the fix changes calculation/display only.

Literal unit fixtures cover zero/nonzero times, absent activity, self-stars and
unapproved puzzles. `PLAYWRIGHT_CHANNEL=chrome bun run test:e2e tests/statistics.spec.ts`
checks the leaderboard and its nested profile against the same external-service
fixture; it reproduced the incorrect completion total before the fix.

**0.2.6 🥟.🐼.⚡ — incremental gallery (ticket 05).** The gallery initially
mounted at most 48 cards. Its localized, keyboard-accessible “Show more tangrams”
button added another 48 (replaced by automatic scrolling in 0.2.12), preserving
category order. Changing a filter resets the
display limit and scroll position, not selection. Selected-ID checks use a Set;
the existing array still determines playlist and share-link order. Touch
long-press details remain available for newly displayed cards. Shared buttons
now show a theme-aware keyboard focus outline instead of suppressing it.

`PLAYWRIGHT_CHANNEL=chrome bun run test:e2e tests/gallery.spec.ts` checks a
120-puzzle fixture, keyboard expansion, cross-batch sharing and actual mouse-only
completion in selected order, filters and touch long-press. Tests assert card
counts and behavior, not wall-clock thresholds.

Comparable local Chrome measurements used three fresh-page runs per collection,
a 627×863 viewport, development Vite, identical square shapes with distinct IDs,
guest mode, disabled particles and blocked remote images. Median browser task
time from opening the gallery through two animation frames changed as follows:

| Puzzles | Before (ms) | After (ms) | Dialog DOM nodes before → after |
| --- | ---: | ---: | ---: |
| 1 | 15.0 | 14.9 | 80 → 80 |
| 200 | 54.0 | 26.4 | 1,075 → 316 |
| 1,000 | 174.6 | 25.9 | 5,075 → 316 |

These synthetic development measurements are not production/mobile latency or
FPS claims. Filtering still processes the collection; repeatedly expanding can
eventually mount every card. No virtualization dependency was added.

**0.2.7 🥟.🐼.👤 — snapshot-derived user details (ticket 06).** The user
provider stores Auth identity and the existing users snapshot, deriving current
user details from those sources. It no longer fetches a duplicate document on
each Auth event or manually copies username updates into a second state object.
Logout cannot be undone by the old outstanding metadata read.

Startup waits for Auth and the initial users snapshot in either order. Missing
metadata does not block gameplay or invent a profile: account-dependent UI stays
unavailable until the snapshot contains that user's document, including the
interval between signup authentication and metadata creation. Snapshot changes
then update current-user details automatically. This does not repair missing
documents or change the Firebase version, account operations or subscriptions.

Run `PLAYWRIGHT_CHANNEL=chrome bun run test:e2e tests/user.spec.ts tests/account.spec.ts`.
The test-only provider page controls the external Firebase fixture, not React
state: it covers arrival order, zero duplicate reads, logout races, missing
metadata and later username updates. The normal profile UI also verifies username
writes and all existing password/email regressions. Real Firebase rules and
network failures remain outside these fixtures.

**0.2.8 🥟.🐼.💬 — simpler dialog workflows (ticket 07).** Ordinary dialogs
now use local open/data state and close callbacks instead of deferred promises.
They remain independently nestable: closing a profile or tangram detail preserves
the gallery and its selection. Starting the gallery closes it and any parent
menu, without assuming a menu exists. Login and challenge startup still await
meaningful decisions. Login returns the authenticated user or `null` on cancel;
cancelling save-flow login stops the workflow without opening another dialog or
writing a puzzle.

`PLAYWRIGHT_CHANNEL=chrome bun run test:e2e tests/dialogs.spec.ts tests/gallery.spec.ts`
covers cancelled and successful save-flow login, parentless gallery start, nested
profile/detail closing, gallery selection and challenge accept/cancel. The save
tests reuse the existing Paper geometry fixture to prepare a valid arrangement;
only external Firebase is substituted. Both cancellation and the old null-parent
promise error reproduced before the fix. No modal framework or exclusive-dialog
policy was introduced; existing challenge selection rules are unchanged.

**0.2.9 🥟.🐼.⚙️ — shared boolean preferences (ticket 08).** Particle and
background-pattern providers now use `useStoredBoolean`, retaining their named
contexts, hooks and `showParticles` / `showBackgroundPattern` keys. Both default
to enabled. Stored JSON booleans are read once during initialization; missing,
malformed or non-boolean values use the default. The current value is persisted
as a normalized JSON boolean, including startup defaults. If preference storage
is unavailable, toggles still work in memory but cannot survive a reload.

`PLAYWRIGHT_CHANNEL=chrome bun run test:e2e tests/preferences.spec.ts` checks
both settings through the normal UI with missing, true, false, malformed and
non-boolean storage, toggling/reloading each case, plus blocked preference storage.
The old double parse incorrectly treated JSON `null` as disabled; that regression
failed before the fix. Sound/theme storage is unchanged. There is no preference
registry or cross-tab synchronization layer.

**0.2.10 🥟.🐼.🧹 — unused-code cleanup (ticket 09).** Import/caller searches
confirmed that the custom `src/utils/useSound.ts` hook and the provider's
`approvedTangramsByCategory: null` placeholder had no consumers. Removing them
deletes 165 source lines (164 + 1). Gameplay still uses the installed `use-sound`
package; no dependency was removed and no bundle-size savings are claimed.
The deleted code remains recoverable from Git history.

The existing `tests/styling.spec.ts` real Web Audio check verifies playback and
muting; the full unit/browser suite remains the cleanup regression gate. Run
`PLAYWRIGHT_CHANNEL=chrome bun run test`.

The maintainer requested retaining `recomputeEverything` in
`src/utils/recomputeEvertything.ts` for manual maintenance. Its historical filename
and implementation are unchanged. It can rewrite stored tangrams, so it is not
part of application startup, tests or deployment, and was not run against data.

Remaining defect found while typing/reviewing:

- Secondary snapping reads an absent `shape` property from a Paper.js path.

Generator integration and the random-puzzle menu are separate follow-up work.

## TODOS

- Fix filled holes in cards path
