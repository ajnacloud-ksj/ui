import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/button";

import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
} from "./button-group.js";

describe("ButtonGroup", () => {
  it("preserves independent button behavior and normal tab navigation", async () => {
    const ref = createRef<HTMLDivElement>();
    const onClick = vi.fn();
    render(
      <ButtonGroup ref={ref} aria-label="Actions">
        <Button onClick={onClick}>Save</Button>
        <Button disabled>Unavailable</Button>
        <Button>Cancel</Button>
      </ButtonGroup>,
    );
    expect(ref.current).toBe(screen.getByRole("group", { name: "Actions" }));
    await userEvent.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Save" }),
    );
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledOnce();
    await userEvent.tab();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Cancel" }),
    );
  });
  it("supports text composition, forwarded refs, and decorative dividers", () => {
    const ref = createRef<HTMLElement>();
    render(
      <ButtonGroup>
        <ButtonGroupText ref={ref} render={<span />}>
          https://
        </ButtonGroupText>
        <ButtonGroupSeparator />
        <Button>Copy</Button>
      </ButtonGroup>,
    );
    expect(ref.current).toBe(screen.getByText("https://"));
    expect(ref.current?.tagName).toBe("SPAN");
    expect(screen.queryByRole("separator")).toBeNull();
  });
});
