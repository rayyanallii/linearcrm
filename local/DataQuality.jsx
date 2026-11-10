import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { Select } from "./Select";
import { displayValue } from "./format";
import { duplicateGroups, mergePreview, mergeRecords, mergedValues } from "./duplicates";

export function DataQuality({ db, commit, open }) {
  const [type, setType] = useState("contacts");
  const [primary, setPrimary] = useState("");
  const [review, setReview] = useState(null);
  const [choices, setChoices] = useState({});
  const [message, setMessage] = useState("");
  const groups = duplicateGroups(db, type);
  function preview(primaryId, duplicateId) {
    try { const result = mergePreview(db,type,primaryId,duplicateId); setReview(result); setChoices(result.choices); setMessage(""); }
    catch(error) { setMessage(error.message); }
  }
  return <section className="panel-card data-quality">
    <div className="panel-heading"><h2>Data quality</h2><small>{groups.length} possible duplicate groups</small></div>
    <p>People match by email. Companies match by domain, or by exact name when neither has a domain. Review each match before merging.</p>
    <label className="quality-type">Check records<Select ariaLabel="Duplicate record type" value={type} onChange={value=>{setType(value);setPrimary("");setReview(null);setMessage("");}} options={[{value:"contacts",label:"People"},{value:"companies",label:"Companies"}]} /></label>
    {!groups.length && <p className="empty-copy">No duplicate matches found.</p>}
    {groups.map(group => { const keep = group.records.some(row=>row.id===primary) ? primary : group.records[0].id; return <section className="duplicate-group" key={group.key}>
      <h3>{group.kind}: {group.match}</h3>
      <label>Record to keep<Select ariaLabel={`Record to keep for ${group.match}`} value={keep} onChange={setPrimary} options={group.records.map(row=>({value:row.id,label:row.name + " · " + row.id.slice(-6)}))}/></label>
      {group.records.map(record=><div className="duplicate-row" key={record.id}><button type="button" onClick={()=>open(type,record)}>{record.name}</button><small>{record.id===keep ? "Keep" : "Duplicate candidate"}</small>{record.id!==keep && <Button size="sm" onClick={()=>preview(keep,record.id)}>Review merge</Button>}</div>)}
    </section>; })}
    {message && <p role="status">{message}</p>}
    {review && <div className="modal-overlay"><section className="modal-sheet merge-review" role="dialog" aria-modal="true" aria-label="Review duplicate merge">
      <header><strong>Merge into {review.primary.name}</strong><Button size="sm" onClick={()=>setReview(null)}>Cancel</Button></header>
      <p>Keep <b>{review.primary.name}</b> and merge <b>{review.duplicate.name}</b>. Linked records, files, lead conversions and activity will follow the kept record.</p>
      <p>The duplicate’s original values remain in Trash. Restoring it creates a separate record; it does not undo transferred links or field changes.</p>
      <div className="merge-fields">{review.fields.map(field=><div className="merge-field" key={field.key}>
        <strong>{field.label}</strong><span>Keep: {String(displayValue(review.primary,field.key,type,db) || "Empty")}</span><span>Duplicate: {String(displayValue(review.duplicate,field.key,type,db) || "Empty")}</span>
        <Select ariaLabel={`Merge ${field.label}`} value={choices[field.key]} onChange={value=>setChoices({...choices,[field.key]:value})} options={[{value:"primary",label:"Keep current value"},{value:"duplicate",label:"Use duplicate value"},...(field.type==="textarea" ? [{value:"combine",label:"Combine both"}] : [])]}/>
      </div>)}</div>
      {!review.fields.length && <p>All editable fields match.</p>}
      <Button variant="solid" onClick={()=>{try { mergedValues(review,choices); mergeRecords(structuredClone(db),review,choices); if(commit(state=>mergeRecords(state,review,choices),`Merged ${review.duplicate.name} into ${review.primary.name}`)){setReview(null);setMessage("Records merged. The original duplicate is in Trash.");} } catch(error){setMessage(error.message);} }}>Merge records</Button>
      {message && <p role="alert" className="field-error">{message}</p>}
    </section></div>}
  </section>;
}
