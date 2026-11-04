import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, it } from "vitest";

import { Kbd, KbdGroup } from ".";

it("keeps keyboard hints semantic without adding a tab stop or changing a button's name", async () => {
  const ref = createRef<HTMLElement>();
  render(
    <button>
      Search{" "}
      <KbdGroup aria-hidden="true">
        <Kbd ref={ref}>Ctrl</Kbd>
        <span>+</span>
        <Kbd>K</Kbd>
      </KbdGroup>
    </button>,
  );
  expect(ref.current?.tagName).toBe("KBD");
  expect(ref.current?.parentElement?.tagName).toBe("KBD");
  expect(ref.current?.hasAttribute("tabindex")).toBe(false);
  await userEvent.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Search" }),
  );
});
