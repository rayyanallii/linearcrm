import { RelationshipScene, ContextOrbit, HeroBrief } from "./LandingScenes";
import MarketingHome from "./MarketingHome";
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { AnimatePresence, motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { animate, stagger } from "animejs";
import {
  IconAdjustmentsHorizontal,
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
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
  IconFile,
  IconFilter,
  IconLayoutDashboard,
  IconLayoutKanban,
  IconLock,
  IconMail,
  IconMenu2,
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
  IconUserSearch,
  IconUsers,
  IconX,
  IconBolt,
} from "@tabler/icons-react";
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "./landing.css";
import "./landing-v2.css";
import "./landing-pages.css";
import "./landing-refined.css";
import "./marketing-editorial.css";

gsap.registerPlugin(ScrollTrigger);

const CRM_HREF = "./app.html";
const ROUTES = Object.freeze({
  home: "./index.html",
  platform: "./platform.html",
  product: "./product.html",
  resources: "./resources.html",
  customers: "./customers.html",
  pricing: "./pricing.html",
  crm: CRM_HREF,
});
const CURRENT_PAGE = document.body?.dataset?.page || "home";

function Logo({ tone = "ink", compact = false, className = "" }) {
  return (
    <span className={`landing-logo ${className}`}>
      <img
        className={`landing-logo-mark landing-logo-mark--${tone}`}
        src={`./public/brand/brand-linear-crm-${tone}.png`}
        alt=""
        width="38"
        height="30"
      />
      {!compact && <span>Linear CRM</span>}
    </span>
  );
}

function ArrowLink({ href, children, className = "" }) {
  return (
    <a className={`text-link ${className}`} href={href}>
      {children}
      <IconArrowRight size={14} stroke={1.8} />
    </a>
  );
}

const previewDeals = [
  {
    id: "northstar",
    name: "Northstar renewal",
    company: "Northstar Studio",
    stage: "Discovery",
    amount: "$42,000",
    owner: "AM",
    ownerName: "Alex Morgan",
    next: "Confirm security review",
    age: "2d",
    risk: false,
  },
  {
    id: "helio",
    name: "Helio workspace",
    company: "Helio Systems",
    stage: "Discovery",
    amount: "$18,400",
    owner: "MC",
    ownerName: "Maya Chen",
    next: "Add economic buyer",
    age: "9d",
    risk: true,
  },
  {
    id: "juniper",
    name: "Juniper rollout",
    company: "Juniper Health",
    stage: "Proposal",
    amount: "$64,000",
    owner: "SR",
    ownerName: "Sam Rivera",
    next: "Send revised proposal",
    age: "4d",
    risk: false,
  },
  {
    id: "cedar",
    name: "Cedar expansion",
    company: "Cedar & Co.",
    stage: "Proposal",
    amount: "$27,500",
    owner: "AM",
    ownerName: "Alex Morgan",
    next: "Proposal sent — follow up",
    age: "16d",
    risk: true,
  },
  {
    id: "vertex",
    name: "Vertex annual",
    company: "Vertex Labs",
    stage: "Negotiation",
    amount: "$96,000",
    owner: "JB",
    ownerName: "Jordan Blake",
    next: "Legal redlines",
    age: "6d",
    risk: false,
  },
  {
    id: "meridian",
    name: "Meridian pilot",
    company: "Meridian Works",
    stage: "Negotiation",
    amount: "$31,200",
    owner: "MC",
    ownerName: "Maya Chen",
    next: "Confirm start date",
    age: "3d",
    risk: false,
  },
];

const previewCompanies = [
  { id: "northstar", name: "Northstar Studio", domain: "northstar.studio", tier: "Strategic", people: 4, owner: "AM", color: "#dbeafe" },
  { id: "helio", name: "Helio Systems", domain: "helio.systems", tier: "Growth", people: 3, owner: "MC", color: "#ede9fe" },
  { id: "juniper", name: "Juniper Health", domain: "juniper.health", tier: "Growth", people: 6, owner: "SR", color: "#dcfce7" },
  { id: "cedar", name: "Cedar & Co.", domain: "cedarand.co", tier: "Standard", people: 2, owner: "AM", color: "#fef3c7" },
  { id: "vertex", name: "Vertex Labs", domain: "vertexlabs.io", tier: "Strategic", people: 5, owner: "JB", color: "#fee2e2" },
];

const previewPeople = [
  { id: "maya", name: "Maya Chen", role: "VP Revenue", company: "Helio Systems", email: "maya@helio.systems", status: "Qualified", owner: "MC", color: "#fce7f3" },
  { id: "theo", name: "Theo Marshall", role: "COO", company: "Northstar Studio", email: "theo@northstar.studio", status: "Customer", owner: "AM", color: "#e0e7ff" },
  { id: "isla", name: "Isla Harrington", role: "Head of Ops", company: "Juniper Health", email: "isla@juniper.health", status: "Customer", owner: "SR", color: "#d1fae5" },
  { id: "nathan", name: "Nathan Cole", role: "Founder", company: "Cedar & Co.", email: "nathan@cedarand.co", status: "Lead", owner: "AM", color: "#fef9c3" },
];

const previewLeads = [
  { id: "maya-lead", name: "Maya Chen", company: "Helio Systems", status: "Interested", source: "Inbound", owner: "MC", color: "#fce7f3" },
  { id: "nathan-lead", name: "Nathan Cole", company: "Cedar & Co.", status: "Replied", source: "Event", owner: "AM", color: "#fef9c3" },
  { id: "rae-lead", name: "Rae Kim", company: "Forage AI", status: "Not contacted", source: "Referral", owner: "SR", color: "#e0f2fe" },
];

const stageMeta = {
  Discovery: { tone: "slate", probability: "20%" },
  Proposal: { tone: "blue", probability: "55%" },
  Negotiation: { tone: "amber", probability: "75%" },
};

function Avatar({ initials, color = "#e5e7eb", size = "" }) {
  return (
    <span className={`mini-avatar ${size}`} style={{ background: color }} aria-hidden="true">
      {initials}
    </span>
  );
}

function Tag({ children, tone = "gray" }) {
  return <span className={`preview-tag preview-tag--${tone}`}>{children}</span>;
}

function ProductPreview() {
  const [view, setView] = useState("pipeline");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  const normalized = query.trim().toLowerCase();
  const matches = (item) => JSON.stringify(item).toLowerCase().includes(normalized);
  const filteredDeals = previewDeals.filter(matches);
  const filteredLeads = previewLeads.filter(matches);
  const filteredCompanies = previewCompanies.filter(matches);
  const filteredPeople = previewPeople.filter(matches);

  const views = [
    { key: "pipeline", label: "Opportunities", Icon: IconTargetArrow },
    { key: "leads", label: "Leads", Icon: IconUserSearch },
    { key: "companies", label: "Companies", Icon: IconBuildingSkyscraper },
    { key: "people", label: "People", Icon: IconUsers },
  ];

  function changeView(next) {
    setView(next);
    setQuery("");
    setSelected(null);
  }

  const labels = {
    pipeline: ["Opportunities", `${filteredDeals.length} open`],
    leads: ["Leads", `${filteredLeads.length} records`],
    companies: ["Companies", `${filteredCompanies.length} records`],
    people: ["People", `${filteredPeople.length} records`],
  };

  return (
    <div className="hero-frame-wrap" id="product">
      <div className="hero-frame">
        <div className="preview-window">
          <aside className="preview-sidebar" aria-label="Workspace preview navigation">
            <div className="preview-workspace">
              <span className="preview-workspace-mark">L</span>
              <span>
                <strong>Acme Studio</strong>
                <small>Sales workspace</small>
              </span>
              <IconChevronDown size={13} />
            </div>
            <div className="preview-quick">
              <span><IconSearch size={13} /> Quick find</span>
              <kbd>⌘K</kbd>
            </div>
            <div className="preview-nav-group">
              <small>Workspace</small>
              <span className="preview-nav-item"><IconLayoutDashboard size={14} /> Overview</span>
              <span className="preview-nav-item"><IconCheckbox size={14} /> Tasks <b>4</b></span>
            </div>
            <div className="preview-nav-group">
              <small>Sales</small>
              {views.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`preview-nav-item ${view === key ? "active" : ""}`}
                  onClick={() => changeView(key)}
                  aria-pressed={view === key}
                >
                  <Icon size={14} /> {label}
                  {key === "pipeline" && <b>6</b>}
                </button>
              ))}
            </div>
            <div className="preview-sidebar-foot">
              <Avatar initials="AM" color="#dbeafe" />
              <span><strong>Alex Morgan</strong><small>Workspace owner</small></span>
            </div>
          </aside>

          <div className="preview-main">
            <div className="preview-chrome">
              <div className="preview-dots" aria-hidden="true"><i /><i /><i /></div>
              <div className="preview-breadcrumb">
                <span>Acme Studio</span><IconChevronRight size={12} /><strong>{labels[view][0]}</strong>
              </div>
              <div className="preview-chrome-actions">
                <span className="live-chip"><i /> Live preview</span>
                <span className="chrome-avatar-stack"><Avatar initials="MC" color="#fce7f3" /><Avatar initials="SR" color="#dcfce7" /></span>
                <button type="button" className="chrome-icon" aria-label="Preview options"><IconDots size={15} /></button>
              </div>
            </div>

            <div className="preview-mobile-tabs" role="tablist" aria-label="Preview object">
              {views.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={view === key}
                  className={view === key ? "active" : ""}
                  onClick={() => changeView(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="preview-content">
              <div className="preview-view-head">
                <div>
                  <h3>{labels[view][0]}</h3>
                  <span>{labels[view][1]}</span>
                </div>
                <div className="preview-tools">
                  <label className="preview-search">
                    <IconSearch size={13} />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={`Search ${labels[view][0].toLowerCase()}…`}
                      aria-label={`Search ${labels[view][0].toLowerCase()}`}
                    />
                  </label>
                  <button type="button" className="preview-tool"><IconFilter size={13} /> Filter</button>
                  <button type="button" className="preview-tool preview-tool--icon" aria-label="View options"><IconAdjustmentsHorizontal size={14} /></button>
                </div>
              </div>

              {view === "pipeline" ? (
                <div className="preview-board">
                  {["Discovery", "Proposal", "Negotiation"].map((stage) => {
                    const deals = filteredDeals.filter((deal) => deal.stage === stage);
                    const total = deals.reduce((sum, deal) => sum + Number(deal.amount.replace(/[^0-9]/g, "")), 0);
                    return (
                      <section className="preview-column" key={stage}>
                        <header>
                          <span className={`stage-dot stage-dot--${stageMeta[stage].tone}`} />
                          <strong>{stage}</strong>
                          <small>{deals.length}</small>
                          <b>${Math.round(total / 1000)}k</b>
                        </header>
                        <div className="preview-column-body">
                          {deals.map((deal) => (
                            <button
                              type="button"
                              className="deal-card"
                              key={deal.id}
                              onClick={() => setSelected({ kind: "Opportunity", ...deal })}
                            >
                              <span className="deal-card-top">
                                <span className="company-symbol">{deal.company.slice(0, 1)}</span>
                                <span>{deal.company}</span>
                                {deal.risk && <span className="risk-dot" title="Needs attention" />}
                              </span>
                              <strong>{deal.name}</strong>
                              <span className="deal-card-value">{deal.amount}</span>
                              <span className="deal-card-next">{deal.next}</span>
                              <span className="deal-card-foot">
                                <Avatar initials={deal.owner} color="#eef2ff" size="xs" />
                                <span>{deal.age} in stage</span>
                              </span>
                            </button>
                          ))}
                          {!deals.length && <span className="preview-empty">No matching opportunities</span>}
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : (
                <PreviewTable
                  view={view}
                  leads={filteredLeads}
                  companies={filteredCompanies}
                  people={filteredPeople}
                  onSelect={setSelected}
                />
              )}
              <PreviewBrief view={view} />
            </div>

            {selected && <PreviewPeek record={selected} onClose={() => setSelected(null)} />}
          </div>
        </div>
      </div>
      <div className="hero-frame-caption">
        <span><i /> This is the actual interface, not a screenshot.</span>
        <a href={CRM_HREF}>Open your own workspace <IconArrowUpRight size={13} /></a>
      </div>
    </div>
  );
}

function PreviewBrief({ view }) {
  const copy = {
    pipeline: "Two deals need a next step before Friday.",
    leads: "Three inbound leads are ready for a first touch.",
    companies: "Northstar is the closest renewal this month.",
    people: "Two new stakeholders joined active accounts.",
  };
  return (
    <div className="preview-brief">
      <span className="preview-brief-icon"><IconSparkles size={13} /></span>
      <div><strong>Liner brief</strong><span>{copy[view]}</span></div>
      <a href="#platform">Review <IconArrowRight size={12} /></a>
    </div>
  );
}

function PreviewTable({ view, leads, companies, people, onSelect }) {
  if (view === "leads") {
    return (
      <div className="preview-table" role="table" aria-label="Leads preview">
        <div className="preview-table-head" role="row">
          <span>Lead</span><span>Company</span><span>Status</span><span>Source</span><span>Owner</span>
        </div>
        {leads.map((lead) => (
          <button type="button" className="preview-table-row" role="row" key={lead.id} onClick={() => onSelect({ kind: "Lead", ...lead })}>
            <span className="cell-person"><Avatar initials={lead.name.split(" ").map((part) => part[0]).join("")} color={lead.color} /><strong>{lead.name}</strong></span>
            <span>{lead.company}</span>
            <span><Tag tone={lead.status === "Interested" ? "green" : lead.status === "Replied" ? "purple" : "gray"}>{lead.status}</Tag></span>
            <span>{lead.source}</span>
            <span><Avatar initials={lead.owner} color="#eef2ff" size="xs" /> {lead.owner}</span>
          </button>
        ))}
        {!leads.length && <span className="preview-empty table-empty">No matching leads</span>}
      </div>
    );
  }
  if (view === "people") {
    return (
      <div className="preview-table" role="table" aria-label="People preview">
        <div className="preview-table-head" role="row">
          <span>Person</span><span>Company</span><span>Status</span><span>Email</span><span>Owner</span>
        </div>
        {people.map((person) => (
          <button type="button" className="preview-table-row" role="row" key={person.id} onClick={() => onSelect({ kind: "Person", ...person })}>
            <span className="cell-person"><Avatar initials={person.name.split(" ").map((part) => part[0]).join("")} color={person.color} /><strong>{person.name}</strong></span>
            <span>{person.company}</span>
            <span><Tag tone={person.status === "Customer" ? "green" : person.status === "Qualified" ? "blue" : "gray"}>{person.status}</Tag></span>
            <span className="cell-email">{person.email}</span>
            <span><Avatar initials={person.owner} color="#eef2ff" size="xs" /> {person.owner}</span>
          </button>
        ))}
        {!people.length && <span className="preview-empty table-empty">No matching people</span>}
      </div>
    );
  }
  return (
    <div className="preview-table" role="table" aria-label="Companies preview">
      <div className="preview-table-head" role="row">
        <span>Company</span><span>Domain</span><span>Tier</span><span>People</span><span>Owner</span>
      </div>
      {companies.map((company) => (
        <button type="button" className="preview-table-row" role="row" key={company.id} onClick={() => onSelect({ kind: "Company", ...company })}>
          <span className="cell-person"><span className="company-symbol" style={{ background: company.color }}>{company.name.slice(0, 1)}</span><strong>{company.name}</strong></span>
          <span>{company.domain}</span>
          <span><Tag tone={company.tier === "Strategic" ? "purple" : company.tier === "Growth" ? "blue" : "gray"}>{company.tier}</Tag></span>
          <span>{company.people} people</span>
          <span><Avatar initials={company.owner} color="#eef2ff" size="xs" /> {company.owner}</span>
        </button>
      ))}
      {!companies.length && <span className="preview-empty table-empty">No matching companies</span>}
    </div>
  );
}

function PreviewPeek({ record, onClose }) {
  const detail =
    record.kind === "Opportunity"
      ? [
          ["Company", record.company],
          ["Stage", record.stage],
          ["Amount", record.amount],
          ["Next step", record.next],
          ["Owner", record.ownerName],
        ]
      : record.kind === "Person"
        ? [["Company", record.company], ["Role", record.role], ["Email", record.email], ["Status", record.status], ["Owner", record.owner]]
        : record.kind === "Company"
          ? [["Domain", record.domain], ["Tier", record.tier], ["People", `${record.people} linked`], ["Owner", record.owner]]
          : [["Company", record.company], ["Status", record.status], ["Source", record.source], ["Owner", record.owner]];

  return (
    <aside className="preview-peek" aria-label={`${record.name} preview`}>
      <header>
        <span className="preview-kind">{record.kind}</span>
        <button type="button" aria-label="Close record preview" onClick={onClose}><IconX size={15} /></button>
      </header>
      <div className="preview-peek-title">
        <span className="company-symbol">{record.name.slice(0, 1)}</span>
        <div><h4>{record.name}</h4><small>{record.kind === "Opportunity" ? record.company : record.kind === "Person" ? record.role : "Linked record"}</small></div>
      </div>
      <div className="preview-peek-fields">
        {detail.map(([label, value]) => (
          <div key={label}><span>{label}</span><strong>{value}</strong></div>
        ))}
      </div>
      <div className="preview-peek-links">
        <span><IconNotes size={13} /> 3 notes</span>
        <span><IconCheckbox size={13} /> 2 tasks</span>
        <span><IconPaperclip size={13} /> 1 file</span>
      </div>
      <a className="preview-peek-link" href={CRM_HREF}>Open the live CRM <IconArrowUpRight size={13} /></a>
    </aside>
  );
}

const objectStrip = [
  ["Leads", IconUserSearch],
  ["People", IconUsers],
  ["Companies", IconBuildingSkyscraper],
  ["Opportunities", IconTargetArrow],
  ["Tasks", IconCheckbox],
  ["Notes", IconNotes],
  ["Campaigns", IconMail],
  ["Invoices", IconFile],
];

const platformTabs = [
  { key: "pipeline", label: "Pipeline", Icon: IconLayoutKanban },
  { key: "model", label: "Data model", Icon: IconDatabase },
  { key: "workflows", label: "Workflows", Icon: IconBolt },
  { key: "liner", label: "Liner", Icon: IconSparkles },
];

const focusDeals = [
  { name: "Northstar renewal", company: "Northstar Studio", stage: "Negotiation", amount: "$42,000", risk: "No next step", tone: "red" },
  { name: "Helio workspace", company: "Helio Systems", stage: "Discovery", amount: "$18,400", risk: "9 days quiet", tone: "amber" },
  { name: "Juniper rollout", company: "Juniper Health", stage: "Proposal", amount: "$64,000", risk: "Close date passed", tone: "red" },
  { name: "Cedar expansion", company: "Cedar & Co.", stage: "Proposal", amount: "$27,500", risk: "Follow-up sent", tone: "green" },
  { name: "Vertex annual", company: "Vertex Labs", stage: "Negotiation", amount: "$96,000", risk: "Legal review", tone: "green" },
];

function PlatformShowcase() {
  const [tab, setTab] = useState("pipeline");

  return (
    <section className="section platform-section" id="platform">
      <div className="section-heading section-heading--center">
        <span className="eyebrow">The platform</span>
        <h2>One workspace. Every moving part.</h2>
        <p>
          Records, pipeline, automation and context share the same foundation.
          Switch views below to see how the pieces fit together.
        </p>
      </div>
      <div className="platform-tabs" role="tablist" aria-label="Product previews">
        {platformTabs.map(({ key, label, Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={tab === key ? "active" : ""}
            onClick={() => setTab(key)}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>
      <div className="platform-frame" role="tabpanel" aria-label={`${platformTabs.find((item) => item.key === tab)?.label} preview`}>
        {tab === "pipeline" && <PipelineFocus />}
        {tab === "model" && <DataModel />}
        {tab === "workflows" && <WorkflowDemo />}
        {tab === "liner" && <LinerDemo />}
      </div>
    </section>
  );
}

function PanelTop({ title, subtitle, children }) {
  return (
    <div className="panel-top">
      <div className="panel-title">
        <span className="mini-app-mark">L</span>
        <div><strong>{title}</strong><small>{subtitle}</small></div>
      </div>
      <div className="panel-top-actions">{children}</div>
    </div>
  );
}

function PipelineFocus() {
  const [focus, setFocus] = useState(false);
  const [completed, setCompleted] = useState([]);
  const visible = focus ? focusDeals.filter((deal) => deal.tone !== "green") : focusDeals;

  return (
    <div className="focus-demo">
      <PanelTop title="Pipeline focus" subtitle="This week · 5 opportunities">
        <button
          type="button"
          className={`focus-toggle ${focus ? "active" : ""}`}
          onClick={() => setFocus((value) => !value)}
          aria-pressed={focus}
        >
          <IconTargetArrow size={14} /> Focus mode
        </button>
        <button type="button" className="panel-button"><IconPlus size={14} /> New opportunity</button>
      </PanelTop>
      <div className="focus-summary">
        <div><span>Open pipeline</span><strong>$247,900</strong></div>
        <div><span>Weighted forecast</span><strong>$157,500</strong></div>
        <div><span>Needs attention</span><strong className="danger">2 deals</strong></div>
        <div className="focus-summary-note">{focus ? "Showing the deals that need a decision." : "All open opportunities, sorted by urgency."}</div>
      </div>
      <div className="focus-table" role="table" aria-label="Opportunity focus list">
        <div className="focus-row focus-row--head" role="row">
          <span>Opportunity</span><span>Stage</span><span>Signal</span><span>Amount</span><span>Next step</span><span />
        </div>
        {visible.map((deal) => {
          const done = completed.includes(deal.name);
          return (
            <div className={`focus-row ${done ? "is-done" : ""}`} role="row" key={deal.name}>
              <span className="focus-opportunity"><span className="company-symbol">{deal.name.slice(0, 1)}</span><span><strong>{deal.name}</strong><small>{deal.company}</small></span></span>
              <span><Tag tone="gray">{deal.stage}</Tag></span>
              <span><Tag tone={deal.tone}>{done ? "Caught up" : deal.risk}</Tag></span>
              <span className="focus-amount">{deal.amount}</span>
              <span className="focus-next">{done ? "Follow-up complete" : "Schedule a next step"}</span>
              <button
                type="button"
                className={`focus-check ${done ? "checked" : ""}`}
                aria-label={done ? `Undo ${deal.name}` : `Mark ${deal.name} reviewed`}
                onClick={() => setCompleted((items) => done ? items.filter((item) => item !== deal.name) : [...items, deal.name])}
              >
                {done ? <IconCheck size={13} /> : <IconClock size={13} />}
              </button>
            </div>
          );
        })}
      </div>
      <div className="panel-foot">
        <span><IconCircleCheck size={14} /> Updated locally as you work</span>
        <span>Click the clock to mark a deal reviewed.</span>
      </div>
    </div>
  );
}

const objectModel = {
  leads: {
    label: "Leads",
    icon: IconUserSearch,
    count: "128 records",
    fields: ["Name", "Status", "Email", "Company name", "Source", "Owner", "Next follow-up", "Business needs"],
    relations: ["Campaign", "Tasks", "Notes", "Emails"],
    note: "Raw prospects live here until they are qualified or moved.",
  },
  people: {
    label: "People",
    icon: IconUsers,
    count: "342 records",
    fields: ["Full name", "Job title", "Email", "Status", "Company", "Owner", "Last contacted"],
    relations: ["Company", "Opportunities", "Tasks", "Notes", "Files"],
    note: "The humans behind every conversation and deal.",
  },
  companies: {
    label: "Companies",
    icon: IconBuildingSkyscraper,
    count: "86 records",
    fields: ["Company name", "Domain", "Industry", "Relationship status", "Tier", "Owner", "Renewal date"],
    relations: ["People", "Opportunities", "Projects", "Tickets", "Invoices"],
    note: "One account record for every customer relationship.",
  },
  opportunities: {
    label: "Opportunities",
    icon: IconTargetArrow,
    count: "24 records",
    fields: ["Name", "Stage", "Amount", "Probability", "Close date", "Company", "Primary contact", "Next step"],
    relations: ["Company", "Person", "Tasks", "Notes", "Products"],
    note: "Revenue in motion, with a next step attached to every deal.",
  },
};

function DataModel() {
  const [active, setActive] = useState("leads");
  const obj = objectModel[active];
  const ActiveIcon = obj.icon;
  return (
    <div className="model-demo">
      <PanelTop title="Data model" subtitle="Objects, fields and relationships">
        <button type="button" className="panel-button"><IconPlus size={14} /> Custom object</button>
      </PanelTop>
      <div className="model-layout">
        <nav className="model-objects" aria-label="Objects">
          <small>Objects</small>
          {Object.entries(objectModel).map(([key, value]) => {
            const Icon = value.icon;
            return (
              <button key={key} type="button" className={active === key ? "active" : ""} onClick={() => setActive(key)}>
                <span className="model-object-icon"><Icon size={15} /></span>
                <span><strong>{value.label}</strong><small>{value.count}</small></span>
                <IconChevronRight size={13} />
              </button>
            );
          })}
        </nav>
        <div className="model-main">
          <header>
            <span className="model-hero-icon"><ActiveIcon size={19} /></span>
            <div><h3>{obj.label}</h3><p>{obj.note}</p></div>
            <Tag tone="green">Live schema</Tag>
          </header>
          <div className="model-fields">
            <div className="model-section-label"><span>Fields</span><small>{obj.fields.length} properties</small></div>
            <div className="model-field-grid">
              {obj.fields.map((field, index) => (
                <div className="model-field" key={field}>
                  <span className={`field-type field-type--${index % 3}`}>{["Aa", "#", "◷"][index % 3]}</span>
                  <strong>{field}</strong>
                  <span>{["Text", "Select", "Owner", "Relation"][index % 4]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="model-relations">
            <span>Relationships</span>
            <div>{obj.relations.map((relation) => <Tag tone="blue" key={relation}>{relation}</Tag>)}</div>
          </div>
        </div>
      </div>
      <div className="panel-foot"><span><IconDatabase size={14} /> Everything is stored as local records</span><span>Click an object to inspect it.</span></div>
    </div>
  );
}

function WorkflowDemo() {
  const [enabled, setEnabled] = useState(true);
  const [runs, setRuns] = useState(24);
  const [flash, setFlash] = useState("");
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function run() {
    if (!enabled) return;
    setRuns((value) => value + 1);
    setFlash("Run complete · follow-up task created");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setFlash(""), 2600);
  }

  return (
    <div className="workflow-demo">
      <PanelTop title="Follow-up workflow" subtitle="Opportunity automation">
        <button
          type="button"
          className={`live-toggle ${enabled ? "on" : ""}`}
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((value) => !value)}
        >
          <span>{enabled ? "Live" : "Paused"}</span><i />
        </button>
        <button type="button" className="panel-button" onClick={run} disabled={!enabled}>
          <IconPlayerPlay size={14} /> Run now
        </button>
      </PanelTop>
      <div className="workflow-canvas">
        <div className="workflow-grid" aria-hidden="true" />
        <div className="workflow-meta">
          <span><i className={enabled ? "on" : ""} /> {enabled ? "Listening for stage changes" : "Workflow is paused"}</span>
          <small>{runs} runs this month</small>
        </div>
        <div className="workflow-nodes">
          <div className="workflow-node workflow-node--trigger">
            <span className="node-icon"><IconBolt size={15} /></span>
            <div><small>Trigger</small><strong>Opportunity stage changes</strong></div>
          </div>
          <span className="workflow-connector"><i /></span>
          <div className="workflow-node">
            <span className="node-icon"><IconFilter size={15} /></span>
            <div><small>Condition</small><strong>Stage is Qualified</strong></div>
          </div>
          <span className="workflow-connector"><i /></span>
          <div className="workflow-node workflow-node--action">
            <span className="node-icon"><IconCheckbox size={15} /></span>
            <div><small>Action</small><strong>Create follow-up task</strong><em>Due in 2 days · owner assigned</em></div>
          </div>
          <span className="workflow-connector"><i /></span>
          <div className="workflow-node">
            <span className="node-icon"><IconNotes size={15} /></span>
            <div><small>Action</small><strong>Log activity to the record</strong></div>
          </div>
        </div>
        <div className="workflow-history">
          <span>Recent runs</span>
          <div><i className="success" /><span>Follow-up task created</span><small>Just now</small></div>
          <div><i /><span>Follow-up task created</span><small>2h ago</small></div>
          <div><i /><span>Follow-up task created</span><small>Yesterday</small></div>
        </div>
        {flash && <div className="workflow-flash" role="status"><IconCircleCheck size={14} /> {flash}</div>}
      </div>
      <div className="panel-foot"><span><IconBolt size={14} /> Workflows run against local records</span><span>Toggle Live or run it manually.</span></div>
    </div>
  );
}

const linerAnswers = {
  attention: "Two deals need a decision: Northstar renewal has no next step, and Helio workspace has been quiet for nine days. I would start with Northstar because the renewal date is closest.",
  pipeline: "Open pipeline is $247,900 across five opportunities. Weighted forecast is $157,500. Negotiation holds the most value, but Proposal has the oldest untouched deal.",
  followup: "Drafted: “Hi Theo — I wanted to close the loop on the security review and confirm the two open questions from Friday. Would a 20-minute call tomorrow help us keep the renewal on track?”",
  tasks: "You have four tasks open. The two that matter today are “Send Northstar security docs” and “Confirm Juniper proposal call”. Both are linked to live opportunities.",
  fallback: "In this sample workspace I can see five opportunities, four companies and three open tasks. Ask me about pipeline, deal risk, follow-ups or your week.",
};

function LinerDemo() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Morning, Alex. Your pipeline moved overnight. Want the short version or the deal-by-deal one?" },
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
    if (text.includes("attention") || text.includes("risk") || text.includes("stalled") || text.includes("focus")) return linerAnswers.attention;
    if (text.includes("pipeline") || text.includes("forecast") || text.includes("summar")) return linerAnswers.pipeline;
    if (text.includes("follow") || text.includes("email") || text.includes("draft")) return linerAnswers.followup;
    if (text.includes("task") || text.includes("today") || text.includes("week")) return linerAnswers.tasks;
    return linerAnswers.fallback;
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
    }, 500);
  }

  return (
    <div className="liner-demo">
      <PanelTop title="Liner" subtitle="Your workspace assistant">
        <span className="liner-status"><i /> Workspace context on</span>
        <button type="button" className="panel-button panel-button--icon" aria-label="Liner options"><IconDots size={15} /></button>
      </PanelTop>
      <div className="liner-layout">
        <aside className="liner-context">
          <span className="liner-orb"><IconSparkles size={18} /></span>
          <h3>Ask across the workspace.</h3>
          <p>Liner reads the records already in front of you. No copying context into another tab.</p>
          <div className="liner-context-list">
            <span><IconTargetArrow size={14} /> Pipeline and forecast</span>
            <span><IconAlertTriangle size={14} /> Deal risk</span>
            <span><IconNotes size={14} /> Notes and follow-ups</span>
          </div>
          <small>Sample responses use the demo workspace.</small>
        </aside>
        <div className="liner-chat">
          <div className="liner-messages" ref={scrollRef} aria-live="polite">
            {messages.map((message, index) => (
              <div className={`liner-message liner-message--${message.role}`} key={`${message.role}-${index}`}>
                {message.role === "assistant" && <span className="liner-avatar"><IconSparkles size={12} /></span>}
                <div>{message.text}</div>
              </div>
            ))}
            {thinking && <div className="liner-message liner-message--assistant"><span className="liner-avatar"><IconSparkles size={12} /></span><div className="typing"><i /><i /><i /></div></div>}
          </div>
          <div className="liner-prompts">
            {["What needs attention?", "Summarize my pipeline", "Draft a follow-up"].map((prompt) => (
              <button type="button" key={prompt} onClick={() => send(prompt)}>{prompt}</button>
            ))}
          </div>
          <form className="liner-input" onSubmit={(event) => { event.preventDefault(); send(); }}>
            <IconSparkles size={15} />
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask Liner about this workspace…" aria-label="Ask Liner" />
            <button type="submit" aria-label="Send message" disabled={!input.trim() || thinking}><IconArrowRight size={15} /></button>
          </form>
        </div>
      </div>
    </div>
  );
}

const moveTargets = {
  People: {
    icon: IconUsers,
    name: "Maya Chen",
    company: "Helio Systems",
    status: "Interested",
    description: "Person record with company, owner, campaign and notes attached.",
  },
  Companies: {
    icon: IconBuildingSkyscraper,
    name: "Helio Systems",
    company: "helio.systems",
    status: "Prospect",
    description: "Company record with domain, industry, people and opportunity history.",
  },
};

function MoveDemo() {
  const [target, setTarget] = useState("People");
  const [moved, setMoved] = useState(false);
  const current = moveTargets[target];
  const TargetIcon = current.icon;

  function changeTarget(next) {
    setTarget(next);
    setMoved(false);
  }

  return (
    <div className="move-demo">
      <div className="move-demo-toolbar">
        <div className="move-targets" role="group" aria-label="Move destination">
          {Object.entries(moveTargets).map(([key, value]) => {
            const Icon = value.icon;
            return (
              <button type="button" key={key} className={target === key ? "active" : ""} onClick={() => changeTarget(key)} aria-pressed={target === key}>
                <Icon size={14} /> {key}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={`demo-move-button ${moved ? "moved" : ""}`}
          onClick={() => setMoved((value) => !value)}
          aria-label={moved ? `Move ${current.name} back to Leads` : `Move Maya Chen to ${target}`}
        >
          {moved ? <><IconArrowLeft size={14} /> Move back to Leads</> : <>Move to {target} <IconArrowRight size={14} /></>}
        </button>
      </div>

      <div className="move-columns">
        <section className="move-column">
          <header><span><IconUserSearch size={15} /> Leads</span><b>{moved ? "0" : "1"}</b></header>
          {!moved ? (
            <div className="move-record move-record--lead">
              <span className="move-record-top"><Avatar initials="MC" color="#fce7f3" /><span><strong>Maya Chen</strong><small>Helio Systems</small></span><Tag tone="green">Interested</Tag></span>
              <span className="move-record-meta"><span><IconMail size={12} /> maya@helio.systems</span><span><IconUserSearch size={12} /> Inbound</span></span>
              <span className="move-record-links"><span><IconNotes size={12} /> 3 notes</span><span><IconCheckbox size={12} /> 2 tasks</span><span><IconPaperclip size={12} /> 1 file</span></span>
            </div>
          ) : (
            <div className="move-empty"><IconCircleCheck size={18} /><strong>Lead moved</strong><span>Nothing left behind.</span></div>
          )}
        </section>

        <div className={`move-connector ${moved ? "active" : ""}`} aria-hidden="true">
          <span /><IconArrowRight size={15} /><span />
        </div>

        <section className="move-column move-column--target">
          <header><span><TargetIcon size={15} /> {target}</span><b>{moved ? "1" : "0"}</b></header>
          {moved ? (
            <div className="move-record move-record--arrived">
              <span className="move-record-top"><Avatar initials={target === "People" ? "MC" : "H"} color={target === "People" ? "#fce7f3" : "#ede9fe"} /><span><strong>{current.name}</strong><small>{current.company}</small></span><Tag tone="blue">{current.status}</Tag></span>
              <span className="move-record-meta"><span><IconUserSearch size={12} /> From Leads</span><span><IconClock size={12} /> Just now</span></span>
              <span className="move-record-links"><span><IconCheckbox size={12} /> 2 tasks kept</span><span><IconNotes size={12} /> 3 notes kept</span><span><IconPaperclip size={12} /> 1 file kept</span></span>
            </div>
          ) : (
            <div className="move-empty move-empty--idle"><TargetIcon size={18} /><strong>No {target.toLowerCase()} yet</strong><span>{current.description}</span></div>
          )}
        </section>
      </div>

      <div className="move-activity" aria-live="polite">
        <span className={`move-activity-dot ${moved ? "active" : ""}`} />
        {moved ? `Moved 1 Lead to ${target} · links, files and history preserved` : "Ready when you are. The record keeps its id, links and history either way."}
      </div>
    </div>
  );
}

const recordTabs = {
  activity: [
    { icon: IconMail, title: "Email sent to Theo Marshall", meta: "Renewal security review · 2h ago" },
    { icon: IconNotes, title: "Note added by Alex Morgan", meta: "“Legal wants SSO before signature.” · Yesterday" },
    { icon: IconCheckbox, title: "Task completed", meta: "Send security documentation · Mon" },
    { icon: IconTargetArrow, title: "Stage changed to Negotiation", meta: "Northstar renewal · Last week" },
  ],
  notes: [
    { icon: IconNotes, title: "Renewal call — Theo, Isla", meta: "Procurement is aligned. Security review is the only gate. · Oct 28" },
    { icon: IconNotes, title: "Account research", meta: "Two new stakeholders joined the data team. Expansion likely in Q1. · Oct 21" },
  ],
  files: [
    { icon: IconFile, title: "Northstar renewal.pdf", meta: "1.8 MB · Uploaded by Alex Morgan" },
    { icon: IconFile, title: "Security overview.pdf", meta: "840 KB · Shared with the customer" },
  ],
};

function RecordMemory() {
  const [tab, setTab] = useState("activity");
  return (
    <section className="section memory-section" id="context">
      <div className="memory-copy">
        <span className="eyebrow eyebrow--light">Every record, connected</span>
        <h2>The story stays with the customer.</h2>
        <p>
          Notes, files, follow-ups and stage changes land on the record automatically.
          Open a company and see the people, opportunities and conversations behind it.
        </p>
        <ul className="check-list check-list--light">
          <li><IconCheck size={14} /> One timeline for every relationship</li>
          <li><IconCheck size={14} /> Linked people, opportunities and tasks</li>
          <li><IconCheck size={14} /> Activity recorded locally, owned by you</li>
        </ul>
        <ArrowLink href={`${CRM_HREF}#companies`} className="text-link--light">Explore a live record</ArrowLink>
      </div>
      <div className="memory-panel-wrap">
        <div className="memory-panel">
          <header className="memory-panel-head">
            <div className="memory-brand">
              <span className="company-symbol company-symbol--dark">N</span>
              <div><strong>Northstar Studio</strong><small>Strategic account · Active customer</small></div>
            </div>
            <div className="memory-head-actions"><Tag tone="green">Healthy</Tag><button type="button" aria-label="Record options"><IconDots size={16} /></button></div>
          </header>
          <div className="memory-record-grid">
            <div className="memory-record-main">
              <div className="memory-record-title"><h3>Northstar renewal</h3><Tag tone="amber">Negotiation</Tag></div>
              <div className="memory-fields">
                <div><span>Amount</span><strong>$42,000</strong></div>
                <div><span>Owner</span><strong><Avatar initials="AM" color="#dbeafe" size="xs" /> Alex Morgan</strong></div>
                <div><span>Close date</span><strong>Nov 22, 2026</strong></div>
                <div><span>Next step</span><strong>Security review</strong></div>
              </div>
              <div className="memory-relations">
                <span>Linked records</span>
                <div><Tag tone="blue">Theo Marshall</Tag><Tag tone="purple">4 people</Tag><Tag tone="gray">3 tasks</Tag></div>
              </div>
            </div>
            <div className="memory-timeline">
              <div className="memory-tabs" role="tablist" aria-label="Record detail views">
                {Object.keys(recordTabs).map((key) => (
                  <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>
                    {key}
                  </button>
                ))}
              </div>
              <div className="memory-items">
                {recordTabs[tab].map(({ icon: Icon, title, meta }, index) => (
                  <div className="memory-item" key={`${tab}-${index}`}>
                    <span className="memory-item-icon"><Icon size={14} /></span>
                    <div><strong>{title}</strong><small>{meta}</small></div>
                  </div>
                ))}
              </div>
              <button type="button" className="memory-add"><IconPlus size={13} /> Add {tab === "activity" ? "note" : tab === "notes" ? "note" : "file"}</button>
            </div>
          </div>
          <img className="memory-watermark" src="./public/brand/brand-linear-crm-white.png" alt="" />
        </div>
      </div>
    </section>
  );
}

const featureCards = [
  {
    key: "focus",
    eyebrow: "Pipeline focus",
    title: "Know the next move before the meeting.",
    body: "Next steps, follow-up dates and risk signals sit beside every opportunity. Focus mode strips the rest away.",
    visual: "focus",
  },
  {
    key: "repeat",
    eyebrow: "Follow-ups",
    title: "The follow-up that remembers itself.",
    body: "Repeat a task daily, weekly or monthly. Completing it creates the next occurrence with every CRM link intact.",
    visual: "repeat",
  },
  {
    key: "local",
    eyebrow: "Local-first",
    title: "Your workspace stays yours.",
    body: "Records live in this browser, not in someone else's cloud. Back up the whole workspace as one JSON file whenever you want.",
    visual: "local",
  },
];

function FeatureCard({ card }) {
  return (
    <article className={`feature-card feature-card--${card.key}`}>
      <span className="eyebrow">{card.eyebrow}</span>
      <h3>{card.title}</h3>
      <p>{card.body}</p>
      <div className="feature-visual" aria-hidden="true">
        {card.visual === "focus" && (
          <div className="mini-focus">
            <div className="mini-focus-head"><span><IconTargetArrow size={13} /> Needs attention</span><Tag tone="red">2</Tag></div>
            <div className="mini-focus-row"><span className="risk-bar" /><span><strong>Northstar renewal</strong><small>No next step</small></span><Tag tone="red">At risk</Tag></div>
            <div className="mini-focus-row"><span className="risk-bar risk-bar--amber" /><span><strong>Helio workspace</strong><small>9 days quiet</small></span><Tag tone="amber">Stalled</Tag></div>
            <div className="mini-focus-row is-safe"><span className="risk-bar risk-bar--green" /><span><strong>Juniper rollout</strong><small>Call booked</small></span><Tag tone="green">On track</Tag></div>
          </div>
        )}
        {card.visual === "repeat" && (
          <div className="mini-repeat">
            <div className="mini-task">
              <span className="mini-checkbox"><IconCheck size={10} /></span>
              <span><strong>Send weekly pipeline note</strong><small><IconRefresh size={11} /> Repeats every Monday</small></span>
              <Tag tone="blue">Weekly</Tag>
            </div>
            <div className="repeat-next"><IconCalendar size={13} /><span>Next occurrence</span><strong>Mon, Nov 9</strong><Tag tone="gray">Open</Tag></div>
            <div className="repeat-next repeat-next--muted"><IconCircleCheck size={13} /><span>Links carried forward</span><strong>Company · Opportunity</strong></div>
          </div>
        )}
        {card.visual === "local" && (
          <div className="mini-local">
            <div className="local-status"><span><IconLock size={13} /> Stored in this browser</span><Tag tone="green">Saved</Tag></div>
            <div className="local-meter"><span style={{ width: "68%" }} /></div>
            <div className="local-meta"><span>Workspace data</span><strong>2.4 MB</strong></div>
            <div className="local-backup"><IconDatabase size={15} /><span><strong>One-file backup</strong><small>Records, links and settings</small></span><span className="fake-button"><IconArrowUpRight size={12} /> Export</span></div>
          </div>
        )}
      </div>
    </article>
  );
}

function Features() {
  return (
    <section className="section features-section" id="workflows">
      <div className="section-heading section-heading--split">
        <div>
          <span className="eyebrow">Built for the work</span>
          <h2>Less admin. More relationship.</h2>
        </div>
        <p>
          The best CRM is the one that disappears into the way you already work.
          Linear keeps the structure without the ceremony.
        </p>
      </div>
      <div className="feature-grid">
        {featureCards.map((card) => <FeatureCard card={card} key={card.key} />)}
      </div>
    </section>
  );
}

function Stats() {
  return (
    <section className="stats-band" aria-label="Product facts">
      <div><strong>1</strong><span>browser workspace</span></div>
      <div><strong>100%</strong><span>local by default</span></div>
      <div><strong>0</strong><span>sign-ups required</span></div>
      <div><strong>8</strong><span>connected object types</span></div>
    </section>
  );
}

const platformMenuColumns = [
  {
    title: "Context",
    items: [
      { title: "Universal context", description: "Every call, note and change on the record", href: ROUTES.platform + "#context" },
      { title: "Data model", description: "Objects, fields and relationships", href: ROUTES.product + "#data-model" },
      { title: "Record moves", description: "Move a lead without losing history", href: ROUTES.product + "#records" },
      { title: "Local-first", description: "Your workspace stays in your browser", href: ROUTES.resources + "#local-first" },
    ],
  },
  {
    title: "Orchestration",
    items: [
      { title: "Pipeline", description: "A next step on every open deal", href: ROUTES.platform + "#pipeline" },
      { title: "Workflows", description: "Automate the follow-up, not the relationship", href: ROUTES.platform + "#workflows" },
      { title: "Liner", description: "Ask the workspace a direct question", href: ROUTES.platform + "#assistant" },
      { title: "Forecast", description: "Coverage and risk without the spreadsheet", href: ROUTES.platform + "#forecast" },
    ],
  },
  {
    title: "Ecosystem",
    items: [
      { title: "CSV import", description: "Bring the book with you", href: ROUTES.resources + "#import-export" },
      { title: "One-file backup", description: "Take the whole workspace with you", href: ROUTES.resources + "#backup" },
      { title: "Saved views", description: "The same view every time you open it", href: ROUTES.product + "#views" },
      { title: "Keyboard-first", description: "Move through the workspace without the mouse", href: ROUTES.resources + "#keyboard" },
    ],
  },
];

function MegaMenu({ onClose }) {
  return (
    <motion.div
      className="lg-mega"
      id="platform-menu"
      initial={{ opacity: 0, y: -7 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="lg-mega-grid">
        {platformMenuColumns.map((column) => (
          <section className="lg-mega-column" key={column.title}>
            <span>{column.title}</span>
            {column.items.map((item) => (
              <a href={item.href} onClick={onClose} key={item.title}>
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </a>
            ))}
          </section>
        ))}
      </div>
      <aside className="lg-mega-aside">
        <span>Personal project · no backend</span>
        <a href={CRM_HREF} onClick={onClose}>Open the CRM <IconArrowUpRight size={13} /></a>
        <a href={ROUTES.platform} onClick={onClose}>Platform overview</a>
        <a href={ROUTES.product} onClick={onClose}>Product tour</a>
        <a href={ROUTES.resources + "#no-backend"} onClick={onClose}>How it runs</a>
        <a href={ROUTES.resources} onClick={onClose}>Resources</a>
      </aside>
    </motion.div>
  );
}

function Hero() {
  const heroRef = useRef(null);

  useEffect(() => {
    if (!heroRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.from(".lg-hero-reveal", {
        y: 20,
        opacity: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: "power3.out",
        clearProps: "opacity,transform",
      });
    }, heroRef);
    return () => context.revert();
  }, []);

  return (
    <section className="lg-hero" ref={heroRef}>
      <div className="lg-hero-glow" aria-hidden="true" />
      <a className="lg-hero-pill lg-hero-reveal" href="#platform">
        <i /> Customer relationships, without the busywork
        <IconArrowRight size={13} />
      </a>
      <h1 className="lg-hero-reveal">
        Customer relationships, <span>amplified.</span>
      </h1>
      <p className="lg-hero-sub lg-hero-reveal">
        The local-first workspace that builds pipeline, advances deals and keeps
        every conversation attached to the record.
      </p>
      <div className="lg-actions lg-hero-reveal">
        <a className="lg-button lg-button--dark" href={CRM_HREF}>
          Open the CRM <IconArrowUpRight size={15} />
        </a>
        <a className="lg-button lg-button--outline" href="#platform">
          See the platform <IconChevronDown size={15} />
        </a>
      </div>
      <div className="lg-hero-note lg-hero-reveal">
        <span><IconCheck size={12} /> No sign-up</span>
        <span><IconCheck size={12} /> Sample data included</span>
        <span><IconCheck size={12} /> Local by default</span>
      </div>
      <div className="lg-hero-product lg-hero-reveal">
        <ProductPreview />
        <HeroBrief />
      </div>
    </section>
  );
}

function ObjectBand() {
  return (
    <section className="lg-object-band" aria-label="Workspace objects">
      <p>Every record your revenue team touches, connected in one place.</p>
      <div className="lg-object-grid">
        {objectStrip.map(([label, Icon]) => (
          <span key={label}><Icon size={15} />{label}</span>
        ))}
      </div>
    </section>
  );
}

const forecastPeriods = {
  quarter: {
    label: "This quarter",
    heading: "Q4 2026",
    committed: "$187.4k",
    best: "$248.2k",
    coverage: "3.1×",
    delta: "+8.4%",
    bars: [38, 54, 46, 68, 61, 82],
    months: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    answer: "Coverage improved 0.4× this week. Northstar and Juniper moved into Proposal, while Helio still has no next step.",
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
    answer: "Next-quarter coverage is ahead of plan. The open question is renewal timing: three accounts renew in the first six weeks.",
  },
};

function ForecastDemo() {
  const [period, setPeriod] = useState("quarter");
  const chartRef = useRef(null);
  const current = forecastPeriods[period];

  useEffect(() => {
    if (!chartRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bars = chartRef.current.querySelectorAll(".lg-bar > span");
    animate(bars, {
      scaleY: [0.08, 1],
      opacity: [0.3, 1],
      delay: stagger(45),
      duration: 720,
      ease: "outExpo",
    });
  }, [period]);

  return (
    <div className="lg-forecast">
      <header className="lg-forecast-head">
        <div>
          <span className="lg-forecast-label">Revenue forecast</span>
          <h4>{current.heading}</h4>
        </div>
        <div className="lg-segmented" role="group" aria-label="Forecast period">
          {Object.entries(forecastPeriods).map(([key, item]) => (
            <button
              type="button"
              key={key}
              className={period === key ? "active" : ""}
              aria-pressed={period === key}
              onClick={() => setPeriod(key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div className="lg-forecast-kpis" aria-live="polite">
        <div><span>Committed</span><strong>{current.committed}</strong></div>
        <div><span>Best case</span><strong>{current.best}</strong></div>
        <div><span>Coverage</span><strong>{current.coverage}</strong></div>
        <div><span>Week over week</span><strong className="up">{current.delta}</strong></div>
      </div>

      <div className="lg-forecast-body">
        <div className="lg-chart" ref={chartRef} aria-label={`Forecast by month for ${current.heading}`}>
          <div className="lg-chart-head"><span>Weighted pipeline</span><small>USD, thousands</small></div>
          <div className="lg-chart-bars">
            {current.bars.map((value, index) => (
              <div className="lg-bar" key={current.months[index]}>
                <span style={{ height: `${value}%` }}><b>{Math.round(value * 2.1)}</b></span>
                <small>{current.months[index]}</small>
              </div>
            ))}
          </div>
        </div>
        <aside className="lg-forecast-side">
          <div className="lg-side-head"><span>Stage coverage</span><small>vs. target</small></div>
          {[["Negotiation", 82], ["Proposal", 64], ["Discovery", 37]].map(([label, value]) => (
            <div className="lg-coverage-row" key={label}>
              <span>{label}</span><b>{value}%</b>
              <i><em style={{ width: `${value}%` }} /></i>
            </div>
          ))}
          <div className="lg-forecast-answer">
            <span><IconSparkles size={13} /> Liner answer</span>
            <p>{current.answer}</p>
          </div>
        </aside>
      </div>
      <div className="lg-forecast-foot">
        <span><i /> Updated from local records</span>
        <span>Click a period to change the model.</span>
      </div>
    </div>
  );
}

const accountBook = [
  {
    id: "northstar",
    name: "Northstar Studio",
    domain: "northstar.studio",
    owner: "Alex Morgan",
    arr: "$42,000",
    renewal: "Nov 22, 2026",
    health: "At risk",
    tone: "red",
    signal: "Security review has been open for nine days and the next step is still unassigned.",
    play: "Send the security overview and book a 20-minute call with Theo this week.",
    expansion: "+$12k expansion signal",
    people: 4,
  },
  {
    id: "juniper",
    name: "Juniper Health",
    domain: "juniper.health",
    owner: "Sam Rivera",
    arr: "$64,000",
    renewal: "Jan 14, 2027",
    health: "Healthy",
    tone: "green",
    signal: "Two new stakeholders joined the data team after the last quarterly review.",
    play: "Bring the data lead into the renewal conversation before the proposal goes out.",
    expansion: "+$18k expansion signal",
    people: 6,
  },
  {
    id: "helio",
    name: "Helio Systems",
    domain: "helio.systems",
    owner: "Maya Chen",
    arr: "$18,400",
    renewal: "Feb 03, 2027",
    health: "Watch",
    tone: "amber",
    signal: "Usage is up 31% but the account has been quiet for eleven days.",
    play: "Ask Maya which workflow changed this month, then attach the answer to the renewal.",
    expansion: "+$6k expansion signal",
    people: 3,
  },
  {
    id: "vertex",
    name: "Vertex Labs",
    domain: "vertexlabs.io",
    owner: "Jordan Blake",
    arr: "$96,000",
    renewal: "Mar 08, 2027",
    health: "Healthy",
    tone: "green",
    signal: "Legal redlines are moving and the economic buyer attended the last call.",
    play: "Keep the legal thread warm and confirm the start date with procurement.",
    expansion: "+$24k expansion signal",
    people: 5,
  },
  {
    id: "cedar",
    name: "Cedar & Co.",
    domain: "cedarand.co",
    owner: "Alex Morgan",
    arr: "$27,500",
    renewal: "Apr 19, 2027",
    health: "Watch",
    tone: "amber",
    signal: "The proposal was viewed twice but no reply has landed in six days.",
    play: "Send a short follow-up with one clear question, not another full deck.",
    expansion: "+$9k expansion signal",
    people: 2,
  },
];

function AccountBookDemo() {
  const [selectedId, setSelectedId] = useState("northstar");
  const selected = accountBook.find((account) => account.id === selectedId) || accountBook[0];

  return (
    <div className="lg-book">
      <div className="lg-book-head">
        <div><span>Account book</span><small>5 accounts · $248k ARR</small></div>
        <button type="button"><IconFilter size={13} /> Filter accounts</button>
      </div>
      <div className="lg-book-layout">
        <div className="lg-book-table" role="table" aria-label="Account health">
          <div className="lg-book-row lg-book-row--head" role="row">
            <span>Account</span><span>Health</span><span>ARR</span><span>Renewal</span>
          </div>
          {accountBook.map((account) => (
            <button
              type="button"
              role="row"
              className={`lg-book-row ${selectedId === account.id ? "active" : ""}`}
              key={account.id}
              onClick={() => setSelectedId(account.id)}
            >
              <span className="lg-book-name"><i>{account.name.slice(0, 1)}</i><span><strong>{account.name}</strong><small>{account.domain}</small></span></span>
              <span><Tag tone={account.tone}>{account.health}</Tag></span>
              <span>{account.arr}</span>
              <span>{account.renewal.replace(", 2026", "").replace(", 2027", "")}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.aside
            key={selected.id}
            className="lg-account"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <div className="lg-account-head">
              <span className="lg-account-mark">{selected.name.slice(0, 1)}</span>
              <div><h4>{selected.name}</h4><small>{selected.people} people · {selected.owner}</small></div>
              <Tag tone={selected.tone}>{selected.health}</Tag>
            </div>
            <div className="lg-account-metrics">
              <div><span>ARR</span><strong>{selected.arr}</strong></div>
              <div><span>Renewal</span><strong>{selected.renewal}</strong></div>
            </div>
            <div className="lg-account-signal">
              <span><IconAlertTriangle size={12} /> Signal</span>
              <p>{selected.signal}</p>
            </div>
            <div className="lg-account-play">
              <span><IconTargetArrow size={12} /> Next play</span>
              <p>{selected.play}</p>
            </div>
            <div className="lg-account-foot">
              <span><IconTrendingUp size={12} /> {selected.expansion}</span>
              <a href={`${CRM_HREF}#companies`}>Open account <IconArrowUpRight size={12} /></a>
            </div>
          </motion.aside>
        </AnimatePresence>
      </div>
    </div>
  );
}

const storyContent = [
  {
    id: "pipeline",
    label: "Build pipeline",
    kicker: "Pipeline",
    lead: "Your team, amplified.",
    rest: "Every deal has an owner, a next step and a signal when it stalls. The pipeline is ready before the forecast call starts.",
    demo: <PipelineFocus />,
    notes: [
      ["Free your reps to sell.", "Focus mode removes the noise and leaves the deals that need a decision. No digging through views or rebuilding the same filter."],
      ["The forecast starts with the work.", "Stage, amount, owner and next step live on the opportunity. The number is a byproduct of the pipeline, not a separate spreadsheet."],
    ],
  },
  {
    id: "records",
    label: "Convert leads",
    kicker: "Record moves",
    lead: "Speed to lead, every time.",
    rest: "Move a lead into People or Companies without losing notes, files, tasks or the history that makes the next conversation useful.",
    demo: <MoveDemo />,
    notes: [
      ["No duplicate record.", "The same record changes shape instead of spawning a second one. Links, files and activity stay attached."],
      ["Move back without cleanup.", "A conversion is not a one-way door. Move the record back to Leads and the original relationship is still there."],
    ],
  },
  {
    id: "workflows",
    label: "Run sales motions",
    kicker: "Workflows",
    lead: "Run every motion, your way.",
    rest: "Automations watch the record and do the follow-up, so the next action is already waiting when you open the deal.",
    demo: <WorkflowDemo />,
    notes: [
      ["Catch changes before the call.", "A stage change can create the task, log the activity and hand the record to the right owner."],
      ["The work stays visible.", "Every run writes back to the record. Nothing happens in a black box that only the automation can see."],
    ],
  },
  {
    id: "forecast",
    label: "Forecast revenue",
    kicker: "Forecast",
    lead: "For the people who own the number.",
    rest: "See committed revenue, best case and coverage by stage. Ask a question and get the answer from the same records.",
    demo: <ForecastDemo />,
    notes: [
      ["One model, no reconciliation.", "The forecast reads the pipeline directly. Change a stage or amount and the model changes with it."],
      ["Coverage before confidence.", "Compare each stage with target before the review. The gap is visible while there is still time to act."],
    ],
  },
  {
    id: "context",
    label: "Retain and expand",
    kicker: "Account book",
    lead: "Keep more. Grow more.",
    rest: "Track renewals, health and expansion signals across the whole book before the account turns.",
    demo: <AccountBookDemo />,
    notes: [
      ["See the shift early.", "A funding round, a new stakeholder or a quiet account is a signal. The account view puts it next to the renewal date."],
      ["The move is ready to make.", "Each signal comes with a next play and a clear owner, so the team knows what to do before the call."],
    ],
  },
];

function PlatformStories() {
  const [active, setActive] = useState(storyContent[0].id);
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const context = gsap.context(() => {
      const steps = gsap.utils.toArray(".lg-story", root);
      steps.forEach((step, index) => {
        if (!reduceMotion) {
          gsap.from(step.querySelectorAll(".lg-story-copy, .lg-story-stage, .lg-story-notes"), {
            y: 30,
            opacity: 0,
            duration: 0.8,
            stagger: 0.07,
            ease: "power3.out",
            scrollTrigger: { trigger: step, start: "top 74%", once: true },
          });
        }
        ScrollTrigger.create({
          trigger: step,
          start: "top 45%",
          end: "bottom 45%",
          onEnter: () => setActive(storyContent[index].id),
          onEnterBack: () => setActive(storyContent[index].id),
        });
      });
    }, root);
    return () => context.revert();
  }, []);

  function goTo(id) {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section className="lg-platform" id="platform" ref={rootRef}>
      <div className="lg-platform-intro">
        <span className="lg-kicker">Platform</span>
        <h2>The workspace that keeps up.<br /><span>Every relationship. Every next move.</span></h2>
        <p>
          Linear CRM is built around the work your team already does: qualify a lead,
          move a deal, run the follow-up, read the number. Nothing needs a second home.
        </p>
      </div>

      <div className="lg-platform-shell">
        <aside className="lg-platform-index">
          <nav aria-label="Platform sections">
            {storyContent.map((step, index) => (
              <button
                type="button"
                key={step.id}
                className={active === step.id ? "active" : ""}
                aria-current={active === step.id ? "true" : undefined}
                onClick={() => goTo(step.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.label}
              </button>
            ))}
          </nav>
          <div className="lg-index-note"><i /> Live product demos</div>
          <a href={CRM_HREF}>Open the workspace <IconArrowUpRight size={13} /></a>
        </aside>

        <div className="lg-platform-canvas">
          {storyContent.map((step) => (
            <section className="lg-story" id={step.id} key={step.id}>
              <div className="lg-story-copy">
                <span className="lg-story-kicker">{step.kicker}</span>
                <h3><strong>{step.lead}</strong> {step.rest}</h3>
              </div>
              <div className="lg-story-stage">{step.demo}</div>
              <div className="lg-story-notes">
                {step.notes.map(([title, body]) => (
                  <article key={title}><h4>{title}</h4><p>{body}</p></article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuildSection() {
  return (
    <section className="lg-build lg-reveal" id="model">
      <div className="lg-build-head">
        <span className="lg-kicker">Self-building</span>
        <h2><strong>Live from day one.</strong> <span>The workspace already knows the shape of your business.</span></h2>
        <p>
          Leads, people, companies and opportunities arrive with fields and
          relationships that make sense. Rename a field, add an object, keep moving.
        </p>
      </div>
      <div className="lg-build-stage">
        <DataModel />
      </div>
    </section>
  );
}

function LinerSection() {
  return (
    <section className="lg-ask lg-reveal" id="assistant">
      <div className="lg-ask-copy">
        <span className="lg-kicker">Liner</span>
        <h2>Ask the workspace.<br /><span>Get an answer, not another tab.</span></h2>
        <p>
          Liner reads the records already in front of you. Pipeline, deal risk,
          follow-ups, tasks. The answer arrives with the context attached.
        </p>
        <ul className="lg-check-list">
          <li><IconCheck size={13} /> Answers grounded in the current workspace</li>
          <li><IconCheck size={13} /> Draft follow-ups without copying context</li>
          <li><IconCheck size={13} /> Local workspace answers, with optional connected AI</li>
        </ul>
        <a className="lg-text-link" href="#context">See the records behind it <IconArrowRight size={13} /></a>
      </div>
      <div className="lg-ask-stage">
        <LinerDemo />
      </div>
    </section>
  );
}

const signalFeatures = [
  {
    title: "It logs itself.",
    body: "Keep notes and logged conversations together. Stage changes become part of the record’s history.",
    Icon: IconNotes,
  },
  {
    title: "Your records finally talk.",
    body: "Leads, people, companies, deals and tasks share one graph, so the account story holds together.",
    Icon: IconDatabase,
  },
  {
    title: "Gets to know you.",
    body: "Custom fields, saved views and workflows fit the way your team already sells.",
    Icon: IconAdjustmentsHorizontal,
  },
  {
    title: "Ask, and it is there.",
    body: "Liner answers from the workspace, not a separate warehouse that is always a day behind.",
    Icon: IconSparkles,
  },
  {
    title: "No context left behind.",
    body: "Move a record, change a stage or hand over an owner. The history follows the relationship.",
    Icon: IconRefresh,
  },
];

function SignalSection() {
  return (
    <section className="lg-signal lg-reveal" aria-label="Workspace context">
      <div className="lg-signal-beam lg-signal-beam--left" aria-hidden="true" />
      <div className="lg-signal-beam lg-signal-beam--right" aria-hidden="true" />
      <div className="lg-signal-head">
        <span className="lg-dark-kicker">Universal context</span>
        <h2>All of your customer context.<br /><span>None of the chasing.</span></h2>
      </div>
      <div className="scene-horizon" aria-hidden="true"><div/></div>
      <div className="lg-signal-grid">
        {signalFeatures.map(({ title, body, Icon }) => (
          <article key={title}>
            <span className="lg-signal-icon"><Icon size={17} /></span>
            <h3>{title}</h3>
            <p>{body}</p>
          </article>
        ))}
      </div>
      <ContextOrbit />
      <div className="lg-signal-foot">
        <div>
          <span className="lg-dark-kicker">The point</span>
          <h3>Your CRM should remember the work, not ask you to repeat it.</h3>
        </div>
        <div>
          <p>
            A record is only useful if the next person can pick it up. Linear CRM
            keeps the notes, the moves and the reasons in one place, then gets out
            of the way.
          </p>
          <a className="lg-button lg-button--light" href={CRM_HREF}>Open the CRM <IconArrowUpRight size={14} /></a>
        </div>
      </div>
    </section>
  );
}

function PrinciplesSection() {
  return (
    <section className="lg-principles lg-reveal" id="principles">
      <span className="lg-kicker">Our product principle</span>
      <blockquote>
        “The best CRM is the one you forget you’re using.”
      </blockquote>
      <div className="lg-principle-grid">
        <article>
          <span>01</span>
          <h3>Local by default.</h3>
          <p>Records live in this browser. Export the whole workspace as one file whenever you want, without asking a vendor for your own data.</p>
        </article>
        <article>
          <span>02</span>
          <h3>Structured, not rigid.</h3>
          <p>Fields, objects and views are flexible enough for the way you sell, but the relationships stay consistent underneath.</p>
        </article>
        <article>
          <span>03</span>
          <h3>Fast on purpose.</h3>
          <p>One click to the workspace. No setup maze, no empty-state theatre. The sample data is there so the product can speak for itself.</p>
        </article>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="lg-final" id="pricing">
      <Logo tone="white" className="lg-final-logo" />
      <span className="lg-dark-kicker">Ready when you are</span>
      <h2>Make room for your<br />next good relationship.</h2>
      <p>Open the demo, move a record, close a deal. Nothing to install and nobody to call.</p>
      <div className="lg-actions">
        <a className="lg-button lg-button--light" href={CRM_HREF}>Open the CRM <IconArrowUpRight size={15} /></a>
        <a className="lg-button lg-button--ghost" href="./README.md">Read the product notes <IconArrowRight size={14} /></a>
      </div>
    </section>
  );
}

const footerColumns = [
  {
    title: "Site",
    links: [["Platform", ROUTES.platform], ["Product", ROUTES.product], ["Customers", ROUTES.customers], ["Pricing", ROUTES.pricing]],
  },
  {
    title: "Workspace",
    links: [["Open the CRM", CRM_HREF], ["Leads", `${CRM_HREF}#leads`], ["Companies", `${CRM_HREF}#companies`], ["Opportunities", `${CRM_HREF}#deals`]],
  },
  {
    title: "Resources",
    links: [["Resources", ROUTES.resources], ["Browser storage", ROUTES.resources + "#no-backend"], ["Product notes", "./README.md"], ["Backups", ROUTES.resources + "#backup"]],
  },
];

function SiteFooter() {
  return (
    <footer className="lg-footer">
      <div className="lg-footer-main">
        <div className="lg-footer-brand">
          <Logo tone="white" />
          <p>A personal, local-first CRM. No backend, no account and no server copy of your workspace.</p>
          <span><i /> Personal project · browser-local</span>
        </div>
        {footerColumns.map((column) => (
          <div className="lg-footer-column" key={column.title}>
            <strong>{column.title}</strong>
            {column.links.map(([label, href]) => <a href={href} key={label}>{label}</a>)}
          </div>
        ))}
      </div>
      <div className="lg-footer-bottom">
        <span>© 2026 Linear CRM · personal project</span>
        <span>Built with Twenty UI · AGPL-3.0</span>
        <span>No accounts · no server</span>
      </div>
    </footer>
  );
}

function PageHero({ eyebrow, title, accent, copy, primary, secondary, note, children }) {
  return (
    <section className="lg-page-hero">
      <span className="lg-kicker">{eyebrow}</span>
      <h1>{title}<span>{accent}</span></h1>
      <p>{copy}</p>
      <div className="lg-actions">
        <a className="lg-button lg-button--dark" href={primary.href}>
          {primary.label} <IconArrowUpRight size={15} />
        </a>
        {secondary && (
          <a className="lg-button lg-button--outline" href={secondary.href}>
            {secondary.label} <IconArrowRight size={14} />
          </a>
        )}
      </div>
      {note && <div className="lg-page-note"><IconLock size={12} /> {note}</div>}
      {children && <div className="lg-page-hero-visual">{children}</div>}
    </section>
  );
}

function PageFeature({ id, kicker, title, copy, points = [], demo, wide = false }) {
  return (
    <section className={`lg-page-feature ${wide ? "lg-page-feature--wide" : ""}`} id={id}>
      <div className="lg-page-feature-copy">
        <span className="lg-kicker">{kicker}</span>
        <h2>{title}</h2>
        <p>{copy}</p>
        {points.length > 0 && (
          <ul className="lg-check-list">
            {points.map((point) => <li key={point}><IconCheck size={13} /> {point}</li>)}
          </ul>
        )}
      </div>
      <div className="lg-page-stage">{demo}</div>
    </section>
  );
}

function PageCta({ eyebrow = "Open the workspace", title = "See it with your own records.", copy = "The sample workspace is already there. No account, no server and no setup maze." }) {
  return (
    <section className="lg-page-cta">
      <div className="lg-page-cta-rings" aria-hidden="true" />
      <span className="lg-dark-kicker">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{copy}</p>
      <div className="lg-actions">
        <a className="lg-button lg-button--light" href={ROUTES.crm}>Open the CRM <IconArrowUpRight size={15} /></a>
        <a className="lg-button lg-button--ghost" href={ROUTES.resources}>How it runs <IconArrowRight size={14} /></a>
      </div>
    </section>
  );
}

function PlatformPage() {
  return (
    <>
      <PageHero
        eyebrow="Platform"
        title="Every revenue motion,"
        accent="one connected system."
        copy="Pipeline, record moves, workflows, forecasts and account context all read from the same local records. No integration layer, because there is no backend to integrate."
        primary={{ label: "Open the CRM", href: ROUTES.crm }}
        secondary={{ label: "Explore the product", href: ROUTES.product }}
        note="A personal project. No backend, no account, no sync service."
      />

      <PageFeature
        id="pipeline"
        kicker="Pipeline"
        title="A next step on every open deal."
        copy="Focus mode strips the board down to the opportunities that need a decision. Stage, amount, owner and the next move stay together, so the forecast starts from the work rather than a separate spreadsheet."
        points={["Mark a deal reviewed without leaving the list", "Spot missing next steps and quiet accounts", "Keep the pipeline and forecast in one model"]}
        demo={<PipelineFocus />}
      />

      <PageFeature
        id="workflows"
        kicker="Workflows"
        title="Automate the follow-up, not the relationship."
        copy="A workflow can watch a stage change, create the task, assign the owner and log the activity. Every run writes back to the record, so the next person can see what happened."
        points={["Run a workflow manually while setting it up", "Pause the flow without deleting its history", "Nothing runs while the browser is closed"]}
        demo={<WorkflowDemo />}
      />

      <PageFeature
        id="forecast"
        kicker="Forecast"
        title="Coverage before confidence."
        copy="Committed revenue, best case and stage coverage come directly from the records. Switch the period and the model changes with it. No reconciliation step and no second source of truth."
        points={["Compare each stage against target", "See the week-over-week movement", "Read the answer beside the chart"]}
        demo={<ForecastDemo />}
        wide
      />

      <PageFeature
        id="assistant"
        kicker="Liner"
        title="Ask the workspace a direct question."
        copy="Liner reads the records already in front of you. Simple questions are answered locally; more complex requests can use an external AI service when you configure one. The workspace itself never needs a server."
        points={["Grounded in the current local workspace", "Drafts follow-ups without copying context", "Local summaries work without an API key"]}
        demo={<LinerDemo />}
      />

      <PageFeature
        id="context"
        kicker="Account context"
        title="The book stays readable."
        copy="Renewals, health and expansion signals sit next to the account. Select a company and the next play changes with it, instead of hiding the context in a separate report."
        points={["One account view for renewals and expansion", "Signals and next plays stay together", "Every record links back to the live CRM"]}
        demo={<AccountBookDemo />}
        wide
      />

      <PageCta
        eyebrow="Platform, in practice"
        title="The system is the workspace."
        copy="Open the sample workspace and move between the pipeline, a record and the forecast without losing the thread."
      />
    </>
  );
}

function ViewsDemo() {
  const [view, setView] = useState("all");
  const views = [
    { key: "all", label: "All accounts", description: "Sorted by renewal" },
    { key: "risk", label: "At risk", description: "Health is At risk" },
    { key: "renewals", label: "Renewals", description: "Next two quarters" },
    { key: "expansion", label: "Expansion", description: "Positive signal" },
  ];
  const rows = accountBook.filter((account) => {
    if (view === "risk") return account.health !== "Healthy";
    if (view === "renewals") return account.renewal.includes("2026") || account.renewal.includes("Jan") || account.renewal.includes("Feb");
    if (view === "expansion") return account.expansion.includes("+");
    return true;
  });

  return (
    <div className="lg-views">
      <header>
        <div><span>Saved views</span><small>Account book · {rows.length} records</small></div>
        <button type="button"><IconFilter size={13} /> Add filter</button>
      </header>
      <div className="lg-views-tabs" role="tablist" aria-label="Saved account views">
        {views.map((item) => (
          <button
            type="button"
            role="tab"
            key={item.key}
            aria-selected={view === item.key}
            className={view === item.key ? "active" : ""}
            onClick={() => setView(item.key)}
          >
            {item.label}<small>{item.description}</small>
          </button>
        ))}
      </div>
      <div className="lg-views-table" role="table" aria-label="Saved view results">
        <div className="lg-views-row lg-views-row--head" role="row"><span>Account</span><span>Health</span><span>ARR</span><span>Renewal</span></div>
        {rows.map((account) => (
          <div className="lg-views-row" role="row" key={account.id}>
            <span className="lg-views-name"><i>{account.name.slice(0, 1)}</i><span><strong>{account.name}</strong><small>{account.owner}</small></span></span>
            <span><Tag tone={account.tone}>{account.health}</Tag></span>
            <span>{account.arr}</span>
            <span>{account.renewal}</span>
          </div>
        ))}
      </div>
      <footer><span><IconAdjustmentsHorizontal size={12} /> Layout and filters are saved with the view</span><span>{rows.length} of {accountBook.length} accounts</span></footer>
    </div>
  );
}

function ProductPage() {
  return (
    <>
      <PageHero
        eyebrow="Product"
        title="One workspace,"
        accent="every record in motion."
        copy="The record is the centre of the product. Open a company, move a lead, save a view or read the pipeline without changing tools. The same data follows you through every screen."
        primary={{ label: "Open the CRM", href: ROUTES.crm }}
        secondary={{ label: "See the platform", href: ROUTES.platform }}
        note="Every demo on this page is interactive. All data is local to this browser."
      >
        <div className="lg-page-product"><ProductPreview /></div>
      </PageHero>

      <PageFeature
        id="data-model"
        kicker="Data model"
        title="Structure that flexes without breaking links."
        copy="Leads, people, companies and opportunities share typed fields and real relationships. Add a field or an object, and the rest of the workspace still knows how the records connect."
        points={["Standard objects with editable fields", "Custom objects and relationship fields", "No backend schema to migrate"]}
        demo={<DataModel />}
        wide
      />

      <PageFeature
        id="records"
        kicker="Record moves"
        title="Move the record, keep the relationship."
        copy="A lead becomes a person or a company without becoming a second record. Notes, tasks, files, favourites and history travel with it. Move it back to Leads if the qualification was wrong."
        points={["No duplicate record created", "Links, files and history follow the move", "Converted leads stay protected"]}
        demo={<MoveDemo />}
      />

      <PageFeature
        id="views"
        kicker="Saved views"
        title="The view you left is the view you return to."
        copy="Filter the book, choose the layout and save it by name. Views remember the filters and sorting, so the Monday review does not start with rebuilding the same table."
        points={["Save filters, sorting and layout", "Switch between account views", "Views survive reloads and backups"]}
        demo={<ViewsDemo />}
        wide
      />

      <PageCta
        eyebrow="Product detail"
        title="Every screen is the same workspace."
        copy="Open a record, move it, change the view and ask a question. Nothing has to be copied into another tool."
      />
    </>
  );
}

function ResourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Resources"
        title="Your workspace, explained."
        accent="Keep your data in your hands."
        copy="Open the CRM in your browser. Learn how to manage your records, save a backup and get help from Liner."
        primary={{ label: "Open the CRM", href: ROUTES.crm }}
        secondary={{ label: "Explore backups", href: "#backup" }}
        note="Personal project · no backend · no account · no tracking"
      />

      <section className="lg-no-backend" id="no-backend">
        <div className="lg-no-backend-head">
          <span className="lg-kicker">Your data</span>
          <h2>Available online. Saved in your browser.</h2>
          <p>
            You can visit the hosted site without installing anything. Your CRM
            records stay in the browser you use, with no shared database or automatic
            sync between devices. Export a backup to keep a separate copy.
          </p>
        </div>
        <div className="lg-no-backend-grid">
          <article>
            <span>01</span>
            <h3>Records stay in the browser.</h3>
            <p>Your workspace is saved on this device. Optional external AI requests share the context needed to answer your question.</p>
          </article>
          <article>
            <span>02</span>
            <h3>There are no accounts.</h3>
            <p>The profile and workspace switcher are local conveniences, not authentication. Anyone with this browser profile can open the workspace.</p>
          </article>
          <article>
            <span>03</span>
            <h3>AI is optional.</h3>
            <p>Simple Liner questions use local data. Complex AI requests use an external service only when a key is configured. The workspace itself does not require it.</p>
          </article>
        </div>
      </section>

      <section className="lg-page-section" id="import-export">
        <div className="lg-resource-split">
          <div>
            <span className="lg-kicker">Portability</span>
            <h2>Your data has an exit.</h2>
            <p>
              CSV works for bringing the book in and taking a table out. A JSON
              workspace backup is the complete option: records, links, custom fields,
              views, workflows and local settings.
            </p>
            <ul className="lg-check-list">
              <li><IconCheck size={13} /> CSV import and export for standard objects</li>
              <li><IconCheck size={13} /> One-file JSON backup and restore</li>
              <li><IconCheck size={13} /> Workspaces remain independent in the browser</li>
            </ul>
          </div>
          <div className="lg-resource-list" id="backup">
            <div><span>Backup</span><h3>Account → Backup</h3><p>Download the current workspace as JSON.</p></div>
            <div><span>Restore</span><h3>Account → Restore</h3><p>Replace the current workspace from a backup file.</p></div>
            <div><span>Danger</span><h3>Clear site data</h3><p>The workspace is gone unless you have a backup. There is no server copy.</p></div>
          </div>
        </div>
      </section>

      <section className="lg-page-section" id="keyboard">
        <div className="lg-page-section-head">
          <span className="lg-kicker">Keyboard</span>
          <h2>Fast enough to stay in the flow.</h2>
        </div>
        <div className="lg-shortcut-grid">
          <div><kbd>⌘ K</kbd><kbd>Ctrl K</kbd><span>Search the workspace</span></div>
          <div><kbd>Shift F10</kbd><span>Open the page context menu</span></div>
          <div><kbd>Esc</kbd><span>Close dialogs and menus</span></div>
          <div><kbd>Enter</kbd><span>Confirm the focused action</span></div>
        </div>
      </section>

      <section className="lg-page-section" id="assistant">
        <div className="lg-resource-split">
          <div>
            <span className="lg-kicker">Liner</span>
            <h2>Local summaries first. AI only if you connect it.</h2>
            <p>
              Totals such as “How many leads do I have?” are answered directly from
              browser data. More complex requests can use the configured AI service.
              The connection key stays in this tab's session storage and is not
              included in workspace backups.
            </p>
            <a className="lg-text-link" href={ROUTES.platform + "#assistant"}>See the Liner demo <IconArrowRight size={13} /></a>
          </div>
          <div className="lg-resource-list">
            <div><span>Without a key</span><h3>Local summaries and workspace tools</h3><p>Question answering over known totals and records still works.</p></div>
            <div><span>With a key</span><h3>External AI requests</h3><p>Workspace context needed for the answer is sent to that service.</p></div>
            <div><span>Never sent</span><h3>Connection keys and file contents</h3><p>Keys stay in session storage; attachments are not part of the tool context.</p></div>
          </div>
        </div>
      </section>

      <section className="lg-page-section" id="faq">
        <div className="lg-page-section-head">
          <span className="lg-kicker">FAQ</span>
          <h2>Questions about your workspace.</h2>
        </div>
        <div className="lg-faq">
          <details open>
            <summary>Is there a backend?</summary>
            <p>No. The site is static HTML, CSS and JavaScript. The CRM stores data in the browser and does not call a database, auth service or sync server.</p>
          </details>
          <details>
            <summary>Where does my data live?</summary>
            <p>In this browser's <code>localStorage</code>. Different browsers and profiles have separate workspaces. Clearing site data removes the workspace.</p>
          </details>
          <details>
            <summary>Can I use it with a team?</summary>
            <p>Not as a shared real-time workspace. There are no accounts, permissions or sync. A JSON backup can be moved between browsers manually.</p>
          </details>
          <details>
            <summary>Is this a commercial product?</summary>
            <p>No. It is a personal portfolio project. There is no billing, customer support or service-level agreement.</p>
          </details>
          <details>
            <summary>Do I need to connect an AI service?</summary>
            <p>No. Records, tasks and local Liner summaries work without one. A configured connection enables more complex requests through an external AI service.</p>
          </details>
        </div>
      </section>

      <PageCta
        eyebrow="Your workspace is ready"
        title="Open your next chapter."
        copy="Explore the CRM right here in your browser. No installation or account needed."
      />
    </>
  );
}

const customerScenarios = [
  {
    number: "01",
    title: "Founder-led sales",
    copy: "A lead comes in from a conversation. It becomes a person and a company, gets a next step, and the founder can see the whole relationship without opening three other tools.",
    tags: ["Leads", "People", "Pipeline"],
  },
  {
    number: "02",
    title: "A two-person studio",
    copy: "The work is fewer accounts with more context. Notes, files and follow-ups stay on the record, while saved views keep renewals and quiet accounts visible.",
    tags: ["Notes", "Tasks", "Saved views"],
  },
  {
    number: "03",
    title: "A solo operator",
    copy: "The workspace has to work offline and belong to the person using it. Local records, a one-file backup and no account are the feature, not a compromise.",
    tags: ["Local-first", "Backup", "No backend"],
  },
];

function CustomersPage() {
  return (
    <>
      <PageHero
        eyebrow="Customers"
        title="Built around the work,"
        accent="not a logo wall."
        copy="This is a personal project, so there are no invented customer logos or testimonials here. What follows are the workflows the sample workspace was built around, shown with sample records."
        primary={{ label: "Open the sample workspace", href: ROUTES.crm }}
        secondary={{ label: "See the account book", href: "#book" }}
        note="Sample records only. No real customer data is shown on this page."
      />

      <section className="lg-page-section lg-scenarios-section" id="scenarios">
        <div className="lg-page-section-head">
          <span className="lg-kicker">Use cases, not claims</span>
          <h2>Three ways the workspace earns its place.</h2>
          <p>These are scenarios, not customer stories. They describe the jobs the product was designed to make easier.</p>
        </div>
        <div className="lg-scenario-list">
          {customerScenarios.map((scenario) => (
            <article key={scenario.number}>
              <span>{scenario.number}</span>
              <div><h3>{scenario.title}</h3><p>{scenario.copy}</p></div>
              <div className="lg-scenario-tags">{scenario.tags.map((tag) => <Tag key={tag} tone="gray">{tag}</Tag>)}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="lg-page-section" id="book">
        <div className="lg-page-section-head">
          <span className="lg-kicker">The account book</span>
          <h2>A sample book with a memory.</h2>
          <p>Open an account and the renewal, signal and next play change with it. The data is fictional; the interaction is the actual product.</p>
        </div>
        <div className="lg-page-wide-stage"><AccountBookDemo /></div>
      </section>

      <section className="lg-design-brief">
        <div className="lg-design-brief-heading">
          <span className="lg-kicker">The design brief</span>
          <h2>A clear view of your relationships.</h2>
        </div>
        <div>
          <p>
            Fewer surfaces, one model, local records. The project is deliberately
            smaller than a hosted CRM and deliberately honest about what it does not
            include.
          </p>
          <a className="lg-text-link" href={ROUTES.resources + "#no-backend"}>Read the architecture <IconArrowRight size={13} /></a>
        </div>
      </section>

      <PageCta
        eyebrow="Use the sample workspace"
        title="Bring a real workflow, not a demo script."
        copy="The sample data is there to make the product legible. Replace it with your own book whenever you are ready."
      />
    </>
  );
}

function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="$0, because there is"
        accent="no backend to pay for."
        copy="Linear CRM is a personal project, not a hosted service. There is no subscription, no seat count and no billing system. It runs from static files and keeps its records in the browser."
        primary={{ label: "Open the CRM", href: ROUTES.crm }}
        secondary={{ label: "How it runs", href: ROUTES.resources + "#no-backend" }}
        note="Free to use. No account, no payment details, no server."
      />

      <section className="lg-pricing" id="plan">
        <div className="lg-price-card">
          <span className="lg-kicker">The only plan</span>
          <div className="lg-price"><strong>$0</strong><span>forever, while this is a personal project</span></div>
          <a className="lg-button lg-button--light" href={ROUTES.crm}>Open the workspace <IconArrowUpRight size={15} /></a>
          <small>No sign-up. The sample workspace is already loaded.</small>
        </div>
        <div className="lg-price-detail">
          <div>
            <h3>Included</h3>
            <ul className="lg-check-list">
              <li><IconCheck size={13} /> Leads, people, companies and opportunities</li>
              <li><IconCheck size={13} /> Pipeline, table, board and calendar views</li>
              <li><IconCheck size={13} /> Saved views, custom fields and objects</li>
              <li><IconCheck size={13} /> Workflows, forecasts, dashboards and Liner</li>
              <li><IconCheck size={13} /> CSV import/export and JSON workspace backup</li>
            </ul>
          </div>
          <div>
            <h3>Not included</h3>
            <ul className="lg-limit-list">
              <li><IconX size={13} /> A hosted database or backend</li>
              <li><IconX size={13} /> User accounts, permissions or sync</li>
              <li><IconX size={13} /> Real email delivery or payment processing</li>
              <li><IconX size={13} /> Uptime guarantees or customer support</li>
              <li><IconX size={13} /> A team-wide shared workspace</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="lg-page-section lg-price-notes" id="details">
        <div className="lg-page-section-head">
          <span className="lg-kicker">What “free” means here</span>
          <h2>No invoice. Also no illusion of a hosted service.</h2>
          <p>This is a personal project. The source is the product, and the browser is the deployment target. Back up your workspace if the data matters.</p>
        </div>
        <div className="lg-price-notes-grid">
          <div><span>01</span><h3>Runs locally</h3><p>Static files served from this folder. There is no remote environment to maintain.</p></div>
          <div><span>02</span><h3>Data is yours</h3><p>Records live in localStorage. Export a JSON backup before clearing site data or changing browsers.</p></div>
          <div><span>03</span><h3>Optional AI</h3><p>Liner can use an external model service when configured. That service is not required for the CRM to work.</p></div>
        </div>
      </section>

      <PageCta
        eyebrow="No checkout"
        title="Start at the workspace, not a pricing funnel."
        copy="There is nothing to buy. Open the CRM, try the sample data and decide whether the local-first trade-off fits."
      />
    </>
  );
}

function NoBackendNote() {
  return (
    <section className="lg-personal-note">
      <div>
        <span className="lg-kicker">Personal project</span>
        <h2>No backend. No account. No server copy.</h2>
      </div>
      <p>
        Linear CRM is a portfolio project that runs entirely in the browser. Records
        live in local storage; the optional AI connection is the only external service.
      </p>
      <a className="lg-text-link" href={ROUTES.resources + "#no-backend"}>How it runs <IconArrowRight size={13} /></a>
    </section>
  );
}

function HomePage() {
  return <MarketingHome contextSection={<SignalSection />} closingSection={<FinalCta />} />;
}

function App() {
  const page = ["platform", "product", "resources", "customers", "pricing"].includes(CURRENT_PAGE) ? CURRENT_PAGE : "home";
  const [announcement, setAnnouncement] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 10); }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setOpenMenu(null);
      }
    }
    function onPointerDown(event) {
      if (openMenu && !event.target.closest(".lg-head")) setOpenMenu(null);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [openMenu]);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const root = document.querySelector(".landing");
    if (!root) return;
    const context = gsap.context(() => {
      gsap.utils.toArray(".lg-reveal", root).forEach((element) => {
        gsap.from(element, {
          y: 26,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 84%", once: true },
        });
      });
    }, root);
    return () => context.revert();
  }, []);

  const mobileLinks = [
    ["Platform", ROUTES.platform],
    ["Product", ROUTES.product],
    ["Resources", ROUTES.resources],
    ["Use cases", ROUTES.customers],
    ["Pricing", ROUTES.pricing],
    ["No backend", ROUTES.resources + "#no-backend"],
  ];

  function closeAll() {
    setMobileOpen(false);
    setOpenMenu(null);
  }

  return (
    <div className="landing">
      {announcement && (
        <div className="lg-announce">
          <a href={ROUTES.resources + "#no-backend"}>
            Meet Liner. A little more clarity for every customer relationship.
            <IconArrowRight size={13} />
          </a>
          <button type="button" aria-label="Dismiss announcement" onClick={() => setAnnouncement(false)}>
            <IconX size={14} />
          </button>
        </div>
      )}

      <header
        className={`lg-head ${scrolled ? "is-scrolled" : ""}`}
        onMouseLeave={() => setOpenMenu(null)}
      >
        <div className="lg-nav">
          <a className="lg-brand" href={ROUTES.home} aria-label="Linear CRM home"><Logo /></a>
          <nav className="lg-nav-links" aria-label="Main navigation">
            <a
              href={ROUTES.platform}
              className={`${page === "platform" ? "active" : ""} ${openMenu === "platform" ? "is-open" : ""}`.trim()}
              aria-current={page === "platform" ? "page" : undefined}
              aria-haspopup="menu"
              aria-expanded={openMenu === "platform"}
              aria-controls="platform-menu"
              onMouseEnter={() => setOpenMenu("platform")}
              onFocus={() => setOpenMenu("platform")}
              onClick={() => setOpenMenu(null)}
            >
              Platform <IconChevronDown size={13} />
            </a>
            <a href={ROUTES.product} className={page === "product" ? "active" : ""} aria-current={page === "product" ? "page" : undefined}>Product</a>
            <a href={ROUTES.resources} className={page === "resources" ? "active" : ""} aria-current={page === "resources" ? "page" : undefined}>Resources</a>
            <a href={ROUTES.customers} className={page === "customers" ? "active" : ""} aria-current={page === "customers" ? "page" : undefined}>Use cases</a>
            <a href={ROUTES.pricing} className={page === "pricing" ? "active" : ""} aria-current={page === "pricing" ? "page" : undefined}>Pricing</a>
          </nav>
          <div className="lg-nav-actions">
            <a className="lg-button lg-button--outline lg-button--nav" href={ROUTES.resources + "#no-backend"}>How it runs</a>
            <a className="lg-button lg-button--dark lg-button--nav" href={CRM_HREF}>Open the CRM <IconArrowUpRight size={13} /></a>
            <button
              className="lg-mobile-toggle"
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMobileOpen((value) => !value)}
            >
              {mobileOpen ? <IconX size={19} /> : <IconMenu2 size={19} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {openMenu === "platform" && <MegaMenu onClose={closeAll} />}
        </AnimatePresence>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              id="mobile-navigation"
              className="lg-mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="lg-mobile-inner">
                {mobileLinks.map(([label, href]) => (
                  <a href={href} key={href} onClick={closeAll}>{label}<IconChevronRight size={14} /></a>
                ))}
                <a className="lg-button lg-button--dark" href={CRM_HREF} onClick={closeAll}>Open the CRM <IconArrowUpRight size={14} /></a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main id="top">
        {page === "home" && <HomePage />}
        {page === "platform" && <PlatformPage />}
        {page === "product" && <ProductPage />}
        {page === "resources" && <ResourcesPage />}
        {page === "customers" && <CustomersPage />}
        {page === "pricing" && <PricingPage />}
      </main>
      <SiteFooter />
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
