export function performanceDemo(now = new Date()) {
 const date = days => new Date(now.getTime()-days*86400000).toISOString();
 const names=["Atlas expansion","Cedar annual plan","Northstar onboarding","Orbit team rollout","Summit renewal","Harbor enterprise","Acme growth plan","Nova pilot","Vertex partnership","Ember subscription","Lumen expansion","Pioneer renewal"];
 return {pipelines:[{id:"demo-sales",name:"Sales"},{id:"demo-enterprise",name:"Enterprise"}],deals:names.map((name,i)=>{
  const stage=i<8?(i%3===0?"Lost":"Won"):["Proposal","Negotiation","Qualified","Proposal"][i-8];
  const entered=8+i*6;
  return {id:"demo-"+i,name,owner:["Alex Morgan","Maya Chen","Sam Rivera"][i%3],pipeline:i%2?"demo-sales":"demo-enterprise",stage,amount:8000+i*3500,createdAt:date(entered+25+i*2),stageEnteredAt:date(entered),stageHistory:[{to:stage,at:date(entered)}],nextStep:["Confirm timeline","Schedule review","Send revised proposal"][i%3]};
 })};
}
