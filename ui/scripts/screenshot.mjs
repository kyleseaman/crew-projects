/**
 * Screenshot the dev harness.
 *
 * Builds the harness (vite.dev.config.ts -> dist-dev/), serves it with Vite's
 * preview server, loads it in Playwright's bundled Chromium, and writes PNGs to
 * ../screenshots/. Each VIEWS entry is one PNG.
 *
 * Run from ui/:  npm run screenshot
 * It builds first, so you do not need a running dev server.
 */
import { preview } from 'vite'
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { execFileSync } from 'node:child_process'

const here = dirname(fileURLToPath(import.meta.url))
const uiDir = resolve(here, '..')
const outDir = resolve(uiDir, '..', 'screenshots')

/** Each entry is one PNG. The harness renders a single route; `prepare` drives
 *  the UI into the state a view needs (clicking a project row, a goal, a
 *  session, opening a section) before the capture. `prepare` receives the
 *  Playwright page and must leave the view painted. */
const VIEWS = [
  // 0.9.3 loading states, light theme (the owner's), each written as
  // `<name>-loading.png` beside the loaded `<name>.png`. Reads are held with
  // the stub's ?hold=, captured, then released; the column boxes must not
  // move when the data lands (asserted by loadingPair).
  loadingPair('loading-page-light', { hold: 'folders,slots,loops,status', theme: 'light', skeleton: '[data-testid="page-skeleton"]' }),
  loadingPair('loading-page-cream', { hold: 'folders,slots,loops,status', theme: 'solarized-light', skeleton: '[data-testid="page-skeleton"]' }),
  loadingPair('loading-tab-work-light', { hold: 'folders,slots,loops', theme: 'light', tab: 'work', skeleton: '[data-testid="page-skeleton"]' }),
  loadingPair('loading-tab-project-light', { hold: 'folders,slots,loops', theme: 'light', tab: 'project', skeleton: '[data-testid="page-skeleton"]' }),
  loadingPair('loading-tab-subscriptions-light', { hold: 'folders,slots,loops', theme: 'light', tab: 'subscriptions', skeleton: '[data-testid="page-skeleton"]' }),
  loadingPair('loading-tab-library-light', { hold: 'folders,slots,loops', theme: 'light', tab: 'library', skeleton: '[data-testid="page-skeleton"]' }),
  // Inside a loaded page: the schedules group of Subscriptions, the Library's
  // two groups (one-line notes by design since 0.8), the approval pill.
  loadingPair('loading-schedules-light', { hold: 'schedules', theme: 'light', tab: 'subscriptions', skeleton: '[aria-label="Loading schedules"] .tp-sk', columnsOnly: true }),
  loadingPair('loading-library-groups-light', { hold: 'artifacts,docs', theme: 'light', tab: 'library', skeleton: '.tp-library [role="status"]', columnsOnly: true }),
  loadingPair('loading-trust-pill-light', { hold: 'status', theme: 'light', skeleton: '[data-testid="trust-control"][data-mode="loading"]', columnsOnly: true }),
  // The default, three columns wide: projects | the most recently active live
  // goal's lead chat (opens at the latest message, composer pinned) | the
  // tabbed side panel on its default Overview tab (summary line, Needs you,
  // Goals, Pull requests, Recent).
  { name: 'projects-overview', width: 1440, height: 900 },
  // The owner's 0.7 bug report: SEVEN sessions wait on the person across
  // projects. The page shows only a one-line "7 need you" chip in its header;
  // the columns keep the full viewport height (the 0.7 list squeezed them into
  // a ~270px strip). Asserts the chat column's height before the capture.
  {
    name: 'needs-you-full-height',
    width: 1568,
    height: 980,
    prepare: async page => {
      await clickProjectByName(page, 'Slack Code')
      await page.waitForSelector('.tp-ov-needs', { timeout: 10_000 })
      const h = await page.locator('.tp-center').evaluate(el => el.getBoundingClientRect().height)
      const above = await page.locator('.tp-split').evaluate(el => el.getBoundingClientRect().top)
      // eslint-disable-next-line no-console
      console.log(`needs-you-full-height: split top ${Math.round(above)}px, chat column ${Math.round(h)}px of 980`)
      if (h < 700) throw new Error(`chat column only ${h}px tall`)
    },
  },
  // Clicking the header chip opens the Overview tab of a project with
  // sessions waiting (here from a project's Library tab, panel collapsed).
  {
    name: 'needs-chip-opens-overview',
    width: 1568,
    height: 980,
    prepare: async page => {
      await clickProjectByName(page, 'Codex effort controls')
      await clickTab(page, 'Library')
      await page.getByRole('button', { name: 'Hide side panel' }).click()
      await page.locator('.tp-needschip').click()
      await page.waitForSelector('.tp-ov-needs', { timeout: 10_000 })
      await page.waitForTimeout(250)
    },
  },
  // 0.9.2: the Slack Code lead is idle between patrol cycles (Loop 26/80)
  // while sessions under it wait or stalled. The header pill shows the LEAD's
  // own status (Working: idle on an active loop), and the sessions under it
  // are separate, named chips ("3 need you", "1 stalled"); the Overview Goals
  // row does the same. 0.9.1 read the tree's worst state as the lead's pill.
  {
    name: 'goal-lead-status-chips',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Slack Code')
      await assertLeadPill(page, 'Working')
      await page.locator('.tp-chead-meta [data-testid="sub-attention-stalled"]').waitFor({ timeout: 5_000 })
      // 0.9.3: the Overview goal row shows the lead's status only; the named
      // chips stay on the header (they would repeat Needs you).
      const row = await page.locator('.tp-ov-goal').first().innerText()
      if (/\bStalled\b/.test(row) || !/Working/.test(row) || /\d+ stalled|\d+ need you/.test(row)) throw new Error(`Overview goal row reads: ${row}`)
    },
  },
  // The header's "1 stalled" chip opened: it names the stalled session.
  {
    name: 'goal-stalled-chip-menu',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Slack Code')
      await page.locator('.tp-chead-meta [data-testid="sub-attention-stalled"] button').click()
      const item = page.locator('.tp-chead-meta .tp-subatt-menu').getByRole('menuitem', { name: /Scrubber parity/ })
      await item.waitFor({ timeout: 5_000 })
      await page.waitForTimeout(200)
    },
  },
  // Picking the name opens that session in the middle column, with Back to
  // lead; Back returns to the lead and its Working pill.
  {
    name: 'goal-stalled-chip-opens-session',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Slack Code')
      await page.locator('.tp-chead-meta [data-testid="sub-attention-stalled"] button').click()
      await page.locator('.tp-subatt-menu').getByRole('menuitem', { name: /Scrubber parity/ }).click()
      await page.getByRole('button', { name: 'Back to lead' }).waitFor({ timeout: 5_000 })
      const title = await page.locator('.tp-chead .tp-h2').innerText()
      if (!/Scrubber parity/.test(title)) throw new Error(`middle opened ${title}`)
      const embed = await page.locator('.tp-cbody [data-stub="chat-embed"]').getAttribute('data-slot')
      if (embed !== 'C-scrub') throw new Error(`chat bound to ${embed}`)
      // Round-trip once to prove Back to lead restores the lead pill, then
      // re-open the session for the capture.
      await page.getByRole('button', { name: 'Back to lead' }).click()
      await assertLeadPill(page, 'Working')
      await page.locator('.tp-chead-meta [data-testid="sub-attention-stalled"] button').click()
      await page.locator('.tp-subatt-menu').getByRole('menuitem', { name: /Scrubber parity/ }).click()
      await page.getByRole('button', { name: 'Back to lead' }).waitFor({ timeout: 5_000 })
      await page.waitForTimeout(200)
    },
  },
  // 0.9.3 Overview, light and dark: one summary line (goals by their lead's
  // status + how many need you), plain Needs you rows, goal rows with the
  // lead's status, its latest words and chats · PRs · active.
  { name: 'overview-light', width: 1440, height: 1000, query: '?theme=light', prepare: async page => assertOverview(page, 'Slack Code') },
  { name: 'overview-cream', width: 1440, height: 1000, query: '?theme=solarized-light', prepare: async page => assertOverview(page, 'Slack Code') },
  { name: 'overview-dark', width: 1440, height: 1000, prepare: async page => assertOverview(page, 'Slack Code') },
  { name: 'overview-320-light', width: 320, height: 2600, query: '?theme=light', prepare: async page => assertOverview(page, 'Slack Code') },
  // A Needs you row under the pointer: the hover fill, no edge bar or tint.
  {
    name: 'overview-needs-hover-light',
    width: 1440,
    height: 900,
    query: '?theme=light',
    prepare: async page => {
      await assertOverview(page, 'Slack Code')
      await page.locator('.tp-ov-need').nth(1).hover()
      await page.waitForTimeout(250)
    },
  },
  // A Needs you row clicked: its chat opens in the middle (Back to lead), the
  // panel stays on Overview, and that row stays selected while it is open.
  {
    name: 'overview-needs-selected-light',
    width: 1440,
    height: 900,
    query: '?theme=light',
    prepare: async page => {
      await assertOverview(page, 'Slack Code')
      const row = page.locator('.tp-ov-need', { hasText: 'Scrubber parity' })
      await row.click()
      await page.getByRole('button', { name: 'Back to lead' }).waitFor({ timeout: 5_000 })
      const tab = await page.locator('[role="tab"][aria-selected="true"]').getAttribute('id')
      if (tab !== 'tp-tab-overview') throw new Error(`panel moved to ${tab}`)
      if ((await row.getAttribute('aria-current')) !== 'true') throw new Error('clicked row is not selected')
      if ((await page.locator('.tp-ov-need[aria-current="true"]').count()) !== 1) throw new Error('more than one row selected')
      await page.mouse.move(700, 600)
      await page.waitForTimeout(250)
    },
  },
  { name: 'overview-needs-selected-dark', width: 1440, height: 900, prepare: async page => {
    await assertOverview(page, 'Slack Code')
    await page.locator('.tp-ov-need', { hasText: 'Scrubber parity' }).click()
    await page.getByRole('button', { name: 'Back to lead' }).waitFor({ timeout: 5_000 })
    await page.mouse.move(700, 600)
    await page.waitForTimeout(250)
  } },
  // Overview with nothing waiting: Needs you is left out entirely.
  {
    name: 'overview-no-needs',
    width: 1440,
    height: 900,
    query: '?empty=1',
    prepare: async page => clickProjectByName(page, 'Slack Code'),
  },
  // A returning 0.7 user whose stored tab is 'goals': it migrates to Work
  // (the renamed tab) instead of landing on a tab that no longer exists.
  {
    name: 'migrated-goals-tab',
    width: 1440,
    height: 900,
    prepare: async page => {
      await page.evaluate(() =>
        localStorage.setItem('project-hub:layout:v1', JSON.stringify({ left: 260, right: 300, collapsed: false, tab: 'goals' })),
      )
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForSelector('.tp-goal-select', { timeout: 10_000 })
      const sel = await page.locator('[role="tab"][aria-selected="true"]').getAttribute('id')
      if (sel !== 'tp-tab-work') throw new Error(`stored 'goals' opened ${sel}, not Work`)
    },
  },
  // The missing-sessions fix on the real Slack Code shape: the Work tab's
  // full tree shows the conductor and its five sub-conductors nested under it.
  {
    name: 'slack-code-work-tree',
    width: 1440,
    height: 1000,
    prepare: async page => {
      await clickProjectByName(page, 'Slack Code')
      await clickTab(page, 'Work')
    },
  },
  // Both column edges dragged (projects wider, side panel much wider), then
  // the page RELOADED: the widths come back from localStorage.
  {
    name: 'projects-resized',
    width: 1440,
    height: 900,
    prepare: async page => {
      await dragGrabber(page, 'left', 90)
      await dragGrabber(page, 'right', -160)
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForSelector('.tp-side', { timeout: 10_000 })
      await page.waitForTimeout(400)
    },
  },
  // The side panel collapsed from its strip toggle: the chat takes the space
  // and the reopen toggle sits at the middle header's top-right. Reloaded to
  // show the collapse persists.
  {
    name: 'project-panel-collapsed',
    width: 1440,
    height: 900,
    prepare: async page => {
      await page.getByRole('button', { name: 'Hide side panel' }).click()
      await page.reload({ waitUntil: 'networkidle' })
      await page.waitForSelector('.tp-center', { timeout: 10_000 })
      await page.waitForTimeout(400)
    },
  },
  // 760px: the breakpoint where the columns stack.
  { name: 'projects-overview-narrow', width: 760, height: 1900 },
  // 320px: stacked and readable (projects, chat at a capped height, goals +
  // sessions). Tall viewport so the whole stack is in frame.
  { name: 'projects-stacked-320', width: 320, height: 1800 },
  // Selecting another goal in the right column switches the middle chat.
  {
    name: 'project-goals',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Parser throughput regression sweep')
    },
  },
  // A single-repo project with one live and one archived goal.
  {
    name: 'project-single-repo',
    width: 1440,
    height: 900,
    prepare: async page => clickProjectByName(page, 'TrackOut braking coaching'),
  },
  // The in-page lead chat round trip: a message typed and sent in the middle
  // column's composer, the reply appended at the bottom.
  {
    name: 'project-lead-chat',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      const box = page.locator('.tp-cbody').getByRole('textbox')
      await box.fill('Ship the lap-split fix once CI is green, then pick up GPS drift.')
      await box.press('Enter')
      await page.waitForTimeout(700)
    },
  },
  // 0.9.0 — the owner's "the scroll is off" report: an EMPTY embedded composer
  // shows no scrollbar, and the paperclip, text and send share one box. The
  // prepare first proves the harness reproduces the bug: with the host's own
  // textarea border put back, the host auto-grow leaves the box overflowing
  // (the always-on thumb); with the app's CSS it does not.
  {
    name: 'composer-empty',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      const box = page.locator('.tp-cbody').getByRole('textbox')
      const overflow = () => box.evaluate(el => el.scrollHeight - el.clientHeight)
      // Bug, reproduced: the host's 1px border back on the textarea.
      await page.addStyleTag({ content: '.tp-cbody textarea.border{border:1px solid var(--border)!important}' })
      await box.fill('x')
      await box.fill('')
      const before = await overflow()
      await page.evaluate(() => document.head.lastElementChild?.remove())
      await box.fill('x')
      await box.fill('')
      const after = await overflow()
      // eslint-disable-next-line no-console
      console.log(`composer-empty: overflow with host border ${before}px, with app CSS ${after}px`)
      if (before <= 0) throw new Error('harness no longer reproduces the host overflow')
      if (after > 0) throw new Error(`empty composer overflows by ${after}px`)
      // Paperclip and send inside the row's border box.
      const row = await box.evaluate(el => el.parentElement.getBoundingClientRect().toJSON())
      for (const name of ['Attach files', 'Send']) {
        const b = await page.locator('.tp-cbody').getByRole('button', { name }).boundingBox()
        if (!b || b.x < row.x || b.x + b.width > row.x + row.width || b.y < row.y || b.y + b.height > row.y + row.height) {
          throw new Error(`${name} is outside the composer box`)
        }
      }
      await box.blur()
      await page.mouse.move(10, 10)
    },
  },
  // The composer auto-grows with the draft up to the host's cap (240px) and
  // only then scrolls, with the host's own thin scrollbar.
  {
    name: 'composer-grown',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      const box = page.locator('.tp-cbody').getByRole('textbox')
      const read = () => box.evaluate(el => ({ h: el.getBoundingClientRect().height, over: el.scrollHeight - el.clientHeight }))
      await box.fill(['Three lines:', 'ship the lap-split fix', 'then GPS drift'].join('\n'))
      const three = await read()
      if (three.over > 0) throw new Error(`3-line draft overflows by ${three.over}px at ${three.h}px`)
      await box.fill(Array.from({ length: 16 }, (_, i) => `line ${i + 1}`).join('\n'))
      const many = await read()
      // eslint-disable-next-line no-console
      console.log(`composer-grown: 3 lines ${Math.round(three.h)}px no overflow; 16 lines ${Math.round(many.h)}px, scrolls ${many.over}px`)
      if (Math.round(many.h) !== 240 || many.over <= 0) throw new Error('long draft did not cap at 240px and scroll')
      await box.hover()
    },
  },
  // 0.9.4 — the owner's "chips sit on the composer" report: with reply-option
  // chips showing (?chips=1, the host FollowUpBar's own classes), the gap from
  // the last chip row to the composer's border equals the gap between chip
  // rows, chips and composer share a left edge, and the placeholder names the
  // session's agent. At normal width and at 320px.
  composerChips('composer-chips', 1440, 900),
  composerChips('composer-chips-320', 320, 1800),
  // Item 1: the approval-mode picker under the composer, opened (Normal /
  // Reads / Trust with descriptions, a check on the current mode).
  {
    name: 'trust-control-menu',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      await page.getByRole('button', { name: /^Approval mode: / }).click()
      await page.waitForSelector('.tp-trust-menu', { timeout: 5_000 })
      await page.waitForTimeout(150)
    },
  },
  // Trust picked for an opened worker session: the write goes to the host route
  // and the trigger shows Trust once the re-read slot row says so.
  {
    name: 'trust-control-session',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      await page.locator('.tp-srow', { hasText: 'Resolve owner review findings' }).first().click()
      await page.waitForTimeout(250)
      const posted = page.waitForEvent('console', m => m.text().includes('/api/chat/mode'))
      await page.getByRole('button', { name: /^Approval mode: / }).click()
      await page.getByRole('menuitemradio', { name: /^Trust/ }).click()
      const msg = await posted
      // eslint-disable-next-line no-console
      console.log('trust-control-session:', msg.text())
      await page.getByRole('button', { name: 'Approval mode: Trust' }).waitFor({ timeout: 5_000 })
      await page.waitForTimeout(150)
    },
  },
  // 0.9.1 — the chat is in YOLO (set from the dashboard): the trigger says
  // YOLO in the warning style, and the menu shows YOLO checked but disabled,
  // with how to change it (in Chat); Normal / Reads / Trust stay selectable.
  {
    name: 'trust-control-yolo',
    width: 1440,
    height: 900,
    query: '?yolo=1',
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      await page.getByRole('button', { name: 'Approval mode: YOLO' }).click()
      await page.waitForSelector('[data-testid="trust-yolo-banner"]', { timeout: 5_000 })
      const yoloRow = page.getByRole('menuitemradio', { name: /^YOLO/ })
      if (!(await yoloRow.isDisabled())) throw new Error('YOLO row is selectable from the app')
      if ((await yoloRow.getAttribute('aria-checked')) !== 'true') throw new Error('YOLO row not checked')
      await page.waitForTimeout(150)
    },
  },
  // 0.9.1 — a mode changed ELSEWHERE shows up without a reload: YOLO turned on
  // in the "dashboard" (the stub's status flips) reaches the picker on the
  // next status read; the capture fails if it does not within one poll + 2s.
  {
    name: 'trust-control-follows-dashboard',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      await page.getByRole('button', { name: 'Approval mode: Normal' }).waitFor({ timeout: 5_000 })
      const t0 = Date.now()
      await page.evaluate(() => window.__stubSetYolo(true))
      await page.getByRole('button', { name: 'Approval mode: YOLO' }).waitFor({ timeout: 7_000 })
      // eslint-disable-next-line no-console
      console.log(`trust-control-follows-dashboard: YOLO shown ${Date.now() - t0}ms after it was turned on elsewhere`)
      await page.waitForTimeout(150)
    },
  },
  // 0.9.1 — the YOLO state cannot be read (the /api/status entry still
  // withheld): the picker says Unknown, never a guessed Normal.
  {
    name: 'trust-control-unknown',
    width: 1440,
    height: 900,
    query: '?nostatus=1',
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      await page.getByRole('button', { name: 'Approval mode: Unknown' }).click()
      await page.waitForSelector('.tp-trust-menu', { timeout: 5_000 })
      await page.waitForTimeout(150)
    },
  },
  // A session opened IN the middle column from the right column's tree, with
  // Back to lead and Open in Chat in its header. The goal card is no longer
  // selected (only the session row is), and the session's pending tool
  // approval is answerable in the embed, whose composer shows the attach
  // control (the harness stub mirrors the host's ChatEmbed here).
  {
    name: 'project-session-open',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      await page.locator('.tp-srow', { hasText: 'Resolve owner review findings' }).first().click()
      await page.waitForTimeout(250)
    },
  },
  // The permanent task board (harness `?board=1` supplies fixture ledgers; the
  // host has no app-readable ledger route today): Needs-you strip with an
  // approval and a decision, done count, a sub-conductor's tasks nested.
  {
    name: 'project-task-board',
    width: 1440,
    height: 1000,
    query: '?board=1',
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      await page.waitForSelector('.tp-board', { timeout: 10_000 })
      await page.waitForTimeout(250)
    },
  },
  // A goal with no sessions: "No sessions yet".
  {
    name: 'project-no-sessions',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Codex effort controls')
      await clickTab(page, 'Work')
    },
  },
  // A folder with no directory and no goals: the header's "No directory · Set"
  // chip (the old dashed banner is gone), the middle's how-to-start empty
  // state, and the empty Goals list.
  {
    name: 'project-set-directory',
    width: 1440,
    height: 900,
    prepare: async page => clickProjectByName(page, 'Mobile companion app'),
  },
  // The side panel's Project tab: repositories, default agent, instructions.
  {
    name: 'project-tab-project',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickTab(page, 'Project')
    },
  },
  // The project's Library tab.
  {
    name: 'project-library',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickTab(page, 'Library')
    },
  },
  // The project's Subscriptions tab.
  {
    name: 'project-subscriptions',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickTab(page, 'Subscriptions')
    },
  },
  // Subscriptions' calm empty state (the Codex project has nothing watching).
  {
    name: 'project-subscriptions-empty',
    width: 1440,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Codex effort controls')
      await clickTab(page, 'Subscriptions')
    },
  },
  // Subscriptions on a gateway WITHOUT the schedules route.
  {
    name: 'project-subscriptions-no-schedules',
    width: 1440,
    height: 900,
    query: '?noschedules=1',
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickTab(page, 'Subscriptions')
    },
  },
  // The New-project flow: name, one-or-more directories, fixed default agent.
  {
    name: 'new-project-dialog',
    width: 1440,
    height: 900,
    prepare: async page => {
      await page.getByRole('button', { name: 'New project' }).first().click()
      await page.waitForSelector('.tp-dialog', { timeout: 10_000 })
      await page.getByRole('button', { name: 'Add directory' }).click()
      await page.waitForTimeout(150)
    },
  },
  // The light theme, to prove the page reads only host theme tokens.
  { name: 'projects-overview-light', width: 1440, height: 900, query: '?theme=light' },
]

/** A loading view and its loaded twin. Opens with `hold` reads pending (and
 *  the side panel on `tab`), waits for `skeleton`, writes `<name>-loading.png`,
 *  releases the reads, waits for the skeleton to go, and leaves the loaded
 *  page for the main capture. Throws when a skeleton outlives its data, or
 *  when the three columns / tab strip move or resize as the data lands (more
 *  than 1px), or the middle header changes height by more than 4px. */
function loadingPair(name, { hold, theme, tab = 'overview', skeleton, columnsOnly = false }) {
  return {
    name,
    width: 1440,
    height: 900,
    query: `?theme=${theme}&hold=${hold}`,
    prepare: async page => {
      if (tab !== 'overview') {
        await page.evaluate(
          t => localStorage.setItem('project-hub:layout:v1', JSON.stringify({ left: 260, right: 300, collapsed: false, tab: t })),
          tab,
        )
        await page.reload({ waitUntil: 'domcontentloaded' })
      }
      await page.locator(skeleton).first().waitFor({ timeout: 10_000 })
      await page.waitForTimeout(300)
      const boxes = () =>
        page.evaluate(() =>
          ['.tp-list', '.tp-center', '.tp-side', '.tp-tabstrip', '.tp-chead'].map(sel => {
            const r = document.querySelector(sel)?.getBoundingClientRect()
            return r ? { sel, x: r.x, y: r.y, w: r.width, h: r.height } : { sel, missing: true }
          }),
        )
      const before = await boxes()
      await page.screenshot({ path: resolve(outDir, `${name}-loading.png`), fullPage: true })
      await page.evaluate(() => window.__stubRelease('all'))
      await page.locator(skeleton).first().waitFor({ state: 'detached', timeout: 10_000 })
      if (!columnsOnly) await page.locator('.tp-prow').first().waitFor({ timeout: 10_000 })
      await page.waitForTimeout(400)
      const left = await page.locator('.tp-sk').count()
      if (left > 0) throw new Error(`${name}: ${left} placeholder(s) left after every read answered`)
      const after = await boxes()
      const moved = []
      for (let i = 0; i < before.length; i++) {
        const a = before[i], b = after[i]
        if (a.missing || b.missing) { if (a.missing !== b.missing) moved.push(`${a.sel} ${a.missing ? 'appeared' : 'vanished'}`); continue }
        const tol = a.sel === '.tp-chead' ? 4 : 1
        for (const k of a.sel === '.tp-chead' ? ['h'] : ['x', 'y', 'w', 'h']) {
          if (Math.abs(a[k] - b[k]) > tol) moved.push(`${a.sel}.${k} ${Math.round(a[k])}->${Math.round(b[k])}`)
        }
      }
      // eslint-disable-next-line no-console
      console.log(`${name}: layout shift on load: ${moved.length ? moved.join(', ') : 'none'}`)
      if (moved.length) throw new Error(`${name}: layout moved when the data landed: ${moved.join(', ')}`)
    },
  }
}

/** The embedded composer with follow-up chip rows above it (see VIEWS). Writes
 *  the full page as `<name>.png` and a crop of the chips + composer as
 *  `<name>-crop.png`. With SHOT_BEFORE=1 it only measures and captures (the
 *  BEFORE frames of a fix); otherwise it asserts the gap, the shared left edge
 *  and the paperclip/send staying inside the composer box. */
function composerChips(name, width, height) {
  return {
    name,
    width,
    height,
    query: '?chips=1',
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      await clickGoal(page, 'Verify telemetry parsers')
      const body = page.locator('.tp-cbody')
      await body.locator('[data-stub="follow-up-chip"]').first().waitFor({ timeout: 5_000 })
      const box = body.getByRole('textbox')
      await box.fill('x')
      await box.fill('')
      await box.blur()
      await page.mouse.move(1, 1)
      const m = await page.evaluate(() => {
        const chips = [...document.querySelectorAll('.tp-cbody [data-stub="follow-up-chip"]')].map(el => el.getBoundingClientRect())
        const rows = []
        for (const r of chips) {
          const row = rows.find(x => Math.abs(x.top - r.top) < 1)
          if (row) { row.bottom = Math.max(row.bottom, r.bottom); row.left = Math.min(row.left, r.left) } else rows.push({ top: r.top, bottom: r.bottom, left: r.left })
        }
        rows.sort((a, b) => a.top - b.top)
        const ta = document.querySelector('.tp-cbody textarea')
        const comp = ta.parentElement.getBoundingClientRect()
        const wrap = document.querySelector('.tp-cbody [data-stub="follow-up"]').getBoundingClientRect()
        const foot = document.querySelector('.tp-cfoot').getBoundingClientRect()
        const inBox = ['Attach files', 'Send'].every(n => {
          const b = document.querySelector(`.tp-cbody [aria-label="${n}"]`)?.getBoundingClientRect()
          return b && b.left >= comp.left && b.right <= comp.right && b.top >= comp.top && b.bottom <= comp.bottom
        })
        return {
          rows: rows.length,
          rowGap: rows.length > 1 ? rows[1].top - rows[0].bottom : null,
          above: comp.top - rows[rows.length - 1].bottom,
          chipLeft: rows[0].left,
          composerLeft: comp.left,
          overflow: ta.scrollHeight - ta.clientHeight,
          emptyHeight: ta.getBoundingClientRect().height,
          inBox,
          placeholder: ta.getAttribute('placeholder'),
          clip: { x: Math.max(0, comp.left - 16), y: Math.max(0, wrap.top - 16), width: comp.width + 32, height: foot.bottom - wrap.top + 24 },
        }
      })
      const r = n => (n === null ? 'n/a' : `${Math.round(n * 100) / 100}px`)
      // eslint-disable-next-line no-console
      console.log(`${name}: ${m.rows} chip rows, gap between rows ${r(m.rowGap)}, gap above composer ${r(m.above)}, chip left ${r(m.chipLeft)} / composer left ${r(m.composerLeft)}, empty overflow ${m.overflow}px, empty composer ${r(m.emptyHeight)} tall, paperclip+send in box ${m.inBox}, placeholder "${m.placeholder}"`)
      const suffix = process.env.SHOT_SUFFIX ?? ''
      await page.screenshot({ path: resolve(outDir, `${name}${suffix}-crop.png`), clip: m.clip })
      if (process.env.SHOT_BEFORE === '1') return
      if (m.rows < 2) throw new Error(`${name}: only ${m.rows} chip row(s); the gap between rows cannot be compared`)
      if (Math.abs(m.above - m.rowGap) > 0.5) throw new Error(`${name}: gap above composer ${m.above}px != gap between chip rows ${m.rowGap}px`)
      if (Math.abs(m.chipLeft - m.composerLeft) > 0.5) throw new Error(`${name}: chips start at ${m.chipLeft}px, composer at ${m.composerLeft}px`)
      if (m.overflow > 0) throw new Error(`${name}: empty composer overflows by ${m.overflow}px`)
      // One line, however long the agent name: a wrapped placeholder would
      // make the host auto-grow an EMPTY composer two lines tall.
      if (m.emptyHeight > 40) throw new Error(`${name}: empty composer is ${m.emptyHeight}px tall (placeholder wrapped)`)
      if (!m.inBox) throw new Error(`${name}: paperclip or send outside the composer box`)
      if (m.placeholder !== 'Message kirocrew-team-lead…') throw new Error(`${name}: placeholder reads "${m.placeholder}"`)
    },
  }
}

/** Open `project`'s Overview and check the 0.9.3 shape: the summary line is
 *  there, the old tiles are not, and no Needs you row draws an edge bar. */
async function assertOverview(page, project) {
  await clickProjectByName(page, project)
  await page.locator('[data-testid="ov-summary"]').waitFor({ timeout: 10_000 })
  const line = await page.locator('[data-testid="ov-summary"]').innerText()
  if (!/^\d+ goals? · \d+ working · \d+ idle( · \d+ needs? you)?$/.test(line.trim())) throw new Error(`summary reads: ${line}`)
  if (await page.locator('.tp-ov-tile').count()) throw new Error('Right now tiles still drawn')
  const edge = await page.locator('.tp-ov-need').evaluateAll(els =>
    els.map(e => getComputedStyle(e)).filter(cs => parseFloat(cs.borderLeftWidth) > 0 || (cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && cs.backgroundColor !== 'transparent')).length,
  )
  if (edge) throw new Error(`${edge} Needs you row(s) still draw an edge bar or tint`)
  // eslint-disable-next-line no-console
  console.log(`overview summary: ${line.trim()}`)
}

/** The middle header's lead pill must read `want` — and never Stalled, which
 *  is what 0.9.1 showed for an idle lead with an interrupted worker under it.
 *  The sub-session chips are lowercase ("1 stalled"), so this matches the
 *  capitalised status word only. */
async function assertLeadPill(page, want) {
  const meta = await page.locator('.tp-chead-meta').innerText()
  const pill = meta.replace(/\d+ (stalled|needs? you)/g, '')
  if (!pill.includes(want) || /\bStalled\b/.test(pill)) throw new Error(`lead header reads: ${meta}`)
}

/** Click the project row whose title matches `name`. */
async function clickProjectByName(page, name) {
  // Click the title, not the row's centre: a row with PR chips has a chip
  // there, and a chip click opens the PR instead of selecting the project.
  const row = page.locator('.tp-prow', { hasText: name }).first()
  await row.locator('.tp-title').click()
  await page.waitForTimeout(250)
}

/** Pick the goal whose title starts with `name` in the Work tab's picker. */
async function clickGoal(page, name) {
  await clickTab(page, 'Work')
  const select = page.locator('.tp-goal-select')
  const value = await select.evaluate(
    (el, n) => [...el.options].find(o => o.textContent.startsWith(n))?.value ?? '',
    name,
  )
  if (!value) throw new Error(`goal ${name} not in the picker: ${await select.evaluate(el => [...el.options].map(o => JSON.stringify(o.textContent)).join(', '))}`)
  await select.selectOption(value)
  await page.waitForTimeout(250)
}

/** Open one of the side panel's tabs. */
async function clickTab(page, label) {
  await page.getByRole('tab', { name: label }).click()
  await page.waitForTimeout(250)
}

/** Drag a column edge grabber by `dx` pixels with the mouse. */
async function dragGrabber(page, side, dx) {
  const box = await page.locator(`.tp-grab-${side}`).boundingBox()
  if (!box) throw new Error(`grabber ${side} not found`)
  const x = box.x + box.width / 2
  const y = box.y + box.height / 2
  await page.mouse.move(x, y)
  await page.mouse.down()
  for (let i = 1; i <= 8; i++) await page.mouse.move(x + (dx * i) / 8, y)
  await page.mouse.up()
  // The layout is saved shortly after the last change.
  await page.waitForTimeout(400)
}

async function main() {
  await mkdir(outDir, { recursive: true })

  // Build the harness to dist-dev/ (plain SPA; never touches dist/index.mjs).
  execFileSync('npm', ['run', 'dev:build'], { cwd: uiDir, stdio: 'inherit' })

  const server = await preview({
    configFile: resolve(uiDir, 'vite.dev.config.ts'),
    root: uiDir,
    preview: { port: 4317, strictPort: true },
  })
  const url = server.resolvedUrls.local[0].replace(/\/$/, '')

  const browser = await chromium.launch()
  try {
    const only = process.env.SHOT_ONLY ? new Set(process.env.SHOT_ONLY.split(',')) : null
    for (const view of VIEWS.filter(v => !only || only.has(v.name))) {
      const page = await browser.newPage({
        viewport: { width: view.width, height: view.height },
        deviceScaleFactor: 2,
      })
      await page.goto(`${url}${view.query ?? ''}`, { waitUntil: 'networkidle' })
      // Let the first React Query fetch resolve and the list paint.
      await page.waitForSelector('.tp-root', { timeout: 10_000 })
      await page.waitForTimeout(400)
      if (view.prepare) await view.prepare(page)
      const file = resolve(outDir, `${view.name}${process.env.SHOT_SUFFIX ?? ''}.png`)
      await page.screenshot({ path: file, fullPage: true })
      // eslint-disable-next-line no-console
      console.log('wrote', file)
      await page.close()
    }
  } finally {
    await browser.close()
    await server.httpServer.close()
  }
}

main().then(
  () => process.exit(0),
  err => {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
  },
)
