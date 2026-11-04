"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ajnacloud/ui";

export function AvatarSizes() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      {(["sm", "base", "lg"] as const).map((size) => (
        <Avatar
          key={size}
          size={size}
          role="img"
          aria-label={`Alex Morgan, ${size}`}
        >
          <AvatarImage src="/avatars/alex.svg" alt="" />
          <AvatarFallback>AM</AvatarFallback>
        </Avatar>
      ))}
    </div>
  );
}
