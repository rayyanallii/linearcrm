/*
 * The object/field model. This is the local equivalent of Twenty's metadata layer:
 * every screen (table, board, record page, filters, CSV) is driven from these definitions.
 */

export const owners = ["Alex Morgan", "Maya Chen", "Sam Rivera", "Jordan Blake"];

export const stages = [
  "Prospecting",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

export const openStages = stages.slice(0, 4);

export const stageColors = {
  Prospecting: "gray",
  Qualified: "blue",
  Proposal: "purple",
  Negotiation: "orange",
  Won: "green",
  Lost: "red",
};

export const stageProbability = {
  Prospecting: 10,
  Qualified: 30,
  Proposal: 55,
  Negotiation: 75,
  Won: 100,
  Lost: 0,
};

export const industries = [
  "Technology",
  "Consulting",
  "Design",
  "E-commerce",
  "Fintech",
  "Media",
  "Healthcare",
  "Education",
  "AI",
  "Logistics",
];

export const countries = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Netherlands",
  "Australia",
];

export const leadSources = ["Referral", "Event", "Inbound", "Outbound", "Partner"];
export const contactStatuses = ["Lead", "Qualified", "Customer", "Churned"];
export const priorities = ["Low", "Normal", "High", "Urgent"];
export const taskStatuses = ["Open", "In progress", "Waiting", "Blocked", "Done", "Cancelled"];
export const taskTypes = ["Call", "Email", "Meeting", "To-do"];
export const noteCategories = ["Meeting", "Call", "Research", "General"];
export const dealSources = ["Inbound", "Outbound", "Referral", "Partner", "Event"];
export const dealTypes = ["New business", "Expansion", "Renewal"];
export const accountTiers = ["Strategic", "Growth", "Standard"];
export const emailDirections = ["Outbound", "Inbound"];
export const customFieldTypes = [
  "text",
  "textarea",
  "number",
  "date",
  "email",
  "url",
  "boolean",
  "select",
];

const ownerField = (section = "People") => ({
  key: "owner",
  label: "Owner",
  type: "owner",
  section,
  width: 150,
});

const systemFields = [
  {
    key: "createdBy",
    label: "Created by",
    type: "text",
    section: "Metadata",
    system: true,
    readonly: true,
  },
  {
    key: "createdAt",
    label: "Created at",
    type: "datetime",
    section: "Metadata",
    system: true,
    readonly: true,
  },
  {
    key: "updatedAt",
    label: "Updated at",
    type: "datetime",
    section: "Metadata",
    system: true,
    readonly: true,
  },
];

export const SYSTEM_FIELDS = systemFields;

export const leadStatuses = ["Not contacted", "Contacted", "Replied", "Interested", "Not interested", "Follow-up", "Converted", "New", "Qualified", "Unqualified"];
/*
 * Optional feature packs. These collections ship with the workspace but stay out of
 * navigation, search, dashboard sources and relation columns until enabled in
 * Settings → Feature packs. Turning a pack off never deletes its records.
 */
export const FEATURE_PACKS = [
  {
    key: "campaigns",
    label: "Campaigns",
    description: "Email campaigns: audience, sender, sequence and sending limits.",
  },
  {
    key: "projects",
    label: "Projects",
    description: "Post-sale delivery work, budgets and milestones.",
  },
  {
    key: "tickets",
    label: "Support tickets",
    description: "Customer requests with priority, category and ownership.",
  },
  {
    key: "emails",
    label: "Emails",
    description: "The local conversation log for every record.",
  },
  {
    key: "mailboxes",
    label: "Email accounts",
    description: "SMTP accounts with warm-up, daily limits and deliverability health.",
  },
  {
    key: "products",
    label: "Products & quotes",
    description: "Product catalogue plus quote line items on opportunities.",
  },
  {
    key: "invoices",
    label: "Invoices",
    description: "Quote follow-through: invoice records with status, dates and totals.",
  },
];

export const PACK_KEYS = FEATURE_PACKS.map((pack) => pack.key);

export function featureEnabled(db, key) {
  if (!PACK_KEYS.includes(key)) return true;
  return db?.ui?.features?.[key] === true;
}

export const OBJECTS = {
  leads: {
    key:"leads",singular:"Lead",plural:"Leads",icon:"prospect",
    description:"Qualify new prospects and convert them into customer relationships.",
    defaultGroup:"status",dateField:"nextFollowUp",
    defaultColumns:["name","status","email","companyName","owner","source","priority","nextFollowUp","age"],
    fields:[
      {key:"name",label:"Lead name",type:"text",required:true,section:"Lead",width:220},
      {key:"status",label:"Status",type:"select",options:leadStatuses,section:"Lead",width:125},
      {key:"email",label:"Email",type:"email",section:"Lead",width:210},
      {key:"phone",label:"Phone",type:"phone",section:"Lead"},
      {key:"role",label:"Job title",type:"text",section:"Lead"},
      {key:"companyName",label:"Company name",type:"text",section:"Company",width:190},
      {key:"website",label:"Company website",type:"url",section:"Company"},
      {key:"industry",label:"Industry",type:"select",options:industries,section:"Company"},
      ownerField("Qualification"),
      {key:"source",label:"Source",type:"select",options:leadSources,section:"Qualification"},
      {key:"priority",label:"Priority",type:"select",options:priorities,section:"Qualification"},
      {key:"budget",label:"Budget (USD)",type:"currency",section:"Qualification"},
      {key:"needs",label:"Business needs",type:"textarea",section:"Qualification"},
      {key:"nextFollowUp",label:"Next follow-up",type:"date",section:"Qualification"},
      {key:"campaign",label:"Campaign",type:"relation",object:"campaigns",section:"Attribution",width:170},
      {key:"tags",label:"Tags",type:"text",section:"Qualification"},
      {key:"age",label:"Age (days)",type:"computed",computed:"leadAge",readonly:true,section:"History"},
      {key:"details",label:"Notes",type:"textarea",section:"Notes"},
    ],
  },
  companies: {
    key: "companies",
    singular: "Company",
    plural: "Companies",
    icon: "building",
    description: "Accounts, customers and prospects.",
    defaultGroup: "industry",
    dateField: "renewalDate",
    defaultColumns: [
      "name",
      "website",
      "industry",
      "accountTier",
      "employees",
      "annualRevenue",
      "owner",
      "icp",
      "renewalDate",
      "people",
    ],
    fields: [
      { key: "name", label: "Company name", type: "text", required: true, section: "Company", width: 230 },
      { key: "website", label: "Domain", type: "url", section: "Company", width: 180 },
      { key: "industry", label: "Industry", type: "select", options: industries, section: "Company", width: 150 },
      { key: "accountTier", label: "Account tier", type: "select", options: accountTiers, section: "Company", width: 130 },
      { key: "relationshipStatus", label: "Relationship status", type: "select", options: ["Prospect", "Active customer", "Partner", "Former customer", "Supplier"], section: "Relationship", width: 165 },
      { key: "employees", label: "Employees", type: "number", section: "Company", width: 110 },
      { key: "annualRevenue", label: "Annual revenue", type: "currency", section: "Company", width: 155 },
      { key: "icp", label: "ICP", type: "boolean", section: "Company", width: 80 },
      ownerField(),
      { key: "renewalDate", label: "Renewal date", type: "date", section: "Relationship", width: 130 },
      { key: "people", label: "People", type: "computed", computed: "companyPeople", readonly: true, section: "Relationship", width: 190 },
      { key: "phone", label: "Phone", type: "phone", section: "Location" },
      { key: "address", label: "Address", type: "text", section: "Location", width: 190 },
      { key: "city", label: "City", type: "text", section: "Location", width: 130 },
      { key: "country", label: "Country", type: "select", options: countries, section: "Location", width: 140 },
      { key: "linkedIn", label: "LinkedIn", type: "url", section: "Location", width: 190 },
      { key: "details", label: "Description", type: "textarea", section: "Notes" },
    ],
  },
  contacts: {
    key: "contacts",
    singular: "Person",
    plural: "People",
    icon: "user",
    description: "The humans behind every deal.",
    defaultGroup: "status",
    dateField: "lastContacted",
    defaultColumns: [
      "name",
      "company",
      "role",
      "email",
      "status",
      "phone",
      "owner",
      "leadSource",
      "lastContacted",
    ],
    fields: [
      { key: "name", label: "Full name", type: "text", required: true, section: "Person", width: 200 },
      { key: "role", label: "Job title", type: "text", section: "Person", width: 170 },
      { key: "email", label: "Email", type: "email", section: "Person", width: 220 },
      { key: "phone", label: "Phone", type: "phone", section: "Person", width: 150 },
      { key: "status", label: "Status", type: "select", options: contactStatuses, section: "Person", width: 120 },
      { key: "leadSource", label: "Lead source", type: "select", options: leadSources, section: "Person", width: 130 },
      { key: "campaign", label: "Campaign", type: "relation", object: "campaigns", section: "Attribution", width: 170 },
      ownerField(),
      { key: "lastContacted", label: "Last contacted", type: "date", section: "Person", width: 135 },
      { key: "company", label: "Company", type: "relation", object: "companies", section: "Company", width: 175 },
      { key: "city", label: "City", type: "text", section: "Location" },
      { key: "country", label: "Country", type: "select", options: countries, section: "Location" },
      { key: "linkedIn", label: "LinkedIn", type: "url", section: "Location" },
      { key: "details", label: "Notes", type: "textarea", section: "Notes" },
    ],
  },
  deals: {
    key: "deals",
    singular: "Opportunity",
    plural: "Opportunities",
    icon: "target",
    description: "Revenue you are working to close.",
    defaultGroup: "stage",
    dateField: "date",
    defaultColumns: [
      "name",
      "stage",
      "pipeline",
      "amount",
      "probability",
      "date",
      "company",
      "contact",
      "owner",
      "nextStep",
      "nextFollowUp",
    ],
    fields: [
      { key: "name", label: "Opportunity name", type: "text", required: true, section: "Opportunity", width: 230 },
      { key: "pipeline", label: "Pipeline", type: "relation", object: "pipelines", section: "Opportunity", width: 170 },
      { key: "stage", label: "Stage", type: "select", options: stages, section: "Opportunity", width: 130 },
      { key: "amount", label: "Amount", type: "currency", section: "Opportunity", width: 130 },
      { key: "probability", label: "Probability", type: "percent", section: "Opportunity", width: 110 },
      { key: "date", label: "Close date", type: "date", section: "Opportunity", width: 130 },
      { key: "type", label: "Type", type: "select", options: dealTypes, section: "Opportunity", width: 130 },
      { key: "source", label: "Source", type: "select", options: dealSources, section: "Opportunity", width: 120 },
      { key: "company", label: "Company", type: "relation", object: "companies", section: "People", width: 175 },
      { key: "contact", label: "Primary contact", type: "relation", object: "contacts", section: "People", width: 175 },
      ownerField("People"),
      { key: "nextStep", label: "Next step", type: "text", section: "Next steps", width: 230 },
      { key: "nextFollowUp", label: "Next follow-up", type: "date", section: "Next steps", width: 140 },
      { key: "details", label: "Description", type: "textarea", section: "Notes" },
    ],
  },
  tasks: {
    key: "tasks",
    singular: "Task",
    plural: "Tasks",
    icon: "check",
    description: "Follow-ups and to-dos across the workspace.",
    defaultGroup: "status",
    dateField: "date",
    defaultColumns: [
      "name",
      "status",
      "priority",
      "date",
      "taskType",
      "owner",
      "company",
      "contact",
      "deal",
    ],
    fields: [
      {key:"lead",label:"Lead",type:"relation",object:"leads",section:"Related",width:180},
      { key: "name", label: "Task", type: "text", required: true, section: "Task", width: 230 },
      { key: "status", label: "Status", type: "select", options: taskStatuses, section: "Task", width: 120 },
      { key: "priority", label: "Priority", type: "select", options: priorities, section: "Task", width: 110 },
      { key: "taskType", label: "Type", type: "select", options: taskTypes, section: "Task", width: 110 },
      { key: "date", label: "Due date", type: "date", section: "Task", width: 125 },
      { key: "repeat", label: "Repeat", type: "select", options: ["None", "Daily", "Weekly", "Monthly"], section: "Schedule", width: 120 },
      { key: "repeatUntil", label: "Repeat until", type: "date", section: "Schedule", width: 130 },
      { key: "completedAt", label: "Completed at", type: "computed", computed: "taskCompleted", readonly: true, section: "Schedule", width: 170 },
      { key: "checklistProgress", label: "Checklist", type: "computed", computed: "checklistProgress", readonly: true, section: "Task", width: 100 },
      { key: "project", label: "Project", type: "relation", object: "projects", section: "Related", width: 190 },
      ownerField("Task"),
      { key: "company", label: "Company", type: "relation", object: "companies", section: "Related", width: 175 },
      { key: "contact", label: "Contact", type: "relation", object: "contacts", section: "Related", width: 170 },
      { key: "deal", label: "Opportunity", type: "relation", object: "deals", section: "Related", width: 190 },
      { key: "details", label: "Description", type: "textarea", section: "Notes" },
    ],
  },
  notes: {
    key: "notes",
    singular: "Note",
    plural: "Notes",
    icon: "note",
    description: "Meeting notes and research.",
    defaultGroup: "category",
    dateField: "meetingDate",
    defaultColumns: ["name", "category", "meetingDate", "company", "contact", "deal"],
    fields: [
      {key:"lead",label:"Lead",type:"relation",object:"leads",section:"Related",width:180},
      { key: "name", label: "Title", type: "text", required: true, section: "Note", width: 240 },
      { key: "category", label: "Category", type: "select", options: noteCategories, section: "Note", width: 120 },
      { key: "meetingDate", label: "Meeting date", type: "date", section: "Note", width: 130 },
      { key: "company", label: "Company", type: "relation", object: "companies", section: "Related", width: 175 },
      { key: "contact", label: "Contact", type: "relation", object: "contacts", section: "Related", width: 170 },
      { key: "deal", label: "Opportunity", type: "relation", object: "deals", section: "Related", width: 190 },
      { key: "details", label: "Note", type: "textarea", section: "Content" },
    ],
  },
  emails: {
    key: "emails",
    singular: "Email",
    plural: "Emails",
    icon: "mail",
    description: "A local log of conversations. No mailbox is connected.",
    defaultGroup: "direction",
    dateField: "date",
    defaultColumns: ["name", "direction", "date", "contact", "company", "deal", "to"],
    fields: [
      { key: "name", label: "Subject", type: "text", required: true, section: "Email", width: 260 },
      { key: "direction", label: "Direction", type: "select", options: emailDirections, section: "Email", width: 120 },
      { key: "date", label: "Date", type: "date", section: "Email", width: 120 },
      { key: "to", label: "To", type: "email", section: "Email", width: 210 },
      { key: "from", label: "From", type: "email", section: "Email", width: 210 },
      { key: "contact", label: "Contact", type: "relation", object: "contacts", section: "Related", width: 170 },
      { key: "company", label: "Company", type: "relation", object: "companies", section: "Related", width: 175 },
      { key: "deal", label: "Opportunity", type: "relation", object: "deals", section: "Related", width: 190 },
      { key: "lead", label: "Lead", type: "relation", object: "leads", section: "Related", width: 170 },
      { key: "campaign", label: "Campaign", type: "relation", object: "campaigns", section: "Related", width: 180 },
      { key: "attachment", label: "Attachment", type: "text", section: "Content", width: 160 },
      { key: "details", label: "Body", type: "textarea", section: "Content" },
    ],
  },
};

/*
 * Phase 4 delivery modules. They live in their own map so the sales objects above stay
 * readable, then join OBJECTS so every view, filter, CSV, workflow and assistant tool
 * picks them up without a special case.
 */
export const DELIVERY_OBJECTS = {
  projects: {
    key: "projects",
    singular: "Project",
    plural: "Projects",
    icon: "project",
    description: "Delivery work created from won opportunities.",
    defaultGroup: "status",
    dateField: "dueDate",
    defaultColumns: ["name", "status", "progress", "dueDate", "company", "owner", "budget"],
    fields: [
      { key: "name", label: "Project name", type: "text", required: true, section: "Project", width: 230 },
      { key: "status", label: "Status", type: "select", options: ["Planning", "In progress", "At risk", "On hold", "Completed", "Cancelled"], section: "Project", width: 135 },
      { key: "progress", label: "Progress", type: "percent", section: "Project", width: 110 },
      { key: "startDate", label: "Start date", type: "date", section: "Schedule", width: 130 },
      { key: "dueDate", label: "Due date", type: "date", section: "Schedule", width: 130 },
      { key: "nextMilestone", label: "Next milestone", type: "text", section: "Schedule", width: 200 },
      { key: "budget", label: "Budget", type: "currency", section: "Budget", width: 130 },
      { key: "spent", label: "Spent", type: "currency", section: "Budget", width: 120 },
      { key: "company", label: "Company", type: "relation", object: "companies", section: "Customer", width: 175 },
      { key: "contact", label: "Contact", type: "relation", object: "contacts", section: "Customer", width: 170 },
      { key: "deal", label: "Opportunity", type: "relation", object: "deals", section: "Customer", width: 190 },
      ownerField("Customer"),
      { key: "details", label: "Description", type: "textarea", section: "Notes" },
    ],
  },
  campaigns: {
    key: "campaigns",
    singular: "Campaign",
    plural: "Campaigns",
    icon: "campaign",
    description: "Email campaigns with an audience, sender, sequence and sending limits.",
    defaultGroup: "status",
    dateField: "startDate",
    defaultColumns: ["name", "status", "channel", "startDate", "endDate", "audience", "sentCount", "budget", "spend", "owner"],
    fields: [
      { key: "name", label: "Campaign name", type: "text", required: true, section: "Campaign", width: 230 },
      { key: "status", label: "Status", type: "select", options: ["Planned", "Active", "Paused", "Completed", "Archived"], section: "Campaign", width: 120 },
      { key: "channel", label: "Channel", type: "select", options: ["Email", "Event", "Content", "Paid social", "Partner"], section: "Campaign", width: 130 },
      { key: "startDate", label: "Start date", type: "date", section: "Schedule", width: 130 },
      { key: "endDate", label: "End date", type: "date", section: "Schedule", width: 130 },
      { key: "emailAccount", label: "Sender account", type: "relation", object: "mailboxes", section: "Email", width: 180 },
      { key: "subject", label: "Subject", type: "text", section: "Email", width: 250 },
      { key: "body", label: "Body", type: "textarea", section: "Email" },
      { key: "attachment", label: "Attachment", type: "text", section: "Email", width: 150 },
      { key: "audienceObject", label: "Send to", type: "select", options: ["Leads", "People"], section: "Audience", width: 110 },
      { key: "audienceStatus", label: "Audience status", type: "select", options: ["Any", ...new Set([...leadStatuses, ...contactStatuses])], section: "Audience", width: 150 },
      { key: "audienceSource", label: "Audience source", type: "select", options: ["Any", ...leadSources], section: "Audience", width: 145 },
      { key: "audiencePriority", label: "Audience priority", type: "select", options: ["Any", ...priorities], section: "Audience", width: 150 },
      { key: "audienceOwner", label: "Audience owner", type: "select", options: ["Any", ...owners], section: "Audience", width: 150 },
      { key: "audience", label: "Recipients", type: "number", section: "Results", width: 100 },
      { key: "sentCount", label: "Sent", type: "number", section: "Results", width: 80 },
      { key: "lastSent", label: "Last sent", type: "date", section: "Results", width: 120 },
      { key: "budget", label: "Budget", type: "currency", section: "Spend", width: 120 },
      { key: "spend", label: "Spend", type: "currency", section: "Spend", width: 120 },
      ownerField("Campaign"),
      { key: "details", label: "Description", type: "textarea", section: "Notes" },
    ],
  },
  tickets: {
    key: "tickets",
    singular: "Ticket",
    plural: "Support tickets",
    icon: "ticket",
    description: "Customer requests tracked locally. Inbound email intake needs a backend.",
    defaultGroup: "status",
    dateField: "opened",
    defaultColumns: ["name", "status", "priority", "category", "company", "contact", "owner", "opened", "dueDate"],
    fields: [
      { key: "name", label: "Subject", type: "text", required: true, section: "Ticket", width: 240 },
      { key: "status", label: "Status", type: "select", options: ["Open", "In progress", "Waiting on customer", "Resolved", "Closed"], section: "Ticket", width: 165 },
      { key: "priority", label: "Priority", type: "select", options: priorities, section: "Ticket", width: 110 },
      { key: "category", label: "Category", type: "select", options: ["Bug", "Question", "Billing", "Feature request", "Onboarding"], section: "Ticket", width: 145 },
      { key: "opened", label: "Opened", type: "date", section: "Dates", width: 120 },
      { key: "dueDate", label: "Due date", type: "date", section: "Dates", width: 120 },
      { key: "company", label: "Company", type: "relation", object: "companies", section: "Customer", width: 175 },
      { key: "contact", label: "Contact", type: "relation", object: "contacts", section: "Customer", width: 170 },
      ownerField("Customer"),
      { key: "details", label: "Description", type: "textarea", section: "Notes" },
    ],
  },
};

Object.assign(OBJECTS, DELIVERY_OBJECTS);

/*
 * Commerce pack (opt-in): a product catalogue that feeds quote lines on
 * opportunities. Totals and margin are calculated locally in commerce.mjs.
 */
export const COMMERCE_OBJECTS = {
  products: {
    key: "products",
    singular: "Product",
    plural: "Products",
    icon: "product",
    description: "Sellable catalogue used to build opportunity quotes.",
    defaultGroup: "category",
    dateField: "availableFrom",
    defaultColumns: ["name", "sku", "category", "unitPrice", "billing", "active", "owner"],
    fields: [
      { key: "name", label: "Product name", type: "text", required: true, section: "Product", width: 230 },
      { key: "sku", label: "SKU", type: "text", section: "Product", width: 130 },
      { key: "category", label: "Category", type: "select", options: ["Software", "Services", "Hardware", "Support", "Training"], section: "Product", width: 130 },
      { key: "unitPrice", label: "Unit price", type: "currency", section: "Pricing", width: 130 },
      { key: "unitCost", label: "Unit cost", type: "currency", section: "Pricing", width: 130 },
      { key: "billing", label: "Billing", type: "select", options: ["One-time", "Monthly", "Annual"], section: "Pricing", width: 120 },
      { key: "active", label: "Active", type: "boolean", section: "Availability", width: 90 },
      { key: "availableFrom", label: "Available from", type: "date", section: "Availability", width: 140 },
      ownerField("Product"),
      { key: "details", label: "Description", type: "textarea", section: "Notes" },
    ],
  },
};

Object.assign(OBJECTS, COMMERCE_OBJECTS);

/*
 * Invoices pack (opt-in): the billing record a quote turns into. Payment
 * processing stays out of scope, so an invoice is a local record with a
 * status, dates and an amount.
 */
export const BILLING_OBJECTS = {
  invoices: {
    key: "invoices",
    singular: "Invoice",
    plural: "Invoices",
    icon: "receipt",
    description: "Bills created from quotes. Recording a payment is manual.",
    defaultGroup: "status",
    dateField: "dueDate",
    defaultColumns: [
      "name",
      "status",
      "amount",
      "issueDate",
      "dueDate",
      "company",
      "owner",
    ],
    fields: [
      { key: "name", label: "Invoice", type: "text", required: true, section: "Invoice", width: 210 },
      { key: "status", label: "Status", type: "select", options: ["Draft", "Sent", "Paid", "Overdue", "Void"], section: "Invoice", width: 115 },
      { key: "amount", label: "Amount", type: "currency", section: "Invoice", width: 130 },
      { key: "issueDate", label: "Issued", type: "date", section: "Dates", width: 120 },
      { key: "dueDate", label: "Due date", type: "date", section: "Dates", width: 120 },
      { key: "paidDate", label: "Paid on", type: "date", section: "Dates", width: 120 },
      { key: "company", label: "Company", type: "relation", object: "companies", section: "Customer", width: 175 },
      { key: "contact", label: "Contact", type: "relation", object: "contacts", section: "Customer", width: 170 },
      { key: "deal", label: "Opportunity", type: "relation", object: "deals", section: "Customer", width: 190 },
      ownerField("Invoice"),
      { key: "details", label: "Notes", type: "textarea", section: "Notes" },
    ],
  },
};

Object.assign(OBJECTS, BILLING_OBJECTS);

export const CUSTOM_OBJECT_FIELDS = [
  { key: "name", label: "Name", type: "text", required: true, section: "General", width: 240 },
  { key: "date", label: "Date", type: "date", section: "General", width: 130 },
  { key: "details", label: "Description", type: "textarea", section: "Notes" },
];

const COMPUTED = {
  companyPeople(record, db) {
    return (db.contacts || [])
      .filter((person) => person.company === record.id)
      .map((person) => person.name)
      .join(", ");
  },
};

export function today(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function nowIso() {
  return new Date().toISOString();
}

export function objectDef(type, db) {
  if (OBJECTS[type]) return OBJECTS[type];
  const custom = (db?.objects || []).find((object) => object.key === type);
  return {
    key: type,
    singular: custom?.singular || "Record",
    plural: custom?.plural || "Records",
    icon: "table",
    description: custom ? "Custom object" : "Unknown object",
    defaultGroup: null,
    dateField: "date",
    defaultColumns: ["name", "date", "details"],
    fields: CUSTOM_OBJECT_FIELDS,
    custom: true,
  };
}

export function customFieldDef(field, db) {
  const isRelation =
    OBJECTS[field.kind] || (db?.objects || []).some((object) => object.key === field.kind);
  return {
    key: field.key,
    label: field.title,
    type: isRelation ? "relation" : field.kind || "text",
    object: isRelation ? field.kind : undefined,
    options: Array.isArray(field.options) ? field.options : [],
    section: "Custom",
    custom: true,
  };
}

export function fieldDefs(type, db) {
  const base = objectDef(type, db).fields || CUSTOM_OBJECT_FIELDS;
  const custom = (db?.customFields || [])
    .filter((field) => field.type === type)
    .map((field) => customFieldDef(field, db));
  return [...base, ...custom].filter(
    (field) =>
      field.type !== "relation" || !field.object || featureEnabled(db, field.object),
  );
}

export function allFieldDefs(type, db) {
  return [...fieldDefs(type, db), ...SYSTEM_FIELDS];
}

export function fieldDef(type, key, db) {
  return allFieldDefs(type, db).find((field) => field.key === key);
}

export function columnsFor(type, db) {
  const object = objectDef(type, db);
  const defaults = object.defaultColumns || ["name", "details"];
  const fields = allFieldDefs(type, db).map((field) => field.key);
  return [...new Set([...defaults, ...fields])];
}

export function defaultVisibleColumns(type, db) {
  return objectDef(type, db).defaultColumns || ["name", "details"];
}

export function optionsFor(field, db) {
  if (!field) return [];
  if (field.type === "owner") return db?.members?.length ? db.members : owners;
  if (field.type === "relation") return db?.[field.object] || [];
  if (Array.isArray(field.options)) return field.options;
  return [];
}

export function operatorsFor(field) {
  if (!field) return ["contains", "is", "is_empty"];
  if (field.type === "boolean") return ["is_true", "is_false"];
  if (["number", "currency", "percent"].includes(field.type))
    return ["is", "is_not", "gt", "lt", "is_empty", "is_not_empty"];
  if (["date", "datetime"].includes(field.type))
    return ["is", "before", "after", "is_empty", "is_not_empty"];
  return ["contains", "not_contains", "is", "is_not", "is_empty", "is_not_empty"];
}

const COLORS = {
  stage: stageColors,
  status: { "Not contacted":"gray", Replied:"purple", Interested:"green", "Not interested":"red", "Follow-up":"orange", New:"gray",Contacted:"blue",Unqualified:"red",Converted:"green", Lead: "blue", Qualified: "purple", Customer: "green", Churned: "red", Open: "gray", "In progress": "blue", Done: "green", Waiting:"orange", Blocked:"red", Cancelled:"gray" },
  priority: { Low: "gray", Normal: "blue", High: "orange", Urgent: "red" },
  accountTier: { Strategic: "purple", Growth: "blue", Standard: "gray" },
  leadSource: { Referral: "green", Event: "orange", Inbound: "blue", Outbound: "purple", Partner: "turquoise" },
  category: { Meeting: "blue", Call: "purple", Research: "orange", General: "gray" },
  taskType: { Call: "blue", Email: "purple", Meeting: "orange", "To-do": "gray" },
  direction: { Outbound: "blue", Inbound: "green" },
  source: { Inbound: "blue", Outbound: "purple", Referral: "green", Partner: "turquoise", Event: "orange" },
  type: { "New business": "blue", Expansion: "purple", Renewal: "green" },
};

Object.assign(COLORS.status, {
  Draft: "gray",
  Sent: "blue",
  Paid: "green",
  Overdue: "red",
  Void: "gray",
  Planning: "gray",
  "In progress": "blue",
  "At risk": "red",
  "On hold": "orange",
  Completed: "green",
  Cancelled: "gray",
  Planned: "gray",
  Active: "blue",
  Paused: "orange",
  Archived: "gray",
  "Waiting on customer": "orange",
  Resolved: "green",
  Closed: "gray",
  Connected: "green",
  "Warming up": "orange",
  "Warmed up": "green",
});
Object.assign(COLORS.category, {
  Bug: "red",
  Question: "blue",
  Billing: "purple",
  "Feature request": "turquoise",
  Onboarding: "green",
  Software: "blue",
  Services: "purple",
  Hardware: "orange",
  Support: "green",
  Training: "turquoise",
});
COLORS.channel = {
  Email: "blue",
  Event: "orange",
  Content: "purple",
  "Paid social": "turquoise",
  Partner: "green",
};

export function tagColorFor(field, value) {
  const map = COLORS[field?.key];
  if (map && map[value]) return map[value];
  if (field?.key === "industry") {
    const index = Math.max(0, industries.indexOf(value));
    return ["blue", "turquoise", "purple", "orange", "green", "gray"][index % 6];
  }
  return "gray";
}

export function blankView(type, db) {
  const object = objectDef(type, db);
  return {
    id: "",
    name: `All ${object.plural.toLowerCase()}`,
    type,
    layout: "table",
    query: "",
    filters: [],
    logic: "and",
    sort: { field: "name", direction: "asc" },
    groupBy: object.defaultGroup || null,
    dateField: object.dateField || "date",
    visibleFields: null,
  };
}

export function nextId(prefix = "id") {
  return `${prefix}_${crypto.randomUUID()}`;
}
