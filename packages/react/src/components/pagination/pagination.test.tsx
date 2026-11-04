import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { DirectionProvider } from "@/primitives/direction-provider";

import { Pagination, type PaginationState } from ".";

beforeEach(() => {
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => vi.unstubAllGlobals());

it("renders the default footer and requests controlled pages without altering page size", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <Pagination
      page={3}
      pageSize={20}
      totalCount={237}
      onPaginationChange={changed}
    />,
  );
  expect(screen.getByText("41–60")).toBeTruthy();
  expect(screen.getByText("Page 3 of 12")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(changed).toHaveBeenLastCalledWith({ page: 4, pageSize: 20 });
  await user.click(screen.getByRole("button", { name: "Last page" }));
  expect(changed).toHaveBeenLastCalledWith({ page: 12, pageSize: 20 });
  await user.click(screen.getByRole("button", { name: "First page" }));
  expect(changed).toHaveBeenLastCalledWith({ page: 1, pageSize: 20 });
});

it("disables boundary actions and keeps an empty result set on page one", () => {
  const changed = vi.fn();
  const { rerender } = render(
    <Pagination
      page={1}
      pageSize={20}
      totalCount={40}
      onPaginationChange={changed}
    />,
  );
  expect(
    (screen.getByRole("button", { name: "Previous page" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  rerender(
    <Pagination
      page={2}
      pageSize={20}
      totalCount={40}
      onPaginationChange={changed}
    />,
  );
  expect(
    (screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  rerender(
    <Pagination
      page={1}
      pageSize={20}
      totalCount={0}
      onPaginationChange={changed}
    />,
  );
  expect(screen.getByText("0–0")).toBeTruthy();
  expect(screen.getByText("Page 1 of 1")).toBeTruthy();
  expect(
    screen
      .getAllByRole("button")
      .every((button) => (button as HTMLButtonElement).disabled),
  ).toBe(true);
  expect(changed).not.toHaveBeenCalled();
});

it("supports sequential unknown totals and accurate last-page ranges", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const { rerender } = render(
    <Pagination
      page={3}
      pageSize={20}
      itemCount={7}
      hasNextPage={false}
      pageSelector="input"
      onPaginationChange={changed}
    />,
  );
  expect(screen.getByText("41–47")).toBeTruthy();
  expect(screen.getByText("Page 3")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Last page" })).toBeNull();
  expect(screen.queryByRole("textbox")).toBeNull();
  expect(
    (screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  rerender(
    <Pagination
      page={3}
      pageSize={20}
      hasNextPage
      onPaginationChange={changed}
    />,
  );
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(changed).toHaveBeenLastCalledWith({ page: 4, pageSize: 20 });
  expect(screen.queryByText(/Showing/)).toBeNull();
});

it("updates page size and resets the page in one callback", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <Pagination
      page={5}
      pageSize={20}
      totalCount={500}
      showPageSize
      onPaginationChange={changed}
    />,
  );
  const select = screen.getByRole("combobox", { name: "Items per page" });
  act(() => select.focus());
  await user.keyboard("{ArrowDown}");
  await screen.findByRole("listbox");
  await user.click(screen.getByRole("option", { name: "50" }));
  expect(changed).toHaveBeenCalledExactlyOnceWith({ page: 1, pageSize: 50 });
});

it("does not reset the page when the current page size is selected again", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  render(
    <Pagination
      page={5}
      pageSize={20}
      totalCount={500}
      showPageSize
      onPaginationChange={changed}
    />,
  );
  act(() => screen.getByRole("combobox").focus());
  await user.keyboard("{ArrowDown}");
  await screen.findByRole("listbox");
  await user.click(screen.getByRole("option", { name: "20" }));
  expect(changed).not.toHaveBeenCalled();
});

it("commits page drafts on Enter once, clamps them, and prevents form submission", async () => {
  const user = userEvent.setup();
  const changed = vi.fn();
  const submitted = vi.fn((event) => event.preventDefault());
  render(
    <form onSubmit={submitted}>
      <Pagination
        page={3}
        pageSize={20}
        totalCount={237}
        pageSelector="input"
        onPaginationChange={changed}
      />
    </form>,
  );
  const input = screen.getByRole("textbox", { name: "Page number" });
  await user.clear(input);
  await user.type(input, "999{Enter}");
  expect(changed).toHaveBeenCalledExactlyOnceWith({ page: 12, pageSize: 20 });
  expect(submitted).not.toHaveBeenCalled();
  await user.tab();
  expect(changed).toHaveBeenCalledTimes(1);
});

it.each(["", "2.5", "1e1", "abc"])(
  "restores invalid page draft %j without navigation",
  async (text) => {
    const user = userEvent.setup();
    const changed = vi.fn();
    render(
      <Pagination
        page={3}
        pageSize={20}
        totalCount={237}
        pageSelector="input"
        onPaginationChange={changed}
      />,
    );
    const input = screen.getByRole("textbox") as HTMLInputElement;
    await user.clear(input);
    if (text) await user.type(input, text);
    fireEvent.blur(input);
    expect(input.value).toBe("3");
    expect(changed).not.toHaveBeenCalled();
  },
);

it("synchronizes the draft with controlled navigation and commits valid blur changes", async () => {
  const user = userEvent.setup();
  function Example() {
    const [state, setState] = useState<PaginationState>({
      page: 3,
      pageSize: 20,
    });
    return (
      <Pagination
        {...state}
        totalCount={237}
        pageSelector="input"
        onPaginationChange={setState}
      />
    );
  }
  render(<Example />);
  const input = screen.getByRole("textbox") as HTMLInputElement;
  await user.clear(input);
  await user.type(input, "7");
  await user.tab();
  expect(input.value).toBe("7");
  expect(screen.getByText("121–140")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Previous page" }));
  expect(input.value).toBe("6");
});

it("composes custom layouts, translations, and result renderers", () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <DirectionProvider direction="rtl">
      <Pagination
        ref={ref}
        page={2}
        pageSize={10}
        totalCount={24}
        onPaginationChange={() => {}}
        labels={{
          navigation: "التنقل",
          previousPage: "السابق",
          nextPage: "التالي",
          pageStatus: (page, count) => `${page} / ${count}`,
        }}
      >
        <Pagination.Info>
          {({ start, end, totalCount }) => `${start}:${end}:${totalCount}`}
        </Pagination.Info>
        <Pagination.Separator />
        <Pagination.Controls controls="simple" />
      </Pagination>
    </DirectionProvider>,
  );
  expect(screen.getByText("11:20:24")).toBeTruthy();
  expect(
    screen.getByRole("navigation", { name: "التنقل" }).getAttribute("dir"),
  ).toBe("rtl");
  expect(ref.current?.getAttribute("dir")).toBe("rtl");
  expect(
    screen
      .getByRole("button", { name: "السابق" })
      .querySelector(".lucide-chevron-right"),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Last page" })).toBeNull();
});

it("disables controls, page editing, and page-size selection together", () => {
  render(
    <Pagination
      page={2}
      pageSize={20}
      totalCount={237}
      disabled
      showPageSize
      pageSelector="input"
      onPaginationChange={() => {}}
    />,
  );
  expect(
    screen
      .getAllByRole("button")
      .every((button) => (button as HTMLButtonElement).disabled),
  ).toBe(true);
  expect((screen.getByRole("textbox") as HTMLInputElement).disabled).toBe(true);
  expect((screen.getByRole("combobox") as HTMLButtonElement).disabled).toBe(
    true,
  );
});
