import React, { useState } from "react";
import { Select } from "./Select";
import { Button } from "twenty-ui/primitives/input";
import { Tag } from "twenty-ui/primitives/data-display";
import {
  IconAlertTriangle,
  IconArrowUpRight,
  IconBriefcase,
  IconCalendar,
  IconChartBar,
  IconCheckbox,
  IconCircleCheck,
  IconCurrencyDollar,
  IconHistory,
  IconPlus,
  IconTargetArrow,
  IconTrendingUp,
} from "@tabler/icons-react";
import {
  formatDate,
  formatMoney,
  formatCompactMoney,
} from "./format";
import {
  openStages,
  stages,
  stageColors,
  today,
} from "./schema";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function Overview({ db, open, openNew, goToDeals, commit, nav }) {
  const [pipelineId, setPipelineId] = useState("");
  const selectedPipeline = db.pipelines.find(item => item.id === pipelineId);
  const salesDeals = selectedPipeline ? db.deals.filter(deal => deal.pipeline === pipelineId) : db.deals;
  const openDeals = salesDeals.filter((deal) => openStages.includes(deal.stage));
  const wonDeals = salesDeals.filter((deal) => deal.stage === "Won");
  const lostDeals = salesDeals.filter((deal) => deal.stage === "Lost");
  const pipeline = openDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  const weighted = openDeals.reduce(
    (sum, deal) =>
      sum + ((Number(deal.amount) || 0) * (Number(deal.probability) || 0)) / 100,
    0,
  );
  const won = wonDeals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0);
  const winRate = wonDeals.length + lostDeals.length
    ? (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
    : 0;
  const pending = db.tasks
    .filter((task) => !["Done", "Cancelled"].includes(task.status))
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  const overdue = pending.filter((task) => task.date && task.date < today());
  const attention = openDeals
    .filter(
      (deal) =>
        !deal.nextStep ||
        (deal.nextFollowUp && deal.nextFollowUp < today()) ||
        (deal.date && deal.date < today()),
    )
    .sort((a, b) => (a.nextFollowUp || "9999").localeCompare(b.nextFollowUp || "9999"))
    .slice(0, 5);

  const stageRows = openStages.map((stage) => {
    const deals = salesDeals.filter((deal) => deal.stage === stage);
    return {
      stage,
      count: deals.length,
      value: deals.reduce((sum, deal) => sum + (Number(deal.amount) || 0), 0),
    };
  });
  const maxStage = Math.max(1, ...stageRows.map((row) => row.value));

  const metrics = [
    {
      icon: IconBriefcase,
      label: "Open pipeline",
      value: formatCompactMoney(pipeline),
      caption: `${openDeals.length} opportunities`,
      tone: "blue",
    },
    {
      icon: IconTrendingUp,
      label: "Weighted forecast",
      value: formatCompactMoney(weighted),
      caption: "Probability weighted",
      tone: "purple",
    },
    {
      icon: IconCircleCheck,
      label: "Won revenue",
      value: formatCompactMoney(won),
      caption: `${wonDeals.length} closed won`,
      tone: "green",
    },
    {
      icon: IconTargetArrow,
      label: "Win rate",
      value: `${Math.round(winRate)}%`,
      caption: `${wonDeals.length} won · ${lostDeals.length} lost`,
      tone: "orange",
    },
    {
      icon: IconCheckbox,
      label: "Open tasks",
      value: pending.length,
      caption: `${overdue.length} overdue`,
      tone: overdue.length ? "red" : "gray",
    },
  ];

  return (
    <div className="overview-page">
      <div className="page-heading">
        <div>
          <small>
            {greeting()} ·{" "}
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </small>
          <h1>Workspace overview</h1>
          <p>Your pipeline, follow-ups and latest activity in one place.</p>
        </div>
        <div className="heading-actions">
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconPlus size={14} />}
            onClick={() => openNew("tasks", { date: today(), owner: db.members?.[0] })}
          >
            New task
          </Button>
          <Button
            size="sm"
            variant="solid"
            startIcon={<IconPlus size={14} />}
            onClick={() => openNew("deals")}
          >
            New opportunity
          </Button>
        </div>
      </div>

      <div className="forecast-toolbar">
        {db.pipelines.length > 1 ? (
          <label>
            Sales metrics
            <Select
              ariaLabel="Forecast pipeline"
              value={pipelineId}
              onChange={setPipelineId}
              options={[
                { value: "", label: "All pipelines" },
                ...db.pipelines.map(item => ({ value: item.id, label: item.name })),
              ]}
            />
          </label>
        ) : (
          <span className="forecast-scope">
            {formatCompactMoney(pipeline)} open in {db.pipelines[0]?.name || "your pipeline"}
          </span>
        )}
        <span>
          Showing {salesDeals.length} of {db.deals.length} opportunities
          {selectedPipeline ? ` in ${selectedPipeline.name}` : ""}. Task counts cover the whole workspace.
        </span>
      </div>
      <div className="kpi-grid">
        {metrics.map(({ icon: Icon, label, value, caption, tone }) => (
          <section className={`kpi-card tone-${tone}`} key={label}>
            <span className="kpi-icon">
              <Icon size={17} />
            </span>
            <div>
              <small>{label}</small>
              <strong>{value}</strong>
              <span>{caption}</span>
            </div>
          </section>
        ))}
      </div>

      <div className="overview-grid">
        <section className="panel-card pipeline-panel">
          <div className="panel-heading">
            <h2>
              <IconChartBar size={16} /> Pipeline by stage
            </h2>
            <Button
              size="sm"
              variant="ghost"
              endIcon={<IconArrowUpRight size={13} />}
              onClick={() => goToDeals(null, selectedPipeline?.name)}
            >
              Open pipeline
            </Button>
          </div>
          {stageRows.map((row, index) => (
            <button
              type="button"
              className="pipeline-row"
              key={row.stage}
              onClick={() => goToDeals(row.stage, selectedPipeline?.name)}
            >
              <span className="pipeline-label">
                <Tag color={stageColors[row.stage]}>{row.stage}</Tag>
                <small>{row.count} deals</small>
                <b>{formatMoney(row.value)}</b>
              </span>
              <span className="pipeline-track">
                <i
                  style={{
                    width: `${(row.value / maxStage) * 100}%`,
                    background: ["#7d8597", "#5b8def", "#9b7ede", "#e0a458"][index],
                  }}
                />
              </span>
            </button>
          ))}
          <div className="pipeline-foot">
            <span>Total open value</span>
            <strong>{formatMoney(pipeline)}</strong>
          </div>
        </section>

        <section className="panel-card agenda-panel">
          <div className="panel-heading">
            <h2>
              <IconCalendar size={16} /> Follow-up agenda
            </h2>
            <Button
              size="sm"
              variant="ghost"
              endIcon={<IconArrowUpRight size={13} />}
              onClick={() => nav("tasks")}
            >
              All tasks
            </Button>
          </div>
          <div className="agenda-list">
            {pending.slice(0, 8).map((task) => (
              <div className="agenda-item" key={task.id}>
                <input
                  type="checkbox"
                  aria-label={`Complete ${task.name}`}
                  onChange={() =>
                    commit(
                      (state) => {
                        const row = state.tasks.find((item) => item.id === task.id);
                        if (row) row.status = "Done";
                      },
                      `Completed ${task.name}`,
                    )
                  }
                />
                <button type="button" onClick={() => open("tasks", task)}>
                  <b>{task.name}</b>
                  <small>
                    {task.owner || "Unassigned"} ·{" "}
                    {db.deals.find((deal) => deal.id === task.deal)?.name || "No opportunity"}
                  </small>
                </button>
                <Tag
                  color={
                    task.date && task.date < today()
                      ? "red"
                      : task.date === today()
                        ? "blue"
                        : "gray"
                  }
                >
                  {task.date === today()
                    ? "Today"
                    : task.date
                      ? formatDate(task.date)
                      : "No date"}
                </Tag>
              </div>
            ))}
            {!pending.length && (
              <p className="empty-copy">
                All caught up. Schedule the next follow-up from an opportunity.
              </p>
            )}
          </div>
        </section>
      </div>

      <div className="overview-grid">
        <section className="panel-card">
          <div className="panel-heading">
            <h2>
              <IconAlertTriangle size={16} /> Needs attention
            </h2>
            <Tag color={attention.length ? "orange" : "green"}>
              {attention.length} deals
            </Tag>
          </div>
          <div className="attention-list">
            {attention.map((deal) => (
              <button
                type="button"
                className="attention-row"
                key={deal.id}
                onClick={() => open("deals", deal)}
              >
                <span>
                  <b>{deal.name}</b>
                  <small>
                    {db.companies.find((company) => company.id === deal.company)?.name ||
                      "No company"}{" "}
                    · {deal.stage}
                  </small>
                </span>
                <span>
                  <b>{formatMoney(deal.amount)}</b>
                  <small>
                    {!deal.nextStep
                      ? "No next step"
                      : deal.nextFollowUp
                        ? `Follow up ${formatDate(deal.nextFollowUp)}`
                        : "No follow-up date"}
                  </small>
                </span>
              </button>
            ))}
            {!attention.length && (
              <p className="empty-copy">
                Nothing at risk. Every open deal has a next step and a current follow-up.
              </p>
            )}
          </div>
        </section>

        <section className="panel-card">
          <div className="panel-heading">
            <h2>
              <IconHistory size={16} /> Recent activity
            </h2>
            <small>{db.activity.length} events</small>
          </div>
          <div className="activity-list">
            {db.activity.slice(0, 10).map((item, index) => (
              <div className="activity-row" key={`${item.at}-${index}`}>
                <span className="activity-dot" />
                <div>
                  <span>{item.text}</span>
                  <small>
                    {new Date(item.at).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                    {item.actor ? ` · ${item.actor}` : ""}
                  </small>
                </div>
              </div>
            ))}
            {!db.activity.length && (
              <p className="empty-copy">Your first record change will appear here.</p>
            )}
          </div>
        </section>
      </div>

      <section className="panel-card">
        <div className="panel-heading">
          <h2>
            <IconCurrencyDollar size={16} /> Recent opportunities
          </h2>
          <Button
            size="sm"
            variant="ghost"
            endIcon={<IconArrowUpRight size={13} />}
            onClick={() => goToDeals(null, selectedPipeline?.name)}
          >
            View all
          </Button>
        </div>
        <div className="mini-table">
          <div className="mini-table-head">
            <span>Opportunity</span>
            <span>Company</span>
            <span>Stage</span>
            <span>Close date</span>
            <span className="right">Amount</span>
          </div>
          {[...salesDeals]
            .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
            .slice(0, 6)
            .map((deal) => (
              <button
                type="button"
                className="mini-table-row"
                key={deal.id}
                onClick={() => open("deals", deal)}
              >
                <span>{deal.name}</span>
                <span>
                  {db.companies.find((company) => company.id === deal.company)?.name || "—"}
                </span>
                <span>
                  <Tag color={stageColors[deal.stage]}>{deal.stage}</Tag>
                </span>
                <span>{formatDate(deal.date) || "—"}</span>
                <span className="right">{formatMoney(deal.amount)}</span>
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}
