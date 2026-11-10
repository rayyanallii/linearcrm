import React, { useMemo, useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { IconMail, IconX } from "@tabler/icons-react";
import { today } from "./schema";

function relationFor(context, db) {
  if (!context?.record) return { contact: "", company: "", deal: "" };
  const { type, record } = context;
  if (type === "contacts")
    return { contact: record.id, company: record.company || "", deal: "" };
  if (type === "deals")
    return {
      contact: record.contact || "",
      company: record.company || "",
      deal: record.id,
    };
  if (type === "companies")
    return { contact: "", company: record.id, deal: "" };
  if (type === "emails")
    return {
      contact: record.contact || "",
      company: record.company || "",
      deal: record.deal || "",
    };
  return { contact: "", company: "", deal: "" };
}

function makeTemplate(kind, { record, contact, company, db }) {
  const person = contact?.name?.split(" ")[0] || "there";
  const companyName = company?.name || "your team";
  const dealName = record?.name || "the project";
  const sender = db.members?.[0] || "Alex";

  if (kind === "proposal")
    return `Hi ${person},\n\nAttached is the proposal for ${dealName}. It covers scope, the rollout sequence and commercial terms.\n\nI would be happy to walk through it with you this week and answer any questions.\n\nBest,\n${sender}`;
  if (kind === "check-in")
    return `Hi ${person},\n\nChecking in to see how things are going at ${companyName}. Is there anything on your side that would be useful for me to pick up?\n\nBest,\n${sender}`;
  if (kind === "meeting")
    return `Hi ${person},\n\nThanks for the time today. Quick recap:\n\n• What we agreed\n• Open questions\n• Next steps\n\nI will follow up with the details we discussed.\n\nBest,\n${sender}`;
  if (kind === "blank") return "";
  return `Hi ${person},\n\nFollowing up on ${dealName}. I wanted to share where we are and confirm the next step.\n\nWould a short call this week be useful?\n\nBest,\n${sender}`;
}

export function EmailComposer({ context, db, close, commit }) {
  const related = useMemo(() => relationFor(context, db), [context, db]);
  const contact = db.contacts.find((row) => row.id === related.contact);
  const company = db.companies.find((row) => row.id === related.company);
  const record = context?.record;

  const [to, setTo] = useState(contact?.email || "");
  const [subject, setSubject] = useState(
    record?.name ? `Following up on ${record.name}` : "",
  );
  const [template, setTemplate] = useState("follow-up");
  const [body, setBody] = useState(() =>
    makeTemplate("follow-up", { record, contact, company, db }),
  );
  const [error, setError] = useState("");

  function applyTemplate(kind) {
    setTemplate(kind);
    setBody(makeTemplate(kind, { record, contact, company, db }));
  }

  const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(
    subject,
  )}&body=${encodeURIComponent(body)}`;

  function logEmail(event) {
    event.preventDefault();
    if (!subject.trim()) {
      setError("Add a subject before logging the email.");
      return;
    }
    if (!to.trim() || !to.includes("@")) {
      setError("Add a valid recipient email.");
      return;
    }
    if (
      commit(
        (state) => {
          state.emails ??= [];
          state.emails.unshift({
            id: crypto.randomUUID(),
            name: subject.trim(),
            direction: "Outbound",
            date: today(),
            to: to.trim(),
            from: `${(state.members?.[0] || "Alex").toLowerCase().replaceAll(" ", ".")}@linearcrm.demo`,
            contact: related.contact,
            company: related.company,
            deal: related.deal,
            details: body,
            createdBy: state.members?.[0] || "Alex Morgan",
            createdAt: new Date().toISOString(),
          });
          const person = state.contacts.find((row) => row.id === related.contact);
          if (person) person.lastContacted = today();
        },
        `Logged email · ${subject.trim()}`,
      )
    ) {
      close();
    }
  }

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) close();
      }}
    >
      <form className="email-composer" onSubmit={logEmail} role="dialog" aria-modal="true">
        <header>
          <span>
            <IconMail size={16} /> Log an email
          </span>
          <Button type="button" variant="ghost" aria-label="Close" onClick={close}>
            <IconX size={16} />
          </Button>
        </header>

        <p className="composer-note">
          This is a local conversation log. Nothing is sent, and no mailbox is connected.
        </p>

        <label>
          To
          <input
            type="email"
            value={to}
            required
            placeholder="person@company.com"
            onChange={(event) => setTo(event.target.value)}
          />
        </label>
        <label>
          Subject
          <input
            value={subject}
            required
            maxLength={160}
            onChange={(event) => setSubject(event.target.value)}
          />
        </label>
        <label>
          Template
          <select value={template} onChange={(event) => applyTemplate(event.target.value)}>
            <option value="follow-up">Follow-up</option>
            <option value="proposal">Proposal</option>
            <option value="check-in">Check-in</option>
            <option value="meeting">Meeting recap</option>
            <option value="blank">Blank</option>
          </select>
        </label>
        <label>
          Body
          <textarea
            rows={11}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </label>

        {error && (
          <p role="alert" className="field-error">
            {error}
          </p>
        )}

        <footer>
          <a className="mailto-link" href={mailto}>
            Open in mail app
          </a>
          <div>
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="solid">
              Log email
            </Button>
          </div>
        </footer>
      </form>
    </div>
  );
}
