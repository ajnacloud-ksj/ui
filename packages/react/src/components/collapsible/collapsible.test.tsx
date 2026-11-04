import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/button";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible.js";

describe("Collapsible", () => {
  it("composes a Button, associates its panel, and toggles by keyboard", async () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Collapsible>
        <CollapsibleTrigger ref={ref} render={<Button />}>
          Project details
        </CollapsibleTrigger>
        <CollapsibleContent>Additional settings</CollapsibleContent>
      </Collapsible>,
    );
    const trigger = screen.getByRole("button", { name: "Project details" });
    expect(ref.current).toBe(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(
      document.getElementById(trigger.getAttribute("aria-controls")!)
        ?.textContent,
    ).toBe("Additional settings");
  });
  it("supports controlled state and prevents disabled activation", async () => {
    const onOpenChange = vi.fn();
    function Controlled() {
      const [open, setOpen] = useState(false);
      return (
        <Collapsible open={open} onOpenChange={setOpen}>
          <CollapsibleTrigger>Controlled</CollapsibleTrigger>
          <CollapsibleContent>Details</CollapsibleContent>
        </Collapsible>
      );
    }
    render(
      <>
        <Controlled />
        <Collapsible disabled onOpenChange={onOpenChange}>
          <CollapsibleTrigger>Disabled</CollapsibleTrigger>
          <CollapsibleContent>Disabled content</CollapsibleContent>
        </Collapsible>
      </>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Controlled" }));
    expect(
      screen
        .getByRole("button", { name: "Controlled" })
        .getAttribute("aria-expanded"),
    ).toBe("true");
    await userEvent.click(screen.getByRole("button", { name: "Disabled" }));
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
