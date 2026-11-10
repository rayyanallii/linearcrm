/*
 * Quote maths for the optional Products pack. All money is USD and rounded to
 * cents so stored totals never drift from what the drawer shows.
 */

const round = (value) => Math.round((Number(value) || 0) * 100) / 100;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function normalizeQuoteLine(line = {}) {
  return {
    id: line.id || `line_${Math.random().toString(36).slice(2, 10)}`,
    productId: line.productId || "",
    name: String(line.name || ""),
    quantity: Number(line.quantity) || 0,
    unitPrice: round(line.unitPrice),
    unitCost: round(line.unitCost),
    discount: clamp(Number(line.discount) || 0, 0, 100),
  };
}

export function lineFromProduct(product, id) {
  return normalizeQuoteLine({
    id,
    productId: product.id,
    name: product.name,
    quantity: 1,
    unitPrice: product.unitPrice,
    unitCost: product.unitCost,
  });
}

export function lineAmount(line) {
  const gross = (Number(line?.quantity) || 0) * (Number(line?.unitPrice) || 0);
  return round(gross - gross * ((Number(line?.discount) || 0) / 100));
}

export function quoteTotals(lines = []) {
  let subtotal = 0;
  let discount = 0;
  let total = 0;
  let cost = 0;

  for (const line of lines) {
    const quantity = Number(line.quantity) || 0;
    const gross = quantity * (Number(line.unitPrice) || 0);
    const net = lineAmount(line);
    subtotal += gross;
    discount += gross - net;
    total += net;
    cost += quantity * (Number(line.unitCost) || 0);
  }

  const margin = total - cost;
  return {
    count: lines.length,
    subtotal: round(subtotal),
    discount: round(discount),
    total: round(total),
    cost: round(cost),
    margin: round(margin),
    marginPercent: total ? Math.round((margin / total) * 1000) / 10 : 0,
  };
}

export function validateQuoteLine(line) {
  if (!line.name.trim()) {
    return { ok: false, error: "Add a description to every quote line." };
  }
  if (!(Number(line.quantity) > 0)) {
    return { ok: false, error: "Quantities must be greater than zero." };
  }
  if (Number(line.unitPrice) < 0) {
    return { ok: false, error: "Unit prices cannot be negative." };
  }
  if (Number(line.discount) < 0 || Number(line.discount) > 100) {
    return { ok: false, error: "Discounts must be between 0 and 100." };
  }
  return { ok: true, error: "" };
}

export function quoteSummary(lines = []) {
  const totals = quoteTotals(lines);
  if (!totals.count) return "No quote lines";
  return `${totals.count} line${totals.count === 1 ? "" : "s"} · ${totals.total.toFixed(2)}`;
}
