import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { ToggleGroup, ToggleGroupItem } from ".";

it("changes single selection and permits clearing it", async () => {
  const ref = createRef<HTMLDivElement>();
  const item = createRef<HTMLButtonElement>();
  const change = vi.fn();
  render(
    <ToggleGroup
      ref={ref}
      aria-label="Alignment"
      defaultValue={["left"]}
      onValueChange={change}
      variant="outline"
      size="sm"
    >
      <ToggleGroupItem value="left" ref={item}>
        Left
      </ToggleGroupItem>
      <ToggleGroupItem value="center">Center</ToggleGroupItem>
    </ToggleGroup>,
  );
  expect(ref.current).toBe(screen.getByRole("group", { name: "Alignment" }));
  expect(item.current).toBe(screen.getByRole("button", { name: "Left" }));
  expect(item.current?.getAttribute("data-size")).toBe("sm");
  await userEvent.click(screen.getByRole("button", { name: "Center" }));
  expect(item.current?.getAttribute("aria-pressed")).toBe("false");
  expect(change.mock.calls[0]?.[0]).toEqual(["center"]);
  await userEvent.click(screen.getByRole("button", { name: "Center" }));
  expect(change.mock.calls[1]?.[0]).toEqual([]);
});

it("keeps controlled multiple selections and allows an item to cancel a change", async () => {
  function Example() {
    const [value, setValue] = useState(["bold"]);
    return (
      <ToggleGroup
        multiple
        value={value}
        onValueChange={setValue}
        aria-label="Formatting"
      >
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
        <ToggleGroupItem
          value="locked"
          onPressedChange={(_, details) => details.cancel()}
        >
          Locked
        </ToggleGroupItem>
      </ToggleGroup>
    );
  }
  render(<Example />);
  await userEvent.click(screen.getByRole("button", { name: "Italic" }));
  expect(
    screen.getByRole("button", { name: "Bold" }).getAttribute("aria-pressed"),
  ).toBe("true");
  expect(
    screen.getByRole("button", { name: "Italic" }).getAttribute("aria-pressed"),
  ).toBe("true");
  await userEvent.click(screen.getByRole("button", { name: "Locked" }));
  expect(
    screen.getByRole("button", { name: "Locked" }).getAttribute("aria-pressed"),
  ).toBe("false");
});

it("moves focus across enabled items without changing selection", async () => {
  const user = userEvent.setup();
  render(
    <ToggleGroup aria-label="Alignment">
      <ToggleGroupItem value="left">Left</ToggleGroupItem>
      <ToggleGroupItem value="center" disabled>
        Center
      </ToggleGroupItem>
      <ToggleGroupItem value="right">Right</ToggleGroupItem>
    </ToggleGroup>,
  );
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Left" }),
  );
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Right" }),
  );
  expect(
    screen.getByRole("button", { name: "Right" }).getAttribute("aria-pressed"),
  ).toBe("false");
  await user.keyboard(" ");
  expect(
    screen.getByRole("button", { name: "Right" }).getAttribute("aria-pressed"),
  ).toBe("true");
});

it("preserves group disabled state and state-based class names", async () => {
  const change = vi.fn();
  render(
    <ToggleGroup
      disabled
      defaultValue={["a"]}
      onValueChange={change}
      className={(state) => (state.disabled ? "unavailable" : undefined)}
    >
      <ToggleGroupItem value="a">A</ToggleGroupItem>
      <ToggleGroupItem value="b">B</ToggleGroupItem>
    </ToggleGroup>,
  );
  expect(screen.getByRole("group").classList.contains("unavailable")).toBe(
    true,
  );
  for (const button of screen.getAllByRole("button"))
    expect(button.hasAttribute("disabled")).toBe(true);
  await userEvent.click(screen.getByRole("button", { name: "B" }));
  expect(change).not.toHaveBeenCalled();
});
