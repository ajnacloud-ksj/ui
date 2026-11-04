import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Field, FieldLabel } from "@/components/field";

import { RadioGroup, RadioGroupItem } from "./radio-group.js";

describe("RadioGroup", () => {
  it("selects one value through labels and submits the group's value", async () => {
    const ref = createRef<HTMLDivElement>();
    const itemRef = createRef<HTMLElement>();
    const inputRef = createRef<HTMLInputElement>();
    const { container } = render(
      <form>
        <RadioGroup ref={ref} name="plan" defaultValue="free" aria-label="Plan">
          <Field orientation="horizontal">
            <RadioGroupItem
              id="free"
              value="free"
              ref={itemRef}
              inputRef={inputRef}
            />
            <FieldLabel htmlFor="free">Free</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <RadioGroupItem id="pro" value="pro" />
            <FieldLabel htmlFor="pro">Pro</FieldLabel>
          </Field>
        </RadioGroup>
      </form>,
    );
    const free = await screen.findByRole("radio", { name: "Free" });
    const pro = screen.getByRole("radio", { name: "Pro" });
    expect(ref.current).toBe(screen.getByRole("radiogroup", { name: "Plan" }));
    expect(itemRef.current).toBe(free);
    expect(inputRef.current?.type).toBe("radio");
    expect(free.getAttribute("aria-checked")).toBe("true");
    await userEvent.click(screen.getByText("Pro"));
    expect(pro.getAttribute("aria-checked")).toBe("true");
    expect(free.getAttribute("aria-checked")).toBe("false");
    expect(new FormData(container.querySelector("form")!).get("plan")).toBe(
      "pro",
    );
  });

  it("moves selection with arrow keys and skips disabled items", async () => {
    render(
      <RadioGroup defaultValue="one" aria-label="Options">
        <RadioGroupItem value="one" aria-label="One" />
        <RadioGroupItem value="two" aria-label="Two" disabled />
        <RadioGroupItem value="three" aria-label="Three" />
      </RadioGroup>,
    );
    screen.getByRole("radio", { name: "One" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(
      screen.getByRole("radio", { name: "Three" }).getAttribute("aria-checked"),
    ).toBe("true");
    expect(document.activeElement).toBe(
      screen.getByRole("radio", { name: "Three" }),
    );
  });

  it("supports controlled values and group-level disabled and read-only states", async () => {
    function Controlled() {
      const [value, setValue] = useState(1);
      return (
        <RadioGroup
          value={value}
          onValueChange={setValue}
          aria-label="Controlled"
        >
          <RadioGroupItem value={1} aria-label="First" />
          <RadioGroupItem value={2} aria-label="Second" />
        </RadioGroup>
      );
    }
    const onChange = vi.fn();
    render(
      <>
        <Controlled />
        <RadioGroup disabled onValueChange={onChange}>
          <RadioGroupItem value="disabled" aria-label="Disabled" />
        </RadioGroup>
        <RadioGroup readOnly defaultValue="a" onValueChange={onChange}>
          <RadioGroupItem value="b" aria-label="Readonly" />
        </RadioGroup>
      </>,
    );
    await userEvent.click(screen.getByRole("radio", { name: "Second" }));
    expect(
      screen
        .getByRole("radio", { name: "Second" })
        .getAttribute("aria-checked"),
    ).toBe("true");
    await userEvent.click(screen.getByRole("radio", { name: "Disabled" }));
    await userEvent.click(screen.getByRole("radio", { name: "Readonly" }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
