import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from ".";

it("controls the code, filters characters, completes, and submits one value across groups", async () => {
  const user = userEvent.setup();
  const complete = vi.fn();
  const rootRef = createRef<HTMLDivElement>();
  const inputRef = createRef<HTMLInputElement>();
  function Example() {
    const [value, setValue] = useState("");
    return (
      <form aria-label="Verification">
        <label htmlFor="code">Verification code</label>
        <InputOTP
          id="code"
          ref={rootRef}
          name="code"
          length={4}
          value={value}
          onValueChange={setValue}
          onValueComplete={complete}
        >
          <InputOTPGroup>
            <InputOTPSlot ref={inputRef} />
            <InputOTPSlot aria-label="Character 2" />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot aria-label="Character 3" />
            <InputOTPSlot aria-label="Character 4" />
          </InputOTPGroup>
        </InputOTP>
      </form>
    );
  }
  render(<Example />);
  const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
  expect(rootRef.current).toBe(screen.getByRole("group"));
  expect(inputRef.current).toBe(
    screen.getByRole("textbox", { name: "Verification code" }),
  );
  await user.click(inputs[0]);
  await user.keyboard("1a234");
  expect(inputs.map((input) => input.value).join("")).toBe("1234");
  expect(complete).toHaveBeenCalledWith("1234", expect.any(Object));
  const form = screen.getByRole("form", {
    name: "Verification",
  }) as HTMLFormElement;
  expect(new FormData(form).getAll("code")).toEqual(["1234"]);
  await user.keyboard("{Backspace}");
  expect(new FormData(form).get("code")).toBe("123");
});

it("normalizes pasted alphanumeric codes and supports native focus navigation", async () => {
  const user = userEvent.setup();
  render(
    <>
      <label htmlFor="recovery">Recovery code</label>
      <InputOTP
        id="recovery"
        length={4}
        validationType="alphanumeric"
        normalizeValue={(value) => value.toUpperCase()}
      >
        {Array.from({ length: 4 }, (_, index) => (
          <InputOTPSlot
            key={index}
            aria-label={index === 0 ? undefined : `Character ${index + 1}`}
          />
        ))}
      </InputOTP>
    </>,
  );
  const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
  await user.click(screen.getByRole("textbox", { name: "Recovery code" }));
  await user.paste("ab 12");
  expect(inputs.map((input) => input.value).join("")).toBe("AB12");
  expect(document.activeElement).toBe(inputs[3]);
  await user.keyboard("{ArrowLeft}");
  expect(document.activeElement).toBe(inputs[2]);
});

it("keeps disabled slots inaccessible to editing and excludes their submitted value", async () => {
  const user = userEvent.setup();
  render(
    <form aria-label="Verification">
      <label htmlFor="disabled-code">Verification code</label>
      <InputOTP
        id="disabled-code"
        name="code"
        length={4}
        defaultValue="1234"
        disabled
      >
        {Array.from({ length: 4 }, (_, index) => (
          <InputOTPSlot
            key={index}
            aria-label={index === 0 ? undefined : `Character ${index + 1}`}
          />
        ))}
      </InputOTP>
    </form>,
  );
  const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
  expect(inputs.every((input) => input.disabled)).toBe(true);
  await user.type(inputs[0], "9");
  expect(inputs.map((input) => input.value).join("")).toBe("1234");
  expect(
    new FormData(screen.getByRole("form") as HTMLFormElement).has("code"),
  ).toBe(false);
});

it("exposes invalid slot semantics and preserves Base UI render and state callbacks", () => {
  render(
    <>
      <label htmlFor="invalid-code">Verification code</label>
      <InputOTP
        id="invalid-code"
        length={1}
        defaultValue="1"
        className={(state) => (state.complete ? "complete" : "incomplete")}
      >
        <InputOTPSlot
          aria-invalid
          aria-describedby="code-error"
          render={<input data-testid="code-slot" />}
        />
      </InputOTP>
      <p id="code-error">This code has expired.</p>
    </>,
  );
  expect(screen.getByRole("group").classList.contains("complete")).toBe(true);
  const input = screen.getByRole("textbox", { name: "Verification code" });
  expect(input).toBe(screen.getByTestId("code-slot"));
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(input.getAttribute("aria-describedby")).toBe("code-error");
});
