import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion.js";

function Items() {
  return (
    <>
      <AccordionItem value="one">
        <AccordionTrigger>First section</AccordionTrigger>
        <AccordionContent>First answer</AccordionContent>
      </AccordionItem>
      <AccordionItem value="two">
        <AccordionTrigger>Second section</AccordionTrigger>
        <AccordionContent>Second answer</AccordionContent>
      </AccordionItem>
    </>
  );
}
describe("Accordion", () => {
  it("coordinates a single expanded panel and heading/trigger associations", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Accordion ref={ref} defaultValue={["one"]}>
        <Items />
      </Accordion>,
    );
    const first = screen.getByRole("button", { name: "First section" });
    const second = screen.getByRole("button", { name: "Second section" });
    expect(screen.getByRole("heading", { name: "First section" }).tagName).toBe(
      "H3",
    );
    expect(first.getAttribute("aria-expanded")).toBe("true");
    await userEvent.click(second);
    expect(first.getAttribute("aria-expanded")).toBe("false");
    expect(second.getAttribute("aria-expanded")).toBe("true");
    expect(
      document.getElementById(second.getAttribute("aria-controls")!)
        ?.textContent,
    ).toBe("Second answer");
    expect(ref.current?.contains(second)).toBe(true);
  });
  it("supports controlled multiple selection and keyboard activation", async () => {
    function Example() {
      const [value, setValue] = useState<string[]>([]);
      return (
        <Accordion multiple value={value} onValueChange={setValue}>
          <Items />
        </Accordion>
      );
    }
    render(<Example />);
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    await userEvent.tab();
    await userEvent.keyboard(" ");
    for (const trigger of screen.getAllByRole("button"))
      expect(trigger.getAttribute("aria-expanded")).toBe("true");
  });
  it("does not activate a disabled item", async () => {
    const onValueChange = vi.fn();
    render(
      <Accordion onValueChange={onValueChange}>
        <AccordionItem disabled value="one">
          <AccordionTrigger>Disabled section</AccordionTrigger>
          <AccordionContent>Answer</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
