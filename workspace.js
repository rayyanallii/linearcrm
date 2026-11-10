paths.workflows = "M5 3h6v6H5z M14 15h6v6h-6z M8 9v7h6";
let month = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
function calendar() {
  const year = month.getFullYear(),
    m = month.getMonth(),
    days = new Date(year, m + 1, 0).getDate(),
    start = (month.getDay() + 6) % 7;
  const items = [
    ...db.tasks.map((r) => ({ ...r, type: "tasks" })),
    ...openDeals().map((r) => ({ ...r, type: "deals" })),
  ];
  let cells = '<div class="day blank"></div>'.repeat(start);
  for (let i = 1; i <= days; i++) {
    const dt = [
      year,
      String(m + 1).padStart(2, "0"),
      String(i).padStart(2, "0"),
    ].join("-");
    cells +=
      '<div class="day"><b class="' +
      (dt === today() ? "current" : "") +
      '">' +
      i +
      "</b>" +
      items
        .filter((r) => r.date === dt)
        .map(
          (r) =>
            '<button class="event ' +
            r.type +
            '" data-open="' +
            r.type +
            '" data-id="' +
            esc(r.id) +
            '">' +
            esc(r.name) +
            "</button>",
        )
        .join("") +
      "</div>";
  }
  $("#content").innerHTML =
    '<section class="panel"><div class="section-heading"><h2>' +
    month.toLocaleDateString("en-US", { month: "long", year: "numeric" }) +
    '</h2><div><button aria-label="Previous month" data-month="-1">‹</button><button data-month="0">Today</button><button aria-label="Next month" data-month="1">›</button></div></div><div class="cal-scroll"><div class="calendar">' +
    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      .map((s) => "<strong>" + s + "</strong>")
      .join("") +
    cells +
    "</div></div></section>";
}
function workflows() {
  const rules = db.rules || [];
  $("#content").innerHTML =
    '<div class="panel"><h2>Stage follow-ups</h2><p>Automatically create a task when a deal enters a stage. The task inherits the deal owner.</p><form class="form-grid" id="rule"><label>When a deal enters<select name="stage">' +
    options(stages) +
    '</select></label><label>Due in days<input type="number" name="delay" min="0" max="365" value="1" required></label><label class="wide">Create a task named<input name="title" required maxlength="150" placeholder="Follow up on proposal"></label><div><button class="primary">Add workflow</button></div></form></div><section class="panel"><h2>Active workflows</h2>' +
    (rules
      .map(
        (r) =>
          '<div class="log"><span>' +
          esc(r.stage) +
          " → " +
          esc(r.title) +
          " (" +
          esc(r.delay) +
          ' days)</span><button data-remove-rule="' +
          esc(r.id) +
          '">Remove</button></div>',
      )
      .join("") || "<p>No active workflows.</p>") +
    "</section>";
  $("#rule").onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    if (!data.title.trim()) return;
    if (
      save(
        (n) => (n.rules ??= []).push({ ...data, id: crypto.randomUUID() }),
        "Added workflow · " + data.title,
      )
    ) {
      workflows();
      flash("Workflow added");
    }
  };
}
function stageRules(next, old) {
  for (const deal of next.deals) {
    if (old.deals.find((d) => d.id === deal.id)?.stage === deal.stage) continue;
    for (const rule of (next.rules || []).filter((r) => r.stage === deal.stage))
      next.tasks.unshift({
        id: crypto.randomUUID(),
        name: rule.title,
        deal: deal.id,
        owner: deal.owner,
        date: today(Number(rule.delay)),
        status: "Open",
        details: "",
      });
  }
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.hasAttribute("data-month")) {
    const shift = Number(b.dataset.month);
    month = shift
      ? new Date(month.getFullYear(), month.getMonth() + shift, 1)
      : new Date();
    calendar();
  }
  if (
    b.dataset.removeRule &&
    save(
      (n) => (n.rules = n.rules.filter((r) => r.id !== b.dataset.removeRule)),
      "Removed workflow",
    )
  )
    workflows();
});
