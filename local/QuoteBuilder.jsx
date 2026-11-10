import React, { useEffect, useState } from "react";
import { Button } from "twenty-ui/primitives/input";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Select } from "./Select";
import { featureEnabled, nextId, today } from "./schema";
import { formatMoney } from "./format";
import {
  lineAmount,
  lineFromProduct,
  normalizeQuoteLine,
  quoteTotals,
  validateQuoteLine,
} from "./commerce.mjs";

export function QuoteBuilder({ record, db, commit, openNew }) {
  const [lines, setLines] = useState(record.lineItems || []);

  useEffect(() => {
    setLines(record.lineItems || []);
  }, [record.id]);

  const products = db.products || [];
  const totals = quoteTotals(lines);
  const hasCost = totals.cost > 0;

  function persist(next, message) {
    const clean = next.map(normalizeQuoteLine);
    const invalid = clean.map(validateQuoteLine).find((result) => !result.ok);
    if (invalid) {
      setLines(record.lineItems || []);
      return false;
    }
    const ok = commit((state) => {
      const deal = (state.deals || []).find((row) => row.id === record.id);
      if (!deal) throw new Error("This opportunity is no longer available.");
      deal.lineItems = clean;
    }, message);
    setLines(ok ? clean : record.lineItems || []);
    return ok;
  }

  function patch(index, part) {
    setLines((current) =>
      current.map((line, position) =>
        position === index ? { ...line, ...part } : line,
      ),
    );
  }

  function addProduct(productId) {
    const product = products.find((row) => row.id === productId);
    if (!product) return;
    persist(
      [...lines, lineFromProduct(product, nextId("line"))],
      `Added ${product.name} to quote`,
    );
  }

  if (!record.id) return null;

  return (
    <section className="record-section quote-section">
      <div className="quote-head">
        <h4>Quote</h4>
        <small>
          {lines.length} line{lines.length === 1 ? "" : "s"}
        </small>
      </div>

      <div className="quote-add">
        <Select
          ariaLabel="Add product to quote"
          value=""
          placeholder="Add product…"
          options={products.map((product) => ({
            value: product.id,
            label: `${product.name} · ${formatMoney(product.unitPrice)}`,
          }))}
          onChange={addProduct}
        />
        <Button
          size="sm"
          variant="ghost"
          startIcon={<IconPlus size={14} />}
          onClick={() =>
            persist(
              [
                ...lines,
                normalizeQuoteLine({ name: "Custom line", quantity: 1 }),
              ],
              "Added quote line",
            )
          }
        >
          Custom line
        </Button>
      </div>

      {!lines.length && (
        <p className="muted">
          No quote lines yet. Add a product to price this opportunity.
        </p>
      )}

      {!!lines.length && (
        <div className="quote-table">
          <div className="quote-row quote-row-head" aria-hidden="true">
            <span>Product</span>
            <span>Description</span>
            <span>Qty</span>
            <span>Unit price</span>
            <span>Disc %</span>
            <span>Amount</span>
            <span />
          </div>
          {lines.map((line, index) => (
            <div className="quote-row" key={line.id}>
              <Select
                ariaLabel={`Product ${index + 1}`}
                value={line.productId}
                placeholder="No product"
                options={products.map((product) => ({
                  value: product.id,
                  label: product.name,
                }))}
                onChange={(productId) => {
                  const product = products.find((row) => row.id === productId);
                  if (!product) {
                    patch(index, { productId: "" });
                    return;
                  }
                  persist(
                    lines.map((row, position) =>
                      position === index
                        ? lineFromProduct(product, line.id)
                        : row,
                    ),
                    `Updated quote with ${product.name}`,
                  );
                }}
              />
              <input
                aria-label={`Description ${index + 1}`}
                value={line.name}
                onChange={(event) => patch(index, { name: event.target.value })}
                onBlur={() => persist(lines, "Updated quote line")}
              />
              <input
                aria-label={`Quantity ${index + 1}`}
                type="number"
                min="1"
                step="1"
                value={line.quantity}
                onChange={(event) =>
                  patch(index, { quantity: event.target.value })
                }
                onBlur={() => persist(lines, "Updated quote quantity")}
              />
              <input
                aria-label={`Unit price ${index + 1}`}
                type="number"
                min="0"
                step="1"
                value={line.unitPrice}
                onChange={(event) =>
                  patch(index, { unitPrice: event.target.value })
                }
                onBlur={() => persist(lines, "Updated quote price")}
              />
              <input
                aria-label={`Discount ${index + 1}`}
                type="number"
                min="0"
                max="100"
                step="1"
                value={line.discount}
                onChange={(event) =>
                  patch(index, { discount: event.target.value })
                }
                onBlur={() => persist(lines, "Updated quote discount")}
              />
              <strong>{formatMoney(lineAmount(line))}</strong>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Remove line ${index + 1}`}
                onClick={() =>
                  persist(
                    lines.filter((_, position) => position !== index),
                    "Removed quote line",
                  )
                }
              >
                <IconTrash size={14} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {!!lines.length && (
        <>
          <dl className="quote-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatMoney(totals.subtotal)}</dd>
            </div>
            {totals.discount > 0 && (
              <div>
                <dt>Discount</dt>
                <dd>−{formatMoney(totals.discount)}</dd>
              </div>
            )}
            <div className="quote-grand">
              <dt>Total</dt>
              <dd>{formatMoney(totals.total)}</dd>
            </div>
            {hasCost && (
              <div>
                <dt>Margin</dt>
                <dd>
                  {formatMoney(totals.margin)} · {totals.marginPercent}%
                </dd>
              </div>
            )}
          </dl>
          <div className="quote-actions">
            <Button
              size="sm"
              onClick={() =>
                commit((state) => {
                  const deal = (state.deals || []).find(
                    (row) => row.id === record.id,
                  );
                  if (!deal) throw new Error("This opportunity is no longer available.");
                  deal.amount = totals.total;
                }, `Set opportunity amount to ${formatMoney(totals.total)}`)
              }
            >                Use total as amount
            </Button>
            {featureEnabled(db, "invoices") && openNew && (
              <Button
                size="sm"
                variant="solid"
                onClick={() =>
                  openNew("invoices", {
                    name: `${record.name} invoice`,
                    status: "Draft",
                    amount: totals.total,
                    issueDate: today(),
                    dueDate: today(30),
                    company: record.company || "",
                    contact: record.contact || "",
                    deal: record.id,
                    owner: record.owner || "",
                    details: lines
                      .map((line) => `${line.quantity} × ${line.name}`)
                      .join("\n"),
                  })
                }
              >
                Create invoice
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
