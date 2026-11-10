import test from "node:test";
import assert from "node:assert/strict";
import {
  lineAmount,
  lineFromProduct,
  normalizeQuoteLine,
  quoteTotals,
  validateQuoteLine,
} from "../local/commerce.mjs";

test("a line amount applies its discount", () => {
  assert.equal(lineAmount({ quantity: 3, unitPrice: 2400, discount: 10 }), 6480);
  assert.equal(lineAmount({ quantity: 1, unitPrice: 99.99, discount: 0 }), 99.99);
});

test("quote totals sum subtotal, discount, total and cost", () => {
  const totals = quoteTotals([
    { quantity: 2, unitPrice: 2400, unitCost: 480, discount: 0 },
    { quantity: 1, unitPrice: 8500, unitCost: 4200, discount: 50 },
  ]);
  assert.equal(totals.subtotal, 13300);
  assert.equal(totals.discount, 4250);
  assert.equal(totals.total, 9050);
  assert.equal(totals.cost, 5160);
  assert.equal(totals.margin, 3890);
  assert.equal(totals.marginPercent, 43);
  assert.equal(totals.count, 2);
});

test("empty quotes are worth zero and have no margin", () => {
  assert.deepEqual(quoteTotals([]), {
    count: 0,
    subtotal: 0,
    discount: 0,
    total: 0,
    cost: 0,
    margin: 0,
    marginPercent: 0,
  });
});

test("totals round to cents instead of drifting", () => {
  const totals = quoteTotals([
    { quantity: 3, unitPrice: 0.1, unitCost: 0, discount: 33.33 },
    { quantity: 3, unitPrice: 0.1, unitCost: 0, discount: 33.33 },
  ]);
  assert.equal(totals.total, 0.4);
});

test("adding a product seeds a single unit at catalogue price and cost", () => {
  const line = lineFromProduct(
    { id: "pr1", name: "Platform seats", unitPrice: 2400, unitCost: 480 },
    "line_1",
  );
  assert.equal(line.id, "line_1");
  assert.equal(line.productId, "pr1");
  assert.equal(line.quantity, 1);
  assert.equal(line.unitPrice, 2400);
  assert.equal(line.unitCost, 480);
  assert.equal(line.discount, 0);
});

test("invalid lines are rejected with a message", () => {
  assert.equal(
    validateQuoteLine(normalizeQuoteLine({ name: "", quantity: 1 })).ok,
    false,
  );
  assert.equal(
    validateQuoteLine(normalizeQuoteLine({ name: "Seat", quantity: 0 })).ok,
    false,
  );
  assert.equal(
    validateQuoteLine(normalizeQuoteLine({ name: "Seat", quantity: 1, unitPrice: -1 })).ok,
    false,
  );
  assert.equal(
    validateQuoteLine(normalizeQuoteLine({ name: "Seat", quantity: 1, discount: 140 })).ok,
    true,
  );
});

test("normalizing clamps discounts and coerces numeric strings", () => {
  const line = normalizeQuoteLine({
    name: "Seat",
    quantity: "2",
    unitPrice: "1200.555",
    discount: "120",
  });
  assert.equal(line.quantity, 2);
  assert.equal(line.unitPrice, 1200.56);
  assert.equal(line.discount, 100);
  assert.ok(line.id);
});
