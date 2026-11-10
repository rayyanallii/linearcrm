import React from "react";
import {
  IconAdjustmentsHorizontal,
  IconBriefcase,
  IconBuildingSkyscraper,
  IconCheckbox,
  IconDatabase,
  IconNotes,
  IconRefresh,
  IconSparkles,
  IconUsers,
} from "@tabler/icons-react";
import { Button, Kicker } from "./ui";
import { LogoMark } from "./logo";

const SIGNALS = [
  {
    title: "It logs itself.",
    body: "Keep notes and logged conversations together. Stage changes become part of the record's history.",
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

const ORBIT_NODES = [
  { label: "People", Icon: IconUsers, x: "10%", y: "58%" },
  { label: "Companies", Icon: IconBuildingSkyscraper, x: "29%", y: "30%" },
  { label: "Notes", Icon: IconNotes, x: "50%", y: "16%" },
  { label: "Tasks", Icon: IconCheckbox, x: "71%", y: "30%" },
  { label: "Deals", Icon: IconBriefcase, x: "90%", y: "58%" },
];

const ORBIT_PATHS = [
  "M 90 197 C 90 252, 450 240, 450 304",
  "M 261 102 C 261 200, 450 236, 450 304",
  "M 450 54 C 450 150, 450 230, 450 304",
  "M 639 102 C 639 200, 450 236, 450 304",
  "M 810 197 C 810 252, 450 240, 450 304",
];

export function SignalSection() {
  return (
    <section className="lp-signal" aria-label="Workspace context">
      <div className="lp-signal-beams" aria-hidden="true"><i /><i /></div>
      <div className="lp-signal-inner">
        <header className="lp-signal-head">
          <Kicker tone="dark">Universal context</Kicker>
          <h2>All of your customer context.<br /><span>None of the chasing.</span></h2>
        </header>

        <div className="lp-signal-grid">
          {SIGNALS.map(({ title, body, Icon }) => (
            <article key={title}>
              <span className="lp-signal-icon"><Icon size={16} /></span>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>

        <div className="lp-orbit" aria-hidden="true">
          <svg viewBox="0 0 900 340" preserveAspectRatio="none">
            {ORBIT_PATHS.map((d) => <path key={d} d={d} fill="none" stroke="#3b414b" strokeWidth="1" />)}
          </svg>
          {ORBIT_NODES.map(({ label, Icon, x, y }) => (
            <span className="lp-orbit-node" key={label} style={{ left: x, top: y }}>
              <i><Icon size={17} /></i>
              <small>{label}</small>
            </span>
          ))}
          <span className="lp-orbit-core"><LogoMark tone="white" size={30} /></span>
        </div>

        <div className="lp-signal-foot">
          <div>
            <Kicker tone="dark">The point</Kicker>
            <h3>Your CRM should remember the work, not ask you to repeat it.</h3>
          </div>
          <div>
            <p>
              A record is only useful if the next person can pick it up. Linear CRM keeps
              the notes, the moves and the reasons in one place, then gets out of the way.
            </p>
            <Button href="./app.html" variant="light" icon="right">Open the workspace</Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function GlassMark() {
  return (
    <div className="lp-glass" aria-hidden="true">
      <span className="lp-chrome-floor" />
      <div className="lp-chrome">
        <span className="lp-chrome-depth">
          {Array.from({ length: 12 }, (_, index) => (
            <i key={index} style={{ "--depth": index }} />
          ))}
        </span>
        <span className="lp-chrome-face" />
        <span className="lp-chrome-glare" />
      </div>
    </div>
  );
}

export function FinalCta() {
  return (
    <section className="lp-final" id="final">
      <div className="lp-final-grid" aria-hidden="true" />
      <div className="lp-final-inner">
        <GlassMark />
        <Kicker tone="dark">Ready when you are</Kicker>
        <h2>Make room for your<br />next good relationship.</h2>
        <p>Open the demo, move a record, close a deal. Nothing to install and nobody to call.</p>
        <div className="lp-actions">
          <Button href="./app.html" variant="light" icon="up">Open the workspace</Button>
          <Button href="./resources-local-first.html" variant="ghost" icon="right">How it runs</Button>
        </div>
      </div>
    </section>
  );
}
