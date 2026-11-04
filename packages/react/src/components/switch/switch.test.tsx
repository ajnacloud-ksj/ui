import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Field, FieldLabel } from "@/components/field";

import { Switch } from "./switch.js";

describe("Switch", () => {
  it("supports labels, keyboard interaction, and refs to the interactive root and input", async () => {
    const ref = createRef<HTMLElement>();
    const inputRef = createRef<HTMLInputElement>();
    const onCheckedChange = vi.fn();
    render(
      <Field orientation="horizontal">
        <Switch
          ref={ref}
          inputRef={inputRef}
          id="notifications"
          onCheckedChange={onCheckedChange}
        />
        <FieldLabel htmlFor="notifications">Notifications</FieldLabel>
      </Field>,
    );
    const control = await screen.findByRole("switch", {
      name: "Notifications",
    });
    expect(ref.current).toBe(control);
    expect(inputRef.current?.type).toBe("checkbox");
    await userEvent.click(screen.getByText("Notifications"));
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange.mock.lastCall?.[0]).toBe(true);
    control.focus();
    await userEvent.keyboard(" ");
    expect(control.getAttribute("aria-checked")).toBe("false");
  });

  it("supports controlled values and Base UI state-based classes", async () => {
    function Controlled() {
      const [checked, setChecked] = useState(false);
      return (
        <Switch
          aria-label="Controlled"
          size="sm"
          checked={checked}
          onCheckedChange={setChecked}
          className={(state) => (state.checked ? "bg-red-600" : undefined)}
        />
      );
    }
    render(<Controlled />);
    const control = screen.getByRole("switch");
    await userEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(control.classList.contains("bg-red-600")).toBe(true);
    expect(control.classList.contains("bg-ajna-input")).toBe(false);
    expect(control.dataset.size).toBe("sm");
  });

  it("prevents changes when disabled or read-only", async () => {
    const onCheckedChange = vi.fn();
    render(
      <>
        <Switch
          aria-label="Disabled"
          disabled
          onCheckedChange={onCheckedChange}
        />
        <Switch
          aria-label="Read only"
          readOnly
          defaultChecked
          onCheckedChange={onCheckedChange}
        />
      </>,
    );
    await userEvent.click(screen.getByRole("switch", { name: "Disabled" }));
    await userEvent.click(screen.getByRole("switch", { name: "Read only" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(
      screen
        .getByRole("switch", { name: "Read only" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });

  it("submits its checked and explicit unchecked values", async () => {
    const { container } = render(
      <form>
        <Switch
          aria-label="Updates"
          name="updates"
          value="yes"
          uncheckedValue="no"
        />
        <Switch aria-label="Disabled" name="disabled" defaultChecked disabled />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(new FormData(form).get("updates")).toBe("no");
    await userEvent.click(screen.getByRole("switch", { name: "Updates" }));
    expect(new FormData(form).get("updates")).toBe("yes");
    expect(new FormData(form).has("disabled")).toBe(false);
  });
});
