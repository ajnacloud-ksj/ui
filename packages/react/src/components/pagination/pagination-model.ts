import type { PaginationInfoState, PaginationState } from "./pagination.types";

export function validateCount(value: number, name: string, minimum = 0) {
  if (!Number.isSafeInteger(value) || value < minimum)
    throw new RangeError(
      `Pagination ${name} must be a safe integer greater than or equal to ${minimum}.`,
    );
}

export function paginationInfo({
  page,
  pageSize,
  totalCount,
  itemCount,
}: PaginationState & {
  totalCount?: number;
  itemCount?: number;
}): PaginationInfoState {
  validateCount(page, "page", 1);
  validateCount(pageSize, "pageSize", 1);
  if (totalCount !== undefined) validateCount(totalCount, "totalCount");
  if (itemCount !== undefined) validateCount(itemCount, "itemCount");
  const pageCount =
    totalCount === undefined
      ? undefined
      : Math.max(1, Math.ceil(totalCount / pageSize));
  const offset = (page - 1) * pageSize;
  const available =
    totalCount === undefined
      ? itemCount
      : Math.min(
          pageSize,
          Math.max(0, totalCount - offset),
          itemCount ?? pageSize,
        );
  const count = available === undefined ? 0 : Math.min(available, pageSize);
  return {
    page,
    pageSize,
    totalCount,
    pageCount,
    start: count > 0 ? offset + 1 : 0,
    end: count > 0 ? offset + count : 0,
  };
}

export function requestedPage(page: number, pageCount: number | undefined) {
  return Math.max(1, Math.min(page, pageCount ?? Number.MAX_SAFE_INTEGER));
}

export function parsePage(text: string, pageCount: number) {
  const value = text.trim();
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) return null;
  return requestedPage(Number(value), pageCount);
}
