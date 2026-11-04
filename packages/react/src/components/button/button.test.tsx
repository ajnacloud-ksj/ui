import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button.js";

describe("Button", () => {
  it("lets consumer utilities replace conflicting defaults", () => {
    render(
      <Button
        className="h-12 rounded-full bg-red-600 px-6 font-serif"
        variant="primary"
      >
        Custom button
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Custom button" });
    for (const name of [
      "h-12",
      "px-6",
      "bg-red-600",
      "rounded-full",
      "font-serif",
    ])
      expect(button.classList.contains(name)).toBe(true);
    for (const name of [
      "h-9",
      "px-3",
      "bg-ajna-primary",
      "rounded-ajna-base",
      "font-ajna",
    ])
      expect(button.classList.contains(name)).toBe(false);
  });

  it("uses native activation, forwards its ref, and does not submit a form by default", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const onSubmit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLButtonElement>();
    render(
      <form onSubmit={onSubmit}>
        <Button ref={ref} onClick={onClick}>
          Save
        </Button>
      </form>,
    );
    const button = screen.getByRole("button", { name: "Save" });
    expect(ref.current).toBe(button);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("supports explicit form submission", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <Button type="submit">Save</Button>
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it.each([{ disabled: true }, { loading: true }])(
    "prevents activation when unavailable: %j",
    async (state) => {
      const onClick = vi.fn();
      render(
        <Button {...state} onClick={onClick}>
          Save
        </Button>,
      );
      const button = screen.getByRole("button", { name: "Save" });
      expect((button as HTMLButtonElement).disabled).toBe(true);
      await userEvent.click(button);
      expect(onClick).not.toHaveBeenCalled();
      if ("loading" in state)
        expect(button.getAttribute("aria-busy")).toBe("true");
    },
  );

  it("keeps icon-only buttons named and preserves native title text", () => {
    render(
      <Button
        shape="square"
        aria-label="Add item"
        title="Add item"
        icon={<svg />}
      />,
    );
    expect(
      screen.getByRole("button", { name: "Add item" }).getAttribute("title"),
    ).toBe("Add item");
  });

  it("replaces the icon with the shared decorative Spinner while preserving the loading label", () => {
    const { rerender } = render(
      <Button icon={<svg data-testid="action-icon" />}>Save project</Button>,
    );
    expect(screen.getByTestId("action-icon")).toBeTruthy();
    rerender(
      <Button loading icon={<svg data-testid="action-icon" />}>
        Save project
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Save project" });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect(
      button
        .querySelector('[data-ajna-component="spinner"]')
        ?.getAttribute("aria-hidden"),
    ).toBe("true");
    expect(screen.queryByTestId("action-icon")).toBeNull();
    expect(screen.queryByRole("status")).toBeNull();
  });
});
