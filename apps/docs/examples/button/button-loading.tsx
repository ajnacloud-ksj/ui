"use client";

import { Button } from "@ajnacloud/ui";
import { Save } from "lucide-react";
import { useEffect, useState } from "react";

export function ButtonLoading() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!saving) return;
    const timer = window.setTimeout(() => {
      setSaving(false);
      setMessage("Changes saved.");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [saving]);

  return (
    <div className="flex flex-col items-center gap-3">
      <Button
        variant="primary"
        icon={<Save />}
        loading={saving}
        onClick={() => {
          setMessage("");
          setSaving(true);
        }}
      >
        Save changes
      </Button>
      <p role="status" className="min-h-6 text-sm">
        {message}
      </p>
    </div>
  );
}
