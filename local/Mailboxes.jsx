import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { Tag } from "twenty-ui/primitives/data-display";
import {
  IconCheck,
  IconMail,
  IconPencil,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { confirmAction } from "./dialogs";
import { Select } from "./Select";
import {
  PROVIDER_PRESETS,
  WARMUP_DAYS,
  advanceWarmup,
  mailboxFromForm,
  mailboxHealth,
  warmupDay,
} from "./mailbox-health.mjs";

const BLANK = {
  name: "",
  email: "",
  fromName: "",
  provider: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  security: "TLS",
  username: "",
  password: "",
  dailyLimit: 50,
  warmupEnabled: true,
};

export function Mailboxes({ db, commit }) {
  const accounts = db.mailboxes || [];
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  function openForm(account) {
    setError("");
    setForm(account ? { ...account, password: "" } : { ...BLANK });
  }

  function patch(part) {
    setForm((current) => ({ ...current, ...part }));
  }

  function chooseProvider(provider) {
    const preset = PROVIDER_PRESETS[provider] || {};
    setForm((current) => ({
      ...current,
      provider,
      host: preset.host ?? current.host,
      port: preset.port ?? current.port,
      security: preset.security ?? current.security,
    }));
  }

  function save(event) {
    event.preventDefault();
    if (!String(form.email || "").includes("@")) {
      setError("Add a valid from address.");
      return;
    }
    if (!String(form.host || "").trim()) {
      setError("Add the SMTP host.");
      return;
    }
    if (!String(form.username || "").trim()) {
      setError("Add the SMTP username.");
      return;
    }
    if (!form.password && !form.id) {
      setError("Add the SMTP app password. Gmail requires a 16-character app password.");
      return;
    }
    const existing = accounts.find((account) => account.id === form.id);
    const mailbox = mailboxFromForm({
      ...form,
      id: form.id,
      password: form.password || existing?.password || "",
      verified: existing?.verified === true,
      sentToday: existing?.sentToday,
      lastSent: existing?.lastSent,
      warmupDay: existing?.warmupDay,
      warmupStart: existing?.warmupStart,
      createdAt: existing?.createdAt,
      status: existing?.status,
    });
    const ok = commit(
      (state) => {
        state.mailboxes ??= [];
        const index = state.mailboxes.findIndex((row) => row.id === mailbox.id);
        if (index >= 0) state.mailboxes[index] = mailbox;
        else state.mailboxes.unshift(mailbox);
      },
      existing ? `Updated ${mailbox.name}` : `Connected ${mailbox.email}`,
    );
    if (ok) setForm(null);
  }

  function verify(account) {
    commit(
      (state) => {
        const row = (state.mailboxes || []).find((item) => item.id === account.id);
        if (!row) return;
        row.verified = true;
        row.lastChecked = new Date().toISOString();
        if (row.status === "Paused") return;
        row.status =
          row.warmupEnabled && warmupDay(row) < WARMUP_DAYS ? "Warming up" : "Warmed up";
      },
      `Verified ${account.email}`,
    );
  }

  function toggleWarmup(account) {
    commit(
      (state) => {
        const row = (state.mailboxes || []).find((item) => item.id === account.id);
        if (!row) return;
        if (row.warmupEnabled) {
          row.warmupEnabled = false;
          row.warmupDay = WARMUP_DAYS;
          if (row.status !== "Paused") row.status = row.verified ? "Warmed up" : "Connected";
        } else {
          row.warmupEnabled = true;
          row.warmupDay = 1;
          row.warmupStart = new Date().toISOString().slice(0, 10);
          if (row.status !== "Paused") row.status = "Warming up";
        }
      },
      account.warmupEnabled
        ? `Stopped warm-up · ${account.name}`
        : `Started warm-up · ${account.name}`,
    );
  }

  function advance(account) {
    commit(
      (state) => {
        const row = (state.mailboxes || []).find((item) => item.id === account.id);
        if (row) Object.assign(row, advanceWarmup(row));
      },
      `Advanced warm-up · ${account.name}`,
    );
  }

  function togglePause(account) {
    const paused = account.status === "Paused";
    commit(
      (state) => {
        const row = (state.mailboxes || []).find((item) => item.id === account.id);
        if (!row) return;
        row.status = paused
          ? row.warmupEnabled && warmupDay(row) < WARMUP_DAYS
            ? "Warming up"
            : "Warmed up"
          : "Paused";
      },
      paused ? `Resumed ${account.name}` : `Paused ${account.name}`,
    );
  }

  async function remove(account) {
    if (
      await confirmAction(
        `Remove ${account.name}? Campaigns using this sender will need another account.`,
      )
    ) {
      commit(
        (state) => {
          state.mailboxes = (state.mailboxes || []).filter((row) => row.id !== account.id);
        },
        `Removed ${account.name}`,
      );
    }
  }

  return (
    <div className="mailboxes-page">
      <div className="mailboxes-toolbar">
        <p className="muted">
          SMTP accounts used by campaigns. Settings stay in this browser; the app never
          opens a connection and nothing is delivered.
        </p>
        <Button
          variant="solid"
          size="sm"
          startIcon={<IconPlus size={14} />}
          onClick={() => openForm(null)}
        >
          Connect mailbox
        </Button>
      </div>

      {!accounts.length ? (
        <div className="empty-state mailbox-empty">
          <strong>No email accounts yet</strong>
          <p>
            Connect a Gmail mailbox with a Google app password, then campaigns can send
            from it within a warm-up allowance.
          </p>
          <Button onClick={() => openForm(null)}>Connect a mailbox</Button>
        </div>
      ) : (
        <div className="mailbox-grid">
          {accounts.map((account) => {
            const health = mailboxHealth(account);
            return (
              <article className="mailbox-card" key={account.id}>
                <header>
                  <span className="mailbox-avatar">
                    <IconMail size={16} />
                  </span>
                  <div className="mailbox-identity">
                    <strong>{account.name}</strong>
                    <small>
                      {account.email || "No address"} · {account.provider}
                    </small>
                  </div>
                  <Tag color={health.tone}>{health.label}</Tag>
                </header>

                <div className="mailbox-health">
                  <span>Health</span>
                  <strong>{health.score}</strong>
                  <div className="health-bar">
                    <span
                      className={`health-fill ${health.tone}`}
                      style={{ width: `${health.score}%` }}
                    />
                  </div>
                </div>

                <dl className="mailbox-facts">
                  <div>
                    <dt>Today</dt>
                    <dd>
                      {health.used} / {health.allowance}
                    </dd>
                  </div>
                  <div>
                    <dt>Warm-up</dt>
                    <dd>
                      {account.warmupEnabled
                        ? `Day ${health.warmupDay} of ${WARMUP_DAYS}`
                        : "Off"}
                    </dd>
                  </div>
                  <div>
                    <dt>Credentials</dt>
                    <dd>{account.verified ? "Verified" : "Not verified"}</dd>
                  </div>
                </dl>

                {account.warmupEnabled && (
                  <div className="warmup-block">
                    <div className="warmup-bar">
                      <span
                        style={{
                          width: `${Math.round((health.warmupDay / WARMUP_DAYS) * 100)}%`,
                        }}
                      />
                    </div>
                    <small>
                      {health.warmupDay >= WARMUP_DAYS
                        ? "Fully warmed up"
                        : `${health.remaining} sends left today`}
                    </small>
                  </div>
                )}

                {!!health.reasons.length && (
                  <ul className="mailbox-reasons">
                    {health.reasons.slice(0, 3).map((reason) => (
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                )}

                <footer className="mailbox-actions">
                  <Button
                    size="sm"
                    variant="ghost"
                    startIcon={<IconCheck size={13} />}
                    onClick={() => verify(account)}
                  >
                    Verify
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleWarmup(account)}>
                    {account.warmupEnabled ? "Stop warm-up" : "Start warm-up"}
                  </Button>
                  {account.warmupEnabled && health.warmupDay < WARMUP_DAYS && (
                    <Button
                      size="sm"
                      variant="ghost"
                      startIcon={<IconRefresh size={13} />}
                      onClick={() => advance(account)}
                    >
                      Advance day
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => togglePause(account)}>
                    {account.status === "Paused" ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Edit ${account.name}`}
                    onClick={() => openForm(account)}
                  >
                    <IconPencil size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Remove ${account.name}`}
                    onClick={() => remove(account)}
                  >
                    <IconTrash size={14} />
                  </Button>
                </footer>
              </article>
            );
          })}
        </div>
      )}

      {form && (
        <div
          className="modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setForm(null);
          }}
        >
          <form
            className="modal-sheet mailbox-form"
            role="dialog"
            aria-modal="true"
            aria-label={form.id ? "Edit email account" : "Connect email account"}
            onSubmit={save}
          >
            <header>
              <strong>{form.id ? "Edit email account" : "Connect email account"}</strong>
              <Button type="button" variant="ghost" aria-label="Close" onClick={() => setForm(null)}>
                <IconX size={16} />
              </Button>
            </header>
            <p className="composer-note">
              Credentials are stored in this browser only. Nothing is sent and no SMTP
              connection is made. For Gmail, use a 16-character app password.
            </p>
            <div className="mailbox-form-grid">
              <label>
                Account name
                <input
                  aria-label="Account name"
                  value={form.name}
                  placeholder="Alex · Gmail"
                  onChange={(event) => patch({ name: event.target.value })}
                />
              </label>
              <label>
                From address
                <input
                  type="email"
                  aria-label="From address"
                  value={form.email}
                  placeholder="you@gmail.com"
                  onChange={(event) => patch({ email: event.target.value, username: form.username || event.target.value })}
                />
              </label>
              <label>
                From name
                <input
                  aria-label="From name"
                  value={form.fromName}
                  placeholder="Alex Morgan"
                  onChange={(event) => patch({ fromName: event.target.value })}
                />
              </label>
              <label>
                Provider
                <Select
                  ariaLabel="Provider"
                  value={form.provider}
                  onChange={chooseProvider}
                  options={Object.keys(PROVIDER_PRESETS)}
                />
              </label>
              <label>
                SMTP host
                <input
                  aria-label="SMTP host"
                  value={form.host}
                  onChange={(event) => patch({ host: event.target.value })}
                />
              </label>
              <label>
                Port
                <input
                  type="number"
                  aria-label="SMTP port"
                  value={form.port}
                  onChange={(event) => patch({ port: event.target.value })}
                />
              </label>
              <label>
                Security
                <Select
                  ariaLabel="Security"
                  value={form.security}
                  onChange={(value) => patch({ security: value })}
                  options={["TLS", "SSL", "None"]}
                />
              </label>
              <label>
                Username
                <input
                  aria-label="SMTP username"
                  value={form.username}
                  onChange={(event) => patch({ username: event.target.value })}
                />
              </label>
              <label>
                App password
                <input
                  type="password"
                  aria-label="App password"
                  value={form.password}
                  placeholder={form.id ? "Leave blank to keep the saved one" : "16-character app password"}
                  onChange={(event) => patch({ password: event.target.value })}
                />
              </label>
              <label>
                Daily limit
                <input
                  type="number"
                  min="1"
                  max="2000"
                  aria-label="Daily limit"
                  value={form.dailyLimit}
                  onChange={(event) => patch({ dailyLimit: event.target.value })}
                />
              </label>
              <div className="mailbox-warmup-field">
                Warm-up
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.warmupEnabled === true}
                  aria-label="Warm-up enabled"
                  className={`switch-pill${form.warmupEnabled ? " is-on" : ""}`}
                  onClick={() => patch({ warmupEnabled: !form.warmupEnabled })}
                >
                  <span className="switch-pill-track" aria-hidden="true">
                    <span className="switch-pill-thumb" />
                  </span>
                  <span>{form.warmupEnabled ? "On" : "Off"}</span>
                </button>
              </div>
            </div>
            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
            <footer>
              <Button type="button" onClick={() => setForm(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="solid">
                {form.id ? "Save account" : "Connect account"}
              </Button>
            </footer>
          </form>
        </div>
      )}
    </div>
  );
}
