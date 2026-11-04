"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ajnacloud/ui";

export function AvatarCustomShape() {
  return (
    <Avatar
      style={{ width: 48, height: 48, borderRadius: 12 }}
      role="img"
      aria-label="Alex Morgan"
    >
      <AvatarImage src="/avatars/alex.svg" alt="" />
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  );
}
