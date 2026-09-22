# amstangram

Community driven tangrams

## Development

Use Node.js 20+ and Yarn 1. Install with `yarn install --frozen-lockfile`, then
`yarn dev`. Application code is strict TypeScript; Vite config and maintenance
scripts outside `src` remain JavaScript.

- `yarn typecheck`: application and browser geometry harness types.
- `yarn build`: typecheck and production bundle.
- `yarn lint`: application TypeScript (not vendored scripts); existing hook and
  unused-code warnings remain.
- `yarn playwright install chromium`, then `yarn test`: gallery → play → tan
  geometry → save submission and rejected-login smoke tests. To use installed Chrome instead:
  `PLAYWRIGHT_CHANNEL=chrome yarn test`.

The browser test replaces Firebase only in its own Vite config and blocks remote
requests. It checks submitted metadata in memory, never writes community data,
and does not verify real authentication or Firestore permissions.

## Migration baseline and known issues

The TypeScript migration starts from `7003b42762d7c48eaec354720c641e8ce4fb4915`.
Puzzle metadata/storage shapes and Paper.js algorithms are unchanged. The
`css-system` declarations are adapted in `src/utils/styles.ts`; runtime functions
are re-exported unchanged. `use-sound` needs a declaration path override because
its export map hides the bundled types.

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
