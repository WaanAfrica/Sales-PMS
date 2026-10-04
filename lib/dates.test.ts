import test from "node:test";
import assert from "node:assert/strict";
import { dateKeyToUtcDate, isValidDateKey } from "./dates";

test("isValidDateKey accepts valid calendar dates without timezone shifts", () => {
  assert.equal(isValidDateKey("2026-10-04"), true);
  assert.equal(
    dateKeyToUtcDate("2026-10-04").toISOString(),
    "2026-10-04T00:00:00.000Z",
  );
});

test("isValidDateKey rejects malformed and impossible calendar dates", () => {
  assert.equal(isValidDateKey("2026-02-29"), false);
  assert.equal(isValidDateKey("2026-13-01"), false);
  assert.equal(isValidDateKey("04-10-2026"), false);
  assert.equal(isValidDateKey("2026-10-4"), false);
});
