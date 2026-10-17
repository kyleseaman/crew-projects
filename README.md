# Projects (team-projects)

A Kiro Crew app page where **a project is a sidebar folder**. The list is
sourced from `GET /api/chat/folders`: every top-level folder is a project, shown
with its repositories, default agent and read-only instructions. Pre-existing
folders appear as projects as-is.

## Project list and page

- **List** — one row per top-level folder, sorted worst-status first then most
  recently active. A folder with no `project_dir` shows `No directory set`.
- **New project** — a dialog takes a name, **one or more directories**, and the
  fixed default agent `kirocrew-team-lead`. It `POST`s to `/api/chat/folders`
  with `project_dir` (the first directory) and, when more are given, an optional
  `extra_repos` list. It never guesses a path — every directory is typed.
- **Project page header** — shows **all repositories** (the folder's
  `project_dir` first, then its optional `extra_repos`, degrading to just
  `project_dir` when the field is absent), the default agent, and the folder's
  instruction directories **read-only** with a link to folder settings. A
  folder with no directory shows a Set-directory prompt instead.

The app only **reads** and **creates/updates** folders through the public folder
API. It never writes `steering_dirs` — core refuses an app principal there by
design (`_refuse_principal_steering_dirs`) — and never reorganises, moves or
re-files existing sessions or folders.

## Agent activity within a project

Under the header, each project shows the team rollups whose sessions are filed
in the folder (by `folder_id`, or by a matching working directory when a session
has no folder). Each rollup groups everything a `kirocrew-team-lead` dispatched,
at most two levels deep:

- **Sub-team**: a session the lead created that created sessions of its own
  (a conductor, or a nested team lead). All its descendants are its workers.
- **Workers**: sessions the lead created directly that have no children.

Grouping follows each session's `created_by`. Status rolls up worst-first
(needs you › stalled › working › idle), the lead's loop comes from
`/api/autonudge`, and PR chips are de-duplicated across the team.

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
  and `/api/chat/folders` payload shapes: multiple project folders (one
  multi-repo with `extra_repos` and read-only `steering_dirs`, one single-repo,
  one with no `project_dir` for the Set-directory prompt, plus a nested
  sub-folder), a sub-team, direct workers, active and stopped loops,
  de-duplicated PRs across every CI state, and each `needs_you` / `stalled` /
  `working` / `idle` rollup.
- `vite.dev.config.ts` serves `index.html` → `src/dev/harness.tsx` and aliases
  the two SDK specifiers to the stubs. It writes its build to `dist-dev/`.
- `scripts/screenshot.mjs` builds the harness, serves it with Vite preview, and
  captures PNGs with Playwright (a dev dependency). Each `VIEWS` entry may carry
  a `prepare` step that drives the UI into a state (selecting a project, opening
  the New-project dialog) before the capture. Add views as later steps land.
  Current captures: `projects-overview`, `projects-overview-narrow`,
  `project-single-repo`, `project-set-directory`, `new-project-dialog`.

The harness is dev-only. `npm run build` uses `vite.config.ts` (library mode,
entry `src/App.tsx`) and never imports anything under `src/dev/`, so the shipped
`dist/index.mjs` stays free of the stubs, fixtures and harness.

Then dashboard → App Store → install from local path
`/Users/kyle/Development/team-projects`, and enable it. (`kirocrew app install`
also works from a terminal the gateway recognises as its owner.)

The name `projects` is taken by the built-in Task Runner app, hence
`team-projects`; the sidebar label is "Projects".
