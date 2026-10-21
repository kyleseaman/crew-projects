# Projects (project-hub)

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
  folder with no directory shows a small "No directory · Set" chip instead.

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

## Layout (three columns, since 0.6.0)

- **Left**: the project list (filter, status dot, "N of M goals live", PR chips).
- **Middle**: the selected goal's **lead chat**, full column height. The header
  names the goal, "Lead · agent · age", its status and loop count, a quiet
  **Open in Chat**, and — for a folder with no directory — a small
  **No directory · Set** chip (the old dashed banner is gone). Clicking a
  session or task in the right column opens it **here**, in place of the lead
  chat, with **Back to lead**; switching goals resets to that goal's lead.
- **Right** (~230px): **Goals · N** (selecting one switches the middle chat;
  the default is the most recently active live goal, then pinned so it never
  jumps on its own) with **New goal** (outlined), then the selected goal's
  **Sessions** tree (sub-lead → workers, each with a status read from its slot
  flags in `/api/chat/slots`: needs approval / needs you / stalled / working /
  idle, or done when idle with a merged PR), then collapsed **Project** (repos, default agent,
  instructions, Folder settings), **Subscriptions** and **Library** sections.
- Under 760px the columns stack (projects, chat at a capped height, goals +
  sessions); readable at 320px. Theme tokens only; transitions off under
  `prefers-reduced-motion`.

**Task board (dormant).** `Workspace` can draw a goal lead's work ledger as a
permanent board (a Needs-you strip, "N of M tasks done", one row per task with
nested sub-conductor tasks, "Other sessions" for unbound ones) from an optional
`boardSource` prop. No host route serves a session's work ledger to an app
today: `/api/work-ledger` is MCP-only and keyed by the caller's own session, and
`/api/crew-board` and `/api/members/{slug}/dashboard` are owner-only (an app
principal is never the owner) and mask `worker_session_key`. So the installed
app passes no source and every goal shows its Sessions tree. The dev harness's
`?board=1` supplies fixture ledgers.

## Lead chat (in-page)

The middle column is the host's own `ChatEmbed` (`@kirocrew/app-sdk`), mounted
frameless with `startAtBottom` on the selected goal's lead `slotKey` (or the
opened session's), keyed by slot so a switch reopens at the latest message.
Only one chat is mounted at a time. The app adds no chat logic of its own:

- **Read**: `GET /api/chat/slots/{slot}?limit=N` — the transcript poll (every
  1 s while a turn runs, every 5 s idle).
- **Send**: `POST /api/chat` with the lead's slot — exactly what typing in the
  host chat does. No agent is passed, so the session keeps its binding.
- **Approve**: tool-approval cards in the transcript use
  `POST /api/chat/slots/{slot}/approve` (already under the `/api/chat/slots`
  grant). For an app token the host also requires `permissions.sessionApproval`
  (see below), so 0.9.0 is the first version whose approve buttons the host
  accepts.
- **Approval mode** (0.9.0): under the composer, where the dashboard composer
  keeps its picker, the app draws a **Normal / Reads / Trust** picker
  (`ui/src/TrustControl.tsx`). The embed has no picker of its own, so the app
  writes through the host's own route, `POST /api/chat/mode {mode, slot}` —
  the call the dashboard picker makes — and reads the current mode off the slot
  row it already polls (`trust` / `trust_scope` / `trust_reads`). The host takes
  that call from an app only with **`permissions.sessionApproval: true`**, on one
  named slot the app may control (the app's own sessions, or a local user
  session); **YOLO** is process-global and refused from apps, so it is not
  offered. A refused pick is said in words beside the picker.

Adding `permissions.sessionApproval` in an update **disables the app until the
owner re-enables it** from its page in Apps (the host shows why).

**0.9.1 — showing the real mode, YOLO included.** The picker shows the chat's
real mode as the host reports it: the slot row's `trust` / `trust_scope` /
`trust_reads`, and the global YOLO flag, which no slot row carries. An in-page
app gets YOLO only from **`GET /api/status`** (`yolo`, plus
`disabled_approval_modes` for policy-locked modes), so 0.9.1 adds `/api/status`
to `permissions.api`. The host keeps the app enabled and withholds a new api
entry until the owner approves it on the app page; until then the picker reads
**Unknown**, never a guessed Normal. Under YOLO the trigger reads **YOLO** in the
warning style; the YOLO row is shown checked but disabled (apps cannot arm or end
YOLO), with **Open in Chat** to set it in the host's own picker. Normal / Reads /
Trust stay selectable and set the chat's own mode, which applies once YOLO is
turned off. Both reads are re-read on the 5 s poll and on every `slots` event.

**Every chat the app creates starts on `kirocrew-team-lead`** (0.9.1): New
project creates its folder with `default_agent: kirocrew-team-lead`, and New goal
creates its slot on the team lead even in a folder whose default agent is a
conductor (`newProjectRequest` / `newGoalRequest` in `ui/src/model.ts`, pinned by
`ui/src/create.test.ts`). Existing chats and folders are never re-written.

This needs **`/api/chat`** in `permissions.api` (added in 0.5.0). The entry is a
path prefix, so it also covers the rest of `/api/chat/*`; the app itself calls
only the routes above. The embed has no Stop control and shows no model
thinking, so the header keeps a quiet **Open in Chat** link to the full chat view.

**0.9.2 — the lead's own status.** The goal header pill, the Work tab's goal
picker and the Overview Goals row show the **lead's own** status (Needs you /
Stalled / Working / Idle; an idle lead on an active loop reads Working). The
sessions under the lead that wait on you or stalled are shown beside it as
named chips (**3 need you**, **1 stalled**); each opens a menu listing those
sessions, and picking one opens it in the middle column (with Back to lead).
No chip when none. Genuine rollups still count every session: the project dot
on the left, Overview Right now / Needs you, and each Work-tree row's own state
(`Project.leadStatus` / `rollupStatus` / `subAttention` in `ui/src/model.ts`,
pinned by `ui/src/subattention.test.tsx`). No permission changes.

**0.9.3 — loading placeholders.** While folders, slots and loops load, the page
draws its loaded three-column grid at the saved widths, collapse state and open
tab (`ui/src/Skeletons.tsx`), and nothing moves when the data lands. Before
this, it drew three full-width bars in the host's `--bg-hover`, which in the
light palettes is #f0f0f0 on a #fafafa page, so the bars barely showed. The bars are now the app's own
`.tp-sk`, mixed from the theme's text colour so they show in every palette.
Loops are part of the first load, so a lead no longer paints Idle and then
flips to Working. Subscriptions shows schedule-row placeholders instead of
"Nothing is watching" while schedules load, and the approval-mode picker shows
a pill placeholder until the host status read answers (Unknown only when it
fails). The Library keeps its one-line loading notes (0.8). Pinned by
`ui/src/skeletons.test.tsx`; harness pairs `screenshots/loading-*-loading.png`
/ `loading-*.png` assert the columns do not move on load.

**0.9.3 — Overview.** The four "Right now" tiles are gone. The tab opens on one
line, "N goals · n working · n idle · n need you": goals are counted by their
lead's own status, and "need you" is the number of Needs you rows, in the
warning colour and left out at zero. Chats that belong to no goal are not
counted. Each goal row shows the lead's status, the first sentence of its latest
message, and "n chats · n PRs · active …". The message is quoted only when the
slot row says the lead spoke last (`waiting_for_input` or `has_options`), and
left out otherwise. The goal rows no longer carry the sub-session chips (the
middle header keeps them). Needs you rows are plain, with no edge bar or tint: a
coloured icon and label, a plain hint (an approval names its tool kind, e.g.
"run a shell command"), and the time. A click opens that chat in the middle,
keeps the panel on Overview, and keeps the row selected while the chat is open
(`ui/src/overview093.test.tsx`).

**0.9.4 — embedded chat.** The composer placeholder names the chat's agent,
"Message {agent}…", for the lead chat and for any session opened in the middle
column (`chatAgentName` in `ui/src/model.ts`: the slot row's `agent`, which for
a crewmate chat is the crewmate's name; the rows carry no other display name).
With no agent the app passes no placeholder and the host's own "Message..."
shows. A long name stays on one line (clipped at the edge on a narrow column;
Chromium draws no ellipsis on a textarea placeholder), so an empty composer is
never two lines tall. The reply-option chip rows no longer sit flush on the composer: the
composer row has a 6px top margin, the same as the gap between chip rows, and
keeps the chips' left edge. Pinned by `ui/src/composer.test.tsx`; harness views
`screenshots/composer-chips.png` / `composer-chips-320.png` (`?chips=1` draws the
host's chip rows) measure both gaps and the shared left edge.

## Button hierarchy

One filled (primary) button on the page: **New project** in the page header.
**New goal** is secondary (outlined); **Open in Chat**, **Back to lead** and
**Folder settings** are tertiary (`.tp-btn-ghost`). The New-project dialog's
**Create project** is the dialog's own primary.

## Library

In the right column's collapsed **Library** section, each project shows the files added and produced
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

## Overview tab and the "need you" chip

The side panel opens on **Overview** (tabs: Overview | Work | Project |
Subscriptions | Library; the open tab persists, and a stored 0.7 `goals` tab
migrates to Work, its 0.8 name). Top to bottom, all from data the app already reads
(`buildOverview` in `ui/src/overview.ts`; no task-ledger data):

- **Needs you · N** — the project's sessions waiting on an approval, on input,
  or stalled (approval › input › stalled, then newest). Warm-accent rows; a
  click selects the goal and opens that session in the middle column. Left out
  when N = 0.
- **Right now** — goals live / working / idle / stalled, counted by the same
  slot tone the sessions tree uses.
- **Goals** — one row per live goal (state, agent count, lead loop N/M, last
  activity); a click opens its lead chat.
- **Pull requests · N** — grouped Checks failing / Open / Merged / Closed, with
  a summary line; a link the host reports no state for is grouped as "Status
  not shared" rather than guessed.
- **Recent** — the last five session events (finished a turn / is working /
  needs approval).

Overview is the **only** place waiting sessions are listed. 0.7's full-width
Waiting-on-you list above the columns is gone (with six waiting sessions it ate
two thirds of the viewport); the page header carries a one-line **"N need
you"** chip instead, counted from the same derivation, which opens Overview on
a project with sessions waiting. The columns always fill the remaining height.

**Work** (was Goals) is a compact goal picker on top and the selected goal's
full sessions tree below. **Library** lists files only (artifacts and output
files); each group loads, fails and shows its rows on its own, and the slow
output-file scan gives up after 45 s with a plain note instead of sitting on
grey placeholders.

## Build and install

```bash
cd ui && npm install && npm test && npm run build
```

The built `ui/dist/index.mjs` is committed, so a copy or clone of this folder
installs without Node. Requires Kiro Crew 0.10.0 or newer (`minKiroCrewVersion`
in `app.json`); an older gateway refuses the install instead of loading a page
that fails.

## Install on another gateway

`npm run package` (from `ui/`) rebuilds, tests, refuses a stale committed
bundle, and writes `release/project-hub-<version>.tar.gz` with just the runtime
files. On the other machine:

```bash
tar -xzf project-hub-<version>.tar.gz
kirocrew app install "$PWD/project-hub"
```

Then enable it in the dashboard (App Store → Projects → Enable → "Trust this
app and enable"). Trust is per gateway. To update an existing install, use the
App Store's Update action, or `kirocrew app uninstall project-hub` first.

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
  hidden and a foreign doc that must be filtered out). The project's de-duplicated
  PRs feed the Overview tab. For **Overview**, the fixtures carry seven waiting sessions across
  three projects, including a **Slack Code** project shaped like the owner's
  real sidebar (a conductor in a nested conductor folder with five
  sub-conductors under it); `slotsNoWaitingFixture` (every waiting flag
  cleared) backs the `?empty=1` mode for the no-Needs-you capture. For **Subscriptions**, the parsers project's sessions
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
  project's artifacts and output files; PRs are on Overview),
  `project-subscriptions` (a project's monitor loops, channel links and the
  schedules-unavailable note), `project-subscriptions-empty` (the panel's calm
  empty state on a project with no watcher), `new-project-dialog`,
  `needs-you-full-height` (1568x980, seven sessions waiting: header chip only,
  columns full height — the script fails the run if the chat column is under
  700px), `needs-chip-opens-overview`, `overview-no-needs`,
  `slack-code-work-tree` (the missing-sessions fix on the real Slack Code
  shape) and `projects-stacked-320`. A view entry may carry
  a `query` (e.g. `?empty=1`) appended to the harness URL before the capture.

The harness is dev-only. `npm run build` uses `vite.config.ts` (library mode,
entry `src/App.tsx`) and never imports anything under `src/dev/`, so the shipped
`dist/index.mjs` stays free of the stubs, fixtures and harness.

Then dashboard → App Store → install from local path (the absolute path of
this folder), and enable it. (`kirocrew app install`
also works from a terminal the gateway recognises as its owner.)

The name `projects` is taken by the built-in Task Runner app, hence
`project-hub`; the sidebar label is "Projects".
