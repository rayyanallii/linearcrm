import { confirmAction, notifyUser } from "./dialogs";
import React, { useRef, useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { IconDownload, IconPlus, IconTrash, IconUpload } from "@tabler/icons-react";
import {
  collections,
} from "./store";
import {
  customFieldTypes,
  fieldDefs,
  objectDef,
} from "./schema";
import { displayValue } from "./format";
import { exportRows, parseImport } from "./csv";
import { Select } from "./Select";

export function TableOptions({
  type,
  db,
  all,
  visible,
  label,
  rows,
  commit,
  transferOnly = false,
}) {
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState("text");
  const [fieldOptions, setFieldOptions] = useState("");
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInput = useRef(null);
  const layout = db.layout?.[type] || {};
  const fields = fieldDefs(type, db);
  const customFields = (db.customFields || []).filter((field) => field.type === type);
  const relationTargets = collections(db).filter((key) => key !== type);

  function updateLayout(change) {
    commit(
      (state) => {
        state.layout ??= {};
        state.layout[type] ??= {};
        change(state.layout[type]);
      },
      `Updated ${objectDef(type, db).plural} columns`,
    );
  }

  function toggleColumn(key) {
    const nextHidden = visible.includes(key)
      ? [...new Set([...(layout.hidden || []), key])]
      : (layout.hidden || []).filter((item) => item !== key);
    updateLayout((config) => {
      config.hidden = nextHidden;
      config.order = all;
    });
  }

  function move(index, delta) {
    const order = [...all];
    const target = index + delta;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    updateLayout((config) => {
      config.order = order;
    });
  }

  function addCustomField(event) {
    event.preventDefault();
    const title = fieldName.trim();
    if (!title) return;
    if (fields.some((field) => field.label.toLowerCase() === title.toLowerCase())) {
      setMessage("Choose a unique field name.");
      return;
    }
    const isRelation = relationTargets.includes(fieldType);
    const options = fieldOptions
      .split(",")
      .map((option) => option.trim())
      .filter(Boolean);
    if (fieldType === "select" && !options.length) {
      setMessage("Add at least one option for a select field.");
      return;
    }
    if (
      commit(
        (state) => {
          state.customFields ??= [];
          state.customFields.push({
            type,
            key: `custom_${crypto.randomUUID()}`,
            title,
            kind: fieldType,
            ...(isRelation ? {} : { options }),
          });
        },
        `Added field · ${title}`,
      )
    ) {
      setFieldName("");
      setFieldOptions("");
      setMessage("Field added.");
    }
  }

  async function deleteField(field) {
    if (!await confirmAction(`Delete the field “${field.title}” and its values?`)) return;
    commit(
      (state) => {
        state.customFields = state.customFields.filter((item) => item.key !== field.key);
        for (const record of state[type] || []) delete record[field.key];
        state.layout?.[type]?.hidden &&
          (state.layout[type].hidden = state.layout[type].hidden.filter(
            (key) => key !== field.key,
          ));
      },
      `Deleted field · ${field.title}`,
    );
  }

  function saveSections(event) {
    event.preventDefault();
    const groups = Object.fromEntries(
      [...new FormData(event.currentTarget)]
        .map(([key, value]) => [key, String(value).trim()])
        .filter(([, value]) => value),
    );
    updateLayout((config) => {
      config.groups = groups;
    });
    setMessage("Record page sections saved.");
  }

  return (
    <div className="table-options">
      {!transferOnly && <>
      <section>
        <h3>Visible columns</h3>
        <p className="muted">Toggle fields and reorder them for this object.</p>
        <div className="column-list">
          {all.map((key, index) => (
            <div key={key} className="column-row">
              <label>
                <input
                  type="checkbox"
                  disabled={key === "name"}
                  checked={visible.includes(key)}
                  onChange={() => toggleColumn(key)}
                />
                {label(key)}
              </label>
              <button
                type="button"
                aria-label={`Move ${label(key)} up`}
                disabled={!index}
                onClick={() => move(index, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${label(key)} down`}
                disabled={index === all.length - 1}
                onClick={() => move(index, 1)}
              >
                ↓
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3>Add a custom field</h3>
        <form className="stack-form" onSubmit={addCustomField}>
          <label>
            Field name
            <input
              required
              maxLength={64}
              value={fieldName}
              onChange={(event) => setFieldName(event.target.value)}
              placeholder="Procurement stage"
            />
          </label>
          <label>
            Field type
            <Select
              ariaLabel="Type"
              value={fieldType}
              onChange={setFieldType}
              options={[
                ...customFieldTypes.map((type) => ({ value: type, label: type })),
                ...relationTargets.map((target) => ({
                  value: target,
                  label: `Relation · ${objectDef(target, db).plural}`,
                })),
              ]}
            />
          </label>
          {fieldType === "select" && (
            <label>
              Options (comma separated)
              <input
                value={fieldOptions}
                onChange={(event) => setFieldOptions(event.target.value)}
                placeholder="Low, Medium, High"
              />
            </label>
          )}
          <Button type="submit" size="sm" startIcon={<IconPlus size={14} />}>
            Add field
          </Button>
        </form>
      </section>

      {!!customFields.length && (
        <section>
          <h3>Custom fields</h3>
          {customFields.map((field) => (
            <div className="custom-field-row" key={field.key}>
              <span>
                <strong>{field.title}</strong>
                <small>
                  {field.kind}
                  {field.options?.length ? ` · ${field.options.join(", ")}` : ""}
                </small>
              </span>
              <Button size="sm" variant="ghost" onClick={() => deleteField(field)}>
                <IconTrash size={14} />
              </Button>
            </div>
          ))}
        </section>
      )}

      <section>
        <h3>Record page sections</h3>
        <p className="muted">
          Group fields into sections. Leave blank to use the default section.
        </p>
        <form className="section-grid" onSubmit={saveSections}>
          {fields.map((field) => (
            <label key={field.key}>
              {field.label}
              <input
                name={field.key}
                maxLength={40}
                defaultValue={layout.groups?.[field.key] || ""}
                placeholder={field.section || "General"}
              />
            </label>
          ))}
          <Button type="submit" size="sm">
            Save sections
          </Button>
        </form>
      </section>

      </>}
      <section>
        <h3>CSV transfer</h3>
        {type === "leads" && <p className="muted">Imports add raw leads only. Use Not contacted, Contacted, Replied, Interested, Not interested or Follow-up. Convert a lead when you want to track it in People and Companies. Use a JSON workspace backup to preserve converted records and their links.</p>}
        <p className="muted">
          Export the filtered rows and visible columns, or import new records from a CSV.
          Imports need a Name column and use the same field labels.
        </p>
        <div className="button-row">
          {type === "leads" && <Button size="sm" onClick={() => exportRows([], ["name", "email", "phone", "companyName", "status", "source", "owner", "details"], key => fields.find(field => field.key === key)?.label || key, () => "", "leads-template")}>Download template</Button>}
          {type === "leads" && <Button size="sm" onClick={() => {
            const keys = fields.filter(field => !field.readonly && field.type !== "computed").map(field => field.key);
            exportRows(db.leads, keys, key => fields.find(field => field.key === key)?.label || key, (row, key) => row[key] ?? "", "all-leads");
          }}>Export all leads</Button>}
          <Button
            size="sm"
            startIcon={<IconDownload size={14} />}
            onClick={() =>
              exportRows(
                rows,
                visible,
                label,
                (row, key) => displayValue(row, key, type, db),
                type,
              )
            }
          >
            Export view
          </Button>
          <Button
            size="sm"
            startIcon={<IconUpload size={14} />}
            onClick={() => fileInput.current?.click()}
          >
            Import CSV
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          hidden
          accept=".csv,text/csv"
          onChange={async (event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (!file) return;
            setPreview(null);
            try {
              const records = parseImport(await file.text(), type, db);
              setPreview(records);
              setMessage(`${records.length} records ready to import.`);
            } catch (error) {
              setMessage(error.message);
            }
          }}
        />
        {preview && (
          <div className="import-preview">
            <small>
              {preview.length} records · {preview.slice(0, 2).map((row) => row.name).join(", ")}
              {preview.length > 2 ? "…" : ""}
            </small>
            <Button
              size="sm"
              variant="solid"
              onClick={() => {
                if (
                  commit(
                    (state) => state[type].unshift(...preview),
                    `Imported ${preview.length} ${type}`,
                  )
                ) {
                  setPreview(null);
                  setMessage("Import complete.");
                }
              }}
            >
              Confirm import
            </Button>
          </div>
        )}
      </section>

      {message && <p role="status" className="options-message">{message}</p>}
    </div>
  );
}