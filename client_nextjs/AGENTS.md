# Agent rules — client_nextjs (Next.js conversion)

Reference: `../server_fastapi/AGENTS.md` for shared conventions (ruff not used; lint = eslint; format = prettier; type-check = tsc --noEmit; test = vitest; no secrets committed; PORTING_NOTES.md updates required for deviations).

Layout: `app/` (App Router) + `src/lib/`, `src/store/`, `src/services/`, `src/components/`.
Target: `npm run build` + `npm run lint` + `npm run format --check` + `npm run test` green before marking any task done.

No `vite`. No `react-router-dom` (replaced by `next/link` + `next/navigation`). No `mongomock-motor` (frontend only).
