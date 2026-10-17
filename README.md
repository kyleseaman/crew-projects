# Projects (team-projects)

A Kiro Crew app page that shows every root `kirocrew-team-lead` session as a
project, with everything it dispatched grouped under it at most two levels deep:

- **Sub-team**: a session the lead created that created sessions of its own
  (a conductor, or a nested team lead). All its descendants are its workers.
- **Workers**: sessions the lead created directly that have no children.

Grouping follows each session's `created_by`, not sidebar folders. Status rolls
up worst-first (needs you › stalled › working › idle), the lead's loop comes
from `/api/autonudge`, and PR chips are de-duplicated across the team.

## Build and install

```bash
cd ui && npm install && npm test && npm run build
```

## Dev harness and screenshots

The app's UI is normally supplied with host data (`/api/chat/slots`,
`/api/autonudge`) and host-provided SDK modules, so it only renders inside an
enabled install. To develop and screenshot every view while the app stays
disabled, `ui/src/dev/` holds a mock-data harness that renders the real `App`
component against a stub `@kirocrew/app-sdk` and fixtures:

```bash
cd ui
npm run dev          # serve the harness at localhost (hot reload)
npm run screenshot   # build the harness and write PNGs to ../screenshots/
```

- `src/dev/sdk-stub.tsx` + `src/dev/ui-stub.tsx` stand in for
  `@kirocrew/app-sdk` and `@kirocrew/app-sdk/ui`. `useAppApi().get` resolves
  fixtures by path; the UI components mirror the host design system on the same
  theme tokens.
- `src/dev/fixtures.ts` mirrors the real `/api/chat/slots`, `/api/autonudge`
  and `/api/chat/folders` payload shapes, with multiple projects, a sub-team,
  direct workers, active and stopped loops, de-duplicated PRs across every CI
  state, and each `needs_you` / `stalled` / `working` / `idle` rollup.
- `vite.dev.config.ts` serves `index.html` → `src/dev/harness.tsx` and aliases
  the two SDK specifiers to the stubs. It writes its build to `dist-dev/`.
- `scripts/screenshot.mjs` builds the harness, serves it with Vite preview, and
  captures PNGs with Playwright (a dev dependency). Add views to its `VIEWS`
  list as later steps land.

The harness is dev-only. `npm run build` uses `vite.config.ts` (library mode,
entry `src/App.tsx`) and never imports anything under `src/dev/`, so the shipped
`dist/index.mjs` stays free of the stubs, fixtures and harness.

Then dashboard → App Store → install from local path
`/Users/kyle/Development/team-projects`, and enable it. (`kirocrew app install`
also works from a terminal the gateway recognises as its owner.)

The name `projects` is taken by the built-in Task Runner app, hence
`team-projects`; the sidebar label is "Projects".
