import React, { useMemo, useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { IconDownload, IconPlus } from "@tabler/icons-react";
import { today } from "./schema";
import { download } from "./csv";

function icsEscape(value) {
  return String(value || "")
    .replaceAll("\\", "\\\\")
    .replaceAll("\n", "\\n")
    .replaceAll(",", "\\,")
    .replaceAll(";", "\\;");
}

function dateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function exportCalendar(rows, dateField, label) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Linear CRM//Portfolio//EN",
    "CALSCALE:GREGORIAN",
  ];
  const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  for (const row of rows) {
    const raw = row[dateField];
    if (!raw) continue;
    const date = String(raw).slice(0, 10).replaceAll("-", "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${row.id}@linearcrm.local`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${date}`,
      `SUMMARY:${icsEscape(row.name)}`,
      `DESCRIPTION:${icsEscape(row.details || "")}`,
      "END:VEVENT",
    );
  }
  lines.push("END:VCALENDAR");
  download(lines.join("\r\n"), "linear-crm-calendar.ics", "text/calendar;charset=utf-8");
}

export function RecordCalendar({
  rows,
  type,
  dateField,
  label,
  onOpen,
  onCreate,
}) {
  const [cursor, setCursor] = useState(() => new Date());
  const [view, setView] = useState("month");
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const week = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [cursor]);
  const blanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const day = today();

  const byDate = useMemo(() => {
    const map = new Map();
    for (const row of rows) {
      const key = String(row[dateField] || "").slice(0, 10);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    return map;
  }, [rows, dateField]);

  const agenda = useMemo(() => {
    const map = new Map();
    const dated = rows
      .filter((row) => row[dateField])
      .sort((a, b) =>
        String(a[dateField]).slice(0, 10).localeCompare(String(b[dateField]).slice(0, 10)),
      );
    for (const row of dated) {
      const key = String(row[dateField]).slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    return [...map.entries()];
  }, [rows, dateField]);

  function shift(delta) {
    if (view === "week") {
      const next = new Date(cursor);
      next.setDate(next.getDate() + delta * 7);
      setCursor(next);
      return;
    }
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <div>
          <strong>
            {view === "month"
              ? cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : view === "week"
                ? `${week[0].toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })} – ${week[6].toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`
                : "Agenda"}
          </strong>
          <small>
            {rows.length} {type} · {label(dateField)}
          </small>
        </div>
        <div className="calendar-actions">
          <span className="calendar-views" role="group" aria-label="Calendar view">
            <Button
              size="sm"
              aria-pressed={view === "month"}
              variant={view === "month" ? "outline" : "ghost"}
              onClick={() => setView("month")}
            >
              Month
            </Button>
            <Button
              size="sm"
              aria-pressed={view === "week"}
              variant={view === "week" ? "outline" : "ghost"}
              onClick={() => setView("week")}
            >
              Week
            </Button>
            <Button
              size="sm"
              aria-pressed={view === "agenda"}
              variant={view === "agenda" ? "outline" : "ghost"}
              onClick={() => setView("agenda")}
            >
              Agenda
            </Button>
          </span>
          {view !== "agenda" && (
            <>
              <Button
                size="sm"
                aria-label={view === "week" ? "Previous week" : "Previous month"}
                onClick={() => shift(-1)}
              >
                ‹
              </Button>
              <Button size="sm" onClick={() => setCursor(new Date())}>
                Today
              </Button>
              <Button
                size="sm"
                aria-label={view === "week" ? "Next week" : "Next month"}
                onClick={() => shift(1)}
              >
                ›
              </Button>
            </>
          )}
          <Button
            size="sm"
            variant="ghost"
            startIcon={<IconDownload size={14} />}
            onClick={() => exportCalendar(rows, dateField, label)}
          >
            Export .ics
          </Button>
        </div>
      </div>

      {view === "month" ? (
        <div className="calendar-grid">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((name) => (
            <small key={name} className="calendar-dow">
              {name}
            </small>
          ))}
          {Array.from({ length: blanks }, (_, index) => (
            <div key={`blank-${index}`} className="calendar-blank" />
          ))}
          {Array.from({ length: days }, (_, index) => {
            const date = [
              year,
              String(month + 1).padStart(2, "0"),
              String(index + 1).padStart(2, "0"),
            ].join("-");
            const items = byDate.get(date) || [];
            return (
              <section key={date} className={"calendar-day" + (date === day ? " today" : "")}>
                <div className="calendar-day-head">
                  <span>{index + 1}</span>
                  <button
                    type="button"
                    aria-label={`Add record on ${date}`}
                    onClick={() => onCreate(date)}
                  >
                    <IconPlus size={12} />
                  </button>
                </div>
                <div className="calendar-events">
                  {items.slice(0, 4).map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      className={`calendar-event event-${type}`}
                      onClick={() => onOpen(row)}
                      title={row.name}
                    >
                      {row.name}
                    </button>
                  ))}
                  {items.length > 4 && (
                    <small className="calendar-more">+{items.length - 4} more</small>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      ) : view === "week" ? (
        <div className="calendar-week">
          {week.map((date) => {
            const key = dateKey(date);
            const items = byDate.get(key) || [];
            return (
              <section
                key={key}
                className={"calendar-day" + (key === day ? " today" : "")}
              >
                <div className="calendar-day-head">
                  <span>
                    {date.toLocaleDateString("en-US", {
                      weekday: "short",
                      day: "numeric",
                    })}
                  </span>
                  <button
                    type="button"
                    aria-label={`Add record on ${key}`}
                    onClick={() => onCreate(key)}
                  >
                    <IconPlus size={12} />
                  </button>
                </div>
                <div className="calendar-events">
                  {items.slice(0, 8).map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      className={`calendar-event event-${type}`}
                      onClick={() => onOpen(row)}
                      title={row.name}
                    >
                      {row.name}
                    </button>
                  ))}
                  {items.length > 8 && (
                    <small className="calendar-more">+{items.length - 8} more</small>
                  )}
                  {!items.length && <small className="muted">—</small>}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="calendar-agenda">
          {!agenda.length && (
            <p className="muted">No dated records yet. Add a date to see them here.</p>
          )}
          {agenda.map(([date, items]) => (
            <section
              key={date}
              className={"agenda-day" + (date < day ? " past" : "") + (date === day ? " today" : "")}
            >
              <header>
                <strong>
                  {new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
                <small>
                  {date < day ? "Overdue · " : ""}
                  {items.length} {items.length === 1 ? "record" : "records"}
                </small>
              </header>
              {items.map((row) => (
                <button
                  key={row.id}
                  type="button"
                  className="agenda-row"
                  onClick={() => onOpen(row)}
                >
                  <span className={`agenda-dot event-${type}`} />
                  <span>{row.name}</span>
                </button>
              ))}
            </section>
          ))}
        </div>
      )}

      {rows.some((row) => !row[dateField]) && (
        <details className="calendar-unscheduled">
          <summary>
            Unscheduled ({rows.filter((row) => !row[dateField]).length})
          </summary>
          {rows
            .filter((row) => !row[dateField])
            .map((row) => (
              <button key={row.id} className="related-link" onClick={() => onOpen(row)}>
                {row.name}
              </button>
            ))}
        </details>
      )}
    </div>
  );
}
