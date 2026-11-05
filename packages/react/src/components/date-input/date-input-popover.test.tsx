import { getLocalTimeZone, today } from "@internationalized/date";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";

import { DateInput } from ".";

// jsdom lacks CSS.escape; the picker uses numeric collection keys.
beforeAll(() => vi.stubGlobal("CSS", { escape: (value: string) => value }));
afterAll(() => vi.unstubAllGlobals());
afterEach(() => vi.useRealTimers());

it("opens a labelled calendar, selects a date, submits ISO, and clears", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <form aria-label="Booking">
      <DateInput
        aria-label="Departure"
        name="departure"
        locale="en-US"
        defaultValue="2026-04-12"
        onChange={change}
        clearable
      />
    </form>,
  );
  const trigger = document.querySelector<HTMLButtonElement>(
    '[data-slot="date-input-trigger"]',
  )!;
  expect(trigger.getAttribute("aria-label")).toBeTruthy();
  await user.click(trigger);
  expect(await screen.findByRole("dialog")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: /April 15, 2026/ }));
  expect(change.mock.lastCall?.[0]).toBe("2026-04-15");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).get("departure"),
  ).toBe("2026-04-15");
  await user.click(screen.getByRole("button", { name: "Clear date" }));
  expect(change.mock.lastCall?.[0]).toBeNull();
  expect(document.activeElement?.getAttribute("role")).toBe("spinbutton");
});

it("honors controlled value/open state and closes on Escape", async () => {
  const user = userEvent.setup();
  function Controlled() {
    const [date, setDate] = useState<string | null>("2026-04-12");
    const [open, setOpen] = useState(false);
    return (
      <DateInput
        aria-label="Controlled"
        locale="en-US"
        value={date}
        onChange={(next) => {
          if (next) setDate(next);
        }}
        isOpen={open}
        onOpenChange={setOpen}
      />
    );
  }
  render(<Controlled />);
  await user.click(
    document.querySelector<HTMLButtonElement>(
      '[data-slot="date-input-trigger"]',
    )!,
  );
  await screen.findByRole("dialog");
  await user.keyboard("{Escape}");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  await user.click(screen.getByRole("spinbutton", { name: /^day/i }));
  await user.keyboard("{ArrowUp}");
  expect(
    screen
      .getByRole("spinbutton", { name: /^day/i })
      .getAttribute("aria-valuenow"),
  ).toBe("13");
});

it("passes bounds and unavailable dates to the popup and prevents disabled/read-only changes", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  const view = render(
    <DateInput
      aria-label="Booking"
      locale="en-US"
      defaultValue="2026-04-12"
      minValue="2026-04-10"
      maxValue="2026-04-20"
      isDateUnavailable={(date) => date.endsWith("-15")}
      onChange={change}
    />,
  );
  await user.click(
    document.querySelector<HTMLButtonElement>(
      '[data-slot="date-input-trigger"]',
    )!,
  );
  await screen.findByRole("dialog");
  expect(
    screen
      .getByRole("button", { name: /April 9, 2026/ })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await user.click(screen.getByRole("button", { name: /April 15, 2026/ }));
  expect(change).not.toHaveBeenCalled();
  await user.keyboard("{Escape}");
  view.rerender(
    <DateInput
      aria-label="Booking"
      isReadOnly
      defaultValue="2026-04-12"
      clearable
    />,
  );
  expect(
    document.querySelector<HTMLButtonElement>(
      '[data-slot="date-input-trigger"]',
    )?.disabled,
  ).toBe(true);
  expect(
    (screen.getByRole("button", { name: "Clear date" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  view.rerender(<DateInput aria-label="Booking" isDisabled />);
  expect(
    document.querySelector<HTMLButtonElement>(
      '[data-slot="date-input-trigger"]',
    )?.disabled,
  ).toBe(true);
});

it("chooses a year from the grid with the keyboard and browses months before selecting a day", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DateInput
      aria-label="Birthday"
      locale="en-US"
      defaultValue="2026-04-12"
      onChange={change}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Choose date" }));
  await user.click(await screen.findByRole("button", { name: "April 2026" }));
  const years = screen.getByRole("listbox", { name: /year/i });
  expect(years.getAttribute("data-layout")).toBe("grid");
  expect(
    within(years)
      .getByRole("option", { name: "2026" })
      .getAttribute("aria-selected"),
  ).toBe("true");
  within(years).getByRole("option", { name: "1991" }).focus();
  await user.keyboard("{Enter}");
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "April 1991" }),
  );
  expect(change).not.toHaveBeenCalled();
  await user.click(
    document.querySelector<HTMLButtonElement>('button[slot="next"]')!,
  );
  await user.click(
    document.querySelector<HTMLButtonElement>('button[slot="next"]')!,
  );
  await user.click(screen.getByRole("button", { name: /June 18, 1991/ }));
  expect(change.mock.lastCall?.[0]).toBe("1991-06-18");
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
});

it("constrains the year grid and adjacent-month navigation to the available period", async () => {
  const user = userEvent.setup();
  render(
    <DateInput
      aria-label="Appointment"
      locale="en-US"
      defaultValue="2026-04-12"
      minValue="2026-04-01"
      maxValue="2027-06-30"
    />,
  );
  await user.click(screen.getByRole("button", { name: "Choose date" }));
  await user.click(await screen.findByRole("button", { name: "April 2026" }));
  expect(screen.queryByRole("option", { name: "2025" })).toBeNull();
  expect(screen.queryByRole("option", { name: "2028" })).toBeNull();
  await user.click(screen.getByRole("option", { name: "2027" }));
  await user.click(
    document.querySelector<HTMLButtonElement>('button[slot="next"]')!,
  );
  await user.click(
    document.querySelector<HTMLButtonElement>('button[slot="next"]')!,
  );
  expect(screen.getByRole("button", { name: "June 2027" })).toBeTruthy();
  expect(
    document.querySelector<HTMLButtonElement>('button[slot="next"]')?.disabled,
  ).toBe(true);
});

it("returns to the day grid when the current year is chosen again", async () => {
  const user = userEvent.setup();
  render(
    <DateInput
      aria-label="Appointment"
      locale="en-US"
      defaultValue="2026-04-12"
    />,
  );
  await user.click(screen.getByRole("button", { name: "Choose date" }));
  await user.click(await screen.findByRole("button", { name: "April 2026" }));
  await user.click(screen.getByRole("option", { name: "2026" }));
  expect(screen.queryByRole("listbox")).toBeNull();
  expect(screen.getByRole("button", { name: /April 12, 2026/ })).toBeTruthy();
});

it("supports a typing-only input without rendering a trigger or calendar", async () => {
  const user = userEvent.setup();
  render(
    <DateInput
      aria-label="Date only"
      locale="en-US"
      hideCalendar
      defaultValue="2026-04-12"
    />,
  );
  expect(screen.queryByRole("button", { name: "Choose date" })).toBeNull();
  const day = screen.getByRole("spinbutton", { name: /^day/i });
  await user.click(day);
  await user.keyboard("{ArrowUp}");
  expect(day.getAttribute("aria-valuenow")).toBe("13");
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("browses years in the active calendar system without changing the stored date", async () => {
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DateInput
      aria-label="Hebrew calendar"
      locale="en-US-u-ca-hebrew"
      defaultValue="2024-04-12"
      onChange={change}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Choose date" }));
  await user.click(
    document.querySelector<HTMLButtonElement>(
      '[data-ajna-component="date-input-calendar-heading"]',
    )!,
  );
  await user.click(screen.getByRole("option", { name: "5785" }));
  expect(
    document.querySelector('[data-ajna-component="date-input-calendar-title"]')
      ?.textContent,
  ).toContain("5785");
  expect(screen.getByRole("grid")).toBeTruthy();
  expect(change).not.toHaveBeenCalled();
});

it("selects today from the year view without submitting the form and restores trigger focus", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-04-16T12:00:00Z"));
  const user = userEvent.setup();
  const change = vi.fn();
  const submit = vi.fn();
  render(
    <form
      aria-label="Appointment form"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <DateInput
        aria-label="Appointment"
        locale="en-US"
        name="date"
        defaultValue="2020-01-12"
        onChange={change}
      />
    </form>,
  );
  const trigger = screen.getByRole("button", { name: "Choose date" });
  await user.click(trigger);
  await user.click(await screen.findByRole("button", { name: "January 2020" }));
  await user.click(screen.getByRole("button", { name: "Today" }));
  const expected = today(getLocalTimeZone()).toString();
  expect(change.mock.lastCall?.[0]).toBe(expected);
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).get("date"),
  ).toBe(expected);
  expect(submit).not.toHaveBeenCalled();
  await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(document.activeElement).toBe(trigger);
});

it("keeps the calendar open on today's month when shouldCloseOnSelect is false", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-04-16T12:00:00Z"));
  const user = userEvent.setup();
  const change = vi.fn();
  render(
    <DateInput
      aria-label="Appointment"
      locale="en-US"
      defaultValue="2020-01-12"
      shouldCloseOnSelect={false}
      todayLabel="Today's date"
      onChange={change}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Choose date" }));
  await user.click(await screen.findByRole("button", { name: "Today's date" }));
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Today's date" })).toBeNull();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "April 2026" }),
  );
  expect(change.mock.lastCall?.[0]).toBe(today(getLocalTimeZone()).toString());
});

it("disables Today for out-of-bounds, unavailable, read-only, and disabled dates", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-04-16T12:00:00Z"));
  const user = userEvent.setup();
  const change = vi.fn();
  const current = today(getLocalTimeZone());
  const shared = {
    "aria-label": "Appointment",
    locale: "en-US",
    defaultValue: "2026-04-14",
    isOpen: true,
    onChange: change,
  };
  const view = render(<DateInput {...shared} minValue="2026-04-17" />);
  const expectDisabled = () =>
    expect(
      (screen.getByRole("button", { name: "Today" }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
  expectDisabled();
  await user.click(screen.getByRole("button", { name: "Today" }));
  expect(change).not.toHaveBeenCalled();
  view.rerender(<DateInput {...shared} maxValue="2026-04-15" />);
  expectDisabled();
  view.rerender(
    <DateInput
      {...shared}
      isDateUnavailable={(date) => date === current.toString()}
    />,
  );
  expectDisabled();
  view.rerender(<DateInput {...shared} isReadOnly />);
  expectDisabled();
  view.rerender(<DateInput {...shared} isDisabled />);
  expectDisabled();
});

it.each(["value", "placeholder"] as const)(
  "uses the local date for Today with an initial %s",
  async (source) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-04-15T00:30:00Z"));
    const user = userEvent.setup();
    const change = vi.fn();
    const date = "2020-01-12";
    const dateProps =
      source === "value" ? { defaultValue: date } : { placeholderValue: date };
    render(
      <DateInput
        {...dateProps}
        aria-label="Appointment"
        locale="en-US"
        onChange={change}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Choose date" }));
    await user.click(await screen.findByRole("button", { name: "Today" }));
    expect(change.mock.lastCall?.[0]).toBe(
      today(getLocalTimeZone()).toString(),
    );
  },
);

it("hides Today when the selected date is today even when browsing, and shows it after clearing", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-04-16T12:00:00Z"));
  const user = userEvent.setup();
  render(
    <DateInput
      aria-label="Appointment"
      locale="en-US"
      defaultValue={today(getLocalTimeZone()).toString()}
    />,
  );
  const trigger = screen.getByRole("button", { name: "Choose date" });
  await user.click(trigger);
  expect(screen.queryByRole("button", { name: "Today" })).toBeNull();
  await user.click(
    document.querySelector<HTMLButtonElement>('button[slot="next"]')!,
  );
  expect(screen.queryByRole("button", { name: "Today" })).toBeNull();
  await user.click(screen.getByRole("button", { name: "May 2026" }));
  expect(screen.queryByRole("button", { name: "Today" })).toBeNull();
  await user.keyboard("{Escape}");
  await user.click(screen.getByRole("button", { name: "Clear date" }));
  await user.click(trigger);
  expect(screen.getByRole("button", { name: "Today" })).toBeTruthy();
});
