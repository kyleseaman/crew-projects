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

Then dashboard → App Store → install from local path
`/Users/kyle/Development/team-projects`, and enable it. (`kirocrew app install`
also works from a terminal the gateway recognises as its owner.)

The name `projects` is taken by the built-in Task Runner app, hence
`team-projects`; the sidebar label is "Projects".
