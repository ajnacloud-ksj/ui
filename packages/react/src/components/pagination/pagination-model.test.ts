import { expect, it } from "vitest";

import { paginationInfo, parsePage } from "./pagination-model";

it("calculates partial, empty, and temporarily out-of-range result sets", () => {
  expect(
    paginationInfo({ page: 3, pageSize: 20, totalCount: 47 }),
  ).toMatchObject({ start: 41, end: 47, pageCount: 3 });
  expect(
    paginationInfo({ page: 1, pageSize: 20, totalCount: 0 }),
  ).toMatchObject({ start: 0, end: 0, pageCount: 1 });
  expect(
    paginationInfo({ page: 5, pageSize: 20, totalCount: 4 }),
  ).toMatchObject({ start: 0, end: 0, pageCount: 1 });
});
it("uses actual item counts for unknown totals without inventing a range", () => {
  expect(paginationInfo({ page: 3, pageSize: 20, itemCount: 7 })).toMatchObject(
    { start: 41, end: 47, pageCount: undefined },
  );
  expect(paginationInfo({ page: 3, pageSize: 20 })).toMatchObject({
    start: 0,
    end: 0,
    pageCount: undefined,
  });
});
it.each([
  "",
  " ",
  "abc",
  "2.5",
  "1e1",
  "-3",
  "12x",
  "999999999999999999999999",
])("rejects invalid page draft %j", (text) => {
  expect(parsePage(text, 50)).toBeNull();
});
it("normalizes whole-number drafts and clamps requests", () => {
  expect(parsePage(" 002 ", 50)).toBe(2);
  expect(parsePage("0", 50)).toBe(1);
  expect(parsePage("999", 50)).toBe(50);
});
it("rejects invalid data sizes rather than calculating infinite page counts", () => {
  expect(() =>
    paginationInfo({ page: 1, pageSize: 0, totalCount: 10 }),
  ).toThrow(RangeError);
  expect(() => paginationInfo({ page: 0, pageSize: 20 })).toThrow(RangeError);
  expect(() =>
    paginationInfo({ page: 1, pageSize: 20, totalCount: Infinity }),
  ).toThrow(RangeError);
});
