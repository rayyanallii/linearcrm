export const activityStatuses = ["Open", "In progress", "Waiting", "Blocked", "Done", "Cancelled"];
export const repeatOptions = ["None", "Daily", "Weekly", "Monthly"];
export function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0,10) === value;
}
export function nextOccurrence(date, repeat, anchorDay) {
  if (!validDate(date)) throw Error("A repeating task needs a valid due date.");
  const value = new Date(date + "T12:00:00Z");
  if (repeat === "Monthly") {
    const year = value.getUTCFullYear(), month = value.getUTCMonth() + 1;
    const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return new Date(Date.UTC(year, month, Math.min(anchorDay || value.getUTCDate(), last), 12)).toISOString().slice(0,10);
  }
  value.setUTCDate(value.getUTCDate() + (repeat === "Weekly" ? 7 : 1));
  return value.toISOString().slice(0,10);
}

export function updateTaskActivity(previous, next, { now = new Date().toISOString(), id = () => crypto.randomUUID() } = {}) {
  const before = new Map((previous.tasks || []).map(task => [task.id,task]));
  const generated = [];
  for (const task of next.tasks || []) {
    const old = before.get(task.id);
    task.status ||= "Open";
    task.repeat ||= "None";
    if (!activityStatuses.includes(task.status)) throw Error("Choose a valid task status.");
    if (!repeatOptions.includes(task.repeat)) throw Error("Choose a valid repeat schedule.");
    if (task.repeat !== "None") {
      if (!validDate(task.date)) throw Error(`“${task.name}” needs a valid due date before it can repeat.`);
      if (task.repeatUntil && (!validDate(task.repeatUntil) || task.repeatUntil < task.date)) throw Error("Repeat until must be on or after the task due date.");
    }
    if ((old && old.date !== task.date) || !task.repeatAnchorDay) task.repeatAnchorDay = validDate(task.date) ? Number(task.date.slice(-2)) : null;
    if (task.status !== "Done") { if (old?.status === "Done") task.completedAt = ""; continue; }
    if (old?.status === "Done") continue;
    task.completedAt = now;
    // Imported completed records do not silently create follow-ups.
    if (!old || task.repeat === "None" || task.repeatNextId) continue;
    const due = nextOccurrence(task.date, task.repeat, task.repeatAnchorDay);
    if (task.repeatUntil && due > task.repeatUntil) continue;
    const successor = structuredClone(task);
    successor.id = id(); successor.status = "Open"; successor.date = due;
    successor.repeatSeriesId = task.repeatSeriesId || task.id;
    successor.repeatPreviousId = task.id;
    successor.createdAt = now; successor.createdBy = next.members?.[0] || "Local user";
    successor.updatedAt = now;
    for (const key of ["completedAt", "repeatNextId"]) delete successor[key];
    successor.checklist = (task.checklist || []).map(item => ({...item,id:id(),done:false}));
    task.repeatSeriesId = successor.repeatSeriesId;
    task.repeatNextId = successor.id;
    generated.push(successor);
  }
  next.tasks.unshift(...generated);
  return generated;
}
