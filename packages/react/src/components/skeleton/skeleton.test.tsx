import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";

import { Skeleton } from "./skeleton.js";

describe("Skeleton", () => {
  it("keeps placeholder structure decorative while preserving the region's loading status", () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <section aria-busy="true" aria-label="Profile">
        <span role="status">Loading profile</span>
        <Skeleton
          ref={ref}
          data-testid="placeholder"
          style={{ width: 160, height: 20 }}
        >
          <h2>Placeholder</h2>
        </Skeleton>
      </section>,
    );
    expect(screen.queryByRole("heading")).toBeNull();
    expect(screen.getByRole("status").textContent).toBe("Loading profile");
    expect(
      screen.getByRole("region", { name: "Profile" }).getAttribute("aria-busy"),
    ).toBe("true");
    expect(ref.current).toBe(screen.getByTestId("placeholder"));
  });
});
