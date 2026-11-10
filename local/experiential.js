import { formatMoney } from "./format";
import { openStages, today } from "./schema";

export const EXPERIENTIAL_BASE_URL = "https://api.experientiallabs.ai/v1";
export const EXPERIENTIAL_MODEL = "clef-flash";
export const EXPERIENTIAL_CHAT_MODEL = "gpt-6-luna";

export function experientialConfig() {
  const config = globalThis.LINEAR_CRM_CONFIG || {};
  let sessionKey = "";
  try { sessionKey = sessionStorage.getItem("linear-crm.liner-session-key") || ""; } catch {}
  return {
    apiKey: String(sessionKey || config.experientialApiKey || "").trim(),
    baseUrl: String(config.experientialBaseUrl || EXPERIENTIAL_BASE_URL).replace(/\/+$/, ""),
    model: String(config.experientialModel || EXPERIENTIAL_MODEL),
    chatModel: String(config.experientialChatModel || EXPERIENTIAL_CHAT_MODEL),
  };
}

export function isExperientialConfigured() {
  return Boolean(experientialConfig().apiKey);
}

function daysUntil(date) {
  if (!date) return null;
  const target = new Date(`${date}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86_400_000);
}

export function workspaceState(db) {
  const openDeals = db.deals.filter((deal) => openStages.includes(deal.stage));
  const openValue = openDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  const weighted = openDeals.reduce(
    (sum, deal) =>
      sum + ((Number(deal.amount) || 0) * (Number(deal.probability) || 0)) / 100,
    0,
  );
  const openTasks = db.tasks.filter((task) => !["Done", "Cancelled"].includes(task.status));

  return {
    workspace: db.workspace,
    today: today(),
    summary: {
      openOpportunities: openDeals.length,
      openPipeline: openValue,
      weightedForecast: Math.round(weighted),
      openTasks: openTasks.length,
      overdueTasks: openTasks.filter((task) => task.date && task.date < today()).length,
    },
    opportunities: openDeals
      .slice()
      .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
      .slice(0, 10)
      .map((deal) => ({
        id: deal.id,
        name: deal.name,
        stage: deal.stage,
        amount: Number(deal.amount) || 0,
        probability: Number(deal.probability) || 0,
        closeDate: deal.date || null,
        daysToClose: daysUntil(deal.date),
        company:
          db.companies.find((company) => company.id === deal.company)?.name || null,
        contact:
          db.contacts.find((contact) => contact.id === deal.contact)?.name || null,
        owner: deal.owner || null,
        nextStep: deal.nextStep || null,
        nextFollowUp: deal.nextFollowUp || null,
        source: deal.source || null,
        type: deal.type || null,
      })),
    accounts: db.companies.slice(0, 12).map((company) => ({
      name: company.name,
      industry: company.industry || null,
      tier: company.accountTier || null,
      owner: company.owner || null,
      revenue: Number(company.annualRevenue) || 0,
    })),
    people: db.contacts.slice(0, 12).map((contact) => ({
      name: contact.name,
      role: contact.role || null,
      company:
        db.companies.find((company) => company.id === contact.company)?.name || null,
      status: contact.status || null,
    })),
  };
}

export async function systemOne(state, questions, { signal } = {}) {
  const config = experientialConfig();
  if (!config.apiKey) {
    throw new Error(
      "EXPLABS_API_KEY is not configured. Create a key under Settings → API Keys, export it, and rebuild the app.",
    );
  }

  const response = await fetch(`${config.baseUrl}/systemone`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model: config.model, state, questions }),
    signal,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      payload?.error?.message ||
        `Experiential returned ${response.status}. Check the API key and try again.`,
    );
  }
  if (!payload?.answers) {
    throw new Error("Experiential returned no decision answers.");
  }
  return payload;
}

export async function chatCompletion(messages, { signal, tools, toolChoice } = {}) {
  const config = experientialConfig();
  if (!config.apiKey) {
    throw new Error(
      "EXPLABS_API_KEY is not configured. Create a key under Settings → API Keys, export it, and rebuild the app.",
    );
  }

  const body = { model: config.chatModel, messages };
  if (tools) body.tools = tools;
  if (toolChoice) body.tool_choice = toolChoice;

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal,
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const failure = new Error("AI request failed");
    failure.userMessage = response.status === 401 || response.status === 403
      ? "The AI connection key was rejected. Update it in Settings → Integrations."
      : response.status === 429 ? "The AI service is busy or your usage limit was reached. Try again later."
      : response.status === 404 ? "The configured AI endpoint is unavailable. Check the connection configuration."
      : "The AI service returned an error (" + response.status + "). Test the connection in Settings → Integrations.";
    throw failure;
  }
  if (!payload?.choices?.length) {
    const failure = new Error("Invalid AI response");
    failure.userMessage = "The AI service returned an empty response. Test the connection in Settings → Integrations.";
    throw failure;
  }
  return payload;
}

export async function prioritizePipeline(db, options) {
  const deals = db.deals
    .filter((deal) => openStages.includes(deal.stage))
    .slice()
    .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
    .slice(0, 8);

  if (!deals.length) throw new Error("Add an open opportunity before asking for a focus.");

  const criteria = Object.fromEntries(
    deals.map((deal) => [
      deal.id,
      `${deal.name} — ${deal.stage}, ${formatMoney(deal.amount)}, closes ${deal.date || "unscheduled"}, next step: ${deal.nextStep || "missing"}, owner: ${deal.owner || "unassigned"}`,
    ]),
  );

  const payload = await systemOne(
    workspaceState(db),
    {
      focus: {
        type: "choice",
        instructions:
          "Which open opportunity should the revenue team focus on next? Prefer near-term value, a credible close date, a clear next step and an owner.",
        criteria,
      },
    },
    options,
  );

  const answer = payload.answers.focus || {};
  const winner = deals.find((deal) => deal.id === answer.choice) || deals[0];

  return {
    winner,
    deals,
    confidence: Number(answer.confidence) || 0,
    probabilities: answer.probabilities || {},
    usage: payload.usage || {},
    provider: payload.provider,
  };
}

export async function reviewRisk(db, options) {
  const deals = db.deals
    .filter((deal) => openStages.includes(deal.stage))
    .slice()
    .sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))
    .slice(0, 6);

  if (!deals.length) throw new Error("Add an open opportunity before reviewing risk.");

  const questions = Object.fromEntries(
    deals.map((deal, index) => [
      `deal_${index}`,
      {
        type: "noul",
        instructions: `${deal.name} is at risk of slipping or being lost in the next 90 days. Its stage is ${deal.stage}, value ${formatMoney(deal.amount)}, close date ${deal.date || "missing"}, next step ${deal.nextStep || "missing"}, next follow-up ${deal.nextFollowUp || "missing"}, owner ${deal.owner || "unassigned"}.`,
      },
    ]),
  );

  const payload = await systemOne(workspaceState(db), questions, options);
  const entries = deals
    .map((deal, index) => ({
      deal,
      risk: Number(payload.answers[`deal_${index}`]?.noul) || 0,
    }))
    .sort((a, b) => b.risk - a.risk);

  return {
    entries,
    usage: payload.usage || {},
    provider: payload.provider,
  };
}

export async function customDecision(db, statement, options) {
  const instructions = statement.trim();
  if (!instructions) throw new Error("Type a yes / no question first.");

  const payload = await systemOne(
    workspaceState(db),
    { statement: { type: "noul", instructions } },
    options,
  );

  return {
    value: Number(payload.answers.statement?.noul) || 0,
    usage: payload.usage || {},
    provider: payload.provider,
  };
}
