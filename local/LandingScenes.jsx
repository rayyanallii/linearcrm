import React, {useEffect,useRef,useState} from "react";
import {IconArrowRight,IconSparkles,IconCheck,IconX,IconMail,IconBuildingSkyscraper,IconCalendar,IconNotes,IconBriefcase,IconUsers,IconCheckbox} from "@tabler/icons-react";

export function RelationshipScene(){
 const [tab,setTab]=useState("Activity");
 const entries={
 Activity:[["Proposal reviewed","Alex Morgan · Today, 10:24"],["Discovery call completed","Maya Chen · Yesterday"],["Added to Enterprise pipeline","Alex Morgan · 2 days ago"]],
 Notes:[["A shared design system for three teams","Discovery notes · Maya Chen"],["Security review before rollout","Requirements · Alex Morgan"]],
 Tasks:[["Send the revised proposal","Alex Morgan · Tomorrow"],["Confirm the implementation timeline","Maya Chen · Friday"]]
 };
 return <section className="scene-relationship" id="relationship">
  <div className="scene-heading"><span>Built around relationships</span><h2>Every detail.<br/>The whole picture.</h2><p>People, conversations and the next step.<br/>Together, exactly where you need them.</p></div>
  <div className="scene-record">
   <aside><div className="scene-person">MC</div><h3>Maya Chen</h3><p>VP of Revenue at Helio Systems</p><a href="./app.html#contacts"><IconMail size={14}/> Open contact <IconArrowRight size={14}/></a><dl><dt>Email</dt><dd>maya@helio.systems</dd><dt>Company</dt><dd>Helio Systems</dd><dt>Location</dt><dd>San Francisco, CA</dd><dt>Owner</dt><dd>Alex Morgan</dd></dl></aside>
   <div className="scene-record-main"><div className="scene-highlights"><span><IconSparkles size={15}/> Relationship highlights</span><p>Maya is bringing three teams onto one workspace. The proposal is reviewed. A security check is the next step.</p><small>Illustrative sample record</small></div><div className="scene-record-tiles"><div><IconCalendar size={16}/><small>Next conversation</small><strong>Rollout planning</strong><span>Thursday · 10:30 AM</span></div><div><IconBriefcase size={16}/><small>Opportunity</small><strong>Helio workspace</strong><span>$18,400 · Proposal</span></div></div><div className="scene-tabs" role="tablist" aria-label="Relationship preview">{Object.keys(entries).map(t=><button role="tab" aria-selected={tab===t} key={t} onClick={()=>setTab(t)}>{t}</button>)}</div><div className="scene-events" role="tabpanel" aria-label={tab}>{entries[tab].map(([title,meta])=><div key={title}><span>{tab==="Tasks"?<IconCheckbox size={15}/>:<IconNotes size={15}/>}</span><div><strong>{title}</strong><small>{meta}</small></div></div>)}</div></div>
  </div>
 </section>;
}

export function ContextOrbit(){
 const root=useRef(null);
 const [connections,setConnections]=useState([]);
 useEffect(()=>{
  const element=root.current;
  const measure=()=>{
   const bounds=element.getBoundingClientRect();
   const core=element.querySelector('.orbit-core').getBoundingClientRect();
   const endX=core.left+core.width/2-bounds.left;
   const endY=core.top-bounds.top;
   setConnections([...element.querySelectorAll('.orbit-point>svg')].map(icon=>{
    const box=icon.getBoundingClientRect();
    const x=box.left+box.width/2-bounds.left;
    const y=box.bottom-bounds.top;
    return `M ${x} ${y} C ${x} ${y+70}, ${endX} ${endY-50}, ${endX} ${endY}`;
   }));
  };
  const observer=new ResizeObserver(measure);
  observer.observe(element);
  measure();
  return()=>observer.disconnect();
 },[]);
 return <div className="scene-orbit" ref={root} aria-hidden="true">
  <svg className="orbit-connections">{connections.map((path,i)=><path key={i} d={path} fill="none" stroke="#4d5968" strokeWidth="1.25"/>)}</svg>
  <span className="orbit-core"><img src="./public/brand/brand-linear-crm-white.png" alt="" width="36" height="28"/></span>
  {[["People",IconUsers],["Companies",IconBuildingSkyscraper],["Opportunities",IconBriefcase],["Notes",IconNotes],["Tasks",IconCheckbox]].map(([name,Icon],i)=><span className={"orbit-point orbit-point-"+i} key={name}><Icon size={19}/><small>{name}</small></span>)}
 </div>;
}

export function HeroBrief(){
 const [open,setOpen]=useState(false);
 return <div className="scene-hero-brief">
  <button className="scene-brief-trigger" aria-expanded={open} onClick={()=>setOpen(!open)}><span><IconSparkles size={16}/></span><div><strong>A little clarity from Liner</strong><small>Two deals need your next move</small></div>{open?<IconX size={15}/>:<IconArrowRight size={15}/>}</button>
  {open&&<div className="scene-brief-answer"><small>Sample workspace brief</small><p><strong>Helio Systems</strong> is missing an economic buyer. <strong>Cedar & Co.</strong> has been in proposal for 16 days.</p><a href="./app.html#assistant">Meet Liner <IconArrowRight size={13}/></a></div>}
 </div>;
}
