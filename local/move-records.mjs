import { OBJECTS, fieldDefs, objectDef } from "./schema.js";

/*
 * Moving is intentionally narrower than conversion. It changes which section
 * owns a record, keeps the record id, and retargets links that pointed at it.
 * Converted leads are blocked because their linked People/Companies are already
 * the canonical customer records.
 */
export const MOVE_TARGETS = {
  leads: [
    {
      type: "contacts",
      description:
        "Keeps the person, contact details, owner, campaign and notes. A company with the same name or domain is linked when available.",
    },
    {
      type: "companies",
      description:
        "Uses the lead's company name (or lead name) and keeps the website, industry, phone, owner and notes.",
    },
  ],
  contacts: [
    {
      type: "leads",
      description:
        "Keeps contact details, owner, campaign and notes, and pulls the linked company's name, website and industry into the lead.",
    },
  ],
  companies: [
    {
      type: "leads",
      description:
        "Keeps the company name, website, industry, phone, owner and notes, and starts the lead in the New stage.",
    },
  ],
};

const text = (value) => String(value ?? "").trim();
const normalized = (value) => text(value).toLowerCase();
const domain = (value) =>
  normalized(value)
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];

function collectionTypes(state) {
  return [
    ...new Set([
      ...Object.keys(OBJECTS),
      ...(state.objects || []).map((object) => object.key).filter(Boolean),
    ]),
  ];
}

function joinDetails(...values) {
  return values.map(text).filter(Boolean).join("\n\n");
}

function matchCompany(state, lead) {
  const name = normalized(lead.companyName);
  const website = domain(lead.website);
  return (state.companies || []).find(
    (company) =>
      (name && normalized(company.name) === name) ||
      (website && domain(company.website) === website),
  );
}

function contactStatus(status) {
  if (status === "Converted") return "Customer";
  if (["Interested", "Qualified", "Replied", "Follow-up"].includes(status))
    return "Qualified";
  if (["Not interested", "Unqualified"].includes(status)) return "Churned";
  return "Lead";
}

function leadStatus(status) {
  if (status === "Qualified") return "Qualified";
  if (status === "Customer") return "Interested";
  if (status === "Churned") return "Not interested";
  return "New";
}

function withCustomFields(next, source, targetType, state) {
  for (const field of fieldDefs(targetType, state)) {
    if (!field.custom || source[field.key] === undefined) continue;
    next[field.key] = source[field.key];
  }
  return next;
}

function baseRecord(record, state, now) {
  return {
    id: record.id,
    name: text(record.name),
    createdAt: record.createdAt || now,
    createdBy: record.createdBy || state.members?.[0] || "Local user",
    updatedAt: now,
  };
}

function fromLead(record, targetType, state, now) {
  const base = baseRecord(record, state, now);
  if (targetType === "contacts") {
    const company = matchCompany(state, record);
    const details = joinDetails(
      record.details,
      !company && record.companyName ? `Company: ${record.companyName}` : "",
      !company && record.website ? `Company website: ${record.website}` : "",
      record.needs ? `Business needs: ${record.needs}` : "",
      record.budget !== "" && record.budget !== undefined
        ? `Budget: ${record.budget}`
        : "",
      record.nextFollowUp ? `Next follow-up: ${record.nextFollowUp}` : "",
      record.tags ? `Tags: ${record.tags}` : "",
    );
    return withCustomFields(
      {
        ...base,
        role: text(record.role),
        email: text(record.email),
        phone: text(record.phone),
        status: contactStatus(record.status),
        leadSource: text(record.source),
        campaign:
          record.campaign &&
          (state.campaigns || []).some((campaign) => campaign.id === record.campaign)
            ? record.campaign
            : "",
        owner: text(record.owner),
        lastContacted: "",
        company: company?.id || "",
        city: "",
        country: "",
        linkedIn: "",
        details,
      },
      record,
      targetType,
      state,
    );
  }

  const details = joinDetails(
    record.details,
    record.companyName && normalized(record.companyName) !== normalized(record.name)
      ? `Contact: ${record.name}${record.email ? ` (${record.email})` : ""}`
      : "",
    record.needs ? `Business needs: ${record.needs}` : "",
    record.budget !== "" && record.budget !== undefined
      ? `Budget: ${record.budget}`
      : "",
  );
  return withCustomFields(
    {
      ...base,
      name: text(record.companyName) || base.name,
      website: text(record.website),
      industry: text(record.industry),
      accountTier: "",
      relationshipStatus: "Prospect",
      employees: "",
      annualRevenue: "",
      icp: false,
      owner: text(record.owner),
      renewalDate: "",
      phone: text(record.phone),
      address: "",
      city: "",
      country: "",
      linkedIn: "",
      details,
    },
    record,
    targetType,
    state,
  );
}

function fromContact(record, state, now) {
  const company = (state.companies || []).find(
    (row) => row.id === record.company,
  );
  const location = [record.city, record.country].map(text).filter(Boolean);
  return withCustomFields(
    {
      ...baseRecord(record, state, now),
      status: leadStatus(record.status),
      email: text(record.email),
      phone: text(record.phone),
      role: text(record.role),
      companyName: text(company?.name),
      website: text(company?.website),
      industry: text(company?.industry),
      campaign:
        record.campaign &&
        (state.campaigns || []).some((campaign) => campaign.id === record.campaign)
          ? record.campaign
          : "",
      owner: text(record.owner),
      source: text(record.leadSource),
      priority: "Normal",
      budget: "",
      needs: "",
      nextFollowUp: "",
      tags: "",
      details: joinDetails(
        record.details,
        location.length ? `Location: ${location.join(", ")}` : "",
      ),
    },
    record,
    "leads",
    state,
  );
}

function fromCompany(record, state, now) {
  return withCustomFields(
    {
      ...baseRecord(record, state, now),
      name: text(record.name),
      companyName: text(record.name),
      website: text(record.website),
      industry: text(record.industry),
      phone: text(record.phone),
      owner: text(record.owner),
      status: "New",
      source: "",
      priority: "Normal",
      budget: "",
      needs: "",
      nextFollowUp: "",
      campaign: "",
      tags: "",
      details: text(record.details),
    },
    record,
    "leads",
    state,
  );
}

function moveLinks(state, sourceType, targetType, id) {
  for (const type of collectionTypes(state)) {
    const fields = fieldDefs(type, state);
    const sourceFields = fields.filter(
      (field) => field.type === "relation" && field.object === sourceType,
    );
    if (!sourceFields.length) continue;
    const targetFields = fields.filter(
      (field) => field.type === "relation" && field.object === targetType,
    );
    for (const row of state[type] || []) {
      if (!sourceFields.some((field) => row[field.key] === id)) continue;
      for (const field of sourceFields) {
        if (row[field.key] === id) row[field.key] = "";
      }
      const targetField = targetFields.find((field) => !row[field.key]);
      if (targetField) row[targetField.key] = id;
    }
  }

  for (const campaign of state.campaigns || []) {
    if (!Array.isArray(campaign.sentTo)) continue;
    const oldKey = `${sourceType}:${id}`;
    if (!campaign.sentTo.includes(oldKey)) continue;
    campaign.sentTo = campaign.sentTo.filter((key) => key !== oldKey);
    if (targetType === "contacts" || targetType === "leads") {
      const nextKey = `${targetType}:${id}`;
      if (!campaign.sentTo.includes(nextKey)) campaign.sentTo.push(nextKey);
    }
  }

  for (const file of state.files || []) {
    if (file.type === sourceType && file.record === id) file.type = targetType;
  }
  for (const pin of state.pins || []) {
    if (pin.type === sourceType && pin.id === id) pin.type = targetType;
  }
  for (const entry of state.scheduled || []) {
    if (entry.recordType === sourceType && entry.recordId === id)
      entry.recordType = targetType;
  }
  for (const run of state.workflowRuns || []) {
    if (run.targetType === sourceType && run.targetId === id)
      run.targetType = targetType;
  }
  for (const item of state.activity || []) {
    for (const change of item.changes || []) {
      if (change.type === sourceType && change.id === id)
        change.type = targetType;
    }
  }
}

export function moveTargets(sourceType) {
  return MOVE_TARGETS[sourceType] || [];
}

export function moveBlockReason(sourceType, records) {
  if (sourceType !== "leads") return "";
  const converted = records.filter((record) => record.conversion).length;
  if (!converted) return "";
  return `${converted} converted ${
    converted === 1 ? "lead already has" : "leads already have"
  } linked People or Companies. Clear ${converted === 1 ? "it" : "them"} before moving.`;
}

export function moveRecords(state, sourceType, ids, targetType, { now = new Date().toISOString() } = {}) {
  const target = moveTargets(sourceType).find((item) => item.type === targetType);
  if (!target) throw new Error("That section cannot receive these records.");
  if (!Array.isArray(state[targetType])) throw new Error("The destination section is unavailable.");

  const wanted = new Set(ids);
  const records = (state[sourceType] || []).filter((record) => wanted.has(record.id));
  if (!records.length) throw new Error("Select at least one record to move.");
  if (records.length !== wanted.size)
    throw new Error("Some selected records no longer exist. Refresh and try again.");

  const block = moveBlockReason(sourceType, records);
  if (block) throw new Error(block);
  if (new Set(records.map((record) => record.id)).size !== records.length)
    throw new Error("The selection contains duplicate records.");

  const conflict = state[targetType].find((record) =>
    records.some((item) => item.id === record.id),
  );
  if (conflict)
    throw new Error(
      `“${conflict.name}” already exists in ${objectDef(targetType, state).plural}. Nothing was moved.`,
    );

  let nextRecords;
  if (sourceType === "leads") {
    nextRecords = records.map((record) =>
      targetType === "contacts"
        ? fromLead(record, "contacts", state, now)
        : fromLead(record, "companies", state, now),
    );
  } else if (sourceType === "contacts") {
    nextRecords = records.map((record) => fromContact(record, state, now));
  } else {
    nextRecords = records.map((record) => fromCompany(record, state, now));
  }

  if (nextRecords.some((record) => !record.name))
    throw new Error("Every moved record needs a name.");

  state[targetType].unshift(...nextRecords);
  state[sourceType] = state[sourceType].filter((record) => !wanted.has(record.id));
  for (const record of records)
    moveLinks(state, sourceType, targetType, record.id);

  return nextRecords;
}
