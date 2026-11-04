"use client";

import { Avatar, AvatarFallback } from "@ajnacloud/ui";
import { UserRound } from "lucide-react";

export function AvatarFallbacks() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Avatar role="img" aria-label="Alex Morgan">
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
      <Avatar role="img" aria-label="Unknown user">
        <AvatarFallback>
          <UserRound size={16} aria-hidden="true" />
        </AvatarFallback>
      </Avatar>
    </div>
  );
}
