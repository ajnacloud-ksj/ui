import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it } from "vitest";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/field";

import { Textarea } from "./textarea.js";

describe("Textarea", () => {
  it("supports multiline editing, labels, refs, descriptions, and native form values", async () => {
    const ref = createRef<HTMLTextAreaElement>();
    const { container } = render(
      <form>
        <Field>
          <FieldLabel htmlFor="bio">Biography</FieldLabel>
          <Textarea
            ref={ref}
            id="bio"
            name="bio"
            rows={4}
            maxLength={200}
            aria-describedby="bio-help"
          />
          <FieldDescription id="bio-help">
            Tell us about yourself.
          </FieldDescription>
        </Field>
      </form>,
    );
    const textarea = screen.getByRole("textbox", {
      name: "Biography",
    }) as HTMLTextAreaElement;
    await userEvent.click(screen.getByText("Biography"));
    expect(document.activeElement).toBe(textarea);
    await userEvent.type(textarea, "First line{Enter}Second line");
    expect(textarea.value).toBe("First line\nSecond line");
    expect(ref.current).toBe(textarea);
    expect(textarea.rows).toBe(4);
    expect(textarea.maxLength).toBe(200);
    expect(new FormData(container.querySelector("form")!).get("bio")).toBe(
      textarea.value,
    );
  });

  it("supports controlled values and preserves invalid-state associations", async () => {
    function Controlled() {
      const [value, setValue] = useState("");
      return (
        <Field data-invalid>
          <FieldLabel htmlFor="message">Message</FieldLabel>
          <Textarea
            id="message"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-invalid="true"
            aria-describedby="message-error"
          />
          <FieldError id="message-error">Add more detail.</FieldError>
        </Field>
      );
    }
    render(<Controlled />);
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    await userEvent.type(textarea, "Hello");
    expect(textarea.value).toBe("Hello");
    expect(textarea.getAttribute("aria-describedby")).toBe(
      screen.getByRole("alert").id,
    );
  });

  it("prevents edits to disabled and read-only controls and merges consumer utilities", async () => {
    render(
      <>
        <Textarea aria-label="Disabled" disabled defaultValue="Fixed" />
        <Textarea
          aria-label="Read only"
          readOnly
          defaultValue="Fixed"
          className="min-h-32 resize-none"
        />
      </>,
    );
    for (const textarea of screen.getAllByRole("textbox")) {
      await userEvent.type(textarea, "new");
      expect((textarea as HTMLTextAreaElement).value).toBe("Fixed");
    }
    const readonly = screen.getByRole("textbox", { name: "Read only" });
    expect(readonly.classList.contains("min-h-16")).toBe(false);
    expect(readonly.classList.contains("resize-y")).toBe(false);
  });
});
