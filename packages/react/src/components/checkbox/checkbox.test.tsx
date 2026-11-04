import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/field";

import { Checkbox } from "./checkbox.js";

describe("Checkbox", () => {
  it("supports label activation, keyboard interaction, and refs to both elements", async () => {
    const ref = createRef<HTMLElement>();
    const inputRef = createRef<HTMLInputElement>();
    const onCheckedChange = vi.fn();
    render(
      <Field orientation="horizontal">
        <Checkbox
          ref={ref}
          inputRef={inputRef}
          id="terms"
          onCheckedChange={onCheckedChange}
          aria-describedby="terms-help"
        />
        <FieldContent>
          <FieldLabel htmlFor="terms">Accept terms</FieldLabel>
          <FieldDescription id="terms-help">
            Read the agreement first.
          </FieldDescription>
        </FieldContent>
      </Field>,
    );
    const checkbox = await screen.findByRole("checkbox", {
      name: "Accept terms",
    });
    expect(ref.current).toBe(checkbox);
    expect(inputRef.current?.type).toBe("checkbox");
    await userEvent.click(screen.getByText("Accept terms"));
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange.mock.lastCall?.[0]).toBe(true);
    expect(checkbox.querySelector("svg")).not.toBeNull();
    checkbox.focus();
    await userEvent.keyboard(" ");
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
  });

  it("preserves controlled and indeterminate states", async () => {
    function Controlled() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          aria-label="Controlled"
          checked={checked}
          onCheckedChange={setChecked}
          className={(state) => (state.checked ? "border-2" : undefined)}
        />
      );
    }
    render(
      <>
        <Controlled />
        <Checkbox aria-label="Mixed" indeterminate />
      </>,
    );
    const mixed = screen.getByRole("checkbox", { name: "Mixed" });
    expect(mixed.getAttribute("aria-checked")).toBe("mixed");
    expect(mixed.querySelector("svg")).not.toBeNull();
    const checkbox = screen.getByRole("checkbox", { name: "Controlled" });
    await userEvent.click(checkbox);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(checkbox.classList.contains("border-2")).toBe(true);
  });

  it("prevents changes when disabled or read-only", async () => {
    const onCheckedChange = vi.fn();
    render(
      <>
        <Checkbox
          aria-label="Disabled"
          disabled
          onCheckedChange={onCheckedChange}
        />
        <Checkbox
          aria-label="Read only"
          readOnly
          defaultChecked
          onCheckedChange={onCheckedChange}
        />
      </>,
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Disabled" }));
    await userEvent.click(screen.getByRole("checkbox", { name: "Read only" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(
      screen
        .getByRole("checkbox", { name: "Read only" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("submits values through Base UI's hidden input", async () => {
    const { container } = render(
      <form>
        <Checkbox aria-label="Newsletter" name="newsletter" value="yes" />
        <Checkbox
          aria-label="Disabled"
          name="disabled"
          defaultChecked
          disabled
        />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(new FormData(form).has("newsletter")).toBe(false);
    await userEvent.click(screen.getByRole("checkbox", { name: "Newsletter" }));
    expect(new FormData(form).get("newsletter")).toBe("yes");
    expect(new FormData(form).has("disabled")).toBe(false);
  });

  it("supports wrapping choice labels without nested labels", async () => {
    render(
      <FieldLabel>
        <Field orientation="horizontal">
          <Checkbox name="backup" />
          <FieldContent>
            <FieldTitle>Keep a backup</FieldTitle>
            <FieldDescription>Save a project copy.</FieldDescription>
          </FieldContent>
        </Field>
      </FieldLabel>,
    );
    const checkbox = await screen.findByRole("checkbox", {
      name: /Keep a backup/,
    });
    await userEvent.click(screen.getByText("Keep a backup"));
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
  });
});
