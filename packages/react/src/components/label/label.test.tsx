import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Checkbox } from "@/components/checkbox";
import { Input } from "@/components/input";

import { Label } from "./label.js";
describe("Label", () => {
  it("forwards native attributes and refs and activates its associated input", async () => {
    const ref = createRef<HTMLLabelElement>();
    render(
      <>
        <Label ref={ref} htmlFor="email">
          Email
        </Label>
        <Input id="email" />
      </>,
    );
    expect(ref.current).toBe(screen.getByText("Email"));
    await userEvent.click(screen.getByText("Email"));
    expect(document.activeElement).toBe(
      screen.getByRole("textbox", { name: "Email" }),
    );
  });
  it("works with Base UI-backed controls through the native label association", async () => {
    render(
      <>
        <Checkbox id="terms" />
        <Label htmlFor="terms">Accept terms</Label>
      </>,
    );
    await userEvent.click(screen.getByText("Accept terms"));
    expect(
      screen
        .getByRole("checkbox", { name: "Accept terms" })
        .getAttribute("aria-checked"),
    ).toBe("true");
  });
});
