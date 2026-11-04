import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { IconStack } from ".";

describe("IconStack", () => {
  it("forwards div props, refs, and decorative content", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <IconStack
        ref={ref}
        aria-hidden="true"
        data-testid="stack"
        style={{ width: 96 }}
      >
        <span>Inbox</span>
      </IconStack>,
    );

    const stack = screen.getByTestId("stack");
    expect(ref.current).toBe(stack);
    expect(stack.tagName).toBe("DIV");
    expect(stack.getAttribute("aria-hidden")).toBe("true");
    expect(stack.style.getPropertyValue("--ajna-icon-stack-content-x")).toBe(
      "71%",
    );
    expect(stack.style.width).toBe("96px");
    const content = stack.querySelector('[data-slot="icon-stack-content"]');
    expect(content?.textContent).toBe("Inbox");
    expect(content?.getAttribute("data-ajna-component")).toBe(
      "icon-stack-content",
    );
  });

  it("renders the layer artwork without a content wrapper when empty", () => {
    const { container } = render(<IconStack aria-hidden="true" />);

    expect(
      container.querySelectorAll('[data-slot="icon-stack-layer"]'),
    ).toHaveLength(6);
    expect(
      container.querySelectorAll('[data-ajna-component="icon-stack-layer"]'),
    ).toHaveLength(3);
    expect(
      container.querySelector('[data-slot="icon-stack-content"]'),
    ).toBeNull();
  });
});
