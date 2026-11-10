export function pipelineProbability(state, pipelineId, stage, defaults) {
  return state.pipelines?.find(row => row.id === pipelineId)?.probabilities?.[stage] ?? defaults[stage];
}

export function configurePipeline(state, id, order, probabilities, defaults) {
  const pipeline = state.pipelines.find(row => row.id === id);
  if (!pipeline) throw new Error("Pipeline no longer exists.");
  if (order.length !== Object.keys(defaults).length || new Set(order).size !== order.length || order.some(stage => !Object.hasOwn(defaults, stage))) throw new Error("Include every sales stage once.");
  for (const stage of order) {
    if (!Number.isFinite(probabilities[stage]) || probabilities[stage] < 0 || probabilities[stage] > 100) throw new Error("Probabilities must be between 0 and 100.");
  }
  if (probabilities.Won !== 100 || probabilities.Lost !== 0) throw new Error("Won must remain 100% and Lost 0%.");
  pipeline.stageOrder = [...order];
  pipeline.probabilities = { ...probabilities };
}

export function normalizePipelines(state) {
  if (!Array.isArray(state.pipelines) || !state.pipelines.length)
    state.pipelines = [{ id: "sales", name: "Sales" }];
  if (!state.pipelines.some(row => row.id === state.defaultPipelineId))
    state.defaultPipelineId = state.pipelines[0].id;
  for (const deal of state.deals || []) {
    if (!deal.pipeline) deal.pipeline = state.defaultPipelineId;
    // Preserve references in imported snapshots, including deals restored from Trash.
    if (!state.pipelines.some(row => row.id === deal.pipeline))
      state.pipelines.push({ id: deal.pipeline, name: "Recovered pipeline " + deal.pipeline });
    if (!Array.isArray(deal.stageHistory)) deal.stageHistory = [];
  }
}

export function savePipeline(state, id, name) {
  const label = String(name || "").trim();
  if (!label) throw new Error("Enter a pipeline name.");
  if (state.pipelines.some(row => row.id !== id && row.name.toLowerCase() === label.toLowerCase()))
    throw new Error("A pipeline with this name already exists.");
  const found = state.pipelines.find(row => row.id === id);
  if (found) found.name = label;
  else state.pipelines.push({ id, name: label });
}

export function removePipeline(state, id) {
  if (state.pipelines.length <= 1) throw new Error("Keep at least one pipeline.");
  if (state.deals.some(row => row.pipeline === id) ||
      (state.trash || []).some(item => item.type === "deals" && item.record?.pipeline === id))
    throw new Error("Move this pipeline’s opportunities, including those in Trash, before deleting it.");
  state.pipelines = state.pipelines.filter(row => row.id !== id);
  if (state.defaultPipelineId === id) state.defaultPipelineId = state.pipelines[0].id;
}

export function recordStageChanges(previous, next, probabilities, now = new Date().toISOString()) {
  const beforeById = new Map((previous.deals || []).map(row => [row.id, row]));
  for (const deal of next.deals || []) {
    const before = beforeById.get(deal.id);
    if (!deal.pipeline) deal.pipeline = next.defaultPipelineId;
    if (!next.pipelines.some(row => row.id === deal.pipeline)) throw new Error("Choose an existing pipeline.");
    if (!Object.hasOwn(probabilities, deal.stage)) throw new Error("Choose a valid opportunity stage.");
    if (!before && deal.stageHistory?.length) continue;
    if (before && before.stage === deal.stage && before.pipeline === deal.pipeline) continue;
    if (before && (before.stage !== deal.stage || before.pipeline !== deal.pipeline)) deal.probability = pipelineProbability(next, deal.pipeline, deal.stage, probabilities);
    if (!before && (deal.probability === "" || deal.probability === undefined)) deal.probability = pipelineProbability(next, deal.pipeline, deal.stage, probabilities);
    deal.stageEnteredAt = now;
    deal.stageHistory = [...(before?.stageHistory || []), {
      id: crypto.randomUUID(), at: now, actor: next.members?.[0] || "Local user",
      from: before?.stage || "", to: deal.stage,
      fromPipeline: previous.pipelines?.find(row => row.id === before?.pipeline)?.name || "",
      toPipeline: next.pipelines.find(row => row.id === deal.pipeline).name,
    }];
  }
}
