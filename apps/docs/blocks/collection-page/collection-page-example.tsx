"use client";

import { useState } from "react";

import {
  type ProductValues,
  RecordForm,
} from "@/blocks/record-form/record-form";

import { CollectionPage, type CollectionPageProps } from "./collection-page";
import { type InventoryRecord, inventoryRecords } from "./records";

export function useInventoryExample(
  initial: "list" | "create" | "edit" = "list",
  initialRecords: InventoryRecord[] = inventoryRecords,
) {
  const [records, setRecords] = useState(initialRecords);
  const [editing, setEditing] = useState<InventoryRecord | null>(
    initial === "edit" ? (initialRecords[0] ?? null) : null,
  );
  const [creating, setCreating] = useState(initial === "create");
  const [message, setMessage] = useState("");

  function save(values: ProductValues) {
    if (
      records.some(
        (record) =>
          record.id !== editing?.id &&
          record.sku.toLocaleLowerCase() === values.sku.toLocaleLowerCase(),
      )
    )
      throw new Error("This SKU is already in use. Choose a unique SKU.");
    const id = editing?.id ?? crypto.randomUUID();
    const record: InventoryRecord = {
      ...values,
      id,
      status:
        editing?.status === "Archived"
          ? "Archived"
          : values.stock < 5
            ? "Low stock"
            : "Available",
    };
    setRecords((current) =>
      editing
        ? current.map((item) => (item.id === id ? record : item))
        : [record, ...current],
    );
    setMessage(editing ? `${values.name} updated.` : `${values.name} created.`);
    setEditing(null);
    setCreating(false);
  }
  function archive(ids: string[]) {
    setRecords((current) =>
      current.map((record) =>
        ids.includes(record.id) ? { ...record, status: "Archived" } : record,
      ),
    );
    setMessage(`${ids.length} products archived.`);
  }
  return {
    records,
    editing,
    creating,
    message,
    save,
    archive,
    create: () => {
      setEditing(null);
      setCreating(true);
      setMessage("");
    },
    edit: (record: InventoryRecord) => {
      setEditing(record);
      setCreating(false);
      setMessage("");
    },
    cancel: () => {
      setEditing(null);
      setCreating(false);
    },
  };
}

export function InventoryScreen({
  inventory,
  ...state
}: {
  inventory: ReturnType<typeof useInventoryExample>;
} & Pick<CollectionPageProps, "loading" | "error" | "onRetry">) {
  return (
    <>
      {inventory.message && (
        <p
          role="status"
          className="mx-auto max-w-7xl px-5 pt-5 text-sm text-ajna-success sm:px-8"
        >
          {inventory.message}
        </p>
      )}
      {inventory.creating || inventory.editing ? (
        <RecordForm
          key={inventory.editing?.id ?? "new"}
          record={inventory.editing ?? undefined}
          onSubmit={inventory.save}
          onCancel={inventory.cancel}
        />
      ) : (
        <CollectionPage
          {...state}
          records={inventory.records}
          onCreate={inventory.create}
          onEdit={inventory.edit}
          onArchive={inventory.archive}
        />
      )}
    </>
  );
}

export function CollectionPageExample({
  initialState = "ready",
}: {
  initialState?: "ready" | "loading" | "empty" | "error";
}) {
  const [state, setState] = useState(initialState);
  const inventory = useInventoryExample(
    "list",
    initialState === "empty" ? [] : inventoryRecords,
  );
  return (
    <div className="min-h-dvh bg-ajna-background text-ajna-foreground">
      <InventoryScreen
        inventory={inventory}
        loading={state === "loading"}
        error={
          state === "error"
            ? "The catalog could not be fetched. Check your connection and try again."
            : undefined
        }
        onRetry={() => setState("ready")}
      />
    </div>
  );
}
