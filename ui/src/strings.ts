/** The app's own string catalog (English). Apps own their catalogs; keep every
 *  user-facing string here so a translation is one file. */
export const t = {
  title: 'Projects',
  subtitle: 'Each project is one team-lead session. Its sub-leads and workers are grouped under it.',
  newProject: 'New project',
  openLead: 'Open lead chat',
  open: 'Open',
  search: 'Filter projects',
  lead: 'Lead',
  subTeam: 'Sub-team',
  subLead: 'sub-lead',
  worker: 'worker',
  workers: 'Workers',
  task: 'Task',
  step: 'Latest',
  prs: 'PRs',
  updated: 'Updated',
  loop: (n: string) => `Loop ${n}`,
  // A stopped LEAD loop says whose loop ended, so it never reads as the team
  // having stopped while its workers are still running.
  loopStopped: (n: string) => `Lead loop ended at ${n}`,
  moreRepos: (n: number) => `+${n}`,
  agents: (n: number) => (n === 1 ? '1 agent' : `${n} agents`),
  active: (n: number) => `${n} active`,
  noAgents: 'No agents yet. The lead has not dispatched anyone.',

  // --- Goals per project (Step 3) ------------------------------------------
  newGoal: 'New goal',
  openGoal: 'Open goal',
  liveGoals: 'Goals',
  archivedGoals: 'Archived goals',
  archivedGoal: 'Archived',
  noGoals: 'No goals yet. Start one to give the team-lead something to run.',
  /** The project-list subtitle count: how many goals are live out of the total
   *  (live + archived). */
  goalsCount: (live: number, total: number) =>
    total === live
      ? (total === 1 ? '1 goal' : `${total} goals`)
      : `${live} of ${total} goals live`,
  emptyTitle: 'No projects yet',
  emptyBody: 'A project starts when you open a chat with the kirocrew-team-lead agent and give it a goal.',
  noMatch: 'No projects match this filter.',
  selectHint: 'Select a project.',
  loadError: 'Could not load sessions',
  status: {
    needs_you: 'Needs you',
    stalled: 'Stalled',
    working: 'Working',
    idle: 'Idle',
  },
  ci: { passed: 'checks passed', failed: 'checks failed', running: 'checks running' },
  untitled: 'Untitled session',

  // --- Projects = folders (Step 2) -----------------------------------------
  projects: 'Projects',
  projectsSubtitle: 'Each project is a folder: its repositories, default agent and instructions.',
  searchProjects: 'Filter projects',
  noProjectFolders: 'No project folders yet.',
  noProjectMatch: 'No projects match this filter.',
  projectsEmptyTitle: 'No projects yet',
  projectsEmptyBody: 'Create a project to give your team a home: one or more repositories, a default agent and shared instructions.',
  foldersLoadError: 'Could not load projects',
  selectProjectHint: 'Select a project.',

  // New-project flow
  newProjectTitle: 'New project',
  projectName: 'Project name',
  projectNamePlaceholder: 'e.g. Verify telemetry parsers',
  directories: 'Directories',
  directoriesHint: 'One or more repository paths. Add more for a multi-repo project.',
  directoryPlaceholder: '/Users/you/Development/your-repo',
  addDirectory: 'Add directory',
  removeDirectory: 'Remove directory',
  defaultAgentLabel: 'Default agent',
  defaultAgentHint: (agent: string) => `New chats in this project start with ${agent}.`,
  createProject: 'Create project',
  creating: 'Creating…',
  cancel: 'Cancel',
  createProjectError: 'Could not create the project.',
  nameRequired: 'Enter a project name.',

  // Project page header
  repositories: 'Repositories',
  oneRepo: '1 repository',
  nRepos: (n: number) => `${n} repositories`,
  defaultAgentHeader: 'Default agent',
  instructions: 'Instructions',
  instructionsReadOnly: 'Read-only · managed in folder settings',
  noInstructions: 'No shared instructions.',
  nInstructionDirs: (n: number) => (n === 1 ? '1 directory' : `${n} directories`),
  folderSettings: 'Folder settings',
  openProject: 'Open project chat',
  setDirectoryTitle: 'No directory set',
  setDirectoryBody: 'This folder is not linked to a repository yet. Set a directory in folder settings to use it as a project.',
  setDirectory: 'Set directory',

  // --- Library (Step 4): artifacts + output files + de-duplicated PRs -------
  library: 'Library',
  librarySubtitle: 'Files added and produced across this project, and its pull requests.',
  libraryArtifacts: 'Artifacts',
  libraryFiles: 'Output files',
  libraryPrs: 'Pull requests',
  libraryArtifactsCount: (n: number) => (n === 1 ? '1 artifact' : `${n} artifacts`),
  libraryFilesCount: (n: number) => (n === 1 ? '1 file' : `${n} files`),
  libraryPrsCount: (n: number) => (n === 1 ? '1 pull request' : `${n} pull requests`),
  libraryNoArtifacts: 'No artifacts produced in this project yet.',
  libraryNoFiles: 'No output files produced in this project yet.',
  libraryNoPrs: 'No pull requests opened in this project yet.',
  libraryEmpty: 'Nothing in this project’s library yet. Artifacts, output files and pull requests will appear here.',
  /** The project's sessions carry no folder id, so the folder-scoped artifact
   *  listing cannot be queried — the files view is unavailable, but PRs (from
   *  the sessions themselves) still show. */
  libraryFilesUnavailable: 'Files unavailable',
  libraryFilesUnavailableBody: 'This project has no folder to scope its files to, so artifacts and output files can’t be listed. Pull requests still show below.',
  /** The host returned an error for the artifact/file listing. */
  libraryLoadError: 'Could not load this project’s files',
  libraryBy: (title: string) => `from ${title}`,
  openArtifact: 'Open artifact',

  // --- Waiting-on-you inbox (Step 5): cross-project roll-up at top of page ---
  inboxTitle: 'Waiting on you',
  /** The count line beside the inbox title: how many sessions need you. */
  inboxCount: (n: number) => (n === 1 ? '1 session needs you' : `${n} sessions need you`),
  /** The calm empty state — shown compact at the top, not an error. */
  inboxEmpty: 'Nothing is waiting on you.',
  inboxEmptyHint: 'Sessions that need a decision, an approval, or a resume will show up here.',
  /** What each inbox row is waiting for, by kind. */
  inboxWaiting: {
    approval: 'Waiting for your approval',
    needs_input: 'Waiting for your input',
    stalled: 'Stalled — waiting for a resume',
  },
  /** The badge on an inbox row, by kind. */
  inboxBadge: {
    approval: 'Approval',
    needs_input: 'Needs you',
    stalled: 'Stalled',
  },
  /** The accessible label for an inbox row's open action: project · session. */
  inboxOpen: (project: string, session: string) => `Open ${session} in ${project}`,

  // --- Subscriptions (what is watching on the project's behalf) ------------
  subscriptions: 'Subscriptions',
  subscriptionsSubtitle: 'What is watching on this project’s behalf: schedules, monitors and channel links on its sessions.',
  subscriptionsCount: (n: number) => (n === 1 ? '1 subscription' : `${n} subscriptions`),
  /** The calm empty state — no watcher is armed on any of the project's sessions. */
  subscriptionsEmpty: 'Nothing is watching this project yet.',
  subscriptionsEmptyHint: 'Add a subscription to have a session act on a schedule, a monitor, or a channel without a prompt.',
  /** The Add-subscription button, and the draft it seeds into the lead session. */
  addSubscription: 'Add subscription',
  /** The pre-filled (UNSENT) prompt the Add button drops into the lead session.
   *  The agent sets the watch up with its own tools; the app creates nothing. */
  addSubscriptionDraft:
    'Set up a subscription for this project: e.g. watch a Slack channel and dispatch a goal for each bug report, or run a check every weekday at 9am. Tell me which signal to watch and what to do when it fires.',
  /** Section heads inside the panel, by kind. */
  subMonitors: 'Monitors',
  subSlack: 'Channel links',
  subSchedules: 'Schedules',
  subMonitorsCount: (n: number) => (n === 1 ? '1 monitor loop' : `${n} monitor loops`),
  subSlackCount: (n: number) => (n === 1 ? '1 channel link' : `${n} channel links`),
  /** A monitor row's secondary line: cadence · progress (loops run n of max). */
  subMonitorMeta: (cadence: string, progress: string) =>
    [cadence, progress ? `loop ${progress}` : ''].filter(Boolean).join(' · '),
  /** A monitor row's next-fire label; the time is appended by the UI. */
  subNextFire: 'next',
  /** A Slack row's secondary line: the linked channel. */
  subSlackMeta: (channel: string) => (channel ? `Linked to ${channel}` : 'Linked to a channel'),
  /** The honest UNAVAILABLE state for schedules: the app cannot read the
   *  person's crons, so it says so rather than render an empty "no schedules". */
  subSchedulesCount: (n: number) => (n === 1 ? '1 schedule' : `${n} schedules`),
  subSchedulesNone: 'No schedules on this project’s sessions.',
  subSchedulePaused: 'Paused',
  subScheduleNext: (when: string) => `next ${when}`,
  subScheduleLast: (status: string) => `last run ${status}`,
  subSchedulesUnavailable: 'Schedules can’t be listed here',
  subSchedulesUnavailableBody:
    'This Kiro Crew version doesn’t offer project schedules to apps. Open a session to see and manage its schedules.',
  /** The accessible label for a subscription row's open action. */
  subscriptionOpen: (session: string) => `Open ${session}`,
}
