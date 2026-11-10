export const ROUTES = Object.freeze({
  home: "./index.html",
  platform: "./platform.html",
  product: "./product.html",
  resources: "./resources.html",
  customers: "./customers.html",
  pricing: "./pricing.html",
  crm: "./app.html",
  pipeline: "./platform-pipeline.html",
  workflows: "./platform-workflows.html",
  liner: "./platform-liner.html",
  forecast: "./platform-forecast.html",
  context: "./platform-context.html",
  dataModel: "./product-data-model.html",
  recordMoves: "./product-record-moves.html",
  savedViews: "./product-saved-views.html",
  localFirst: "./resources-local-first.html",
  importExport: "./resources-import-export.html",
  backup: "./resources-backup.html",
  keyboard: "./resources-keyboard.html",
  privacy: "./privacy.html",
  terms: "./terms.html",
  accessibility: "./accessibility.html",
  cookies: "./cookies.html",
});

export const LEGAL_LINKS = [
  { label: "Privacy policy", short: "Privacy", href: ROUTES.privacy },
  { label: "Terms and conditions", short: "Terms", href: ROUTES.terms },
  { label: "Accessibility statement", short: "Accessibility", href: ROUTES.accessibility },
  { label: "Cookie statement", short: "Cookies", href: ROUTES.cookies },
];

export const NAV_LINKS = [
  { label: "Platform", page: "platform", href: ROUTES.platform, menu: true },
  { label: "Product", page: "product", href: ROUTES.product },
  { label: "Resources", page: "resources", href: ROUTES.resources },
  { label: "Use cases", page: "customers", href: ROUTES.customers },
  { label: "Pricing", page: "pricing", href: ROUTES.pricing },
];

export const PLATFORM_MENU = [
  {
    title: "Context",
    items: [
      {
        title: "Universal context",
        description: "Every note, file and change on the record",
        href: ROUTES.context,
      },
      {
        title: "Data model",
        description: "Objects, typed fields and relationships",
        href: ROUTES.dataModel,
      },
      {
        title: "Record moves",
        description: "Move a lead without losing history",
        href: ROUTES.recordMoves,
      },
      {
        title: "Local-first",
        description: "Your workspace stays in this browser",
        href: ROUTES.localFirst,
      },
    ],
  },
  {
    title: "Orchestration",
    items: [
      {
        title: "Pipeline",
        description: "A next step on every open deal",
        href: ROUTES.pipeline,
      },
      {
        title: "Workflows",
        description: "Automate the follow-up, not the relationship",
        href: ROUTES.workflows,
      },
      {
        title: "Liner",
        description: "Ask the workspace a direct question",
        href: ROUTES.liner,
      },
      {
        title: "Forecast",
        description: "Coverage and risk without the spreadsheet",
        href: ROUTES.forecast,
      },
    ],
  },
  {
    title: "Ecosystem",
    items: [
      {
        title: "CSV import",
        description: "Bring the book with you",
        href: ROUTES.importExport,
      },
      {
        title: "One-file backup",
        description: "Take the whole workspace with you",
        href: ROUTES.backup,
      },
      {
        title: "Saved views",
        description: "The same view every time you open it",
        href: ROUTES.savedViews,
      },
      {
        title: "Keyboard-first",
        description: "Move through the workspace without the mouse",
        href: ROUTES.keyboard,
      },
    ],
  },
];

export const FOOTER_GROUPS = [
  {
    title: "Product",
    links: [
      { label: "Product tour", href: ROUTES.product },
      { label: "Data model", href: ROUTES.dataModel },
      { label: "Record moves", href: ROUTES.recordMoves },
      { label: "Saved views", href: ROUTES.savedViews },
      { label: "Pricing", href: ROUTES.pricing },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Platform overview", href: ROUTES.platform },
      { label: "Pipeline", href: ROUTES.pipeline },
      { label: "Workflows", href: ROUTES.workflows },
      { label: "Liner", href: ROUTES.liner },
      { label: "Forecast", href: ROUTES.forecast },
      { label: "Universal context", href: ROUTES.context },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Resources", href: ROUTES.resources },
      { label: "Local-first", href: ROUTES.localFirst },
      { label: "Import and export", href: ROUTES.importExport },
      { label: "Backup and restore", href: ROUTES.backup },
      { label: "Keyboard shortcuts", href: ROUTES.keyboard },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "Use cases", href: ROUTES.customers },
      { label: "Open the workspace", href: ROUTES.crm },
      { label: "Product notes", href: "./README.md" },
      { label: "Landing plan", href: "./landingplan.md" },
    ],
  },
];

export const ALL_PAGE_SLUGS = [
  "home",
  "platform",
  "product",
  "resources",
  "customers",
  "pricing",
  "platform-pipeline",
  "platform-workflows",
  "platform-liner",
  "platform-forecast",
  "platform-context",
  "product-data-model",
  "product-record-moves",
  "product-saved-views",
  "resources-local-first",
  "resources-import-export",
  "resources-backup",
  "resources-keyboard",
  "privacy",
  "terms",
  "accessibility",
  "cookies",
];
