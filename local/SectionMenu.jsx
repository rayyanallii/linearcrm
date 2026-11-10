import React, {useState, useEffect, useRef} from "react";
import {createPortal} from "react-dom";
import {IconPin, IconPinnedOff} from "@tabler/icons-react";
export function SectionMenu({children, section, pinned, toggle}) {
 const [position,setPosition]=useState(null);
 const menu=useRef(null), trigger=useRef(null);
 useEffect(()=>{
  if(!position) return;
  menu.current?.querySelector("button")?.focus();
  const close=event=>{if(!menu.current?.contains(event.target)) setPosition(null);};
  const escape=event=>{if(event.key==="Escape"||event.key==="Tab"){event.preventDefault();setPosition(null);trigger.current?.querySelector("button")?.focus();}};
  window.addEventListener("pointerdown",close);window.addEventListener("keydown",escape);
  window.addEventListener("resize",close);
  return()=>{window.removeEventListener("pointerdown",close);window.removeEventListener("keydown",escape);window.removeEventListener("resize",close);};
 },[position]);
 function open(event){
  event.preventDefault();
  const rect=event.currentTarget.getBoundingClientRect();
  setPosition({left:Math.min(event.clientX||rect.left+20,innerWidth-210),top:Math.min(event.clientY||rect.bottom,innerHeight-65)});
 }
 return <div ref={trigger} className="section-nav-row" onContextMenu={open} onKeyDown={event=>{if(event.key==="ContextMenu"||(event.shiftKey&&event.key==="F10"))open(event);}}>
  {children}
  {position && createPortal(<div ref={menu} className="section-context-menu" style={position} role="menu" aria-label={section.label+" actions"}>
   <button role="menuitem" onClick={()=>{toggle(section);setPosition(null);trigger.current?.querySelector("button")?.focus();}}>{pinned?<IconPinnedOff size={16}/>:<IconPin size={16}/>} {pinned?"Unpin":"Pin"} {section.label}</button>
  </div>,document.body)}
 </div>;
}
