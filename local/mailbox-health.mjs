/*
 * Sending accounts and their warm-up schedule.
 *
 * Everything here is local bookkeeping: the app never opens an SMTP connection.
 * The numbers exist so a campaign respects a realistic daily allowance and so the
 * Email accounts page can explain the health of a mailbox instead of showing a
 * green dot with no meaning.
 */

export const WARMUP_DAYS = 14;

export const PROVIDER_PRESETS = {
  Gmail: { host: "smtp.gmail.com", port: 587, security: "TLS" },
  "Google Workspace": { host: "smtp.gmail.com", port: 587, security: "TLS" },
  Outlook: { host: "smtp.office365.com", port: 587, security: "TLS" },
  "Custom SMTP": { host: "", port: 587, security: "TLS" },
};

export function warmupDay(mailbox) {
  if (!mailbox) return 0;
  const stored = Number(mailbox.warmupDay);
  if (Number.isFinite(stored) && stored > 0)
    return Math.max(1, Math.min(WARMUP_DAYS, Math.round(stored)));
  if (mailbox.warmupStart) {
    const started = Date.parse(mailbox.warmupStart);
    if (Number.isFinite(started)) {
      const days = Math.floor((Date.now() - started) / 86400000) + 1;
      return Math.max(1, Math.min(WARMUP_DAYS, days));
    }
  }
  return mailbox.warmupEnabled ? 1 : 0;
}

export function dailyAllowance(mailbox) {
  if (!mailbox || mailbox.status === "Paused") return 0;
  const limit = Math.max(1, Number(mailbox.dailyLimit) || 50);
  if (!mailbox.warmupEnabled) return limit;
  const day = warmupDay(mailbox);
  const ramp = 5 + ((limit - 5) * Math.min(day, WARMUP_DAYS)) / WARMUP_DAYS;
  return Math.max(1, Math.min(limit, Math.round(ramp)));
}

export function mailboxHealth(mailbox) {
  const allowance = dailyAllowance(mailbox);
  const used = Math.max(0, Number(mailbox?.sentToday) || 0);
  const day = warmupDay(mailbox);
  const paused = mailbox?.status === "Paused";
  const reasons = [];
  let score = 96;

  if (paused) {
    score = 35;
    reasons.push("Sending is paused.");
  }
  if (!mailbox?.verified) {
    score -= 22;
    reasons.push("Credentials have not been verified.");
  }
  if (mailbox?.warmupEnabled && day < WARMUP_DAYS) {
    score -= Math.round(((WARMUP_DAYS - day) / WARMUP_DAYS) * 18);
    reasons.push(`Warm-up day ${day} of ${WARMUP_DAYS}: ${allowance} sends today.`);
  } else if (mailbox?.warmupEnabled) {
    reasons.push(`Warmed up after ${WARMUP_DAYS} days.`);
  }
  if (allowance && used > allowance) {
    score -= 18;
    reasons.push(`Today's volume (${used}) is above the ${allowance}/day allowance.`);
  } else if (allowance && used / allowance >= 0.8) {
    reasons.push("Close to today's allowance.");
  }
  const bounces = Math.max(0, Number(mailbox?.bounces) || 0);
  if (bounces && used) {
    const rate = bounces / Math.max(1, used);
    if (rate > 0.03) {
      score -= 20;
      reasons.push(`${Math.round(rate * 100)}% bounce rate.`);
    }
  }
  if (!allowance) reasons.push("No sends until sending resumes.");

  const total = Math.max(0, Math.min(100, Math.round(score)));
  const label = paused
    ? "Paused"
    : mailbox?.warmupEnabled && day < WARMUP_DAYS
      ? "Warming up"
      : total >= 85
        ? "Healthy"
        : total >= 65
          ? "Watch"
          : "At risk";
  const tone =
    label === "Healthy" ? "green" : label === "Warming up" || label === "Watch" ? "orange" : "red";

  return {
    score: total,
    label,
    tone,
    reasons,
    allowance,
    used,
    remaining: Math.max(0, allowance - used),
    warmupDay: day,
    warmupDays: WARMUP_DAYS,
  };
}

export function advanceWarmup(mailbox) {
  const day = Math.min(WARMUP_DAYS, warmupDay(mailbox) + 1);
  return {
    ...mailbox,
    warmupEnabled: true,
    warmupDay: day,
    sentToday: 0,
    status: day >= WARMUP_DAYS ? "Warmed up" : "Warming up",
  };
}

export function mailboxFromForm(values = {}) {
  const preset = PROVIDER_PRESETS[values.provider] || PROVIDER_PRESETS.Gmail;
  const warmupEnabled = values.warmupEnabled === true;
  const today = new Date().toISOString().slice(0, 10);
  const dailyLimit = Math.max(1, Math.min(2000, Number(values.dailyLimit) || 50));
  return {
    id: values.id || crypto.randomUUID(),
    name: String(values.name || "").trim() || "Email account",
    email: String(values.email || "").trim(),
    fromName: String(values.fromName || "").trim(),
    provider: values.provider || "Gmail",
    host: String(values.host || preset.host || "").trim(),
    port: Number(values.port) || preset.port || 587,
    security: values.security || preset.security || "TLS",
    username: String(values.username || values.email || "").trim(),
    password: String(values.password || ""),
    dailyLimit,
    warmupEnabled,
    warmupStart: values.warmupStart || today,
    warmupDay: Number(values.warmupDay) || (warmupEnabled ? 1 : WARMUP_DAYS),
    warmupTarget: Math.max(5, Math.min(dailyLimit, Number(values.warmupTarget) || 40)),
    sentToday: Math.max(0, Number(values.sentToday) || 0),
    bounces: Math.max(0, Number(values.bounces) || 0),
    lastSent: values.lastSent || "",
    verified: values.verified === true,
    status: values.status || (warmupEnabled ? "Warming up" : "Connected"),
    notes: String(values.notes || ""),
    createdAt: values.createdAt || new Date().toISOString(),
  };
}

export function normalizeMailbox(mailbox) {
  return mailboxFromForm({ ...mailbox, id: mailbox?.id });
}
