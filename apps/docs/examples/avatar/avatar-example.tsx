"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ajnacloud/ui";

export function AvatarExample() {
  return (
    <Avatar role="img" aria-label="Alex Morgan">
      <AvatarImage src="/avatars/alex.svg" alt="" />
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  );
}
