import { confirmAction, notifyUser } from "./dialogs";
import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { savePipeline, removePipeline, configurePipeline } from "./pipelines.mjs";
import { stages, stageProbability } from "./schema";

function StageSettings({ pipeline, apply }) {
  const [order, setOrder] = useState(pipeline.stageOrder || stages);
  const [values, setValues] = useState({ ...stageProbability, ...pipeline.probabilities });
  const [saved, setSaved] = useState(false);
  function move(index, delta) {
    const next = [...order];
    [next[index], next[index + delta]] = [next[index + delta], next[index]];
    setOrder(next); setSaved(false);
  }
  return <details className="pipeline-stage-settings"><summary>Stages · {pipeline.name}</summary>
    <p>Order stages and set the default probability for new deals and future stage moves. Existing deal forecasts stay unchanged until you edit or move them. Won and Lost keep their outcome meanings.</p>
    {order.map((stage, index) => <div className="pipeline-settings-row" key={stage}>
      <span className="stage-config-name">{stage}</span>
      <input aria-label={`${pipeline.name} ${stage} probability`} type="number" min="0" max="100" disabled={["Won", "Lost"].includes(stage)} value={values[stage]} onChange={event => { setValues({ ...values, [stage]: event.target.value === "" ? "" : Number(event.target.value) }); setSaved(false); }} />
      <span>%</span>
      <Button size="sm" disabled={!index} aria-label={`Move ${stage} up in ${pipeline.name}`} onClick={() => move(index, -1)}>↑</Button>
      <Button size="sm" disabled={index === order.length - 1} aria-label={`Move ${stage} down in ${pipeline.name}`} onClick={() => move(index, 1)}>↓</Button>
    </div>)}
    <Button size="sm" onClick={() => setSaved(!!apply(state => configurePipeline(state, pipeline.id, order, values, stageProbability), "Configured pipeline stages · " + pipeline.name))}>Save stages for {pipeline.name}</Button>
    {saved && <span role="status"> Stage settings saved.</span>}
  </details>;
}

export function PipelineSettings({ db, commit }) {
  const [error, setError] = useState("");
  function apply(operation, description) {
    try {
      operation(structuredClone(db));
      if (commit(operation, description)) { setError(""); return true; }
    } catch (failure) { setError(failure.message); }
    return false;
  }
  return <section className="panel-card">
    <div className="panel-heading"><h2>Sales pipelines</h2></div>
    <div className="pipeline-settings">
      <p>Organize opportunities into separate sales motions. Configure stage order and probabilities below. Filter opportunities by Pipeline to use its board order, then save the view.</p>
      {db.pipelines.map(pipeline => <form key={pipeline.id + pipeline.name} className="pipeline-settings-row" onSubmit={event => {
        event.preventDefault();
        const name = new FormData(event.currentTarget).get("name");
        apply(state => savePipeline(state, pipeline.id, name), "Renamed pipeline");
      }}>
        <input aria-label={`Pipeline name ${pipeline.name}`} name="name" defaultValue={pipeline.name} required maxLength={80} />
        <span>{db.deals.filter(deal => deal.pipeline === pipeline.id).length} opportunities</span>
        <Button type="submit" size="sm">Save</Button>
        <Button type="button" size="sm" disabled={db.defaultPipelineId === pipeline.id} onClick={() => apply(state => { state.defaultPipelineId = pipeline.id; }, "Changed default pipeline")}>{db.defaultPipelineId === pipeline.id ? "Default" : "Make default"}</Button>
        <Button type="button" size="sm" aria-label={`Delete pipeline ${pipeline.name}`} onClick={async () => {
          if (await confirmAction(`Delete pipeline “${pipeline.name}”?`)) apply(state => removePipeline(state, pipeline.id), "Deleted pipeline");
        }}>Delete</Button>
      </form>)}
      {db.pipelines.map(pipeline => <StageSettings key={pipeline.id} pipeline={pipeline} apply={apply} />)}
      <form className="pipeline-settings-row" onSubmit={event => {
        event.preventDefault();
        const form = event.currentTarget;
        const name = new FormData(form).get("name");
        const id = crypto.randomUUID();
        if (apply(state => savePipeline(state, id, name), "Created pipeline · " + name)) form.reset();
      }}>
        <input aria-label="New pipeline name" name="name" placeholder="Enterprise sales" required maxLength={80} />
        <Button type="submit" size="sm" variant="solid">Add pipeline</Button>
      </form>
      {error && <p role="alert" className="field-error">{error}</p>}
    </div>
  </section>;
}