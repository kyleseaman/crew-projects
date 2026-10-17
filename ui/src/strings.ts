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
  loopStopped: (n: string) => `Loop ${n} · stopped`,
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
}
