import test from "node:test";
import assert from "node:assert/strict";
import { normalizePipelines, savePipeline, removePipeline, recordStageChanges, configurePipeline } from "../local/pipelines.mjs";
const probabilities = { Prospecting: 10, Proposal: 55, Won: 100, Lost: 0 };
const workspace = () => ({ members: ["Alex"], pipelines: [{ id: "sales", name: "Sales" }], defaultPipelineId: "sales", deals: [{ id: "d", name: "Deal", pipeline: "sales", stage: "Prospecting", probability: 10 }] });

test("per-pipeline defaults apply to future moves and reject invalid configurations atomically", () => {
  const state = workspace();
  configurePipeline(state, "sales", ["Proposal", "Prospecting", "Won", "Lost"], { ...probabilities, Proposal: 70 }, probabilities);
  assert.equal(state.deals[0].probability, 10);
  const before = structuredClone(state);
  assert.throws(() => configurePipeline(state, "sales", Object.keys(probabilities), { ...probabilities, Won: 80 }, probabilities), /Won/);
  assert.deepEqual(state, before);
  state.deals[0].stage = "Proposal";
  recordStageChanges(before, state, probabilities);
  assert.equal(state.deals[0].probability, 70);
});

test("legacy migration preserves deals and recovered pipeline assignments", () => {
  const state = { deals: [{ id: "a", stage: "Won" }, { id: "b", pipeline: "legacy", stage: "Proposal" }] };
  normalizePipelines(state);
  assert.equal(state.deals[0].pipeline, "sales");
  assert.equal(state.deals[0].stage, "Won");
  assert.equal(state.deals[1].pipeline, "legacy");
  assert.ok(state.pipelines.some(row => row.id === "legacy"));
  const snapshot = structuredClone(state);
  normalizePipelines(state);
  assert.deepEqual(state, snapshot);
});
test("pipeline names are unique and used pipelines cannot be deleted", () => {
  const state = workspace();
  savePipeline(state, "renewals", "Renewals");
  assert.throws(() => savePipeline(state, "other", " SALES "), /already exists/);
  assert.throws(() => removePipeline(state, "sales"), /Move/);
  state.trash = [{ type: "deals", record: { pipeline: "renewals" } }];
  assert.throws(() => removePipeline(state, "renewals"), /Trash/);
  state.trash = [];
  removePipeline(state, "renewals");
  assert.throws(() => removePipeline(state, "sales"), /at least one/);
});
test("stage transitions retain actor, timestamp, pipeline and probability; unrelated edits do not add entries", () => {
  const previous = workspace();
  const next = structuredClone(previous);
  next.deals[0].stage = "Proposal";
  recordStageChanges(previous, next, probabilities, "2026-11-03T10:00:00.000Z");
  assert.equal(next.deals[0].probability, 55);
  assert.equal(next.deals[0].stageHistory[0].from, "Prospecting");
  assert.equal(next.deals[0].stageHistory[0].actor, "Alex");
  assert.equal(next.deals[0].stageEnteredAt, "2026-11-03T10:00:00.000Z");
  const edit = structuredClone(next);
  edit.deals[0].name = "Renamed";
  recordStageChanges(next, edit, probabilities);
  assert.equal(edit.deals[0].stageHistory.length, 1);
  const restored = structuredClone(next);
  recordStageChanges({ ...previous, deals: [] }, restored, probabilities);
  assert.deepEqual(restored.deals[0].stageHistory, next.deals[0].stageHistory);
});
