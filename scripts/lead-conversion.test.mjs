import test from "node:test";
import assert from "node:assert/strict";
import { convertLead, leadMatches } from "../local/lead-conversion.mjs";

const workspace = () => ({
  members: ["Alex Morgan"],
  leads: [{ id: "lead", name: "Taylor Chen", email: "Taylor@example.com", companyName: "Acme", owner: "Alex Morgan" }],
  contacts: [], companies: [], deals: [],
  tasks: [{ id: "task", lead: "lead", name: "Call Taylor" }],
  notes: [{ id: "note", lead: "lead", name: "Discovery" }],
});
const choices = { createDeal: true, dealName: "Acme rollout", amount: 12000 };

test("conversion retains the lead and links a contact, company, deal and follow-ups", () => {
  const state = workspace();
  const result = convertLead(state, "lead", choices);
  assert.equal(state.leads[0].status, "Converted");
  assert.equal(state.leads[0].name, "Taylor Chen");
  assert.equal(state.contacts[0].company, result.companyId);
  assert.equal(state.deals[0].contact, result.contactId);
  assert.equal(state.tasks[0].lead, "lead");
  assert.equal(state.tasks[0].deal, result.dealId);
  assert.equal(state.notes[0].contact, result.contactId);
  assert.equal(state.deals[0].amount, 12000);
});

test("email and company name matching are case insensitive and conversion is idempotent", () => {
  const state = workspace();
  state.contacts.push({ id: "person", name: "Existing Taylor", email: "taylor@EXAMPLE.com", company: "acme" });
  state.companies.push({ id: "acme", name: " ACME " });
  const first = convertLead(state, "lead", choices);
  const snapshot = structuredClone(state);
  assert.deepEqual(convertLead(state, "lead", choices), first);
  assert.deepEqual(state, snapshot);
  assert.equal(state.contacts.length, 1);
  assert.equal(first.contactId, "person");
  assert.equal(state.contacts[0].name, "Existing Taylor");
});

test("ambiguous and missing matches leave the entire workspace untouched", () => {
  const state = workspace();
  state.contacts = ["a", "b"].map(id => ({ id, name: id, email: "taylor@example.com" }));
  const snapshot = structuredClone(state);
  assert.throws(() => convertLead(state, "lead", choices), /Choose which matching contact/);
  assert.deepEqual(state, snapshot);
  assert.throws(() => convertLead(state, "lead", { ...choices, contactId: "missing" }), /no longer exists/);
  assert.deepEqual(state, snapshot);
  assert.equal(convertLead(state, "lead", { ...choices, contactId: "b" }).contactId, "b");
});

test("conflicting companies and invalid deal values fail before any mutation", () => {
  const state = workspace();
  state.companies = [{ id: "a", name: "Acme" }, { id: "b", name: "Another company" }];
  state.contacts = [{ id: "p", name: "Taylor", email: "taylor@example.com", company: "b" }];
  const snapshot = structuredClone(state);
  assert.throws(() => convertLead(state, "lead", choices), /different company/);
  assert.deepEqual(state, snapshot);
  state.contacts = [];
  for (const amount of [-1, "Infinity", "oops"]) {
    const before = structuredClone(state);
    assert.throws(() => convertLead(state, "lead", { ...choices, amount }), /nonnegative/);
    assert.deepEqual(state, before);
  }
});

test("contact-only conversion and domain-based duplicate detection", () => {
  const state = workspace();
  state.leads[0].companyName = "";
  convertLead(state, "lead", { createDeal: false });
  assert.equal(state.companies.length, 0);
  assert.equal(state.deals.length, 0);
  assert.equal(state.contacts.length, 1);
  assert.equal(leadMatches({ website: "https://www.acme.test/about" }, {
    companies: [{ id: "a", name: "Different name", website: "acme.test" }], contacts: [],
  }).companies[0].id, "a");
});
