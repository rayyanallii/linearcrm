# CRM MASTER SPECIFICATION
## AI-Agent-Ready Product Requirements & Development Blueprint

**Project:** Modern AI-Powered CRM SaaS  
**Document Type:** Product Requirements Document (PRD) + Technical Specification + Agent Execution Instructions  
**Version:** 1.0  
**Status:** In execution — browser-only edition, audited 2026-11-04 (see section 0)  
**Product Category:** Customer Relationship Management (CRM), Sales Management, Workflow Automation, Business Productivity

---

# 0. IMPLEMENTATION STATUS — AUDITED 2026-11-04

**Where this stands.** The specification is being executed as a **browser-only** edition: React and
esbuild in `local/`, static output in `public/`, persistence in `localStorage` under `linear-crm.v1`.
The final instruction in this document — build everything that does not need a backend — governs
module decisions. Server-side authorization, background workers, OAuth mailbox sync and payments
are marked **Backend-only** and are stated as such in the product instead of being simulated.

**Audit method.** Every module and differentiator was checked against the running app and its
source, not against the roadmap. Statuses:

- **Implemented** — the module's core behaviour works on local data.
- **Partial** — a usable subset exists; the gaps are named below rather than implied.
- **Backend-only** — cannot be honest without a server.
- **Not started** — no working implementation.

### Module status

Campaigns, Projects, Support tickets, Products & quotes, Invoices and the Emails conversation log ship as optional **feature packs**: they are off by default and each is enabled under **Settings → Feature packs**. Disabling a pack hides its navigation page, command-menu entries, dashboard source and relation columns while keeping every record, view and link.

| Module | Status | Working now | Gaps |
|---|---|---|---|
| **MOD-01** Dashboard & command center | Partial | Overview KPIs (open pipeline, weighted forecast, won revenue, win rate, overdue work), pipeline selector, stage breakdown, recent opportunities, follow-up list, quick create, `Ctrl/⌘ K` command menu with record search | Configurable Overview layout, date-range and team filters, dashboard templates, AI daily summary |
| **MOD-02** Contacts | Implemented | CRUD, table/board/calendar, inline and drawer editing, search, filters, sorts, bulk edit/delete, CSV, duplicate review and merge, owner, status, source, campaign attribution, notes, files, timeline, related records, favourites, trash | Multiple companies per person, extra emails/phones, org chart, enrichment, multi-select tags, full address fields |
| **MOD-03** Companies | Implemented | CRUD, domain, industry, tier, employees, revenue, ICP, relationship status, owner, renewal date, computed people, location, notes, associations, timeline, files, CSV, duplicate merge, dashboard grouping | Parent/subsidiary hierarchy, logo upload, account health beyond the seeded custom field, linked quotes/invoices |
| **MOD-04** Leads | Implemented | Full outreach lifecycle, statuses, priority, source, budget, needs, ageing, campaign attribution, CSV template/import/export, linked tasks and notes, board view, conversion with reuse and ambiguity handling | Public capture forms/API, round-robin routing, nurture sequences, AI scoring |
| **MOD-05** Opportunities | Partial | Kanban drag-and-drop, multiple pipelines, stage ordering and default probabilities in Settings, probability, owner, company/contact, amounts, dates, next step, won/lost, stage history, weighted forecast, stage ageing, sales-cycle reporting | Per-pipeline custom stage names, products/line items, splits, forecast calculations beyond probability weighting |
| **MOD-06** Tasks | Partial | Statuses (Open, In progress, Waiting, Blocked, Done, Cancelled), priorities, types, checklists, daily/weekly/monthly repeats with anchored month days, completion timestamps, linked records, bulk reschedule/status, Today/Overdue/Upcoming/Unscheduled/Closed views inside Tasks, calendar export | Subtasks, dependencies, time tracking, reminder delivery (needs a scheduler) |
| **MOD-07** Calendar | Partial | Per-object month, week and agenda calendar, create-on-day, configurable date field, `.ics` export with real record names | Day view, meeting records, booking links, two-way Google/Outlook sync |
| **MOD-08** Email | Partial | Composer with templates, `mailto` hand-off, local conversation log, timeline enrichment, last-contacted updates; optional **Email accounts** pack with SMTP sender registry (Gmail/Workspace/Outlook/custom), 14-day warm-up ramp, daily allowance, verification, health score and pause/resume | Real SMTP delivery, OAuth, mailbox sync, threading, shared inbox, scheduled send and server-side sequences (all backend) |
| **MOD-09** Workflows | Partial | Workflow list plus a Studio canvas: drag Condition / Create task / Create note / Log activity / Email draft / Update field / Assign owner / Stop / Wait widgets, connect Yes/No paths, save and execute the graph. Created, stage-changed and field-changed triggers; all/any conditions; wait nodes pause the remaining flow and resume on the next open; grouped run log including failures; manual run on a record with a dry-run preview; pausing holds queued runs; starter templates that build real graphs; legacy rules migrate into the same graph | Conditions across related records, webhook actions, retries, and unattended execution (needs a worker) |
| **MOD-10** Analytics | Partial | Sales performance report with pipeline/owner/date filters, stage ageing, recorded monthly outcomes, cycle time and CSV; custom widgets (metric, bar, donut, line; count/value/average; group by any field or month) | Lead-source funnel report, saved report definitions, PDF export, scheduled delivery |
| **MOD-11** Campaigns | Partial | Email campaign builder: sender account, segment builder over Leads/People (status, source, priority, owner) with live recipient preview, subject/body merge tags, attachment, start date, up to three follow-ups, simulated batch sending within the mailbox's warm-up allowance, pause/resume/complete, progress and per-recipient local email log; budget, spend and attribution retained | Real delivery, consent/unsubscribe, landing pages, A/B tests, scheduled server-side sequences, ad-platform integrations (backend) |
| **MOD-12** Support tickets | Partial | Local tickets with status, priority, category, company, contact, owner, opened/due dates, saved open view, timeline links, dashboards | Inbound email intake, SLA timers, escalation jobs, knowledge base, CSAT surveys |
| **MOD-13** Products, quotes, billing | Partial | Product catalogue (SKU, category, price, cost, billing, availability) and a Quote section on opportunities with line items, quantity, discount, live subtotal/total, margin and one-click amount sync — behind the optional **Products & quotes** pack. The optional **Invoices** pack adds invoice records with status, issue/due/paid dates and a **Create invoice** action on quotes | Payment processing, quote PDF/print, tax rates, approvals, per-customer price books |
| **MOD-14** Projects | Partial | Project records with status, progress, schedule, budget/spend, next milestone, company/contact/opportunity links, task relation, saved active view, board and calendar | Milestones as records, time tracking, budget burn analysis, client portal, automatic creation from Won |
| **MOD-15** Teams | Backend-only | Local members double as owners; workspace name and density; pinned navigation; audit actor labels | Invitations, roles and permissions, record sharing, presence, workload queues |
| **MOD-16** Customisation | Partial | Custom objects, custom fields (text, long text, number, date, email, URL, boolean, select, relation), record section layout, column order/visibility, saved views, table/board/calendar layouts | Multi-select and formula fields, gallery layout, form builder, industry templates, per-field validation rules |
| **MOD-17** Integrations & developer platform | Backend-only | Settings → Integrations states the boundary plainly; the Liner AI call is the single outbound request, made only when the user acts | API keys, webhooks, OAuth apps, rate limits, integration health |
| **MOD-18** Security & administration | Backend-only | Local audit trail, trash and restore, backup/restore, storage-failure rollback, no fabricated authentication | Authentication, session management, roles, tenant isolation, MFA, retention controls |
| **MOD-19** AI assistant & agents | Partial | Liner chat (`gpt-6-luna` via Experiential) with paginated read tools, validated create/update proposals with before/after review, grounded local answers that make no network request, email drafts, `clef-flash` decisions with confidence and token usage | Natural-language filter search, workflow drafting, meeting summaries, daily briefing, reporting Q&A |

### Differentiator status

| Differentiator | Status | Note |
|---|---|---|
| **DIFF-01** Universal command center | Implemented | Navigation, record search across fields and custom objects, quick create, theme, backup, keyboard navigation |
| **DIFF-02** Visual automation studio | Partial | Node canvas, inspector and draft persistence; execution stays in the Local rules tab |
| **DIFF-03** Custom object builder | Partial | Objects, fields, relations and record layouts; no validation-rule builder |
| **DIFF-04** Customer 360 workspace | Implemented | Fields, opportunities, tasks, notes, emails, files and merged timeline on one record |
| **DIFF-05** AI intelligence dashboard | Partial | Deterministic attention list, `clef-flash` risk and priority decisions, Liner summaries |
| **DIFF-06** Industry templates | Not started | Requires a template model over objects, fields, views and pipelines |
| **DIFF-07** Unified communication timeline | Partial | Local emails plus audit and stage events; provider sync is backend-only |

### Duplicate-feature rule

Navigation must not gain parallel pages for capabilities that already exist. Leads own outreach (no
separate Inbox), Tasks own scheduling and completion (no second "My Tasks" page), Dashboards own
analytics (no separate Analytics or Reports page), Settings own administration and Liner owns AI
chat. New work extends those surfaces, and the new modules above are distinct record types rather
than copies of an existing screen.

### Next local milestones, in order

1. Quote print/PDF and tax rules on top of the shipped Products & quotes and Invoices packs (MOD-13 remainder; payments stay backend-only).
2. Multi-select and formula custom fields, plus a gallery layout (MOD-16).
3. Lead-source funnel and saved report definitions on Dashboards (MOD-10).
4. Meetings as records, and week/day views alongside the shipped Month/Agenda calendar (MOD-07 remainder).
5. Natural-language filter proposals, daily briefing and meeting-note action extraction in Liner (MOD-19).

---

# 1. AGENT ROLE AND OBJECTIVE

You are the lead AI software engineering agent responsible for planning, architecting, implementing, testing, documenting, and maintaining a modern, production-quality CRM web application.

Your responsibilities include:

- Full-stack application development
- Frontend architecture and UI/UX implementation
- Database design and migrations
- API design and backend development
- Authentication, authorization, and security
- CRM business logic and data relationships
- Workflow automation
- Third-party integrations
- AI-powered functionality
- Testing, debugging, optimization, and documentation

## 1.1 Primary Objective

Build a modern, flexible, fast, customizable, AI-powered CRM SaaS application inspired by the capabilities and user experiences of:

- Attio — flexible data model and modern CRM workflows
- HubSpot — comprehensive CRM and customer lifecycle management
- Pipedrive — visual sales pipelines and deal management
- Salesforce — advanced CRM capabilities and extensibility
- Notion — customizable data views and workspace organization
- Linear — speed, keyboard navigation, polished interactions, and productivity
- Twenty CRM — open-source CRM architecture and flexible records

Use these products as functional and UX research references only. Do not reproduce proprietary code, assets, branding, or exact interfaces.

## 1.2 Product Vision

The application must become an integrated business management system where users can:

1. Manage contacts, companies, and leads.
2. Organize sales pipelines and deals.
3. Track all customer interactions and activities.
4. Manage tasks, appointments, and calendars.
5. Connect email and communication services.
6. Automate repetitive business processes.
7. Analyze performance through reports and dashboards.
8. Collaborate with team members.
9. Customize fields, records, views, and workflows.
10. Interact with an AI assistant capable of understanding CRM data and carrying out authorized actions.
11. Manage marketing, customer support, projects, products, quotes, and billing.
12. Connect third-party applications and external services.

The application must be usable as a real product, not merely a static UI demonstration.

## 1.3 Target Users

Primary:

- Freelancers
- Small businesses
- Agencies
- Startups
- Small sales teams
- Service businesses

Secondary:

- Growing B2B teams
- Consultants
- Marketing teams
- Client service organizations

## 1.4 Development Principles

- Prioritize correct functionality over superficial visual completeness.
- Prioritize a clean, polished, highly responsive interface.
- Use modular, maintainable, strongly typed architecture.
- Avoid unnecessary infrastructure and premature microservices.
- Never implement fake buttons, nonfunctional forms, or misleading placeholder features.
- Never fabricate customer data as if it were real.
- Demo data must be explicitly labeled as demo data.
- Use persistent database-backed records.
- Implement server-side validation and authorization.
- Support future extensibility.
- Keep features integrated rather than isolated.
- Implement incrementally according to the defined phases.
- Never claim that an implementation is complete without verification.

---

# 2. REQUIREMENT PRIORITY SYSTEM

Each feature is assigned a priority.

| Priority | Meaning |
|---|---|
| P1 | Essential CRM foundation |
| P2 | Advanced product functionality |
| P3 | Differentiating or platform-expansion functionality |

Priority is not the same as implementation phase.

A module may contain P1 core capabilities and P2/P3 extensions.

## Implementation Phases

**PHASE 1 — Core Functional CRM**

Deliver a secure, fully functional CRM with essential data management, pipelines, tasks, and dashboards.

**PHASE 2 — Advanced SaaS Experience**

Add integrations, collaboration, workflow automation, customization, and advanced reporting.

**PHASE 3 — AI-Powered CRM**

Introduce AI assistance, natural-language operations, insights, and intelligent automation.

**PHASE 4 — Platform Expansion**

Add custom objects, marketing, helpdesk, projects, quotes, billing, developer APIs, and advanced administration.

Do not attempt to build every phase simultaneously.

---

# 3. TECHNOLOGY STACK

## 3.1 Preferred Technology

| Layer | Technology |
|---|---|
| Frontend | Next.js + React + TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui + Radix UI |
| Animation | Motion |
| Data Tables | TanStack Table |
| Server State | TanStack Query |
| Forms | React Hook Form |
| Validation | Zod |
| Database | PostgreSQL |
| ORM | Prisma or Drizzle |
| Authentication | Better Auth, Clerk, or Supabase Auth |
| File Storage | S3-compatible object storage |
| Charts | Recharts |
| Background Jobs | Trigger.dev or durable queue-backed workers |
| AI | Tool-calling LLM API |
| Realtime | WebSockets or managed realtime service |
| Unit Testing | Vitest |
| End-to-End Testing | Playwright |

## 3.2 Stack Rules

1. Inspect the existing repository before choosing or modifying dependencies.
2. Reuse existing functional technologies where appropriate.
3. Do not introduce multiple competing libraries that serve the same purpose.
4. Choose one ORM and one authentication solution.
5. Prefer a modular monolith with clear service boundaries.
6. Use TypeScript strict mode.
7. Store secrets only in environment variables or a secure secret manager.
8. Use database migrations for schema changes.
9. Separate UI components, business logic, and database access.
10. Never expose database credentials or AI API keys to the browser.

---

# 4. GLOBAL APPLICATION ARCHITECTURE

The CRM must use a workspace-based, multi-tenant architecture.

## 4.1 Core Hierarchy

User  
→ Workspace Membership  
→ Workspace  
→ CRM Records  
→ Activities and Related Records

One user may belong to multiple workspaces.

Each workspace contains its own:

- Members
- Contacts
- Companies
- Leads
- Pipelines
- Deals
- Tasks
- Activities
- Calendars
- Dashboards
- Custom fields
- Workflows
- Documents
- Reports
- Settings
- Connected integrations

## 4.2 Architecture Requirements

- Every workspace-owned record must be associated with a workspace ID.
- Verify workspace membership on every relevant server request.
- Enforce role and record permissions server-side.
- Prevent cross-workspace data access.
- Use consistent creation and modification timestamps.
- Track record ownership and lifecycle states.
- Use stable identifiers for records.
- Maintain referential integrity.
- Provide pagination for large datasets.
- Index commonly filtered and joined fields.
- Support optimistic UI updates only with correct error recovery.
- Record important changes in an audit trail.

---

# 5. APPLICATION NAVIGATION

The primary application should use a collapsible sidebar.

## 5.1 Navigation Structure

### WORKSPACE
- Overview
- Inbox
- Calendar
- My Tasks

### CRM
- Contacts
- Companies
- Leads
- Deals
- Projects

### GROWTH
- Campaigns
- Analytics
- Automations

### TOOLS
- AI Assistant
- Documents
- Integrations

### ADMINISTRATION
- Workspace Settings
- Team Members
- Roles and Permissions
- Custom Fields
- Custom Objects
- Pipelines
- Notifications
- Security
- Audit Logs
- Billing Settings

Navigation should respect feature availability and permissions. Unimplemented features should not appear as working destinations.

## 5.2 Global UI Components

Required:

- Collapsible sidebar
- Global header
- Breadcrumb navigation
- Command palette
- Global search
- Notification center
- Workspace switcher
- User menu
- Quick-create menu
- Responsive navigation
- Modal/dialog system
- Slide-over record panels
- Toast notifications
- Keyboard shortcut system

---

# 6. MODULE SPECIFICATIONS

Every module below defines its responsibilities, feature requirements, and relationships with other modules.

## MODULE 01 — DASHBOARD AND COMMAND CENTER

**ID:** MOD-01  
**Priority:** P1  
**Initial Phase:** 1

### Required Features

- User overview dashboard
- Workspace overview dashboard
- Total contacts KPI
- Total companies KPI
- Total active leads KPI
- Open deals KPI
- Total pipeline value
- Won revenue
- Lead conversion rate
- Deal win rate
- Upcoming tasks
- Overdue tasks
- Upcoming meetings
- Recent customer activities
- Recent deals
- Sales pipeline visualization
- Revenue trend chart
- Lead source chart
- Quick-create actions

### Advanced Features

- Customizable dashboard widgets
- Drag-and-drop widget arrangement
- Saved dashboard layouts
- Date-range selection
- User/team filtering
- Personal dashboards
- Team dashboards
- Dashboard templates
- AI-generated daily summary
- AI-generated business insights

### Business Rules

- All metrics must be calculated from real authorized records.
- Dashboard queries must respect workspace and permission boundaries.
- Revenue figures must use consistently defined deal statuses and currencies.
- Empty datasets must display meaningful empty states.
- Dashboard metrics must update when underlying records change.

### Acceptance Criteria

- Creating a new deal updates the relevant pipeline metrics.
- Marking a deal as won updates won revenue.
- Completing a task removes it from active task counts.
- Changing filters correctly updates all associated widgets.

---

## MODULE 02 — CONTACT MANAGEMENT

**ID:** MOD-02  
**Priority:** P1  
**Initial Phase:** 1

### Core Features

- Create contacts
- View contacts
- Edit contacts
- Archive/delete contacts
- Search contacts
- Filter contacts
- Sort contacts
- Paginate contacts
- Bulk select and edit
- Contact import from CSV
- Contact export to CSV
- Duplicate detection
- Contact ownership
- Custom tags
- Contact statuses
- Lifecycle stages
- Profile notes
- Attachments
- Activity history
- Associated companies
- Associated deals
- Associated tasks
- Associated meetings

### Default Fields

- ID
- Workspace ID
- First name
- Last name
- Display name
- Primary email
- Additional emails
- Primary phone
- Additional phone numbers
- Job title
- Department
- Company relationship
- Website
- LinkedIn URL
- Other social URLs
- Address
- City
- Region
- Country
- Time zone
- Lifecycle stage
- Status
- Source
- Assigned owner
- Tags
- Description
- Created at
- Updated at
- Archived at

### Advanced Features

- Multiple company relationships
- Contact relationship mapping
- Organization charts
- Interaction history
- Relationship strength indicators
- AI-generated contact summaries
- Contact data enrichment
- Suggested duplicate merging
- Custom contact fields

### Related Modules

- Companies
- Leads
- Deals
- Tasks
- Calendar
- Communication
- AI Assistant

---

## MODULE 03 — COMPANY AND ACCOUNT MANAGEMENT

**ID:** MOD-03  
**Priority:** P1  
**Initial Phase:** 1

### Core Features

- Company CRUD
- Company list/table
- Company detail pages
- Company logos
- Company websites
- Industry classification
- Company size
- Revenue information
- Location and addresses
- Assigned account owner
- Company status
- Tags
- Notes
- Associated contacts
- Associated deals
- Associated tasks
- Activity timeline
- Attachments
- Company search/filter/sort
- CSV import/export

### Advanced Features

- Parent and subsidiary relationships
- Company hierarchy visualization
- Account segmentation
- Account tiers
- Account health scores
- AI company research
- Company enrichment
- Linked quotes and invoices

### Important Rule

A company must be able to have multiple contacts, deals, activities, and projects.

Deleting or archiving a company must not unintentionally destroy unrelated records.

---

## MODULE 04 — LEAD MANAGEMENT

**ID:** MOD-04  
**Priority:** P1  
**Initial Phase:** 1

### Core Features

- Manual lead creation
- Lead table
- Lead detail view
- Lead editing
- Lead status tracking
- Lead ownership
- Lead source tracking
- Lead priority
- Lead qualification fields
- Lead tags
- Lead notes
- Lead activities
- Lead search/filter/sort
- Duplicate detection
- Lead-to-contact conversion
- Lead-to-company association
- Lead-to-deal conversion
- Lead aging indicators

### Default Lead Stages

1. New
2. Contacted
3. Qualified
4. Unqualified
5. Converted

Stages should eventually be customizable.

### Advanced Features

- Website lead capture forms
- Public lead capture API
- Automated lead assignment
- Round-robin lead routing
- Rule-based lead scoring
- AI lead scoring
- Lead nurturing sequences
- Inactivity notifications
- Lead enrichment
- Lead-source analytics

### Conversion Requirements

When a lead is converted:

- Create or associate the relevant contact.
- Optionally create or associate a company.
- Optionally create a deal.
- Preserve the original lead's history.
- Avoid duplicate record creation.
- Maintain references to the converted records.
- Execute conversion as an authorized, consistent operation.

---

## MODULE 05 — SALES PIPELINE AND DEAL MANAGEMENT

**ID:** MOD-05  
**Priority:** P1  
**Initial Phase:** 1

### Core Features

- Create deals
- Edit deals
- Archive/delete deals
- Deal detail page
- Kanban pipeline view
- Table view
- Drag-and-drop stages
- Customizable pipelines
- Customizable pipeline stages
- Deal value
- Deal currency
- Deal probability
- Expected close date
- Actual close date
- Assigned deal owner
- Associated company
- Associated contacts
- Deal tags
- Deal priority
- Deal notes
- Deal attachments
- Deal activities
- Deal tasks
- Won/lost status
- Lost reason
- Deal search/filter/sort

### Suggested Default Pipeline

1. New Opportunity
2. Qualified
3. Discovery
4. Proposal
5. Negotiation
6. Won
7. Lost

### Advanced Features

- Multiple sales pipelines
- Drag-and-drop stage configuration
- Deal aging indicators
- Stalled deal detection
- Weighted pipeline forecasting
- Deal timeline
- Team deal collaboration
- Deal splits
- Products and deal line items
- Revenue forecasting
- AI deal insights
- AI next-action suggestions

### Business Rules

- Deal stage movements must persist immediately.
- Failed updates must revert optimistic UI changes.
- Stage changes should generate activities.
- Won deals should record a close date.
- Lost deals may require a lost reason.
- Deal revenue must not be double-counted.
- Forecast metrics must have documented formulas.

### Acceptance Criteria

- Dragging a deal into another stage updates the database.
- Refreshing the browser preserves the updated stage.
- Deal metrics update after creation, editing, and closure.
- Users cannot move deals they lack permission to edit.

---

## MODULE 06 — TASK AND ACTIVITY MANAGEMENT

**ID:** MOD-06  
**Priority:** P1  
**Initial Phase:** 1

### Core Features

- Task CRUD
- Task assignment
- Task priorities
- Task statuses
- Due dates
- Task reminders
- Task descriptions
- Checklists
- Task association with contacts, companies, leads, and deals
- Activity logging
- Call activities
- Meeting activities
- Email activities
- Notes
- Comments
- Attachments
- My Tasks
- Today
- Upcoming
- Overdue
- Completed

### Advanced Features

- Recurring tasks
- Subtasks
- Task dependencies
- Calendar task view
- Kanban task view
- Time tracking
- Automation-generated tasks
- AI task suggestions

### Task Statuses

- Todo
- In Progress
- Blocked
- Completed
- Canceled

### Business Rules

- Completed tasks remain in history.
- Task assignment respects workspace membership.
- Reminders must be processed through reliable background jobs.
- Activity timestamps must use timezone-aware storage.
- Tasks must display correctly in the user's selected time zone.

---

## MODULE 07 — CALENDAR AND MEETING SCHEDULER

**ID:** MOD-07  
**Priority:** P2  
**Initial Phase:** 2

### Features

- Day view
- Week view
- Month view
- Agenda view
- Create/edit meetings
- Meeting participants
- Contact associations
- Deal associations
- Meeting descriptions
- Meeting reminders
- Availability scheduling
- Time-zone support
- Booking links
- Google Calendar integration
- Outlook Calendar integration
- Two-way calendar synchronization
- Meeting agendas
- Meeting notes
- Meeting transcripts
- AI meeting summaries
- AI action item extraction
- Team round-robin booking

### Integration Rules

- Use secure OAuth.
- Request minimum necessary scopes.
- Store credentials securely.
- Handle revoked connections.
- Prevent duplicate events during synchronization.
- Handle conflicting updates through an explicit sync policy.
- Provide a way to disconnect integrations.

---

## MODULE 08 — EMAIL AND COMMUNICATION HUB

**ID:** MOD-08  
**Priority:** P2  
**Initial Phase:** 2

### Features

- Connect Gmail
- Connect Microsoft Outlook
- Two-way email sync
- Send email
- Reply to email
- Forward email
- Email conversation threading
- Shared inbox
- Contact-linked email history
- Email templates
- Email signatures
- Scheduled sending
- Email sequences
- Automated follow-ups
- Internal team notes
- Email search
- Email filters
- Message attachments
- AI email drafts
- AI reply suggestions
- AI email summaries
- Optional engagement tracking

### Future Channels

- SMS
- WhatsApp Business
- Phone calls
- VoIP
- Call transcription

### Security and Privacy Rules

- Only synchronize authorized accounts.
- Apply provider-specific permission and data-use restrictions.
- Clearly identify externally sent communications.
- Never send an email from an AI suggestion without authorization.
- Protect access tokens.
- Respect consent and unsubscribe requirements where applicable.
- Allow users to disconnect communication providers.

---

## MODULE 09 — WORKFLOW AUTOMATION ENGINE

**ID:** MOD-09  
**Priority:** P2  
**Initial Phase:** 2

### Objective

Implement an extensible workflow automation system.

### Workflow Structure

TRIGGER  
→ CONDITIONS  
→ ACTIONS  
→ RESULT

### Trigger Examples

- Contact created
- Contact updated
- Lead created
- Lead qualified
- Deal created
- Deal stage changed
- Deal marked won
- Deal marked lost
- Task overdue
- Meeting scheduled
- Form submitted
- Email received
- Scheduled date/time reached
- Webhook received

### Condition Examples

- Field equals value
- Field does not equal value
- Number greater than value
- Number less than value
- Date before/after
- Record has tag
- Record owner matches
- AND
- OR
- NOT

### Action Examples

- Create task
- Assign record
- Update field
- Add tag
- Create activity
- Send notification
- Send authorized email
- Create deal
- Move pipeline stage
- Wait/delay
- Call external webhook
- Execute approved AI analysis

### Advanced Features

- Visual node editor
- Branching conditions
- Delay nodes
- Scheduled triggers
- Workflow templates
- Execution logs
- Workflow versions
- Retries
- Failure handling
- Test mode
- Draft/published status
- AI workflow builder

### Reliability Requirements

- Use persistent execution state.
- Prevent accidental duplicate processing.
- Use bounded retries and backoff.
- Prevent uncontrolled automation loops.
- Log failures with actionable messages.
- Respect user permissions.
- Support pausing/disabling workflows.
- Provide a workflow execution history interface.

---

## MODULE 10 — ANALYTICS AND REPORTING

**ID:** MOD-10  
**Priority:** P2  
**Initial Phase:** 1 (basic), 2 (advanced)

### Features

- Sales overview
- Pipeline value
- Won revenue
- Lead conversion rate
- Deal win rate
- Sales velocity
- Lead source reporting
- Deal stage distribution
- Sales funnel
- Lost deal analysis
- Activity performance
- Team performance
- Pipeline forecasting
- Revenue trends
- Custom date ranges
- Filterable reports
- Custom report builder
- Saved reports
- Scheduled reports
- CSV export
- PDF export
- AI-generated insights
- Natural-language report generation

### Data Requirements

- Never fabricate analytics.
- Define reporting formulas.
- Handle multiple currencies explicitly.
- Use consistent time boundaries.
- Respect permissions.
- Handle empty or incomplete datasets correctly.

---

## MODULE 11 — MARKETING AND CAMPAIGN MANAGEMENT

**ID:** MOD-11  
**Priority:** P2  
**Initial Phase:** 4

### Features

- Marketing lists
- Contact segmentation
- Campaign CRUD
- Email campaign builder
- Email templates
- Campaign scheduling
- Audience targeting
- Automated nurture sequences
- Landing page builder
- Lead capture forms
- UTM tracking
- Lead attribution
- Campaign analytics
- A/B testing
- Email consent status
- Unsubscribe handling
- Optional Google Ads integration
- Optional Meta Ads integration
- AI copywriting assistant
- AI campaign suggestions

### Business Rules

- Respect contact opt-in/opt-out preferences.
- Implement suppression lists.
- Never send prohibited or unauthorized marketing emails.
- Separate transactional from marketing communications.
- Avoid inflated campaign metrics.

---

## MODULE 12 — CUSTOMER SUPPORT AND HELPDESK

**ID:** MOD-12  
**Priority:** P2  
**Initial Phase:** 4

### Features

- Ticket CRUD
- Ticket inbox
- Ticket statuses
- Ticket priorities
- Ticket categories
- Ticket owners
- Contact associations
- Company associations
- Ticket activity timeline
- Internal comments
- Attachments
- Saved replies
- Ticket assignment
- Routing automation
- SLA rules
- Escalation rules
- Knowledge base
- Customer satisfaction surveys
- Support analytics
- AI ticket categorization
- AI response suggestions

### Suggested Ticket Statuses

- Open
- In Progress
- Waiting on Customer
- Resolved
- Closed

---

## MODULE 13 — PRODUCTS, QUOTES, AND BILLING

**ID:** MOD-13  
**Priority:** P2  
**Initial Phase:** 4

### Features

- Product/service catalog
- Product categories
- Price lists
- Deal products
- Quantity and pricing
- Discounts
- Taxes
- Quotes
- Proposals
- Quote templates
- Quote approval
- Quote PDF export
- Quote sharing
- Invoice generation
- Invoice statuses
- Payment status tracking
- Recurring billing
- Subscription records
- Payment reminders
- Revenue summaries
- Stripe integration
- Razorpay integration
- Optional e-signature integration

### Financial Rules

- Store monetary values using precise decimal or minor-unit representations.
- Avoid floating-point money calculations.
- Record currency explicitly.
- Calculate taxes correctly according to configured rules.
- Treat third-party payment notifications as untrusted until verified.
- Avoid storing sensitive payment card details directly.

---

## MODULE 14 — PROJECT AND CLIENT MANAGEMENT

**ID:** MOD-14  
**Priority:** P2  
**Initial Phase:** 4

### Features

- Create projects
- Convert won deals into projects
- Associate projects with customers
- Project owners
- Project statuses
- Project milestones
- Tasks and subtasks
- Project Kanban boards
- Project timelines
- Deadline tracking
- Progress tracking
- File attachments
- Team comments
- Time tracking
- Budget tracking
- Deliverable tracking
- Optional client portal

### Workflow Example

Deal marked Won  
→ User confirms project creation  
→ Project generated  
→ Linked to company/contact  
→ Tasks and milestones initialized

---

## MODULE 15 — TEAMS AND COLLABORATION

**ID:** MOD-15  
**Priority:** P2  
**Initial Phase:** 1 (foundations), 2 (advanced)

### Features

- Workspace creation
- Workspace switching
- Team invitations
- Member management
- Workspace roles
- Role-based permissions
- Record ownership
- Shared records
- Private records where supported
- Mentions
- Comments
- Team notifications
- Shared filtered views
- Team dashboards
- Assignment queues
- Workload management
- Sales goals
- Team performance
- Realtime presence
- Activity audit history

### Initial Roles

- Owner
- Admin
- Member
- Viewer

### Rules

- Only authorized users can invite members.
- Owners and administrators can manage permissions according to role policy.
- Viewer roles cannot modify records.
- Permissions must be enforced on the server.
- Workspace owners must not be accidentally locked out.
- Member removal must revoke access.

---

## MODULE 16 — CUSTOMIZATION AND WORKSPACE BUILDER

**ID:** MOD-16  
**Priority:** P3  
**Initial Phase:** 2 (custom fields), 4 (custom objects)

### Features

- Custom fields
- Text fields
- Number fields
- Currency fields
- Boolean fields
- Date fields
- Single-select fields
- Multi-select fields
- Email fields
- URL fields
- Phone fields
- Relationship fields
- Formula fields
- Required fields
- Field validation
- Custom objects
- Custom object relationships
- Custom record layouts
- Custom table columns
- Custom filters
- Custom sorting
- Custom grouping
- Saved views
- Table view
- Kanban view
- Calendar view
- Gallery view
- Dashboard builder
- Form builder
- Industry templates
- Workspace branding

### Custom Object Examples

- Properties
- Vendors
- Assets
- Contracts
- Inventory Items
- Partnerships

### Architecture Requirement

Custom objects must use a generalized, validated metadata model rather than requiring source-code changes for each new object.

Field permissions, validation, filtering, indexing strategy, and object relationships must be considered during design.

---

## MODULE 17 — INTEGRATIONS AND DEVELOPER PLATFORM

**ID:** MOD-17  
**Priority:** P3  
**Initial Phase:** 2 (specific integrations), 4 (platform)

### Integrations

- Gmail
- Google Calendar
- Microsoft Outlook
- Microsoft Calendar
- Slack
- Zoom
- Stripe
- Razorpay
- Zapier
- Make
- n8n

### Developer Features

- Versioned REST API
- API documentation
- Workspace-scoped API access
- API keys or OAuth credentials
- Credential scopes
- Rate limiting
- Request validation
- Webhook subscriptions
- Webhook event types
- Webhook signing
- Webhook retries
- Integration logs
- Integration health
- API usage reporting
- CSV import/export
- Data migration tools

### Rules

- Never expose integration secrets to the frontend.
- Support credential revocation.
- Validate webhook signatures.
- Use secure token storage.
- Maintain reliable integration error reporting.

---

## MODULE 18 — SECURITY AND ADMINISTRATION

**ID:** MOD-18  
**Priority:** P1  
**Initial Phase:** 1 (core), 4 (advanced)

### Essential Security

- Secure authentication
- Protected routes
- Session management
- Workspace isolation
- Role-based authorization
- Record-level authorization where applicable
- Input validation
- Output sanitization
- Rate limiting
- Secure file uploads
- Secure secret storage
- Server-side permission checks
- Audit logging
- HTTPS in deployment
- Data backups
- Recovery documentation

### Advanced Security

- Multi-factor authentication
- Single sign-on
- Session/device management
- Custom permission policies
- Security activity dashboards
- Data retention settings
- Data deletion/export workflows
- Advanced audit trails
- Enterprise security policies

### Mandatory Rules

- Never trust workspace IDs supplied by the client without authorization checks.
- Never rely solely on hidden UI elements for permission enforcement.
- Never commit secrets.
- Never allow unrestricted file uploads.
- Protect against common web vulnerabilities.
- Do not claim legal or regulatory compliance without actually satisfying the applicable requirements.

---

## MODULE 19 — AI ASSISTANT AND INTELLIGENT AGENTS

**ID:** MOD-19  
**Priority:** P3  
**Initial Phase:** 3

### Objective

Implement a contextual AI copilot that can securely understand authorized CRM data, answer questions, generate insights, and perform approved actions.

### AI Capabilities

#### A. Natural-Language CRM Search

Example:

"Show all deals over $5,000 without activity for 14 days."

Expected behavior:

1. Understand the intent.
2. Resolve workspace context.
3. Check permissions.
4. Translate the request into validated filters.
5. Query authorized records.
6. Return accurate results.
7. Display links to matching records.

#### B. Natural-Language Actions

Example:

"Create a follow-up task for Sarah tomorrow."

Expected behavior:

1. Identify the requested action.
2. Resolve the referenced contact.
3. Ask for disambiguation if necessary.
4. Resolve the date and timezone.
5. Show the intended action if confirmation is required.
6. Execute an authorized server-side tool.
7. Display the result.

#### C. AI Contact Summaries

- Summarize authorized contact information.
- Summarize relationship history.
- Extract notable activity.
- Highlight unresolved tasks.
- Identify missing information.

#### D. AI Email Assistant

- Draft emails
- Rewrite emails
- Suggest replies
- Summarize conversations
- Personalize outreach
- Generate follow-up messages

#### E. AI Meeting Intelligence

- Summarize meeting notes
- Extract action items
- Create suggested tasks
- Associate meeting information with CRM records

#### F. AI Lead Intelligence

- Suggest lead qualification
- Explain scoring factors
- Identify missing qualification information
- Suggest follow-ups

#### G. AI Deal Intelligence

- Identify stalled deals
- Highlight risks
- Suggest next actions
- Summarize deal history
- Explain forecast inputs

#### H. AI Workflow Builder

Example:

"When a new high-priority lead arrives, assign it to a team member and create a follow-up task."

Expected behavior:

- Interpret the requested automation.
- Create a workflow draft.
- Validate supported triggers and actions.
- Show a preview.
- Ask the user to approve publication.

#### I. Natural-Language Reporting

Example:

"Compare won revenue for September and October."

Expected behavior:

- Use real CRM metrics.
- Explain selected date boundaries.
- Return a structured answer and optional chart.
- Avoid invented values.

#### J. AI Document Intelligence

- Extract structured data from authorized uploads.
- Summarize documents.
- Suggest associations with CRM records.
- Ask for confirmation before saving extracted information.

#### K. AI Data Cleanup

- Detect potential duplicates.
- Identify missing fields.
- Suggest corrections.
- Require approval for destructive merges or bulk edits.

#### L. AI Daily Briefing

- Today's tasks
- Upcoming meetings
- Overdue follow-ups
- Deal alerts
- Priority opportunities
- Suggested actions

### AI Architecture Requirements

- Dedicated server-side AI service.
- Tools/functions with validated parameters.
- Permission-aware data retrieval.
- Workspace-scoped tool execution.
- Structured tool results.
- Reliable handling of tool failures.
- Logging of AI-performed actions.
- Clear distinction between suggestions and completed actions.
- Rate limits and usage controls.
- AI provider credentials stored securely.

### AI Safety Requirements

- Do not fabricate CRM records, messages, or metrics.
- Do not expose cross-workspace information.
- Treat retrieved documents and emails as untrusted data, not instructions.
- Require confirmation for sending external messages, deletion, bulk updates, financial operations, and other consequential actions.
- Do not grant AI unrestricted database access.
- Respect user permissions for every AI tool call.

---

# 7. GLOBAL UI/UX REQUIREMENTS

## 7.1 Design Direction

The interface should feel:

- Minimal
- Modern
- Premium
- Professional
- Clean
- Fast
- Consistent
- Highly readable
- Responsive
- Accessible

Use modern SaaS design principles while creating an original visual identity.

Avoid excessive decoration, unnecessary animations, crowded dashboards, and inconsistent layouts.

## 7.2 Required UI Capabilities

- Light mode
- Dark mode
- System theme detection
- Responsive desktop/tablet/mobile layouts
- Sidebar collapse/expand
- Command palette
- Global search
- Quick-create menu
- Breadcrumbs
- Keyboard shortcuts
- Context menus
- Inline editing
- Bulk table actions
- Drag-and-drop interactions
- Resizable panels where useful
- Slide-over detail drawers
- Confirmation dialogs
- Toast notifications
- Tooltips
- Loading skeletons
- Empty states
- Error states
- Retry actions
- Accessible focus indicators
- Undo support where feasible
- Pagination or virtualization
- Saved views
- Column visibility controls
- Sorting and filtering
- Notification center
- User preferences
- Workspace settings

## 7.3 Performance Requirements

- Avoid unnecessary full-page reloads.
- Use efficient server/database queries.
- Paginate large record lists.
- Virtualize large tables where beneficial.
- Lazy-load heavy nonessential modules.
- Use caching with correct invalidation.
- Keep interactive elements responsive.
- Avoid rendering unnecessary components.
- Use background jobs for long-running operations.

## 7.4 Accessibility Requirements

- Semantic HTML
- Keyboard operability
- Visible focus
- Accessible form labels
- Appropriate contrast
- Screen reader-friendly controls
- Accessible dialog behavior
- Reduced-motion support
- Do not rely exclusively on color to convey information.

---

# 8. SEVEN MAJOR PRODUCT DIFFERENTIATORS

These features should receive special design and engineering attention.

## DIFF-01 — Universal Command Center

Combine:

- Navigation search
- Record search
- Quick actions
- Record creation
- Keyboard shortcuts
- AI commands

## DIFF-02 — Visual Automation Studio

Provide:

- Node-based editor
- Triggers
- Conditions
- Actions
- Branches
- Delays
- Execution history
- Testing
- Error handling

## DIFF-03 — Custom Object Builder

Allow users to create:

- Custom object types
- Custom fields
- Relationships
- Record views
- Validation rules
- Custom layouts

## DIFF-04 — Customer 360° Workspace

Display in one customer profile:

- Contact details
- Company details
- Deals
- Tasks
- Emails
- Meetings
- Notes
- Files
- Activities
- AI summaries

## DIFF-05 — AI Intelligence Dashboard

Provide:

- Pipeline risks
- Stalled deal alerts
- Lead quality insights
- Inactivity detection
- Forecast explanations
- Suggested next actions

## DIFF-06 — Industry Templates

Prepare workspace templates for:

- Freelancers
- Agencies
- Startups
- Real estate
- Service businesses

Each template may configure:

- Pipelines
- Stages
- Custom fields
- Saved views
- Dashboard layouts
- Workflow templates

## DIFF-07 — Unified Communication Timeline

Associate authorized communication activity with:

- Contacts
- Companies
- Leads
- Deals

Avoid duplicate activity entries and respect provider permissions.

---

# 9. CORE DATABASE MODEL

The exact schema must be designed during implementation.

At minimum, plan for the following entities.

## 9.1 Identity and Workspaces

- User
- Workspace
- WorkspaceMembership
- WorkspaceInvitation
- Role
- Permission
- UserPreference
- WorkspaceSetting
- Session

## 9.2 CRM Entities

- Contact
- ContactEmail
- ContactPhone
- ContactCompanyRelationship
- Company
- CompanyRelationship
- Lead
- LeadConversion
- Pipeline
- PipelineStage
- Deal
- DealContactRelationship
- DealStageHistory
- Tag
- RecordTag
- CustomFieldDefinition
- CustomFieldValue

## 9.3 Productivity Entities

- Task
- TaskChecklistItem
- Activity
- Note
- Comment
- Attachment
- Notification
- Meeting
- CalendarConnection

## 9.4 Automation Entities

- Workflow
- WorkflowVersion
- WorkflowTrigger
- WorkflowExecution
- WorkflowExecutionStep
- WorkflowLog

## 9.5 Extended Modules

- Campaign
- CampaignMember
- SupportTicket
- TicketComment
- Product
- PriceList
- Quote
- QuoteLineItem
- Invoice
- PaymentRecord
- Project
- ProjectMilestone
- ProjectTask
- Document

## 9.6 Developer and Administration Entities

- IntegrationConnection
- WebhookEndpoint
- WebhookDelivery
- ApiCredential
- AuditLog
- SavedView
- Dashboard
- DashboardWidget
- CustomObjectDefinition
- CustomRecord
- AIConversation
- AIMessage
- AIActionLog

## 9.7 Database Rules

- Use stable IDs.
- Define foreign keys and indexes.
- Use appropriate delete/archive strategies.
- Track created/updated timestamps.
- Track record ownership where needed.
- Use workspace scoping.
- Define unique constraints.
- Preserve important history.
- Implement migrations.
- Avoid destructive cascading deletes.
- Use database transactions for multi-record operations.
- Avoid unrestricted polymorphic foreign keys without appropriate integrity safeguards.

---

# 10. CORE BUSINESS FLOWS

## FLOW-01 — Lead to Customer

1. User creates or captures lead.
2. Lead is assigned an owner.
3. Lead is qualified.
4. Lead is converted to contact/company.
5. Optional deal is created.
6. Deal progresses through stages.
7. Deal is marked won.
8. Customer relationship continues.
9. Activity history is preserved.

## FLOW-02 — Contact Follow-Up

1. User opens contact.
2. User views communication history.
3. User creates follow-up task.
4. Task appears in My Tasks.
5. Reminder is delivered when due.
6. User completes task.
7. Activity history is updated.

## FLOW-03 — Sales Pipeline

1. User creates deal.
2. Deal is assigned a pipeline and stage.
3. Deal appears in Kanban view.
4. User drags deal to another stage.
5. Backend validates and saves change.
6. Stage history is recorded.
7. Dashboard metrics update.
8. Relevant workflows execute.

## FLOW-04 — Automation

1. User creates workflow.
2. User selects trigger.
3. User configures conditions.
4. User configures actions.
5. Workflow is validated.
6. Workflow is published.
7. Trigger event occurs.
8. Worker executes workflow.
9. Execution result is recorded.
10. User can inspect logs.

## FLOW-05 — AI Action

1. User submits natural-language request.
2. AI identifies intent.
3. System validates user/workspace context.
4. AI selects an allowed tool.
5. Tool validates parameters and permissions.
6. System requests approval where required.
7. Tool performs action.
8. Database and audit history update.
9. AI reports actual result.

---

# 11. FEATURE DELIVERY ROADMAP

## PHASE 1 — CORE FUNCTIONAL CRM

### Deliverables

- Application structure
- Authentication
- Workspace creation
- Basic roles and permissions
- Database schema
- Contacts CRUD
- Companies CRUD
- Leads CRUD
- Lead conversion
- Pipelines and stages
- Deals CRUD
- Kanban pipeline
- Tasks CRUD
- Activities
- Dashboard with real metrics
- Basic analytics
- Global search
- Filters and sorting
- CSV import/export
- Light/dark mode
- Responsive interface
- Error handling
- Audit foundations
- Tests

### Phase 1 Completion Definition

A user can securely sign in, create a workspace, add leads/contacts/companies, manage deals, move deals through a pipeline, create and complete tasks, view related activities, and see accurate dashboard changes.

All records persist after refresh.

---

## PHASE 2 — ADVANCED SAAS

### Deliverables

- Advanced team collaboration
- Google Calendar integration
- Outlook Calendar integration
- Gmail integration
- Outlook email integration
- Meeting scheduler
- Notifications
- Recurring tasks
- Custom fields
- Saved views
- Workflow automation engine
- Visual workflow builder
- Advanced reporting
- Dashboard customization
- Onboarding improvements
- Keyboard shortcuts
- Integration error handling

### Phase 2 Completion Definition

Users can collaborate within workspaces, connect supported external services, create automations, customize record views, and access meaningful reports.

---

## PHASE 3 — AI-POWERED CRM

### Deliverables

- AI assistant interface
- Secure CRM retrieval tools
- Natural-language record search
- Natural-language task creation
- Contact summaries
- Deal summaries
- Email drafting
- Meeting summarization
- Lead insights
- Deal risk insights
- AI dashboard briefing
- AI workflow drafting
- Natural-language reports
- AI action approvals
- AI action logs
- AI-specific testing

### Phase 3 Completion Definition

The assistant can answer grounded questions using authorized CRM data and perform approved actions with visible, verifiable results.

---

## PHASE 4 — PLATFORM EXPANSION

### Deliverables

- Custom objects
- Custom relationships
- Custom layouts
- Advanced workspace templates
- Marketing campaigns
- Customer support tickets
- Project management
- Product catalog
- Quotes and proposals
- Invoices
- Payment integrations
- Client portal
- Public API
- Webhooks
- Developer documentation
- Advanced security
- Advanced administration

### Phase 4 Completion Definition

The CRM functions as an extensible business platform with integrated customer lifecycle operations.

---

# 12. REQUIRED TESTING STRATEGY

## 12.1 Unit Tests

Test:

- Validation
- Financial calculations
- Deal probability calculations
- Lead conversion logic
- Permission logic
- Workflow conditions
- Utility functions

## 12.2 Integration Tests

Test:

- Database operations
- Workspace isolation
- Authentication
- API authorization
- Deal stage changes
- Contact-to-company relationships
- Task-to-deal relationships
- Workflow execution
- Integration synchronization

## 12.3 End-to-End Tests

Test:

- User signs in
- Workspace creation
- Contact creation
- Company creation
- Lead creation
- Lead conversion
- Deal creation
- Pipeline drag-and-drop
- Task completion
- Dashboard updates
- Search/filter operations
- Unauthorized access prevention

## 12.4 AI Tests

Test:

- Accurate record retrieval
- Permission boundaries
- Ambiguous contact names
- Date and timezone interpretation
- Tool validation
- Approval requirements
- Hallucination resistance
- Malicious instructions inside retrieved data
- Tool failure recovery
- Correct audit logging

---

# 13. DEFINITION OF DONE

A feature is only considered complete when:

- UI is implemented.
- Backend logic is implemented.
- Database integration works.
- Data persists correctly.
- Forms validate input.
- Server authorization is enforced.
- Loading states exist.
- Empty states exist.
- Errors are handled.
- Success feedback exists.
- Responsive behavior is verified.
- Accessibility is considered.
- Relevant tests are implemented.
- Relevant tests pass.
- Existing features remain functional.
- Documentation is updated.

Do not mark partially connected mock interfaces as completed features.

---

# 14. AGENT DEVELOPMENT WORKFLOW

For each implementation task:

### STEP 1 — Inspect

- Read the existing codebase.
- Identify current functionality.
- Review the architecture.
- Identify affected files.
- Identify dependencies.
- Identify relevant database models.

### STEP 2 — Plan

Create an implementation plan describing:

- Goal
- Files/modules affected
- Data changes
- API changes
- UI changes
- Security implications
- Dependencies
- Testing approach

### STEP 3 — Implement

- Follow existing project patterns.
- Keep components modular.
- Implement backend and frontend together.
- Avoid placeholder implementations.
- Avoid unnecessary abstractions.
- Keep code maintainable.

### STEP 4 — Validate

- Run type checking.
- Run linting.
- Run relevant tests.
- Test database operations.
- Test security boundaries.
- Test important interactions.
- Fix discovered failures.

### STEP 5 — Report

After each completed task, report:

1. What was implemented.
2. Files changed.
3. Database/API changes.
4. Tests performed.
5. Results.
6. Remaining limitations.
7. Recommended next implementation step.

Never claim a test passed if it was not executed.

---

# 15. AGENT IMPLEMENTATION RULES

These rules apply throughout development.

1. Do not build all 19 modules in one implementation pass.
2. Start with Phase 1.
3. Implement dependencies before dependent features.
4. Never modify unrelated code unnecessarily.
5. Do not overwrite existing functional implementations without a reason.
6. Do not add meaningless mock functionality.
7. Do not hardcode business records.
8. Do not use localStorage as the primary CRM database.
9. Never expose secrets.
10. Validate all untrusted input.
11. Implement authorization on the server.
12. Preserve database integrity.
13. Ensure changes persist.
14. Maintain consistent UI patterns.
15. Prefer reusable components where reuse is justified.
16. Avoid excessive abstraction.
17. Document significant design decisions.
18. Use secure defaults.
19. Handle errors explicitly.
20. Test before declaring completion.
21. Do not introduce paid services without documenting the need and alternative.
22. Do not automatically send external communications.
23. Do not execute destructive operations without appropriate safeguards.
24. Do not silently invent requirements when a major architectural decision is unclear.
25. Keep the project extensible for future modules.

---

# 16. INITIAL IMPLEMENTATION INSTRUCTIONS

When this specification is provided to the coding agent:

## First Action

Inspect the existing repository.

Determine:

- Framework and dependencies
- Current folder structure
- Existing functionality
- Existing database configuration
- Authentication status
- Design system status
- Tests and tooling
- Missing prerequisites

If the repository is empty, prepare a clean project foundation using the preferred technology stack.

If code already exists, adapt the implementation to the current architecture wherever reasonable.

## Second Action

Create or update:

- Project architecture documentation
- Database schema plan
- Route and navigation map
- Phase 1 implementation checklist
- Security and authorization model
- Test plan

## Third Action

Identify the first implementable Phase 1 milestone.

Suggested build order:

1. Project structure and development tooling
2. Authentication and workspace model
3. Authorization and security foundations
4. Application shell and navigation
5. Contacts management
6. Companies management
7. Leads management
8. Pipeline and stage configuration
9. Deal management and Kanban board
10. Tasks and activities
11. Dashboard metrics
12. Global search and filters
13. CSV import/export
14. Testing and stabilization

## Fourth Action

Implement the first milestone, validate it, and report actual results.

Continue incrementally while respecting the overall architecture and requirements.

Do not treat this document as authorization to deploy, purchase services, send communications, or perform destructive actions outside the development environment.

---

# 17. FINAL PRODUCT QUALITY GOAL

The finished CRM should demonstrate:

- Professional full-stack engineering
- Strong database architecture
- Excellent frontend design
- Consistent and fast interactions
- Real business workflows
- Reliable data relationships
- Correct authentication and permissions
- Customization and extensibility
- Meaningful workflow automation
- Practical AI integration
- Comprehensive testing
- Production-oriented development practices

The ultimate goal is not to create the CRM with the largest number of features.

The goal is to create a coherent, powerful, reliable, highly polished CRM where all features work together naturally.

**END OF MASTER SPECIFICATION — VERSION 1.0**


VERY IMPORTANT: ANYTHING REQUIRING BACKEND/APIs, dont setup the backend and just setup as much as you can without the backend part and add a text saying it requires backend which wont be used since this is a personal project. 