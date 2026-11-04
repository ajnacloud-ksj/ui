import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Field, FieldDescription, FieldLabel } from "@/components/field";

import { Input } from "./input.js";

describe("Input", () => {
  it("preserves native labels, attributes, refs, and form values", async () => {
    const ref = createRef<HTMLInputElement>();
    const { container } = render(
      <form>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            ref={ref}
            id="email"
            type="email"
            name="email"
            required
            autoComplete="email"
            aria-describedby="email-help"
          />
          <FieldDescription id="email-help">Your work email.</FieldDescription>
        </Field>
      </form>,
    );
    const input = screen.getByRole("textbox", {
      name: "Email",
    }) as HTMLInputElement;
    await userEvent.click(screen.getByText("Email"));
    expect(document.activeElement).toBe(input);
    await userEvent.type(input, "hello@example.com");
    expect(ref.current).toBe(input);
    expect(input.required).toBe(true);
    expect(input.type).toBe("email");
    expect(input.getAttribute("aria-describedby")).toBe("email-help");
    expect(new FormData(container.querySelector("form")!).get("email")).toBe(
      "hello@example.com",
    );
  });

  it("supports controlled Base UI values and native change callbacks", async () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <Input
          aria-label="Name"
          value={value}
          onChange={onChange}
          onValueChange={(next, details) => {
            setValue(next);
            onValueChange(next, details);
          }}
          className={(state) => (state.disabled ? "opacity-25" : "h-12")}
        />
      );
    }
    render(<Controlled />);
    await userEvent.type(screen.getByRole("textbox"), "Ajna");
    expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
      "Ajna",
    );
    expect(onChange).toHaveBeenCalledTimes(4);
    expect(onValueChange.mock.lastCall?.[0]).toBe("Ajna");
    expect(screen.getByRole("textbox").classList.contains("h-9")).toBe(false);
  });

  it("does not accept edits when disabled or read-only", async () => {
    render(
      <>
        <Input aria-label="Disabled" disabled defaultValue="Fixed" />
        <Input aria-label="Read only" readOnly defaultValue="Fixed" />
      </>,
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Disabled" }),
      "new",
    );
    await userEvent.type(
      screen.getByRole("textbox", { name: "Read only" }),
      "new",
    );
    for (const input of screen.getAllByRole("textbox"))
      expect((input as HTMLInputElement).value).toBe("Fixed");
  });

  it("supports native file inputs", async () => {
    render(<Input type="file" aria-label="Attachment" accept="text/plain" />);
    const file = new File(["Hello"], "hello.txt", { type: "text/plain" });
    const input = screen.getByLabelText("Attachment") as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(input.files?.[0]).toBe(file);
  });
});
