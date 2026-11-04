"use client";

import { Card, CardContent, IconStack } from "@ajnacloud/ui";
import { Package } from "lucide-react";

export function IconStackCard() {
  return (
    <Card className="w-full max-w-sm">
      <CardContent className="flex items-center gap-3">
        <IconStack
          aria-hidden="true"
          className="h-12 w-11 shrink-0 text-ajna-primary"
        >
          <Package className="size-3 text-ajna-primary" />
        </IconStack>
        <div className="min-w-0">
          <p className="font-medium text-ajna-foreground">
            Registry package ready
          </p>
          <p className="text-ajna-muted-foreground">
            Use IconStack as media inside compact rows.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
