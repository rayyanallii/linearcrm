import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { IconArrowRight, IconBuildingSkyscraper, IconChevronRight, IconMail, IconSearch, IconSparkles, IconCheck, IconPlus } from '@tabler/icons-react';

const companies = [
  { name: 'Northstar Studio', initials: 'N', person: 'Maya Chen', role: 'Head of Operations', email: 'maya@northstar.example', industry: 'Design', value: '$24,000', status: 'Interested', color: '#e8e5ff', note: 'Expanding the design team. Follow up with a proposal for 40 seats.' },
  { name: 'Helio Systems', initials: 'H', person: 'Theo Marshall', role: 'Co-founder', email: 'theo@helio.example', industry: 'Software', value: '$38,500', status: 'In conversation', color: '#fff0d1', note: 'Technical review is complete. Schedule a call to agree on the rollout.' },
  { name: 'Juniper Health', initials: 'J', person: 'Isla Harrington', role: 'Customer Operations', email: 'isla@juniper.example', industry: 'Healthcare', value: '$18,000', status: 'Customer', color: '#deefe5', note: 'Two new stakeholders have joined. Prepare a renewal conversation.' },
  { name: 'Cedar & Co', initials: 'C', person: 'Nathan Cole', role: 'Managing Director', email: 'nathan@cedar.example', industry: 'Consulting', value: '$12,000', status: 'Interested', color: '#f6e2dd', note: 'Interested in bringing client relationships into one workspace.' },
];

function Reveal({ children, className = '' }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={reduced ? false : { opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .12 }} transition={{ duration: .65, ease: [.22, 1, .36, 1] }}>{children}</motion.div>;
}

function Relationships() {
  const [selected, setSelected] = useState(companies[0]);
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState('Notes');
  return <div className="ed-product" aria-label="Interactive company preview">
    <div className="ed-product-top"><span><IconBuildingSkyscraper size={20} /> Companies</span><span className="ed-caption">Interactive preview · sample records</span></div>
    <div className="ed-record-layout">
      <div className="ed-directory">
        <div className="ed-directory-tools"><strong>All companies <span>4</span></strong><label><IconSearch size={18}/><input aria-label="Search sample companies" placeholder="Search companies" value={query} onChange={e => setQuery(e.target.value)}/></label></div>
        <div className="ed-table-wrap"><table><thead><tr><th>Company</th><th>Relationship</th><th>Industry</th></tr></thead><tbody>{companies.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => <tr key={c.name} className={selected.name === c.name ? 'is-selected' : ''}><td><button onClick={() => setSelected(c)} aria-pressed={selected.name === c.name}><span className="ed-avatar" style={{ background: c.color }}>{c.initials}</span>{c.name}</button></td><td><span className="ed-status">{c.status}</span></td><td>{c.industry}</td></tr>)}</tbody></table>{!companies.some(c => c.name.toLowerCase().includes(query.toLowerCase())) && <p className="ed-empty">No companies match your search.</p>}</div>
        <div className="ed-directory-bottom"><IconCheck size={16}/> People, notes and opportunities stay connected.</div>
      </div>
      <aside className="ed-contact"><span className="ed-caption">PRIMARY CONTACT</span><div className="ed-person"><span className="ed-avatar" style={{ background: selected.color }}>{selected.person.split(' ').map(n => n[0]).join('')}</span><div><h3>{selected.person}</h3><p>{selected.role}</p></div></div><p className="ed-email"><IconMail size={17}/>{selected.email}</p><div className="ed-contact-facts"><span>Company<strong>{selected.name}</strong></span><span>Opportunity<strong>{selected.value}</strong></span></div><div className="ed-tabs" role="tablist" aria-label="Contact information">{['Notes','Next task'].map(t => <button role="tab" aria-selected={tab === t} key={t} onClick={() => setTab(t)}>{t}</button>)}</div><div role="tabpanel" className="ed-contact-note"><strong>{tab === 'Notes' ? 'Last conversation' : 'Keep the conversation moving'}</strong><p>{tab === 'Notes' ? selected.note : `Follow up with ${selected.person.split(' ')[0]} and confirm the next meeting.`}</p></div></aside>
    </div>
  </div>;
}

function Pipeline() {
  const [view, setView] = useState('Pipeline');
  return <div className="ed-pipeline"><div className="ed-product-top"><strong>Sales overview</strong><div className="ed-tabs" role="tablist" aria-label="Sales preview">{['Pipeline','Forecast'].map(t => <button role="tab" aria-selected={view === t} key={t} onClick={() => setView(t)}>{t}</button>)}</div></div>{view === 'Pipeline' ? <div className="ed-board">{['Qualified','Proposal','Won'].map((stage,i) => <div className="ed-lane" key={stage}><h4><span className={`ed-dot ed-dot-${i}`}/>{stage}<span>1</span></h4><div className="ed-deal"><span className="ed-caption">{companies[i].name}</span><h3>{['Team expansion','Annual subscription','Workspace rollout'][i]}</h3><strong>{companies[i].value}</strong><div className="ed-deal-owner"><span className="ed-avatar">{companies[i].person[0]}</span>{companies[i].person}</div></div></div>)}</div> : <div className="ed-forecast"><span className="ed-caption">SAMPLE WEIGHTED FORECAST</span><strong>$46,850</strong><p>Opportunity value, adjusted for the likelihood of closing.</p>{[['Qualified',28],['Proposal',67],['Won',100]].map(([name,width]) => <div className="ed-bar" key={name}><span>{name}</span><div><motion.i initial={{width:0}} animate={{width:`${width}%`}} transition={{duration:.4}}/></div></div>)}</div>}<div className="ed-directory-bottom">Sample data · Explore your own records in the CRM</div></div>;
}

const answers = {
  'Which deal needs a follow-up?': 'Helio Systems has completed its technical review. A rollout call is the next step. The annual subscription opportunity is worth $38,500.',
  'Summarize Northstar Studio': 'Maya Chen is expanding the design team at Northstar Studio. They are interested in 40 seats, with a $24,000 opportunity. Your next step is to send a proposal.',
  'Can you update my records?': 'In the CRM, I can prepare changes for you to review before saving. This landing-page example only demonstrates the conversation and does not change any records.',
};

function Assistant() {
  const [question,setQuestion] = useState(Object.keys(answers)[0]);
  return <section className="ed-assistant" id="assistant"><div className="ed-section-heading"><span className="ed-eyebrow">MEET LINER</span><h2>A clearer next step.<br/><span>Just ask.</span></h2><p>Find a relationship, catch up on a conversation, or prepare an update without searching through every record.</p><a className="ed-text-link" href="./app.html#assistant">Meet your assistant <IconArrowRight size={19}/></a></div><Reveal className="ed-chat"><div className="ed-product-top"><strong><IconSparkles size={21}/> Liner</strong><span className="ed-caption">Sample conversation</span></div><div className="ed-chat-body"><div className="ed-question">{question}</div><motion.div key={question} initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} className="ed-answer"><IconSparkles size={20}/><p>{answers[question]}</p></motion.div></div><div className="ed-prompts"><span className="ed-caption">TRY A QUESTION</span>{Object.keys(answers).map(q => <button key={q} onClick={() => setQuestion(q)} aria-pressed={question === q}>{q}<IconArrowRight size={17}/></button>)}</div></Reveal></section>;
}

export default function MarketingHome({ contextSection, closingSection }) {
  return <div className="editorial-home">
    <section className="ed-hero"><div className="ed-hero-copy"><h1>Good relationships.<br/><span>Great possibilities.</span></h1><p>Your people, pipeline and next steps.<br className="ed-desktop-break"/> Together in a CRM that gives you room to think.</p><div className="ed-actions"><a className="ed-button ed-button-primary" href="./app.html">Explore the CRM <IconArrowRight size={19}/></a><a className="ed-button" href="#relationships">Take a closer look</a></div><span className="ed-caption">A personal CRM project. Free to explore.</span></div><Reveal className="ed-hero-preview"><Relationships/></Reveal></section>
    <section className="ed-relationship-intro" id="relationships"><span className="ed-eyebrow">THE WHOLE RELATIONSHIP</span><h2>More than a name<br/>in a spreadsheet.</h2><p>Start with a lead. Keep the people, companies and conversations that matter connected as the relationship grows.</p><a className="ed-text-link" href="./product.html">Explore records and views <IconArrowRight size={19}/></a></section>
    <section className="ed-sales" id="pipeline"><div className="ed-section-heading"><span className="ed-eyebrow">FROM INTEREST TO OPPORTUNITY</span><h2>Know where<br/>every deal stands.</h2><p>Give each opportunity a stage, an owner and a next step. Switch from the details to the bigger picture when it is time to plan.</p><a className="ed-text-link" href="./platform.html">Explore the sales workspace <IconArrowRight size={19}/></a></div><Reveal><Pipeline/></Reveal></section>
    <Assistant/>
    <section className="ed-practical"><Reveal><span className="ed-eyebrow">MAKE IT YOURS</span><h2>A workspace that<br/>fits the way you work.</h2></Reveal><div className="ed-feature-rows">{[['01','Keep follow-ups in view','Link tasks and notes to the people and opportunities they belong to.','./product.html'],['02','Shape your process','Customize fields and views. Sketch your process in the visual workflow editor.','./product.html'],['03','Bring your data along','Import your records, explore the workspace and export a backup when you need one.','./resources.html']].map(([n,title,text,href]) => <Reveal key={n}><a href={href}><span className="ed-caption">{n}</span><div><h3>{title}</h3><p>{text}</p></div><IconChevronRight size={24}/></a></Reveal>)}</div></section>
    <div className="ed-restored-dark">{contextSection}</div>
    <section className="ed-faq"><h2>A few things<br/>before you start.</h2><div>{[['Do I need an account?','No. You can open the CRM and explore the sample workspace directly in your browser.'],['Where does my data live?','CRM records are stored in this browser. Export a backup before clearing browser storage or moving to another device.'],['Is this a production service?','This is a personal portfolio project. The workflow editor is a visual demonstration. External AI features require a configured connection.'],['Can I change the sample records?','Yes. Inside the CRM you can create and edit your own records. The examples on this page are separate from your saved workspace.']].map(([q,a]) => <details key={q}><summary>{q}<IconPlus size={20}/></summary><p>{a}</p></details>)}</div></section>
    <div className="ed-restored-dark">{closingSection}</div>
  </div>;
}
