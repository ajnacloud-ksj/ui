"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@ajnacloud/ui";

export function AvatarLazy() {
  return (
    <Avatar role="img" aria-label="Sam Rivera">
      <AvatarImage src="/avatars/sam.svg" alt="" keepMounted loading="lazy" />
      <AvatarFallback>SR</AvatarFallback>
    </Avatar>
  );
}
