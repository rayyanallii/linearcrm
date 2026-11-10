# Linear CRM — Landing Page Plan

**Goal:** a production-grade marketing site for a local-first CRM. It should read as a real product, explain the honest boundary (no backend), and send every visitor into a working workspace.

**Audience:** founders, two-person studios, solo operators and small sales teams who have outgrown a spreadsheet but do not want a six-week CRM rollout.

**Positioning:** the CRM that keeps the customer record in one place and gets out of the way. Fast, local-first, no account, no setup maze.

**What success means:** a visitor understands what the product does in ten seconds, sees it working in thirty, and can name the trade-offs before they click. Every navigation link resolves to a real page with its own content.

---

## 1. Page architecture

The site is static HTML with one shared React bundle. Each page has its own file, title, description and canonical path.

| Path | Page | Job |
| --- | --- | --- |
| `index.html` | Home | Positioning, product proof, platform tour, assistant, use cases, pricing, FAQ, final CTA |
| `platform.html` | Platform overview | The connected system: pipeline, records, workflows, forecast, context. Links to every platform detail page |
| `platform-pipeline.html` | Pipeline | Kanban, focus mode, stage ageing, next steps |
| `platform-workflows.html` | Workflows | Triggers, conditions, actions, run log, honest limits |
| `platform-liner.html` | Liner | Workspace assistant, local answers, optional external model |
| `platform-forecast.html` | Forecast | Weighted pipeline, coverage by stage, period switching |
| `platform-context.html` | Universal context | Record timeline, linked records, activity log |
| `product.html` | Product tour | The record as the centre of the product |
| `product-data-model.html` | Data model | Objects, typed fields, custom objects, relations |
| `product-record-moves.html` | Record moves | Convert a lead without losing history |
| `product-saved-views.html` | Saved views | Filters, sorts, layout, persistence |
| `resources.html` | Resources hub | Storage, portability, keyboard, assistant, FAQ |
| `resources-local-first.html` | Local-first | Where data lives, what leaves the browser |
| `resources-import-export.html` | Import & export | CSV in, CSV out, JSON backup |
| `resources-backup.html` | Backup & restore | One-file snapshot, restore, danger cases |
| `resources-keyboard.html` | Keyboard | Command menu, shortcuts, focus behaviour |
| `customers.html` | Use cases | Founder-led sales, studio, solo operator. No invented logos |
| `pricing.html` | Pricing | $0 plan, included and not included, honest boundary |
| `app.html` | Workspace | The product itself |

### Navigation

- **Platform** opens a three-column mega menu: Context, Orchestration, Ecosystem. Every item links to its own page, not to an anchor on a shared page.
- **Product**, **Resources**, **Use cases**, **Pricing** are top-level pages.
- **Open the CRM** is the primary action in the header on every page.
- Mobile uses a full-height sheet with grouped links; no horizontal scroll.
- Footer repeats the full sitemap in four groups, plus the honest project note.

---

## 2. Home page sections

Order matters: proof before explanation, explanation before detail, detail before the ask.

### 2.1 Announcement bar
One line, dismissible, links to the assistant page. No fake urgency and no countdown.

### 2.2 Header
Official Linear wordmark (light and dark variants), five navigation entries, "How it runs" secondary link, "Open the CRM" primary button. Sticky with a hairline border after scroll.

### 2.3 Hero
- Eyebrow: "Local-first CRM · no account required"
- H1: a plain statement of what the product is for. Keep it under nine words.
- Sub: one sentence on the job, one on the mechanism (local records), one on the trade-off.
- Actions: "Open the workspace" (primary), "Take the product tour" (secondary).
- Trust row: no sign-up · sample data included · records stay in this browser.
- Visual: a faithful app window. Same sidebar, tabs, table, tags and 13px density as the real workspace. Not a screenshot, and not a generic dashboard.

### 2.4 Object band
Leads, People, Companies, Opportunities, Tasks, Notes, Emails, Projects. One line on the shared record graph, then the object list. This is the "what is inside" beat.

### 2.5 Platform tour (five stories)
Each story has a kicker, a short claim, one live demo, two supporting notes and a link to its detail page.
1. Build pipeline — focus mode, next steps, stage ageing.
2. Convert leads — record moves that keep links and history.
3. Run sales motions — workflow canvas with a real run log.
4. Forecast revenue — committed, best case, coverage, period switch.
5. Retain and expand — account book with health, renewal and next play.

### 2.6 Liner
Assistant panel with three grounded prompts. State plainly: simple questions are answered locally; external AI is opt-in and the key is not part of a backup.

### 2.7 Built for the work
Four cards, each with a working miniature: recurring tasks, saved views, duplicate merge, CSV and backup. Each card links to the related page.

### 2.8 Universal context (dark band)
The timeline argument: notes, files, stage changes and emails land on the record. One dark section breaks the page rhythm and gives the screenshot-heavy middle a rest.

### 2.9 Use cases
Three honest scenarios with sample records. Explicit note that these are scenarios, not customer stories. No logo wall, no invented quotes, no fabricated metrics.

### 2.10 Pricing preview
"$0 because there is no backend to pay for." Included and not included, side by side. Link to the pricing page for the full boundary.

### 2.11 Resources and FAQ
Four real answers about storage, teams, AI and commercial status. Each answer links to the page that expands it.

### 2.12 Final CTA
Dark panel, one action, one secondary. The wordmark appears once, large, as a closing signature.

### 2.13 Footer
Four columns: Product, Platform, Resources, Project. Legal line, AGPL note, "no accounts · no server".

---

## 3. Individual page template

Every detail page follows the same skeleton so the site stays learnable:

1. **Page hero** — kicker, H1, one-paragraph promise, primary and secondary action, one honest note.
2. **Live demo** — the actual interface for that feature, with at least one interaction.
3. **How it works** — three numbered steps, written as user actions, not architecture.
4. **Detail sections** — two or three short blocks, each with a specific behaviour and its limit.
5. **Related pages** — three cards that continue the argument.
6. **Page CTA** — open the workspace, with one secondary link.

Page-specific requirements:

- **Pipeline:** board plus focus list; mark reviewed; show stage age and missing next step.
- **Workflows:** canvas, live toggle, run now, execution log; state that nothing runs while the browser is closed.
- **Liner:** prompt and answer, local versus connected behaviour; no fake model output presented as real.
- **Forecast:** KPI row, bar chart, stage coverage; switching the period changes the numbers.
- **Context:** record timeline with tabs for activity, notes and files; linked records.
- **Data model:** object list, field types, relationships; custom object and custom field actions.
- **Record moves:** move a lead to People or Companies, then back; links preserved.
- **Saved views:** switch named views; filters and layout described as saved with the view.
- **Local-first:** storage diagram, what leaves the browser, what does not.
- **Import/export:** CSV mapping, export scope, JSON snapshot contents.
- **Backup:** download, restore, and the clear-site-data warning.
- **Keyboard:** shortcut table and command menu behaviour.

---

## 4. Design system

- **Typography:** Inter, 400/500/600/700. Body 15px on marketing, 13px inside product previews. Display 600 with tight tracking (-0.045em). No decorative type.
- **Colour:** near-black ink `#08090a`, muted `#5c6067`, hairline `#e6e7e9`, paper `#ffffff`, wash `#fafafa`, accent `#5e6ad2` used sparingly for focus and links. Status colours only for status.
- **Surfaces:** white cards on a white page separated by hairlines, not heavy shadows. One elevation budget: the hero window and floating panels.
- **Radius:** 8px controls, 12px panels, 999px pills.
- **Density:** app windows mirror the real workspace: 224px sidebar, 34px rows, 13px labels, uppercase 10.5px group headings.
- **Motion:** 160–220ms ease-out for interactions; one scroll reveal per section; respect `prefers-reduced-motion`.
- **Imagery:** the official Linear mark and wordmark only. No placeholder letter marks. Screens are built from real interface structure, not decorative mockups.
- **Icons:** Tabler, 1.5–1.8 stroke, 14–18px in product UI.

---

## 5. Copy rules

- No fabricated customers, logos, testimonials, ratings or usage numbers. The product is a personal project and the copy says so.
- No AI slop: no "unlock", "seamless", "supercharge", "elevate", "robust", "game changer". No binary contrasts, colon reveals, staccato triplets or em dashes.
- Name the actor. "You move the lead" beats "the lead is moved".
- One claim per sentence. Concrete verbs, specific nouns, real numbers only where the product computes them.
- Every section answers "so what?" in its first line, then supports it with a mechanism.
- CTAs name the action: "Open the workspace", "See how backups work", "Read the data model". Never "Learn more".

---

## 6. Conversion

- Primary action on every page: open the workspace. Secondary action: read how it runs.
- No email capture, no modal, no chat widget, no cookie banner (the site sets no cookies).
- The hero states the trade-off in the trust row so the wrong visitor leaves early.
- Pricing removes the usual objection by stating what is not included before the visitor asks.
- Every page ends with the same two paths, so a visitor never dead-ends.

---

## 7. SEO and metadata

- Unique `<title>`, description, canonical and Open Graph tags per page.
- One `<h1>` per page; sections use `<h2>` and `<h3>` in order.
- Descriptive link text; no "click here".
- `robots.txt` at the root, and `sitemap.xml` as soon as the site has a production domain.
- Semantic landmarks: header, nav, main, section, footer.
- JSON-LD: `SoftwareApplication` on home and pricing, `FAQPage` where the FAQ is real.

---

## 8. Accessibility

- Keyboard reachable navigation, mega menu, tabs, dialogs and demos.
- Visible focus ring on every interactive element.
- Tabs use `role="tablist"`, `aria-selected` and labelled panels.
- Form controls have labels; icon buttons have `aria-label`.
- Contrast at least 4.5:1 for body text, 3:1 for large text and UI borders that carry meaning.
- No information conveyed by colour alone: status tags include text.
- Reduced motion disables scroll reveals and counting animations.

---

## 9. Performance

- One CSS file and one JS bundle for the marketing site, both hashed by esbuild.
- Self-hosted Inter, four weights, `font-display: swap`.
- No web fonts from third parties, no analytics scripts, no embeds.
- Images: cropped PNG logos at 1x and 2x, explicit width and height.
- Interactive demos are local state only; no network calls except an explicitly configured assistant.
- Target: LCP under 2.0s on a mid-range laptop, CLS under 0.02.

---

## 10. Measurement (when hosted with analytics)

- Page views by page, not just home.
- CTA clicks: header, hero, section-level, final.
- Scroll depth at the platform tour and pricing.
- Exit pages: resources and pricing should not be the last page.
- No personal data, no cross-site tracking. If analytics is added, it is disclosed.

---

## 11. Implementation map

```
landingplan.md                  This document
index.html … pricing.html       One file per route, with metadata
platform-*.html                 Platform detail pages
product-*.html                  Product detail pages
resources-*.html                Resource detail pages
local/Landing.jsx               Route selection and page mount
local/site/logo.jsx             Official Linear mark and wordmark
local/site/chrome.jsx           Header, mega menu, footer
local/site/ui.jsx               Buttons, tags, avatars, section primitives
local/site/demos.jsx            Interactive product demos
local/site/pages.jsx            Home, platform, product, resources, customers, pricing
local/site/features.js          Detail-page content and demo mapping
local/site/site.css             The marketing design system
scripts/prepare-logos.mjs       Crops the uploaded logos to content
```

---

## 12. QA checklist

- [ ] Every navigation and footer link resolves to an existing file.
- [ ] Each page has a unique title, description and canonical.
- [ ] The official wordmark is used in the header; the mark alone is used in compact contexts.
- [ ] No page contains a placeholder letter logo.
- [ ] All demos respond to keyboard and pointer input.
- [ ] No console errors on any route.
- [ ] Layout holds at 360, 768, 1024 and 1440px.
- [ ] Reduced-motion mode removes reveals and animated counters.
- [ ] Copy contains no fabricated proof and no banned slop vocabulary.
- [ ] `npm run build` completes and `app.html` still loads.
