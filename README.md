# Projects (team-projects)

A Kiro Crew app page where **a project is a sidebar folder**. The list is
sourced from `GET /api/chat/folders`: every top-level folder is a project, shown
with its repositories, default agent and read-only instructions. Pre-existing
folders appear as projects as-is.

## Project list and page

- **List** — one row per top-level folder, sorted worst-status first then most
  recently active, showing its repositories and a goal count (`N of M goals
  live` when some are archived). A folder with no `project_dir` shows `No
  directory set`.
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

## Goals within a project

Under the header, a project lists its **goals** — the root `kirocrew-team-lead`
sessions filed in its folder. Each goal carries its own sub-team/worker rollup,
grouped at most two levels deep **under that goal**:

- **Live goals** (`GET /api/chat/slots`): a running team-lead, with its
  dispatched agents, loop and status. A live goal is attached to a project by
  `folder_id` (its folder subtree), or by a matching working directory when the
  session has no folder.
- **Archived goals** (`GET /api/sessions`): a team-lead **history** session with
  no live slot — a finished or set-aside goal. It shows dimmed and openable,
  with no live rollup. Attached by `folder_id` only; a goal currently open in a
  slot is never also listed as archived.

Within a live goal, grouping follows each session's `created_by`:

- **Sub-team**: a session the lead created that created sessions of its own
  (a conductor, or a nested team lead). All its descendants are its workers.
- **Workers**: sessions the lead created directly that have no children.

Each goal's grouping is scoped to that goal, so two goals in the same project
never pull in each other's agents. Status rolls up worst-first across a goal's
members (needs you › stalled › working › idle), the lead's loop comes from
`/api/autonudge`, and PR chips are de-duplicated. The project-list dot and sort
key read **live** goals only — an archived goal is idle by construction and
never raises the dot or sinks an active project down the list.

**New goal** creates an unsent draft team-lead session in the project's folder.
`openChat` alone cannot do this (its launch options carry no folder), so the app
`POST`s to `/api/chat/slots` with `{ agent: kirocrew-team-lead, folder_id }` —
core files the slot into the folder at birth without sending anything — then
navigates into that empty session. The person types and sends the first turn.
This is the app creating a brand-new slot; it never re-files an existing one.

## Library

Below the goals, each project has a **Library** — the files added and produced
across the project's sessions, plus its pull requests. "The project's sessions"
means every session the project owns: each goal's lead and all its sub-leads and
workers (and the archived goals' leads), derived from the goals the folder
already carries (`projectSessionKeys`). Three sections:

- **Artifacts** — `GET /api/artifacts?chat_folder=<folder_id>` lists every
  artifact touched by a chat filed in the project's folder subtree (open or
  archived); the host resolves the subtree server-side, so the app passes the
  project's `folder.id` and groups what comes back. Each row shows the artifact
  name, its kind, the session it came from, and when it changed, newest first.
  A row links to the host's read-only artifact page (`/artifacts/<slug>`) — the
  app never materializes, mutates or re-files an artifact.
- **Output files** — `GET /api/artifacts/session-docs` (the unscoped firehose of
  non-code document files produced across all sessions) filtered to the
  project's own sessions client-side, de-duplicated by path. A file already
  saved as an artifact is **not** re-listed here (it appears as its artifact);
  these are the loose outputs.
- **Pull requests** — de-duplicated across every goal in the project
  (`dedupeProjectPrs`), reusing each goal's already-deduped `source_links`.

The Library degrades gracefully: the artifacts/files views need the project's
folder id to scope to, so a project with no folder shows a **Files unavailable**
note while its pull requests (which come from the sessions themselves) still
show. A host listing error degrades the same way.

## Subscriptions

Below the goals, each project has a **Subscriptions** panel — what is watching
on the project's behalf, so a coordinator acts on signals without a prompt
(Cursor's "Projects" subscriptions are the reference). It shows only watchers
armed on the project's **own** sessions (the same `projectSessionKeys`
membership the Library uses), so a watch on a session outside the project never
appears. Three kinds, by what the app can actually read:

- **Monitors** — the **active** monitor loops (`GET /api/autonudge`) on the
  project's sessions. That reduced legacy read has no owner gate and no app
  scope, so every loop is visible; each row shows the cadence (`idle_secs`),
  progress (`cycle_count`/`max_cycles`) and the next fire (`next_due_ts`). A
  **stopped** loop is not a subscription — it is watching nothing — so it is
  excluded.
- **Channel links** — the sessions the host reports `slack_linked` for, each
  carrying the `slack_channel` it is bound to, read straight off the slot list
  the app already fetches.
- **Schedules** — a cron. `GET /api/crons` scopes its reply to the **calling
  app's own** jobs (`app_owner_name(created_by) == app`), and this app creates
  none, so the person's crons are invisible to it. Rather than grant a
  permission that returns an empty list reading as "no schedules" (a lie), the
  schedule kind **degrades to an explicit unavailable note** (`cronsAvailable()`
  is always false) and points the person at the owning session. The app
  therefore adds **no** new `permissions.api` grant.

Each row opens the owning session (`openChat({ slotKey })`). **Add
subscription** opens an **unsent draft** in the project's live lead session
(`openChat` with `autoSend: false`) pre-filled with a prompt the person edits
and sends — the agent then sets the watch up with its own tools. The app arms
nothing itself: it creates no cron, loop or channel link. The button is hidden
when the project has no live lead to draft into. When no watcher is armed, the
panel shows a calm empty state (the schedules-unavailable note still shows,
since it is a fact about the app, not about this project).

## Waiting on you

At the **top of the page**, above the project list, a **Waiting-on-you inbox**
rolls up — across **every** project — the sessions that need the person. It is
the cross-project roll-up of the `slotStatus` the model already derives: every
`needs_you` session (pending approval or awaiting input) and every `stalled`
one (interrupted), with a pending approval surfaced explicitly as its own kind
(`buildInbox`). `working` and `idle` sessions never enter it, and an archived
goal is idle by construction so it never contributes. The roll-up walks the
projects already built, so a session appears exactly once, attributed to the
project that owns it; the filter box never hides it (it rolls up all projects,
not the filtered list).

Each row names the project, the session, and **what it is waiting for**
(approval › input › a resume — the sort order, most acute first, then newest),
shows a one-line hint from the last message, and **opens that session on click**
(`openChat({ slotKey })`). A pending approval and a needs-input both use the warm
`--warn` token; a stalled session uses `--danger`.

When nothing is waiting, the inbox shows a **calm empty state** — a single quiet
line (`Nothing is waiting on you.`), not an error — and stays compact: it takes
only the height it needs, so an empty inbox does not push the project list down.

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
- `src/dev/fixtures.ts` mirrors the real `/api/chat/slots`, `/api/autonudge`,
  `/api/chat/folders`, `/api/sessions`, `/api/artifacts` and
  `/api/artifacts/session-docs` payload shapes: multiple project folders (one
  multi-repo with `extra_repos` and read-only `steering_dirs`, one single-repo,
  one with no `project_dir` for the Set-directory prompt, plus a nested
  sub-folder), **two live goals in one project** (each with its own
  sub-team/worker rollup), **archived goals** (team-lead history sessions,
  including rows that must be ignored: a non-lead chat, an already-live goal,
  and an unfiled lead), direct workers, active and stopped loops, de-duplicated
  PRs across every CI state, each `needs_you` / `stalled` / `working` / `idle`
  rollup, and a **Library** (artifacts tagged per folder so the stub mimics the
  host's `chat_folder` scope, output files including a saved doc that must be
  hidden and a foreign doc that must be filtered out, and the project's deduped
  PRs). For the **Waiting-on-you inbox**, the fixtures carry a pending approval
  (parsers), a needs-input question and a stalled session (braking) so the
  populated inbox spans two projects and all three kinds; `slotsNoWaitingFixture`
  (the same slots with every waiting flag cleared) backs the `?empty=1` mode for
  the empty-state capture. For **Subscriptions**, the parsers project's sessions
  carry active monitor loops with a cadence, progress and next fire
  (`loopsFixture`, which also keeps one **stopped** loop that must NOT appear)
  and two `slack_linked` sessions with channel names, while the Codex project
  has a lead but no watcher so it backs the panel's empty state.
- `vite.dev.config.ts` serves `index.html` → `src/dev/harness.tsx` and aliases
  the two SDK specifiers to the stubs. It writes its build to `dist-dev/`.
- `scripts/screenshot.mjs` builds the harness, serves it with Vite preview, and
  captures PNGs with Playwright (a dev dependency). Each `VIEWS` entry may carry
  a `prepare` step that drives the UI into a state (selecting a project, opening
  the New-project dialog) before the capture. Add views as later steps land.
  Current captures: `projects-overview`, `projects-overview-narrow`,
  `project-goals` (a project's live + archived goals, each with its rollup),
  `project-single-repo`, `project-set-directory`, `project-library` (a
  project's artifacts, output files and de-duplicated PRs),
  `project-subscriptions` (a project's monitor loops, channel links and the
  schedules-unavailable note), `project-subscriptions-empty` (the panel's calm
  empty state on a project with no watcher), `new-project-dialog`,
  `waiting-on-you` (the populated inbox — an approval, a needs-input and a
  stalled session across two projects), and `waiting-on-you-empty` (the calm
  empty state, served by the harness's `?empty=1` mode). A view entry may carry
  a `query` (e.g. `?empty=1`) appended to the harness URL before the capture.

The harness is dev-only. `npm run build` uses `vite.config.ts` (library mode,
entry `src/App.tsx`) and never imports anything under `src/dev/`, so the shipped
`dist/index.mjs` stays free of the stubs, fixtures and harness.

Then dashboard → App Store → install from local path
`/Users/kyle/Development/team-projects`, and enable it. (`kirocrew app install`
also works from a terminal the gateway recognises as its owner.)

The name `projects` is taken by the built-in Task Runner app, hence
`team-projects`; the sidebar label is "Projects".
