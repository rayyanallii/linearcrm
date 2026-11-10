export const FEATURES = {
  "platform-pipeline": {
    group: "Platform",
    label: "Pipeline",
    kicker: "Pipeline",
    title: "A next step on every open deal.",
    intro:
      "Focus mode strips the board down to the opportunities that need a decision. Stage, amount, owner and the next move stay on the card, so the forecast starts from the work instead of a separate spreadsheet.",
    note: "Board, focus list, stage ageing and totals all read from the same local records.",
    demos: ["board", "focus"],
    steps: [
      { title: "Open the board", copy: "Every open opportunity sits in its stage with the amount, owner and close date on the card." },
      { title: "Move a deal", copy: "Select a card and move it forward or back. The column totals and weighted forecast update with it." },
      { title: "Review the week", copy: "Switch on focus mode to hide the healthy deals and leave the ones with a missing next step or a long quiet spell." },
    ],
    details: [
      { title: "Stage age is visible", copy: "Each card shows how long the deal has sat in its current stage. A deal that has not moved in twelve days looks different from one moved this morning." },
      { title: "A next step is part of the record", copy: "The next action lives on the opportunity, not in a separate task list that nobody opens before the call. If the field is empty, focus mode surfaces it." },
      { title: "Totals follow the cards", copy: "Column totals, open pipeline and the weighted forecast are computed from the same records. Move one card and every number changes." },
    ],
    related: [
      { title: "Forecast", copy: "Coverage by stage, before the review", href: "./platform-forecast.html" },
      { title: "Workflows", copy: "Create the follow-up when a stage changes", href: "./platform-workflows.html" },
      { title: "Saved views", copy: "Keep the same filtered board", href: "./product-saved-views.html" },
    ],
    seo: { title: "Pipeline and deal board", description: "A Kanban pipeline with focus mode, stage ageing, next steps and live totals. Every deal sits in one local workspace." },
  },
  "platform-workflows": {
    group: "Platform",
    label: "Workflows",
    kicker: "Workflows",
    title: "Automate the follow-up, not the relationship.",
    intro:
      "A workflow watches the record, checks a condition and creates the next action. Every run writes back to the record, so the next person can see what happened and why.",
    note: "Workflows run in this browser. They do not run while the tab is closed, and the page says so.",
    demos: ["workflow", "timeline"],
    steps: [
      { title: "Pick a trigger", copy: "Start when a record is created, an opportunity changes stage or a field changes value." },
      { title: "Add a condition", copy: "Check one or more fields with all or any logic. The condition decides whether the actions run." },
      { title: "Attach the actions", copy: "Create a task, log a note, draft an email, update a field, reassign the owner or stop the run." },
    ],
    details: [
      { title: "The run log is part of the feature", copy: "Every execution records its target, the steps that ran and any failure. A workflow that silently does nothing is worse than no workflow." },
      { title: "Pause without deleting", copy: "Turn a workflow off while you edit it. Queued runs stay put and the history remains readable." },
      { title: "The browser is the runtime", copy: "A local-first project cannot run background jobs. Waits resume when you next open the workspace, and the interface states that limit instead of hiding it." },
    ],
    related: [
      { title: "Pipeline", copy: "Where stage changes begin", href: "./platform-pipeline.html" },
      { title: "Universal context", copy: "Where the run lands", href: "./platform-context.html" },
      { title: "Liner", copy: "Ask what the automation did", href: "./platform-liner.html" },
    ],
    seo: { title: "Workflow automation", description: "Visual workflows for stage changes and follow-ups, with conditions, actions, a live toggle and an honest run log." },
  },
  "platform-liner": {
    group: "Platform",
    label: "Liner",
    kicker: "Liner",
    title: "Ask the workspace a direct question.",
    intro:
      "Liner reads the records already in front of you. Pipeline, deal risk, follow-ups and the week ahead come back with the context attached, so you do not copy the same details into another tab.",
    note: "Simple questions are answered locally. A more complex request reaches an external model only when you configure one.",
    demos: ["liner", "storage"],
    steps: [
      { title: "Ask in plain language", copy: "Type the question you would ask a colleague who already knows the account." },
      { title: "Read the answer with its source", copy: "The response names the records it used, so a number can be checked instead of trusted." },
      { title: "Act on the record", copy: "Open the opportunity, draft the follow-up or mark the next step. The answer never becomes a separate document." },
    ],
    details: [
      { title: "Local answers work without a key", copy: "Counts, totals and known record summaries are computed from browser data. The workspace does not need an AI service to be useful." },
      { title: "The external model is opt-in", copy: "When you connect one, only the context needed for the answer is sent. The connection key stays in session storage and is not part of a backup." },
      { title: "Suggestions are not actions", copy: "Liner can prepare a change for review. Saving it stays your decision, and the interface keeps the two states distinct." },
    ],
    related: [
      { title: "Local-first", copy: "What stays in the browser", href: "./resources-local-first.html" },
      { title: "Universal context", copy: "The records behind the answer", href: "./platform-context.html" },
      { title: "Forecast", copy: "Ask about the number", href: "./platform-forecast.html" },
    ],
    seo: { title: "Liner workspace assistant", description: "Ask questions about your pipeline, deals and follow-ups. Local answers by default, an optional external model when configured." },
  },
  "platform-forecast": {
    group: "Platform",
    label: "Forecast",
    kicker: "Forecast",
    title: "Coverage before confidence.",
    intro:
      "Committed revenue, best case and stage coverage come directly from the pipeline. Switch the period and the model changes with it. There is no reconciliation step because there is no second source of truth.",
    note: "The weighted forecast is the deal amount multiplied by its stage probability.",
    demos: ["forecast", "focus"],
    steps: [
      { title: "Read the pipeline", copy: "Open pipeline is the sum of every open opportunity in the selected period." },
      { title: "Check coverage", copy: "Compare each stage against its target. The gap is visible while there is still time to act." },
      { title: "Change a deal, not a sheet", copy: "Move a stage or update an amount and the forecast follows on the same screen." },
    ],
    details: [
      { title: "The formula is stated", copy: "Weighted value is amount times probability. Probability comes from the stage and can be edited in pipeline settings, so the number is auditable." },
      { title: "Period switching is honest", copy: "This quarter and next quarter read from the same records with different close dates. Nothing is copied into a separate planning file." },
      { title: "Coverage is not a prediction", copy: "A 3.1× coverage ratio says the pipeline is three times the target. It does not say the deals will close." },
    ],
    related: [
      { title: "Pipeline", copy: "The work behind the number", href: "./platform-pipeline.html" },
      { title: "Account book", copy: "Renewals and expansion", href: "./platform-context.html" },
      { title: "Dashboards", copy: "The wider workspace view", href: "./product.html" },
    ],
    seo: { title: "Revenue forecast", description: "Committed revenue, best case and stage coverage calculated from the pipeline, with a stated weighting formula." },
  },
  "platform-context": {
    group: "Platform",
    label: "Universal context",
    kicker: "Universal context",
    title: "The story stays with the customer.",
    intro:
      "Notes, files, follow-ups and stage changes land on the record. Open a company and see the people, opportunities and conversations behind it instead of reconstructing the history from memory.",
    note: "Activity is stored locally with the record. There is no server copy and no sync delay.",
    demos: ["timeline", "accountBook"],
    steps: [
      { title: "Work from the record", copy: "Open a company, person or opportunity. The linked records sit on the same page." },
      { title: "Add the context once", copy: "A note, task or file attached to the record stays attached through a stage move or an owner change." },
      { title: "Read the timeline", copy: "Activity, notes and files share one view, so the last conversation is one click from the deal." },
    ],
    details: [
      { title: "Linked records in both directions", copy: "Open a company to see its people and opportunities. Open a person to see the company and the deals they influence." },
      { title: "History survives the move", copy: "Converting a lead or moving a record keeps its notes, files, tasks and activity. The relationship does not restart." },
      { title: "Nothing hidden in a black box", copy: "Workflow runs and stage changes write to the same timeline as your own notes. Automation is visible to the person reading the account." },
    ],
    related: [
      { title: "Record moves", copy: "Keep the history when the record changes shape", href: "./product-record-moves.html" },
      { title: "Workflows", copy: "Automation that writes back", href: "./platform-workflows.html" },
      { title: "Account book", copy: "Renewals and expansion signals", href: "./platform-forecast.html" },
    ],
    seo: { title: "Universal record context", description: "One timeline for notes, files, stage changes and activity, with linked people, companies and opportunities." },
  },
  "product-data-model": {
    group: "Product",
    label: "Data model",
    kicker: "Data model",
    title: "Structure that flexes without breaking links.",
    intro:
      "Leads, people, companies and opportunities share typed fields and real relationships. Add a field or an object and the rest of the workspace still knows how the records connect.",
    note: "Custom fields use the same renderer and editor as the standard fields.",
    demos: ["dataModel", "workspace"],
    steps: [
      { title: "Start with standard objects", copy: "Leads, people, companies, opportunities, tasks and notes arrive with fields that make sense on day one." },
      { title: "Add what your team needs", copy: "Create a text, number, date, select, relation or owner field without writing code." },
      { title: "Create a custom object", copy: "Give it fields, a view and a place in navigation. It behaves like the rest of the workspace." },
    ],
    details: [
      { title: "Typed fields, not a notes column", copy: "A date field sorts by date, a currency field totals, a relation field opens the linked record. Shape matters because the workspace uses it." },
      { title: "Relations hold the model together", copy: "A person belongs to a company, an opportunity belongs to both, and a task can point at any of them. The links stay valid when a record moves." },
      { title: "A schema you can see", copy: "The data model page lists objects, field counts and relationships. Nothing is hidden behind a migration run." },
    ],
    related: [
      { title: "Record moves", copy: "A record changes shape without losing links", href: "./product-record-moves.html" },
      { title: "Saved views", copy: "The model, filtered your way", href: "./product-saved-views.html" },
      { title: "Local-first", copy: "Where the schema lives", href: "./resources-local-first.html" },
    ],
    seo: { title: "Data model and custom fields", description: "Standard and custom objects, typed fields and real relationships, editable from the workspace without a backend migration." },
  },
  "product-record-moves": {
    group: "Product",
    label: "Record moves",
    kicker: "Record moves",
    title: "Move the record, keep the relationship.",
    intro:
      "A lead becomes a person or a company without becoming a second record. Notes, tasks, files, favourites and history travel with it. Move it back to Leads if the qualification was wrong.",
    note: "The record keeps its identifier through the move. Nothing is duplicated.",
    demos: ["recordMove", "timeline"],
    steps: [
      { title: "Qualify the lead", copy: "Work the lead through its outreach statuses until there is a real conversation." },
      { title: "Choose the destination", copy: "Move it to People or Companies. The same record changes shape, so the links stay in place." },
      { title: "Keep working", copy: "The new person or company already carries the notes, tasks, source and activity from the lead." },
    ],
    details: [
      { title: "No duplicate to clean up", copy: "Most tools create a new contact and leave the lead behind. Here the lead is the record that becomes the contact." },
      { title: "Reversible by design", copy: "A wrong conversion is not a one-way door. Move the record back to Leads and the original relationship is still there." },
      { title: "Deduplication is separate", copy: "When two real records already exist, the duplicate review compares fields side by side and moves links to the record you keep." },
    ],
    related: [
      { title: "Universal context", copy: "The history that follows the move", href: "./platform-context.html" },
      { title: "Data model", copy: "How the objects relate", href: "./product-data-model.html" },
      { title: "Pipeline", copy: "Where the new opportunity starts", href: "./platform-pipeline.html" },
    ],
    seo: { title: "Record moves and lead conversion", description: "Convert a lead into a person or company without a duplicate record. Notes, tasks, files and history stay attached." },
  },
  "product-saved-views": {
    group: "Product",
    label: "Saved views",
    kicker: "Saved views",
    title: "The view you left is the view you return to.",
    intro:
      "Filter the book, choose the layout and save it by name. A saved view remembers the filters, sorting and columns, so the Monday review does not start with rebuilding the same table.",
    note: "Views survive reloads and are included in a workspace backup.",
    demos: ["savedViews", "workspace"],
    steps: [
      { title: "Filter and sort", copy: "Narrow the records with the conditions that matter, then order them the way you read them." },
      { title: "Choose the layout", copy: "Use a table for detail, a board for stages or a calendar for dates. The layout is part of the view." },
      { title: "Save it by name", copy: "Give the view a name. It appears beside the other views for that object and opens the same way next time." },
    ],
    details: [
      { title: "Filters are readable", copy: "Each view lists its conditions in plain language, so a teammate can tell why a record is missing instead of guessing." },
      { title: "Columns belong to the view", copy: "Visible fields and their order are saved with it. A renewals view and a data-quality view can show different columns of the same object." },
      { title: "No hidden state", copy: "Search terms are saved too. The view is the whole configuration, not a link that loses half its settings on refresh." },
    ],
    related: [
      { title: "Data model", copy: "The fields the view reads", href: "./product-data-model.html" },
      { title: "Pipeline", copy: "A board saved for the week", href: "./platform-pipeline.html" },
      { title: "Backup", copy: "Views travel with the workspace", href: "./resources-backup.html" },
    ],
    seo: { title: "Saved views", description: "Save filters, sorting, columns and layout as named views for tables, boards and calendars. Views persist with the workspace." },
  },
  "resources-local-first": {
    group: "Resources",
    label: "Local-first",
    kicker: "Local-first",
    title: "Your workspace stays yours.",
    intro:
      "Records live in this browser, not in a vendor database. Open the CRM and the sample workspace is already there. Export a backup when you want a second copy.",
    note: "There is no account, no sync service and no server copy of your records.",
    demos: ["storage", "backup"],
    steps: [
      { title: "Open the workspace", copy: "The app is a static bundle. There is nothing to install and no sign-in step." },
      { title: "Work as usual", copy: "Records, views, workflows and custom fields are written to this browser's local storage." },
      { title: "Keep a copy", copy: "Download a JSON backup. Restore it in the same browser or move it to another profile on purpose." },
    ],
    details: [
      { title: "The trade-off is real", copy: "Local-first means no shared team workspace, no background jobs and no recovery from a cleared browser. The product states this on the pricing page instead of hiding it." },
      { title: "What leaves the browser", copy: "Only an assistant request you explicitly run with a configured key. The key stays in session storage and is not part of a backup." },
      { title: "One browser, one workspace", copy: "Chrome, Firefox and a private window each have separate storage. A backup is how you move between them." },
    ],
    related: [
      { title: "Backup and restore", copy: "The copy that survives a cleared browser", href: "./resources-backup.html" },
      { title: "Liner", copy: "The one optional outbound request", href: "./platform-liner.html" },
      { title: "Pricing", copy: "What $0 does and does not include", href: "./pricing.html" },
    ],
    seo: { title: "Local-first architecture", description: "How Linear CRM stores records in your browser, what leaves the browser and what the local-first trade-off costs." },
  },
  "resources-import-export": {
    group: "Resources",
    label: "Import and export",
    kicker: "Portability",
    title: "Your data has an exit.",
    intro:
      "CSV brings the book in and takes a table out. A JSON workspace backup is the complete option. Neither path needs a support ticket or an export queue.",
    note: "CSV handles standard objects. The JSON backup handles everything, including custom fields and views.",
    demos: ["import", "backup"],
    steps: [
      { title: "Start from a template", copy: "Download the column headers for the object you are importing so the file matches on the first try." },
      { title: "Map the columns", copy: "The importer matches headers, resolves company relations and checks for duplicates before writing." },
      { title: "Export what you filtered", copy: "A table exports the current view, not the whole object. The JSON backup is the whole workspace." },
    ],
    details: [
      { title: "Header matching", copy: "Column names are matched to fields. Anything uncertain is shown for review instead of silently dropped." },
      { title: "Relations are resolved", copy: "A company name in a lead file can attach to an existing company. Contacts do not arrive as orphaned rows." },
      { title: "Two formats, two jobs", copy: "CSV is for spreadsheets and hand-offs. JSON is for a complete restore. The page keeps that distinction clear." },
    ],
    related: [
      { title: "Backup and restore", copy: "The complete workspace snapshot", href: "./resources-backup.html" },
      { title: "Local-first", copy: "Why portability matters here", href: "./resources-local-first.html" },
      { title: "Data model", copy: "The fields a CSV maps into", href: "./product-data-model.html" },
    ],
    seo: { title: "CSV import and export", description: "Import leads and contacts from CSV with header matching, relation resolution and duplicate checks. Export any filtered view." },
  },
  "resources-backup": {
    group: "Resources",
    label: "Backup and restore",
    kicker: "Backup",
    title: "One file, the whole workspace.",
    intro:
      "A backup contains the records, links, custom fields, views, workflows and settings. Restore it and the workspace returns exactly as it was. There is no server copy to fall back on.",
    note: "Export before you clear site data or change browsers. That is the whole recovery plan.",
    demos: ["backup", "storage"],
    steps: [
      { title: "Export", copy: "Open the account menu and choose Backup. The browser downloads a JSON file with the full workspace." },
      { title: "Keep it somewhere real", copy: "A downloads folder is not a backup. Move the file to storage you trust and keep more than one copy." },
      { title: "Restore", copy: "Choose Restore from the account menu and select the file. The current workspace is replaced." },
    ],
    details: [
      { title: "What is inside", copy: "Records, relations, custom objects, fields, saved views, workflows, run history, settings and workspace preferences." },
      { title: "What is not inside", copy: "The session-only AI connection key. Attachments are included when they fit the browser storage limit." },
      { title: "Storage has a ceiling", copy: "Browsers cap local storage. Large attachment libraries can hit it, so the app reports the failure and rolls the write back." },
    ],
    related: [
      { title: "Local-first", copy: "The storage model behind the file", href: "./resources-local-first.html" },
      { title: "Import and export", copy: "Move one table at a time", href: "./resources-import-export.html" },
      { title: "Pricing", copy: "The support boundary, stated plainly", href: "./pricing.html" },
    ],
    seo: { title: "Backup and restore", description: "Export the whole workspace as one JSON file and restore it later. What the backup includes, and what it cannot protect." },
  },
  "resources-keyboard": {
    group: "Resources",
    label: "Keyboard",
    kicker: "Keyboard",
    title: "Fast enough to stay in the flow.",
    intro:
      "Most work happens through one command menu. Search a record, create a task or jump to an object without moving your hands off the keys.",
    note: "Shortcuts work in the workspace. The command menu is the same on every page.",
    demos: ["command", "workspace"],
    steps: [
      { title: "Open the menu", copy: "Press Command K on macOS or Control K on Windows and Linux." },
      { title: "Type what you want", copy: "Search records, pages and actions from one field. Results narrow as you type." },
      { title: "Move and confirm", copy: "Use the arrow keys to pick a result, Enter to open it and Escape to close the menu." },
    ],
    details: [
      { title: "One menu, every object", copy: "The menu indexes navigation, records, quick-create actions and workspace commands. There is no second search box to remember." },
      { title: "Focus stays visible", copy: "Dialogs and menus return focus to the control you came from, and every action has a visible focus ring." },
      { title: "Escape always works", copy: "Escape closes the menu, a dialog or a drawer. No keyboard trap and no hidden state." },
    ],
    related: [
      { title: "Saved views", copy: "Return to the same table", href: "./product-saved-views.html" },
      { title: "Record moves", copy: "A faster conversion path", href: "./product-record-moves.html" },
      { title: "Liner", copy: "Ask instead of searching", href: "./platform-liner.html" },
    ],
    seo: { title: "Keyboard shortcuts", description: "Command menu, record search and quick create from the keyboard, with visible focus and predictable Escape behaviour." },
  },
};
