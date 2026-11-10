import React, { useEffect, useRef, useState } from "react";
import {
  IconAdjustmentsHorizontal,
  IconAlertTriangle,
  IconArrowRight,
  IconBolt,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCheck,
  IconCheckbox,
  IconChevronDown,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconDatabase,
  IconDots,
  IconDownload,
  IconFile,
  IconFilter,
  IconLayoutDashboard,
  IconLayoutKanban,
  IconLayoutSidebar,
  IconLock,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSparkles,
  IconTable,
  IconTargetArrow,
  IconTrendingUp,
  IconUpload,
  IconUserSearch,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import { Logo, LogoMark } from "./logo";
import { Avatar, DemoShell, Tabs, Tag } from "./ui";

/* ---------------------------------------------------------------- data */

const companies = [
  { id: "layers", name: "Layers", domain: "layers.com", industry: "Technology", tier: "Strategic", employees: 240, revenue: "$24,000,000", owner: "AM", icp: true },
  { id: "hourglass", name: "Hourglass", domain: "hourglass.io", industry: "Media", tier: "Growth", employees: 96, revenue: "$11,200,000", owner: "MC", icp: true },
  { id: "juniper", name: "Juniper Health", domain: "juniper.health", industry: "Healthcare", tier: "Growth", employees: 58, revenue: "$6,100,000", owner: "SR", icp: true },
  { id: "catalog", name: "Catalog", domain: "catalog.com", industry: "E-commerce", tier: "Strategic", employees: 320, revenue: "$41,000,000", owner: "SR", icp: false },
  { id: "circooles", name: "Circooles", domain: "circooles.com", industry: "Design", tier: "Standard", employees: 45, revenue: "$4,200,000", owner: "AM", icp: false },
  { id: "commandr", name: "Command+R", domain: "commandr.dev", industry: "Technology", tier: "Strategic", employees: 180, revenue: "$27,000,000", owner: "SR", icp: true },
  { id: "northstar", name: "Northstar Studio", domain: "northstar.studio", industry: "Design", tier: "Standard", employees: 34, revenue: "$3,800,000", owner: "AM", icp: true },
  { id: "helio", name: "Helio Systems", domain: "helio.systems", industry: "Software", tier: "Growth", employees: 76, revenue: "$8,400,000", owner: "MC", icp: true },
];

const people = [
  { id: "maya", name: "Maya Chen", title: "VP Revenue", company: "Helio Systems", email: "maya@helio.systems", status: "Qualified", owner: "MC" },
  { id: "theo", name: "Theo Marshall", title: "COO", company: "Northstar Studio", email: "theo@northstar.studio", status: "Customer", owner: "AM" },
  { id: "isla", name: "Isla Harrington", title: "Head of Operations", company: "Juniper Health", email: "isla@juniper.health", status: "Customer", owner: "SR" },
  { id: "nathan", name: "Nathan Cole", title: "Founder", company: "Cedar & Co.", email: "nathan@cedarand.co", status: "Lead", owner: "AM" },
  { id: "rae", name: "Rae Kim", title: "Product Lead", company: "Forage AI", email: "rae@forage.ai", status: "Interested", owner: "SR" },
];

const deals = [
  { id: "northstar", name: "Northstar renewal", company: "Northstar Studio", stage: "Negotiation", amount: 42000, owner: "AM", next: "Security review", age: 9, risk: true, close: "Nov 22" },
  { id: "helio", name: "Helio workspace", company: "Helio Systems", stage: "Discovery", amount: 18400, owner: "MC", next: "Add economic buyer", age: 12, risk: true, close: "Dec 04" },
  { id: "juniper", name: "Juniper rollout", company: "Juniper Health", stage: "Proposal", amount: 64000, owner: "SR", next: "Send revised proposal", age: 4, risk: false, close: "Dec 18" },
  { id: "cedar", name: "Cedar expansion", company: "Cedar & Co.", stage: "Proposal", amount: 27500, owner: "AM", next: "Follow up on proposal", age: 16, risk: true, close: "Jan 09" },
  { id: "vertex", name: "Vertex annual", company: "Vertex Labs", stage: "Negotiation", amount: 96000, owner: "JB", next: "Legal redlines", age: 6, risk: false, close: "Dec 12" },
  { id: "meridian", name: "Meridian pilot", company: "Meridian Works", stage: "Discovery", amount: 31200, owner: "MC", next: "Confirm start date", age: 3, risk: false, close: "Jan 20" },
  { id: "forage", name: "Forage annual", company: "Forage AI", stage: "Qualified", amount: 22000, owner: "SR", next: "Technical validation", age: 2, risk: false, close: "Feb 02" },
];

const leads = [
  { id: "rae-lead", name: "Rae Kim", company: "Forage AI", status: "Interested", source: "Referral", owner: "SR" },
  { id: "nathan-lead", name: "Nathan Cole", company: "Cedar & Co.", status: "Replied", source: "Event", owner: "AM" },
  { id: "dev-lead", name: "Dev Patel", company: "Lattice", status: "Not contacted", source: "Inbound", owner: "MC" },
  { id: "sasha-lead", name: "Sasha Ivanov", company: "Boltline", status: "Follow-up", source: "Outbound", owner: "AM" },
];

const accountBook = [
  { id: "layers", name: "Layers", domain: "layers.com", owner: "Alex Morgan", arr: "$96,000", renewal: "Nov 22, 2026", health: "At risk", tone: "red", people: 5, signal: "The security review has been open for nine days and the next step is unassigned.", play: "Send the security overview and book a 20 minute call with the technical lead this week." },
  { id: "juniper", name: "Juniper Health", domain: "juniper.health", owner: "Sam Rivera", arr: "$64,000", renewal: "Jan 14, 2027", health: "Healthy", tone: "green", people: 6, signal: "Two new stakeholders joined the data team after the quarterly review.", play: "Bring the data lead into the renewal conversation before the proposal goes out." },
  { id: "helio", name: "Helio Systems", domain: "helio.systems", owner: "Maya Chen", arr: "$42,000", renewal: "Feb 03, 2027", health: "Watch", tone: "amber", people: 3, signal: "Product usage is up 31% but the account has been quiet for eleven days.", play: "Ask which workflow changed this month and attach the answer to the renewal." },
  { id: "vertex", name: "Vertex Labs", domain: "vertexlabs.io", owner: "Jordan Blake", arr: "$72,000", renewal: "Mar 08, 2027", health: "Healthy", tone: "green", people: 4, signal: "Legal redlines are moving and the economic buyer joined the last call.", play: "Keep the legal thread warm and confirm the start date with procurement." },
  { id: "cedar", name: "Cedar & Co.", domain: "cedarand.co", owner: "Alex Morgan", arr: "$27,500", renewal: "Apr 19, 2027", health: "Watch", tone: "amber", people: 2, signal: "The proposal was opened twice but no reply has landed in six days.", play: "Send a short follow-up with one clear question instead of another deck." },
];

const money = (value) => `$${value.toLocaleString("en-US")}`;
const compact = (value) => (value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`);
const initialsOf = (name) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const OWNERS = { AM: "Alex Morgan", MC: "Maya Chen", SR: "Sam Rivera", JB: "Jordan Blake" };
const ownerName = (initials) => OWNERS[initials] || initials;

/* ------------------------------------------------------- workspace app */

const SIDEBAR_GROUPS = [
  {
    title: "Workspace",
    items: [
      { key: "overview", label: "Overview", Icon: IconLayoutDashboard },
      { key: "liner", label: "Liner", Icon: IconSparkles },
      { key: "tasks", label: "Tasks", Icon: IconCheckbox, count: 4 },
    ],
  },
  {
    title: "Sales",
    items: [
      { key: "leads", label: "Leads", Icon: IconUserSearch },
      { key: "companies", label: "Companies", Icon: IconBuildingSkyscraper },
      { key: "people", label: "People", Icon: IconUsers },
      { key: "deals", label: "Opportunities", Icon: IconBriefcase },
    ],
  },
  {
    title: "Insight",
    items: [
      { key: "workflows", label: "Workflows", Icon: IconBolt },
      { key: "dashboards", label: "Dashboards", Icon: IconTrendingUp },
    ],
  },
];

const VIEW_META = {
  companies: {
    label: "Companies",
    Icon: IconBuildingSkyscraper,
    count: companies.length,
    tabs: ["All records", "Renewal accounts", "ICP accounts"],
    columns: ["Company name", "Domain", "Industry", "Account tier", "Employees", "Owner"],
  },
  people: {
    label: "People",
    Icon: IconUsers,
    count: people.length,
    tabs: ["All records", "Customers", "My people"],
    columns: ["Name", "Company", "Job title", "Email", "Status", "Owner"],
  },
  deals: {
    label: "Opportunities",
    Icon: IconBriefcase,
    count: deals.length,
    tabs: ["All records", "This quarter", "At risk"],
    columns: ["Opportunity", "Company", "Stage", "Amount", "Next step", "Owner"],
  },
  leads: {
    label: "Leads",
    Icon: IconUserSearch,
    count: leads.length,
    tabs: ["All records", "Interested", "Follow-up"],
    columns: ["Lead", "Company", "Status", "Source", "Owner"],
  },
};

export function WorkspacePreview({ defaultView = "companies", compactMode = false }) {
  const [view, setView] = useState(defaultView);
  const [tab, setTab] = useState(0);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const meta = VIEW_META[view] || VIEW_META.companies;
  const q = query.trim().toLowerCase();

  function changeView(next) {
    if (!VIEW_META[next]) return;
    setView(next);
    setTab(0);
    setQuery("");
    setSelected(null);
  }

  const filteredCompanies = companies.filter((row) => {
    if (tab === 1 && !["layers", "northstar", "commandr"].includes(row.id)) return false;
    if (tab === 2 && !row.icp) return false;
    return `${row.name} ${row.domain} ${row.industry} ${row.tier}`.toLowerCase().includes(q);
  });
  const filteredPeople = people.filter((row) => {
    if (tab === 1 && row.status !== "Customer") return false;
    if (tab === 2 && row.owner !== "AM") return false;
    return `${row.name} ${row.company} ${row.title} ${row.email}`.toLowerCase().includes(q);
  });
  const filteredDeals = deals.filter((row) => {
    if (tab === 1 && !["Nov", "Dec"].includes(row.close.split(" ")[0])) return false;
    if (tab === 2 && !row.risk) return false;
    return `${row.name} ${row.company} ${row.stage} ${row.next}`.toLowerCase().includes(q);
  });
  const filteredLeads = leads.filter((row) => {
    if (tab === 1 && row.status !== "Interested") return false;
    if (tab === 2 && row.status !== "Follow-up") return false;
    return `${row.name} ${row.company} ${row.status} ${row.source}`.toLowerCase().includes(q);
  });

  const rows =
    view === "companies" ? filteredCompanies :
    view === "people" ? filteredPeople :
    view === "leads" ? filteredLeads : filteredDeals;

  return (
    <div className={`d-app ${compactMode ? "d-app--compact" : ""}`}>
      <aside className="d-app-side">
        <div className="d-app-brand">
          <Logo height={14} />
        </div>
        <button type="button" className="d-app-search" onClick={() => setQuery("")}>
          <IconSearch size={12} />
          <span>Search</span>
          <kbd>⌘K</kbd>
        </button>
        {SIDEBAR_GROUPS.map((group) => (
          <div className="d-app-group" key={group.title}>
            <small>{group.title}</small>
            {group.items.map(({ key, label, Icon, count }) => {
              const target = VIEW_META[key] ? key : key === "liner" ? "companies" : key;
              const active = view === key;
              return (
                <button
                  type="button"
                  key={key}
                  className={`d-app-nav ${active ? "is-active" : ""}`.trim()}
                  onClick={() => changeView(target)}
                >
                  <Icon size={13} />
                  <span>{label}</span>
                  {count && <b>{count}</b>}
                </button>
              );
            })}
          </div>
        ))}
        <div className="d-app-user">
          <Avatar initials="AM" size="sm" tone="blue" />
          <span><strong>Alex Morgan</strong><small>Workspace owner</small></span>
          <IconChevronDown size={11} />
        </div>
      </aside>

      <div className="d-app-main">
        <div className="d-app-top">
          <div className="d-app-crumbs">
            <IconLayoutSidebar size={14} />
            <meta.Icon size={14} />
            <strong>{meta.label}</strong>
          </div>
          <div className="d-app-top-actions">
            <span className="d-app-count">{meta.count} of {meta.count}</span>
            <label className="d-app-top-search">
              <IconSearch size={12} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                aria-label={`Search ${meta.label.toLowerCase()}`}
              />
            </label>
            <button type="button" className="d-app-create"><IconPlus size={12} /> New</button>
          </div>
        </div>

        <div className="d-app-tabrow">
          <div className="d-app-views" role="tablist" aria-label={`${meta.label} views`}>
            {meta.tabs.map((label, index) => (
              <button
                type="button"
                role="tab"
                key={label}
                aria-selected={tab === index}
                className={tab === index ? "active" : ""}
                onClick={() => setTab(index)}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="d-app-tools">
            <span className="d-app-tool"><IconSearch size={11} /> Search</span>
            <span className="d-app-tool"><IconFilter size={11} /> Filter</span>
            <span className="d-app-tool"><IconAdjustmentsHorizontal size={11} /> Options</span>
          </div>
        </div>

        <div className="d-app-table" role="table" aria-label={`${meta.label} table`}>
          <div className="d-app-row d-app-row--head" role="row">
            <span className="d-app-check" aria-hidden="true" />
            {meta.columns.map((column) => <span key={column}>{column}</span>)}
          </div>
          {rows.map((row) => (
            <button
              type="button"
              role="row"
              className={`d-app-row ${selected === row.id ? "is-selected" : ""}`.trim()}
              key={row.id}
              onClick={() => setSelected(selected === row.id ? null : row.id)}
            >
              <span className="d-app-check" aria-hidden="true" />
              {view === "companies" && (
                <>
                  <span className="d-app-name"><i>{row.name[0]}</i><strong>{row.name}</strong></span>
                  <span className="d-app-muted">{row.domain}</span>
                  <span><Tag tone={row.industry === "Technology" || row.industry === "Software" ? "blue" : row.industry === "Media" ? "amber" : row.industry === "Healthcare" ? "green" : "purple"}>{row.industry}</Tag></span>
                  <span><Tag tone={row.tier === "Strategic" ? "purple" : row.tier === "Growth" ? "blue" : "neutral"}>{row.tier}</Tag></span>
                  <span>{row.employees}</span>
                  <span className="d-app-owner"><Avatar initials={row.owner} size="xs" tone="slate" /> {ownerName(row.owner)}</span>
                </>
              )}
              {view === "people" && (
                <>
                  <span className="d-app-name"><Avatar initials={initialsOf(row.name)} size="xs" tone="pink" /><strong>{row.name}</strong></span>
                  <span>{row.company}</span>
                  <span className="d-app-muted">{row.title}</span>
                  <span className="d-app-muted">{row.email}</span>
                  <span><Tag tone={row.status === "Customer" ? "green" : row.status === "Qualified" ? "blue" : row.status === "Interested" ? "purple" : "neutral"}>{row.status}</Tag></span>
                  <span className="d-app-owner"><Avatar initials={row.owner} size="xs" tone="slate" /> {ownerName(row.owner)}</span>
                </>
              )}
              {view === "deals" && (
                <>
                  <span className="d-app-name"><i>{row.name[0]}</i><strong>{row.name}</strong></span>
                  <span>{row.company}</span>
                  <span><Tag tone={row.stage === "Negotiation" ? "amber" : row.stage === "Proposal" ? "blue" : row.stage === "Discovery" ? "neutral" : "green"}>{row.stage}</Tag></span>
                  <span className="d-app-amount">{money(row.amount)}</span>
                  <span className="d-app-muted">{row.next}</span>
                  <span className="d-app-owner"><Avatar initials={row.owner} size="xs" tone="slate" /> {ownerName(row.owner)}</span>
                </>
              )}
              {view === "leads" && (
                <>
                  <span className="d-app-name"><Avatar initials={initialsOf(row.name)} size="xs" tone="pink" /><strong>{row.name}</strong></span>
                  <span>{row.company}</span>
                  <span><Tag tone={row.status === "Interested" ? "green" : row.status === "Replied" ? "purple" : row.status === "Follow-up" ? "amber" : "neutral"}>{row.status}</Tag></span>
                  <span className="d-app-muted">{row.source}</span>
                  <span className="d-app-owner"><Avatar initials={row.owner} size="xs" tone="slate" /> {ownerName(row.owner)}</span>
                </>
              )}
            </button>
          ))}
          {rows.length === 0 && <p className="d-app-empty">No records match this view.</p>}
          <button type="button" className="d-app-newrow"><IconPlus size={11} /> New {meta.label.toLowerCase().replace(/s$/, "")}</button>
        </div>

        <div className="d-app-foot">
          <span>{rows.length} records</span>
          <span>Saved view · {meta.tabs[tab]}</span>
        </div>

        {selected && (
          <aside className="d-app-drawer" aria-label="Record preview">
            <div className="d-app-drawer-head">
              <span>Record</span>
              <button type="button" aria-label="Close record" onClick={() => setSelected(null)}><IconX size={13} /></button>
            </div>
            {(() => {
              const row = [...companies, ...people, ...deals, ...leads].find((item) => item.id === selected);
              if (!row) return null;
              const title = row.name;
              const sub = view === "companies" ? row.domain : view === "people" ? row.title : view === "deals" ? row.company : row.company;
              const fields =
                view === "companies" ? [["Domain", row.domain], ["Industry", row.industry], ["Tier", row.tier], ["Employees", row.employees], ["Owner", ownerName(row.owner)], ["ICP", row.icp ? "Yes" : "No"]] :
                view === "people" ? [["Company", row.company], ["Title", row.title], ["Email", row.email], ["Status", row.status], ["Owner", ownerName(row.owner)]] :
                view === "deals" ? [["Company", row.company], ["Stage", row.stage], ["Amount", money(row.amount)], ["Next step", row.next], ["Close date", row.close], ["Owner", ownerName(row.owner)]] :
                [["Company", row.company], ["Status", row.status], ["Source", row.source], ["Owner", ownerName(row.owner)]];
              return (
                <>
                  <div className="d-app-drawer-title">
                    <span>{view === "companies" ? row.name[0] : initialsOf(title)}</span>
                    <div><strong>{title}</strong><small>{sub}</small></div>
                  </div>
                  <div className="d-app-drawer-fields">
                    {fields.map(([label, value]) => (
                      <div key={label}><span>{label}</span><strong>{value}</strong></div>
                    ))}
                  </div>
                  <div className="d-app-drawer-links">
                    <span><IconNotes size={11} /> 3 notes</span>
                    <span><IconCheckbox size={11} /> 2 tasks</span>
                    <span><IconPaperclip size={11} /> 1 file</span>
                  </div>
                  <a className="d-app-drawer-open" href="./app.html">Open in the workspace <IconArrowRight size={12} /></a>
                </>
              );
            })()}
          </aside>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- pipeline */

export function PipelineBoard() {
  const [board, setBoard] = useState(deals);
  const [focus, setFocus] = useState(false);
  const [selected, setSelected] = useState(null);
  const stages = ["Discovery", "Proposal", "Negotiation"];
  const visible = focus ? board.filter((deal) => deal.risk) : board;

  function advance(deal, direction) {
    const index = stages.indexOf(deal.stage);
    const next = stages[Math.min(stages.length - 1, Math.max(0, index + direction))];
    setBoard((items) => items.map((item) => (item.id === deal.id ? { ...item, stage: next, age: 0 } : item)));
    setSelected(deal.id);
  }

  return (
    <DemoShell
      title="Opportunities"
      subtitle="Pipeline · 7 open deals"
      className="d-board-shell"
      actions={
        <>
          <button type="button" className={`d-ghost-btn ${focus ? "is-on" : ""}`.trim()} onClick={() => setFocus((value) => !value)} aria-pressed={focus}>
            <IconTargetArrow size={12} /> Focus
          </button>
          <button type="button" className="d-primary-btn"><IconPlus size={12} /> New deal</button>
        </>
      }
      footer={<><span><IconCircleCheck size={12} /> {focus ? "Showing deals that need a decision" : "Stage changes update the pipeline totals"}</span><span>Click a card, then use the arrows</span></>}
    >
      <div className="d-board">
        {stages.map((stage) => {
          const cards = visible.filter((deal) => deal.stage === stage);
          const total = cards.reduce((sum, deal) => sum + deal.amount, 0);
          return (
            <section className="d-board-col" key={stage}>
              <header>
                <span className={`d-stage-dot d-stage-dot--${stage.toLowerCase()}`} />
                <strong>{stage}</strong>
                <small>{cards.length}</small>
                <b>{compact(total)}</b>
              </header>
              <div className="d-board-col-body">
                {cards.map((deal) => (
                  <article className={`d-deal ${selected === deal.id ? "is-selected" : ""}`.trim()} key={deal.id}>
                    <button type="button" className="d-deal-main" onClick={() => setSelected(deal.id)}>
                      <span className="d-deal-company"><i>{deal.company[0]}</i>{deal.company}{deal.risk && <em className="d-risk" title="Needs attention" />}</span>
                      <strong>{deal.name}</strong>
                      <span className="d-deal-amount">{money(deal.amount)}</span>
                      <span className="d-deal-next">{deal.next}</span>
                      <span className="d-deal-foot">
                        <Avatar initials={deal.owner} size="xs" tone="slate" />
                        <span>{deal.age === 0 ? "Moved just now" : `${deal.age}d in stage`}</span>
                        <span className="d-deal-close">{deal.close}</span>
                      </span>
                    </button>
                    {selected === deal.id && (
                      <div className="d-deal-move">
                        <button type="button" aria-label={`Move ${deal.name} back a stage`} onClick={() => advance(deal, -1)} disabled={deal.stage === stages[0]}>←</button>
                        <span>Move stage</span>
                        <button type="button" aria-label={`Move ${deal.name} forward a stage`} onClick={() => advance(deal, 1)} disabled={deal.stage === stages[stages.length - 1]}>→</button>
                      </div>
                    )}
                  </article>
                ))}
                {cards.length === 0 && <span className="d-board-empty">No deals in this stage</span>}
              </div>
            </section>
          );
        })}
      </div>
    </DemoShell>
  );
}

export function FocusList() {
  const [focus, setFocus] = useState(true);
  const [reviewed, setReviewed] = useState([]);
  const [selected, setSelected] = useState(null);
  const visible = focus ? deals.filter((deal) => deal.risk || !deal.next) : deals;

  return (
    <DemoShell
      title="Pipeline focus"
      subtitle="This week · 5 opportunities"
      actions={
        <button type="button" className={`d-ghost-btn ${focus ? "is-on" : ""}`.trim()} onClick={() => setFocus((value) => !value)} aria-pressed={focus}>
          <IconTargetArrow size={12} /> Focus mode
        </button>
      }
      footer={<><span><IconCircleCheck size={12} /> {reviewed.length} marked reviewed</span><span>Click the clock to review a deal</span></>}
    >
      <div className="d-kpis">
        <div><span>Open pipeline</span><strong>$307,100</strong></div>
        <div><span>Weighted forecast</span><strong>$174,700</strong></div>
        <div><span>Needs attention</span><strong className="d-danger">{deals.filter((deal) => deal.risk).length} deals</strong></div>
        <p>{focus ? "Only the deals that need a decision." : "Every open opportunity, newest first."}</p>
      </div>
      <div className="d-focus-table" role="table" aria-label="Opportunity focus list">
        <div className="d-focus-row d-focus-row--head" role="row"><span>Opportunity</span><span>Stage</span><span>Signal</span><span>Amount</span><span>Next step</span><span /></div>
        {visible.map((deal) => {
          const done = reviewed.includes(deal.id);
          return (
            <div className={`d-focus-row ${done ? "is-done" : ""} ${selected === deal.id ? "is-selected" : ""}`.trim()} role="row" key={deal.id}>
              <button type="button" className="d-focus-name" onClick={() => setSelected(deal.id)}>
                <i>{deal.name[0]}</i><span><strong>{deal.name}</strong><small>{deal.company}</small></span>
              </button>
              <span><Tag tone={deal.stage === "Negotiation" ? "amber" : deal.stage === "Proposal" ? "blue" : "neutral"}>{deal.stage}</Tag></span>
              <span>{done ? <Tag tone="green">Reviewed</Tag> : <Tag tone={deal.risk ? "red" : "green"}>{deal.risk ? (deal.age > 10 ? `${deal.age} days quiet` : "No next step") : "On track"}</Tag>}</span>
              <span className="d-amount">{money(deal.amount)}</span>
              <span className="d-muted-cell">{done ? "Caught up" : deal.next}</span>
              <button
                type="button"
                className={`d-review ${done ? "is-done" : ""}`.trim()}
                aria-label={done ? `Undo review for ${deal.name}` : `Mark ${deal.name} reviewed`}
                onClick={() => setReviewed((items) => done ? items.filter((id) => id !== deal.id) : [...items, deal.id])}
              >
                {done ? <IconCheck size={11} /> : <IconClock size={11} />}
              </button>
            </div>
          );
        })}
      </div>
      {selected && (
        <div className="d-focus-detail" role="status">
          <Avatar initials="AM" size="xs" tone="blue" />
          <span>Owner Alex Morgan · close {deals.find((deal) => deal.id === selected)?.close} · record opened in the workspace</span>
          <a href="./app.html">Open <IconArrowRight size={11} /></a>
        </div>
      )}
    </DemoShell>
  );
}

/* ---------------------------------------------------------- record move */

export function RecordMove() {
  const [target, setTarget] = useState("people");
  const [moved, setMoved] = useState(false);
  const isPerson = target === "people";

  return (
    <DemoShell
      title="Move record"
      subtitle="Maya Chen · Lead"
      actions={
        <div className="d-seg" role="group" aria-label="Move destination">
          <button type="button" className={isPerson ? "active" : ""} onClick={() => { setTarget("people"); setMoved(false); }}>Person</button>
          <button type="button" className={!isPerson ? "active" : ""} onClick={() => { setTarget("company"); setMoved(false); }}>Company</button>
        </div>
      }
      footer={<><span><IconCircleCheck size={12} /> Links, files and history follow the record</span><span>Move it back without cleanup</span></>}
    >
      <div className="d-move">
        <section className="d-move-col">
          <header><span><IconUserSearch size={13} /> Leads</span><b>{moved ? 0 : 1}</b></header>
          {!moved ? (
            <article className="d-move-card">
              <div className="d-move-card-top"><Avatar initials="MC" tone="pink" size="sm" /><span><strong>Maya Chen</strong><small>Helio Systems</small></span><Tag tone="green">Interested</Tag></div>
              <div className="d-move-meta"><span><IconMail size={11} /> maya@helio.systems</span><span><IconUserSearch size={11} /> Inbound</span></div>
              <div className="d-move-links"><span><IconNotes size={11} /> 3 notes</span><span><IconCheckbox size={11} /> 2 tasks</span><span><IconPaperclip size={11} /> 1 file</span></div>
            </article>
          ) : (
            <div className="d-move-empty"><IconCircleCheck size={17} /><strong>Lead moved</strong><span>The original record is preserved.</span></div>
          )}
        </section>

        <div className={`d-move-arrow ${moved ? "is-active" : ""}`.trim()} aria-hidden="true">
          <span /><IconArrowRight size={14} /><span />
        </div>

        <section className="d-move-col">
          <header><span>{isPerson ? <IconUsers size={13} /> : <IconBuildingSkyscraper size={13} />} {isPerson ? "People" : "Companies"}</span><b>{moved ? 1 : 0}</b></header>
          {moved ? (
            <article className="d-move-card d-move-card--arrived">
              <div className="d-move-card-top"><Avatar initials={isPerson ? "MC" : "H"} tone={isPerson ? "pink" : "purple"} size="sm" /><span><strong>{isPerson ? "Maya Chen" : "Helio Systems"}</strong><small>{isPerson ? "Helio Systems" : "helio.systems"}</small></span><Tag tone="blue">{isPerson ? "Qualified" : "Prospect"}</Tag></div>
              <div className="d-move-meta"><span><IconUserSearch size={11} /> From Leads</span><span><IconClock size={11} /> Just now</span></div>
              <div className="d-move-links"><span><IconCheckbox size={11} /> 2 tasks kept</span><span><IconNotes size={11} /> 3 notes kept</span><span><IconPaperclip size={11} /> 1 file kept</span></div>
            </article>
          ) : (
            <div className="d-move-empty d-move-empty--idle">
              {isPerson ? <IconUsers size={17} /> : <IconBuildingSkyscraper size={17} />}
              <strong>No {isPerson ? "person" : "company"} yet</strong>
              <span>{isPerson ? "A person record keeps the contact details, owner and every linked note." : "A company record keeps the domain, industry and the people attached to the account."}</span>
            </div>
          )}
        </section>
      </div>
      <div className="d-move-bar">
        <button type="button" className="d-primary-btn" onClick={() => setMoved((value) => !value)}>
          {moved ? "Move back to Leads" : `Move to ${isPerson ? "People" : "Companies"}`}
          <IconArrowRight size={12} />
        </button>
        <span>{moved ? "The record keeps its id, links and activity." : "The lead does not spawn a duplicate record."}</span>
      </div>
    </DemoShell>
  );
}

/* ------------------------------------------------------------- workflow */

const RUN_LOG = [
  ["Follow-up task created", "2 hours ago"],
  ["Activity logged to Lattice renewal", "Yesterday"],
  ["Owner reassigned to Sam Rivera", "Yesterday"],
];

export function WorkflowCanvas() {
  const [live, setLive] = useState(true);
  const [runs, setRuns] = useState(24);
  const [log, setLog] = useState(RUN_LOG);
  const [flash, setFlash] = useState("");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function run() {
    if (!live) return;
    setRuns((value) => value + 1);
    setLog((items) => [["Follow-up task created", "Just now"], ...items].slice(0, 4));
    setFlash("Run complete · task created and due in two days");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(""), 2800);
  }

  return (
    <DemoShell
      title="Stage follow-up"
      subtitle="Opportunity automation"
      actions={
        <>
          <button type="button" className={`d-live ${live ? "is-on" : ""}`.trim()} role="switch" aria-checked={live} onClick={() => setLive((value) => !value)}>
            <span>{live ? "Live" : "Paused"}</span><i />
          </button>
          <button type="button" className="d-primary-btn" onClick={run} disabled={!live}><IconPlayerPlay size={12} /> Run now</button>
        </>
      }
      footer={<><span><IconBolt size={12} /> {runs} runs this month</span><span>Nothing runs while the browser is closed</span></>}
    >
      <div className="d-canvas">
        <div className="d-canvas-meta">
          <span><i className={live ? "is-on" : ""} /> {live ? "Listening for stage changes" : "Workflow paused"}</span>
          <small>Last edited today</small>
        </div>
        <div className="d-nodes">
          <div className="d-node d-node--trigger">
            <span className="d-node-icon"><IconBolt size={13} /></span>
            <div><small>Trigger</small><strong>Stage changes</strong><em>Opportunity · any pipeline</em></div>
          </div>
          <span className="d-connector" aria-hidden="true" />
          <div className="d-node">
            <span className="d-node-icon"><IconFilter size={13} /></span>
            <div><small>Condition</small><strong>Stage is Proposal</strong><em>All conditions match</em></div>
          </div>
          <span className="d-connector" aria-hidden="true" />
          <div className="d-node d-node--action">
            <span className="d-node-icon"><IconCheckbox size={13} /></span>
            <div><small>Action</small><strong>Create task</strong><em>Due in 2 days · owner assigned</em></div>
          </div>
        </div>
        <div className="d-runlog">
          <span className="d-runlog-head">Recent runs</span>
          {log.map(([text, time], index) => (
            <div key={`${text}-${index}`}>
              <i className={index === 0 ? "is-new" : ""} />
              <span>{text}</span>
              <small>{time}</small>
            </div>
          ))}
        </div>
        {flash && <div className="d-flash" role="status"><IconCircleCheck size={12} /> {flash}</div>}
      </div>
    </DemoShell>
  );
}

/* ------------------------------------------------------------- forecast */

const FORECAST = {
  quarter: {
    label: "This quarter",
    heading: "Q4 2026",
    committed: "$187.4k",
    best: "$248.2k",
    coverage: "3.1×",
    delta: "+8.4%",
    bars: [38, 54, 46, 68, 61, 82],
    months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    answer: "Coverage improved 0.4× this week. Northstar and Juniper moved into Proposal. Helio still has no next step.",
  },
  next: {
    label: "Next quarter",
    heading: "Q1 2027",
    committed: "$214.8k",
    best: "$301.6k",
    coverage: "3.6×",
    delta: "+14.1%",
    bars: [52, 43, 66, 57, 76, 91],
    months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    answer: "Next-quarter coverage is ahead of plan. Three accounts renew in the first six weeks, so renewal timing is the open question.",
  },
};

export function ForecastPanel() {
  const [period, setPeriod] = useState("quarter");
  const current = FORECAST[period];

  return (
    <DemoShell
      title="Revenue forecast"
      subtitle="Weighted pipeline"
      actions={
        <div className="d-seg" role="group" aria-label="Forecast period">
          {Object.entries(FORECAST).map(([key, item]) => (
            <button type="button" key={key} className={period === key ? "active" : ""} aria-pressed={period === key} onClick={() => setPeriod(key)}>{item.label}</button>
          ))}
        </div>
      }
      footer={<><span><i className="d-live-dot" /> Updated from local records</span><span>{current.heading}</span></>}
    >
      <div className="d-forecast">
        <div className="d-forecast-kpis" aria-live="polite">
          <div><span>Committed</span><strong>{current.committed}</strong></div>
          <div><span>Best case</span><strong>{current.best}</strong></div>
          <div><span>Coverage</span><strong>{current.coverage}</strong></div>
          <div><span>Week over week</span><strong className="d-up">{current.delta}</strong></div>
        </div>
        <div className="d-forecast-body">
          <div className="d-chart">
            <div className="d-chart-head"><span>Weighted pipeline</span><small>USD, thousands</small></div>
            <div className="d-bars">
              {current.bars.map((value, index) => (
                <div className="d-bar" key={current.months[index]}>
                  <span style={{ height: `${value}%` }}><b>{Math.round(value * 2.1)}</b></span>
                  <small>{current.months[index]}</small>
                </div>
              ))}
            </div>
          </div>
          <aside className="d-coverage">
            <div className="d-chart-head"><span>Stage coverage</span><small>vs. target</small></div>
            {[["Negotiation", 82], ["Proposal", 64], ["Discovery", 37]].map(([label, value]) => (
              <div className="d-cover-row" key={label}>
                <span>{label}</span><b>{value}%</b><i><em style={{ width: `${value}%` }} /></i>
              </div>
            ))}
            <div className="d-answer">
              <span><IconSparkles size={11} /> Liner answer</span>
              <p>{current.answer}</p>
            </div>
          </aside>
        </div>
      </div>
    </DemoShell>
  );
}

/* ---------------------------------------------------------------- liner */

const LINER_ANSWERS = {
  attention: "Two deals need a decision. Northstar renewal has no next step and Helio workspace has been quiet for twelve days. Start with Lattice, the renewal date is closest.",
  pipeline: "Open pipeline is $307,100 across seven opportunities. Weighted forecast is $174,700. Negotiation holds the most value, but Proposal has the oldest untouched deal.",
  followup: "Draft: Hi Theo, I wanted to close the loop on the security review and confirm the two open questions from Friday. Would a 20 minute call tomorrow keep the renewal on track?",
  tasks: "You have four tasks open. The two that matter today are Send Northstar security documents and Confirm Juniper proposal call. Both are linked to open opportunities.",
  fallback: "In this sample workspace I can see seven opportunities, eight companies and three open tasks. Ask about pipeline, deal risk, follow-ups or your week.",
};

export function LinerChat({ compact = false }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Morning, Alex. Your pipeline moved overnight. Want the short version or the deal-by-deal one?" },
    { role: "user", text: "What needs attention?" },
    { role: "assistant", text: LINER_ANSWERS.attention },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);
  useEffect(() => () => clearTimeout(timer.current), []);

  function answerFor(value) {
    const text = value.toLowerCase();
    if (/(attention|risk|stalled|focus)/.test(text)) return LINER_ANSWERS.attention;
    if (/(pipeline|forecast|summar)/.test(text)) return LINER_ANSWERS.pipeline;
    if (/(follow|email|draft)/.test(text)) return LINER_ANSWERS.followup;
    if (/(task|today|week)/.test(text)) return LINER_ANSWERS.tasks;
    return LINER_ANSWERS.fallback;
  }

  function send(value = input) {
    const text = value.trim();
    if (!text || thinking) return;
    setMessages((items) => [...items, { role: "user", text }]);
    setInput("");
    setThinking(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setMessages((items) => [...items, { role: "assistant", text: answerFor(text) }]);
      setThinking(false);
    }, 480);
  }

  return (
    <div className={`d-liner ${compact ? "d-liner--compact" : ""}`.trim()}>
      <header className="d-liner-head">
        <div><span className="d-liner-orb"><LogoMark tone="white" size={13} /></span><span><strong>Liner</strong><small>Workspace assistant</small></span></div>
        <span className="d-liner-state"><i /> Local context on</span>
      </header>
      <div className="d-liner-body">
        <div className="d-liner-messages" ref={scrollRef} aria-live="polite">
          {messages.map((message, index) => (
            <div className={`d-liner-msg d-liner-msg--${message.role}`} key={`${message.role}-${index}`}>
              {message.role === "assistant" && <span className="d-liner-avatar"><LogoMark tone="white" size={11} /></span>}
              <div>{message.text}</div>
            </div>
          ))}
          {thinking && (
            <div className="d-liner-msg d-liner-msg--assistant">
              <span className="d-liner-avatar"><LogoMark tone="white" size={11} /></span>
              <div className="d-typing"><i /><i /><i /></div>
            </div>
          )}
        </div>
        <div className="d-liner-prompts">
          {["What needs attention?", "Summarize my pipeline", "Draft a follow-up"].map((prompt) => (
            <button type="button" key={prompt} onClick={() => send(prompt)}>{prompt}</button>
          ))}
        </div>
        <form className="d-liner-input" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <LogoMark size={12} />
          <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about this workspace" aria-label="Ask Liner about this workspace" />
          <button type="submit" aria-label="Send message" disabled={!input.trim() || thinking}><IconArrowRight size={13} /></button>
        </form>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------- data model */

const MODEL = {
  leads: {
    label: "Leads", Icon: IconUserSearch, count: "128 records",
    fields: [["Name", "Text"], ["Status", "Select"], ["Email", "Email"], ["Company name", "Text"], ["Source", "Select"], ["Owner", "Owner"], ["Next follow-up", "Date"], ["Business needs", "Long text"]],
    relations: ["Campaign", "Tasks", "Notes", "Emails"],
    note: "Raw prospects live here until they are qualified or moved.",
  },
  companies: {
    label: "Companies", Icon: IconBuildingSkyscraper, count: "86 records",
    fields: [["Company name", "Text"], ["Domain", "URL"], ["Industry", "Select"], ["Relationship", "Select"], ["Tier", "Select"], ["Owner", "Owner"], ["Renewal date", "Date"], ["Annual revenue", "Currency"]],
    relations: ["People", "Opportunities", "Projects", "Invoices"],
    note: "One account record for every customer relationship.",
  },
  opportunities: {
    label: "Opportunities", Icon: IconTargetArrow, count: "24 records",
    fields: [["Name", "Text"], ["Stage", "Select"], ["Amount", "Currency"], ["Probability", "Percent"], ["Close date", "Date"], ["Company", "Relation"], ["Primary contact", "Relation"], ["Next step", "Text"]],
    relations: ["Company", "Person", "Tasks", "Notes", "Products"],
    note: "Revenue in motion, with a next step on every deal.",
  },
  people: {
    label: "People", Icon: IconUsers, count: "342 records",
    fields: [["Full name", "Text"], ["Job title", "Text"], ["Email", "Email"], ["Status", "Select"], ["Company", "Relation"], ["Owner", "Owner"], ["Last contacted", "Date"]],
    relations: ["Company", "Opportunities", "Tasks", "Notes", "Files"],
    note: "The people behind every conversation and deal.",
  },
};

export function DataModelPanel() {
  const [active, setActive] = useState("companies");
  const [custom, setCustom] = useState([]);
  const model = MODEL[active];
  const Icon = model.Icon;

  return (
    <DemoShell
      title="Data model"
      subtitle="Objects, fields and relationships"
      actions={<button type="button" className="d-ghost-btn" onClick={() => setCustom((items) => items.length ? [] : [["Renewal owner", "Owner"]])}><IconPlus size={12} /> {custom.length ? "Remove custom field" : "Add custom field"}</button>}
      footer={<><span><IconDatabase size={12} /> Stored as local records</span><span>Click an object to inspect it</span></>}
    >
      <div className="d-model">
        <nav className="d-model-nav" aria-label="Objects">
          <small>Objects</small>
          {Object.entries(MODEL).map(([key, value]) => (
            <button type="button" key={key} className={active === key ? "active" : ""} onClick={() => { setActive(key); setCustom([]); }}>
              <span><value.Icon size={13} /></span>
              <div><strong>{value.label}</strong><small>{value.count}</small></div>
              <IconChevronRight size={12} />
            </button>
          ))}
        </nav>
        <div className="d-model-main">
          <header>
            <span className="d-model-icon"><Icon size={17} /></span>
            <div><h3>{model.label}</h3><p>{model.note}</p></div>
            <Tag tone="green">Live schema</Tag>
          </header>
          <div className="d-model-label"><span>Fields</span><small>{model.fields.length + custom.length} properties</small></div>
          <div className="d-field-grid">
            {[...model.fields, ...custom].map(([name, type], index) => (
              <div className="d-field" key={name}>
                <span className={`d-field-type d-field-type--${index % 4}`}>{type === "Date" ? "◷" : type === "Currency" || type === "Number" || type === "Percent" ? "#" : type === "Relation" ? "↗" : "Aa"}</span>
                <strong>{name}</strong>
                <span>{type}</span>
              </div>
            ))}
          </div>
          <div className="d-model-rel">
            <span>Relationships</span>
            <div>{model.relations.map((relation) => <Tag key={relation} tone="blue">{relation}</Tag>)}</div>
          </div>
        </div>
      </div>
    </DemoShell>
  );
}

/* ---------------------------------------------------------- saved views */

export function SavedViewsPanel() {
  const [view, setView] = useState("all");
  const views = [
    { key: "all", label: "All accounts", hint: "Sorted by renewal" },
    { key: "risk", label: "At risk", hint: "Health is At risk or Watch" },
    { key: "renewals", label: "Renewals", hint: "Next two quarters" },
    { key: "expansion", label: "Expansion", hint: "Positive signal" },
  ];
  const rows = accountBook.filter((account) => {
    if (view === "risk") return account.health !== "Healthy";
    if (view === "renewals") return /2026|Jan|Feb/.test(account.renewal);
    if (view === "expansion") return true;
    return true;
  });

  return (
    <DemoShell
      title="Account book"
      subtitle="Saved views"
      actions={<button type="button" className="d-ghost-btn"><IconFilter size={12} /> Add filter</button>}
      footer={<><span><IconAdjustmentsHorizontal size={12} /> Filters, sort and layout are saved with the view</span><span>{rows.length} of {accountBook.length} accounts</span></>}
    >
      <div className="d-views">
        <div className="d-views-tabs" role="tablist" aria-label="Saved account views">
          {views.map((item) => (
            <button type="button" role="tab" key={item.key} aria-selected={view === item.key} className={view === item.key ? "active" : ""} onClick={() => setView(item.key)}>
              {item.label}<small>{item.hint}</small>
            </button>
          ))}
        </div>
        <div className="d-views-table" role="table" aria-label="Saved view results">
          <div className="d-views-row d-views-row--head" role="row"><span>Account</span><span>Health</span><span>ARR</span><span>Renewal</span></div>
          {rows.map((account) => (
            <div className="d-views-row" role="row" key={account.id}>
              <span className="d-views-name"><i>{account.name[0]}</i><span><strong>{account.name}</strong><small>{account.owner}</small></span></span>
              <span><Tag tone={account.tone}>{account.health}</Tag></span>
              <span>{account.arr}</span>
              <span>{account.renewal.replace(", 2026", "").replace(", 2027", "")}</span>
            </div>
          ))}
        </div>
      </div>
    </DemoShell>
  );
}

/* -------------------------------------------------------------- context */

const TIMELINE = {
  Activity: [
    { title: "Email sent to Theo Marshall", meta: "Renewal security review · 2 hours ago", Icon: IconMail },
    { title: "Note added by Alex Morgan", meta: "Legal wants SSO before signature · Yesterday", Icon: IconNotes },
    { title: "Task completed", meta: "Send security documentation · Monday", Icon: IconCheckbox },
    { title: "Stage changed to Negotiation", meta: "Northstar renewal · Last week", Icon: IconTargetArrow },
  ],
  Notes: [
    { title: "Renewal call with Theo and Isla", meta: "Procurement is aligned. Security review is the only gate · Oct 28", Icon: IconNotes },
    { title: "Account research", meta: "Two new stakeholders joined the data team · Oct 21", Icon: IconNotes },
  ],
  Files: [
    { title: "Northstar renewal.pdf", meta: "1.8 MB · Uploaded by Alex Morgan", Icon: IconFile },
    { title: "Security overview.pdf", meta: "840 KB · Shared with the customer", Icon: IconFile },
  ],
};

export function TimelinePanel() {
  const [tab, setTab] = useState("Activity");
  return (
    <DemoShell
      title="Northstar Studio"
      subtitle="Strategic account · Active customer"
      actions={<><Tag tone="green">Healthy</Tag><button type="button" className="d-icon-btn" aria-label="Record options"><IconDots size={13} /></button></>}
      footer={<><span><IconLock size={12} /> Activity recorded in this browser</span><span>Notes, files and stage changes share one timeline</span></>}
    >
      <div className="d-record">
        <div className="d-record-main">
          <div className="d-record-head">
            <span className="d-record-logo">N</span>
            <div><h3>Northstar renewal</h3><p>Lattice · Negotiation</p></div>
            <Tag tone="amber">Negotiation</Tag>
          </div>
          <div className="d-record-fields">
            <div><span>Amount</span><strong>$42,000</strong></div>
            <div><span>Owner</span><strong><Avatar initials="AM" size="xs" tone="blue" /> Alex Morgan</strong></div>
            <div><span>Close date</span><strong>Nov 22, 2026</strong></div>
            <div><span>Next step</span><strong>Security review</strong></div>
          </div>
          <div className="d-record-relations">
            <span>Linked records</span>
            <div><Tag tone="blue">Theo Marshall</Tag><Tag tone="purple">4 people</Tag><Tag tone="neutral">3 tasks</Tag><Tag tone="green">2 notes</Tag></div>
          </div>
          <div className="d-record-links">
            <span><IconMail size={11} /> Email</span><span><IconCheckbox size={11} /> Task</span><span><IconNotes size={11} /> Note</span><span><IconPaperclip size={11} /> File</span>
          </div>
        </div>
        <div className="d-timeline">
          <Tabs label="Record detail views" value={tab} onChange={setTab} items={Object.keys(TIMELINE).map((key) => ({ key, label: key }))} />
          <div className="d-timeline-items">
            {TIMELINE[tab].map(({ title, meta, Icon }) => (
              <div className="d-timeline-item" key={title}>
                <span><Icon size={12} /></span>
                <div><strong>{title}</strong><small>{meta}</small></div>
              </div>
            ))}
          </div>
          <button type="button" className="d-add-note"><IconPlus size={11} /> Add {tab === "Files" ? "file" : "note"}</button>
        </div>
      </div>
    </DemoShell>
  );
}

/* ----------------------------------------------------------- account book */

export function AccountBook() {
  const [selectedId, setSelectedId] = useState("layers");
  const selected = accountBook.find((account) => account.id === selectedId) || accountBook[0];

  return (
    <DemoShell
      title="Account book"
      subtitle="5 accounts · $301k ARR"
      actions={<button type="button" className="d-ghost-btn"><IconFilter size={12} /> Filter</button>}
      footer={<><span><i className="d-live-dot" /> Health and renewal read from linked records</span><span>Select an account</span></>}
    >
      <div className="d-book">
        <div className="d-book-table" role="table" aria-label="Account health">
          <div className="d-book-row d-book-row--head" role="row"><span>Account</span><span>Health</span><span>ARR</span><span>Renewal</span></div>
          {accountBook.map((account) => (
            <button type="button" role="row" key={account.id} className={`d-book-row ${selectedId === account.id ? "active" : ""}`.trim()} onClick={() => setSelectedId(account.id)}>
              <span className="d-book-name"><i>{account.name[0]}</i><span><strong>{account.name}</strong><small>{account.domain}</small></span></span>
              <span><Tag tone={account.tone}>{account.health}</Tag></span>
              <span>{account.arr}</span>
              <span className="d-muted-cell">{account.renewal.replace(", 2026", "").replace(", 2027", "")}</span>
            </button>
          ))}
        </div>
        <aside className="d-account" aria-live="polite">
          <div className="d-account-head">
            <span className="d-account-mark">{selected.name[0]}</span>
            <div><h4>{selected.name}</h4><small>{selected.people} people · {selected.owner}</small></div>
            <Tag tone={selected.tone}>{selected.health}</Tag>
          </div>
          <div className="d-account-metrics">
            <div><span>ARR</span><strong>{selected.arr}</strong></div>
            <div><span>Renewal</span><strong>{selected.renewal}</strong></div>
          </div>
          <div className="d-account-signal"><span><IconAlertTriangle size={11} /> Signal</span><p>{selected.signal}</p></div>
          <div className="d-account-play"><span><IconTargetArrow size={11} /> Next play</span><p>{selected.play}</p></div>
          <a href="./app.html" className="d-account-open">Open account <IconArrowRight size={11} /></a>
        </aside>
      </div>
    </DemoShell>
  );
}

/* --------------------------------------------------------- import panel */

const CSV_ROWS = [
  ["Maya Chen", "maya@helio.systems", "Helio Systems", "Interested"],
  ["Rae Kim", "rae@forage.ai", "Forage AI", "Interested"],
  ["Nathan Cole", "nathan@cedarand.co", "Cedar & Co.", "Replied"],
  ["Dev Patel", "dev@lattice.io", "Lattice", "Not contacted"],
  ["Sasha Ivanov", "sasha@boltline.dev", "Boltline", "Follow-up"],
];

export function ImportPanel() {
  const [mapped, setMapped] = useState(false);
  const [imported, setImported] = useState(false);

  return (
    <DemoShell
      title="Import leads"
      subtitle={imported ? "5 records imported" : "leads-november.csv · 5 rows"}
      actions={<button type="button" className="d-ghost-btn" onClick={() => { setMapped(false); setImported(false); }}><IconRefresh size={12} /> Reset</button>}
      footer={<><span><IconUpload size={12} /> Header matching, relation resolution, duplicate check</span><span>{imported ? "Imported into this browser" : "Sample file"}</span></>}
    >
      <div className="d-import">
        <div className="d-import-file">
          <span className="d-import-icon"><IconFile size={17} /></span>
          <div><strong>leads-november.csv</strong><small>5 rows · 4 columns · UTF-8</small></div>
          <Tag tone={imported ? "green" : "neutral"}>{imported ? "Imported" : "Ready"}</Tag>
        </div>
        <div className={`d-import-map ${mapped ? "is-map" : ""}`.trim()}>
          <div className="d-import-map-head"><span>CSV column</span><span>CRM field</span><span>Status</span></div>
          {[["Full name", "Name", "Matched"], ["Email address", "Email", "Matched"], ["Company", "Company name", "Matched"], ["Interest", "Status", "Review"]].map(([from, to, state]) => (
            <div key={from}><span>{from}</span><IconArrowRight size={11} /><strong>{to}</strong><Tag tone={state === "Matched" ? "green" : "amber"}>{state}</Tag></div>
          ))}
        </div>
        <div className="d-import-preview">
          {CSV_ROWS.map(([name, email, company, status]) => (
            <div key={email}><Avatar initials={initialsOf(name)} size="xs" tone="pink" /><strong>{name}</strong><span className="d-import-company">{company}</span><Tag tone={status === "Interested" ? "green" : status === "Replied" ? "purple" : status === "Follow-up" ? "amber" : "neutral"}>{status}</Tag></div>
          ))}
        </div>
        <div className="d-import-actions">
          <button type="button" className="d-ghost-btn" onClick={() => setMapped((value) => !value)}>{mapped ? "Hide mapping" : "Review mapping"}</button>
          <button type="button" className="d-primary-btn" onClick={() => setImported(true)} disabled={imported}>{imported ? "Imported" : "Import 5 records"} {!imported && <IconArrowRight size={12} />}</button>
        </div>
      </div>
    </DemoShell>
  );
}

/* ---------------------------------------------------------- backup panel */

export function BackupPanel() {
  const [state, setState] = useState("idle");
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  function exportBackup() {
    setState("exported");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 3200);
  }

  return (
    <DemoShell
      title="Workspace backup"
      subtitle="linear-crm-backup.json"
      footer={<><span><IconLock size={12} /> Nothing is uploaded</span><span>2.4 MB · 18 objects</span></>}
    >
      <div className="d-backup">
        <div className="d-backup-head">
          <span className="d-backup-mark"><LogoMark size={15} /></span>
          <div><strong>A complete workspace snapshot</strong><small>Records, links, custom fields, views, workflows and settings in one file.</small></div>
        </div>
        <div className="d-backup-bar"><span style={{ width: "64%" }} /></div>
        <div className="d-backup-meta"><span>Browser storage used</span><strong>2.4 MB of 5 MB</strong></div>
        <div className="d-backup-list">
          <div><IconDatabase size={12} /><span>Records and relationships</span><strong>412 KB</strong></div>
          <div><IconAdjustmentsHorizontal size={12} /><span>Views and custom fields</span><strong>38 KB</strong></div>
          <div><IconBolt size={12} /><span>Workflows and run log</span><strong>22 KB</strong></div>
        </div>
        <div className="d-backup-actions">
          <button type="button" className="d-primary-btn" onClick={exportBackup}><IconDownload size={12} /> Download backup</button>
          <button type="button" className="d-ghost-btn" onClick={() => setState("restore")}><IconUpload size={12} /> Restore</button>
        </div>
        {state === "exported" && <div className="d-flash" role="status"><IconCircleCheck size={12} /> Backup prepared · 2.4 MB JSON (demo only)</div>}
        {state === "restore" && <div className="d-warning" role="status"><IconAlertTriangle size={12} /> Restoring replaces the current workspace. Export first if the data matters.</div>}
      </div>
    </DemoShell>
  );
}

/* -------------------------------------------------------- command panel */

const COMMANDS = [
  { label: "Go to Opportunities", hint: "Page", Icon: IconBriefcase },
  { label: "Go to Companies", hint: "Page", Icon: IconBuildingSkyscraper },
  { label: "New lead", hint: "Create", Icon: IconUserSearch },
  { label: "New task", hint: "Create", Icon: IconCheckbox },
  { label: "Search Maya Chen", hint: "Record", Icon: IconUsers },
  { label: "Search Layers", hint: "Record", Icon: IconBuildingSkyscraper },
  { label: "Export workspace backup", hint: "Action", Icon: IconDownload },
  { label: "Switch theme", hint: "Action", Icon: IconAdjustmentsHorizontal },
];

export function CommandPanel() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const results = COMMANDS.filter((command) => command.label.toLowerCase().includes(query.trim().toLowerCase()));

  function onKeyDown(event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((index) => Math.min(results.length - 1, index + 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => Math.max(0, index - 1));
    }
    if (event.key === "Escape") setOpen(false);
  }

  return (
    <DemoShell
      title="Command menu"
      subtitle="Keyboard-first navigation"
      actions={<button type="button" className="d-primary-btn" onClick={() => { setOpen(true); setQuery(""); setActive(0); }}>Open command menu</button>}
      footer={<><span><kbd>⌘</kbd><kbd>K</kbd> or <kbd>Ctrl</kbd><kbd>K</kbd> from anywhere</span><span>{open ? "Escape closes" : "Click to try it"}</span></>}
    >
      <div className="d-command-demo">
        <div className="d-command-hint">
          <span className="d-command-key">⌘K</span>
          <h3>Move through the workspace without the mouse</h3>
          <p>Search records, create a task or jump to an object. The same menu works on every page.</p>
          <div className="d-command-list-static">
            {COMMANDS.slice(0, 4).map(({ label, hint, Icon }) => (
              <div key={label}><Icon size={12} /><span>{label}</span><small>{hint}</small></div>
            ))}
          </div>
        </div>
        {open && (
          <div className="d-command-overlay">
            <div className="d-command">
              <label className="d-command-input">
                <IconSearch size={13} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => { setQuery(event.target.value); setActive(0); }}
                  onKeyDown={onKeyDown}
                  placeholder="Search records, pages and actions"
                  aria-label="Command menu search"
                />
                <button type="button" onClick={() => setOpen(false)} aria-label="Close command menu"><IconX size={12} /></button>
              </label>
              <div className="d-command-results">
                {results.map(({ label, hint, Icon }, index) => (
                  <button type="button" key={label} className={active === index ? "active" : ""} onMouseEnter={() => setActive(index)} onClick={() => setOpen(false)}>
                    <Icon size={12} /><span>{label}</span><small>{hint}</small>
                  </button>
                ))}
                {results.length === 0 && <p>No commands match that search.</p>}
              </div>
              <div className="d-command-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>Enter</kbd> open</span><span><kbd>Esc</kbd> close</span></div>
            </div>
          </div>
        )}
      </div>
    </DemoShell>
  );
}

/* ------------------------------------------------------- recurring tasks */

export function RecurringTask() {
  const [done, setDone] = useState(false);
  const [next, setNext] = useState("Mon, Nov 16");

  function complete() {
    if (done) {
      setDone(false);
      setNext("Mon, Nov 16");
      return;
    }
    setDone(true);
    setNext("Mon, Nov 23");
  }

  return (
    <DemoShell
      title="Tasks"
      subtitle="Recurring follow-up"
      footer={<><span><IconRefresh size={12} /> Completing a task creates one next occurrence</span><span>Links stay attached</span></>}
    >
      <div className="d-task">
        <div className={`d-task-row ${done ? "is-done" : ""}`.trim()}>
          <button type="button" className="d-task-check" onClick={complete} aria-pressed={done} aria-label={done ? "Reopen task" : "Complete task"}>
            {done && <IconCheck size={10} />}
          </button>
          <div><strong>Send weekly pipeline note</strong><small><IconRefresh size={10} /> Repeats every Monday</small></div>
          <Tag tone="blue">Weekly</Tag>
        </div>
        <div className="d-task-next">
          <IconCalendar size={12} />
          <span>{done ? "Next occurrence created" : "Next occurrence"}</span>
          <strong>{next}</strong>
          <Tag tone={done ? "green" : "neutral"}>{done ? "Open" : "Scheduled"}</Tag>
        </div>
        <div className="d-task-next d-task-next--muted"><IconCircleCheck size={12} /><span>Links carried forward</span><strong>Lattice · Lattice renewal</strong></div>
        {done && <div className="d-flash" role="status"><IconCircleCheck size={12} /> Completed. One new occurrence, not two.</div>}
      </div>
    </DemoShell>
  );
}

/* --------------------------------------------------------------- merge */

export function MergePanel() {
  const [choice, setChoice] = useState({ email: "new", phone: "old" });
  const [merged, setMerged] = useState(false);

  return (
    <DemoShell
      title="Possible duplicate"
      subtitle="Two person records · matched on email"
      actions={<Tag tone="amber">Needs review</Tag>}
      footer={<><span><IconCheck size={12} /> Linked tasks, notes and deals move to the retained record</span><span>Nothing merges until you confirm</span></>}
    >
      <div className="d-merge">
        <div className="d-merge-cols">
          <section>
            <header><Avatar initials="MC" size="sm" tone="pink" /><span><strong>Maya Chen</strong><small>Created Mar 4 · 3 notes</small></span><Tag tone="neutral">Keep</Tag></header>
            <div className="d-merge-field"><span>Email</span><button type="button" className={choice.email === "old" ? "active" : ""} onClick={() => setChoice((value) => ({ ...value, email: "old" }))}>maya@helio.co</button></div>
            <div className="d-merge-field"><span>Phone</span><button type="button" className={choice.phone === "old" ? "active" : ""} onClick={() => setChoice((value) => ({ ...value, phone: "old" }))}>+1 415 555 0134</button></div>
          </section>
          <section>
            <header><Avatar initials="MC" size="sm" tone="purple" /><span><strong>Maya Chen</strong><small>Created Sep 18 · 2 tasks</small></span><Tag tone="blue">Duplicate</Tag></header>
            <div className="d-merge-field"><span>Email</span><button type="button" className={choice.email === "new" ? "active" : ""} onClick={() => setChoice((value) => ({ ...value, email: "new" }))}>maya@helio.systems</button></div>
            <div className="d-merge-field"><span>Phone</span><button type="button" className={choice.phone === "new" ? "active" : ""} onClick={() => setChoice((value) => ({ ...value, phone: "new" }))}>+1 415 555 0199</button></div>
          </section>
        </div>
        <div className="d-merge-bar">
          <span>{merged ? "Merged. One record, all links kept." : "Pick the value to keep in each field."}</span>
          <button type="button" className="d-primary-btn" onClick={() => setMerged((value) => !value)}>{merged ? "Undo merge" : "Merge records"} <IconArrowRight size={12} /></button>
        </div>
        {merged && <div className="d-flash" role="status"><IconCircleCheck size={12} /> 3 notes, 2 tasks and 1 opportunity moved to Maya Chen</div>}
      </div>
    </DemoShell>
  );
}

/* ------------------------------------------------------------- storage */

export function StoragePanel() {
  return (
    <DemoShell
      title="Where the data lives"
      subtitle="This browser profile"
      footer={<><span><i className="d-live-dot" /> No server copy</span><span>Clearing site data removes the workspace</span></>}
    >
      <div className="d-storage">
        <div className="d-storage-bar" aria-hidden="true">
          <i style={{ width: "46%" }} /><i style={{ width: "18%" }} /><i style={{ width: "9%" }} />
        </div>
        <div className="d-storage-key">
          <span><i /> Records and relationships</span>
          <span><i /> Views and custom fields</span>
          <span><i /> Workflows</span>
        </div>
        <div className="d-storage-rows">
          <div><span>Saved in this browser</span><strong>localStorage · linear-crm.v1</strong></div>
          <div><span>Sent to a server</span><strong>Nothing, unless you connect Liner</strong></div>
          <div><span>Included in a backup</span><strong>Records, links, views, workflows, settings</strong></div>
          <div><span>Not included</span><strong>Session-only AI connection key</strong></div>
        </div>
      </div>
    </DemoShell>
  );
}

/* ------------------------------------------------------------- overview */

export function OverviewPanel() {
  return (
    <DemoShell
      title="Workspace overview"
      subtitle="Good morning, Alex · Sunday, November 8"
      actions={<button type="button" className="d-primary-btn"><IconPlus size={12} /> New opportunity</button>}
      footer={<><span>Showing 18 of 18 opportunities</span><span>Task counts cover the whole workspace</span></>}
    >
      <div className="d-overview">
        <div className="d-overview-kpis">
          <div><span>Open pipeline</span><strong>$307.1k</strong><small>7 opportunities</small></div>
          <div><span>Weighted forecast</span><strong>$174.7k</strong><small>Probability weighted</small></div>
          <div><span>Won revenue</span><strong>$108k</strong><small>3 closed won</small></div>
          <div><span>Win rate</span><strong>60%</strong><small>3 won · 2 lost</small></div>
          <div><span>Open tasks</span><strong>14</strong><small>1 overdue</small></div>
        </div>
        <div className="d-overview-grid">
          <section className="d-overview-panel">
            <header><span><IconLayoutKanban size={12} /> Pipeline by stage</span><small>Open pipeline</small></header>
            {[["Prospecting", 2, 23500, 22], ["Qualified", 3, 44500, 42], ["Proposal", 4, 103000, 71], ["Negotiation", 4, 136500, 92]].map(([stage, count, amount, width]) => (
              <div className="d-stage-row" key={stage}>
                <div><Tag tone={stage === "Negotiation" ? "amber" : stage === "Proposal" ? "purple" : "blue"}>{stage}</Tag><small>{count} deals</small><span>{money(amount)}</span></div>
                <i><em style={{ width: `${width}%` }} /></i>
              </div>
            ))}
          </section>
          <section className="d-overview-panel">
            <header><span><IconCalendar size={12} /> Follow-up agenda</span><small>All tasks</small></header>
            {[["Return Quotient security questionnaire", "Lattice · Jordan Blake", "Nov 7", "red"], ["Schedule legal review with Luminous", "Luminous · Sam Rivera", "Today", "blue"], ["Align Catalog EU residency", "Catalog · Sam Rivera", "Today", "blue"], ["Send revised proposal to Layers", "Layers · Alex Morgan", "Nov 9", "neutral"], ["Share FeatherDev partner agreement", "FeatherDev · Maya Chen", "Nov 10", "neutral"]].map(([title, meta, date, tone]) => (
              <div className="d-agenda-row" key={title}>
                <span className="d-agenda-box" />
                <div><strong>{title}</strong><small>{meta}</small></div>
                <Tag tone={tone}>{date}</Tag>
              </div>
            ))}
          </section>
        </div>
      </div>
    </DemoShell>
  );
}

/* ------------------------------------------------------------- objects */

export function ObjectStrip() {
  const items = [
    ["Leads", IconUserSearch], ["People", IconUsers], ["Companies", IconBuildingSkyscraper],
    ["Opportunities", IconTargetArrow], ["Tasks", IconCheckbox], ["Notes", IconNotes],
    ["Projects", IconLayoutKanban], ["Invoices", IconFile], ["Campaigns", IconMail],
  ];
  return (
    <div className="d-objects">
      {items.map(([label, Icon]) => (
        <span key={label}><Icon size={14} />{label}</span>
      ))}
    </div>
  );
}
