import { render, screen } from "@testing-library/react";
import { createRef, forwardRef } from "react";
import { expect, it } from "vitest";

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from ".";

it("exposes a named navigation landmark and current page without decorative list items", () => {
  render(
    <Breadcrumb aria-label="Project location">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Website</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>,
  );
  expect(
    screen.getByRole("navigation", { name: "Project location" }),
  ).toBeTruthy();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByText("Website").getAttribute("aria-current")).toBe("page");
  expect(screen.getByText("Website").hasAttribute("tabindex")).toBe(false);
});

it("composes link elements and refs without nesting anchors", () => {
  const ref = createRef<HTMLElement>();
  const RouterLink = forwardRef<
    HTMLAnchorElement,
    { href?: string; children?: React.ReactNode }
  >(({ children, ...props }, linkRef) => (
    <a {...props} ref={linkRef} data-router="true">
      {children}
    </a>
  ));
  render(
    <BreadcrumbLink ref={ref} render={<RouterLink />} href="/projects">
      Projects
    </BreadcrumbLink>,
  );
  const link = screen.getByRole("link", { name: "Projects" });
  expect(ref.current).toBe(link);
  expect(link.getAttribute("data-router")).toBe("true");
  expect(link.getAttribute("href")).toBe("/projects");
  expect(link.querySelector("a")).toBeNull();
});

it("keeps an ellipsis decorative inside an explicitly named control", () => {
  render(
    <button aria-label="Show hidden path">
      <BreadcrumbEllipsis />
    </button>,
  );
  expect(screen.getByRole("button").getAttribute("aria-label")).toBe(
    "Show hidden path",
  );
  expect(
    screen.getByRole("button").firstElementChild?.getAttribute("aria-hidden"),
  ).toBe("true");
});
