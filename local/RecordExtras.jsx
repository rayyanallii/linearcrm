import React, { useState } from "react";
import { Button } from "twenty-ui/primitives/input";
export function RecordExtras({ type, id, db, commit }) {
  const [error, setError] = useState("");
  const files = (db.files || []).filter(
    (f) => f.type === type && f.record === id,
  );
  async function attach(file) {
    if (!file) return;
    setError("");
    if (file.size > 1024 * 1024) {
      setError("Choose a file under 1 MB for browser storage.");
      return;
    }
    try {
      const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      commit(
        (n) =>
          (n.files ??= []).push({
            id: crypto.randomUUID(),
            record: id,
            type,
            name: file.name,
            data,
          }),
        "Attached " + file.name,
      );
    } catch {
      setError("Could not read the file.");
    }
  }
  return (
    <section className="record-extras">
      <h3>Files</h3>
      {files.map((f) => (
        <div key={f.id}>
          <a
            download={f.name}
            href={"data:application/octet-stream;base64," + f.data}
          >
            {f.name}
          </a>
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              commit(
                (n) => (n.files = n.files.filter((x) => x.id !== f.id)),
                "Removed attachment · " + f.name,
              )
            }
          >
            Remove
          </Button>
        </div>
      ))}
      <label>
        Attach file (up to 1 MB)
        <input
          type="file"
          onChange={(e) => {
            attach(e.target.files[0]);
            e.target.value = "";
          }}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <h3>Record activity</h3>
      {db.activity
        .filter((a) => a.changes?.some((c) => c.type === type && c.id === id))
        .slice(0, 15)
        .map((a, i) => (
          <p key={i}>
            {a.text} <small>{new Date(a.at).toLocaleDateString()}</small>
          </p>
        ))}
      {!db.activity.some((a) =>
        a.changes?.some((c) => c.type === type && c.id === id),
      ) && <small>Changes to this record will appear here.</small>}
    </section>
  );
}
