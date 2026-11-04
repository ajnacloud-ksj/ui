"use client";

import { Button, toast } from "@ajnacloud/ui";
import { useState } from "react";

export function ToastPromiseExample() {
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState("No changes saved yet.");
  async function save(shouldFail: boolean) {
    setSaving(true);
    const request = new Promise<string>((resolve, reject) =>
      window.setTimeout(
        () =>
          shouldFail
            ? reject(new Error("The connection was interrupted. Try again."))
            : resolve("Website"),
        900,
      ),
    );
    try {
      const name = await toast.promise(request, {
        loading: {
          title: "Saving project",
          description: "Sending your changes…",
        },
        success: (name) => ({
          title: `${name} saved`,
          description: "Your changes are up to date.",
        }),
        error: (error) => ({
          title: "Save failed",
          description:
            error instanceof Error ? error.message : "Please try again.",
        }),
      });
      setResult(`Saved ${name}.`);
    } catch {
      setResult("The project was not saved. Try again.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <Button
          variant="secondary"
          disabled={saving}
          onClick={() => void save(false)}
        >
          Save project
        </Button>
        <Button
          variant="secondary"
          disabled={saving}
          onClick={() => void save(true)}
        >
          Simulate failed save
        </Button>
      </div>
      <span>{result}</span>
    </div>
  );
}
