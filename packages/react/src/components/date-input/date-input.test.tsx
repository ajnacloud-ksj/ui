import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import { Field, FieldTitle } from "@/components/field";

import { DateInput, type DateInputState } from ".";

it("names the segmented field through Field and preserves locale-specific order and refs", () => {
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <Field>
      <FieldTitle id="appointment-label">Appointment</FieldTitle>
      <DateInput
        ref={ref}
        aria-labelledby="appointment-label"
        locale="en-US"
        defaultValue="2026-04-21"
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
      defaultValue="2026-04-21"
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
      defaultValue="2024-02-28"
      onChange={change}
    />,
  );
  await user.click(screen.getByRole("spinbutton", { name: /^day/i }));
  await user.keyboard("{ArrowUp}");
  expect(change.mock.lastCall?.[0]).toBe("2024-02-29");
  await user.keyboard("{ArrowDown}");
  expect(change.mock.lastCall?.[0]).toBe("2024-02-28");
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
        defaultValue="2026-04-12"
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
      defaultValue="2026-04-12"
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
      defaultValue="2026-04-12"
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
  view.rerender(<DateInput aria-label="Appointment" value="2026-04-12" />);
  expect(screen.getByRole("button", { name: "Clear date" })).toBeTruthy();
  view.rerender(
    <DateInput aria-label="Appointment" value="2026-04-12" clearable={false} />,
  );
  expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
});

it("normalizes invalid controlled values to empty without emitting changes and accepts later updates", () => {
  const change = vi.fn();
  const view = render(
    <DateInput aria-label="Date" value={null} onChange={change} />,
  );
  for (const value of [
    "",
    "2026-02-30",
    "2026-4-12",
    "2026-04-12T09:99",
    "not-a-date",
  ]) {
    view.rerender(
      <DateInput aria-label="Date" value={value} onChange={change} />,
    );
    expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
  }
  view.rerender(
    <DateInput
      aria-label="Date"
      locale="en-US"
      value="2026-04-12T23:30:00Z"
      onChange={change}
    />,
  );
  expect(
    screen
      .getByRole("spinbutton", { name: /^day/i })
      .getAttribute("aria-valuenow"),
  ).toBe("12");
  view.rerender(<DateInput aria-label="Date" value={null} onChange={change} />);
  expect(screen.queryByRole("button", { name: "Clear date" })).toBeNull();
  expect(change).not.toHaveBeenCalled();
});

it("uses strings in validation and exposes only public styling state", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const unavailable = vi.fn((date: string) => date === "2026-04-16");
  const validate = vi.fn<(date: string | null) => null>(() => null);
  const styling = vi.fn<(state: DateInputState) => string>(() => "date-styled");
  render(
    <DateInput
      aria-label="Date"
      locale="en-US"
      defaultValue="2026-04-12"
      minValue="invalid"
      maxValue="2026-02-30"
      placeholderValue="invalid"
      onChange={change}
      validate={validate}
      validationBehavior="aria"
      isDateUnavailable={unavailable}
      className={styling}
    />,
  );
  await user.click(screen.getByRole("spinbutton", { name: /^day/i }));
  await user.keyboard("{ArrowUp}");
  expect(change).toHaveBeenLastCalledWith("2026-04-13");
  await user.click(screen.getByRole("button", { name: "Choose date" }));
  expect(unavailable.mock.calls.length).toBeGreaterThan(0);
  expect(
    unavailable.mock.calls.every(([date]) => /^\d{4}-\d{2}-\d{2}$/.test(date)),
  ).toBe(true);
  expect(validate).toHaveBeenCalled();
  expect(
    validate.mock.calls.every(
      ([date]) => date === null || typeof date === "string",
    ),
  ).toBe(true);
  expect(styling.mock.calls.length).toBeGreaterThan(0);
  const snapshot = styling.mock.lastCall![0];
  expect(snapshot).not.toHaveProperty("state");
  expect(
    Object.values(snapshot).every((value) => typeof value === "boolean"),
  ).toBe(true);
});

it("accepts ISO timestamps in values and bounds, submitting and emitting date-only strings", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <form aria-label="Timestamp form">
      <DateInput
        aria-label="Date"
        locale="en-US"
        name="date"
        defaultValue="2026-04-12T23:30:00Z"
        minValue="2026-04-12T23:59:59-12:00"
        maxValue="2026-04-14T00:00:00+14:00"
        placeholderValue="2026-04-12T09:30"
        onChange={change}
      />
    </form>,
  );
  const form = screen.getByRole("form", {
    name: "Timestamp form",
  }) as HTMLFormElement;
  expect(new FormData(form).get("date")).toBe("2026-04-12");
  expect(change).not.toHaveBeenCalled();
  await user.click(screen.getByRole("spinbutton", { name: /^day/i }));
  await user.keyboard("{ArrowUp}");
  expect(change).toHaveBeenLastCalledWith("2026-04-13");
  expect(new FormData(form).get("date")).toBe("2026-04-13");
});
