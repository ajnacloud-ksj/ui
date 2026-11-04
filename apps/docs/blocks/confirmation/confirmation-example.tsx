"use client";

import {
  Badge,
  Button,
  Checkbox,
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@ajnacloud/ui";
import { Trash2 } from "lucide-react";
import { useId, useState } from "react";

import { PageShell } from "@/blocks/page-shell/page-shell";

import { ConfirmAction } from "./confirm-action";

export function ConfirmationExample() {
  const id = useId();
  const [removed, setRemoved] = useState(false);
  const [fail, setFail] = useState(false);
  return (
    <div className="min-h-dvh bg-ajna-background">
      <PageShell
        title="Workspace settings"
        description="Manage access and workspace data."
      >
        <section className="max-w-3xl rounded-xl border border-ajna-border bg-ajna-card">
          <div className="border-b border-ajna-border p-6">
            <h2 className="font-semibold">Danger zone</h2>
            <p className="mt-2 text-sm leading-6 text-ajna-muted-foreground">
              Actions that permanently change your workspace.
            </p>
          </div>
          <div className="flex flex-wrap items-start justify-between gap-5 p-6">
            <div className="max-w-md">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium">Delete workspace</h3>
                {removed && <Badge variant="secondary">Deleted</Badge>}
              </div>
              <p className="mt-2 text-sm leading-6 text-ajna-muted-foreground">
                Permanently remove Greenhouse, including its products, settings,
                and history. This action cannot be undone.
              </p>
            </div>
            {removed ? (
              <Button variant="secondary" onClick={() => setRemoved(false)}>
                Restore preview
              </Button>
            ) : (
              <ConfirmAction
                trigger={
                  <Button variant="outline" icon={<Trash2 />}>
                    Delete workspace
                  </Button>
                }
                title="Delete Greenhouse?"
                description="This permanently deletes the workspace and all associated data. Team members will lose access."
                confirmationText="Greenhouse"
                confirmLabel="Delete workspace"
                destructive
                onConfirm={() => {
                  if (fail)
                    throw new Error(
                      "The workspace could not be deleted. Try again.",
                    );
                  setRemoved(true);
                }}
              />
            )}
          </div>
        </section>
        <Field orientation="horizontal" className="max-w-lg">
          <Checkbox id={id} checked={fail} onCheckedChange={setFail} />
          <FieldContent>
            <FieldLabel htmlFor={id}>Preview an action failure</FieldLabel>
            <FieldDescription>
              The confirmation stays open with an error.
            </FieldDescription>
          </FieldContent>
        </Field>
      </PageShell>
    </div>
  );
}
