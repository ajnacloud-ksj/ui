"use client";

import { CopyButton } from "@ajnacloud/ui";
import { useState } from "react";

export function CopyButtonFeedback() {
  const [error, setError] = useState("");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <CopyButton
        value="support@example.com"
        variant="outline"
        copiedLabel="Email copied"
        resetDelay={2500}
        onCopySuccess={() => setError("")}
        onCopyError={() =>
          setError(
            "Copy was blocked. Select and copy support@example.com manually.",
          )
        }
      >
        Copy email address
      </CopyButton>
      {error && <p style={{ margin: 0 }}>{error}</p>}
    </div>
  );
}
