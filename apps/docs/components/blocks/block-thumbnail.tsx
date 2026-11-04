import { AjnaLogo } from "@ajnacloud/ui";
import { LayoutGrid, Table2 } from "lucide-react";

function MiniCollection() {
  return (
    <div className="space-y-3 p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold">Products</span>
        <span className="rounded bg-fd-primary px-2 py-1 text-[8px] text-fd-primary-foreground">
          Add product
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 border-y border-fd-border py-3">
        {[
          ["Products", "24"],
          ["In stock", "18"],
          ["Low stock", "6"],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="text-[7px] text-fd-muted-foreground">{label}</div>
            <div className="mt-1 text-sm font-semibold">{value}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <div className="h-5 flex-1 rounded border border-fd-border" />
        <div className="w-14 rounded border border-fd-border" />
      </div>
      <div className="overflow-hidden rounded border border-fd-border">
        {[
          "Monstera deliciosa",
          "Ficus elastica",
          "Olive tree",
          "Golden pothos",
        ].map((name, index) => (
          <div
            key={name}
            className={`flex items-center justify-between px-2 py-2 text-[8px] ${index % 2 ? "bg-fd-muted" : ""}`}
          >
            <span>{name}</span>
            <span className="text-fd-muted-foreground">
              {[24, 18, 3, 42][index]} units
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BlockThumbnail({ slug }: { slug: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex h-72 items-center justify-center overflow-hidden bg-fd-muted p-5 sm:p-7"
    >
      {slug === "app-shell" ? (
        <div className="flex h-60 w-full overflow-hidden rounded-lg border border-fd-border bg-fd-background shadow-sm">
          <div className="w-1/4 border-e border-fd-border p-3">
            <AjnaLogo variant="glyph" color="current" width={15} />
            <div className="mt-6 space-y-3">
              {["Products", "Activity", "Settings"].map((name, index) => (
                <div
                  key={name}
                  className={`rounded px-1.5 py-1 text-[8px] ${index === 0 ? "bg-fd-accent text-fd-primary" : "text-fd-muted-foreground"}`}
                >
                  {name}
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="border-b border-fd-border px-4 py-2 text-[8px] text-fd-muted-foreground">
              Workspace / Products
            </div>
            <MiniCollection />
          </div>
        </div>
      ) : slug === "collection-page" ? (
        <div className="h-60 w-full max-w-md overflow-hidden rounded-lg border border-fd-border bg-fd-background shadow-sm">
          <MiniCollection />
        </div>
      ) : slug === "login-page" ? (
        <div className="flex h-60 w-full overflow-hidden rounded-lg border border-fd-border bg-fd-background shadow-sm">
          <div className="flex w-1/2 flex-col justify-center gap-3 p-6">
            <AjnaLogo variant="glyph" color="current" width={18} />
            <div className="mt-3 text-xs font-semibold">Welcome back.</div>
            <div className="h-5 rounded border border-fd-border" />
            <div className="h-5 rounded border border-fd-border" />
            <div className="rounded bg-fd-primary py-1.5 text-center text-[8px] text-fd-primary-foreground">
              Sign in
            </div>
          </div>
          <div className="flex w-1/2 items-center justify-center bg-ajna-brand-navy p-6 text-ajna-brand-light-blue">
            <AjnaLogo
              variant="glyph"
              color="current"
              className="w-full max-w-28"
            />
          </div>
        </div>
      ) : slug === "record-form" ? (
        <div className="h-60 w-full max-w-md space-y-4 overflow-hidden rounded-lg border border-fd-border bg-fd-background p-6 shadow-sm">
          <div className="text-xs font-semibold">Add product</div>
          <div className="text-[8px] text-fd-muted-foreground">
            Product details
          </div>
          <div className="h-6 rounded border border-fd-border" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-6 rounded border border-fd-border" />
            <div className="h-6 rounded border border-fd-border" />
          </div>
          <div className="h-12 rounded border border-fd-border" />
          <div className="flex justify-end border-t border-fd-border pt-3">
            <span className="rounded bg-fd-primary px-3 py-1.5 text-[8px] text-fd-primary-foreground">
              Create product
            </span>
          </div>
        </div>
      ) : slug === "view-switcher" ? (
        <div className="w-full max-w-sm space-y-5 rounded-lg border border-fd-border bg-fd-background p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold">Documents</span>
            <div className="inline-flex overflow-hidden rounded-md border border-fd-border">
              <span className="border-e border-fd-border bg-fd-accent p-2 text-fd-accent-foreground">
                <Table2 className="size-3.5" />
              </span>
              <span className="p-2 text-fd-muted-foreground">
                <LayoutGrid className="size-3.5" />
              </span>
            </div>
          </div>
          {["Inventory report", "Supplier directory", "Care guidelines"].map(
            (title) => (
              <div
                key={title}
                className="rounded border border-fd-border px-3 py-3 text-[9px]"
              >
                {title}
              </div>
            ),
          )}
        </div>
      ) : slug === "confirmation" ? (
        <div className="w-full max-w-xs space-y-3 rounded-xl border border-fd-border bg-fd-background p-5 shadow-sm">
          <div className="text-sm font-semibold">Delete Greenhouse?</div>
          <p className="text-[9px] leading-4 text-fd-muted-foreground">
            This permanently deletes the workspace and its data.
          </p>
          <div className="text-[8px]">Type Greenhouse to confirm</div>
          <div className="h-7 rounded border border-fd-border" />
          <div className="flex justify-end gap-2">
            <span className="rounded border border-fd-border px-3 py-1.5 text-[8px]">
              Cancel
            </span>
            <span className="rounded bg-[hsl(var(--ajna-destructive))] px-3 py-1.5 text-[8px] text-white">
              Delete workspace
            </span>
          </div>
        </div>
      ) : (
        <div className="h-60 w-full max-w-md space-y-4 overflow-hidden rounded-lg border border-fd-border bg-fd-background p-6 shadow-sm">
          <div className="flex justify-between">
            <span className="text-xs font-semibold">Workspace</span>
            <span className="rounded border border-fd-border px-2 py-1 text-[8px]">
              Export
            </span>
          </div>
          <p className="text-[8px] text-fd-muted-foreground">
            Team details, access, and configuration.
          </p>
          <div className="flex gap-4 border-b border-fd-border pb-2 text-[8px]">
            <span className="text-fd-primary">Overview</span>
            <span>Team</span>
            <span>Billing</span>
          </div>
          {[
            ["Workspace", "Greenhouse"],
            ["Region", "United States"],
            ["Created", "October 12, 2026"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex justify-between border-b border-fd-border py-2 text-[8px]"
            >
              <span className="text-fd-muted-foreground">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
