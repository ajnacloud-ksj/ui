import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import {
  DescriptionDetail,
  DescriptionGroup,
  DescriptionList,
  DescriptionTerm,
} from "./description-list.js";

describe("DescriptionList", () => {
  it("preserves native semantics, refs, zero values, and interactive content", () => {
    const ref = createRef<HTMLDListElement>();
    render(
      <DescriptionList ref={ref} aria-label="Item details">
        <DescriptionGroup>
          <DescriptionTerm>Quantity</DescriptionTerm>
          <DescriptionDetail>{0}</DescriptionDetail>
        </DescriptionGroup>
        <DescriptionGroup>
          <DescriptionTerm>Owner</DescriptionTerm>
          <DescriptionDetail>
            <a href="/users">View owner</a>
          </DescriptionDetail>
        </DescriptionGroup>
      </DescriptionList>,
    );
    expect(ref.current?.tagName).toBe("DL");
    expect(screen.getByText("Quantity").tagName).toBe("DT");
    expect(screen.getByText("0").tagName).toBe("DD");
    expect(
      screen.getByRole("link", { name: "View owner" }).getAttribute("href"),
    ).toBe("/users");
  });
  it("keeps a nested list independent of its parent's horizontal layout", () => {
    render(
      <DescriptionList orientation="horizontal">
        <DescriptionGroup data-testid="outer">
          <DescriptionTerm>Metadata</DescriptionTerm>
          <DescriptionDetail>
            <DescriptionList>
              <DescriptionGroup data-testid="inner">
                <DescriptionTerm>Status</DescriptionTerm>
                <DescriptionDetail>Active</DescriptionDetail>
              </DescriptionGroup>
            </DescriptionList>
          </DescriptionDetail>
        </DescriptionGroup>
      </DescriptionList>,
    );
    expect(screen.getByTestId("outer").className).toContain("sm:grid-cols-");
    expect(screen.getByTestId("inner").className).not.toContain(
      "sm:grid-cols-",
    );
  });
});
