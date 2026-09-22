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
PLAYWRIGHT_CHANNEL=chrome yarn test --grep "seeded square"
```

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
