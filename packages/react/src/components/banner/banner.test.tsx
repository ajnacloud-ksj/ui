import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { Banner } from "./banner.js";

describe("Banner", () => {
  it("associates structured content and forwards refs", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <Banner
        ref={ref}
        title="Update available"
        description="Install the latest version."
      />,
    );
    const banner = screen.getByRole("status", { name: "Update available" });
    expect(ref.current).toBe(banner);
    expect(
      document.getElementById(banner.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toBe("Install the latest version.");
  });
  it("uses urgent semantics for destructive messages and preserves an explicit role", () => {
    const { rerender } = render(
      <Banner variant="destructive" title="Save failed" />,
    );
    expect(screen.getByRole("alert", { name: "Save failed" })).not.toBeNull();
    rerender(
      <Banner variant="destructive" title="Save failed" role="status" />,
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });
  it("inherits action size and supports application-owned dismissal without submitting a form", async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    function Example() {
      const [visible, setVisible] = useState(true);
      return (
        <form onSubmit={onSubmit}>
          {visible && (
            <Banner
              size="sm"
              variant="success"
              title="Saved"
              action={
                <Banner.Action onClick={() => setVisible(false)}>
                  Dismiss
                </Banner.Action>
              }
            />
          )}
        </form>
      );
    }
    render(<Example />);
    const button = screen.getByRole("button", { name: "Dismiss" });
    expect(button.classList.contains("h-5")).toBe(true);
    await userEvent.click(button);
    expect(screen.queryByRole("status")).toBeNull();
    expect(onSubmit).not.toHaveBeenCalled();
  });
  it("preserves button loading and accessible icon shapes", async () => {
    const onClick = vi.fn();
    render(
      <Banner
        title="Working"
        action={
          <Banner.Action loading onClick={onClick}>
            Retry
          </Banner.Action>
        }
      />,
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });
});
