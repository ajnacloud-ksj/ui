import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act, createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { SearchInput } from ".";

it("preserves uncontrolled values, native changes and form values, and clears once with restored focus", async () => {
  const ref = createRef<HTMLInputElement>();
  const nativeChange = vi.fn();
  const valueChange = vi.fn();
  const clear = vi.fn();
  const view = render(
    <form>
      <label htmlFor="search">Projects</label>
      <SearchInput
        id="search"
        name="query"
        defaultValue="API"
        ref={ref}
        onChange={nativeChange}
        onValueChange={valueChange}
        onClear={clear}
      />
    </form>,
  );
  const input = screen.getByRole("searchbox", {
    name: "Projects",
  }) as HTMLInputElement;
  expect(ref.current).toBe(input);
  expect(input.value).toBe("API");
  expect(new FormData(view.container.querySelector("form")!).get("query")).toBe(
    "API",
  );
  await userEvent.click(screen.getByRole("button", { name: "Clear search" }));
  expect(input.value).toBe("");
  expect(document.activeElement).toBe(input);
  expect(nativeChange).toHaveBeenCalledOnce();
  expect(valueChange).toHaveBeenCalledOnce();
  expect(valueChange.mock.calls[0]?.[0]).toBe("");
  expect(clear).toHaveBeenCalledOnce();
  expect(screen.queryByRole("button", { name: "Clear search" })).toBeNull();
  act(() => view.container.querySelector("form")!.reset());
  await waitFor(() => expect(input.value).toBe("API"));
  expect(
    await screen.findByRole("button", { name: "Clear search" }),
  ).toBeTruthy();
});

it("updates controlled text immediately and follows external replacements", async () => {
  const changed = vi.fn();
  function Example() {
    const [query, setQuery] = useState("");
    return (
      <>
        <SearchInput
          aria-label="Query"
          value={query}
          onValueChange={(next, details) => {
            changed(next, details);
            setQuery(next);
          }}
        />
        <button onClick={() => setQuery("External")}>Replace query</button>
      </>
    );
  }
  render(<Example />);
  const input = screen.getByRole("searchbox") as HTMLInputElement;
  await userEvent.type(input, "API");
  expect(changed).toHaveBeenCalledTimes(3);
  expect(input.value).toBe("API");
  await userEvent.click(screen.getByRole("button", { name: "Replace query" }));
  expect(input.value).toBe("External");
  await userEvent.click(input);
  await userEvent.keyboard("{Escape}");
  expect(input.value).toBe("");
  expect(changed.mock.lastCall?.[0]).toBe("");
});

it("lets key handlers cancel Escape, ignores composition, and respects disabled/read-only states", async () => {
  const view = render(
    <SearchInput
      aria-label="Query"
      defaultValue="API"
      onKeyDown={(event) => event.preventDefault()}
    />,
  );
  const input = screen.getByRole("searchbox") as HTMLInputElement;
  await userEvent.click(input);
  await userEvent.keyboard("{Escape}");
  expect(input.value).toBe("API");
  view.rerender(<SearchInput aria-label="Query" defaultValue="API" />);
  fireEvent.keyDown(input, { key: "Escape", isComposing: true });
  expect(input.value).toBe("API");
  view.rerender(<SearchInput aria-label="Query" defaultValue="API" readOnly />);
  expect(screen.queryByRole("button")).toBeNull();
  await userEvent.keyboard("{Escape}");
  expect(input.value).toBe("API");
  view.rerender(<SearchInput aria-label="Query" defaultValue="API" disabled />);
  expect(input.disabled).toBe(true);
  expect(screen.queryByRole("button")).toBeNull();
});

it("keeps loading decorative and makes clearable opt out of both button and Escape clearing", async () => {
  render(
    <SearchInput
      aria-label="Query"
      defaultValue="API"
      loading
      clearable={false}
    />,
  );
  const input = screen.getByRole("searchbox") as HTMLInputElement;
  expect(
    document
      .querySelector('[data-ajna-component="spinner"]')
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
  expect(screen.queryByRole("status")).toBeNull();
  expect(screen.queryByRole("button")).toBeNull();
  await userEvent.click(input);
  await userEvent.keyboard("{Escape}");
  expect(input.value).toBe("API");
});
