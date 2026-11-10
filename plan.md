# Linear CRM — product plan

Linear CRM is a browser-only, single-user CRM built to demonstrate the product architecture of
[Twenty](https://github.com/twentyhq/twenty) without a server. Everything lives in `localStorage`
and the app runs from a static bundle, so it can be published on any static host as a portfolio
piece. The visual language, primitives and record-table behaviour come from Twenty's UI package.

The goal of this plan is not a toy demo. It is a coherent CRM with a real data model, editable
records, saved views, dashboards, automation, email logging and a settings surface. Features that
are fundamentally server-side (permissions, multi-user, real mailbox sync, APIs, webhooks,
serverless functions) are labelled honestly rather than faked.

---

## 1. Product principles

1. **Twenty's architecture, smaller runtime.** Objects → fields → views → layouts → widgets →
   commands → agents. The UI should feel like a plausible Twenty workspace.
2. **Every record is editable.** Inline table cells, record-page field rows and bulk edit all
   write through the same store.
3. **Views are first-class.** Filters, sorts, grouping, layout and visible columns can be saved
   as named views and survive reloads and backups.
4. **Local-first, no hidden services.** No auth, no CRM server and no background network calls. The optional Assistant makes one outbound request only when you explicitly run a decision.
5. **Honest scope.** A portfolio project should be polished and complete at what it claims.
6. **Attio-calibrated visual language.** White surfaces, quiet borders, compact type, stage dots,
   icon-led fields and generous spacing keep dense CRM data calm and scannable.

---

## 2. Architecture mapped to Twenty

| Twenty primitive | Linear CRM implementation |
| --- | --- |
| **Data model — objects** | Five standard objects (Companies, People, Opportunities, Tasks, Notes), an activity-only Email object, and user-created custom objects. |
| **Data model — fields** | Text, long text, number, currency, percent, date, email, phone, URL, select, boolean, owner and relation fields. Custom fields use the same renderer/editor. |
| **Logic — workflows** | Local trigger/action engine. Triggers: record created, opportunity stage changed, field changed. Actions: create a linked task with a due-date offset. Run log included. |
| **Logic — tools / functions / skills** | Deterministic workspace tools (pipeline summary, follow-up list, data-quality audit, email drafting) plus optional Experiential `clef-flash` decisions for pipeline focus, deal risk and custom yes/no questions. |
| **Layout — views** | Table, Kanban board and Calendar layouts for every object that supports them. Saved named views store layout, filters, sort, group and search. |
| **Layout — widgets** | Dashboards with metric, bar, donut and line widgets, configurable source, grouping, measure and width. |
| **Layout — layout pages** | Record page with grouped field sections, inline editing, relations, timeline, files and metadata. |
| **Layout — commands** | `⌘K` / `Ctrl+K` command menu: navigation, quick create, record search, theme switch, backup. |
| **AI agents and chats** | Assistant route with deterministic insights, `gpt-6-luna` workspace chat through Chat Completions, and optional `clef-flash` decisions: pipeline focus, per-opportunity risk and custom yes/no. |
| **CRM features** | Pipeline board with drag-and-drop, weighted forecast, win rate, overdue tasks, account health, CSV import/export, bulk edit, favourites, duplicate, trash/restore, audit trail. |
| **Email / calendar** | Email composer with templates and a local email log per record; calendar view plus `.ics` export. No mailbox connection. |
| **Customisation** | Custom objects, custom fields, column order/visibility, record sections, workspace name, light/dark theme, members/owners. |

### Storage model

`linear-crm.v1` in `localStorage`:

```
version, workspace, members, ui
companies[], contacts[], deals[], tasks[], notes[], emails[]
objects[], customFields[], layout{}
views[], reports[], workflows[], workflowRuns[]
files[], pins[], trash[], activity[], chat[]
```

Old workspaces (including the earlier `rules` and `conditions` shape) are migrated on load.
Backups are the same JSON document.

### AI boundary

The Assistant uses two Experiential models with the same key:

- `gpt-6-luna` calls `POST https://api.experientiallabs.ai/v1/chat/completions` with workspace
  context and returns ordinary assistant text plus prompt/completion/total token usage.
- `clef-flash` is a native decision model. It calls `POST https://api.experientiallabs.ai/v1/systemone`
  with `model`, `state` and `questions`, and returns `answers[*].choice`, `.probabilities` and `.noul`.

The key comes from `EXPLABS_API_KEY` at build time and is written to a git-ignored `public/env.js`.
Because the app is static, that key is still present in the build: use a dedicated portfolio key and
never publish a build containing a live secret. Without a key, all deterministic tools continue to work.

---

## 3. Feature backlog and status

### Foundation — done

- [x] Static React/esbuild app with Twenty UI primitives, theme tokens and upstream table pieces.
- [x] Schema-driven records instead of per-object screens.
- [x] Local persistence with load validation, migration and quota error handling.
- [x] Richer demo dataset: 12 accounts, 18 people, 18 opportunities, 16 tasks, 8 notes, 8 emails.
- [x] Seeded saved views across every object.
- [x] Light/dark Twenty theme, responsive drawer navigation.

### Data model — done

- [x] Standard objects with 14–18 fields each.
- [x] Custom objects created from Settings, with their own records, default fields and views.
- [x] Custom fields on any object: text, long text, number, date, email, URL, select, boolean, relation.
- [x] Rename/delete custom fields; values are removed with the field.
- [x] Delete custom objects with their records, fields, views and pins.
- [x] Owner/member management used by every owner field.

### Records — done

- [x] Record drawer with grouped sections and inline editing on every field.
- [x] Create/edit/duplicate/delete records.
- [x] Favourites in the sidebar.
- [x] Recoverable deletion via Trash (relations are re-linked on restore).
- [x] File attachments (base64, 1 MB cap) and record history.
- [x] Related-record navigation in both directions.
- [x] Quick-create linked task/note/email from a record.
- [x] Record timeline merging audit events and logged emails.
- [x] Created/updated metadata.

### Views — done

- [x] Table with inline cell editing, sortable headers, row selection, bulk edit, bulk delete, CSV export.
- [x] Kanban with drag-and-drop, per-column totals and group-by selection.
- [x] Calendar with month navigation, day creation, unscheduled list and `.ics` export.
- [x] Filter builder with all/any logic and type-aware operators.
- [x] Sort by any field, ascending/descending.
- [x] Save/update/delete named views; search term is saved too.
- [x] Column visibility and ordering per object.
- [x] Table aggregates in the footer.
- [x] Empty states and result counts.

### Dashboards — done

- [x] KPI strip: open pipeline, weighted pipeline, won revenue, win rate, overdue tasks.
- [x] Metric, bar, donut and line widgets.
- [x] Count / sum / average measures over any object.
- [x] Group by any field; date grouping by month.
- [x] Create, edit, reorder, resize (half/full) and delete widgets.
- [x] Seeded starter dashboard.

### Automation — done

- [x] Create/edit/enable/pause/delete workflows.
- [x] Trigger on record creation, opportunity stage change or field change.
- [x] Action creates a linked task with an offset due date and inherited owner.
- [x] Run history with target and generated task.
- [x] Migration of the previous stage-follow-up rules.

### AI and insights — done

- [x] Deterministic pipeline/forecast summary.
- [x] Deals needing attention (past next follow-up, missing next step, stale close date).
- [x] Data-quality audit (missing domains, industries, emails, owners, amounts).
- [x] Task-load and overdue summary.
- [x] Suggested next actions that open the underlying record.
- [x] Experiential `gpt-6-luna` workspace chat through `https://api.experientiallabs.ai/v1/chat/completions` with token usage.
- [x] Experiential `clef-flash` integration at `https://api.experientiallabs.ai/v1/systemone` with the same `EXPLABS_API_KEY`.
- [x] Calibrated pipeline-focus choice, per-opportunity risk scores, and custom yes/no decisions.
- [x] Decision confidence, probabilities and token usage.
- [x] AI-style email drafts from CRM facts, editable and loggable.

### Productivity — done

- [x] `⌘K`/`Ctrl+K` command menu with keyboard navigation.
- [x] Global record search and quick-create commands.
- [x] CSV import/export with header matching and relation resolution.
- [x] Backup export/restore and demo reset.
- [x] Local email composer with templates, `mailto` hand-off and logged activity.
- [x] Calendar feed export.
- [x] Responsive layout for tablet/mobile.

### Intentionally not implemented (requires a backend)

- [ ] Multi-user workspaces, roles, field-level permissions, record sharing.
- [ ] Real OAuth mailbox/calendar sync, inbound email, sequences/campaigns.
- [ ] Server APIs, webhooks, serverless functions, background jobs, scheduled workflows.
- [ ] Marketplace apps, SSO, audit export, billing, data residency.
- [ ] True multi-device sync and conflict resolution.

These are listed in the Settings → Integrations panel so the boundary is explicit. The app is a
portfolio-grade product demo, not a production CRM.

---

## 4. Delivery phases

1. **Schema and data** — central object/field definitions, richer seed, migration-safe store.
2. **Shell** — Twenty drawer, page header, routing (hash), theme, command menu.
3. **Views** — table/board/calendar, filters, sorting, grouping, saved views, bulk actions.
4. **Record page** — grouped fields, inline editing, relations, timeline, files, emails.
5. **Analytics, automation and AI** — overview, dashboards, workflow engine, deterministic insights, Experiential decisions.
6. **Administration** — data model, custom objects/fields, members, trash, backup/reset.
7. **Polish and verification** — Attio-inspired surfaces, dark mode, responsive CSS, empty states,
   build, smoke test.

---

## 5. Verification checklist

- [x] Production bundle builds with esbuild.
- [x] Create, edit (table cell and record page), duplicate and delete records.
- [x] Filter, sort, group, switch layouts and save/reopen a named view.
- [x] Custom object and custom field round-trip, including relation fields.
- [x] Workflow creates a task when an opportunity reaches the configured stage.
- [x] Dashboard widgets compute from live records.
- [x] Email log updates the timeline and contact's last-contacted date.
- [x] CSV export/import round-trip.
- [x] Backup restore and demo reset.
- [x] Dark theme and mobile navigation.
- [x] Experiential `gpt-6-luna` chat returns workspace-aware text plus prompt/completion token usage.
- [x] Experiential `clef-flash` decision returns an answer and token usage in the Assistant.
- [x] No console errors during the smoke path.

Any known limitations are documented in README.md.
