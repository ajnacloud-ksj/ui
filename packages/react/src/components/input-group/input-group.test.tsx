import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { Field, FieldLabel } from "@/components/field";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "./input-group.js";

describe("InputGroup", () => {
  it("preserves labels, input refs, native values, and controlled callbacks", async () => {
    const ref = createRef<HTMLInputElement>();
    const onValueChange = vi.fn();
    const { container } = render(
      <form>
        <Field>
          <FieldLabel htmlFor="website">Website</FieldLabel>
          <InputGroup>
            <InputGroupInput
              ref={ref}
              id="website"
              name="website"
              onValueChange={onValueChange}
            />
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </form>,
    );
    const input = screen.getByRole("textbox", { name: "Website" });
    await userEvent.click(screen.getByText("https://"));
    expect(document.activeElement).toBe(input);
    await userEvent.type(input, "example.com");
    expect(ref.current).toBe(input);
    expect(onValueChange.mock.lastCall?.[0]).toBe("example.com");
    expect(new FormData(container.querySelector("form")!).get("website")).toBe(
      "example.com",
    );
  });

  it("focuses textareas from block add-ons without stealing button or link focus", async () => {
    const onClick = vi.fn();
    render(
      <InputGroup>
        <InputGroupTextarea aria-label="Message" />
        <InputGroupAddon align="block-end">
          <InputGroupText>Write a message</InputGroupText>
          <InputGroupButton onClick={onClick}>Send</InputGroupButton>
          <a href="#details">Details</a>
        </InputGroupAddon>
      </InputGroup>,
    );
    await userEvent.click(screen.getByText("Write a message"));
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "Send" }),
    );
    await userEvent.click(screen.getByRole("link"));
    expect(document.activeElement).toBe(screen.getByRole("link"));
  });

  it("honors canceled addon handlers and does not submit forms by default", async () => {
    const onSubmit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <InputGroup>
          <InputGroupInput aria-label="Search" />
          <InputGroupAddon onClick={(event) => event.preventDefault()}>
            Prefix
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Search</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </form>,
    );
    await userEvent.click(screen.getByText("Prefix"));
    expect(document.activeElement).not.toBe(screen.getByRole("textbox"));
    await userEvent.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps DOM tab order on the control before its action", async () => {
    render(
      <InputGroup>
        <InputGroupInput aria-label="Query" />
        <InputGroupAddon align="inline-start">
          <InputGroupButton>Search</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
    await userEvent.tab();
    expect(document.activeElement).toBe(screen.getByRole("button"));
  });
});
