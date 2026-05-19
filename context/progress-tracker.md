# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Collaborative Canvas

## Current Goal

- AI presence state UI

## Completed

- Implement node editing per `14-node-editing.md`
- Implement node color toolbar per `15-nodes-color-toolbar.md`
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
  - Implement node shape styling and drag previews (`13-node-shape.md`)
- Implement custom edge behavior and inline labels per `16-edge-behavior.md`
- Add zoom/undo canvas control bar and keyboard shortcuts per `17-canvas-ergonomics.md`
- Implement starter templates library and import modal per `18-starter-template.md`
- Implement canvas autosave and load per `21-canvas-autosave.md`
  - Use `@vercel/blob` for storage
  - Add API routes for save/load
  - Add autosave hook with debounce
  - Show save status in editor
  - Use Prisma for blob URL metadata
- Install and initialize trigger.dev for background jobs and workflow automation
- Implement design agent API per `22-design-agent-api.md`
  - Add `TaskRun` Prisma model source for Trigger run ownership tracking
  - Add `POST /api/ai/design` to validate owner requests and trigger the design task
  - Add `POST /api/ai/design/token` to issue run-scoped Trigger.dev public tokens
  - Add minimal `trigger/design-agent.ts` task without AI or canvas mutation logic
  - Verify `npm run build` passes
- Implement design agent logic per `23-design-agent-logic.md`
  - Use OpenRouter through the AI SDK to produce structured canvas actions
  - Apply add/move/resize/update/delete node and edge actions through Liveblocks React Flow `mutateFlow`
  - Publish AI progress messages to the room-scoped `ai-status-feed`
  - Set ephemeral `Ghost AI` Liveblocks presence while generation runs
  - Handle task errors by publishing failure status and clearing AI presence
  - Verify `npm run build` passes
- Fix design agent presence startup failure
  - Ensure the Liveblocks room exists before design generation starts
  - Make ephemeral AI presence best-effort so Liveblocks presence errors do not abort canvas generation
  - Log Liveblocks status/details for easier diagnosis
  - Verify `npm run build` passes
- Fix OpenRouter token budget failure
  - Cap design plan generation with `maxOutputTokens` to avoid provider defaulting to a 65k-token request
  - Add optional `DESIGN_AGENT_MAX_OUTPUT_TOKENS` override capped at 16000
  - Rethrow generation errors after publishing status so Trigger marks failed runs correctly
  - Verify `npm run build` passes
- Fix Gemini structured schema failure
  - Replace provider-enforced JSON schema generation with plain text JSON generation
  - Parse and validate the design action plan locally before mutating Liveblocks storage
  - Keep the same node/edge action safety checks and normalization
  - Verify `npm run build` passes
- Implement AI presence state UI per `24-ai-presence-state.md`
  - Lift the Liveblocks room provider to the editor layout so the canvas and AI sidebar share room context
  - Subscribe the AI sidebar to `ai-status-feed` and validate status payloads before display
  - Show the latest active AI status and disable only sidebar prompt controls while AI is working
  - Add thinking spinners to live cursor badges from `presence.thinking` / `presence.isThinking`
  - Verify `npm run build` passes
- Implement sidebar chat feed per `25-sidebar-chat-feed.md`
  - Add real-time room chat to the AI sidebar using a separate Liveblocks `ai-chat-feed`
  - Define `AiChatFeedMessage` type and validation logic in `types/tasks.ts`
  - Update `AiSidebar` to handle both room-scoped chat and local stub chat
  - Show sender names and avatars for room messages
  - Ensure chat feed remains separate from status feed
  - Verify `npm run build` passes
- Implement design agent frontend per `26-design-agent-frontend.md`
  - Wire up AI sidebar to trigger the design agent via `POST /api/ai/design`
  - Implement real-time run tracking using `@trigger.dev/react-hooks`
  - Disable input and show loading state during active runs
  - Add compact status strip with pulsing indicator above input
  - Reflect AI-driven canvas updates through Liveblocks automatically
  - Verify `npm run build` passes

## In Progress 

- 

## Next Up

- Implement spec generation flow per `27-spec-generation-flow.md`

## Open Questions

- [Any unresolved product or technical decisions]

## Architecture Decisions

- `TaskRun` tracks Trigger.dev run IDs by `projectId` and `userId` so public run
  tokens can be issued only to the user who started the design run.
- The design agent mutates the existing Liveblocks React Flow storage with
  `mutateFlow` instead of introducing separate canvas state.
- AI progress uses a room-scoped Liveblocks feed named `ai-status-feed`; the
  task also broadcasts matching room events for realtime listeners.
- Active room UI shares one Liveblocks provider at the editor layout level so
  sidebar status/presence and canvas state observe the same room context.

## Session Notes

- `POST /api/ai/design` currently requires the authenticated project owner and
  treats `roomId` as the project ID, matching the existing Liveblocks room model.
- During build verification, the canvas API route params were updated to the
  Next.js 16 async route context signature and the stale `trigger.dev.config.ts`
  file was removed in favor of the active `trigger.config.ts`.
- The design agent defaults to `OPENROUTER_MODEL` when set, otherwise
  `google/gemini-2.5-flash` through OpenRouter.
- Liveblocks `setPresence` can fail independently of storage mutation; the
  design task now treats AI presence as non-critical and continues generation.
- OpenRouter generation is capped at 2048 output tokens by default to stay
  within low-credit account limits.
- Gemini/OpenRouter does not receive a complex JSON schema for design planning;
  the task requests JSON text and validates the action plan locally.
