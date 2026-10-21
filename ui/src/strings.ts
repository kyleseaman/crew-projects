/** The app's own string catalog (English). Apps own their catalogs; keep every
 *  user-facing string here so a translation is one file. */
export const t = {
  title: 'Projects',
  subtitle: 'Each project is one team-lead session. Its sub-leads and workers are grouped under it.',
  newProject: 'New project',
  // --- In-page lead chat -----------------------------------------------------
  leadChatTitle: 'Lead chat',
  /** Return the middle column from an opened session to the goal's lead chat. */
  backToLead: 'Back to lead',
  /** The middle column, labelled for assistive tech. */
  chatColumn: 'Conversation',
  // --- Approval mode (the dashboard composer's Normal / Reads / Trust / YOLO) --
  approvalMode: 'Approval mode',
  approvalModeAria: (mode: string) => `Approval mode: ${mode}`,
  trustLabel: { normal: 'Normal', trust_reads: 'Reads', trust: 'Trust', yolo: 'YOLO', unknown: 'Unknown' } as Record<'normal' | 'trust_reads' | 'trust' | 'yolo' | 'unknown', string>,
  trustDesc: {
    normal: 'The agent checks with you before doing anything',
    trust_reads: 'The agent runs read-only shell commands on its own, but asks for everything else',
    trust: 'In this chat, the agent works without asking you first',
  } as Record<'normal' | 'trust_reads' | 'trust', string>,
  trustYoloDisabledHint: 'In every chat, the agent works without asking you first. Set YOLO from the chat.',
  trustYoloNote: 'YOLO is app-wide; set or end it in Chat.',
  trustYoloOnNote: 'YOLO is on for every chat. A mode picked here is this chat’s own, and applies once YOLO is turned off in Chat.',
  trustUnknownHint: 'Mode unknown: Projects can’t read the YOLO state yet. Approve its /api/status access on the Projects app page.',
  trustPolicyLocked: 'Disabled by your organization’s security policy.',
  trustSaving: 'Saving…',
  trustError: {
    not_granted: 'Projects needs the session-approval permission. Enable it on the Projects app page.',
    not_allowed: 'This session’s approval mode can’t be changed from Projects. Open it in Chat.',
    policy: 'Disabled by your organization’s security policy.',
    other: 'Couldn’t change the approval mode. Try again.',
  } as Record<'not_granted' | 'not_allowed' | 'policy' | 'other', string>,

  // --- Three-column workspace -----------------------------------------------
  /** The header chip that replaced the Set-directory banner. */
  dirChip: 'No directory',
  dirChipSet: 'Set',
  dirChipLabel: 'No directory set. Set directory',
  goalsHeading: (n: number) => `Goals · ${n}`,
  goalsListLabel: 'Goals',
  sideLabel: 'Goals and sessions',
  noGoalsYet: 'No goals yet.',
  noGoalsMiddleTitle: 'No goals in this project yet',
  noGoalsMiddleBody: 'Start one with New goal. It opens a team-lead chat in this project, and the lead’s chat shows here.',
  archivedGoalBody: 'This goal is archived. Its lead chat lives in history.',
  sessionsHeading: 'Sessions',
  noSessions: 'No sessions yet',
  otherSessions: 'Other sessions',
  projectDetails: 'Project',
  // --- Side panel tabs, collapse, column resizing ----------------------------
  sideTabsLabel: 'Side panel',
  // --- Overview tab ----------------------------------------------------------
  overviewLabel: 'Project overview',
  ovNeedsYou: (n: number) => `Needs you · ${n}`,
  /** A Needs you row's label, before its hint ("Approval · run a shell command"). */
  ovNeedLabel: { approval: 'Approval', needs_input: 'Question', stalled: 'Stalled' },
  /** The summary line: GOALS by their lead's status, then the Needs you rows. */
  ovSumGoals: (n: number) => (n === 1 ? '1 goal' : `${n} goals`),
  ovSumWorking: (n: number) => `${n} working`,
  ovSumIdle: (n: number) => `${n} idle`,
  ovSumNeedYou: (n: number) => (n === 1 ? '1 needs you' : `${n} need you`),
  ovSummaryLabel: 'Project summary',
  ovGoals: (n: number) => `Goals · ${n}`,
  ovNoGoals: 'No live goals.',
  ovGoalChats: (n: number) => (n === 1 ? '1 chat' : `${n} chats`),
  ovGoalPrs: (n: number) => (n === 1 ? '1 PR' : `${n} PRs`),
  ovGoalActive: (when: string) => `active ${when}`,
  ovGoalQuoteLabel: 'Lead’s latest message',
  ovPrs: (n: number) => `Pull requests · ${n}`,
  ovNoPrs: 'No pull requests mentioned in this project yet.',
  ovPrFailing: 'Checks failing',
  ovPrOpen: 'Open',
  ovPrMerged: 'Merged',
  ovPrClosed: 'Closed',
  ovPrUnknown: 'Status not shared',
  ovPrUnknownHint: 'The host does not share these pull requests’ checks or merge state with apps.',
  ovPrSummary: { failing: 'failing', open: 'open', merged: 'merged', closed: 'closed', unknown: 'no status' },
  ovRecent: 'Recent',
  ovNoRecent: 'No session activity yet.',
  ovRecentKind: {
    finished: 'finished a turn',
    working: 'is working',
    approval: 'needs approval',
  },
  // --- Sessions under a goal's lead that want the person ---------------------
  /** The chip beside the lead's own status: how many sessions UNDER the lead
   *  are stalled / need you. Named "sessions" so it never reads as the lead. */
  subStalled: (n: number) => `${n} stalled`,
  subNeedsYou: (n: number) => (n === 1 ? '1 needs you' : `${n} need you`),
  subStalledAria: (n: number) =>
    `${n === 1 ? '1 session' : `${n} sessions`} under the lead stalled. Show which.`,
  subNeedsYouAria: (n: number) =>
    `${n === 1 ? '1 session' : `${n} sessions`} under the lead need you. Show which.`,
  subStalledHead: 'Stalled under the lead',
  subNeedsYouHead: 'Needing you under the lead',
  subOpenHint: 'Open it here',
  // --- Work tab --------------------------------------------------------------
  workGoalPicker: 'Goal',
  workLiveGroup: 'Live goals',
  workArchivedGroup: 'Archived goals',
  workArchivedTag: 'archived',
  tabOverview: 'Overview',
  tabWork: 'Work',
  tabProject: 'Project',
  tabSubscriptions: 'Subscriptions',
  tabLibrary: 'Library',
  hidePanel: 'Hide side panel',
  showPanel: 'Show side panel',
  resizeProjects: 'Resize projects column',
  resizeSide: 'Resize side panel',
  resizeHint: 'Drag to resize. Arrow keys nudge, double-click resets.',
  sessionTone: {
    done: 'Done',
    working: 'Working',
    needs_approval: 'Needs approval',
    needs_you: 'Needs you',
    stalled: 'Stalled',
    idle: 'Idle',
  },
  // --- Task board (a goal lead's work ledger) --------------------------------
  boardHeading: 'Tasks',
  needsYouTitle: 'Needs you',
  needsYouNone: 'Nothing right now',
  needsApproval: 'Waiting for a tool approval',
  needsHuman: 'Waiting for your decision',
  tasksDone: (done: number, total: number) => `${done} of ${total} tasks done`,
  taskTone: {
    done: 'Done',
    working: 'Working',
    needs_you: 'Needs you',
    stuck: 'Stuck',
    waiting: 'Waiting',
  },
  /** The embedded chat's composer placeholder, naming the session's agent.
   *  With no agent name the app passes none and the host's own default shows. */
  chatPlaceholder: (name: string) => `Message ${name}…`,
  /** Jump to the full host chat view (Stop, thinking, the session rail). */
  openInChat: 'Open in Chat',
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
  /** The page placeholder's accessible name while its first reads load. */
  loadingProjects: 'Loading projects',
  schedulesLoading: 'Loading schedules',
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

  // --- Library: artifacts + output files (pull requests live on Overview) ---
  library: 'Library',
  librarySubtitle: 'Files saved and produced across this project.',
  libraryArtifacts: 'Artifacts',
  libraryFiles: 'Output files',
  libraryArtifactsCount: (n: number) => (n === 1 ? '1 artifact' : `${n} artifacts`),
  libraryFilesCount: (n: number) => (n === 1 ? '1 file' : `${n} files`),
  libraryNoArtifacts: 'No artifacts saved in this project yet.',
  libraryNoFiles: 'No output files produced in this project yet.',
  libraryEmpty: 'Nothing in this project’s library yet. Artifacts and output files will appear here.',
  /** Each group loads on its own; this one-line note replaces the old grey
   *  placeholder blocks, which read as broken when a slow scan never landed. */
  libraryLoadingArtifacts: 'Loading artifacts…',
  libraryLoadingFiles: 'Looking through session files…',
  /** The project has no folder id, so the folder-scoped listing can't run. */
  libraryFilesUnavailable: 'Files unavailable',
  libraryFilesUnavailableBody: 'This project has no folder to scope its files to, so artifacts and output files can’t be listed.',
  /** The host errored (or the scan ran past the app's wait) for one group. */
  libraryArtifactsError: 'Couldn’t load artifacts.',
  libraryFilesError: 'Couldn’t list output files. The scan of session files did not finish; it retries in a minute.',
  libraryBy: (title: string) => `from ${title}`,
  openArtifact: 'Open artifact',

  // --- Page header: the one-line count of sessions waiting on the person ---
  // (The rows themselves are in the Overview tab's Needs you section.)
  /** After the count: "7 need you". Hidden on a narrow screen (icon + count). */
  needsChipWord: (n: number) => (n === 1 ? ' needs you' : ' need you'),
  needsChipLabel: (n: number) =>
    `${n === 1 ? '1 session needs' : `${n} sessions need`} you. Show them in the Overview tab.`,

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
