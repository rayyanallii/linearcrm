const normalized = (value) => String(value || "").trim().toLowerCase();
const domain = (value) => normalized(value).replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];

export function leadMatches(lead, state) {
  const email = normalized(lead.email);
  const company = normalized(lead.companyName);
  const website = domain(lead.website);
  return {
    contacts: email ? state.contacts.filter((record) => normalized(record.email) === email) : [],
    companies: state.companies.filter((record) =>
      (company && normalized(record.name) === company) ||
      (website && domain(record.website) === website)),
  };
}

export function convertLead(state, leadId, choices, { id = () => crypto.randomUUID(), now = new Date().toISOString() } = {}) {
  const lead = state.leads.find((record) => record.id === leadId);
  if (!lead) throw new Error("This lead no longer exists.");
  if (lead.conversion) return lead.conversion;
  if (!lead.name?.trim()) throw new Error("The lead needs a name.");
  const matches = leadMatches(lead, state);
  const select = (records, chosen, candidates, label) => {
    if (chosen) {
      const record = records.find((entry) => entry.id === chosen);
      if (!record) throw new Error("The selected " + label + " no longer exists.");
      return record;
    }
    if (candidates.length > 1) throw new Error("Choose which matching " + label + " to reuse.");
    return candidates[0];
  };
  const contact = select(state.contacts, choices.contactId, matches.contacts, "contact");
  let company = select(state.companies, choices.companyId, matches.companies, "company");
  if (contact?.company) {
    const linked = state.companies.find((entry) => entry.id === contact.company);
    if (!linked) throw new Error("The selected contact has a missing company. Repair it before converting.");
    if (company && company.id !== linked.id) throw new Error("The selected contact belongs to a different company.");
    company = linked;
  }
  const companyName = String(choices.companyName ?? lead.companyName ?? "").trim();
  const amount = choices.amount === "" || choices.amount === undefined ? 0 : Number(choices.amount);
  const dealName = String(choices.dealName || "").trim();
  if (choices.createDeal && (!dealName || !Number.isFinite(amount) || amount < 0))
    throw new Error("Enter an opportunity name and a nonnegative amount.");
  const created = { createdAt: now, updatedAt: now, createdBy: state.members?.[0] || "Local user" };
  const newCompany = !company && companyName ? {
    ...created, id: id(), name: companyName, website: lead.website || "",
    owner: lead.owner || "", industry: lead.industry || "", details: "",
  } : null;
  const companyId = company?.id || newCompany?.id || "";
  const newContact = !contact ? {
    ...created, id: id(), name: lead.name.trim(), email: lead.email || "",
    phone: lead.phone || "", role: lead.role || "", owner: lead.owner || "",
    company: companyId, status: "Qualified", leadSource: lead.source || "",
    details: lead.details || "",
  } : null;
  const contactId = contact?.id || newContact.id;
  const newDeal = choices.createDeal ? {
    ...created, id: id(), name: dealName, amount, stage: "Prospecting",
    probability: state.pipelines?.find(row => row.id === state.defaultPipelineId)?.probabilities?.Prospecting ?? 10, owner: lead.owner || "", company: companyId, contact: contactId,
    source: lead.source || "", type: "New business", details: lead.details || "",
  } : null;
  const conversion = { at: now, contactId, companyId, dealId: newDeal?.id || "" };
  // Apply only after every choice has been validated.
  if (newCompany) state.companies.unshift(newCompany);
  if (newContact) state.contacts.unshift(newContact);
  else if(!contact.company && companyId) contact.company=companyId;
  if (newDeal) state.deals.unshift(newDeal);
  lead.status = "Converted";
  lead.conversion = conversion;
  for (const type of ["tasks", "notes"]) {
    for (const record of state[type] || []) {
      if (record.lead !== lead.id) continue;
      if (!record.contact) record.contact = contactId;
      if (!record.company) record.company = companyId;
      if (!record.deal && newDeal) record.deal = newDeal.id;
    }
  }
  return conversion;
}
