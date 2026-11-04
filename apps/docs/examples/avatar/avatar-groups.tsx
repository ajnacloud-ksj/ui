"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@ajnacloud/ui";

export function AvatarGroups() {
  return (
    <AvatarGroup role="group" aria-label="Project members">
      <Avatar role="img" aria-label="Alex Morgan">
        <AvatarImage src="/avatars/alex.svg" alt="" />
        <AvatarFallback>AM</AvatarFallback>
      </Avatar>
      <Avatar role="img" aria-label="Sam Rivera">
        <AvatarImage src="/avatars/sam.svg" alt="" />
        <AvatarFallback>SR</AvatarFallback>
      </Avatar>
      <Avatar role="img" aria-label="Jules Chen">
        <AvatarImage src="/avatars/jules.svg" alt="" />
        <AvatarFallback>JC</AvatarFallback>
      </Avatar>
      <AvatarGroupCount role="img" aria-label="3 more members">
        +3
      </AvatarGroupCount>
    </AvatarGroup>
  );
}
