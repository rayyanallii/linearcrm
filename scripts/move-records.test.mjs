import test from "node:test";
import assert from "node:assert/strict";
import { moveBlockReason, moveRecords, moveTargets } from "../local/move-records.mjs";

const base = () => ({
  members: ["Alex Morgan"],
  companies: [{ id: "company", name: "Acme", website: "acme.test", industry: "Technology" }],
  contacts: [],
  leads: [],
  deals: [],
  tasks: [{ id: "task", name: "Call", lead: "", contact: "", company: "" }],
  notes: [{ id: "note", name: "Discovery", lead: "", contact: "", company: "" }],
  emails: [{ id: "email", name: "Hello", lead: "", contact: "", company: "" }],
  projects: [{ id: "project", name: "Delivery", company: "", contact: "" }],
  campaigns: [{ id: "campaign", name: "Outbound", sentTo: [] }],
  files: [],
  pins: [],
  scheduled: [],
  workflowRuns: [],
  activity: [],
  objects: [],
  customFields: [],
});

const lead = (overrides = {}) => ({
  id: "lead",
  name: "Taylor Chen",
  status: "Interested",
  email: "taylor@acme.test",
  phone: "+1 555 0100",
  role: "Head of Ops",
  companyName: "Acme",
  website: "https://www.acme.test",
  industry: "Technology",
  owner: "Alex Morgan",
  source: "Referral",
  priority: "High",
  budget: 12000,
  needs: "Needs a rollout plan",
  nextFollowUp: "2026-12-01",
  tags: "enterprise, warm",
  campaign: "campaign",
  details: "Met at a conference.",
  createdBy: "Alex Morgan",
  createdAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

test("lead to People keeps customer fields and retargets every link", () => {
  const state = base();
  state.leads = [lead()];
  state.tasks[0].lead = "lead";
  state.notes[0].lead = "lead";
  state.emails[0].lead = "lead";
  state.files = [{ id: "file", type: "leads", record: "lead", name: "brief.pdf" }];
  state.pins = [{ type: "leads", id: "lead" }];
  state.campaigns[0].sentTo = ["leads:lead"];
  state.scheduled = [{ recordType: "leads", recordId: "lead" }];
  state.workflowRuns = [{ targetType: "leads", targetId: "lead" }];
  state.activity = [{ changes: [{ type: "leads", id: "lead" }] }];

  const [person] = moveRecords(state, "leads", ["lead"], "contacts", {
    now: "2026-02-02T00:00:00.000Z",
  });

  assert.equal(state.leads.length, 0);
  assert.equal(state.contacts.length, 1);
  assert.equal(person.id, "lead");
  assert.equal(person.name, "Taylor Chen");
  assert.equal(person.status, "Qualified");
  assert.equal(person.company, "company");
  assert.equal(person.campaign, "campaign");
  assert.equal(person.createdAt, "2026-01-01T00:00:00.000Z");
  assert.equal(person.updatedAt, "2026-02-02T00:00:00.000Z");
  assert.match(person.details, /Business needs: Needs a rollout plan/);
  assert.match(person.details, /Next follow-up: 2026-12-01/);
  assert.equal(state.tasks[0].lead, "");
  assert.equal(state.tasks[0].contact, "lead");
  assert.equal(state.notes[0].contact, "lead");
  assert.equal(state.emails[0].contact, "lead");
  assert.equal(state.files[0].type, "contacts");
  assert.deepEqual(state.pins, [{ type: "contacts", id: "lead" }]);
  assert.deepEqual(state.campaigns[0].sentTo, ["contacts:lead"]);
  assert.equal(state.scheduled[0].recordType, "contacts");
  assert.equal(state.workflowRuns[0].targetType, "contacts");
  assert.equal(state.activity[0].changes[0].type, "contacts");
});

test("lead to Companies uses the company identity and clears lead relations", () => {
  const state = base();
  state.companies = [];
  state.leads = [lead({ companyName: "Acme Labs", website: "acme.test" })];
  state.tasks[0].lead = "lead";
  state.campaigns[0].sentTo = ["leads:lead"];

  const [company] = moveRecords(state, "leads", ["lead"], "companies");

  assert.equal(company.name, "Acme Labs");
  assert.equal(company.relationshipStatus, "Prospect");
  assert.equal(company.website, "acme.test");
  assert.equal(company.industry, "Technology");
  assert.match(company.details, /Contact: Taylor Chen \(taylor@acme.test\)/);
  assert.equal(state.tasks[0].lead, "");
  assert.equal(state.tasks[0].company, "lead");
  assert.deepEqual(state.campaigns[0].sentTo, []);
});

test("People and Companies can move back to Leads with company context", () => {
  const personState = base();
  personState.contacts = [{
    id: "person",
    name: "Taylor Chen",
    email: "taylor@acme.test",
    phone: "+1 555 0100",
    role: "Head of Ops",
    status: "Customer",
    leadSource: "Referral",
    campaign: "campaign",
    owner: "Alex Morgan",
    company: "company",
    city: "Austin",
    country: "United States",
    details: "Champion.",
  }];
  personState.tasks[0].contact = "person";
  personState.campaigns[0].sentTo = ["contacts:person"];

  const [personLead] = moveRecords(personState, "contacts", ["person"], "leads");
  assert.equal(personLead.status, "Interested");
  assert.equal(personLead.companyName, "Acme");
  assert.equal(personLead.website, "acme.test");
  assert.equal(personLead.industry, "Technology");
  assert.equal(personLead.source, "Referral");
  assert.equal(personLead.campaign, "campaign");
  assert.match(personLead.details, /Location: Austin, United States/);
  assert.equal(personState.tasks[0].contact, "");
  assert.equal(personState.tasks[0].lead, "person");
  assert.deepEqual(personState.campaigns[0].sentTo, ["leads:person"]);

  const companyState = base();
  companyState.companies = [{
    id: "company",
    name: "Acme",
    website: "acme.test",
    industry: "Technology",
    phone: "+1 555 0111",
    owner: "Alex Morgan",
    details: "Key account.",
  }];
  companyState.tasks[0].company = "company";

  const [companyLead] = moveRecords(companyState, "companies", ["company"], "leads");
  assert.equal(companyLead.name, "Acme");
  assert.equal(companyLead.companyName, "Acme");
  assert.equal(companyLead.status, "New");
  assert.equal(companyLead.phone, "+1 555 0111");
  assert.equal(companyState.tasks[0].company, "");
  assert.equal(companyState.tasks[0].lead, "company");
});

test("converted leads, unsupported destinations and id conflicts fail atomically", () => {
  const state = base();
  state.leads = [lead({ conversion: { contactId: "person" } })];
  const before = structuredClone(state);
  assert.match(moveBlockReason("leads", state.leads), /converted/i);
  assert.throws(() => moveRecords(state, "leads", ["lead"], "contacts"), /converted/i);
  assert.deepEqual(state, before);
  assert.throws(() => moveRecords(state, "leads", ["lead"], "deals"), /cannot receive/);
  assert.deepEqual(state, before);

  state.leads = [lead()];
  state.contacts = [{ id: "lead", name: "Existing" }];
  const conflicted = structuredClone(state);
  assert.throws(() => moveRecords(state, "leads", ["lead"], "contacts"), /already exists/);
  assert.deepEqual(state, conflicted);
});

test("only relevant destinations are offered", () => {
  assert.deepEqual(moveTargets("leads").map((item) => item.type), ["contacts", "companies"]);
  assert.deepEqual(moveTargets("contacts").map((item) => item.type), ["leads"]);
  assert.deepEqual(moveTargets("companies").map((item) => item.type), ["leads"]);
  assert.deepEqual(moveTargets("deals"), []);
});
