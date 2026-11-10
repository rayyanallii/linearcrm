import React from "react";
import {db,collections} from "./store";
export function FieldInput({definition,record,autoFocus=false}){
 const [key,label,kind]=definition;const props={name:key,"aria-label":key==="name"?"Name":key==="deal"?"Opportunity":label,defaultValue:record[key]??"",autoFocus};
 if(Array.isArray(kind))return <select {...props}>{kind.map(v=><option key={v} value={v}>{v||"Unspecified"}</option>)}</select>;
 if(collections(db).includes(kind))return <select {...props}><option value="">Unassigned</option>{db[kind].map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select>;
 if(kind==="textarea")return <textarea {...props} rows={3}/>;
 return <input {...props} type={kind||"text"} min={kind==="number"?0:undefined} step={kind==="number"?"any":undefined} required={key==="name"||key==="amount"}/>;
}

