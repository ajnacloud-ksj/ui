"use client";

import {
  ActionBar,
  ActionBarClose,
  ActionBarGroup,
  ActionBarItem,
  ActionBarSelection,
  ActionBarSeparator,
  Badge,
  Button,
  Checkbox,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
  FilterBar,
  Pagination,
  type PaginationState,
  Skeleton,
  Table,
  type TableSortDirection,
} from "@ajnacloud/ui";
import { Archive, Leaf, Pencil, Plus, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";

import { ConfirmAction } from "@/blocks/confirmation/confirm-action";
import { PageShell } from "@/blocks/page-shell/page-shell";
import {
  ViewSwitcher,
  type ViewSwitcherValue,
} from "@/blocks/view-switcher/view-switcher";

import { formatPrice, type InventoryRecord } from "./records";

interface Filters {
  status: string | null;
  category: string[];
  archived: boolean;
}
const resetFilters: Filters = { status: null, category: [], archived: false };

export interface CollectionPageProps {
  records: readonly InventoryRecord[];
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  onCreate: () => void;
  onEdit: (record: InventoryRecord) => void;
  onArchive: (ids: string[]) => void | Promise<void>;
}

export function CollectionPage({
  records,
  loading = false,
  error,
  onRetry,
  onCreate,
  onEdit,
  onArchive,
}: CollectionPageProps) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(resetFilters);
  const [view, setView] = useState<ViewSwitcherValue>("table");
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: 6,
  });
  const [sort, setSort] = useState<{
    key: "name" | "stock" | "price";
    direction: TableSortDirection;
  }>({ key: "name", direction: "asc" });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const selectedIds = records
    .filter((record) => selected.has(record.id))
    .map((record) => record.id);
  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const rows = records.filter(
      (record) =>
        (filters.archived || record.status !== "Archived") &&
        (!filters.status || record.status === filters.status) &&
        (!filters.category.length ||
          filters.category.includes(record.category)) &&
        (!query ||
          `${record.name} ${record.sku}`.toLocaleLowerCase().includes(query)),
    );
    if (!sort.direction) return rows;
    return [...rows].sort((a, b) => {
      const compared =
        sort.key === "name"
          ? a.name.localeCompare(b.name)
          : a[sort.key] - b[sort.key];
      return sort.direction === "asc" ? compared : -compared;
    });
  }, [records, search, filters, sort]);
  const pageCount = Math.max(
    1,
    Math.ceil(filtered.length / pagination.pageSize),
  );
  const page = Math.min(pagination.page, pageCount);
  const rows = filtered.slice(
    (page - 1) * pagination.pageSize,
    page * pagination.pageSize,
  );
  const allSelected =
    rows.length > 0 && rows.every((record) => selected.has(record.id));
  const someSelected = rows.some((record) => selected.has(record.id));
  const activeFilters =
    search.trim() ||
    filters.status ||
    filters.category.length ||
    filters.archived;

  function toggle(id: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }
  function updateFilters(next: Filters) {
    setFilters(next);
    setPagination((current) => ({ ...current, page: 1 }));
    setSelected(new Set());
  }
  function reset() {
    setSearch("");
    updateFilters(resetFilters);
  }
  async function archiveSelected() {
    await onArchive(selectedIds);
    setSelected(new Set());
  }

  return (
    <PageShell
      title="Products"
      count={records.filter((record) => record.status !== "Archived").length}
      description="Manage your catalog, stock levels, and availability."
      actions={
        <Button variant="primary" icon={<Plus />} onClick={onCreate}>
          Add product
        </Button>
      }
    >
      <div className="grid grid-cols-3 divide-x divide-ajna-border border-y border-ajna-border py-5">
        {[
          {
            label: "Products",
            count: records.filter((record) => record.status !== "Archived")
              .length,
            choose: reset,
          },
          {
            label: "In stock",
            count: records.filter((record) => record.status === "Available")
              .length,
            choose: () =>
              updateFilters({ ...resetFilters, status: "Available" }),
          },
          {
            label: "Low stock",
            count: records.filter((record) => record.status === "Low stock")
              .length,
            choose: () =>
              updateFilters({ ...resetFilters, status: "Low stock" }),
          },
        ].map((stat) => (
          <button
            key={stat.label}
            type="button"
            onClick={stat.choose}
            className="group px-4 text-start outline-none first:ps-0 focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ajna-ring sm:px-6"
          >
            <span className="block text-xs text-ajna-muted-foreground group-hover:text-ajna-foreground">
              {stat.label}
            </span>
            <span className="mt-2 block text-2xl font-semibold tracking-tight tabular-nums">
              {stat.count}
            </span>
          </button>
        ))}
      </div>
      <FilterBar
        value={filters}
        resetValue={resetFilters}
        onValueChange={updateFilters}
        search={{
          value: search,
          onValueChange: (value) => {
            setSearch(value);
            setPagination((current) => ({ ...current, page: 1 }));
            setSelected(new Set());
          },
          placeholder: "Search products…",
          "aria-label": "Search products",
        }}
        filters={[
          {
            id: "status",
            type: "select",
            label: "Status",
            options: ["Available", "Low stock"].map((label) => ({
              label,
              value: label,
            })),
          },
          {
            id: "category",
            type: "multi-select",
            label: "Category",
            options: ["Indoor", "Outdoor", "Accessories"].map((label) => ({
              label,
              value: label,
            })),
          },
          {
            id: "archived",
            type: "toggle",
            label: "Include archived",
            icon: <Archive />,
          },
        ]}
        actions={
          <ViewSwitcher
            value={view}
            onValueChange={setView}
            aria-label="Product view"
          />
        }
      />
      {error ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Products could not load</EmptyTitle>
            <EmptyDescription>{error}</EmptyDescription>
          </EmptyHeader>
          {onRetry && (
            <EmptyContent>
              <Button
                variant="secondary"
                onClick={onRetry}
                icon={<RotateCcw />}
              >
                Try again
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : loading ? (
        <div role="status" aria-label="Loading products" className="space-y-3">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : !rows.length ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>
              {activeFilters
                ? "No matching products"
                : "Your catalog starts here"}
            </EmptyTitle>
            <EmptyDescription>
              {activeFilters
                ? "Try another search or clear your filters."
                : "Add your first product to start tracking inventory."}
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              variant={activeFilters ? "secondary" : "primary"}
              onClick={activeFilters ? reset : onCreate}
            >
              {activeFilters ? "Clear filters" : "Add product"}
            </Button>
          </EmptyContent>
        </Empty>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((record) => (
            <article
              key={record.id}
              className="overflow-hidden rounded-xl border border-ajna-border bg-ajna-card"
            >
              <div className="relative flex h-32 items-center justify-center bg-ajna-muted">
                <Leaf
                  aria-hidden="true"
                  className="size-14 text-ajna-muted-foreground"
                />
                <Checkbox
                  checked={selected.has(record.id)}
                  onCheckedChange={(checked) => toggle(record.id, checked)}
                  aria-label={`Select ${record.name}`}
                  className="absolute start-4 top-4"
                />
              </div>
              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="text-start text-sm font-medium outline-none hover:underline focus-visible:underline"
                    >
                      {record.name}
                    </button>
                    <p className="mt-1 text-xs text-ajna-muted-foreground">
                      {record.sku} · {record.category}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    shape="square"
                    aria-label={`Edit ${record.name}`}
                    icon={<Pencil />}
                    onClick={() => onEdit(record)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <Badge
                    variant={
                      record.status === "Low stock"
                        ? "warning"
                        : record.status === "Archived"
                          ? "secondary"
                          : "success"
                    }
                  >
                    {record.status}
                  </Badge>
                  <span className="text-sm font-medium tabular-nums">
                    {formatPrice(record.price)}
                  </span>
                </div>
                <p className="text-xs text-ajna-muted-foreground">
                  {record.stock} units in stock
                </p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-ajna-border">
          <Table aria-label="Products">
            <Table.Header variant="compact">
              <Table.Row>
                <Table.CheckHead
                  label="Select products on this page"
                  checked={allSelected}
                  indeterminate={someSelected && !allSelected}
                  onCheckedChange={(checked) =>
                    setSelected((current) => {
                      const next = new Set(current);
                      rows.forEach((record) => {
                        if (checked) next.add(record.id);
                        else next.delete(record.id);
                      });
                      return next;
                    })
                  }
                />
                <Table.SortHead
                  sortDirection={sort.key === "name" ? sort.direction : false}
                  onSortChange={(direction) =>
                    setSort({ key: "name", direction })
                  }
                >
                  Product
                </Table.SortHead>
                <Table.Head>Category</Table.Head>
                <Table.Head>Status</Table.Head>
                <Table.SortHead
                  sortDirection={sort.key === "stock" ? sort.direction : false}
                  onSortChange={(direction) =>
                    setSort({ key: "stock", direction })
                  }
                >
                  Stock
                </Table.SortHead>
                <Table.SortHead
                  sortDirection={sort.key === "price" ? sort.direction : false}
                  onSortChange={(direction) =>
                    setSort({ key: "price", direction })
                  }
                >
                  Price
                </Table.SortHead>
                <Table.Head>
                  <span className="sr-only">Actions</span>
                </Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {rows.map((record) => (
                <Table.Row
                  key={record.id}
                  variant={selected.has(record.id) ? "selected" : "default"}
                >
                  <Table.CheckCell
                    label={`Select ${record.name}`}
                    checked={selected.has(record.id)}
                    onCheckedChange={(checked) => toggle(record.id, checked)}
                  />
                  <Table.Cell>
                    <button
                      type="button"
                      onClick={() => onEdit(record)}
                      className="text-start font-medium outline-none hover:underline focus-visible:underline"
                    >
                      {record.name}
                    </button>
                    <p className="mt-1 text-xs text-ajna-muted-foreground">
                      {record.sku}
                    </p>
                  </Table.Cell>
                  <Table.Cell>{record.category}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      variant={
                        record.status === "Low stock"
                          ? "warning"
                          : record.status === "Archived"
                            ? "secondary"
                            : "success"
                      }
                    >
                      {record.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{record.stock}</Table.Cell>
                  <Table.Cell>{formatPrice(record.price)}</Table.Cell>
                  <Table.Cell>
                    <Button
                      variant="ghost"
                      size="sm"
                      shape="square"
                      aria-label={`Edit ${record.name}`}
                      icon={<Pencil />}
                      onClick={() => onEdit(record)}
                    />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      )}
      {!loading && !error && filtered.length > 0 && (
        <Pagination
          page={page}
          pageSize={pagination.pageSize}
          totalCount={filtered.length}
          onPaginationChange={setPagination}
          showPageSize
          pageSizeOptions={[6, 12, 24]}
        />
      )}
      <ActionBar
        open={selectedIds.length > 0}
        onOpenChange={(next) => {
          if (!next) setSelected(new Set());
        }}
        aria-label="Selected product actions"
      >
        <ActionBarSelection>{selectedIds.length} selected</ActionBarSelection>
        <ActionBarSeparator />
        <ActionBarGroup aria-label="Bulk actions">
          <ConfirmAction
            trigger={<ActionBarItem>Archive products</ActionBarItem>}
            title={`Archive ${selectedIds.length} ${selectedIds.length === 1 ? "product" : "products"}?`}
            description="Archived products leave your active catalog. You can include them again using filters."
            confirmLabel="Archive products"
            onConfirm={archiveSelected}
          />
        </ActionBarGroup>
        <ActionBarClose aria-label="Clear product selection" />
      </ActionBar>
      {selectedIds.length > 0 && <div aria-hidden="true" className="h-16" />}
    </PageShell>
  );
}
