# Hearthstone (client_nextjs)

Next.js (App Router) port of `client_react` (Vite + react-router). Same MUI theme, zustand stores, socket.io client contract with `server_fastapi`.

## Run

```bash
cp .env.local.example .env.local   # fill values
npm install
npm run dev                        # http://localhost:3000
```

## Build / start

```bash
npm run build
npm start                          # or: node .next/standalone/server.js
```

## Scripts

- `npm run lint` — next lint (core-web-vitals; parity quirks downgraded to warnings)
- `npm run type-check` — `tsc --noEmit`
- `npm test` — jest + @testing-library/jest-dom

## Env

`REACT_APP_*` became `NEXT_PUBLIC_*` (see `.env.local.example`). Config lives in `src/config.ts`.

## Route mapping (App Router)

| React (`App.tsx`) | Next |
| --- | --- |
| `/` | `src/app/page.tsx` (Home / HomeLoggedIn by `useUserStore().auth`) |
| `/agreement`, `/agreement/:id` | `src/app/agreement` |
| `/components` | `src/app/components` |
| `/google/redirect`, `/twitter/redirect` | `src/app/google`, `src/app/twitter` |
| `/activate-account/:token` | `src/app/activate-account` |
| `/policy-agreement` | `src/app/policy-agreement` |
| `/my-matches`, `/matches`, `/messages`, `/my-account/*`, `/dashboard/*`, `/my-properties` | matching `src/app/*` folders, wrapped in `AuthGuard` (renders `Home` when unauthenticated) |

Feature components live under `src/view-components/**`; page files currently mount the corresponding feature component (stubs pending full wiring for some routes — see `PORTING_NOTES.md`).

## Differences from client_react

- No `react-router-dom`; `src/compat/router.tsx` adapts navigation APIs to `next/navigation`.
- `reactjs-social-login` and portal components (`Modal`, `Drawer`, `GlobalLoading`) are client-only / guarded for SSR.
- Image imports are typed as `string` (vite parity) via patched `node_modules/next/image-types/global.d.ts`.
- `tsconfig` relaxes `strictNullChecks`/`noImplicitAny` to match `client_react`.
