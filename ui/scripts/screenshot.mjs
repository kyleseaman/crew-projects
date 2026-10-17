/**
 * Screenshot the dev harness.
 *
 * Builds the harness (vite.dev.config.ts -> dist-dev/), serves it with Vite's
 * preview server, loads it in Playwright's bundled Chromium, and writes PNGs to
 * ../screenshots/. Step 1 captures the current App view; later steps add more
 * captures to the VIEWS list below.
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
 *  the UI into the state a view needs (clicking a project row, opening the
 *  New-project dialog) before the capture. `prepare` receives the Playwright
 *  page and must leave the view painted. */
const VIEWS = [
  // The default: the project list (folders) + the first project's page header,
  // which spans multiple repos and shows read-only instructions.
  { name: 'projects-overview', width: 1280, height: 900 },
  { name: 'projects-overview-narrow', width: 760, height: 900 },
  // The per-project GOALS view: a project with multiple LIVE goals (each with
  // its sub-team/worker rollup) and ARCHIVED goals below them.
  {
    name: 'project-goals',
    width: 1280,
    height: 1200,
    prepare: async page => clickProjectByName(page, 'Verify telemetry parsers'),
  },
  // A single-repo project (the extra_repos degrade path) that also shows one
  // live and one archived goal, selected by name.
  {
    name: 'project-single-repo',
    width: 1280,
    height: 900,
    prepare: async page => clickProjectByName(page, 'TrackOut braking coaching'),
  },
  // A folder with no directory set: the Set-directory prompt, never a guess.
  {
    name: 'project-set-directory',
    width: 1280,
    height: 900,
    prepare: async page => clickProjectByName(page, 'Mobile companion app'),
  },
  // The per-project LIBRARY: artifacts and output files produced across the
  // project's sessions, plus de-duplicated PRs. Selects the parsers project
  // (several artifacts, output files and PRs) and scrolls the Library into view.
  {
    name: 'project-library',
    width: 1280,
    height: 1200,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      const lib = page.locator('.tp-library').first()
      await lib.waitFor({ timeout: 10_000 })
      await lib.scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
    },
  },
  // The per-project SUBSCRIPTIONS panel: the active monitor loops and Slack
  // channel links on the project's sessions, plus the honest "schedules
  // unavailable" note (the app cannot read the person's crons). Selects the
  // parsers project (two monitors, two channel links) and scrolls the panel in.
  {
    name: 'project-subscriptions',
    width: 1280,
    height: 1400,
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      const subs = page.locator('.tp-subs').first()
      await subs.waitFor({ timeout: 10_000 })
      await subs.scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
    },
  },
  // The Subscriptions panel's CALM empty state: a project with no watcher armed
  // on any session (the Codex project has a lead but no loop and no Slack link),
  // so the panel shows its one-line reassurance plus the always-present
  // schedules-unavailable note — never a faked "no schedules" list.
  {
    name: 'project-subscriptions-empty',
    width: 1280,
    height: 900,
    prepare: async page => {
      await clickProjectByName(page, 'Codex effort controls')
      const subs = page.locator('.tp-subs-empty').first()
      await subs.waitFor({ timeout: 10_000 })
      await subs.scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
    },
  },
  // The New-project flow: name, one-or-more directories, fixed default agent.
  {
    name: 'new-project-dialog',
    width: 1280,
    height: 900,
    prepare: async page => {
      await page.getByRole('button', { name: 'New project' }).first().click()
      await page.waitForSelector('.tp-dialog', { timeout: 10_000 })
      // Add a second directory row so the multi-repo affordance is visible.
      await page.getByRole('button', { name: 'Add directory' }).click()
      await page.waitForTimeout(150)
    },
  },
  // The Waiting-on-you inbox at the TOP of the page, POPULATED: a pending
  // approval (parsers), a needs-input question and a stalled session (braking),
  // rolled up across projects. Captured from the overview so the inbox sits
  // above the project list, as it renders in the app.
  {
    name: 'waiting-on-you',
    width: 1280,
    height: 1000,
    prepare: async page => {
      await page.waitForSelector('.tp-inbox-list', { timeout: 10_000 })
      await page.waitForTimeout(200)
    },
  },
  // The inbox's CALM empty state. The harness `?empty=1` mode serves the
  // no-waiting slot list, so nothing needs the person and the inbox collapses
  // to its one-line reassurance (not an error) without pushing the page down.
  {
    name: 'waiting-on-you-empty',
    width: 1280,
    height: 900,
    query: '?empty=1',
    prepare: async page => {
      await page.waitForSelector('.tp-inbox-empty', { timeout: 10_000 })
      await page.waitForTimeout(200)
    },
  },
  // Subscriptions on a gateway WITHOUT the schedules route: the honest
  // unavailable note instead of an empty list.
  {
    name: 'project-subscriptions-no-schedules',
    width: 1280,
    height: 1200,
    query: '?noschedules=1',
    prepare: async page => {
      await clickProjectByName(page, 'Verify telemetry parsers')
      const subs = page.locator('.tp-subs').first()
      await subs.waitFor({ timeout: 10_000 })
      await subs.scrollIntoViewIfNeeded()
      await page.waitForTimeout(250)
    },
  },
  // The same overview on the dashboard's light theme, to prove the page reads
  // only host theme tokens (`?theme=` picks any dashboard theme id).
  { name: 'projects-overview-light', width: 1280, height: 900, query: '?theme=light' },
]

/** Click the project row whose title matches `name`. */
async function clickProjectByName(page, name) {
  const row = page.locator('.tp-prow', { hasText: name }).first()
  await row.click()
  await page.waitForTimeout(200)
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
    for (const view of VIEWS) {
      const page = await browser.newPage({
        viewport: { width: view.width, height: view.height },
        deviceScaleFactor: 2,
      })
      await page.goto(`${url}${view.query ?? ''}`, { waitUntil: 'networkidle' })
      // Let the first React Query fetch resolve and the list paint.
      await page.waitForSelector('.tp-root', { timeout: 10_000 })
      await page.waitForTimeout(400)
      if (view.prepare) await view.prepare(page)
      const file = resolve(outDir, `${view.name}.png`)
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
