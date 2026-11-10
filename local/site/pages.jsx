import React, { useEffect, useState } from "react";
import {
  IconAdjustmentsHorizontal,
  IconArrowRight,
  IconArrowUpRight,
  IconBolt,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCalendar,
  IconCheck,
  IconCheckbox,
  IconChevronDown,
  IconCircleCheck,
  IconClock,
  IconDatabase,
  IconFile,
  IconFilter,
  IconLayoutKanban,
  IconLock,
  IconMail,
  IconNotes,
  IconPlus,
  IconRefresh,
  IconSearch,
  IconSparkles,
  IconTable,
  IconTargetArrow,
  IconUserSearch,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import {
  AccountBook,
  BackupPanel,
  DataModelPanel,
  FocusList,
  ForecastPanel,
  ImportPanel,
  LinerChat,
  MergePanel,
  ObjectStrip,
  OverviewPanel,
  PipelineBoard,
  RecordMove,
  SavedViewsPanel,
  StoragePanel,
  TimelinePanel,
  WorkflowCanvas,
  WorkspacePreview,
} from "./demos";
import {
  Button,
  CheckList,
  DemoShell,
  FeatureBlock,
  Kicker,
  PageCta,
  PageHero,
  SectionHead,
  Tag,
  TextLink,
} from "./ui";
import { ROUTES } from "./navigation";
import { FinalCta, SignalSection } from "./sections";

function TrustRow() {
  return (
    <div className="lp-trust">
      <span><IconCheck size={11} /> No sign-up</span>
      <span><IconCheck size={11} /> Sample records included</span>
      <span><IconCheck size={11} /> Stored in this browser</span>
    </div>
  );
}

/* ------------------------------------------------------------------ home */

const STORIES = [
  {
    id: "pipeline",
    kicker: "Build pipeline",
    title: "Know where every deal stands.",
    copy: "Each opportunity carries its stage, amount, owner and next step. Focus mode removes the healthy deals and leaves the ones that need a decision before Friday.",
    demo: <PipelineBoard />,
    href: ROUTES.pipeline,
    link: "Explore pipeline",
  },
  {
    id: "records",
    kicker: "Convert leads",
    title: "Speed to lead, without the duplicate.",
    copy: "Move a lead into People or Companies without creating a second record. Notes, tasks, files and the conversation history travel with it.",
    demo: <RecordMove />,
    href: ROUTES.recordMoves,
    link: "How record moves work",
  },
  {
    id: "workflows",
    kicker: "Run sales motions",
    title: "The follow-up is already waiting.",
    copy: "A workflow watches the record, checks a condition and creates the next action. Every run writes to the timeline, so the automation is visible.",
    demo: <WorkflowCanvas />,
    href: ROUTES.workflows,
    link: "Explore workflows",
  },
  {
    id: "forecast",
    kicker: "Forecast revenue",
    title: "For the people who own the number.",
    copy: "Committed revenue, best case and coverage by stage come from the same records. Switch the period and the model changes with it.",
    demo: <ForecastPanel />,
    href: ROUTES.forecast,
    link: "Explore forecast",
  },
  {
    id: "context",
    kicker: "Retain and expand",
    title: "The book stays readable.",
    copy: "Renewals, health and expansion signals sit beside the account. Select a company and the signal, the next play and the owner change with it.",
    demo: <AccountBook />,
    href: ROUTES.context,
    link: "Explore universal context",
  },
];

function PlatformNavPoint({ point, index, active, onSelect }) {
  return (
    <button
      type="button"
      className={active ? "active" : ""}
      aria-current={active ? "true" : undefined}
      onClick={() => onSelect(point.id)}
    >
      <span>{String(index + 1).padStart(2, "0")}</span>
      {point.kicker}
    </button>
  );
}

function PlatformPanel({ point }) {
  return (
    <article className="lp-platform-panel" id={point.id}>
      <div className="lp-platform-panel-head">
        <div>
          <Kicker>{point.kicker}</Kicker>
          <h3>{point.title}</h3>
        </div>
        <div className="lp-platform-panel-copy">
          <p>{point.copy}</p>
          <TextLink href={point.href}>{point.link}</TextLink>
        </div>
      </div>
      <div className="lp-platform-panel-stage">{point.demo}</div>
    </article>
  );
}

function PlatformTour() {
  const [active, setActive] = useState(STORIES[0].id);

  useEffect(() => {
    const panels = STORIES.map((story) => document.getElementById(story.id)).filter(Boolean);
    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = window.scrollY + window.innerHeight * 0.42;
      let current = panels[0]?.id || STORIES[0].id;
      panels.forEach((panel) => {
        const top = panel.getBoundingClientRect().top + window.scrollY;
        if (top <= marker) current = panel.id;
      });
      setActive((value) => (value === current ? value : current));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  function goTo(id) {
    const panel = document.getElementById(id);
    if (!panel) return;
    setActive(id);
    panel.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <section className="lp-platform" id="platform">
      <div className="lp-platform-shell">
        <aside className="lp-platform-nav">
          <div className="lp-platform-nav-inner">
            <span className="lp-platform-nav-label">Platform</span>
            <nav aria-label="Platform sections">
              {STORIES.map((point, index) => (
                <PlatformNavPoint
                  point={point}
                  index={index}
                  active={active === point.id}
                  onSelect={goTo}
                  key={point.id}
                />
              ))}
            </nav>
            <div className="lp-platform-note"><i /> Live product demos</div>
          </div>
        </aside>
        <div className="lp-platform-main">
          <header className="lp-platform-hero">
            <Kicker>The platform</Kicker>
            <h2>The workspace that keeps up.<br /><span>Every relationship, every next move.</span></h2>
            <p>Five motions share one record graph: qualify the lead, move the deal, run the follow-up, read the number and keep the account.</p>
          </header>
          {STORIES.map((point) => (
            <PlatformPanel point={point} key={point.id} />
          ))}
        </div>
      </div>
    </section>
  );
}

function MiniTask() {
  const [done, setDone] = useState(false);
  return (
    <div className="lp-mini lp-mini--task">
      <div className="lp-mini-head"><span><IconCheckbox size={12} /> Tasks</span><Tag tone="blue">Weekly</Tag></div>
      <button type="button" className={`lp-mini-task ${done ? "is-done" : ""}`.trim()} onClick={() => setDone((value) => !value)}>
        <span className="lp-mini-check">{done && <IconCheck size={9} />}</span>
        <span><strong>Send weekly pipeline note</strong><small>Repeats every Monday</small></span>
      </button>
      <div className="lp-mini-next"><IconCalendar size={11} /><span>{done ? "Next occurrence" : "Scheduled"}</span><strong>{done ? "Mon, Nov 23" : "Mon, Nov 16"}</strong></div>
    </div>
  );
}

function MiniViews() {
  const [tab, setTab] = useState("risk");
  return (
    <div className="lp-mini lp-mini--views">
      <div className="lp-mini-head"><span><IconFilter size={12} /> Saved views</span><Tag tone="neutral">3 views</Tag></div>
      <div className="lp-mini-tabs" role="tablist" aria-label="Mini saved views">
        {[["all", "All"], ["risk", "At risk"], ["renewals", "Renewals"]].map(([key, label]) => (
          <button type="button" role="tab" key={key} aria-selected={tab === key} className={tab === key ? "active" : ""} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>
      {(tab === "risk" ? [["Layers", "At risk", "red"], ["Helio Systems", "Watch", "amber"]] : tab === "renewals" ? [["Layers", "Nov 22", "neutral"], ["Juniper Health", "Jan 14", "neutral"]] : [["Layers", "At risk", "red"], ["Juniper Health", "Healthy", "green"], ["Helio Systems", "Watch", "amber"]]).map(([name, status, tone]) => (
        <div className="lp-mini-row" key={name}><i>{name[0]}</i><strong>{name}</strong><Tag tone={tone}>{status}</Tag></div>
      ))}
    </div>
  );
}

function MiniMerge() {
  const [merged, setMerged] = useState(false);
  return (
    <div className="lp-mini lp-mini--merge">
      <div className="lp-mini-head"><span><IconUsers size={12} /> Duplicate review</span><Tag tone="amber">2 matches</Tag></div>
      {merged ? (
        <div className="lp-mini-merged"><IconCircleCheck size={16} /><strong>One record kept</strong><small>3 notes and 2 tasks moved across.</small></div>
      ) : (
        <>
          <div className="lp-mini-dup"><span>MC</span><div><strong>Maya Chen</strong><small>maya@helio.co</small></div></div>
          <div className="lp-mini-dup"><span>MC</span><div><strong>Maya Chen</strong><small>maya@helio.systems</small></div></div>
          <button type="button" className="lp-mini-btn" onClick={() => setMerged(true)}>Merge records</button>
        </>
      )}
    </div>
  );
}

function MiniBackup() {
  return (
    <div className="lp-mini lp-mini--backup">
      <div className="lp-mini-head"><span><IconDatabase size={12} /> Workspace</span><Tag tone="green">Saved</Tag></div>
      <div className="lp-mini-file"><IconFile size={15} /><div><strong>linear-crm-backup.json</strong><small>2.4 MB · 18 objects</small></div></div>
      <div className="lp-mini-bar"><span /></div>
      <div className="lp-mini-meta"><span>Local storage</span><strong>64% used</strong></div>
      <a className="lp-mini-btn" href={ROUTES.backup}>How backups work <IconArrowRight size={11} /></a>
    </div>
  );
}

const PRACTICAL = [
  {
    number: "01",
    title: "Keep follow-ups in view",
    short: "Tasks, notes and the next step on the record.",
    copy: "Tasks and notes attach to the people and opportunities they belong to. Focus mode leaves only the follow-ups that need a decision.",
    demo: <FocusList />,
    href: ROUTES.keyboard,
    link: "See tasks and shortcuts",
  },
  {
    number: "02",
    title: "Shape your process",
    short: "Fields, views and a visual workflow editor.",
    copy: "Rename a field, add an object, save a view. Sketch a trigger, condition and action in the workflow canvas without a schema migration.",
    demo: <WorkflowCanvas />,
    href: ROUTES.workflows,
    link: "Explore workflows",
  },
  {
    number: "03",
    title: "Bring your data along",
    short: "CSV in, CSV out, one-file JSON backup.",
    copy: "CSV brings the book in and takes a table out. A one-file JSON backup restores the workspace exactly as it was, custom fields included.",
    demo: <ImportPanel />,
    href: ROUTES.importExport,
    link: "Import and export",
  },
];

function PracticalFeatures() {
  const [open, setOpen] = useState(0);

  return (
    <section className="lp-practical" id="practical">
      <div className="lp-practical-copy">
        <Kicker>Make it yours</Kicker>
        <h2>A workspace that fits<br />the way you work.</h2>
        <p>Three parts of the product that keep the detail from falling through: the follow-up, the process behind it, and a clean way out with your data.</p>
      </div>
      <div className="lp-practical-list">
        {PRACTICAL.map((item, index) => {
          const isOpen = open === index;
          return (
            <div className={"lp-practical-row" + (isOpen ? " is-open" : "")} key={item.number}>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={"practical-panel-" + index}
                onClick={() => setOpen(index)}
              >
                <span className="lp-practical-number">{item.number}</span>
                <span className="lp-practical-row-copy">
                  <strong>{item.title}</strong>
                  <small>{item.short}</small>
                </span>
                <IconChevronDown size={17} />
              </button>
              <div className="lp-practical-demo" id={"practical-panel-" + index} hidden={!isOpen}>
                <p>{item.copy}</p>
                <div className="lp-practical-stage">{item.demo}</div>
                <TextLink href={item.href}>{item.link}</TextLink>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
const SCENARIOS = [
  {
    number: "01",
    title: "Founder-led sales",
    copy: "A lead arrives from a conversation. It becomes a person and a company, gets a next step, and the whole relationship stays readable without three other tools.",
    tags: ["Leads", "People", "Pipeline"],
  },
  {
    number: "02",
    title: "A two-person studio",
    copy: "Fewer accounts, more context. Notes, files and follow-ups stay on the record, while saved views keep renewals and quiet accounts visible.",
    tags: ["Notes", "Tasks", "Saved views"],
  },
  {
    number: "03",
    title: "A solo operator",
    copy: "The workspace has to work offline and belong to the person using it. Local records, a one-file backup and no account are the feature.",
    tags: ["Local-first", "Backup", "No backend"],
  },
];

const FAQ = [
  ["Do I need an account?", "No. Open the workspace and the sample records are already loaded. There is no sign-in, no email capture and no password."],
  ["Where does my data live?", "In this browser's local storage. Chrome, Firefox and a private window each keep a separate workspace. Export a backup before clearing site data."],
  ["Can my team use it together?", "Not as a shared real-time workspace. There are no accounts, permissions or sync. A JSON backup can be moved between browsers by hand."],
  ["Is this a commercial product?", "No. It is a personal project. There is no billing, support agreement or uptime promise. The source is the product."],
];

export function HomePage() {
  return (
    <>
      <section className="lp-hero">
        <div className="lp-hero-bg" aria-hidden="true" />
        <div className="lp-hero-copy">
          <a className="lp-pill" href={ROUTES.liner}>
            <span className="lp-pill-dot" /> Local-first CRM, no account required
            <IconArrowRight size={12} />
          </a>
          <h1>Customer relationships,<br /><span>in flow.</span></h1>
          <p>
            Leads, companies, opportunities and follow-ups in one workspace.
            Records live in your browser, so there is nothing to install and no sync to wait for.
          </p>
          <div className="lp-actions">
            <Button href={ROUTES.crm} icon="up">Open the workspace</Button>
            <Button href="#platform" variant="secondary" icon="right">Take the tour</Button>
          </div>
          <TrustRow />
        </div>
        <div className="lp-hero-stage">
          <div className="lp-hero-frame">
            <WorkspacePreview />
          </div>
          <div className="lp-hero-caption">
            <span><i /> The actual interface, with sample records.</span>
            <a href={ROUTES.crm}>Open your own workspace <IconArrowUpRight size={12} /></a>
          </div>
        </div>
      </section>

      <section className="lp-objects">
        <p>Every record your revenue team touches, connected in one place.</p>
        <ObjectStrip />
        <span className="lp-objects-note">Objects share typed fields and real relationships. A record keeps its links when it moves.</span>
      </section>

      <PlatformTour />

      <section className="lp-ask">
        <div className="lp-ask-copy">
          <Kicker>Liner</Kicker>
          <h2>Ask the workspace.<br /><span>Get an answer, not another tab.</span></h2>
          <p>Liner reads the records in front of you. Pipeline, deal risk, follow-ups and tasks come back with the context attached.</p>
          <CheckList items={[
            "Answers grounded in the current workspace",
            "Drafts that reuse the conversation you already have",
            "Local summaries work without an API key",
          ]} />
          <TextLink href={ROUTES.liner}>How Liner handles your data</TextLink>
        </div>
        <div className="lp-ask-stage"><LinerChat /></div>
      </section>

      <PracticalFeatures />

      <SignalSection />

      <section className="lp-scenarios">
        <SectionHead
          kicker="Use cases"
          title={<>Built around the work,<br />not a logo wall.</>}
          copy="This is a personal project, so there are no invented customers or testimonials. These are the workflows the sample workspace was built around."
        />
        <div className="lp-scenario-grid">
          {SCENARIOS.map((scenario) => (
            <article key={scenario.number}>
              <span>{scenario.number}</span>
              <h3>{scenario.title}</h3>
              <p>{scenario.copy}</p>
              <div>{scenario.tags.map((tag) => <Tag key={tag} tone="neutral">{tag}</Tag>)}</div>
            </article>
          ))}
        </div>
        <TextLink href={ROUTES.customers}>See the use cases in context</TextLink>
      </section>

      <section className="lp-price-preview">
        <div className="lp-price-copy">
          <Kicker>Pricing</Kicker>
          <h2>$0, because there is no backend to pay for.</h2>
          <p>No subscription, no seat count and no billing system. The workspace runs from static files and keeps its records in the browser.</p>
          <div className="lp-price-inline"><strong>$0</strong><span>forever, while this is a personal project</span></div>
          <div className="lp-actions">
            <Button href={ROUTES.crm} icon="up">Open the workspace</Button>
            <Button href={ROUTES.pricing} variant="secondary" icon="right">Read the full boundary</Button>
          </div>
        </div>
        <div className="lp-price-lists">
          <div>
            <h3>Included</h3>
            <ul>
              {["Leads, people, companies and opportunities", "Pipeline, table, board and calendar views", "Saved views, custom fields and objects", "Workflows, forecasts, dashboards and Liner", "CSV portability and a JSON backup"].map((item) => <li key={item}><IconCheck size={12} /> {item}</li>)}
            </ul>
          </div>
          <div>
            <h3>Not included</h3>
            <ul className="is-muted">
              {["A hosted database or backend", "User accounts, permissions or sync", "Real email delivery or payments", "Uptime guarantees or support"].map((item) => <li key={item}><IconX size={12} /> {item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="lp-faq">
        <div className="lp-faq-head">
          <Kicker>Before you start</Kicker>
          <h2>A few things worth knowing.</h2>
          <p>The honest version, including the parts a marketing page usually leaves out.</p>
        </div>
        <div className="lp-faq-list">
          {FAQ.map(([question, answer], index) => (
            <details key={question} open={index === 0}>
              <summary>{question}<IconPlus size={15} /></summary>
              <p>{answer}</p>
            </details>
          ))}
        </div>
      </section>

      <FinalCta />
    </>
  );
}

/* -------------------------------------------------------------- platform */

const SYSTEM = [
  { title: "Pipeline", copy: "Stage, amount, owner and next step on every open deal.", href: ROUTES.pipeline, Icon: IconLayoutKanban },
  { title: "Record moves", copy: "A lead becomes a person or a company without a duplicate.", href: ROUTES.recordMoves, Icon: IconRefresh },
  { title: "Workflows", copy: "Triggers, conditions and actions with a visible run log.", href: ROUTES.workflows, Icon: IconBolt },
  { title: "Forecast", copy: "Committed, best case and coverage by stage.", href: ROUTES.forecast, Icon: IconTargetArrow },
  { title: "Liner", copy: "Questions answered from the records in front of you.", href: ROUTES.liner, Icon: IconSparkles },
  { title: "Universal context", copy: "One timeline for notes, files and stage changes.", href: ROUTES.context, Icon: IconNotes },
];

export function PlatformPage() {
  return (
    <>
      <PageHero
        kicker="Platform"
        title="Every revenue motion,"
        accent=" one connected system."
        copy="Pipeline, record moves, workflows, forecasts and account context read from the same local records. There is no integration layer because there is no backend to integrate."
        primary={{ label: "Open the workspace", href: ROUTES.crm }}
        secondary={{ label: "Take the product tour", href: ROUTES.product }}
        note="A personal project. No backend, no account, no sync service."
      />

      <section className="lp-system">
        <SectionHead kicker="The system" title="Six surfaces, one record graph." copy="Each page below opens a working part of the product. None of them is a screenshot." />
        <div className="lp-system-grid">
          {SYSTEM.map(({ title, copy, href, Icon }) => (
            <a href={href} key={title}>
              <span><Icon size={17} /></span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <em>Read the page <IconArrowRight size={12} /></em>
            </a>
          ))}
        </div>
      </section>

      <FeatureBlock
        id="pipeline"
        kicker="Pipeline"
        title="A next step on every open deal."
        copy="Focus mode removes the healthy deals and leaves the ones that need a decision. Stage age and a missing next step are visible without opening a second tab."
        points={["Move a deal and the totals change", "Spot a quiet account before the call", "Read the weighted forecast from the same board"]}
        demo={<PipelineBoard />}
      />

      <FeatureBlock
        reverse
        id="workflows"
        kicker="Workflows"
        title="Automate the follow-up, not the relationship."
        copy="A stage change can create the task, log the activity and hand the record to the right owner. Every run writes back to the record. The honest limit is stated on the page."
        points={["Trigger on created, stage changed or field changed", "Pause a workflow without deleting its history", "Nothing runs while the browser is closed"]}
        demo={<WorkflowCanvas />}
      />

      <FeatureBlock
        id="forecast"
        kicker="Forecast"
        title="Coverage before confidence."
        copy="Committed revenue, best case and stage coverage come from the records. Switch the period and the model changes with it."
        points={["Weighted value is amount times probability", "Compare each stage against target", "The answer sits beside the chart"]}
        demo={<ForecastPanel />}
      />

      <FeatureBlock
        reverse
        id="assistant"
        kicker="Liner"
        title="Ask the workspace a direct question."
        copy="Simple questions are answered from local data. A more complex request reaches an external model only when you configure one."
        points={["Answers name the records they used", "The connection key stays in session storage", "Suggestions stay separate from saved changes"]}
        demo={<LinerChat />}
      />

      <FeatureBlock
        id="context"
        kicker="Account context"
        title="The book stays readable."
        copy="Renewals, health and expansion signals sit next to the account. Select a company and the next play changes with it."
        points={["One view for renewals and expansion", "Signals and next plays stay together", "Every account links back to the live record"]}
        demo={<AccountBook />}
        wide
      />

      <section className="lp-system-foot">
        <div>
          <Kicker>Platform, in practice</Kicker>
          <h2>The system is the workspace.</h2>
        </div>
        <p>Open the sample workspace and move between a record, the pipeline and the forecast without losing the thread.</p>
        <Button href={ROUTES.crm} icon="up">Open the workspace</Button>
      </section>
    </>
  );
}

/* --------------------------------------------------------------- product */

export function ProductPage() {
  return (
    <>
      <PageHero
        kicker="Product"
        title="One workspace,"
        accent=" every record in motion."
        copy="The record is the centre of the product. Open a company, move a lead, save a view or read the pipeline without changing tools. The same data follows you through every screen."
        primary={{ label: "Open the workspace", href: ROUTES.crm }}
        secondary={{ label: "See the platform", href: ROUTES.platform }}
        note="Every demo on this page is interactive. All data stays in this browser."
      >
        <div className="lp-product-preview"><WorkspacePreview defaultView="companies" /></div>
      </PageHero>

      <FeatureBlock
        kicker="Overview"
        title="The day, before the first call."
        copy="Open pipeline, weighted forecast, won revenue and the follow-up agenda sit on one page. Every number reads from the records below it."
        points={["Five KPIs computed from live records", "Stage totals that match the board", "Tasks grouped by the day they are due"]}
        demo={<OverviewPanel />}
        wide
      />

      <FeatureBlock
        reverse
        id="data-model"
        kicker="Data model"
        title="Structure that flexes without breaking links."
        copy="Leads, people, companies and opportunities share typed fields and real relationships. Add a field or an object and the workspace still knows how records connect."
        points={["Standard objects with editable fields", "Custom objects and relation fields", "No backend schema to migrate"]}
        demo={<DataModelPanel />}
      />

      <FeatureBlock
        id="records"
        kicker="Record moves"
        title="Move the record, keep the relationship."
        copy="A lead becomes a person or a company without becoming a second record. Notes, tasks, files, favourites and history travel with it."
        points={["No duplicate record created", "Links, files and history follow the move", "Move back to Leads if qualification was wrong"]}
        demo={<RecordMove />}
      />

      <FeatureBlock
        reverse
        id="views"
        kicker="Saved views"
        title="The view you left is the view you return to."
        copy="Filter the book, choose the layout and save it by name. Views remember the filters and sorting, so the Monday review does not start from scratch."
        points={["Save filters, sorting and columns", "Switch between account views", "Views survive reloads and backups"]}
        demo={<SavedViewsPanel />}
        wide
      />

      <PageCta
        kicker="Product detail"
        title="Every screen is the same workspace."
        copy="Open a record, move it, change the view and ask a question. Nothing has to be copied into another tool."
      />
    </>
  );
}

/* ------------------------------------------------------------- resources */

const RESOURCE_CARDS = [
  { title: "Local-first", copy: "Where records live, what leaves the browser and what the trade-off costs.", href: ROUTES.localFirst, Icon: IconLock },
  { title: "Import and export", copy: "CSV in for a table, CSV out for a hand-off, JSON for the whole workspace.", href: ROUTES.importExport, Icon: IconTable },
  { title: "Backup and restore", copy: "One file, every record and setting. The recovery plan, written down.", href: ROUTES.backup, Icon: IconDatabase },
  { title: "Keyboard shortcuts", copy: "The command menu, record search and quick create from the keyboard.", href: ROUTES.keyboard, Icon: IconSearch },
];

export function ResourcesPage() {
  return (
    <>
      <PageHero
        kicker="Resources"
        title="Your workspace,"
        accent=" explained."
        copy="Open the CRM in your browser. Learn where the records live, how to move them and what to do before clearing site data."
        primary={{ label: "Open the workspace", href: ROUTES.crm }}
        secondary={{ label: "How it runs", href: ROUTES.localFirst }}
        note="Personal project · no backend · no account · no tracking"
      />

      <section className="lp-resource-grid">
        {RESOURCE_CARDS.map(({ title, copy, href, Icon }) => (
          <a href={href} key={title}>
            <span><Icon size={17} /></span>
            <h3>{title}</h3>
            <p>{copy}</p>
            <em>Read more <IconArrowRight size={12} /></em>
          </a>
        ))}
      </section>

      <section className="lp-resource-split">
        <div>
          <Kicker>Your data</Kicker>
          <h2>Available online.<br />Saved in your browser.</h2>
          <p>You can visit the hosted site without installing anything. Your records stay in the browser you use, with no shared database and no automatic sync between devices.</p>
          <CheckList items={[
            "Records are written to this browser profile",
            "A JSON backup is the complete copy",
            "External AI is opt-in and never required",
          ]} />
          <TextLink href={ROUTES.localFirst}>Read the storage model</TextLink>
        </div>
        <div><StoragePanel /></div>
      </section>

      <section className="lp-resource-notes">
        <div>
          <span>01</span>
          <h3>There are no accounts.</h3>
          <p>The profile and workspace switcher are local conveniences, not authentication. Anyone with this browser profile can open the workspace.</p>
        </div>
        <div>
          <span>02</span>
          <h3>The browser is the deployment target.</h3>
          <p>Static files, no remote environment. Clearing site data removes the workspace unless you have a backup.</p>
        </div>
        <div>
          <span>03</span>
          <h3>AI is optional.</h3>
          <p>Simple Liner questions use local records. A connected model is an extra, not a requirement for the CRM to work.</p>
        </div>
      </section>

      <section className="lp-faq lp-faq--tight">
        <div className="lp-faq-head">
          <Kicker>Questions</Kicker>
          <h2>About your workspace.</h2>
        </div>
        <div className="lp-faq-list">
          <details open><summary>Is there a backend?<IconPlus size={15} /></summary><p>No. The site is static HTML, CSS and JavaScript. The CRM stores data in the browser and does not call a database, auth service or sync server.</p></details>
          <details><summary>Where does my data live?<IconPlus size={15} /></summary><p>In this browser's local storage. Different browsers and profiles keep separate workspaces. Clearing site data removes the workspace.</p></details>
          <details><summary>Can I use it with a team?<IconPlus size={15} /></summary><p>Not as a shared real-time workspace. There are no accounts, permissions or sync. A JSON backup can be moved between browsers manually.</p></details>
          <details><summary>Do I need an AI service?<IconPlus size={15} /></summary><p>No. Records, tasks and local Liner summaries work without one. A configured connection enables more complex requests.</p></details>
        </div>
      </section>

      <PageCta
        kicker="Your workspace is ready"
        title="Open your next chapter."
        copy="Explore the CRM right here in your browser. No installation and no account."
      />
    </>
  );
}

/* ------------------------------------------------------------- customers */

export function CustomersPage() {
  return (
    <>
      <PageHero
        kicker="Use cases"
        title="Built around the work,"
        accent=" not a logo wall."
        copy="This is a personal project, so there are no invented customers or testimonials. What follows are the workflows the sample workspace was built around, shown with sample records."
        primary={{ label: "Open the sample workspace", href: ROUTES.crm }}
        secondary={{ label: "See the account book", href: "#book" }}
        note="Sample records only. No real customer data appears on this page."
      />

      <section className="lp-scenario-list">
        {SCENARIOS.map((scenario) => (
          <article key={scenario.number}>
            <span>{scenario.number}</span>
            <div><h2>{scenario.title}</h2><p>{scenario.copy}</p></div>
            <div className="lp-scenario-tags">{scenario.tags.map((tag) => <Tag key={tag} tone="neutral">{tag}</Tag>)}</div>
          </article>
        ))}
      </section>

      <section className="lp-book-section" id="book">
        <SectionHead kicker="The account book" title="A sample book with a memory." copy="Open an account and the renewal, signal and next play change with it. The data is fictional. The interaction is the product." />
        <div className="lp-wide-stage"><AccountBook /></div>
      </section>

      <section className="lp-brief">
        <div>
          <Kicker>The design brief</Kicker>
          <h2>A clear view of your relationships.</h2>
        </div>
        <div>
          <p>Fewer surfaces, one model, local records. The project is deliberately smaller than a hosted CRM and deliberately honest about what it does not include.</p>
          <TextLink href={ROUTES.localFirst}>Read the architecture</TextLink>
        </div>
      </section>

      <PageCta
        kicker="Use the sample workspace"
        title="Bring a real workflow, not a demo script."
        copy="The sample records make the product legible. Replace them with your own book whenever you are ready."
      />
    </>
  );
}

/* --------------------------------------------------------------- pricing */

export function PricingPage() {
  return (
    <>
      <PageHero
        kicker="Pricing"
        title="$0, because there is"
        accent=" no backend to pay for."
        copy="Linear CRM is a personal project, not a hosted service. There is no subscription, no seat count and no billing system. It runs from static files and keeps records in the browser."
        primary={{ label: "Open the workspace", href: ROUTES.crm }}
        secondary={{ label: "How it runs", href: ROUTES.localFirst }}
        note="Free to use. No account, no payment details, no server."
      />

      <section className="lp-pricing" id="plan">
        <div className="lp-plan-card">
          <Kicker tone="dark">The only plan</Kicker>
          <div className="lp-plan-price"><strong>$0</strong><span>forever, while this is a personal project</span></div>
          <Button href={ROUTES.crm} variant="light" icon="up">Open the workspace</Button>
          <small>No sign-up. The sample workspace is already loaded.</small>
        </div>
        <div className="lp-plan-detail">
          <div>
            <h3>Included</h3>
            <ul className="lp-plan-list">
              {["Leads, people, companies and opportunities", "Pipeline, table, board and calendar views", "Saved views, custom fields and custom objects", "Workflows, forecasts, dashboards and Liner", "CSV import and export", "One-file JSON backup and restore"].map((item) => <li key={item}><IconCheck size={12} /> {item}</li>)}
            </ul>
          </div>
          <div>
            <h3>Not included</h3>
            <ul className="lp-plan-list is-muted">
              {["A hosted database or backend", "User accounts, permissions or real-time sync", "Email delivery or payment processing", "Uptime guarantees or customer support", "A shared team workspace", "Anyone else holding a copy of your data"].map((item) => <li key={item}><IconX size={12} /> {item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="lp-plan-notes">
        <div><span>01</span><h3>Runs locally</h3><p>Static files served from this folder. There is no remote environment to maintain and no monthly bill behind it.</p></div>
        <div><span>02</span><h3>Data is yours</h3><p>Records live in local storage. Export a JSON backup before clearing site data or changing browsers.</p></div>
        <div><span>03</span><h3>AI is optional</h3><p>Liner can use an external model when configured. The CRM does not require it, and the key is not part of a backup.</p></div>
      </section>

      <section className="lp-price-caveat">
        <div>
          <Kicker>What free means here</Kicker>
          <h2>No invoice. No illusion of a hosted service.</h2>
        </div>
        <p>This is a personal project. The source is the product and the browser is the deployment target. Back up the workspace if the data matters, because there is no one to call when it is gone.</p>
      </section>

      <section className="lp-faq lp-faq--tight">
        <div className="lp-faq-head">
          <Kicker>Pricing questions</Kicker>
          <h2>Before you rely on it.</h2>
        </div>
        <div className="lp-faq-list">
          <details open><summary>Will it always be free?<IconPlus size={15} /></summary><p>It is free while it remains a personal project. There is no billing system, so nothing can charge you today.</p></details>
          <details><summary>Can I use it at work?<IconPlus size={15} /></summary><p>You can use the workspace, but there is no support agreement, no access control and no shared sync. Treat it as a local tool, not a company system of record.</p></details>
          <details><summary>What happens if I clear my browser?<IconPlus size={15} /></summary><p>The workspace is gone. Restore it from a JSON backup. There is no server copy and no recovery service.</p></details>
        </div>
      </section>

      <PageCta
        kicker="No checkout"
        title="Start at the workspace, not a pricing funnel."
        copy="There is nothing to buy. Open the CRM, try the sample data and decide whether the local-first trade-off fits."
      />
    </>
  );
}
