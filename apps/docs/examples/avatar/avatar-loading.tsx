"use client";

import { Avatar, AvatarFallback, AvatarImage, Button } from "@ajnacloud/ui";
import { useState } from "react";

export function AvatarLoading() {
  const [missing, setMissing] = useState(false);
  const [status, setStatus] = useState("idle");
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Avatar size="lg" role="img" aria-label="Alex Morgan">
          <AvatarImage
            src={missing ? "/avatars/not-found.png" : "/avatars/alex.svg"}
            alt=""
            onLoadingStatusChange={setStatus}
          />
          <AvatarFallback delay={150}>AM</AvatarFallback>
        </Avatar>
        <span role="status">Image: {status}</span>
      </div>
      <Button variant="secondary" onClick={() => setMissing(!missing)}>
        {missing ? "Restore image" : "Use missing image"}
      </Button>
    </div>
  );
}
