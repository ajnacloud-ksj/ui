import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef } from "react";
import { expect, it } from "vitest";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from ".";

it("renders a named fallback and forwards the root and fallback refs", () => {
  const root = createRef<HTMLSpanElement>();
  const fallback = createRef<HTMLSpanElement>();
  render(
    <Avatar ref={root} role="img" aria-label="Alex Morgan">
      <AvatarFallback ref={fallback}>AM</AvatarFallback>
    </Avatar>,
  );
  expect(root.current).toBe(screen.getByRole("img", { name: "Alex Morgan" }));
  expect(fallback.current?.textContent).toBe("AM");
});

it("switches between an in-place image and fallback as loading succeeds or fails", async () => {
  const ref = createRef<HTMLImageElement>();
  render(
    <Avatar>
      <AvatarImage ref={ref} keepMounted src="/avatar.png" alt="Alex Morgan" />
      <AvatarFallback role="img" aria-label="Alex Morgan">
        AM
      </AvatarFallback>
    </Avatar>,
  );
  await screen.findByText("AM");
  expect(ref.current?.getAttribute("aria-hidden")).toBe("true");
  expect(ref.current?.classList.contains("hidden")).toBe(true);
  fireEvent.load(ref.current!);
  await waitFor(() => expect(screen.queryByText("AM")).toBeNull());
  expect(screen.getByRole("img", { name: "Alex Morgan" })).toBe(ref.current);
  expect(ref.current?.classList.contains("hidden")).toBe(false);
  fireEvent.error(ref.current!);
  expect(await screen.findByText("AM")).toBeTruthy();
  expect(ref.current?.getAttribute("data-error")).not.toBeNull();
});

it("supports delayed fallback, groups, and a caller-owned extra-member count", async () => {
  render(
    <AvatarGroup role="group" aria-label="Project members">
      <Avatar>
        <AvatarFallback delay={20}>AM</AvatarFallback>
        <AvatarBadge aria-hidden="true" />
      </Avatar>
      <AvatarGroupCount aria-label="3 more members">+3</AvatarGroupCount>
    </AvatarGroup>,
  );
  expect(screen.queryByText("AM")).toBeNull();
  expect(await screen.findByText("AM")).toBeTruthy();
  expect(screen.getByRole("group", { name: "Project members" })).toBeTruthy();
  expect(screen.getByText("+3").getAttribute("aria-label")).toBe(
    "3 more members",
  );
});

it("preserves state-based class names", () => {
  render(
    <Avatar
      role="img"
      aria-label="Unknown user"
      className={(state) =>
        state.imageLoadingStatus === "idle" ? "custom-avatar" : undefined
      }
    >
      <AvatarFallback>?</AvatarFallback>
    </Avatar>,
  );
  const avatar = screen.getByRole("img", { name: "Unknown user" });
  expect(avatar.getAttribute("data-size")).toBe("base");
  expect(avatar.classList.contains("custom-avatar")).toBe(true);
});
