import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Badge, badgeVariants } from "./badge.js";
describe("Badge", () => {
  it.each(["success", "warning", "info"] as const)(
    "supports %s status through the component and helper",
    (variant) => {
      render(<Badge variant={variant}>Status</Badge>);
      const badge = screen.getByText("Status");
      expect(badge.dataset.variant).toBe(variant);
      expect(badge.className).toBe(badgeVariants({ variant }));
      expect(badge.className).not.toBe(badgeVariants());
    },
  );
  it("renders a noninteractive label by default and forwards its ref", () => {
    const ref = createRef<HTMLElement>();
    render(<Badge ref={ref}>Draft</Badge>);
    expect(ref.current).toBe(screen.getByText("Draft"));
    expect(ref.current?.tagName).toBe("SPAN");
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
  it("composes a link and preserves handlers from both the render element and props", async () => {
    const onClick = vi.fn();
    const onRenderedClick = vi.fn();
    render(
      <Badge
        variant="outline"
        render={
          <a href="#project" onClick={onRenderedClick}>
            Project
          </a>
        }
        onClick={onClick}
      />,
    );
    const link = screen.getByRole("link", { name: "Project" });
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledOnce();
    expect(onRenderedClick).toHaveBeenCalledOnce();
    expect(link.getAttribute("href")).toBe("#project");
  });
  it("merges consumer utilities", () => {
    render(<Badge className="rounded-ajna-sm">Draft</Badge>);
    expect(screen.getByText("Draft").dataset.variant).toBe("default");
    expect(screen.getByText("Draft").classList.contains("rounded-full")).toBe(
      false,
    );
  });
});
