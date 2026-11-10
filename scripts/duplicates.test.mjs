import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
const result = await build({entryPoints:["local/duplicates.js"],bundle:true,platform:"node",format:"esm",write:false});
const {duplicateGroups,mergePreview,mergeRecords}=await import("data:text/javascript;base64,"+Buffer.from(result.outputFiles[0].text).toString("base64"));
const workspace=()=>({companies:[{id:"a",name:"Acme",website:"https://www.acme.test",phone:"",icp:false,details:"Primary notes"},{id:"b",name:"ACME Ltd",website:"acme.test/about",phone:"555",icp:true,details:"Other notes"}],contacts:[{id:"p",name:"Person",email:"one@test.com",company:"b"}],deals:[{id:"d",name:"Deal",company:"b"}],tasks:[{id:"t",name:"Call",company:"b"}],notes:[{id:"n",name:"Note",company:"b"}],emails:[{id:"e",name:"Email",company:"b"}],leads:[{id:"l",name:"Lead",conversion:{companyId:"b",contactId:"p"}}],objects:[{key:"projects"}],projects:[{id:"project",name:"Project",client:"b"}],customFields:[{type:"projects",key:"client",title:"Client",kind:"companies"}],files:[{id:"f",record:"b",type:"companies",data:"bytes"}],pins:[{type:"companies",id:"a"},{type:"companies",id:"b"}],activity:[{text:"Created duplicate",changes:[{type:"companies",id:"b"}]}],trash:[]});
test("matches email/domain case-insensitively without matching names across known domains",()=>{
  const db=workspace();assert.equal(duplicateGroups(db,"companies").length,1);
  db.contacts.push({id:"q",name:"Different name",email:" ONE@test.com "});assert.equal(duplicateGroups(db,"contacts").length,1);
  db.companies[1].website="different.test";db.companies[1].name="Acme";assert.equal(duplicateGroups(db,"companies").length,0);
});
test("merge preserves links, attachments, custom relations, converted leads and original duplicate",()=>{
  const db=workspace();const before=structuredClone(db);const preview=mergePreview(db,"companies","a","b");
  assert.deepEqual(db,before);mergeRecords(db,preview,preview.choices);
  assert.equal(db.companies.length,1);assert.equal(db.companies[0].phone,"555");assert.equal(db.companies[0].icp,false);
  assert.match(db.companies[0].details,/Primary notes/);assert.match(db.companies[0].details,/Other notes/);
  for(const type of ["contacts","deals","tasks","notes","emails"])assert.equal(db[type][0].company,"a");
  assert.equal(db.projects[0].client,"a");assert.equal(db.leads[0].conversion.companyId,"a");assert.equal(db.files[0].record,"a");assert.equal(db.files[0].data,"bytes");
  assert.equal(db.pins.length,1);assert.equal(db.activity[0].changes[1].id,"a");assert.deepEqual(db.trash[0].record,before.companies[1]);assert.equal(db.trash[0].mergedInto,"a");
});
test("review choices work; stale or invalid reviews fail before changes",()=>{
  const db=workspace();const preview=mergePreview(db,"companies","a","b");db.companies[1].phone="Changed";const before=structuredClone(db);
  assert.throws(()=>mergeRecords(db,preview,preview.choices),/changed/);assert.deepEqual(db,before);
  const fresh=mergePreview(db,"companies","a","b");mergeRecords(db,fresh,{...fresh.choices,name:"duplicate",icp:"duplicate"});assert.equal(db.companies[0].name,"ACME Ltd");assert.equal(db.companies[0].icp,true);
  assert.throws(()=>mergeRecords(db,fresh,fresh.choices),/no longer exists/);
});
test("People merge redirects contact links and converted leads",()=>{
  const db=workspace();db.contacts.push({id:"q",name:"Duplicate person",email:"ONE@test.com",phone:"123"});
  db.deals[0].contact="q";db.tasks[0].contact="q";db.notes[0].contact="q";db.emails[0].contact="q";db.leads[0].conversion.contactId="q";
  const preview=mergePreview(db,"contacts","p","q");mergeRecords(db,preview,preview.choices);
  for(const type of ["deals","tasks","notes","emails"])assert.equal(db[type][0].contact,"p");
  assert.equal(db.leads[0].conversion.contactId,"p");assert.equal(db.contacts[0].phone,"123");assert.equal(db.contacts[0].mergeHistory[0].sourceId,"q");
});
