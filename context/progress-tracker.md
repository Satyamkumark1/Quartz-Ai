# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Backend API Routes

## Current Goal

- Implement Shape Panel per `12-shape-panel.md`

## Completed

- Install and configure shadcn/ui
- Add shadcn components: Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea
- Verify theme matching in `globals.css` (Forced default to dark mode)
- Build base chrome components (Editor Navbar and Project Sidebar)
- Install `@clerk/themes` and configure `ClerkProvider` in root layout
- Create `proxy.ts` middleware to protect routes
- Implement responsive Sign In and Sign Up pages with custom layout
- Configure `/` redirect logic to `/editor` (authed) or `/sign-in` (unauthed)
- Add `UserButton` to `EditorNavbar`
- Project Dialogs (Create, Rename, Delete)
- Mock project list in Project Sidebar
- Editor Home blank slate state
- Create Prisma models (Project, ProjectCollaborator)
- Setup Prisma Client singleton (`lib/prisma.ts`)
- Run initial migration
- Create `GET /api/projects` endpoint
- Create `POST /api/projects` endpoint
- Create `PATCH /api/projects/[projectId]` endpoint
- Create `DELETE /api/projects/[projectId]` endpoint
- Connect API endpoints to UI components
- Wire up project actions to the frontend components (Editor Home, Sidebar, Dialogs)
- Implement `/editor/[roomId]` server component with access checks
- Create `AccessDenied` component
- Update Workspace layout with `EditorNavbar` and `ProjectSidebar` enhancements
- Build the `/editor/[roomId]` workspace shell with server-side access checks
- Implement Share Dialog functionality
- Set up Liveblocks integration (`10-liveblocks-setup.md`)
- Set up Editor canvas
- Implement Shape Panel (`12-shape-panel.md`)

## In Progress 

- 

## Next Up

- Add AI workflows and collaboration controls

## Open Questions

- [Any unresolved product or technical decisions]

## Architecture Decisions

- [Decisions made that affect the system design or
  data model — include why the decision was made]

## Session Notes

- [Context needed to resume work in the next session]
