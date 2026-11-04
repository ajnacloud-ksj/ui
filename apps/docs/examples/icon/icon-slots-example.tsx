"use client";

import {
  Banner,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@ajnacloud/ui";
import { Info, Search } from "lucide-react";

export function IconSlotsExample() {
  return (
    <div style={{ display: "grid", gap: 16, width: "100%" }}>
      <Banner
        icon={<Info />}
        title="Changes saved"
        description="Your project is up to date."
      />
      <InputGroup>
        <InputGroupInput
          aria-label="Search projects"
          placeholder="Search projects…"
        />
        <InputGroupAddon>
          <Search size={16} aria-hidden="true" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
