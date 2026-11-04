import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from ".";

describe("Field", () => {
  it("composes native labels, descriptions, and errors with explicit associations", async () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Field ref={ref} data-invalid>
        <FieldLabel htmlFor="username">Username</FieldLabel>
        <input
          id="username"
          aria-describedby="help error"
          aria-invalid="true"
        />
        <FieldDescription id="help">Choose a unique name.</FieldDescription>
        <FieldError id="error">This name is taken.</FieldError>
      </Field>,
    );
    const input = screen.getByRole("textbox", { name: "Username" });
    await userEvent.click(screen.getByText("Username"));
    expect(document.activeElement).toBe(input);
    expect(input.getAttribute("aria-describedby")).toBe("help error");
    expect(screen.getByRole("alert").textContent).toBe("This name is taken.");
    expect(ref.current).toBe(screen.getByRole("group"));
  });

  it("preserves fieldset semantics and native disabled behavior", async () => {
    render(
      <FieldSet disabled>
        <FieldLegend>Contact details</FieldLegend>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <input id="email" />
          </Field>
        </FieldGroup>
      </FieldSet>,
    );
    expect(screen.getByRole("group", { name: "Contact details" }).tagName).toBe(
      "FIELDSET",
    );
    await userEvent.click(screen.getByRole("textbox"));
    expect(document.activeElement).not.toBe(screen.getByRole("textbox"));
  });

  it("deduplicates actual messages, omits empty errors, and gives children precedence", () => {
    const { rerender } = render(
      <FieldError errors={[undefined, {}, { message: "" }]} />,
    );
    expect(screen.queryByRole("alert")).toBeNull();
    rerender(
      <FieldError
        errors={[undefined, { message: "Required" }, { message: "Required" }]}
      />,
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
    expect(screen.queryByRole("list")).toBeNull();
    rerender(
      <FieldError
        errors={[{ message: "Required" }, { message: "Too short" }]}
      />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    rerender(
      <FieldError errors={[{ message: "Required" }]}>Custom error</FieldError>,
    );
    expect(screen.getByRole("alert").textContent).toBe("Custom error");
  });

  it("merges consumer utilities", () => {
    render(<Field className="gap-6" />);
    const field = screen.getByRole("group");
    expect(field.dataset.orientation).toBe("vertical");
    expect(field.classList.contains("gap-6")).toBe(true);
    expect(field.classList.contains("gap-2")).toBe(false);
  });
});

it("shows the required marker without changing the input's name or validation", () => {
  const ref = createRef<HTMLLabelElement>();
  const view = render(
    <Field>
      <FieldLabel ref={ref} htmlFor="required-name" required>
        Name
      </FieldLabel>
      <input id="required-name" required />
    </Field>,
  );
  const input = screen.getByRole("textbox", {
    name: "Name",
  }) as HTMLInputElement;
  expect(input.required).toBe(true);
  expect(ref.current?.tagName).toBe("LABEL");
  expect(ref.current?.hasAttribute("required")).toBe(false);
  const marker = ref.current?.querySelector(
    '[data-slot="field-required-indicator"]',
  );
  expect(marker?.textContent).toBe("*");
  expect(marker?.getAttribute("aria-hidden")).toBe("true");
  view.rerender(
    <Field>
      <FieldLabel htmlFor="required-name" required>
        Name
      </FieldLabel>
      <input id="required-name" />
    </Field>,
  );
  expect(
    (screen.getByRole("textbox", { name: "Name" }) as HTMLInputElement)
      .required,
  ).toBe(false);
});

it("opens keyboard-accessible help without toggling its control or submitting the form", async () => {
  const user = userEvent.setup();
  const submit = vi.fn();
  render(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <Field orientation="horizontal">
        <input type="checkbox" id="consent" />
        <FieldLabel
          htmlFor="consent"
          required
          contextualHelp={
            <>
              <p>Choose whether we may contact you.</p>
              <a href="#privacy">Privacy details</a>
            </>
          }
        >
          Consent
        </FieldLabel>
      </Field>
    </form>,
  );
  const checkbox = screen.getByRole("checkbox", {
    name: "Consent",
  }) as HTMLInputElement;
  const trigger = screen.getByRole("button", {
    name: "Consent More information",
  });
  expect(trigger.closest("label")).toBeNull();
  await user.click(trigger);
  expect(await screen.findByRole("dialog", { name: "Consent" })).toBeTruthy();
  expect(checkbox.checked).toBe(false);
  expect(submit).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(
    screen.getByRole("link", { name: "Privacy details" }),
  );
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(trigger);
  await user.click(screen.getByText("Consent"));
  expect(checkbox.checked).toBe(true);
  await user.tab();
  expect(document.activeElement).toBe(trigger);
  await user.keyboard("{Enter}");
  expect(await screen.findByRole("dialog", { name: "Consent" })).toBeTruthy();
  expect(checkbox.checked).toBe(true);
  expect(submit).not.toHaveBeenCalled();
});

it("preserves label refs and attributes and supports a translated help trigger name", async () => {
  const user = userEvent.setup();
  const ref = createRef<HTMLLabelElement>();
  const view = render(
    <Field>
      <FieldLabel
        ref={ref}
        id="billing-label"
        htmlFor="billing"
        className="text-base"
        contextualHelp="Use the name shown on your invoice."
        contextualHelpLabel="Billing name help"
      >
        Billing name
      </FieldLabel>
      <input id="billing" />
    </Field>,
  );
  expect(ref.current?.id).toBe("billing-label");
  expect(ref.current?.htmlFor).toBe("billing");
  expect(ref.current?.classList.contains("text-base")).toBe(true);
  await user.click(screen.getByRole("button", { name: "Billing name help" }));
  expect(
    await screen.findByRole("dialog", { name: "Billing name" }),
  ).toBeTruthy();
  expect(screen.getByText("Use the name shown on your invoice.")).toBeTruthy();
  view.rerender(
    <Field>
      <FieldLabel ref={ref} htmlFor="billing" contextualHelp={null}>
        Billing name
      </FieldLabel>
      <input id="billing" />
    </Field>,
  );
  expect(screen.queryByRole("button")).toBeNull();
  expect(ref.current?.parentElement?.getAttribute("data-slot")).toBe("field");
  expect(screen.getByRole("textbox", { name: "Billing name" })).toBeTruthy();
});
