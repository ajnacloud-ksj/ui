import { parseDate } from "@internationalized/date";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { Field, FieldTitle } from "@/components/field";

import { DateInput } from ".";

it("names the segmented field through Field and preserves locale-specific order and refs", () => {
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <Field>
      <FieldTitle id="appointment-label">Appointment</FieldTitle>
      <DateInput
        ref={ref}
        aria-labelledby="appointment-label"
        locale="en-US"
        defaultValue={parseDate("2026-04-21")}
      />
    </Field>,
  );
  expect(
    ref.current?.contains(screen.getByRole("group", { name: "Appointment" })),
  ).toBe(true);
  expect(
    screen.getAllByRole("spinbutton")[0].getAttribute("aria-label"),
  ).toMatch(/^month/i);
  view.rerender(
    <DateInput
      aria-label="Appointment"
      locale="en-GB"
      defaultValue={parseDate("2026-04-21")}
    />,
  );
  expect(
    screen.getAllByRole("spinbutton")[0].getAttribute("aria-label"),
  ).toMatch(/^day/i);
});

it("edits dates by keyboard with leap-year and month-length handling", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DateInput
      aria-label="Event"
      locale="en-US"
      defaultValue={parseDate("2024-02-28")}
      onChange={change}
    />,
  );
  await user.click(screen.getByRole("spinbutton", { name: /^day/i }));
  await user.keyboard("{ArrowUp}");
  expect(change.mock.lastCall?.[0].toString()).toBe("2024-02-29");
  await user.keyboard("{ArrowDown}");
  expect(change.mock.lastCall?.[0].toString()).toBe("2024-02-28");
});

it("clears complete values, restores segment focus, submits ISO dates, and resets natively", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <form aria-label="Booking">
      <DateInput
        aria-label="Departure"
        name="departure"
        locale="en-US"
        defaultValue={parseDate("2026-04-12")}
        clearLabel="Clear departure"
        onChange={change}
      />
      <button type="reset">Reset</button>
    </form>,
  );
  const form = screen.getByRole("form", { name: "Booking" }) as HTMLFormElement;
  expect(new FormData(form).get("departure")).toBe("2026-04-12");
  await user.click(screen.getByRole("button", { name: "Clear departure" }));
  expect(change.mock.lastCall?.[0]).toBeNull();
  expect(screen.queryByRole("button", { name: "Clear departure" })).toBeNull();
  expect(new FormData(form).get("departure")).toBe("");
  expect(document.activeElement?.getAttribute("role")).toBe("spinbutton");
  await user.click(screen.getByRole("button", { name: "Reset" }));
  expect(new FormData(form).get("departure")).toBe("2026-04-12");
  expect(screen.getByRole("button", { name: "Clear departure" })).toBeTruthy();
});

it("prevents edits and clearing when read-only or disabled, and preserves invalid styling callbacks", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const view = render(
    <DateInput
      aria-label="Locked"
      locale="en-US"
      defaultValue={parseDate("2026-04-12")}
      clearable
      isReadOnly
      onChange={change}
    />,
  );
  expect(
    (screen.getByRole("button", { name: "Clear date" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  await user.click(screen.getByRole("spinbutton", { name: /^day/i }));
  await user.keyboard("{ArrowUp}");
  expect(change).not.toHaveBeenCalled();
  view.rerender(
    <DateInput
      aria-label="Locked"
      defaultValue={parseDate("2026-04-12")}
      isDisabled
      clearable
    />,
  );
  expect(
    (screen.getByRole("button", { name: "Clear date" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  view.rerender(
    <DateInput
      aria-label="Locked"
      isInvalid
      className={(state) => (state.isInvalid ? "invalid-date" : "")}
    />,
  );
  expect(
    document.querySelector(".invalid-date")?.hasAttribute("data-invalid"),
  ).toBe(true);
  view.rerender(<DateInput aria-label="Locked" clearable={false} />);
  expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
});

it("shows clearing only for populated dates and supports opting out", () => {
  const view = render(<DateInput aria-label="Appointment" value={null} />);
  expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
  view.rerender(
    <DateInput aria-label="Appointment" value={parseDate("2026-04-12")} />,
  );
  expect(screen.getByRole("button", { name: "Clear date" })).toBeTruthy();
  view.rerender(
    <DateInput
      aria-label="Appointment"
      value={parseDate("2026-04-12")}
      clearable={false}
    />,
  );
  expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
});
