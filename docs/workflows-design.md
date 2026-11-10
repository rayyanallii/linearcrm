# Workflows — how they work

**Status:** shipped. Workflows is a list of flows. **New workflow** opens a Studio-style
canvas where widgets are dragged in, connected, saved and executed. Legacy linear rules are
converted to the same graph on load, so there is one model and one execution engine.

---

## 1. The model

A workflow is a **trigger** followed by a **graph** of steps.

```
[Trigger] ──► [Condition] ──Yes──► [Create task] ──► [Wait 2 days] ──► [Update field]
                   │
                   └──No──► [Assign owner]
```

- Every node has one input (except the trigger) and one output, except **Condition**, which
  has two labelled outputs: **Yes** and **No**.
- Connections are stored as edges. A port holds at most one outgoing edge; connecting again
  replaces it.
- The trigger is fixed, cannot be deleted, and is configured in the inspector.
- The graph is the only source of truth. There is no separate "draft" workflow and no second
  builder.

---

## 2. Using it

1. **Workflows** lists every flow with its trigger, a preview of its path, step count, run
   count, queued runs and Active/Paused state. Open, Duplicate, Pause/Resume and Delete are
   on each row.
2. **New workflow** opens the Studio. A new flow starts with just the trigger, defaulted to
   *Opportunity stage changes to Negotiation*.
3. Drag a widget from **Steps** onto the canvas — or click it to place it in the next free
   spot. Widgets: Condition, Create task, Update field, Assign owner, Wait.
4. Click a node to select it and edit it in **Step settings**. Drag node bodies to arrange
   them; zoom with the footer controls.
5. Connect: click an output circle, then click the next node (its input circle or its body).
   Conditions expose **Yes** and **No** circles. Connect from the trigger first. Press
   **Esc** to cancel a pending connection, or click the same circle again to disconnect it.
6. **Save workflow** validates the graph and returns to the list. **Cancel** discards local
   changes.

Inspector fields by node:

| Node | Settings |
|---|---|
| Trigger | Record type, event, stage / field and optional target value |
| Condition | One or more field checks, All/Any, invert toggle |
| Create task | Title, due in N days |
| Update field | Field, new value |
| Assign owner | Workspace member |
| Wait | Days (1–90) |

---

## 3. Triggers

A save produces events by diffing the workspace against the previous state. Supported:

| Trigger | Fires when |
|---|---|
| **Opportunity stage changes to…** | an opportunity's `stage` becomes the chosen value |
| **A record is created** | a record appears in the chosen collection |
| **A field changes to…** | a watched field changes; an optional target value narrows it |

Trigger values are compared with `String(...)`; an empty target means "any change". Events
are ignored when only system fields (`updatedAt`, `updatedBy`) changed.

Not supported locally: date-based triggers (renewal in 30 days, task overdue), manual
"run on this record", inbound webhooks. Those need a scheduler or a server.

---

## 4. Conditions

A condition node holds one or more typed checks:

- Field list comes from the triggering object, excluding system, computed and long-text
  fields.
- Operators follow the field type: text (is / is not / contains / does not contain / empty),
  number (is / greater than / less than / empty), date (is / before / after / empty),
  select, relation, owner (is / is not / empty), boolean (is true / is false).
- Relation values compare by record id and display by name; dates compare by calendar day.
- Multiple checks match **all** or **any**.
- **Invert** flips the result, so the Yes path means "this does not match".

The engine walks the matching edge. A missing edge ends the run quietly (it is a valid "do
nothing" outcome, not a failure).

---

## 5. Execution

```
on save:
  commit once (atomic)
  diff previous vs next -> events
  for each workflow, for each triggered record:
     walk the graph from the trigger's outgoing edge
```

- **Condition** → evaluate, follow Yes/No.
- **Create task** → task linked to the triggering record, owned by its owner, due in N days.
- **Update field** → coerced and validated exactly like manual editing (numbers, dates,
  select options, relations, members); a stage change refreshes probability.
- **Assign owner** → must be an existing workspace member.- **Create note / Log activity / Email draft** → write locally. The email draft is stored in
  the Emails log with the record linked and is never sent.
- **Stop** → ends the run; later connections are ignored.
- **Wait** → queue the *remaining path* and stop. The rest of the flow does not run early.
   This is the core behaviour: wait pauses, it does not merely delay one step.
- **Loops** → a node visited more than three times ends the run with a failed "Workflow loop
  stopped" entry. Depth is capped at 60 nodes per run.
- **Failure** → the failing step is logged with its message and the run stops; earlier writes
  in the same run stay applied. A failed action never writes a partial value.

Waits are absolute timestamps. Due runs execute when the app next loads or saves, oldest
first; there is no background worker. **Run now** executes a queued run immediately.
Deleting the workflow or its record cancels its queued runs; pausing stops new runs and
holds queued entries until the workflow resumes. Every entry written by one execution
shares a `runId`, which is what the list groups on.

Manual **Run** executes the graph on a record you choose; the dry run runs the same graph
against a copy and reports the steps and queued waits without writing.

No cross-workflow chaining: a field written by a workflow does not re-enter the trigger
comparison in that same save. This avoids loops at the cost of "automations triggering
automations", which is documented rather than simulated.

---

## 6. Data

```json
{
  "id": "wf_...",
  "name": "Negotiation implementation plan",
  "enabled": true,
  "trigger": { "object": "deals", "event": "stage_changed", "field": "stage", "value": "Negotiation" },
  "nodes": [
    { "id": "n_trigger", "type": "trigger", "x": 60, "y": 220 },
    { "id": "n_action_0", "type": "action", "action": "create_task", "title": "Send plan", "delay": 1, "x": 360, "y": 120 },
    { "id": "n_wait_1", "type": "wait", "days": 2, "x": 640, "y": 120 }
  ],
  "edges": [
    { "id": "e1", "from": "n_trigger", "to": "n_action_0", "port": "out" },
    { "id": "e2", "from": "n_action_0", "to": "n_wait_1", "port": "out" }
  ]
}
```

Condition nodes carry `conditions`, `logic` and `negate`. A queued run stores the workflow,
record, next node id and absolute resume time. Run entries keep the existing shape
(`workflowId`, `targetName`, `summary`, `status`, `scheduled`).

### Migration

On load, a workflow without a trigger node is converted:

- conditions → a condition node directly after the trigger (false path ends the run)
- per-action wait → a wait node before that action
- per-action branch → a condition node; `otherwise` becomes **invert**
- the resulting chain is laid out left to right

IDs are index-based, so migration is stable across reloads. Old queued entries that stored a
single action still execute through the legacy path.

---

## 7. Limits

| Limit | Value |
|---|---|
| Nodes per workflow | 40 (validated on save) |
| Nodes walked per run | 60 |
| Visits per node | 3 |
| Wait length | 1–90 days |
| Run history | last 120 step entries |

---

## 8. Local-only reality

| Capability | Locally honest |
|---|---|
| React to saves in this tab | Yes |
| Execute waits | Only when the app loads or saves |
| Tasks, field updates, owner changes | Yes |
| Email send / webhook / retries | No — backend |
| Date-based triggers | No — worker |
| Multi-user ordering and locks | No |

Every wait shows a resume timestamp, and the queue panel says "Resumes when the app is open".

---

## 9. What is tested

`npm run test:workflows` (25 checks):

- condition gate blocking; all/any logic; if/otherwise migration
- wait queued not executed; due flush once only; Run now; delete cancels
- field write + probability refresh; owner membership; invalid field rejected
- legacy single-action migration; tasks linked to the record
- **graph wait pauses the rest of the flow**
- **graph condition routes Yes / No correctly**
- **legacy actions migrate into a trigger-connected graph**

The browser suite adds: changing a stage fires the seeded workflow, its task appears linked,
and a workflow built entirely in the Studio (add task, connect, save) fires and creates its
task, then deletes cleanly — with no page or console errors.

---

## 10. Remaining work

Shipped: run grouping (one row per execution, expandable steps), manual **Run** on a record
with a dry-run preview, note / activity / email-draft / stop actions, pause suspending the
queue instead of discarding it, and templates (speed to lead, proposal follow-up, renewal
reminder) that build real, editable graphs.

Ordered by value:

1. **Condition groups** (A and (B or C)) and one related-record hop (e.g. company industry).
2. **Chaining** with derived events, self-trigger guard, depth limit and idempotency keys.
3. **Skip reasons** inside a grouped run (which condition sent it down the other path).
4. **Backend**: worker-driven waits, date triggers, webhooks, real email, retries, permissions.

---

## 11. Decisions

| Decision | Choice | Why |
|---|---|---|
| Builder | Graph canvas, executed directly | Matches the mental model of a flow; no decorative mode |
| Trigger | Fixed node, config in inspector | Every flow has exactly one entry point |
| Wait | Pauses the remaining path | Matches "wait 2 days, then follow up" |
| Conditions | Yes/No ports, visible on the canvas | The picture equals the logic |
| Legacy rules | Migrated to graphs | One engine, no parallel rule mode |
| Failures | Stop the run, log the step | Predictable, no half-applied follow-ups |
| Loops | Visit cap, logged failure | Local safety without a graph validator |
