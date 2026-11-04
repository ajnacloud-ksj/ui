import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

import { InputOTP, InputOTPGroup, InputOTPSlot, REGEXP_ONLY_DIGITS } from ".";

let user: ReturnType<typeof userEvent.setup>;
beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});
afterEach(async () => {
  cleanup();
  await vi.runOnlyPendingTimersAsync();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it("types, filters, completes, submits one value, and exposes the input ref", async () => {
  const complete = vi.fn();
  const ref = createRef<HTMLInputElement>();
  function Example() {
    const [value, setValue] = useState("");
    return (
      <form aria-label="Verification">
        <InputOTP
          ref={ref}
          pushPasswordManagerStrategy="none"
          aria-label="Code"
          name="code"
          maxLength={4}
          pattern={REGEXP_ONLY_DIGITS}
          value={value}
          onChange={setValue}
          onComplete={complete}
        >
          <InputOTPGroup>
            {Array.from({ length: 4 }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </form>
    );
  }
  render(<Example />);
  const input = screen.getByRole("textbox", { name: "Code" });
  expect(ref.current).toBe(input);
  await user.type(input, "1a234");
  expect(ref.current?.value).toBe("1234");
  expect(complete).toHaveBeenCalledWith("1234");
  expect(
    new FormData(
      screen.getByRole("form", { name: "Verification" }) as HTMLFormElement,
    ).get("code"),
  ).toBe("1234");
  await user.keyboard("{Backspace}");
  expect(ref.current?.value).toBe("123");
});

it("transforms pasted codes and keeps visual slots hidden from assistive technology", async () => {
  render(
    <InputOTP
      pushPasswordManagerStrategy="none"
      aria-label="Verification code"
      maxLength={6}
      pattern={REGEXP_ONLY_DIGITS}
      pasteTransformer={(text) => text.replace(/-/g, "")}
    >
      <InputOTPGroup>
        {Array.from({ length: 6 }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>,
  );
  await user.click(screen.getByRole("textbox", { name: "Verification code" }));
  await user.paste("123-456");
  expect((screen.getByRole("textbox") as HTMLInputElement).value).toBe(
    "123456",
  );
  expect(
    screen
      .getAllByText(/^[1-6]$/)
      .every((node) => node.getAttribute("aria-hidden") === "true"),
  ).toBe(true);
});

it("preserves disabled and invalid input semantics", async () => {
  render(
    <InputOTP
      aria-label="Code"
      aria-invalid
      disabled
      maxLength={4}
      value="1234"
    >
      <InputOTPGroup>
        {Array.from({ length: 4 }, (_, index) => (
          <InputOTPSlot key={index} index={index} />
        ))}
      </InputOTPGroup>
    </InputOTP>,
  );
  const input = screen.getByRole("textbox", {
    name: "Code",
  }) as HTMLInputElement;
  expect(input.disabled).toBe(true);
  expect(input.getAttribute("aria-invalid")).toBe("true");
  await user.type(input, "9");
  expect(input.value).toBe("1234");
});
