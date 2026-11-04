"use client";

import {
  InventoryScreen,
  useInventoryExample,
} from "@/blocks/collection-page/collection-page-example";

export function RecordFormExample({ edit = false }: { edit?: boolean }) {
  const inventory = useInventoryExample(edit ? "edit" : "create");
  return (
    <div className="min-h-dvh bg-ajna-background text-ajna-foreground">
      <InventoryScreen inventory={inventory} />
    </div>
  );
}
