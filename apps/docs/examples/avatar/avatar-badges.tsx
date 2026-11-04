"use client";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@ajnacloud/ui";
import { Check } from "lucide-react";

export function AvatarBadges() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Avatar size="lg" role="img" aria-label="Alex Morgan, available">
        <AvatarImage src="/avatars/alex.svg" alt="" />
        <AvatarFallback>AM</AvatarFallback>
        <AvatarBadge aria-hidden="true" />
      </Avatar>
      <Avatar size="lg" role="img" aria-label="Sam Rivera, verified">
        <AvatarImage src="/avatars/sam.svg" alt="" />
        <AvatarFallback>SR</AvatarFallback>
        <AvatarBadge
          style={{
            backgroundColor: "hsl(var(--ajna-primary))",
            color: "hsl(var(--ajna-primary-foreground))",
          }}
          aria-hidden="true"
        >
          <Check aria-hidden="true" />
        </AvatarBadge>
      </Avatar>
    </div>
  );
}
