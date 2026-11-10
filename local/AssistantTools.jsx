import { confirmAction, notifyUser } from "./dialogs";
import React, { useMemo, useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { Tag } from "twenty-ui/primitives/data-display";
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconBulb,
  IconChartBar,
  IconCheckbox,
  IconMail,
  IconMessage,
  IconRefresh,
  IconRobot,
  IconShieldCheck,
  IconSparkles,
  IconTrash,
} from "@tabler/icons-react";
import { formatMoney, formatCompactMoney } from "./format";
import { openStages, stages, stageColors, today } from "./schema";
import {
  customDecision,
  experientialConfig,
  prioritizePipeline,
  reviewRisk,
} from "./experiential";

function pipelineSummary(db) {
  const open = db.deals.filter((deal) => openStages.includes(deal.stage));
  const value = open.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  const weighted = open.reduce(
    (sum, deal) =>
      sum + ((Number(deal.amount) || 0) * (Number(deal.probability) || 0)) / 100,
    0,
  );
  const won = db.deals.filter((deal) => deal.stage === "Won");
  const lost = db.deals.filter((deal) => deal.stage === "Lost");
  return [
    `${open.length} open opportunities · ${formatMoney(value)} total`,
    `Weighted forecast: ${formatMoney(weighted)}`,
    `Win rate: ${
      won.length + lost.length
        ? Math.round((won.length / (won.length + lost.length)) * 100)
        : 0
    }% (${won.length} won / ${lost.length} lost)`,
    "",
    "Top open opportunities:",
    ...open
      .slice()
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
      .map(
        (deal) =>
          `• ${deal.name} — ${deal.stage} · ${formatMoney(deal.amount)} · owner ${deal.owner || "unassigned"}`,
      ),
  ].join("\n");
}

function followupSummary(db) {
  const pending = db.tasks
    .filter((task) => !["Done", "Cancelled"].includes(task.status))
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  if (!pending.length) return "No open follow-ups.";
  return pending
    .map((task) =>
      [
        task.date === today() ? "Today" : task.date || "Unscheduled",
        task.name,
        task.owner || "Unassigned",
        task.priority || "Normal",
      ].join(" · "),
    )
    .join("\n");
}

function dataQuality(db) {
  const checks = [
    ["Accounts without a domain", db.companies.filter((row) => !row.website)],
    ["Accounts without an industry", db.companies.filter((row) => !row.industry)],
    ["People without an email", db.contacts.filter((row) => !row.email)],
    ["Open opportunities without a next step", db.deals.filter(
      (row) => openStages.includes(row.stage) && !row.nextStep,
    )],
    ["Open opportunities without an amount", db.deals.filter(
      (row) => openStages.includes(row.stage) && !Number(row.amount),
    )],
    ["Records without an owner", [
      ...db.companies.filter((row) => !row.owner),
      ...db.deals.filter((row) => !row.owner),
    ]],
  ];
  return checks
    .map(
      ([label, rows]) =>
        `${label}: ${rows.length}${rows.length ? ` (${rows.slice(0, 4).map((row) => row.name).join(", ")}${rows.length > 4 ? "…" : ""})` : ""}`,
    )
    .join("\n");
}

export function AssistantTools({ db, commit, open, openNew, nav }) {
  const [aiBusy, setAiBusy] = useState("");
  const [aiError, setAiError] = useState("");
  const [decision, setDecision] = useState(null);
  const [customQuestion, setCustomQuestion] = useState("");
  const [output, setOutput] = useState(() => pipelineSummary(db));
  const chat = db.chat || [];
  const config = experientialConfig();
  const configured = Boolean(config.apiKey);

  const insights = useMemo(() => {
    const openDeals = db.deals.filter((deal) => openStages.includes(deal.stage));
    const pipeline = openDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
    const weighted = openDeals.reduce(
      (sum, deal) =>
        sum + ((Number(deal.amount) || 0) * (Number(deal.probability) || 0)) / 100,
      0,
    );
    const atRisk = openDeals
      .filter(
        (deal) =>
          !deal.nextStep ||
          (deal.nextFollowUp && deal.nextFollowUp < today()) ||
          (deal.date && deal.date < today()),
      )
      .sort((a, b) => (a.nextFollowUp || "9999").localeCompare(b.nextFollowUp || "9999"));
    const overdue = db.tasks.filter(
      (task) => !["Done", "Cancelled"].includes(task.status) && task.date && task.date < today(),
    );
    const missing = {
      domains: db.companies.filter((row) => !row.website).length,
      emails: db.contacts.filter((row) => !row.email).length,
      nextSteps: openDeals.filter((row) => !row.nextStep).length,
      owners: [...db.companies, ...db.deals].filter((row) => !row.owner).length,
    };
    return { openDeals, pipeline, weighted, atRisk, overdue, missing };
  }, [db]);

  function append(question, answer) {
    return commit(
      (state) => {
        state.chat ??= [];
        state.chat.push({
          id: crypto.randomUUID(),
          question,
          answer,
          at: Date.now(),
        });
      },
      "Ran workspace assistant",
    );
  }

  async function run(kind, statement = "") {
    if (!configured) {
      setAiError(
        "The AI connection is not configured. Local workspace tools are still available.",
      );
      return;
    }
    if (aiBusy) return;
    setAiBusy(kind);
    setAiError("");
    try {
      if (kind === "focus") {
        const result = await prioritizePipeline(db);
        const confidence = Number(result.confidence) || 0;
        const answer = [
          `Focus: ${result.winner.name} (${Math.round(confidence * 100)}% confidence).`,
          `${result.winner.stage} · ${formatMoney(result.winner.amount)} · closes ${result.winner.date || "unscheduled"}.`,
          `Next step: ${result.winner.nextStep || "missing"}.`,
        ].join("\n");
        setDecision({
          kind,
          title: "Pipeline focus",
          winner: result.winner,
          confidence,
          rows: result.deals
            .map((deal) => ({
              label: deal.name,
              value: Number(result.probabilities[deal.id]) || 0,
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 6),
          usage: result.usage,
          provider: result.provider,
        });
        append("Which opportunity should we focus on?", answer);
      } else if (kind === "risk") {
        const result = await reviewRisk(db);
        const answer = result.entries
          .map(
            (entry) =>
              `${entry.deal.name}: ${Math.round(entry.risk * 100)}% risk of slipping`,
          )
          .join("\n");
        setDecision({
          kind,
          title: "Deal risk review",
          rows: result.entries.map((entry) => ({
            label: entry.deal.name,
            value: entry.risk,
          })),
          usage: result.usage,
          provider: result.provider,
        });
        append("Which open opportunities are most at risk?", answer);
      } else {
        const question = statement.trim();
        if (!question) return;
        const result = await customDecision(db, question);
        const answer = `${Math.round(result.value * 100)}% likely: ${question}`;
        setDecision({
          kind: "custom",
          title: question,
          value: result.value,
          usage: result.usage,
          provider: result.provider,
        });
        append(question, answer);
        setCustomQuestion("");
      }
    } catch (error) {
      setAiError(
          "Liner could not complete this decision. Check the connection and try again.",
      );
    } finally {
      setAiBusy("");
    }
  }

  return (
    <div className="liner-tools-content">
      <div className="insight-grid">
        <section className="panel-card insight-card">
          <span className="kpi-icon tone-blue">
            <IconChartBar size={17} />
          </span>
          <small>Forecast</small>
          <strong>{formatCompactMoney(insights.weighted)}</strong>
          <p>
            Weighted from {insights.openDeals.length} open deals worth{" "}
            {formatCompactMoney(insights.pipeline)}.
          </p>
        </section>
        <section className="panel-card insight-card">
          <span className="kpi-icon tone-orange">
            <IconAlertTriangle size={17} />
          </span>
          <small>Deals needing attention</small>
          <strong>{insights.atRisk.length}</strong>
          <p>Missing a next step, overdue follow-up, or past close date.</p>
        </section>
        <section className="panel-card insight-card">
          <span className="kpi-icon tone-red">
            <IconCheckbox size={17} />
          </span>
          <small>Overdue tasks</small>
          <strong>{insights.overdue.length}</strong>
          <p>{db.tasks.filter((task) => !["Done", "Cancelled"].includes(task.status)).length} tasks are still open.</p>
        </section>
        <section className="panel-card insight-card">
          <span className="kpi-icon tone-green">
            <IconShieldCheck size={17} />
          </span>
          <small>Data completeness</small>
          <strong>
            {insights.missing.domains + insights.missing.emails + insights.missing.nextSteps}
          </strong>
          <p>Known gaps across companies, people and open opportunities.</p>
        </section>
      </div>

      <div className="overview-grid">
        <section className="panel-card">
          <div className="panel-heading">
            <h2>
              <IconAlertTriangle size={16} /> Review these deals
            </h2>
            <Button size="sm" variant="ghost" onClick={() => nav("deals")}>
              Pipeline
            </Button>
          </div>
          <div className="attention-list">
            {insights.atRisk.slice(0, 6).map((deal) => (
              <button
                type="button"
                className="attention-row"
                key={deal.id}
                onClick={() => open("deals", deal)}
              >
                <span>
                  <b>{deal.name}</b>
                  <small>
                    {deal.stage} · {deal.owner || "Unassigned"}
                  </small>
                </span>
                <span>
                  <b>{formatMoney(deal.amount)}</b>
                  <small>
                    {deal.nextStep || "No next step"}
                    {deal.nextFollowUp ? ` · ${deal.nextFollowUp}` : ""}
                  </small>
                </span>
              </button>
            ))}
            {!insights.atRisk.length && (
              <p className="empty-copy">Nothing at risk right now.</p>
            )}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-heading">
            <h2>
              <IconBulb size={16} /> Suggested next actions
            </h2>
          </div>
          <div className="suggestion-list">
            {insights.overdue.length > 0 && (
              <button
                type="button"
                onClick={() => openNew("tasks", { date: today(), owner: db.members?.[0] })}
              >
                <IconCheckbox size={15} />
                <span>
                  <b>Clear {insights.overdue.length} overdue tasks</b>
                  <small>Schedule time or reschedule them.</small>
                </span>
              </button>
            )}
            {insights.atRisk[0] && (
              <button
                type="button"
                onClick={() => openNew("tasks", {
                  name: `Follow up on ${insights.atRisk[0].name}`,
                  deal: insights.atRisk[0].id,
                  company: insights.atRisk[0].company,
                  contact: insights.atRisk[0].contact,
                  owner: insights.atRisk[0].owner,
                  date: today(),
                  status: "Open",
                  priority: "High",
                  taskType: "To-do",
                })}
              >
                <IconCheckbox size={15} />
                <span>
                  <b>Follow up on {insights.atRisk[0].name}</b>
                  <small>Create a linked task for the deal owner.</small>
                </span>
              </button>
            )}
            <button type="button" onClick={() => setOutput(dataQuality(db))}>
              <IconShieldCheck size={15} />
              <span>
                <b>Run a data quality audit</b>
                <small>Find missing domains, emails, owners and next steps.</small>
              </span>
            </button>
            <button type="button" onClick={() => setOutput(followupSummary(db))}>
              <IconMail size={15} />
              <span>
                <b>List every open follow-up</b>
                <small>Sorted by due date.</small>
              </span>
            </button>
          </div>
        </section>
      </div>

      <section className="panel-card">
        <div className="panel-heading">
          <h2>
            <IconSparkles size={16} /> Workspace tools
          </h2>
          <small>Runs against live local records</small>
        </div>
        <div className="tool-row">
          <Button size="sm" variant="ghost" onClick={() => setOutput(pipelineSummary(db))}>
            Summarize pipeline
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOutput(followupSummary(db))}>
            List follow-ups
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setOutput(dataQuality(db))}>
            Audit data quality
          </Button>
        </div>
        <pre className="tool-output">{output}</pre>
      </section>

      <section className="panel-card">
        <div className="panel-heading">
          <h2>
            <IconRobot size={16} /> Decision tools
          </h2>
          <small>{configured ? "Connected" : "Connection required"}</small>
        </div>

        {!configured ? (
          <p className="empty-copy">
            Connect the AI service to enable decision tools.
          </p>
        ) : (
          <>
            <p className="muted ai-copy">Review priorities and risks using the connected AI service.</p>
            <div className="tool-row">
              <Button
                variant="solid"
                disabled={!!aiBusy}
                onClick={() => run("focus")}
              >
                {aiBusy === "focus" ? "Asking Liner…" : "Prioritize pipeline"}
              </Button>
              <Button disabled={!!aiBusy} onClick={() => run("risk")}>
                {aiBusy === "risk" ? "Reviewing risk…" : "Review deal risk"}
              </Button>
            </div>
            {aiError && (
              <p role="alert" className="field-error">
                {aiError}
              </p>
            )}

            {decision && (
              <div className={`ai-result ai-${decision.kind}`} role="status">
                <div className="ai-result-heading">
                  <strong>{decision.title}</strong>
                  <span>
                    {decision.usage?.input_tokens ?? 0} in ·{" "}
                    {decision.usage?.output_tokens ?? 0} out tokens
                    {decision.usage?.cost !== undefined
                      ? ` · $${Number(decision.usage.cost).toFixed(6)}`
                      : ""}
                  </span>
                </div>
                {decision.kind === "focus" && (
                  <>
                    <div className="ai-winner">
                      <b>{decision.winner.name}</b>
                      <span>{Math.round(decision.confidence * 100)}% confidence</span>
                    </div>
                    <p>
                      {decision.winner.stage} · {formatMoney(decision.winner.amount)} · closes{" "}
                      {decision.winner.date || "unscheduled"}
                    </p>
                    <small>Next step: {decision.winner.nextStep || "missing"}</small>
                  </>
                )}
                {decision.kind === "custom" && (
                  <div className="ai-score">
                    <b>{Math.round(decision.value * 100)}%</b>
                    <span>likely true</span>
                  </div>
                )}
                {!!decision.rows?.length && (
                  <div className="ai-rows">
                    {decision.rows.map((row) => (
                      <div className="ai-row" key={row.label}>
                        <span>{row.label}</span>
                        <b>{Math.round(row.value * 100)}%</b>
                        <i
                          style={{
                            width: `${Math.max(2, Math.round(row.value * 100))}%`,
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <form
              className="chat-form"
              onSubmit={(event) => {
                event.preventDefault();
                if (customQuestion.trim()) run("custom", customQuestion);
              }}
            >
              <label>
                Custom yes / no decision
                <textarea
                  rows={2}
                  maxLength={1200}
                  value={customQuestion}
                  onChange={(event) => setCustomQuestion(event.target.value)}
                  placeholder="Is the forecast likely to land this quarter?"
                />
              </label>
              <div className="form-actions">
                <Button
                  type="submit"
                  variant="solid"
                  disabled={!!aiBusy || !customQuestion.trim()}
                >
                  {aiBusy === "custom" ? "Scoring…" : "Run decision"}
                </Button>
              </div>
            </form>
          </>
        )}

        {!!chat.length && (
          <div className="chat-log">
            <div className="panel-heading">
              <h3>Recent decisions</h3>
              <Button
                size="sm"
                variant="ghost"
                startIcon={<IconTrash size={13} />}
                onClick={async () => {
                  if (await confirmAction("Clear the local conversation?"))
                    commit((state) => {
                      state.chat = [];
                    }, "Cleared assistant conversation");
                }}
              >
                Clear
              </Button>
            </div>
            {chat
              .slice()
              .reverse()
              .map((entry) => (
                <article key={entry.id}>
                  <strong>{entry.question}</strong>
                  <pre>{entry.answer}</pre>
                </article>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}