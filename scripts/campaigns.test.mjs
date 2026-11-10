import test from "node:test";
import assert from "node:assert/strict";
import {
  WARMUP_DAYS,
  advanceWarmup,
  dailyAllowance,
  mailboxFromForm,
  mailboxHealth,
} from "../local/mailbox-health.mjs";
import {
  audienceFor,
  normalizeFollowUps,
  planCampaignSend,
  renderMerge,
} from "../local/campaigns.mjs";

const campaign = {
  id: "cp1",
  name: "Q4 outbound",
  audienceObject: "Leads",
  audienceStatus: "Any",
  audienceSource: "Any",
  audiencePriority: "Any",
  audienceOwner: "Any",
};

const db = {
  companies: [{ id: "co1", name: "Layers" }],
  leads: [
    {
      id: "l1",
      name: "Ada Lovelace",
      email: "ada@layers.com",
      status: "Contacted",
      source: "Inbound",
      priority: "High",
      owner: "Alex Morgan",
      companyName: "Layers",
      role: "CTO",
    },
    {
      id: "l2",
      name: "No Mail",
      email: "",
      status: "Contacted",
      source: "Inbound",
      priority: "High",
      owner: "Alex Morgan",
    },
    {
      id: "l3",
      name: "Grace Hopper",
      email: "grace@navy.mil",
      status: "New",
      source: "Referral",
      priority: "Low",
      owner: "Maya Chen",
    },
  ],
  contacts: [
    {
      id: "p1",
      name: "Katherine Johnson",
      email: "kj@nasa.gov",
      status: "Customer",
      leadSource: "Event",
      owner: "Sam Rivera",
      company: "co1",
      role: "Director",
    },
    {
      id: "p2",
      name: "No Email",
      email: "",
      status: "Lead",
      leadSource: "Event",
      owner: "Sam Rivera",
      company: "co1",
    },
  ],
  mailboxes: [],
};

test("warm-up ramps the daily allowance up to the mailbox limit", () => {
  const mailbox = mailboxFromForm({
    name: "Alex · Gmail",
    email: "alex@gmail.com",
    username: "alex@gmail.com",
    password: "app-password",
    dailyLimit: 50,
    warmupEnabled: true,
    warmupDay: 1,
  });
  assert.equal(dailyAllowance(mailbox), 8);
  assert.equal(dailyAllowance({ ...mailbox, warmupDay: 7 }), 28);
  assert.equal(dailyAllowance({ ...mailbox, warmupDay: WARMUP_DAYS }), 50);
  assert.equal(dailyAllowance({ ...mailbox, status: "Paused" }), 0);
  assert.equal(dailyAllowance({ ...mailbox, warmupEnabled: false }), 50);
});

test("health explains warm-up, verification and overuse", () => {
  const base = mailboxFromForm({
    name: "Alex · Gmail",
    email: "alex@gmail.com",
    username: "alex@gmail.com",
    password: "app-password",
    warmupEnabled: true,
    warmupDay: 2,
    verified: true,
  });
  const warming = mailboxHealth(base);
  assert.equal(warming.label, "Warming up");
  assert.equal(warming.tone, "orange");
  assert.ok(warming.reasons.some((reason) => reason.includes("Warm-up day 2")));

  const healthy = mailboxHealth({ ...base, warmupEnabled: false, verified: true, sentToday: 0 });
  assert.equal(healthy.label, "Healthy");
  assert.equal(healthy.score, 96);

  const risky = mailboxHealth({ ...base, verified: false, sentToday: 40 });
  assert.ok(risky.score < healthy.score);
  assert.ok(risky.reasons.some((reason) => reason.includes("not been verified")));
});

test("advancing warm-up raises the day and resets today's counter", () => {
  const mailbox = mailboxFromForm({
    email: "alex@gmail.com",
    username: "alex@gmail.com",
    password: "x",
    warmupEnabled: true,
    warmupDay: 5,
    sentToday: 9,
  });
  const next = advanceWarmup(mailbox);
  assert.equal(next.warmupDay, 6);
  assert.equal(next.sentToday, 0);
  assert.equal(next.status, "Warming up");
});

test("campaign audience filters by segment and skips missing emails", () => {
  assert.deepEqual(
    audienceFor(db, campaign).map((recipient) => recipient.name),
    ["Ada Lovelace", "Grace Hopper"],
  );
  assert.deepEqual(
    audienceFor(db, { ...campaign, audiencePriority: "High" }).map((row) => row.id),
    ["l1"],
  );
  assert.deepEqual(
    audienceFor(db, { ...campaign, audienceStatus: "New" }).map((row) => row.id),
    ["l3"],
  );
  assert.deepEqual(
    audienceFor(db, { ...campaign, audienceSource: "Referral" }).map((row) => row.id),
    ["l3"],
  );
  assert.deepEqual(
    audienceFor(db, { ...campaign, audienceOwner: "Maya Chen" }).map((row) => row.id),
    ["l3"],
  );
  assert.deepEqual(
    audienceFor(db, { ...campaign, audienceObject: "People", audienceStatus: "Customer" }).map(
      (row) => row.id,
    ),
    ["p1"],
  );
});

test("merge tags resolve per recipient with sensible fallbacks", () => {
  const [ada] = audienceFor(db, campaign);
  assert.equal(
    renderMerge("Hi {{first_name}} at {{company}} ({{role}})", ada),
    "Hi Ada at Layers (CTO)",
  );
  assert.equal(renderMerge("Hi {{first_name}}", {}), "Hi there");
});

test("planning a send respects the allowance and writes local email records", () => {
  const mailbox = { email: "alex@gmail.com" };
  const recipients = audienceFor(db, campaign);
  const plan = planCampaignSend({
    campaign,
    mailbox,
    recipients,
    subject: "Hi {{first_name}}",
    body: "About {{company}}",
    attachment: "brief.pdf",
    limit: 1,
    author: "Alex Morgan",
  });
  assert.equal(plan.batch, 1);
  assert.equal(plan.emails.length, 1);
  assert.deepEqual(plan.sentKeys, ["leads:l1"]);
  const [email] = plan.emails;
  assert.equal(email.name, "Hi Ada");
  assert.equal(email.details, "About Layers");
  assert.equal(email.from, "alex@gmail.com");
  assert.equal(email.campaign, "cp1");
  assert.equal(email.lead, "l1");
  assert.equal(email.attachment, "brief.pdf");
  assert.equal(email.direction, "Outbound");
});

test("follow-ups cap at three with sane wait days", () => {
  const steps = normalizeFollowUps([
    { days: 0, subject: "A" },
    { days: 200, subject: "B" },
    { days: "5", subject: "C" },
    { days: 2, subject: "D" },
  ]);
  assert.equal(steps.length, 3);
  assert.equal(steps[0].days, 3);
  assert.equal(steps[1].days, 90);
  assert.equal(steps[2].days, 5);
});
