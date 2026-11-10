import React from "react";
import { Button } from "twenty-ui/primitives/input";
export function TaskSchedule({record,db,open,commit}){
  const next=db.tasks.find(task=>task.id===record.repeatNextId);
  const previous=db.tasks.find(task=>task.id===record.repeatPreviousId);
  if ((!record.repeat||record.repeat==="None")&&!next&&!previous&&!record.completedAt) return null;
  return <section className="task-schedule"><h4>Schedule</h4>
    {record.repeat&&record.repeat!=="None"&&<p>Repeats {record.repeat.toLowerCase()} from the scheduled due date{record.repeatUntil?` until ${record.repeatUntil}`:""}. Completing this task creates one follow-up with its links and a fresh checklist. Missed dates stay visible as overdue.</p>}
    {record.completedAt&&<p>Completed {new Date(record.completedAt).toLocaleString()}</p>}
    <div className="button-row">{previous&&<Button size="sm" onClick={()=>open("tasks",previous)}>Previous occurrence</Button>}{next&&<Button size="sm" onClick={()=>open("tasks",next)}>Next occurrence</Button>}
    {record.repeat&&record.repeat!=="None"&&<Button size="sm" onClick={()=>commit(state=>{const series=record.repeatSeriesId||record.id;for(const task of [...state.tasks,...(state.trash||[]).filter(entry=>entry.type==="tasks").map(entry=>entry.record)])if(task.id===series||task.repeatSeriesId===series)task.repeat="None";},"Stopped task recurrence · "+record.name)}>Stop repeating</Button>}</div>
    {record.repeatNextId&&!next&&<p>The next occurrence was deleted. Check Trash. Completing this task again will not create a duplicate.</p>}
  </section>;
}
