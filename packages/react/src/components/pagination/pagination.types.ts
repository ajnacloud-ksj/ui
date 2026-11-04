import type { ComponentPropsWithoutRef, ReactNode } from "react";

import type { SelectContentProps } from "@/components/select";

export interface PaginationState {
  page: number;
  pageSize: number;
}
export interface PaginationInfoState extends PaginationState {
  start: number;
  end: number;
  totalCount: number | undefined;
  pageCount: number | undefined;
}
export interface PaginationLabels {
  navigation: string;
  firstPage: string;
  previousPage: string;
  nextPage: string;
  lastPage: string;
  pageNumber: string;
  pageSize: string;
  pageStatus: (page: number, pageCount: number | undefined) => string;
  range: (info: PaginationInfoState) => ReactNode;
}
export interface PaginationControlsProps extends Omit<
  ComponentPropsWithoutRef<"nav">,
  "children"
> {
  controls?: "full" | "simple";
  pageSelector?: "text" | "input";
}
export interface PaginationInfoProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  children?: (info: PaginationInfoState) => ReactNode;
}
export interface PaginationPageSizeProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
> {
  options?: readonly number[];
  label?: ReactNode;
  contentProps?: Omit<SelectContentProps, "ref" | "children">;
}
export type PaginationSeparatorProps = ComponentPropsWithoutRef<"div">;
export interface PaginationProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  page: number;
  pageSize?: number;
  onPaginationChange: (pagination: PaginationState) => void;
  totalCount?: number;
  hasNextPage?: boolean;
  itemCount?: number;
  disabled?: boolean;
  controls?: PaginationControlsProps["controls"];
  pageSelector?: PaginationControlsProps["pageSelector"];
  showPageSize?: boolean;
  pageSizeOptions?: readonly number[];
  labels?: Partial<PaginationLabels>;
}
