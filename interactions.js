const dialog = $("#dialog");
function modal(title, html) {
  dialog.innerHTML =
    '<div class="modal-head"><h2>' +
    esc(title) +
    '</h2><button class="square" data-action="close" aria-label="Close">' +
    icon("close") +
    "</button></div>" +
    html;
  if (!dialog.open) dialog.showModal();
}
const fields = {
  deals: [
    ["name", "Deal name"],
    ["amount", "Value (USD)", "number"],
    ["stage", "Stage", stages],
    ["company", "Company", "companies"],
    ["contact", "Primary contact", "contacts"],
    ["owner", "Owner", owners],
    ["date", "Close date", "date"],
    ["details", "Description", "textarea"],
  ],
  companies: [
    ["name", "Company name"],
    ["industry", "Industry"],
    ["website", "Website"],
    ["details", "Description", "textarea"],
  ],
  contacts: [
    ["name", "Full name"],
    ["company", "Company", "companies"],
    ["role", "Job title"],
    ["email", "Email", "email"],
    ["phone", "Phone", "tel"],
    ["details", "Notes", "textarea"],
  ],
  tasks: [
    ["name", "Task name"],
    ["deal", "Related deal", "deals"],
    ["owner", "Owner", owners],
    ["date", "Due date", "date"],
    ["status", "Status", ["Open", "Done"]],
    ["details", "Description", "textarea"],
  ],
  notes: [
    ["name", "Title"],
    ["deal", "Related deal", "deals"],
    ["details", "Note", "textarea"],
  ],
};
function relations(t, id) {
  if (!id) return "";
  const rel =
    t === "companies"
      ? [
          ["contacts", "company"],
          ["deals", "company"],
        ]
      : t === "contacts"
        ? [["deals", "contact"]]
        : t === "deals"
          ? [
              ["tasks", "deal"],
              ["notes", "deal"],
            ]
          : [];
  return rel
    .map(([type, field]) => {
      const rows = db[type].filter((r) => r[field] === id);
      return (
        '<div class="related"><b>' +
        labels[type] +
        "</b>" +
        rows
          .map(
            (r) =>
              '<button type="button" class="text-btn" data-open="' +
              type +
              '" data-id="' +
              esc(r.id) +
              '">' +
              esc(r.name) +
              "</button>",
          )
          .join("") +
        '<button type="button" class="text-btn" data-related="' +
        type +
        '" data-field="' +
        field +
        '" data-id="' +
        esc(id) +
        '">+ Add ' +
        types[type].toLowerCase() +
        "</button></div>"
      );
    })
    .join("");
}
function edit(t, id = "", defaults = {}) {
  const r = ref(t, id) || defaults;
  const inputs = fields[t]
    .map(([k, label, kind]) => {
      const v = r[k] ?? "";
      let input;
      if (Array.isArray(kind))
        input = '<select name="' + k + '">' + options(kind, v) + "</select>";
      else if (types[kind])
        input =
          '<select name="' +
          k +
          '"><option value="">Unassigned</option>' +
          db[kind]
            .map(
              (x) =>
                '<option value="' +
                esc(x.id) +
                '" ' +
                (x.id === v ? "selected" : "") +
                ">" +
                esc(x.name) +
                "</option>",
            )
            .join("") +
          "</select>";
      else if (kind === "textarea")
        input = '<textarea name="' + k + '" rows="3">' + esc(v) + "</textarea>";
      else
        input =
          '<input name="' +
          k +
          '" type="' +
          (kind || "text") +
          '" value="' +
          esc(v) +
          '" ' +
          (k === "name"
            ? 'required maxlength="150"'
            : k === "amount"
              ? 'required min="0" step="0.01"'
              : "") +
          ">";
      return (
        '<label class="' +
        (["name", "details"].includes(k) ? "wide" : "") +
        '">' +
        label +
        input +
        "</label>"
      );
    })
    .join("");
  modal(
    (id ? "Edit " : "New ") + types[t].toLowerCase(),
    '<form id="editor" class="form-grid">' +
      inputs +
      '<div class="actions wide">' +
      (id
        ? '<button type="button" class="danger" id="remove">Delete</button>'
        : "") +
      '<button type="button" data-action="close">Cancel</button><button class="primary">Save ' +
      types[t].toLowerCase() +
      "</button></div></form>" +
      relations(t, id),
  );
  const form = $("#editor");
  form.onsubmit = (e) => {
    e.preventDefault();
    const value = Object.fromEntries(new FormData(form));
    value.name = value.name.trim();
    if (!value.name) {
      form.elements.name.focus();
      return;
    }
    if (t === "deals") value.amount = Number(value.amount);
    if (
      save(
        (next) => {
          const row = next[t].find((x) => x.id === id);
          if (row) Object.assign(row, value);
          else next[t].unshift({ ...value, id: crypto.randomUUID() });
        },
        (id ? "Updated " : "Created ") +
          types[t].toLowerCase() +
          " · " +
          value.name,
      )
    ) {
      dialog.close();
      render();
      flash("Record saved");
    }
  };
  if (id)
    $("#remove").onclick = () => {
      if (!confirm("Delete “" + r.name + "”? Linked records will be kept."))
        return;
      if (
        save(
          (next) => {
            next[t] = next[t].filter((x) => x.id !== id);
            for (const [type, defs] of Object.entries(fields))
              for (const [k, , kind] of defs)
                if (kind === t)
                  for (const row of next[type]) if (row[k] === id) row[k] = "";
          },
          "Deleted " + types[t].toLowerCase() + " · " + r.name,
        )
      ) {
        dialog.close();
        render();
        flash("Record deleted");
      }
    };
}
function globalSearch() {
  modal(
    "Search workspace",
    '<input id="global-search" type="search" placeholder="Search deals, people, companies…" aria-label="Search workspace records"><div id="matches"></div>',
  );
  const input = $("#global-search");
  function match() {
    let out = "";
    for (const t of Object.keys(types)) {
      const hits = db[t].filter((r) =>
        r.name.toLowerCase().includes(input.value.trim().toLowerCase()),
      );
      if (hits.length)
        out +=
          "<h3>" +
          labels[t] +
          "</h3>" +
          hits
            .slice(0, 12)
            .map(
              (r) =>
                '<button class="result" data-open="' +
                t +
                '" data-id="' +
                esc(r.id) +
                '">' +
                esc(r.name) +
                icon("arrow", 14) +
                "</button>",
            )
            .join("");
    }
    $("#matches").innerHTML = out || "<p>No matching records.</p>";
  }
  input.oninput = match;
  match();
  input.focus();
}
function settings() {
  $("#content").innerHTML =
    '<div class="panel"><h2>Workspace</h2><form id="settings-form"><label>Workspace name<input name="workspace" maxlength="40" required value="' +
    esc(db.workspace) +
    '"></label><button class="primary">Save changes</button></form></div><div class="panel"><h2>Backup and restore</h2><p>Download your records or restore a previously exported workspace from a JSON file.</p><button data-action="export">Export backup</button> <button data-action="import">Import backup</button><input type="file" hidden id="file" accept=".json,application/json"></div>';
  $("#settings-form").onsubmit = (e) => {
    e.preventDefault();
    const name = e.target.workspace.value.trim();
    if (name && save((n) => (n.workspace = name), "Renamed workspace")) {
      render();
      flash("Workspace updated");
    }
  };
  $("#file").onchange = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const value = JSON.parse(await f.text());
      if (!valid(value)) throw Error();
      if (confirm("Replace this workspace with the backup?")) {
        localStorage.setItem(key, JSON.stringify(value));
        db = value;
        readError = false;
        render();
        flash("Backup restored");
      }
    } catch {
      alert(
        "Could not restore this backup. Choose a valid Linear CRM JSON export.",
      );
    }
    e.target.value = "";
  };
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const a = b.dataset;
  if (a.nav) nav(a.nav);
  if (a.open) edit(a.open, a.id);
  if (a.new) edit(a.new, "", a.stage ? { stage: a.stage } : {});
  if (a.related) edit(a.related, "", { [a.field]: a.id });
  if (a.view) {
    view = a.view;
    pipeline();
  }
  if (a.action === "close") dialog.close();
  if (a.action === "menu") document.body.classList.toggle("menu-open");
  if (a.action === "search") globalSearch();
  if (a.action === "import") $("#file").click();
  if (a.action === "export") {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(db, null, 2)], { type: "application/json" }),
    );
    const el = document.createElement("a");
    el.href = url;
    el.download = "linear-crm-" + today() + ".json";
    el.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
});
document.addEventListener("change", (e) => {
  if (e.target.id === "scope") scope = e.target.value;
  else if (e.target.id === "owner") owner = e.target.value;
  else if (e.target.id === "sort") sort = e.target.value;
  else return;
  pipeline();
});
document.addEventListener("input", (e) => {
  if (e.target.id === "query") {
    query = e.target.value;
    records();
  }
});
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    globalSearch();
  }
  if (e.key === "Escape") document.body.classList.remove("menu-open");
});
document.addEventListener("dragstart", (e) => {
  const c = e.target.closest(".deal");
  if (c) e.dataTransfer.setData("text/plain", c.dataset.id);
});
document.addEventListener("dragover", (e) => {
  const lane = e.target.closest(".lane");
  if (lane) {
    e.preventDefault();
    lane.classList.add("over");
  }
});
document.addEventListener("dragleave", (e) => {
  const lane = e.target.closest(".lane");
  if (lane && !lane.contains(e.relatedTarget)) lane.classList.remove("over");
});
document.addEventListener("dragend", () =>
  document.querySelectorAll(".over").forEach((x) => x.classList.remove("over")),
);
document.addEventListener("drop", (e) => {
  const lane = e.target.closest(".lane");
  if (!lane) return;
  e.preventDefault();
  lane.classList.remove("over");
  const r = ref("deals", e.dataTransfer.getData("text/plain"));
  if (
    r &&
    r.stage !== lane.dataset.stage &&
    save(
      (n) => (n.deals.find((x) => x.id === r.id).stage = lane.dataset.stage),
      r.name + " moved to " + lane.dataset.stage,
    )
  ) {
    pipeline();
    flash("Deal moved");
  }
});
window.addEventListener("storage", (e) => {
  if (e.key === key && e.newValue) {
    try {
      const fresh = JSON.parse(e.newValue);
      if (valid(fresh)) {
        db = fresh;
        render();
      }
    } catch {}
  }
});
render();
if (readError)
  flash("Browser storage unavailable or unreadable. Showing sample data.");
