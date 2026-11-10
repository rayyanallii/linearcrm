const $ = (s) => document.querySelector(s);
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const money = (n) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
const dateText = (d) =>
  d
    ? new Date(d + "T12:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    : "No date";
const paths = {
  pipeline: "M3 5h18M3 12h13M3 19h7",
  contacts:
    "M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M18 5a4 4 0 0 1 0 7 M19 16q3 1 3 5",
  companies: "M4 21V5l11-2v18 M15 9h5v12 M2 21h20 M8 8h2m-2 4h2m-2 4h2",
  tasks: "M9 3h6v4H9z M8 5H5v16h14V5h-3 M8 14l3 3 5-6",
  notes: "M5 3h11l4 4v14H5z M15 3v6h5 M8 13h8m-8 4h6",
  activity: "M3 12h4l3-8 4 16 3-8h4",
  overview: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
  settings: "M4 7h16M4 17h16 M8 4v6 M16 14v6",
  search: "M17 17l4 4 M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14",
  board: "M3 4h18v16H3z M9 4v16m6-16v16",
  list: "M8 6h13M8 12h13M8 18h13M3 6h1m-1 6h1m-1 6h1",
  plus: "M12 5v14 M5 12h14",
  calendar: "M3 6h18v15H3z M7 3v6m10-6v6M3 11h18",
  coins: "M3 8q0-4 8-4t8 4q0 4-8 4T3 8z M3 8v6q0 4 8 4t8-4V8",
  target:
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18 M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10",
  chart: "M4 20h16M7 16v-4m5 4V5m5 11V9",
  chevron: "M7 10l5 5 5-5",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  menu: "M3 6h18M3 12h18M3 18h18",
  close: "M5 5l14 14M19 5 5 19",
  wallet: "M3 5h17v15H3z M15 10h6v5h-6z",
  brief: "M3 7h18v13H3z M8 7V4h8v3 M3 12q9 5 18 0",
  clock: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18 M12 6v6l4 2",
};
function icon(k, size = 17) {
  return (
    '<svg aria-hidden="true" width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' +
    (paths[k] || paths.brief) +
    '"/></svg>'
  );
}
const key = "linear-crm.v1";
let db,
  readError = false;
try {
  const raw = localStorage.getItem(key);
  db = raw ? JSON.parse(raw) : seed();
  if (!valid(db)) throw Error();
  if (!raw) localStorage.setItem(key, JSON.stringify(db));
} catch {
  db = seed();
  readError = true;
}
function valid(x) {
  return (
    x?.version === 1 &&
    (!("rules" in x) ||
      (Array.isArray(x.rules) &&
        x.rules.every(
          (r) =>
            r &&
            typeof r.id === "string" &&
            typeof r.title === "string" &&
            stages.includes(r.stage) &&
            Number.isInteger(Number(r.delay)) &&
            Number(r.delay) >= 0 &&
            Number(r.delay) <= 365,
        ))) &&
    typeof x.workspace === "string" &&
    Object.keys(types).every(
      (t) =>
        Array.isArray(x[t]) &&
        x[t].every(
          (r) => r && typeof r.name === "string" && typeof r.id === "string",
        ) &&
        new Set(x[t].map((r) => r.id)).size === x[t].length,
    ) &&
    x.deals.every(
      (r) =>
        stages.includes(r.stage) && Number.isFinite(r.amount) && r.amount >= 0,
    ) &&
    Array.isArray(x.activity) &&
    x.activity.every(
      (a) => typeof a?.text === "string" && Number.isFinite(a.at),
    )
  );
}
function save(change, description) {
  const next = structuredClone(db);
  change(next);
  stageRules(next, db);
  next.activity.unshift({ at: Date.now(), text: description });
  try {
    if (readError) throw Error();
    localStorage.setItem(key, JSON.stringify(next));
    db = next;
    return true;
  } catch {
    alert("Unable to save this workspace. Check browser storage availability.");
    return false;
  }
}
const labels = {
  calendar: "Calendar",
  workflows: "Workflows",
  overview: "Overview",
  deals: "Pipeline",
  contacts: "Contacts",
  companies: "Companies",
  tasks: "Tasks",
  notes: "Notes",
  activity: "Activity",
  settings: "Settings",
};
let page = labels[location.hash.slice(1)] ? location.hash.slice(1) : "deals",
  view = "Board",
  scope = "Active",
  owner = "",
  sort = "Default",
  query = "";
const ref = (t, id) => db[t].find((r) => r.id === id);
function nav(p) {
  if (!labels[p]) return;
  page = p;
  query = "";
  history.replaceState(null, "", "#" + p);
  document.body.classList.remove("menu-open");
  render();
}
function flash(msg) {
  $("#toast").textContent = msg;
  $("#toast").classList.add("show");
  setTimeout(() => $("#toast").classList.remove("show"), 2200);
}
function link(p) {
  return (
    '<button class="nav ' +
    (p === page ? "selected" : "") +
    '" data-nav="' +
    p +
    '">' +
    icon(p === "deals" ? "pipeline" : p) +
    "<span>" +
    labels[p] +
    "</span></button>"
  );
}
function avatar(name) {
  return (
    '<span class="avatar a' +
    Math.max(0, owners.indexOf(name)) +
    '" title="' +
    esc(name) +
    '">' +
    esc(
      (name || "Unassigned")
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join(""),
    ) +
    "</span>"
  );
}
function logo(c) {
  const marks = ["◈", "✳", "◐", "◕", "◎", "⌛", "⌘", "◒", "✺", "❧", "✹", "ϟ"];
  const n = Number(c?.logo);
  return (
    '<span aria-hidden="true" class="co-logo l' +
    (Number.isInteger(n) ? n % 6 : 0) +
    '">' +
    esc(marks[n] || c?.name?.[0] || "•") +
    "</span>"
  );
}
function render() {
  $("#sidebar").innerHTML =
    '<div class="brand"><img src="mark.svg" alt="">Linear CRM</div><button class="workspace" data-nav="settings"><span class="ws-mark">S</span><span>' +
    esc(db.workspace) +
    "</span>" +
    icon("chevron", 14) +
    '</button><button class="search-launch" data-action="search">' +
    icon("search") +
    ' Search anything <kbd>Ctrl K</kbd></button><div class="nav-title">Workspace</div>' +
    ["overview", "deals", "contacts", "companies"].map(link).join("") +
    '<div class="nav-title">Productivity</div>' +
    ["tasks", "calendar", "notes", "workflows", "activity"].map(link).join("") +
    '<div class="side-foot">' +
    link("settings") +
    '<div class="profile">' +
    avatar(owners[0]) +
    "<div><b>Alex Morgan</b><small>Personal workspace</small></div></div></div>";
  $("#top").innerHTML =
    '<button class="mobile" aria-label="Toggle navigation" data-action="menu">' +
    icon("menu") +
    "</button>" +
    icon("overview", 15) +
    "<span>Workspace</span><i>/</i><b>" +
    labels[page] +
    '</b><span class="local"><em></em> Local workspace</span>';
  const subs = {
    calendar: "Plan follow-ups and track upcoming close dates.",
    workflows: "Turn deal stage changes into follow-up tasks.",
    deals: "Track opportunities and move deals forward.",
    overview: "A snapshot of your sales and relationships.",
    contacts: "Manage the people behind your business relationships.",
    companies: "Keep your business accounts in one place.",
    tasks: "Organize follow-ups and next steps.",
    notes: "Capture conversations and account details.",
    activity: "Recent changes across your workspace.",
    settings: "Manage your workspace and local data.",
  };
  $("#main").innerHTML =
    '<div class="heading"><div><h1>' +
    (page === "deals" ? "Sales pipeline" : labels[page]) +
    "</h1><p>" +
    subs[page] +
    "</p></div>" +
    (types[page]
      ? '<button class="primary" data-new="' +
        page +
        '">' +
        icon("plus") +
        " New " +
        types[page].toLowerCase() +
        "</button>"
      : "") +
    '</div><div id="content"></div>';
  if (page === "deals") pipeline();
  else if (page === "calendar") calendar();
  else if (page === "workflows") workflows();
  else if (page === "overview") overview();
  else if (types[page]) directory();
  else if (page === "activity") $("#content").innerHTML = activity();
  else settings();
}
const total = (rows) => rows.reduce((s, r) => s + r.amount, 0);
const openDeals = () => db.deals.filter((r) => stages.indexOf(r.stage) < 4);
function stats() {
  const a = openDeals(),
    v = total(a),
    won = db.deals.filter((r) => r.stage === "Won");
  return (
    '<div class="stats">' +
    [
      ["Pipeline value", money(v), "wallet", "Across open opportunities"],
      ["Active deals", a.length, "brief", "In your pipeline"],
      [
        "Avg. deal size",
        money(a.length ? v / a.length : 0),
        "chart",
        "Per open opportunity",
      ],
      ["Won revenue", money(total(won)), "target", won.length + " closed won"],
    ]
      .map(
        ([l, value, k, h], i) =>
          '<div class="stat s' +
          i +
          '"><div><span class="stat-icon">' +
          icon(k, 15) +
          "</span>" +
          l +
          "</div><strong>" +
          value +
          "</strong><small>" +
          h +
          "</small></div>",
      )
      .join("") +
    "</div>"
  );
}
function options(items, selected) {
  return items
    .map(
      (i) =>
        "<option " +
        (i === selected ? "selected" : "") +
        ">" +
        esc(i) +
        "</option>",
    )
    .join("");
}
function dealCard(r) {
  const c = ref("companies", r.company);
  return (
    '<button class="deal" draggable="true" data-open="deals" data-id="' +
    esc(r.id) +
    '"><span class="company">' +
    logo(c) +
    esc(c?.name || "Independent") +
    "</span><strong>" +
    esc(r.name) +
    "</strong><b>" +
    money(r.amount) +
    '</b><span class="card-foot"><span>' +
    icon("calendar", 13) +
    esc(dateText(r.date)) +
    "</span>" +
    avatar(r.owner) +
    "</span></button>"
  );
}
function pipeline() {
  const rows = db.deals.filter(
    (r) =>
      (!owner || r.owner === owner) &&
      (scope === "All" || (scope === "Active") === stages.indexOf(r.stage) < 4),
  );
  if (sort === "Highest value") rows.sort((a, b) => b.amount - a.amount);
  if (sort === "Close date")
    rows.sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"));
  const visible =
    scope === "Active"
      ? stages.slice(0, 4)
      : scope === "Closed"
        ? stages.slice(4)
        : stages;
  $("#content").innerHTML =
    stats() +
    '<section class="work"><div class="section-heading"><div><span class="section-icon">' +
    icon("pipeline", 18) +
    '</span><h2>Deal pipeline</h2></div><label class="scope"><select aria-label="Pipeline scope" id="scope">' +
    options(["Active", "Closed", "All"], scope) +
    '</select> deals</label></div><div class="toolbar"><div class="seg">' +
    ["Board", "List"]
      .map(
        (s) =>
          '<button class="' +
          (view === s ? "on" : "") +
          '" data-view="' +
          s +
          '">' +
          icon(s.toLowerCase(), 15) +
          s +
          "</button>",
      )
      .join("") +
    '</div><div class="filters"><label>' +
    icon("contacts", 14) +
    '<select id="owner" aria-label="Owner"><option value="">Owners</option>' +
    options(owners, owner) +
    "</select></label><label>" +
    icon("settings", 14) +
    '<select id="sort" aria-label="Sort deals"><option value="Default">Sort</option>' +
    options(["Highest value", "Close date"], sort) +
    "</select></label></div></div>" +
    (view === "List"
      ? table("deals", rows)
      : '<div class="board">' +
        visible
          .map((s) => {
            const items = rows.filter((r) => r.stage === s);
            return (
              '<section class="lane" data-stage="' +
              s +
              '" style="--stage:' +
              colors[stages.indexOf(s)] +
              '"><div class="lane-head"><span class="dot"></span><b>' +
              s +
              "</b><small>" +
              items.length +
              '</small><button data-new="deals" data-stage="' +
              s +
              '" aria-label="Add deal in ' +
              s +
              '">' +
              icon("plus", 15) +
              '</button></div><div class="lane-total">' +
              money(total(items)) +
              "</div>" +
              items.map(dealCard).join("") +
              '<button class="add-card" data-new="deals" data-stage="' +
              s +
              '">' +
              icon("plus", 14) +
              " Add deal</button></section>"
            );
          })
          .join("") +
        "</div>") +
    "</section>";
}
function overview() {
  const rows = openDeals(),
    max = Math.max(
      1,
      ...stages
        .slice(0, 4)
        .map((s) => total(rows.filter((r) => r.stage === s))),
    );
  $("#content").innerHTML =
    stats() +
    '<div class="panel"><h2>Value by stage</h2>' +
    stages
      .slice(0, 4)
      .map((s, i) => {
        const v = total(rows.filter((r) => r.stage === s));
        return (
          '<div class="bar-row"><span>' +
          s +
          '</span><div><i style="width:' +
          (v / max) * 100 +
          "%;background:" +
          colors[i] +
          '"></i></div><b>' +
          money(v) +
          "</b></div>"
        );
      })
      .join("") +
    '</div><div class="panel"><h2>Open tasks</h2>' +
    table(
      "tasks",
      db.tasks.filter((r) => r.status !== "Done"),
    ) +
    "</div>";
}
function activity() {
  return (
    '<section class="panel"><h2>Workspace history</h2>' +
    (db.activity
      .map(
        (a) =>
          '<div class="log">' +
          icon("clock") +
          "<span>" +
          esc(a.text) +
          "</span><small>" +
          esc(new Date(a.at).toLocaleString()) +
          "</small></div>",
      )
      .join("") || "<p>Changes you make to records will appear here.</p>") +
    "</section>"
  );
}
function directory() {
  $("#content").innerHTML =
    '<section class="panel"><div class="section-heading"><h2>All ' +
    page +
    '</h2><input id="query" aria-label="Search ' +
    page +
    '" placeholder="Search ' +
    page +
    '…" value="' +
    esc(query) +
    '"></div><div id="records"></div></section>';
  records();
}
function records() {
  const rows = db[page].filter((r) =>
    Object.values(r)
      .concat(ref("companies", r.company)?.name, ref("deals", r.deal)?.name)
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  $("#records").innerHTML = table(page, rows);
}
function table(t, rows) {
  const cols = {
    deals: ["Company", "Stage", "Value", "Owner", "Close date"],
    companies: ["Industry", "Website", "Contacts"],
    contacts: ["Company", "Role", "Email"],
    tasks: ["Deal", "Due date", "Status"],
    notes: ["Deal", "Note"],
  };
  return (
    '<div class="table-wrap"><table><thead><tr><th>Name</th>' +
    cols[t].map((c) => "<th>" + c + "</th>").join("") +
    "</tr></thead><tbody>" +
    rows
      .map((r) => {
        let vals;
        const c = ref("companies", r.company)?.name,
          d = ref("deals", r.deal)?.name;
        if (t === "deals")
          vals = [c, r.stage, money(r.amount), r.owner, dateText(r.date)];
        if (t === "companies")
          vals = [
            r.industry,
            r.website,
            db.contacts.filter((p) => p.company === r.id).length,
          ];
        if (t === "contacts") vals = [c, r.role, r.email];
        if (t === "tasks") vals = [d, dateText(r.date), r.status];
        if (t === "notes") vals = [d, r.details];
        return (
          '<tr><td><button class="text-btn" data-open="' +
          t +
          '" data-id="' +
          esc(r.id) +
          '">' +
          (t === "companies" ? logo(r) : "") +
          esc(r.name) +
          "</button></td>" +
          vals.map((v) => "<td>" + esc(v ?? "—") + "</td>").join("") +
          "</tr>"
        );
      })
      .join("") +
    "</tbody></table>" +
    (!rows.length ? '<p class="empty">No matching records.</p>' : "") +
    "</div>"
  );
}
