import { act, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterAll, afterEach, expect, it, vi } from "vitest";

import { CopyButton } from ".";

function clipboard(writeText = vi.fn().mockResolvedValue(undefined)) {
  vi.spyOn(navigator, "clipboard", "get").mockReturnValue({
    writeText,
  } as unknown as Clipboard);
  return writeText;
}

// JSDOM does not implement the clipboard getter.
const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
Object.defineProperty(navigator, "clipboard", {
  configurable: true,
  get: () => undefined,
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
afterAll(() => {
  if (original) Object.defineProperty(navigator, "clipboard", original);
  else Reflect.deleteProperty(navigator, "clipboard");
});

it("copies exact text, forwards its ref, announces success, and resets feedback", async () => {
  vi.useFakeTimers();
  const write = clipboard();
  const success = vi.fn();
  const ref = createRef<HTMLButtonElement>();
  render(
    <CopyButton
      ref={ref}
      value={"first\nsecond"}
      onCopySuccess={success}
      resetDelay={1000}
    >
      Copy command
    </CopyButton>,
  );
  const button = screen.getByRole("button", { name: "Copy command" });
  expect(ref.current).toBe(button);
  expect(button.getAttribute("type")).toBe("button");
  await act(async () => fireEvent.click(button));
  expect(write).toHaveBeenCalledExactlyOnceWith("first\nsecond");
  expect(success).toHaveBeenCalledExactlyOnceWith("first\nsecond");
  expect(screen.getByRole("button", { name: "Copied" })).toBe(button);
  expect(screen.getByRole("status").textContent).toBe("Copied");
  await act(() => vi.advanceTimersByTime(1000));
  expect(screen.getByRole("button", { name: "Copy command" })).toBe(button);
  expect(screen.getByRole("status").textContent).toBe("");
});

it("waits for the clipboard promise and blocks duplicate pending activations", async () => {
  let resolve!: () => void;
  const write = clipboard(
    vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    ),
  );
  render(<CopyButton value="pending" />);
  const button = screen.getByRole("button", {
    name: "Copy to clipboard",
  }) as HTMLButtonElement;
  button.focus();
  fireEvent.click(button);
  fireEvent.click(button);
  expect(document.activeElement).toBe(button);
  expect(write).toHaveBeenCalledTimes(1);
  expect(button.disabled).toBe(false);
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(button.getAttribute("aria-busy")).toBe("true");
  expect(screen.getByRole("status").textContent).toBe("");
  await act(async () => resolve());
  expect(button.disabled).toBe(false);
  expect(button.getAttribute("data-copy-state")).toBe("copied");
});

it.each(["rejected", "unavailable"])(
  "reports %s access without success and supports retry",
  async (mode) => {
    const error = new Error("Permission denied");
    const write = clipboard(vi.fn().mockRejectedValue(error));
    if (mode === "unavailable")
      vi.spyOn(navigator, "clipboard", "get").mockReturnValue(
        undefined as unknown as Clipboard,
      );
    const failure = vi.fn();
    const success = vi.fn();
    render(
      <CopyButton
        value="private"
        onCopyError={failure}
        onCopySuccess={success}
        errorLabel="Copy failed"
      >
        Copy key
      </CopyButton>,
    );
    const button = screen.getByRole("button", { name: "Copy key" });
    await act(async () => fireEvent.click(button));
    expect(failure.mock.calls[0][0]).toBeInstanceOf(Error);
    expect(success).not.toHaveBeenCalled();
    expect(screen.getByRole("status").textContent).toBe("Copy failed");
    expect(screen.getByRole("button", { name: "Copy failed" })).toBe(button);
    vi.spyOn(navigator, "clipboard", "get").mockReturnValue({
      writeText: write,
    } as unknown as Clipboard);
    write.mockResolvedValue(undefined);
    await act(async () => fireEvent.click(button));
    expect(success).toHaveBeenCalledExactlyOnceWith("private");
  },
);

it("honors disabled, click cancellation, localization, and the latest value", async () => {
  const write = clipboard();
  const view = render(<CopyButton value="first" disabled copyLabel="Copiar" />);
  const button = screen.getByRole("button", { name: "Copiar" });
  fireEvent.click(button);
  expect(write).not.toHaveBeenCalled();
  view.rerender(
    <CopyButton
      value="first"
      copyLabel="Copiar"
      onClick={(event) => event.preventDefault()}
    />,
  );
  fireEvent.click(button);
  expect(write).not.toHaveBeenCalled();
  view.rerender(
    <CopyButton value="second" copyLabel="Copiar" copiedLabel="Copiado" />,
  );
  await act(async () => fireEvent.click(button));
  expect(write).toHaveBeenCalledExactlyOnceWith("second");
  expect(screen.getByRole("status").textContent).toBe("Copiado");
  view.rerender(<CopyButton value="third" copyLabel="Copiar" />);
  expect(button.getAttribute("data-copy-state")).toBe("idle");
});

it("cleans up feedback timers and ignores late completion after unmount", async () => {
  vi.useFakeTimers();
  let resolve!: () => void;
  clipboard(
    vi.fn(
      () =>
        new Promise<void>((done) => {
          resolve = done;
        }),
    ),
  );
  const success = vi.fn();
  const view = render(<CopyButton value="late" onCopySuccess={success} />);
  fireEvent.click(screen.getByRole("button"));
  view.unmount();
  await act(async () => resolve());
  expect(success).not.toHaveBeenCalled();
  expect(vi.getTimerCount()).toBe(0);
});

it("renders one native control and keeps live feedback out of the accessible name", async () => {
  clipboard();
  const view = render(
    <div role="group">
      <CopyButton value="text">Copy text</CopyButton>
    </div>,
  );
  const group = screen.getByRole("group");
  expect(group.children).toHaveLength(1);
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Copy text" })),
  );
  expect(screen.getByRole("button", { name: "Copied" })).toBeTruthy();
  view.rerender(
    <>
      <span id="copy-title">Copy project identifier</span>
      <CopyButton value="text" aria-labelledby="copy-title" />
    </>,
  );
  expect(
    screen.getByRole("button", { name: "Copy project identifier" }),
  ).toBeTruthy();
});
