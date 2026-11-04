"use client";

import {
  Badge,
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@ajnacloud/ui";
import { ArrowUpRight, Download } from "lucide-react";
import { useState } from "react";

import { PageShell } from "./page-shell";

export function PageShellExample() {
  const [message, setMessage] = useState("");
  return (
    <div className="min-h-dvh bg-ajna-background">
      <PageShell
        title="Workspace"
        eyebrow="Greenhouse"
        description="Team details, access, and workspace configuration."
        actions={
          <Button
            variant="secondary"
            icon={<Download />}
            onClick={() => {
              const blob = new Blob(
                [
                  JSON.stringify(
                    { workspace: "Greenhouse", plan: "Standard", members: 8 },
                    null,
                    2,
                  ),
                ],
                { type: "application/json" },
              );
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "workspace.json";
              link.click();
              URL.revokeObjectURL(url);
              setMessage("Workspace details exported.");
            }}
          >
            Export details
          </Button>
        }
      >
        <Tabs defaultValue="overview">
          <TabsList variant="underline" aria-label="Workspace sections">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="mt-6 max-w-3xl divide-y divide-ajna-border rounded-lg border border-ajna-border bg-ajna-card">
              {[
                ["Workspace name", "Greenhouse"],
                ["Region", "United States"],
                ["Created", "October 12, 2026"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="grid gap-2 p-5 text-sm sm:grid-cols-2"
                >
                  <span className="text-ajna-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="team">
            <div className="mt-6 max-w-3xl divide-y divide-ajna-border rounded-lg border border-ajna-border bg-ajna-card">
              {[
                ["Alex Rivera", "Owner"],
                ["Sam Lee", "Administrator"],
                ["Morgan Chen", "Member"],
              ].map(([name, role]) => (
                <div
                  key={name}
                  className="flex items-center justify-between p-5 text-sm"
                >
                  <span>{name}</span>
                  <Badge variant="secondary">{role}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="billing">
            <div className="mt-6 max-w-3xl rounded-lg border border-ajna-border bg-ajna-card p-6">
              <h2 className="font-medium">Standard plan</h2>
              <p className="mt-2 text-sm text-ajna-muted-foreground">
                Contact your workspace administrator to update billing.
              </p>
              <a
                href="mailto:billing@example.com"
                className="mt-5 inline-flex items-center gap-2 text-sm text-ajna-primary underline-offset-4 hover:underline"
              >
                Contact billing
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </TabsContent>
        </Tabs>
        <p role="status" className="text-sm text-ajna-success">
          {message}
        </p>
      </PageShell>
    </div>
  );
}
