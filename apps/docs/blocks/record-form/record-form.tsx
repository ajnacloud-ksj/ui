"use client";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  NumberInput,
  Select,
  Textarea,
} from "@ajnacloud/ui";
import { ArrowLeft } from "lucide-react";
import { useId, useRef, useState } from "react";

import type { InventoryRecord } from "@/blocks/collection-page/records";
import { PageShell } from "@/blocks/page-shell/page-shell";

export interface ProductValues {
  name: string;
  sku: string;
  category: InventoryRecord["category"];
  price: number;
  stock: number;
  description: string;
}

export interface RecordFormProps {
  record?: InventoryRecord;
  onSubmit: (values: ProductValues) => void | Promise<void>;
  onCancel: () => void;
}

export function RecordForm({ record, onSubmit, onCancel }: RecordFormProps) {
  const id = useId();
  const [category, setCategory] = useState<InventoryRecord["category"]>(
    record?.category ?? "Indoor",
  );
  const [pending, setPending] = useState(false);
  const [price, setPrice] = useState<number | null>(record?.price ?? 0);
  const [stock, setStock] = useState<number | null>(record?.stock ?? 0);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const inFlight = useRef(false);

  return (
    <PageShell
      title={record ? "Edit product" : "Add product"}
      eyebrow={
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="inline-flex items-center gap-1.5 outline-none hover:text-ajna-foreground focus-visible:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Products
        </button>
      }
      description={
        record
          ? "Update product details and inventory."
          : "Add a product to your catalog."
      }
    >
      <form
        className="w-full max-w-5xl"
        aria-busy={pending}
        onReset={() => {
          setCategory(record?.category ?? "Indoor");
          setPrice(record?.price ?? 0);
          setStock(record?.stock ?? 0);
          setError("");
          setSaved(false);
        }}
        onSubmit={(event) => {
          event.preventDefault();
          if (inFlight.current) return;
          if (price === null || stock === null) {
            setError("Enter a price and stock quantity.");
            return;
          }
          const data = new FormData(event.currentTarget);
          const values: ProductValues = {
            name: String(data.get("name") ?? "").trim(),
            sku: String(data.get("sku") ?? "").trim(),
            category,
            price,
            stock,
            description: String(data.get("description") ?? "").trim(),
          };
          if (!values.name || !values.sku) {
            setError("Enter a product name and SKU.");
            return;
          }
          if (
            !Number.isFinite(values.price) ||
            values.price < 0 ||
            !Number.isSafeInteger(values.stock) ||
            values.stock < 0
          ) {
            setError(
              "Enter a valid price and a whole, non-negative stock quantity.",
            );
            return;
          }
          inFlight.current = true;
          setPending(true);
          setError("");
          setSaved(false);
          void Promise.resolve()
            .then(() => onSubmit(values))
            .then(() => setSaved(true))
            .catch((cause: unknown) =>
              setError(
                cause instanceof Error
                  ? cause.message
                  : "The product could not be saved. Try again.",
              ),
            )
            .finally(() => {
              inFlight.current = false;
              setPending(false);
            });
        }}
      >
        <fieldset
          disabled={pending}
          className="m-0 flex min-w-0 flex-col gap-6 border-0 p-0"
        >
          <legend className="sr-only">Product information</legend>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
            <Card render={<section aria-labelledby={`${id}-details-title`} />}>
              <CardHeader>
                <CardTitle
                  render={<h2 id={`${id}-details-title`}>Product details</h2>}
                />
                <CardDescription>
                  Name, identifiers, and catalog information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor={`${id}-name`} required>
                      Product name
                    </FieldLabel>
                    <Input
                      id={`${id}-name`}
                      name="name"
                      defaultValue={record?.name ?? ""}
                      required
                      maxLength={120}
                      placeholder="e.g. Monstera deliciosa"
                      autoComplete="off"
                    />
                  </Field>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field>
                      <FieldLabel htmlFor={`${id}-sku`} required>
                        SKU
                      </FieldLabel>
                      <Input
                        id={`${id}-sku`}
                        name="sku"
                        defaultValue={record?.sku ?? ""}
                        required
                        maxLength={40}
                        placeholder="PLT-001"
                        autoComplete="off"
                        aria-describedby={`${id}-sku-help`}
                      />
                      <FieldDescription id={`${id}-sku-help`}>
                        A unique identifier for your inventory.
                      </FieldDescription>
                    </Field>
                    <Field>
                      <FieldLabel htmlFor={`${id}-category`}>
                        Category
                      </FieldLabel>
                      <Select
                        id={`${id}-category`}
                        name="category"
                        disabled={pending}
                        value={category}
                        onValueChange={(value) => {
                          if (value !== null) setCategory(value);
                        }}
                        options={(
                          ["Indoor", "Outdoor", "Accessories"] as const
                        ).map((value) => ({ value, label: value }))}
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor={`${id}-description`}>
                      Description
                    </FieldLabel>
                    <Textarea
                      id={`${id}-description`}
                      name="description"
                      defaultValue={record?.description ?? ""}
                      rows={4}
                      maxLength={1000}
                      placeholder="Care notes, dimensions, or other useful details."
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
            <Card
              render={<section aria-labelledby={`${id}-inventory-title`} />}
            >
              <CardHeader>
                <CardTitle
                  render={
                    <h2 id={`${id}-inventory-title`}>Pricing and inventory</h2>
                  }
                />
                <CardDescription>
                  Set the unit price and available stock.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FieldGroup>
                  <Field>
                    <FieldLabel htmlFor={`${id}-price`} required>
                      Price (USD)
                    </FieldLabel>
                    <NumberInput
                      id={`${id}-price`}
                      name="price"
                      value={price}
                      onValueChange={setPrice}
                      min={0}
                      step={0.01}
                      format={{
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }}
                      suffix="USD"
                      required
                      disabled={pending}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor={`${id}-stock`} required>
                      Stock quantity
                    </FieldLabel>
                    <NumberInput
                      id={`${id}-stock`}
                      name="stock"
                      value={stock}
                      onValueChange={setStock}
                      min={0}
                      step={1}
                      required
                      disabled={pending}
                      showControls
                      incrementLabel="Increase stock"
                      decrementLabel="Decrease stock"
                      aria-describedby={`${id}-stock-help`}
                    />
                    <FieldDescription id={`${id}-stock-help`}>
                      Units available for sale.
                    </FieldDescription>
                  </Field>
                </FieldGroup>
              </CardContent>
            </Card>
          </div>
          {error && <FieldError role="alert">{error}</FieldError>}
          {saved && (
            <p role="status" className="text-sm text-ajna-success">
              Product saved.
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button type="reset" variant="ghost">
              Reset changes
            </Button>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" loading={pending}>
                {record ? "Save changes" : "Create product"}
              </Button>
            </div>
          </div>
        </fieldset>
      </form>
    </PageShell>
  );
}
