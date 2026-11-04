import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { expect, it } from "vitest";

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from ".";
it("supports custom semantic elements, heading levels, and refs", () => {
  const ref = createRef<HTMLElement>();
  const heading = createRef<HTMLElement>();
  render(
    <Card ref={ref} render={<section />} aria-labelledby="card-title" size="sm">
      <CardHeader>
        <CardTitle
          ref={heading}
          id="card-title"
          render={<h2>Project settings</h2>}
        />
        <CardDescription>Keep your project up to date.</CardDescription>
        <CardAction>
          <a href="/help">Help</a>
        </CardAction>
      </CardHeader>
      <CardContent>
        <label htmlFor="project">Name</label>
        <input id="project" />
      </CardContent>
      <CardFooter>
        <button>Save</button>
      </CardFooter>
    </Card>,
  );
  expect(ref.current).toBe(
    screen.getByRole("region", { name: "Project settings" }),
  );
  expect(heading.current).toBe(screen.getByRole("heading", { level: 2 }));
  expect(screen.getByLabelText("Name")).toBeTruthy();
  expect(ref.current?.getAttribute("data-size")).toBe("sm");
});
