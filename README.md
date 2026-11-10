# Linear CRM

A browser-local portfolio adaptation of [Twenty](https://github.com/twentyhq/twenty) with an Attio-inspired visual pass: calmer surfaces, cleaner table rows, stage dots, icon-led record fields and softer board cards. Open `index.html` or serve this directory with `python -m http.server 4817 --bind 127.0.0.1`. The landing page is at http://127.0.0.1:4817/ and the CRM workspace is at http://127.0.0.1:4817/app.html.

## Pages

The navbar links to five separate static pages, each served from its own HTML file:

- `/platform.html` — pipeline, workflows, forecast, Liner and account context.
- `/product.html` — the interactive workspace, data model, record moves and saved views.
- `/resources.html` — setup, browser storage, backup/restore, keyboard shortcuts and FAQ.
- `/customers.html` — sample use cases, explicitly not customer logos or testimonials.
- `/pricing.html` — the $0 plan plus the limits of a local-only project.

The header, announcement, footer and `public/landing.js` bundle are shared. The page is selected with `<body data-page="...">`; `index.html` is the home page.

## No backend

Linear CRM is a personal project, not a hosted service. There is no database, authentication service, billing system, sync worker or server-side API. The CRM is static HTML, CSS and JavaScript; workspace records are stored in the browser's `localStorage`, and the JSON backup is the portable copy. Clearing site data deletes the workspace unless it has been exported first. Liner uses local summaries by default and calls an optional external AI service only when a connection is configured.

That trade-off is deliberate: there are no accounts, permissions, shared real-time workspaces, email delivery, payment processing, uptime guarantees or support desk. The Resources and Pricing pages state those limits directly instead of implying a hosted product exists.

The landing page uses the same record model, type scale and surface language as the CRM. Its hero workspace, pipeline focus, data model, workflow, Liner, record-move and activity previews are interactive local components rather than screenshots.

Companies, people, opportunities, tasks and notes share linked records. Opportunities have table and board views. Search covers all five record types. Settings and Account export and restore the current workspace as JSON. The original `linear-crm.v1` workspace is preserved; additional workspaces use their own local keys registered under `linear-crm.workspaces.v1`.

## Daily workflows

**Tasks** is the single place for task management, scheduling and recurring follow-ups. Waiting and Blocked remain open work; Done and Cancelled are closed. The former Activity page has been removed to avoid duplicate navigation.

For recurring work, set a task's **Repeat** to Daily, Weekly or Monthly and optionally set **Repeat until**. Marking it Done creates one next occurrence with the same CRM links and a fresh checklist. Monthly repeats retain their day-of-month anchor. Reopening a completed occurrence will not create duplicates. **Stop repeating** disables the series while keeping existing occurrences. Repeats advance from due dates; an overdue next occurrence stays overdue. No backend scheduler or notifications are used.

Task drawers show completion time and previous/next occurrence links. Completion time and checklist progress are available as table columns. Calendar exports now contain the actual task/opportunity names. Run `npm run test:activity` for the activity-management checks.

**Settings → Data quality** finds possible duplicate People by email and Companies by domain (or name when both have no domain). Select the record to keep, review differing fields and merge. Linked tasks, notes, opportunities, custom relationships, files and converted leads follow the retained record. The original duplicate remains in Trash; restoring it creates a separate record and does not undo the merge. Stale reviews are rejected before saving.

Companies now have a **Relationship status** field for Prospect, Active customer, Partner, Former customer or Supplier. It is editable in the record drawer and available in table options, filters and CSV. Run `npm run test:duplicates` to verify merges and status editing.

Overview's **Sales metrics** selector scopes pipeline totals, weighted forecasts, won revenue, stage breakdown and recent opportunities to a pipeline. Stage links preserve that filter. Tasks and follow-ups remain workspace-wide. Outreach is managed in Leads; the standalone overview outreach strip has been removed.

In **Settings → Workspace**, save the workspace name and row density together. The account row at the bottom of the sidebar reflects the saved name. Appearance saves automatically. Backup restore and demo reset preserve the current workspace if storage fails. Run `npm run test:settings` for these checks and pipeline forecast verification.

**Account and workspaces** live behind the avatar row at the bottom of the sidebar. The menu switches workspaces and links to **Account** or workspace settings; the gear and theme controls stay beside it. **Account** edits the local display profile, creates blank or sample-data workspaces, and renames, duplicates, switches or deletes them. Each workspace is an independent local snapshot, so switching reloads the app into that workspace. The same page shows storage, backup, reset and Liner connection controls for the current workspace.

**Leads** is your raw outreach list. Start with **Not contacted**, then track **Contacted**, **Replied**, **Interested**, **Not interested** or **Follow-up**. Use **Convert lead** to bring worthwhile relationships into People and Companies. Older statuses remain supported for existing records and saved views.

Use **Leads → Import / export** for a CSV template, import preview, filtered-view export or all-leads export. Imports only add leads and default missing statuses to Not contacted. Use a JSON workspace backup when transferring converted records and their relationships.

Under **Settings → Pipelines → Stages**, reorder the standard stages and set their default probabilities. A board containing a single pipeline follows its configured order. New deals and future moves use those defaults; existing deal probabilities are retained. Custom stage names and additions remain planned.

**Settings → Pipelines** creates and renames pipelines and selects a default for new opportunities. Set an opportunity's **Pipeline** field, filter by it and save a board or table view. Pipelines currently share the standard sales stages. Stage and pipeline changes appear in the opportunity's **Timeline**, with actor and timestamp, and survive reloads. A pipeline containing opportunities (including Trash) cannot be deleted.

Sidebar **Search** and **Ctrl+K** (Cmd+K on Mac) search record fields, including email addresses and custom-object records. The Search control keeps its full height in shorter windows.

**Leads** provides qualification, source, owner, priority, budget, business needs, next follow-up and lead age, with table and board views. Create linked tasks and notes from a lead. **Convert lead** creates or reuses a person and company and optionally creates an opportunity. Matching uses email, company name or domain; ambiguous matches require an explicit selection. Conversion retains the original lead and links its follow-ups to the resulting records. Converted leads can still be edited.

To change a record's section without retaining a copy, select one or more rows and choose **Move to…**. Leads can move to People or Companies; People and Companies can move back to Leads. Links, files, favourites and history follow the record. Converted leads are excluded so their existing conversion links stay intact.

Projects, Campaigns, Support tickets, Products & quotes, Invoices, Email accounts and the Emails log are optional **feature packs**, off by default. Enable each one in **Settings → Feature packs**; it then appears in navigation, search, create menus, dashboard sources and relation columns. Turning a pack off only hides those surfaces — records, saved views, workflows and links are kept, and a disabled pack leaves your existing workspace unchanged. The packs share the same schema-driven tables, saved views, filters, CSV, dashboards, workflows and record drawers as the sales objects, so nothing about creating or editing them needs a backend. Campaign sending is simulated locally — emails are written to the log, never delivered. Real SMTP delivery, mailbox sync, inbound ticket intake and SLA timers remain backend-only.

The **Products & quotes** pack adds a catalogue with SKU, category, unit price, unit cost, billing and availability. With it on, opportunities get a **Quote** section: add catalogue products or custom lines, set quantity and per-line discount, and see subtotal, total, margin and margin percentage update live. **Use total as amount** writes the quote total to the opportunity amount so forecasts and weighted pipeline follow the quote. Line items are stored on the record, included in backups and survive reloads.

The **Invoices** pack adds a billing record with status, issue/due dates and paid date. With both packs on, **Create invoice** on a quote copies its total, customer and lines into a draft invoice, linked back to the opportunity. Marking an invoice paid is manual; payment processing, tax rules and PDF quotes are not built.

The **Campaigns** pack is now a real email campaign builder rather than a budget record. On a campaign, choose a **Sender** from your **Email accounts**, define an **Audience** (Leads or People, filtered by status, source, priority and owner, with live recipient preview), write a subject and body with `{{first_name}}`, `{{company}}` and `{{role}}` merge tags, attach a file, set a start date and add up to three **Follow-ups** with their own wait days, subject and body. **Start campaign** snapshots the audience; **Send next batch** logs up to the sender's remaining daily allowance (25 max per batch), links each email to the lead or person and the campaign, advances the progress bar and respects warm-up. **Pause**, **Resume** and **Complete** drive the status, and a follow-up can be logged once the first email went out. Everything is local and reversible through Trash.

The **Email accounts** pack adds an **Email accounts** page for SMTP senders. **Connect mailbox** pre-fills Gmail (`smtp.gmail.com`, port 587, TLS) or Google Workspace, Outlook and custom SMTP; store a from address, username, app password and daily limit. Each account has a **warm-up** schedule that ramps from 5 sends to the daily limit over 14 days, **Verify**, **Advance day**, pause/resume, and a health score with plain reasons (unverified credentials, warm-up day, overuse, bounce rate). Credentials stay in this browser and no connection is ever opened.

Enabled packs join the existing **Sales** and **Productivity** sidebar groups rather than adding new headers, and a group only renders when it has at least one visible page — so disabling a pack leaves no empty heading behind. **Overview** no longer offers a New lead shortcut (Leads remains the place for outreach), and its sales row shows pipeline scope; the pipeline selector only appears once the workspace has more than one pipeline, since with a single pipeline every figure would stay the same.

Calendars switch between the **Month** grid, a **Week** board and an **Agenda** list. Week shows one column per day with add-on-day buttons; Agenda groups dated records day by day, flags overdue days in red, keeps the unscheduled list and exports the same `.ics` feed.

**Workflows** opens as a list of your flows. **New workflow** opens a Studio canvas, and **Templates** starts a real graph from speed-to-lead, proposal follow-up or a renewal reminder — it lands in the same canvas, fully editable: drag in Condition, Create task, Update field, Assign owner or Wait widgets, then connect the circles — conditions have **Yes** and **No** outputs. The trigger is fixed and configured in the right-hand inspector. Flows execute exactly as drawn: conditions route down the matching branch, a Wait pauses the rest of the flow, and every action is validated before writing. Saved flows show their path, run count, queued runs and Active/Paused state in the list. **Run** executes a flow on a record you pick, with a **dry run** that lists the steps and queued waits without writing anything. Recent runs collapse into one row per execution with expandable steps. Besides tasks, field updates and owners, steps can create a note, log activity, save an email draft (never sent) or stop the flow.

Legacy rules are converted into the same graph on load, so older workflows keep working and open in the canvas. Waited flows resume when the app next loads or saves; **Run now** executes a queued run early. Pausing a workflow holds its queued runs until you resume it; deleting it cancels them. Run `npm run test:workflows` for 23 engine checks, including the wait-pauses-the-flow rule, Yes/No routing, the new actions, dry runs and pause suspension. Nothing executes while the browser is closed. Full semantics and the remaining roadmap are in [docs/workflows-design.md](docs/workflows-design.md). The audited status of every module in the specification now sits at the top of `newplan.md`.

Execution of `newplan.md` is tracked in [docs/phase-1-execution.md](docs/phase-1-execution.md). The first milestone implements local lead management and conversion. The rest of the specification remains a phased backlog; its final browser-only instruction governs backend-dependent features.

Open Overview to review pipeline value, drill into a stage, or complete a follow-up. From an opportunity, use **Add linked task** or **Add linked note** to keep the next step with its record.

In any collection, open **Filters**, choose a field value or search the visible columns, then select **Save view**. Named views remember the filters, sort and opportunity layout. Use the saved-views selector to reopen one. Backups include these views.

## Source

The record-table row, header cell, data cell, record card, navigation group, navigation icon and page container in `local/upstream` come from Twenty's `twenty-front` at [b0730255](https://github.com/twentyhq/twenty/tree/b0730255e8babd44eb348a9c722226a157dec46a/packages/twenty-front). The drawer item and page header retain upstream styled elements with local navigation handlers. These source adaptations use Emotion to evaluate the upstream styling. The theme, buttons, tags and avatars come from the published `twenty-ui` package. See `local/upstream/LICENSE` for upstream terms.

`local/Workspace.jsx` connects the views to the browser store and supplies the simplified record editor. This edition omits server-dependent features including authentication, server-side accounts, permissions, email sync and multi-user collaboration; account and workspace management are local only.

## Records and customization

**Companies → Options** controls column order and visibility, custom fields and CSV transfer. Select the checkboxes beside records for bulk updates and selected-row export. Click column headings to sort. **Filters → Add condition** combines field tests and can save them as a named view.

**Settings** creates custom objects and restores records from Trash. Record editors support favorites, duplication, file attachments and activity history. **Dashboards** builds charts from current records. **Workflows** creates tasks when opportunities enter a chosen stage. Tasks and Opportunities offer calendar views.

## Meet Liner, your AI Assistant

Simple totals such as “How many leads do I have?” are answered directly from current browser data without an AI request or connection key. More complex requests still use the AI service. Failed requests keep the message ready to retry; clearing chat removes old error messages too.

The sidebar groups pages under **Workspace**, including Overview. Right-click a page (or press Shift+F10) and choose **Pin** to add it to **Pinned**; right-click the pinned item to unpin it. Pins persist locally. Favorites and saved-view groups no longer appear in the sidebar; saved views remain available within their collection.

Open **Liner** for a persistent workspace chat. It can look up all standard and custom record collections, paginate results, and inspect views, workflows, dashboards, activity, pipeline settings and file metadata. Record text is treated as data, not instructions. Attachment contents and connection keys are not included in its tools.

Ask it to create or update a record. Liner shows a field-by-field proposal; **Apply change** validates it against current data and saves through the normal store, workflows and audit history. Conflicting edits require a fresh proposal. Chat history and proposal statuses are saved locally and included in workspace backups. Clearing chat does not undo applied changes. Destructive deletion, external messages and workspace-configuration edits are not chat actions.

Connect the existing AI service in **Settings → Integrations → Liner** using a session API key. The key is stored in this tab's session storage, separate from backups and chat context. Alternatively, use the existing build environment configuration. Workspace data needed to answer questions is sent to that service. Without a connection, local summaries and workspace tools remain available.

**Tasks → Record → Checklist** adds editable steps with completion tracking. Checklist items are retained in backups and task records. Completing checklist items does not automatically change the parent task's status.

Run `npm run test:liner` for domain validation and browser tests using a simulated AI service. These tests cover edits, conflicts, storage failures, persistence, connection-key handling and checklists; they do not certify a live provider connection.

## Rebuild

Run `npm run test:leads` with the local server running to verify conversion rules and browser workflows, including storage failure, duplicate reuse and refresh persistence.

Run `npm run test:landing` with the local server running to verify the landing page demos, mega menu, mobile navigation, all five static pages and responsive overflow.

Run `npm run test:moves` to verify record moves, link migration and the mobile move sheet.

Run `npm run test:pipelines` to verify pipeline migration and safeguards, stage history, and Search across desktop and mobile layouts.

Run `npm run test:commerce` for the quote totals, discount, margin and validation checks.

Run `npm ci --legacy-peer-deps` followed by `npm run build`. The generated JavaScript, CSS and fonts are in `public`. No runtime services or external fonts are required. `npm run test:e2e` runs the Playwright walkthrough (start the app on port 4817 first); the AI step runs only when `EXPLABS_API_KEY` is set.

