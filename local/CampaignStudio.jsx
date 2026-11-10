import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { Tag } from "twenty-ui/primitives/data-display";
import {
  IconGitBranch,
  IconMail,
  IconPaperclip,
  IconPlus,
  IconSend,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import { Select } from "./Select";
import {
  contactStatuses,
  leadSources,
  leadStatuses,
  owners,
  priorities,
  tagColorFor,
  today,
} from "./schema";
import { formatDate } from "./format";
import { dailyAllowance, mailboxHealth } from "./mailbox-health.mjs";
import {
  FOLLOW_UP_LIMIT,
  audienceFor,
  campaignDraft,
  normalizeFollowUps,
  planCampaignSend,
} from "./campaigns.mjs";

export function CampaignStudio({ record, draft, db, commit, open, close, nav }) {
  const existing = !!record?.id;
  const [form, setForm] = useState(() => ({
    name: record?.name || draft?.name || "",
    ...campaignDraft(record || draft || {}, db),
  }));
  const [pendingFile, setPendingFile] = useState(null);
  const [testTo, setTestTo] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const lastId = useRef(record?.id);

  useEffect(() => {
    if (lastId.current === record?.id) return;
    lastId.current = record?.id;
    setForm({
      name: record?.name || "",
      ...campaignDraft(record || {}, db),
    });
    setPendingFile(null);
    setError("");
    setNotice("");
  }, [record?.id]);

  const accounts = db.mailboxes || [];
  const account = accounts.find((row) => row.id === form.emailAccount) || null;
  const health = account ? mailboxHealth(account) : null;
  const preview = useMemo(
    () => audienceFor(db, { ...(record || {}), ...form }),
    [db, form, record],
  );
  const sentKeys = new Set(record?.sentTo || []);
  const pending = preview.filter((recipient) => !sentKeys.has(recipient.key));
  const existingFiles = (db.files || []).filter(
    (file) => file.type === "campaigns" && file.record === record?.id,
  );
  const attachment = pendingFile || existingFiles[0] || null;
  const followUps = normalizeFollowUps(form.followUps);
  const status = record?.status || "Draft";
  const active = status === "Active";
  const paused = status === "Paused";
  const locked = ["Completed", "Archived"].includes(status);
  const sends = (db.emails || [])
    .filter((email) => email.campaign === record?.id)
    .slice(0, 6);
  const progress = preview.length
    ? Math.min(100, Math.round(((record?.sentCount || 0) / preview.length) * 100))
    : 0;

  function patch(part) {
    setForm((current) => ({ ...current, ...part }));
    setError("");
    setNotice("");
  }

  function payload(extra = {}) {
    return {
      ...form,
      ...extra,
      name: form.name.trim() || "Untitled campaign",
      followUps: normalizeFollowUps(form.followUps),
      attachment: attachment?.name || "",
    };
  }

  function save(extra = {}, message = `Saved ${record?.name || "campaign"}`) {
    if (!existing) return false;
    return commit((state) => {
      const row = (state.campaigns || []).find((item) => item.id === record.id);
      if (!row) throw new Error("This campaign is no longer available.");
      const next = payload(extra);
      Object.assign(row, next);
      row.audience = audienceFor(state, { ...row, ...next }).length;
    }, message);
  }

  function create() {
    if (!form.name.trim()) {
      setError("Give the campaign a name.");
      return;
    }
    if (!attachment && pendingFile) return;
    const id = crypto.randomUUID();
    const values = {
      ...payload({ status: "Planned", channel: "Email" }),
      id,
      audience: preview.length,
      sentCount: 0,
      sentTo: [],
      followUpStep: 0,
      lastSent: "",
      owner: db.members?.[0] || "",
      budget: 0,
      spend: 0,
      details: "",
      createdBy: db.members?.[0] || "",
      createdAt: new Date().toISOString(),
    };
    const ok = commit((state) => {
      state.campaigns ??= [];
      state.campaigns.unshift(values);
      if (pendingFile) {
        state.files ??= [];
        state.files.push({
          id: crypto.randomUUID(),
          record: id,
          type: "campaigns",
          name: pendingFile.name,
          data: pendingFile.data,
        });
      }
    }, `Created campaign · ${values.name}`);
    if (ok) open("campaigns", values);
  }

  function start() {
    if (!account) {
      setError("Choose a sender account first.");
      return;
    }
    if (!form.subject.trim()) {
      setError("Add a subject before starting the campaign.");
      return;
    }
    if (!preview.length) {
      setError("No recipients match this audience.");
      return;
    }
    if (
      save(
        {
          status: "Active",
          sentTo: [],
          sentCount: 0,
          followUpStep: 0,
          audience: preview.length,
        },
        `Started ${form.name.trim() || record.name}`,
      )
    ) {
      setNotice(`Campaign active · ${preview.length} recipients`);
    }
  }

  function sendBatch() {
    if (!account) {
      setError("Choose a sender account first.");
      return;
    }
    if (!active) {
      setError("Start the campaign before sending.");
      return;
    }
    if (account.status === "Paused") {
      setError(`Resume ${account.name} in Email accounts before sending.`);
      return;
    }
    const remaining = Math.max(
      0,
      dailyAllowance(account) - (Number(account.sentToday) || 0),
    );
    if (!remaining) {
      setError(
        `${account.name} has no sends left today (${dailyAllowance(account)}/day).`,
      );
      return;
    }
    if (!pending.length) {
      setError("Everyone in this audience already received the campaign.");
      return;
    }
    const limit = Math.min(remaining, 25);
    const plan = planCampaignSend({
      campaign: record,
      mailbox: account,
      recipients: pending,
      subject: form.subject,
      body: form.body,
      attachment: attachment?.name || "",
      limit,
      author: db.members?.[0],
    });
    if (!plan.batch) {
      setError("Nothing to send.");
      return;
    }
    const ok = commit((state) => {
      const row = (state.campaigns || []).find((item) => item.id === record.id);
      const box = (state.mailboxes || []).find((item) => item.id === account.id);
      if (!row || !box) throw new Error("The campaign or sender is no longer available.");
      const next = payload();
      Object.assign(row, next, {
        sentTo: [...(row.sentTo || []), ...plan.sentKeys],
        sentCount: (row.sentCount || 0) + plan.batch,
        lastSent: today(),
        audience: preview.length,
      });
      box.sentToday = (Number(box.sentToday) || 0) + plan.batch;
      box.lastSent = today();
      state.emails = [...plan.emails, ...(state.emails || [])];
      for (const recipient of pending.slice(0, plan.batch)) {
        if (recipient.type !== "contacts") continue;
        const person = (state.contacts || []).find((item) => item.id === recipient.id);
        if (person) person.lastContacted = today();
      }
    }, `Logged ${plan.batch} campaign email${plan.batch === 1 ? "" : "s"} · ${record.name}`);
    if (ok) {
      setNotice(
        `${plan.batch} email${plan.batch === 1 ? "" : "s"} logged · ${
          remaining - plan.batch
        } left today`,
      );
    }
  }

  function sendFollowUp(index) {
    if (!account) {
      setError("Choose a sender account first.");
      return;
    }
    if (account.status === "Paused") {
      setError(`Resume ${account.name} in Email accounts before sending.`);
      return;
    }
    const step = followUps[index];
    if (!step) return;
    const recipients = preview.filter((recipient) => sentKeys.has(recipient.key));
    if (!recipients.length) {
      setError("Send the campaign before its follow-ups.");
      return;
    }
    const remaining = Math.max(
      0,
      dailyAllowance(account) - (Number(account.sentToday) || 0),
    );
    if (!remaining) {
      setError(`${account.name} has no sends left today.`);
      return;
    }
    const plan = planCampaignSend({
      campaign: record,
      mailbox: account,
      recipients,
      subject: step.subject || form.subject,
      body: step.body || form.body,
      attachment: attachment?.name || "",
      limit: Math.min(remaining, 25),
      stepIndex: index + 1,
      author: db.members?.[0],
    });
    const ok = commit((state) => {
      const row = (state.campaigns || []).find((item) => item.id === record.id);
      const box = (state.mailboxes || []).find((item) => item.id === account.id);
      if (!row || !box) throw new Error("The campaign or sender is no longer available.");
      state.emails = [...plan.emails, ...(state.emails || [])];
      box.sentToday = (Number(box.sentToday) || 0) + plan.batch;
      box.lastSent = today();
      row.followUpStep = Math.max(Number(row.followUpStep) || 0, index + 1);
      row.lastSent = today();
    }, `Logged follow-up ${index + 1} · ${record.name}`);
    if (ok) {
      setNotice(
        `Follow-up ${index + 1} logged for ${plan.batch} recipient${
          plan.batch === 1 ? "" : "s"
        }`,
      );
    }
  }

  function sendTest() {
    if (!account) {
      setError("Choose a sender account first.");
      return;
    }
    if (!String(testTo).includes("@")) {
      setError("Add a test recipient email address.");
      return;
    }
    const plan = planCampaignSend({
      campaign: record,
      mailbox: account,
      recipients: [
        {
          key: "test",
          type: "test",
          id: "test",
          name: "Test recipient",
          email: testTo.trim(),
          firstName: "there",
          companyName: "",
          role: "",
          contactId: "",
          companyId: "",
        },
      ],
      subject: form.subject || "(no subject)",
      body: form.body,
      attachment: attachment?.name || "",
      limit: 1,
      author: db.members?.[0],
    });
    const ok = commit((state) => {
      state.emails = [...plan.emails, ...(state.emails || [])];
    }, `Sent test email to ${testTo.trim()}`);
    if (ok) setNotice(`Test email logged to ${testTo.trim()} — nothing was delivered.`);
  }

  async function attach(file) {
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError("Choose a file under 1 MB so it fits in browser storage.");
      return;
    }
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      if (!existing) {
        setPendingFile({ name: file.name, data });
        setNotice(`${file.name} will be attached when you create the campaign.`);
        return;
      }
      commit((state) => {
        state.files ??= [];
        state.files.push({
          id: crypto.randomUUID(),
          record: record.id,
          type: "campaigns",
          name: file.name,
          data,
        });
      }, `Attached ${file.name}`);
    } catch {
      setError("That file could not be read.");
    }
  }

  function removeAttachment() {
    if (pendingFile) {
      setPendingFile(null);
      return;
    }
    if (!existingFiles[0]) return;
    commit((state) => {
      state.files = (state.files || []).filter((file) => file.id !== existingFiles[0].id);
    }, "Removed campaign attachment");
  }

  function updateFollowUp(index, part) {
    patch({
      followUps: followUps.map((step, position) =>
        position === index ? { ...step, ...part } : step,
      ),
    });
  }

  return (
    <div className="campaign-studio">
      <header className="campaign-studio-head">
        <div className="campaign-title-row">
          <input
            className="campaign-name-input"
            aria-label="Campaign name"
            placeholder="Campaign name"
            value={form.name}
            onChange={(event) => patch({ name: event.target.value })}
          />
          <Tag color={tagColorFor({ key: "status" }, status)}>{status}</Tag>
        </div>
        <div className="campaign-sub">
          <span>Email campaign</span>
          <span>·</span>
          <span>{preview.length} recipients</span>
          <span>·</span>
          <span>{record?.sentCount || 0} sent</span>
          {account && (
            <>
              <span>·</span>
              <span>from {account.email}</span>
            </>
          )}
        </div>
        <div className="campaign-stats">
          <div>
            <span>Recipients</span>
            <strong>{preview.length}</strong>
          </div>
          <div>
            <span>Sent</span>
            <strong>{record?.sentCount || 0}</strong>
          </div>
          <div>
            <span>Remaining</span>
            <strong>{pending.length}</strong>
          </div>
          <div>
            <span>Sender health</span>
            <strong>{health ? `${health.score}/100` : "—"}</strong>
          </div>
        </div>
        <div className="campaign-progress">
          <div className="warmup-bar">
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>{progress}% of the audience has received this campaign</small>
        </div>
      </header>

      <div className="campaign-studio-body">
        <div className="campaign-main">
          <section className="campaign-panel">
            <header>
              <h3>
                <IconUsers size={14} /> Audience
              </h3>
              <small>Who receives this campaign</small>
            </header>
            <div className="campaign-filters">
              <label className="campaign-field">
                Send to
                <Select
                  ariaLabel="Send to"
                  value={form.audienceObject}
                  onChange={(value) =>
                    patch({
                      audienceObject: value,
                      audienceStatus: "Any",
                      audiencePriority: "Any",
                      audienceSource: "Any",
                    })
                  }
                  options={["Leads", "People"]}
                />
              </label>
              <label className="campaign-field">
                Status
                <Select
                  ariaLabel="Audience status"
                  value={form.audienceStatus}
                  onChange={(value) => patch({ audienceStatus: value })}
                  options={[
                    "Any",
                    ...(form.audienceObject === "People"
                      ? contactStatuses
                      : leadStatuses),
                  ]}
                />
              </label>
              <label className="campaign-field">
                Source
                <Select
                  ariaLabel="Audience source"
                  value={form.audienceSource}
                  onChange={(value) => patch({ audienceSource: value })}
                  options={["Any", ...leadSources]}
                />
              </label>
              {form.audienceObject === "Leads" && (
                <label className="campaign-field">
                  Priority
                  <Select
                    ariaLabel="Audience priority"
                    value={form.audiencePriority}
                    onChange={(value) => patch({ audiencePriority: value })}
                    options={["Any", ...priorities]}
                  />
                </label>
              )}
              <label className="campaign-field">
                Owner
                <Select
                  ariaLabel="Audience owner"
                  value={form.audienceOwner}
                  onChange={(value) => patch({ audienceOwner: value })}
                  options={["Any", ...owners]}
                />
              </label>
            </div>
            <div
              className={`campaign-audience-summary${preview.length ? "" : " is-empty"}`}
            >
              {preview.length ? (
                <>
                  <strong>
                    {preview.length} recipient{preview.length === 1 ? "" : "s"}
                  </strong>
                  <span>{pending.length} still to send</span>
                </>
              ) : (
                <span>
                  {form.audienceObject === "Leads"
                    ? "No leads match these filters. Switch Send to People, or clear a filter."
                    : "No people match these filters."}
                </span>
              )}
            </div>
            {!!preview.length && (
              <div className="campaign-recipients">
                {preview.slice(0, 8).map((recipient) => (
                  <span className="recipient-chip" key={recipient.key}>
                    {recipient.name}
                    <small>{recipient.email}</small>
                  </span>
                ))}
                {preview.length > 8 && (
                  <span className="recipient-chip">+{preview.length - 8} more</span>
                )}
              </div>
            )}
          </section>

          <section className="campaign-panel">
            <header>
              <h3>
                <IconMail size={14} /> Message
              </h3>
              <small>{"{{first_name}} · {{company}} · {{role}}"}</small>
            </header>
            <label className="campaign-field">
              Subject
              <input
                aria-label="Campaign subject"
                value={form.subject}
                placeholder="A short, specific subject"
                onChange={(event) => patch({ subject: event.target.value })}
              />
            </label>
            <label className="campaign-field">
              Body
              <textarea
                aria-label="Campaign body"
                rows={8}
                value={form.body}
                placeholder={"Hi {{first_name}},\n\n…"}
                onChange={(event) => patch({ body: event.target.value })}
              />
            </label>
            <div className="campaign-attachment">
              <label className="file-button">
                <IconPaperclip size={14} />
                {attachment ? "Replace file" : "Attach file"}
                <input
                  type="file"
                  hidden
                  onChange={(event) => {
                    attach(event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
              {attachment ? (
                <span className="attachment-name">
                  {attachment.name}
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Remove attachment"
                    onClick={removeAttachment}
                  >
                    <IconTrash size={13} />
                  </Button>
                </span>
              ) : (
                <small>One file, under 1 MB, attached to every email.</small>
              )}
            </div>
          </section>

          <section className="campaign-panel">
            <header>
              <h3>
                <IconGitBranch size={14} /> Follow-ups
              </h3>
              <small>
                {followUps.length}/{FOLLOW_UP_LIMIT} · sent manually after the first batch
              </small>
            </header>
            {followUps.map((step, index) => (
              <div className="sequence-step" key={step.id}>
                <span className="sequence-index">{index + 1}</span>
                <div className="sequence-body">
                  <div className="sequence-head">
                    <label className="campaign-field sequence-days">
                      After
                      <input
                        type="number"
                        min="1"
                        max="90"
                        aria-label={`Follow-up ${index + 1} days`}
                        value={step.days}
                        onChange={(event) =>
                          updateFollowUp(index, { days: event.target.value })
                        }
                      />
                    </label>
                    <span className="sequence-days-label">days</span>
                    {record?.followUpStep > index && <Tag color="green">Sent</Tag>}
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`Remove follow-up ${index + 1}`}
                      onClick={() =>
                        patch({
                          followUps: followUps.filter(
                            (_, position) => position !== index,
                          ),
                        })
                      }
                    >
                      <IconTrash size={13} />
                    </Button>
                  </div>
                  <input
                    aria-label={`Follow-up ${index + 1} subject`}
                    value={step.subject}
                    placeholder={`Re: ${form.subject || "your campaign"}`}
                    onChange={(event) =>
                      updateFollowUp(index, { subject: event.target.value })
                    }
                  />
                  <textarea
                    rows={2}
                    aria-label={`Follow-up ${index + 1} body`}
                    value={step.body}
                    placeholder="A short nudge…"
                    onChange={(event) =>
                      updateFollowUp(index, { body: event.target.value })
                    }
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    startIcon={<IconSend size={13} />}
                    disabled={
                      !active || !record?.sentTo?.length || record.followUpStep > index
                    }
                    onClick={() => sendFollowUp(index)}
                  >
                    Log follow-up {index + 1}
                  </Button>
                </div>
              </div>
            ))}
            {!followUps.length && (
              <p className="campaign-empty">
                Add up to three follow-ups with their own wait, subject and body.
              </p>
            )}
            <Button
              size="sm"
              variant="ghost"
              startIcon={<IconPlus size={14} />}
              disabled={followUps.length >= FOLLOW_UP_LIMIT}
              onClick={() =>
                patch({
                  followUps: [
                    ...followUps,
                    {
                      id: crypto.randomUUID(),
                      days: followUps.length * 3 + 3,
                      subject: `Re: ${form.subject || "your campaign"}`,
                      body: "",
                    },
                  ],
                })
              }
            >
              Add follow-up
            </Button>
          </section>
        </div>

        <aside className="campaign-rail">
          <section className="campaign-panel">
            <header>
              <h3>Sender</h3>
              <small>Warm-up aware</small>
            </header>
            {accounts.length ? (
              <Select
                ariaLabel="Sender account"
                value={form.emailAccount}
                onChange={(value) => patch({ emailAccount: value })}
                placeholder="Choose an email account"
                options={accounts.map((item) => ({
                  value: item.id,
                  label: `${item.name} · ${item.email}`,
                }))}
              />
            ) : (
              <p className="campaign-empty">
                No sending accounts yet. Connect a Gmail mailbox to send from a real
                address.
              </p>
            )}
            {account && health && (
              <>
                <div className="sender-card">
                  <div>
                    <strong>{account.name}</strong>
                    <small>{account.email}</small>
                  </div>
                  <Tag color={health.tone}>{health.label}</Tag>
                </div>
                <div className="allowance-row">
                  <span>
                    {health.used} of {health.allowance} sends today
                  </span>
                  <strong>{health.remaining} left</strong>
                </div>
                <div className="warmup-bar">
                  <span
                    style={{
                      width: `${Math.min(
                        100,
                        health.allowance
                          ? Math.round((health.used / health.allowance) * 100)
                          : 0,
                      )}%`,
                    }}
                  />
                </div>
                <small className="campaign-rail-note">
                  {account.warmupEnabled
                    ? `Warm-up day ${health.warmupDay} of ${health.warmupDays}`
                    : "Warm-up off · full daily limit"}
                </small>
                {account.status === "Paused" ? (
                  <small className="campaign-rail-note is-warn">
                    Paused. Resume it in Email accounts before sending.
                  </small>
                ) : health.remaining === 0 ? (
                  <small className="campaign-rail-note is-warn">
                    Daily limit reached. Advance the warm-up or wait until tomorrow.
                  </small>
                ) : null}
              </>
            )}
            {!accounts.length && nav && (
              <Button
                size="sm"
                onClick={() => {
                  close();
                  nav("mailboxes");
                }}
              >
                Open Email accounts
              </Button>
            )}
          </section>

          <section className="campaign-panel">
            <header>
              <h3>Schedule & test</h3>
            </header>
            <label className="campaign-field">
              Start date
              <input
                type="date"
                aria-label="Campaign start date"
                value={form.startDate}
                onChange={(event) => patch({ startDate: event.target.value })}
              />
            </label>
            <label className="campaign-field">
              Test recipient
              <input
                type="email"
                aria-label="Test recipient"
                value={testTo}
                placeholder="you@company.com"
                onChange={(event) => setTestTo(event.target.value)}
              />
            </label>
            <Button
              size="sm"
              variant="ghost"
              startIcon={<IconSend size={13} />}
              disabled={!existing}
              onClick={sendTest}
            >
              Send test
            </Button>
            {!existing && <small className="campaign-rail-note">Available after the campaign is created.</small>}
          </section>

          {existing && (
            <section className="campaign-panel">
              <header>
                <h3>Recent sends</h3>
                <small>{sends.length}</small>
              </header>
              {sends.length ? (
                <ul className="campaign-sends">
                  {sends.map((email) => (
                    <li key={email.id}>
                      <div>
                        <strong>{email.name}</strong>
                        <small>{email.to}</small>
                      </div>
                      <span>{formatDate(email.date)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="campaign-empty">
                  Emails logged by this campaign will show up here.
                </p>
              )}
            </section>
          )}
        </aside>
      </div>

      {(error || notice) && (
        <div className={`campaign-banner ${error ? "error" : "success"}`} role={error ? "alert" : "status"}>
          {error || notice}
        </div>
      )}

      <footer className="campaign-studio-footer">
        <span className="campaign-footer-hint">
          {!existing
            ? "Create the draft, then start it when the audience looks right."
            : locked
              ? `${status} campaigns keep their history.`
              : "Sending is simulated and respects the sender's allowance."}
        </span>
        <div className="campaign-footer-actions">
          <Button size="sm" variant="ghost" onClick={close}>
            {existing ? "Close" : "Cancel"}
          </Button>
          {!existing ? (
            <Button size="sm" variant="solid" onClick={create}>
              Create campaign
            </Button>
          ) : (
            <>
              <Button size="sm" onClick={() => save()}>
                Save changes
              </Button>
              {!active && !locked && (
                <Button
                  size="sm"
                  variant="solid"
                  startIcon={<IconSend size={13} />}
                  disabled={!account || !form.subject.trim() || !preview.length}
                  onClick={start}
                >
                  Start campaign
                </Button>
              )}
              {active && (
                <Button
                  size="sm"
                  variant="solid"
                  startIcon={<IconSend size={13} />}
                  disabled={
                    !pending.length ||
                    !account ||
                    !form.subject.trim() ||
                    account.status === "Paused" ||
                    !health ||
                    health.remaining === 0
                  }
                  onClick={sendBatch}
                >
                  Send next batch
                </Button>
              )}
              {active && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => save({ status: "Paused" }, `Paused ${record.name}`)}
                >
                  Pause
                </Button>
              )}
              {paused && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => save({ status: "Active" }, `Resumed ${record.name}`)}
                >
                  Resume
                </Button>
              )}
              {active && record.sentCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    save({ status: "Completed" }, `Completed ${record.name}`)
                  }
                >
                  Complete
                </Button>
              )}
            </>
          )}
        </div>
      </footer>
    </div>
  );
}
