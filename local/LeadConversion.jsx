import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { Select } from "./Select";
import { convertLead, leadMatches } from "./lead-conversion.mjs";

export function LeadConversion({ record, db, commit, open }) {
  const matches = leadMatches(record, db);
  const [expanded, setExpanded] = useState(false);
  const [contactId, setContactId] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [createDeal, setCreateDeal] = useState(false);
  const [error, setError] = useState("");
  if (record.conversion) {
    const links = [
      ["contacts", record.conversion.contactId, "Contact"],
      ["companies", record.conversion.companyId, "Company"],
      ["deals", record.conversion.dealId, "Opportunity"],
    ];
    return <section className="lead-conversion">
      <h4>Converted {new Date(record.conversion.at).toLocaleDateString()}</h4>
      {links.filter(([, id]) => id).map(([type, id, label]) => {
        const target = db[type].find(row => row.id === id);
        return target
          ? <Button key={type} size="sm" variant="ghost" onClick={() => open(type, target)}>{label} · {target.name}</Button>
          : <p key={type}>{label} is unavailable. Check Trash to restore it.</p>;
      })}
    </section>;
  }
  function submit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const choices = { ...data, contactId, companyId, createDeal };
    try {
      // Preview validation uses the same operation as the atomic store commit.
      convertLead(structuredClone(db), record.id, choices);
      if (commit(state => convertLead(state, record.id, choices), "Converted lead · " + record.name)) {
        setExpanded(false);
        setError("");
      }
    } catch (failure) {
      setError(failure.message);
    }
  }
  return <section className="lead-conversion">
    <Button size="sm" variant="solid" onClick={() => setExpanded(!expanded)}>Convert lead</Button>
    {expanded && <form onSubmit={submit} className="lead-conversion-form">
      <p>Reuse matching records or create a contact and optional company. The lead and its history are retained.</p>
      {(matches.contacts.length > 0 || matches.companies.length > 0) &&
        <p role="status">{matches.contacts.length} matching contacts and {matches.companies.length} matching companies found.</p>}
      <label>Contact
        <Select ariaLabel="Conversion contact" value={contactId} onChange={setContactId}
          options={[{ value: "", label: "Match by email or create contact" }, ...db.contacts.map(row => ({ value: row.id, label: row.name + (row.email ? " · " + row.email : "") }))]} />
      </label>
      <label>Company
        <Select ariaLabel="Conversion company" value={companyId} onChange={setCompanyId}
          options={[{ value: "", label: "Match company or create if named" }, ...db.companies.map(row => ({ value: row.id, label: row.name }))]} />
      </label>
      <label>Company name if new<input name="companyName" defaultValue={record.companyName || ""} /></label>
      <label className="lead-check"><input type="checkbox" checked={createDeal} onChange={event => setCreateDeal(event.target.checked)} />Create an opportunity</label>
      {createDeal && <>
        <label>Opportunity name<input required name="dealName" defaultValue={(record.companyName || record.name) + " opportunity"} /></label>
        <label>Amount (USD)<input required name="amount" type="number" min="0" step="0.01" defaultValue="0" /></label>
      </>}
      {error && <p className="field-error" role="alert">{error}</p>}
      <div className="panel-actions"><Button type="submit" variant="solid">Confirm conversion</Button><Button type="button" onClick={() => setExpanded(false)}>Cancel</Button></div>
    </form>}
  </section>;
}
