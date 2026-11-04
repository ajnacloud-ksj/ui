import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, useState } from "react";
import { expect, it, vi } from "vitest";

import { PasswordInput } from ".";

it("reveals the same native input without changing its value, ref, caret, or submitted value", async () => {
  const ref = createRef<HTMLInputElement>();
  const submit = vi.fn((event: React.FormEvent) => event.preventDefault());
  const view = render(
    <form onSubmit={submit}>
      <label htmlFor="password">Password</label>
      <PasswordInput
        id="password"
        name="password"
        ref={ref}
        defaultValue="secret123"
        autoComplete="current-password"
      />
    </form>,
  );
  const input = screen.getByLabelText("Password", {
    exact: true,
  }) as HTMLInputElement;
  expect(ref.current).toBe(input);
  expect(input.type).toBe("password");
  await userEvent.click(input);
  input.setSelectionRange(2, 2);
  await userEvent.click(screen.getByRole("button", { name: "Show password" }));
  expect(input.type).toBe("text");
  expect(input.value).toBe("secret123");
  expect(document.activeElement).toBe(input);
  await waitFor(() => expect(input.selectionStart).toBe(2));
  expect(
    new FormData(view.container.querySelector("form")!).get("password"),
  ).toBe("secret123");
  expect(input.autocomplete).toBe("current-password");
  expect(submit).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole("button", { name: "Hide password" }));
  expect(input.type).toBe("password");
});

it("supports controlled changes, keyboard toggling, and translated action labels", async () => {
  const change = vi.fn();
  function Example() {
    const [value, setValue] = useState("");
    return (
      <PasswordInput
        aria-label="Account password"
        value={value}
        onValueChange={(next, details) => {
          change(next, details);
          setValue(next);
        }}
        showPasswordLabel="Reveal account password"
        hidePasswordLabel="Conceal account password"
      />
    );
  }
  render(<Example />);
  const input = screen.getByLabelText("Account password") as HTMLInputElement;
  await userEvent.type(input, "secret");
  expect(change).toHaveBeenCalledTimes(6);
  await userEvent.tab();
  const toggle = screen.getByRole("button", {
    name: "Reveal account password",
  });
  expect(document.activeElement).toBe(toggle);
  await userEvent.keyboard("{Enter}");
  expect(input.type).toBe("text");
  expect(screen.getByRole("button", { name: "Conceal account password" })).toBe(
    toggle,
  );
  expect(document.activeElement).toBe(toggle);
  expect(input.value).toBe("secret");
});

it("disables its action with the input while allowing read-only values to be revealed", async () => {
  const view = render(
    <PasswordInput aria-label="Secret" defaultValue="fixed" disabled />,
  );
  const input = screen.getByLabelText("Secret") as HTMLInputElement;
  expect(input.disabled).toBe(true);
  expect(screen.getByRole("button").hasAttribute("disabled")).toBe(true);
  await userEvent.click(screen.getByRole("button"));
  expect(input.type).toBe("password");
  view.rerender(
    <PasswordInput aria-label="Secret" defaultValue="fixed" readOnly />,
  );
  await userEvent.click(screen.getByRole("button"));
  await userEvent.type(input, "changed");
  expect(input.type).toBe("text");
  expect(input.value).toBe("fixed");
});
