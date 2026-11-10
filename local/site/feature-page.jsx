import React from "react";
import { Kicker, PageCta, PageHero, RelatedLinks } from "./ui";
import {
  AccountBook,
  BackupPanel,
  CommandPanel,
  DataModelPanel,
  FocusList,
  ForecastPanel,
  ImportPanel,
  LinerChat,
  PipelineBoard,
  RecordMove,
  RecurringTask,
  SavedViewsPanel,
  StoragePanel,
  TimelinePanel,
  WorkflowCanvas,
  WorkspacePreview,
} from "./demos";

const DEMOS = {
  board: <PipelineBoard />,
  focus: <FocusList />,
  workflow: <WorkflowCanvas />,
  liner: <LinerChat />,
  forecast: <ForecastPanel />,
  timeline: <TimelinePanel />,
  accountBook: <AccountBook />,
  dataModel: <DataModelPanel />,
  recordMove: <RecordMove />,
  savedViews: <SavedViewsPanel />,
  workspace: <WorkspacePreview />,
  storage: <StoragePanel />,
  backup: <BackupPanel />,
  import: <ImportPanel />,
  command: <CommandPanel />,
  task: <RecurringTask />,
};

export default function FeaturePage({ data }) {
  return (
    <>
      <PageHero
        kicker={data.kicker}
        title={data.title}
        copy={data.intro}
        primary={{ label: "Open the workspace", href: "./app.html" }}
        secondary={{
          label: data.group === "Platform" ? "Platform overview" : data.group === "Product" ? "Product tour" : "Resources",
          href: data.group === "Platform" ? "./platform.html" : data.group === "Product" ? "./product.html" : "./resources.html",
        }}
        note={data.note}
      >
        <div className="lp-feature-hero-demo">{DEMOS[data.demos[0]]}</div>
      </PageHero>

      <section className="lp-steps">
        <div className="lp-steps-head">
          <Kicker>How it works</Kicker>
          <h2>Three moves, in order.</h2>
        </div>
        <div className="lp-steps-grid">
          {data.steps.map((step, index) => (
            <article key={step.title}>
              <span className="lp-step-number">{String(index + 1).padStart(2, "0")}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      {data.demos[1] && (
        <section className="lp-detail-demo">
          <div className="lp-detail-demo-copy">
            <Kicker>In the product</Kicker>
            <h2>{data.label}, at working size.</h2>
            <p>The panel below is the same interface, not an illustration. Change something and watch the record respond.</p>
          </div>
          <div className="lp-detail-demo-stage">{DEMOS[data.demos[1]]}</div>
        </section>
      )}

      <section className="lp-details">
        <div className="lp-details-head">
          <Kicker>What to expect</Kicker>
          <h2>Specific behaviour, including the limits.</h2>
        </div>
        <div className="lp-details-grid">
          {data.details.map((detail, index) => (
            <article key={detail.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{detail.title}</h3>
              <p>{detail.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <RelatedLinks items={data.related} />
      <PageCta
        kicker={`${data.label} in practice`}
        title="Open it with the sample records."
        copy="The workspace is already loaded. Change a record, check the result and back up your work when you are done."
      />
    </>
  );
}
