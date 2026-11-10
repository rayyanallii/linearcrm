import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";

export function TaskChecklist({ record, commit }) {
  const [text, setText] = useState("");
  const items = record.checklist || [];
  function change(operation) {
    return commit(state => {
      const task = state.tasks.find(row => row.id === record.id);
      if (!task) throw Error("This task no longer exists.");
      task.checklist ??= [];
      operation(task.checklist);
    }, "Updated checklist · " + record.name);
  }
  return <section className="task-checklist"><div className="panel-heading"><h4>Checklist</h4><small>{items.filter(item => item.done).length} / {items.length} complete</small></div>
    {items.map(item => <div className="checklist-item" key={item.id}><input type="checkbox" aria-label={`Complete ${item.text}`} checked={item.done} onChange={event => change(list => { const match = list.find(row => row.id === item.id); if (match) match.done = event.target.checked; })} /><input aria-label={`Checklist item ${item.text}`} key={item.id + item.text} defaultValue={item.text} maxLength={200} onBlur={event => { const next = event.target.value.trim(); if (next && next !== item.text) change(list => { const match = list.find(row => row.id === item.id); if (match) match.text = next; }); else event.target.value = item.text; }} /><Button size="sm" variant="ghost" aria-label={`Remove ${item.text}`} onClick={() => change(list => { const index = list.findIndex(row => row.id === item.id); if (index >= 0) list.splice(index, 1); })}>Remove</Button></div>)}
    <form onSubmit={event => { event.preventDefault(); const name = text.trim(); if (name && change(list => list.push({ id: crypto.randomUUID(), text: name, done: false }))) setText(""); }}><input aria-label="New checklist item" value={text} onChange={event => setText(event.target.value)} placeholder="Add a step…" maxLength={200} /><Button type="submit" size="sm" disabled={!text.trim()}>Add step</Button></form>
  </section>;
}
