"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ajnacloud/ui";

export function AvatarWithName() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Avatar aria-hidden="true">
        <AvatarImage src="/avatars/alex.svg" alt="" />
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
      <div>
        <p style={{ margin: 0, fontWeight: 500 }}>Alex Morgan</p>
        <p style={{ margin: 0, fontSize: 14 }}>Project owner</p>
      </div>
    </div>
  );
}
