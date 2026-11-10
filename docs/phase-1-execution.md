# Phase 1 execution ledger

Specification: [newplan.md](../newplan.md), sections 4–6, 10, 11 and 16.

## Scope ruling

The final instruction in newplan.md takes precedence over its SaaS infrastructure requirements. This edition stays browser-only. Authentication, server authorization, tenant isolation, external synchronization and reliable background jobs require a backend and remain unavailable for this personal project.

The current React/esbuild application, Twenty UI components, schema-driven records and local persistence are retained. A framework or database replacement would interrupt existing functionality without fulfilling the browser-only constraint.

## Architecture and data plan

- The shared schema defines collection fields, default columns, grouping, relationships and available views.
- The store normalizes earlier workspace snapshots and commits a cloned workspace in a single storage write. The same path runs workflows and records audit entries.
- Lead conversion is a pure domain operation. It validates all choices before mutating the cloned workspace. Contacts and companies can be reused, an opportunity is optional, and the original lead remains with its conversion references.
- Existing snapshots gain an empty leads collection. Existing business records are retained. Leads are included in backups, search, table/board views and custom relationships through shared schema registration.
- This milestone has no database migrations or API routes. The schema above describes the browser data migration. Future server tables need workspace IDs, foreign keys, a unique conversion per lead and transactional conversion.

## Routes

Existing routes remain. `#leads` opens the lead collection. Lead detail drawers expose qualification fields, linked follow-ups, conversion and conversion results. Overview links to leads and reports conversion metrics.

## Security boundaries

Browser storage belongs to the current browser origin and provides no authenticated user or tenant isolation. Local members are assignment labels. Conversion validates IDs and relation choices again at commit time. Conversion changes are atomic with persistence. A failed storage write leaves the current workspace unchanged.

## First milestone

- [x] Register lead fields, defaults, status colours and relationships.
- [x] Implement idempotent conversion with duplicate detection and explicit reuse choices.
- [x] Integrate lead detail, linked tasks/notes, command menu, workflows and overview metrics.
- [x] Add backend requirement text in Settings and identify newly seeded data as demo data.
- [x] Verify domain behavior, browser creation/editing/conversion, persistence and existing regression tests.

## Test plan

Unit checks cover new and reused records, ambiguous matches, invalid references, repeat conversion, conversion histories and failure atomicity. Browser checks cover lead creation/editing, conversion with a deal, related records, repeat prevention, refresh, old snapshot import, search and narrow layouts. Existing e2e tests remain the regression gate. External AI calls are excluded from the local milestone.

## Verification — 2026-11-03

- `npm run build`: passed.
- `npm run test:leads`: five domain tests and the dedicated browser scenario passed. The scenario verifies editing, task/note links, failed storage writes, conversion, reuse, reload, duplication, collection search, overview metrics, board layout and loading a legacy snapshot without leads.
- `npm run test:e2e`: the full existing suite passed with no page or console errors. Live external AI was skipped because no API key was provided.
- Inspected desktop conversion and 390px mobile board screenshots. Existing menu scrolling could close a dropdown immediately after opening; the Select component now repositions its menu on scroll.
- Tests use isolated browser contexts and do not change the user's existing workspace.

This completes the first local milestone, not the whole Phase 1 or the complete specification.

## Second milestone — pipelines foundation and Search repair

- [x] Prevent sidebar Search from shrinking below 32px. Reproduced the prior 18px height at a 600px window height.
- [x] Extend global search to field values (including email) and custom objects, with safe handling of missing names.
- [x] Add Settings → Pipelines: create, rename, choose the default and delete unused pipelines. Prevent deletion when live or trashed opportunities reference the pipeline.
- [x] Assign existing opportunities to Sales without changing their stages; support assignment, filtering and grouping through the Pipeline relationship field.
- [x] Store timestamped stage and pipeline transitions on each opportunity, show them in Timeline, and update stage probability consistently for edits and board moves. History survives unrelated edits, reload and Trash restoration. Earlier history is not fabricated.
- [x] Verify build, three pipeline domain tests, dedicated Search/pipeline browser checks, lead tests and the existing full browser suite. No page or console errors in the regression suite. External AI tests remain skipped.

Pipelines currently share the existing sales stages. This is the foundation of MOD-05, not completion of its advanced stage configuration and forecasting requirements. `npm run test:pipelines` repeats the new checks with the local server running.

## Third milestone — raw lead outreach and pipeline stage settings

- [x] Neutral white icons and translucent white icon backgrounds in dark-mode overview stats; matching neutral treatment in light mode.
- [x] Replace the half-width lead card with a responsive full-width outreach strip, including an interested count.
- [x] New leads default to Not contacted. Add Replied, Interested, Not interested and Follow-up alongside Contacted. Retain New, Qualified and Unqualified for existing records, filters and workflows. Not interested leads are excluded from the active count.
- [x] Leads are the raw outreach list. Importing does not create People or Companies; conversion remains an explicit action for relationships worth tracking.
- [x] Direct Import / export entry point with CSV template, import preview, visible-view export and all-leads export. Status matching is case-insensitive. Missing import status defaults to Not contacted; restoring conversion references requires a JSON backup.
- [x] Pipeline-specific ordering of the standard stages and default stage probabilities. Single-pipeline boards use the configured order. New deals and future moves use its probability defaults; current manual forecasts remain unchanged. Won stays 100%, Lost stays 0%.
- [x] Build, lead suite, pipeline suite (four domain tests), outreach browser suite and existing e2e suite pass. Desktop/mobile dark overview inspected. External AI tests skipped.

`npm run test:outreach` covers CSV, statuses, overview appearance, stage settings and refresh persistence. The other test commands remain regression checks.

## Fourth milestone — Settings reliability and pipeline forecasts

- [x] Remove the overview outreach strip entirely. Keep a New lead action in the heading; outreach remains in Leads.
- [x] Simplify Settings into a bounded content column with section dividers, consistent spacing and responsive navigation. Remove the redundant workspace-count card from the Workspace tab.
- [x] Save workspace name and row density together, immediately rerender the applied density, and display the saved name in the sidebar. Theme failures no longer display an unsaved appearance as though it persisted.
- [x] Restore and reset write successfully before replacing in-memory data. A storage failure leaves the existing workspace intact and explains the failure. Data record counts now include leads and custom objects. Field renames reject duplicate or blank labels.
- [x] Add a sales-pipeline selector to Overview. Pipeline value, weighted forecast, won revenue, win rate, stage totals, risk list and recent deals respect the selection. Stage and all-pipeline drilldowns preserve the selected pipeline. Workspace tasks and follow-ups remain explicitly unfiltered.
- [x] Build, existing e2e suite, lead suite, outreach suite, pipeline suite and `npm run test:settings` pass. Settings checks include name/density/theme reload, storage-failure rollback, successful backup restore, calculated forecast totals, empty-pipeline drilldown and mobile width. No page or console errors in the main regression suite. Live external AI remains untested without a key.

## Fifth milestone — Liner and task checklists

- [x] Replace the model-labelled chat with Liner: welcome screen, suggested prompts, persistent conversation, stop control, visible connection state and expandable existing workspace tools.
- [x] Add tool-based access to all standard/custom record collections with paging, schema catalog, relationships, workspace settings, reports, workflow definitions/runs, activity, Trash, favorites and attachment metadata. Connection credentials and attachment bytes are excluded.
- [x] Add validated create/update proposals with readable before/after previews. Applying uses the normal atomic store, workflows and audit trail. Repeated application, stale edits, missing references, invalid dates/types/values and direct conversion bypasses are rejected.
- [x] Add tab-session connection setup in Settings → Integrations → Liner. Keys stay outside local workspace backups. Do not claim chat is connected when no configuration exists.
- [x] Add editable task checklists with completion counts, persistent item state and removal. Parent task status remains independent.
- [x] Build, four Liner domain tests, mocked-service browser flow and the existing regression suites pass. Tested read/proposal/apply flow, failed-save rollback, reload, key isolation, checklist edits and mobile. Live AI was not tested because no live key was supplied.

Liner can propose record edits, not deletions, configuration changes, external communication or background operations. Model identity stays out of the product UI. Task checklists and expanded task statuses are implemented; see the activity-management milestone below.

## Sixth milestone — Liner responsiveness and page navigation

- [x] Handle exact record-count questions and greetings locally before checking the AI connection. Counts read current data; ambiguous/filtered questions are not guessed. The reported lead-count question now makes zero API calls.
- [x] Reduce initial AI context to collection counts and workspace metadata; detailed field definitions remain available through the catalog tool.
- [x] Separate the composer text area from its footer and use a stable icon/text Send control. Remove inherited legacy message styles. Clearing chat clears old errors; failed requests retain the message for retry and distinguish Stop from timeout.
- [x] Move Overview under Workspace and replace sidebar Favorites/Views groups with persistent page pins, including Settings and custom collections. Pinned entries show 📌. Existing record bookmarks and saved views are retained in data; saved views still work within collections.
- [x] Build, five Liner domain checks, mocked AI browser checks and navigation/chat checks pass. The local-count UI test requires a response within two seconds and verifies zero network requests. Composer geometry checked on desktop/mobile; pin/unpin tested across reload.

External AI service latency is not controlled by this change; complex questions still depend on that connection.

## Seventh milestone — duplicate review and relationship lifecycle

- [x] Add Settings → Data quality. People match by normalized email; companies match by domain, or exact normalized name if both lack a domain. Matches are suggestions, never automatic merges.
- [x] Choose the record to keep and review every differing editable field. Keep its value, use the duplicate value, or combine text notes. Empty retained fields default to the duplicate's value; false/zero remain meaningful values.
- [x] Merge through the atomic store. Redirect standard and custom relationships, attachment references, lead conversion links, bookmarks and historical activity to the retained record. Add a merge-history entry. Preserve the original duplicate in Trash.
- [x] Explain that restoring a merged duplicate restores a separate record, not an undo of transferred links or selected field changes. Reject stale previews and repeat merges.
- [x] Add editable Company Relationship status: Prospect, Active customer, Partner, Former customer and Supplier. Available to columns, filters, CSV and Liner through the shared schema.
- [x] Build, four merge domain checks and browser review/merge/rollback/reload/restore checks pass. Settings and Liner regression suites pass. Desktop merge review and mobile Data quality layout inspected.

Run `npm run test:duplicates` for the merge and lifecycle checks. This completes the next local data-quality milestone, not all remaining Phase 1 work.

## Major update — activity management

- [x] Add a pinnable Activity page with Today, Overdue, Upcoming, Unscheduled, All open and Closed views; search, owner/status filters, linked-record context, completion actions and checklist progress.
- [x] Add selected-task bulk rescheduling and status updates through the existing atomic store. Hidden selections are not changed.
- [x] Extend tasks with Waiting, Blocked and Cancelled while preserving existing Open, In progress and Done data. Cancelled tasks are excluded from open-task totals in Overview, dashboards and assistant summaries.
- [x] Add Daily, Weekly and Monthly repeats, optional end dates, completion timestamps, previous/next occurrence navigation and Stop repeating. Completion creates exactly one linked follow-up and resets its checklist. Reopening and completing an earlier occurrence does not duplicate its successor.
- [x] Keep monthly schedules anchored to their original day across short months/leap years. Explicit rescheduling changes the anchor. Repeats advance from scheduled due dates, so missed dates remain overdue rather than spawning background catch-up records.
- [x] Stop repeating disables the whole existing series, including its archived tasks. Existing future occurrences are kept. Imported/restored completed tasks do not silently create follow-ups.
- [x] Add completion/checklist fields to the shared schema and expose recurrence to typed editors, table options, CSV and Liner. Duplicated tasks start Open with reset checklist items.
- [x] Fix calendar exports to use record names for event summaries.
- [x] Build, four activity domain tests, Activity browser tests, full existing e2e walkthrough and Settings/Liner/lead/duplicate regressions pass. Verified failure rollback, repeat links, bulk actions, persistence, month boundaries, stop-series behavior, cancellation and calendar names. Inspected desktop/mobile Activity layouts.

Use `npm run test:activity` for focused verification. This remains browser-only: follow-ups are created when completing tasks, not by unattended jobs. Live external AI was skipped without a key.

## Phase 1 backlog after these milestones

- Custom stage names, additions/removals and migration rules for existing deals. Stage ordering, default probabilities and pipeline-specific overview forecasts are implemented.
- Additional data-quality checks and richer lifecycle reporting. Duplicate management and company relationship status are implemented.
- Task reminders and broader activity reporting. Expanded statuses, task checklists, recurring follow-ups and the Activity planner are implemented; unattended delivery requires a backend.
- Expanded local activity types and reporting.
- Broader input validation and storage failure/recovery tests.
- Authentication, roles, invitations, database and background delivery remain backend-required.


## Navigation and Liner correction
- Removed the redundant Activity page. Existing Activity URLs open Tasks; task recurrence and schedule fields remain in Tasks.
- Grouped navigation into Workspace, Sales, Productivity, Insights & automation, and Custom objects when present. Pins use SVG icons.
- Liner's suggested workspace checks run directly against current records without network requests. General AI chat and edit proposals still require a working external connection.
- Added connection testing, distinct authentication/service errors, truthful connection labeling, and a compact icon send control.
- Do not introduce separate pages for functionality already covered by existing CRM sections.


## Confirmation and navigation polish
- Replaced all native confirmation/error dialogs with shared styled modal popups; destructive actions wait for confirmation, Escape/Cancel leaves data untouched.
- Removed the Liner tools/insights panel. Local answers use a cancellable 3.5-second thinking state.
- Sidebar rows use full width. Right-click or Shift+F10 opens a pin/unpin menu; Liner is grouped with Overview under Workspace.
- Browser checks cover confirmation/cancellation, local reply timing and stopping, pin persistence and keyboard access.


## Sales performance and sidebar update
- Desktop sidebar collapse now persists in browser storage; mobile keeps its separate overlay navigation.
- Leads use a prospect-search icon; Opportunities use a briefcase.
- Extended the existing Dashboards with sales lifecycle reporting: pipeline/owner/date filters, recorded monthly outcomes, owner results, average sales-cycle duration, stage aging, record drilldowns and CSV export.
- Missing historical dates are disclosed and excluded from time-based reporting; planned close dates are never presented as actual closes. Reopened deals count only in their current final outcome.
- Focused verification: npm run test:performance.


## Dashboard presentation refinement
- Sales performance and Custom widgets now occupy separate tabs.
- Dashboard filters and widget-editor dropdowns use the existing styled Select component.
- Added generous section spacing, contained breakdown tables and collapsible metric explanations.
- Added an isolated, labeled demo preview with dated outcomes and stage aging; no CRM records are inserted or changed. Empty historical reports start in preview, with Use my data available.
- Build, performance tests and dashboard-polish browser checks pass, including custom menus, widget creation, demo isolation and mobile width.


## Visual workflow editor
- Added a visual-only node canvas in Workflows with a sample lead journey, draggable palette/nodes, curved connections and branch labels.
- Step inspector supports names, descriptions, record type, duplication and removal. Zoom controls, keyboard node movement and local draft persistence are available.
- Local executable rules remain in their own tab. Visual drafts never execute actions or modify CRM records.
- Verified build and browser interactions, persistence, rules isolation and mobile layout with scripts/workflow-canvas.e2e.mjs.


## Eighth milestone — specification audit and delivery modules

- Audited all 19 modules and 7 differentiators in [newplan.md](../newplan.md) against the running app. The honest per-module table now sits at the top of that document; roadmap claims that had drifted (Activity removed, Liner tools panel removed, visual workflow editor added, tabbed dashboards) are recorded as the current state instead of remaining work.
- Added three first-class local record types, each distinct from an existing surface: **Projects** (MOD-14 delivery), **Campaigns** (MOD-11, with lead and contact attribution) and **Support tickets** (MOD-12). They are declared in `local/schema.js` through `DELIVERY_OBJECTS`, merged into `OBJECTS`, and therefore inherit tables, boards, calendars, filters, sorts, grouping, bulk edit, CSV, trash/restore, workflows, dashboard sources and the assistant catalogue without special cases.
- Projects link company, contact and opportunity, and tasks gained a Project relation, so delivery work shows up under Related records and in the timeline. Campaigns are selectable from leads and people for attribution. Tickets use the shared status, priority and category colours and support the drawer's linked task/note actions.
- Seeded demo records and saved views (Active projects, All campaigns, Open tickets; pinned where useful). New records default to Planning, Planned and Open respectively.
- No duplicate destinations were introduced: no second calendar, inbox, "My Tasks", analytics or admin page. Work extends the existing collection, task, dashboard and settings surfaces.
- Fixed accessibility names on the dashboard widget dropdowns (Records, Group by, Measure, Visualization, Width) instead of exposing internal keys such as "group".
- Repaired stale browser checks that assumed pre-2026-11 UI: Workflows opens on the visual editor (check now selects Local rules), Dashboards opens on Sales performance (check now selects Custom widgets), the Liner tools panel no longer exists (check now asserts a grounded local count answer), the custom-object example no longer collides with the built-in Projects naming, and destructive deletes confirm through the styled dialog.
- Verification: `npm run build` passed. `npm run test:e2e` passed all 29 steps with `PAGE ERRORS: none` and `CONSOLE ERRORS: none`, including the new create → reload persistence check for projects and the campaign and ticket views. Live Experiential AI was skipped because `EXPLABS_API_KEY` is not set in this shell; the deterministic and local-answer paths ran.
- Remaining Phase 4 work is listed with its blocker in the newplan status table: products/quotes/invoices, project milestones and time tracking, campaign sending, ticket intake and SLA, multi-select and formula fields, and industry templates.


## Thirteenth milestone — Workflow Studio

- Replaced the dual surface (non-executing visual draft + separate local-rules form) with one model: **Workflows is a list; New workflow opens a Studio canvas that actually executes**. The decorative canvas was deleted.
- New graph model: a fixed trigger node plus condition / action / wait nodes and labelled edges. Conditions have Yes/No outputs; every other node has one. Nodes are draggable, connections are made by clicking an output circle then a target, and the inspector edits the selected node.
- Graph engine (`runGraph`): walks from the trigger, routes conditions, performs actions, and stops at a wait, queueing the remaining node id with an absolute resume time. This fixes the old semantics where a waited step delayed only itself while later steps ran immediately.
- Legacy linear rules (conditions + ordered actions with per-action wait/branch) are migrated on load into equivalent graphs: gate becomes a condition node, waits become wait nodes before their action, `otherwise` becomes an inverted condition. Existing runs and queued entries remain readable.
- Studio UX: widget palette with drag/drop or click-to-place (free-spot placement), pan-free scrollable canvas with zoom, selection ring, connection list in the inspector, inline validation (name, trigger, condition values, task title, field, owner, 40-node cap), Active toggle, Save/Cancel, Duplicate from the list, and a generated path preview on each list row.
- Runs and queue panels stay on the list, now showing the next node for queued runs. Wait nodes with no outgoing edge no longer restart the flow on resume.
- Verification: `npm run build`; `npm run test:workflows` 15/15 (including graph wait-pauses-flow, Yes/No routing, legacy migration); `npm run test:e2e` passed every step with `PAGE ERRORS: none` and `CONSOLE ERRORS: none`, adding a Studio scenario that builds a flow, connects it, saves, fires it from a stage change, finds the created task, and deletes the workflow. Light and dark canvases inspected at 2x.


## Twelfth milestone — navigation, overview and settings spacing

- Navigation no longer creates Growth, Delivery or Support headers for packs. Campaigns and Products join **Sales**; Projects, Support tickets and Emails join **Productivity**. Group headers are derived from the pages that actually render, so a header disappears when its only pages are disabled instead of leaving an empty label.
- Removed the **New lead** shortcut from Overview. Leads remains the single outreach entry point, matching the earlier decision to drop duplicate destinations.
- The Overview **Sales metrics** selector was confusing with a single pipeline: choosing Sales looked like a no-op because every demo opportunity belongs to Sales. The selector now only renders when the workspace has more than one pipeline; otherwise the row shows the open value for that pipeline, and either way it states how many opportunities are in scope versus the workspace. Pipeline filtering itself was already correct and remains covered by the forecast test.
- Feature pack rows gained breathing room: 14×16 padding, a 10px gap and a 16px offset from the description, plus hover/focus borders. Long descriptions no longer sit against the first card and the status tag stays inside the row.
- Repaired `npm run test:settings`: it still expected native browser dialogs, but restore now uses the styled confirm and error dialogs, so the upload sat on an unclicked Confirm. The test now drives the real dialog, asserts the quota-failure notice text from it, and re-runs restore successfully.
- Verification: `npm run build` passed; `npm run test:e2e` passed every step with `PAGE ERRORS: none` and `CONSOLE ERRORS: none`; `npm run test:settings` and `npm run test:commerce` (7/7) passed. Screenshots confirmed no empty sidebar headers and the new Settings spacing.


## Eleventh milestone — products, quotes and calendar agenda

- Added a fifth opt-in pack, **Products & quotes** (`key: products`, off by default). It adds a `products` collection — SKU, category, unit price, unit cost, billing, availability, owner — with six seeded catalogue items and a saved view, all through the existing metadata layer so tables, filters, CSV, dashboards, search and trash work unchanged.
- Opportunities gain a **Quote** section while the pack is on: add a catalogue product or a custom line, edit description, quantity, unit price and per-line discount, remove lines, and see subtotal, discount, total and margin recalculated live. **Use total as amount** syncs the opportunity amount so weighted pipeline follows the quote. Line items live on the deal record (`deal.lineItems`), are validated and normalized on load, and are included in backups.
- Quote maths sits in `local/commerce.mjs` (rounding to cents, clamping discounts, validation) rather than the component, and is covered by `scripts/commerce.test.mjs`.
- `featureEnabled` gating is reused as-is: with the pack off, the Products page, create/search entries, dashboard source and the Quote section are all absent, and the seeded catalogue is simply hidden rather than deleted.
- Calendar quality of life: the existing month grid now has an **Agenda** toggle that groups dated records by day, marks overdue days, keeps unscheduled records, and exports the same `.ics` feed. No second calendar page was introduced.
- Visual defect caught from the first quote screenshot: the seven-column line grid had a 720px minimum width, clipping the amount and remove button inside the drawer, and native number spinners looked wrong. The grid now fits the drawer at all widths and spinners are hidden.
- Verification: `npm run build` passed; `npm run test:commerce` 7/7; `npm run test:workflows` 12/12; `npm run test:e2e` passed every step, including enabling the new pack, adding a product line, changing quantity, syncing the amount, reloading and reopening the quote, plus the Agenda toggle — `PAGE ERRORS: none`, `CONSOLE ERRORS: none`.


## Tenth milestone — optional feature packs

- Campaigns, Projects, Support tickets and Emails are now opt-in packs instead of always-on navigation. Each is disabled by default (`db.ui.features`) and toggled from **Settings → Feature packs**, which shows the stored record count and states that disabling keeps data.
- Enabling and disabling is applied consistently through one helper (`enabledCollections`): sidebar groups and pins, hash routes, command-menu create/search, dashboard report sources, record-page related lists, and relation columns in tables/filters/CSV. The Liner catalogue also stops advertising a disabled pack.
- Hiding is reversible and non-destructive: records, saved views, workflows, dashboards and links survive, and a disabled route falls back to Overview on reload. Disabling Campaigns also removes the Campaign column from leads/people; disabling Projects removes the Project column from tasks.
- Fixed a layout defect found in the first browser screenshot: the status tag was being stretched into a full-width bar by the row's flex rule; the copy and status now have separate wrappers.
- Verification: `npm run build` passed, `npm run test:workflows` passed 12/12, and `npm run test:e2e` passed every step — including a new first-run check that the four packs are absent from navigation, then enabling all four and seeing them appear — with `PAGE ERRORS: none` and `CONSOLE ERRORS: none`.


## Ninth milestone — conditional, branching and delayed workflows

- Extracted the rules engine into `local/workflow-engine.mjs`: trigger matching, an all/any condition gate, ordered action steps, per-step `if` / `otherwise` branches, and a persisted wait queue.
- Action types: **create task** (linked back to the triggering record, due-date offset), **update field** (validated per type, refreshes opportunity probability for stage changes) and **assign owner** (validated against workspace members). Invalid steps log a failed run instead of corrupting a record.
- Steps with a wait are queued in `state.scheduled` with a run timestamp. The queue flushes on app load and after saves, executes each entry once, and drops entries whose workflow, record or enablement no longer exists. Pausing or deleting a workflow cancels its queued steps. Every queued step also has **Run now** for deterministic use and testing.
- Rebuilt the Local rules builder: trigger controls, a condition builder with typed values and match all/any, repeatable step cards with action fields, wait days, branch selection and branch conditions. The workflow card shows conditions, steps, branch/wait markers and queued counts; a Queued steps panel lists pending work.
- Fixed a reload defect found during verification: the legacy workflow normalizer rebuilt a single action and discarded `actions`/`conditions`. The normalizer now preserves the new shape, so edited steps survive refresh with their titles, delays and branches intact.
- Changed `package.json` to `"type": "module"` so Node can import the ESM schema directly in the domain test; the esbuild bundle, Playwright scripts and browser app are unaffected.
- Kept the visual node canvas as a design draft — it still executes nothing, and the ledger wording now matches that.
- Verification: `npm run test:workflows` passed 12 domain checks (gate blocking, all/any logic, if/otherwise routing, queue timing and single execution, run-now, cancellation on delete, field and owner validation, probability refresh, legacy migration, task linking). `npm run build` passed. `npm run test:e2e` passed all 29 steps with `PAGE ERRORS: none` and `CONSOLE ERRORS: none`. A scripted Playwright run created a gated branching rule through the UI, confirmed the `otherwise` task fired for a $28k deal while the `if` task did not, queued a 2-day step and executed it with Run now, and inspected the builder in dark mode. Temporary screenshots were removed.
- Not implemented: conditions across related records, webhook or external actions, retries with backoff, and unattended execution. Queued steps run when the app is open; a background worker is backend-only.

## Fourteenth milestone — billing pack, workflow run controls and the week calendar

- Added **Invoices** as the sixth optional feature pack, off by default like the others. `local/schema.js` declares the record with status (Draft, Sent, Paid, Overdue, Void), amount, issued/due/paid dates, company/contact/opportunity links and notes; the shared schema gives it tables, boards, calendars, filters, CSV, dashboards, trash, workflows and Liner without a special case.
- With both commerce packs enabled, the opportunity **Quote** section gained **Create invoice**. It opens a prefilled draft with the quote total, customer, opportunity and line summary, so the record is reviewed and saved through the normal form. Marking it paid stays manual; payment processing and tax rules are still backend/out of scope.
- Run grouping: every execution writes a shared `runId` onto its run entries, and Recent runs collapses them into one row with expandable steps and a failed marker.
- Manual **Run** on a chosen record with a **dry run**: the preview executes the graph against a deep copy and lists the steps and queued waits without writing; a real run applies through the normal atomic save.
- Three new actions (**create note**, **log activity**, **email draft**) and a **Stop** node. The email draft is stored in the Emails log and is explicitly never sent. Notes and drafts link back to the triggering record.
- Pausing a workflow now suspends its queued runs (held until resume) instead of dropping them; deleting still cancels. Studio validation covers the new steps.
- Calendar gained a **Week** view beside Month and Agenda, with per-day add buttons and the same record counts.
- Added workflow **Templates**: speed to lead (created lead → call → wait → priority branch), proposal follow-up (Proposal stage → note → wait → task → amount branch → draft/task) and renewal reminder (renewal date changed → wait 30 days → task → note). Each builds real nodes and edges through the same normalizer, opens in the Studio for editing, and is covered by the engine checks.
- Verification: `npm run build`; `npm run test:workflows` 23/23 (new: note/activity/email/stop actions, pause suspension, dry run, manual run, run ids); `npm run test:commerce` 7/7; `npm run test:e2e` and `npm run test:settings` run against the rebuilt bundle.

## Fifteenth milestone — email campaigns and sending accounts

- **Campaigns** became an email campaign builder instead of a budget-only record. A campaign now holds a sender account, a segment (`Send to` Leads or People filtered by status, source, priority and owner), a subject and body with `{{first_name}}`, `{{company}}` and `{{role}}` merge tags, an optional attachment stored in the browser, a start date and up to three follow-ups with their own wait days and content. The builder previews the live recipient list and the count still to send.
- `local/campaigns.mjs` owns audience resolution, merge rendering, follow-up normalisation and `planCampaignSend`. Sending is simulated: **Start campaign** snapshots the audience, **Send next batch** writes linked email log records within the sender's remaining allowance (25 per batch), updates the campaign counters and advances the sender's daily usage. Follow-ups can be logged after the first send, and Pause/Resume/Complete drive status. No message leaves the browser.
- Added the seventh optional pack, **Email accounts**, and a dedicated page (not a generic table) for SMTP senders. `local/mailbox-health.mjs` models daily allowance, a 14-day warm-up ramp (5 sends rising to the daily limit), verification, bounce-rate penalties, health score/label and reasons. The page supports Gmail/Google Workspace/Outlook/custom presets, app-password storage in localStorage, Verify (simulated), Advance day, warm-up on/off and pause/resume. Credentials are never transmitted.
- Emails gained optional `lead`/`campaign` relations and an `attachment` label so campaign sends appear on the lead timeline and in the campaign's history. `store.normalize` migrates older campaign records and mailboxes without losing data.
- Verification: `npm run build`; `npm run test:campaigns` 7/7 (warm-up allowance, health reasons, advance day, audience filters, merge tags, send planning, follow-up cap); `npm run test:e2e` all steps with no page or console errors; `npm run test:settings`; `npm run test:workflows` 25/25. A browser run connected a Gmail mailbox, verified it, advanced warm-up, started a planned campaign and sent a batch that appeared in the Emails log.
