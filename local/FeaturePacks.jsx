import React from "react";
import { Tag } from "twenty-ui/primitives/data-display";
import { IconPackage } from "@tabler/icons-react";
import { FEATURE_PACKS, featureEnabled } from "./schema";

export function FeaturePacks({ db, commit }) {
  function toggle(pack, on) {
    commit(
      (state) => {
        state.ui ??= {};
        state.ui.features ??= {};
        state.ui.features[pack.key] = on;
      },
      `${on ? "Enabled" : "Disabled"} ${pack.label} pack`,
    );
  }

  return (
    <>
      <section className="panel-card">
        <div className="panel-heading">
          <h2>
            <IconPackage size={16} /> Feature packs
          </h2>
          <Tag color="gray">Optional</Tag>
        </div>
        <p className="muted">
          Extra collections you can add to this workspace. Packs are off by default.
          Enabling one shows its page in navigation, search, create menus and dashboard
          sources. Turning a pack off hides those surfaces but keeps every record, view
          and relationship intact.
        </p>
        <div className="feature-pack-list">
          {FEATURE_PACKS.map((pack) => {
            const on = featureEnabled(db, pack.key);
            const count = (db[pack.key] || []).length;
            return (
              <label className="feature-pack" key={pack.key}>
                <input
                  type="checkbox"
                  checked={on}
                  aria-label={`${pack.label} pack`}
                  onChange={(event) => toggle(pack, event.target.checked)}
                />
                <span className="feature-pack-copy">
                  <strong>{pack.label}</strong>
                  <small>
                    {pack.description}{" "}
                    {count} record{count === 1 ? "" : "s"} stored.
                  </small>
                </span>
                <span className="feature-pack-status">
                  <Tag color={on ? "green" : "gray"}>{on ? "Enabled" : "Off"}</Tag>
                </span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-heading">
          <h2>What a pack changes</h2>
        </div>
        <p className="muted">
          Navigation items, command-menu search and create entries, dashboard record
          sources, and relation columns that point at a packed object. Workflows, saved
          views, CSV headings and stored records stay untouched. The Emails pack adds
          the conversation log page; logging an email from a record still works while
          the pack is off. Products & quotes adds the catalogue page and the Quote
          section on opportunities. Campaigns adds the campaign builder (audience,
          sender, message, follow-ups), and Email accounts adds the SMTP sender page
          with warm-up and health that campaigns draw from.
        </p>
      </section>
    </>
  );
}
