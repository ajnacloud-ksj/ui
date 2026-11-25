import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createRef, type MouseEvent } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

import { Button } from "@/components/button";

import { QrCode, useQrCode, type UseQrCodeReturn } from ".";

it("renders SVG during server rendering and keeps independent generated IDs", () => {
  const markup = renderToStaticMarkup(
    <QrCode.Root value="PMG:L:12345">
      <QrCode.Frame aria-label="Plant label" />
    </QrCode.Root>,
  );
  expect(markup).toContain('aria-label="Plant label"');
  expect(markup).toMatch(/<path[^>]+d="M/);

  render(
    <>
      <QrCode.Root value="PMG:L:12345">
        <QrCode.Frame aria-label="First label" />
      </QrCode.Root>
      <QrCode.Root value="otpauth://totp/example?secret=JBSWY3DPEHPK3PXP">
        <QrCode.Frame aria-label="Second label" />
      </QrCode.Root>
    </>,
  );
  const first = screen.getByRole("img", { name: "First label" });
  const second = screen.getByRole("img", { name: "Second label" });
  expect(first.id).not.toBe(second.id);
  expect(first.id).not.toContain("undefined");
});

it("updates controlled content and preserves the frame ref", async () => {
  const ref = createRef<SVGSVGElement>();
  const change = vi.fn();
  const view = (value: string) => (
    <QrCode.Root value={value} onValueChange={change}>
      <QrCode.Frame ref={ref} aria-label="Menu" />
      <QrCode.Context>
        {(api) => <button onClick={() => api.setValue("next")}>Update</button>}
      </QrCode.Context>
    </QrCode.Root>
  );
  const { rerender } = render(view("https://example.com/menu"));
  const frame = ref.current;
  const path = frame?.querySelector("path")?.getAttribute("d");
  fireEvent.click(screen.getByRole("button", { name: "Update" }));
  await waitFor(() => expect(change).toHaveBeenCalledWith({ value: "next" }));
  expect(frame?.querySelector("path")?.getAttribute("d")).toBe(path);
  rerender(view("https://example.com/contact"));
  expect(ref.current).toBe(frame);
  expect(frame?.querySelector("path")?.getAttribute("d")).not.toBe(path);
});

it("shares uncontrolled state through RootProvider", async () => {
  const change = vi.fn();
  function Example() {
    const api = useQrCode({ defaultValue: "initial", onValueChange: change });
    return (
      <>
        <QrCode.RootProvider value={api}>
          <QrCode.Frame />
          <QrCode.Context>
            {(value) => <output>{value.value}</output>}
          </QrCode.Context>
        </QrCode.RootProvider>
        <button onClick={() => api.setValue("updated")}>Update</button>
      </>
    );
  }
  render(<Example />);
  expect(screen.getByRole("status").textContent).toBe("initial");
  fireEvent.click(screen.getByRole("button", { name: "Update" }));
  await waitFor(() =>
    expect(screen.getByRole("status").textContent).toBe("updated"),
  );
  expect(change).toHaveBeenCalledWith({ value: "updated" });
});

it("composes download triggers with buttons and respects cancellation and disabled", () => {
  const click = vi.fn((event: MouseEvent<HTMLButtonElement>) =>
    event.preventDefault(),
  );
  const ref = createRef<HTMLButtonElement>();
  render(
    <QrCode.Root value="https://example.com">
      <QrCode.Frame />
      <QrCode.DownloadTrigger
        fileName="menu"
        mimeType="image/png"
        ref={ref}
        onClick={click}
        render={<Button />}
      >
        Download
      </QrCode.DownloadTrigger>
      <QrCode.DownloadTrigger
        fileName="menu"
        mimeType="image/svg+xml"
        disabled
        onClick={click}
        render={<Button />}
      >
        Unavailable
      </QrCode.DownloadTrigger>
    </QrCode.Root>,
  );
  expect(ref.current).toBe(screen.getByRole("button", { name: "Download" }));
  fireEvent.click(ref.current!);
  fireEvent.click(screen.getByRole("button", { name: "Unavailable" }));
  expect(click).toHaveBeenCalledTimes(1);
  expect(ref.current?.type).toBe("button");
});

it("exports the mounted frame as SVG through the store", async () => {
  let store: UseQrCodeReturn | undefined;
  render(
    <QrCode.Root value="PMG:L:12345">
      <QrCode.Frame fill="#123456" />
      <QrCode.Context>
        {(api) => {
          store = api;
          return null;
        }}
      </QrCode.Context>
    </QrCode.Root>,
  );
  const data = await store!.getDataUrl("image/svg+xml");
  expect(data).toMatch(/^data:image\/svg\+xml/);
  const payload = data.slice(data.indexOf(",") + 1);
  const svg = data.slice(0, data.indexOf(",")).includes("base64")
    ? atob(payload)
    : decodeURIComponent(payload);
  expect(svg).toContain(
    screen.getByRole("img").querySelector("path")!.getAttribute("d"),
  );
  expect(svg).toContain("#123456");
});
