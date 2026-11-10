/*
 * Campaign audience + send planning.
 *
 * A campaign is a segment (leads or people), a sender, a message and optional
 * follow-ups. Sending is simulated: the plan becomes local email log records so
 * the timeline, reporting and CSV export all see it, and nothing leaves the browser.
 */

import { today } from "./schema.js";

export const FOLLOW_UP_LIMIT = 3;

export function normalizeFollowUps(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, FOLLOW_UP_LIMIT).map((step, index) => ({
    id: step?.id || `follow_${index}`,
    days: Math.max(1, Math.min(90, Number(step?.days) || index * 3 + 3)),
    subject: String(step?.subject || ""),
    body: String(step?.body || ""),
  }));
}

export function recipientKey(kind, id) {
  return `${kind}:${id}`;
}

export function audienceFor(db, campaign) {
  const type = campaign?.audienceObject === "People" ? "contacts" : "leads";
  const rows = db?.[type] || [];
  return rows
    .filter((row) => {
      if (!row.email || !String(row.email).includes("@")) return false;
      if (
        campaign.audienceStatus &&
        campaign.audienceStatus !== "Any" &&
        row.status !== campaign.audienceStatus
      )
        return false;
      const sourceValue = type === "leads" ? row.source : row.leadSource;
      if (
        campaign.audienceSource &&
        campaign.audienceSource !== "Any" &&
        sourceValue !== campaign.audienceSource
      )
        return false;
      if (
        type === "leads" &&
        campaign.audiencePriority &&
        campaign.audiencePriority !== "Any" &&
        row.priority !== campaign.audiencePriority
      )
        return false;
      if (
        campaign.audienceOwner &&
        campaign.audienceOwner !== "Any" &&
        row.owner !== campaign.audienceOwner
      )
        return false;
      return true;
    })
    .map((row) => {
      const company =
        type === "contacts" ? (db.companies || []).find((item) => item.id === row.company) : null;
      return {
        key: recipientKey(type, row.id),
        type,
        id: row.id,
        name: row.name,
        email: row.email,
        firstName: String(row.name || "").split(" ")[0],
        companyName: row.companyName || company?.name || "",
        role: row.role || "",
        owner: row.owner || "",
        contactId: type === "contacts" ? row.id : "",
        companyId: type === "contacts" ? row.company || "" : "",
      };
    });
}

export function renderMerge(text, recipient) {
  return String(text || "")
    .replaceAll("{{first_name}}", recipient?.firstName || "there")
    .replaceAll("{{name}}", recipient?.name || "")
    .replaceAll("{{company}}", recipient?.companyName || "your team")
    .replaceAll("{{role}}", recipient?.role || "");
}

export function planCampaignSend({
  campaign,
  mailbox,
  recipients = [],
  subject = "",
  body = "",
  attachment = "",
  limit = 25,
  stepIndex = 0,
  author = "",
}) {
  const allowance = Math.max(0, Math.min(2000, Number(limit) || 0));
  const batch = recipients.slice(0, allowance);
  const emails = batch.map((recipient) => ({
    id: crypto.randomUUID(),
    name: renderMerge(subject, recipient).slice(0, 160) || campaign?.name || "Campaign",
    direction: "Outbound",
    date: today(),
    to: recipient.email,
    from: mailbox?.email || "",
    contact: recipient.contactId || "",
    company: recipient.companyId || "",
    lead: recipient.type === "leads" ? recipient.id : "",
    campaign: campaign?.id || "",
    attachment,
    details: renderMerge(body, recipient),
    createdBy: author || "Local workspace",
    createdAt: new Date().toISOString(),
  }));
  return {
    emails,
    sentKeys: batch.map((recipient) => recipient.key),
    batch: batch.length,
    allowance,
    stepIndex,
  };
}

export function campaignDraft(record = {}, db = {}) {
  return {
    emailAccount: record.emailAccount || (db.mailboxes || [])[0]?.id || "",
    audienceObject: record.audienceObject || "Leads",
    audienceStatus: record.audienceStatus || "Any",
    audienceSource: record.audienceSource || "Any",
    audiencePriority: record.audiencePriority || "Any",
    audienceOwner: record.audienceOwner || "Any",
    subject: record.subject || "",
    body: record.body || "",
    startDate: record.startDate || today(),
    followUps: normalizeFollowUps(record.followUps),
  };
}

