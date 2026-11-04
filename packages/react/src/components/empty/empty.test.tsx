import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it } from "vitest";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from ".";
it("composes a labelled region with a real heading and linked help", () => {
  const ref = createRef<HTMLDivElement>();
  const heading = createRef<HTMLElement>();
  render(
    <Empty ref={ref} role="region" aria-labelledby="empty-title">
      <EmptyHeader>
        <EmptyMedia variant="icon" aria-hidden="true">
          +
        </EmptyMedia>
        <EmptyTitle
          ref={heading}
          id="empty-title"
          render={<h2>No projects</h2>}
        />
        <EmptyDescription>
          Start here or <a href="/help">read the guide</a>.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <button>Create project</button>
      </EmptyContent>
    </Empty>,
  );
  expect(ref.current).toBe(screen.getByRole("region", { name: "No projects" }));
  expect(heading.current).toBe(screen.getByRole("heading", { level: 2 }));
  expect(screen.getByRole("link").getAttribute("href")).toBe("/help");
  expect(screen.queryByRole("alert")).toBeNull();
});
