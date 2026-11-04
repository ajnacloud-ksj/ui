import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { expect, it, vi } from "vitest";

import {
  createToastManager,
  Toast,
  toast,
  ToastAction,
  ToastClose,
  ToastContent,
  ToastDescription,
  Toaster,
  ToastPortal,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  useToastManager,
} from ".";

it("announces explicitly high-priority messages without stealing focus", async () => {
  const manager = createToastManager();
  render(
    <Toaster toastManager={manager} timeout={0}>
      <button>Keep editing</button>
    </Toaster>,
  );
  const editing = screen.getByRole("button", { name: "Keep editing" });
  editing.focus();
  act(() => {
    manager.add({
      title: "Connection lost",
      description: "Your changes have not been sent.",
      type: "error",
      priority: "high",
    });
  });
  const announcement = await screen.findByRole("alert");
  expect(announcement.textContent).toContain("Connection lost");
  expect(document.activeElement).toBe(editing);
});

it("renders default-manager notifications, action props, and close/removal callbacks", async () => {
  const close = vi.fn();
  const remove = vi.fn();
  const action = vi.fn();
  render(<Toaster timeout={0} />);
  let id = "";
  act(() => {
    id = toast.add({
      title: "Project saved",
      description: "Website is up to date.",
      type: "success",
      onClose: close,
      onRemove: remove,
      actionProps: {
        children: "Undo",
        onClick: () => {
          action();
          toast.close(id);
        },
      },
    });
  });
  const notification = await screen.findByRole("dialog", {
    name: "Project saved",
  });
  expect(within(notification).getByText("Website is up to date.")).toBeTruthy();
  await userEvent.hover(notification);
  await userEvent.click(
    within(notification).getByRole("button", { name: "Undo" }),
  );
  expect(action).toHaveBeenCalledOnce();
  await waitFor(() =>
    expect(screen.queryByRole("dialog", { name: "Project saved" })).toBeNull(),
  );
  expect(close).toHaveBeenCalledOnce();
  expect(remove).toHaveBeenCalledOnce();
});

it("updates a stable ID in place and renders loading with a decorative shared Spinner", async () => {
  const manager = createToastManager();
  render(<Toaster toastManager={manager} timeout={0} />);
  act(() => {
    manager.add({ id: "upload", title: "Uploading", type: "loading" });
  });
  const notification = await screen.findByRole("dialog", { name: "Uploading" });
  expect(
    notification
      .querySelector('[data-ajna-component="spinner"]')
      ?.getAttribute("aria-hidden"),
  ).toBe("true");
  expect(within(notification).queryByRole("status")).toBeNull();
  act(() => {
    manager.update("upload", {
      title: "Upload complete",
      type: "success",
      timeout: 0,
    });
  });
  expect(await screen.findByRole("dialog", { name: "Upload complete" })).toBe(
    notification,
  );
  expect(
    notification.querySelector('[data-ajna-component="spinner"]'),
  ).toBeNull();
  act(() => {
    manager.add({ id: "upload", title: "Project uploaded", timeout: 0 });
  });
  expect(await screen.findByRole("dialog", { name: "Project uploaded" })).toBe(
    notification,
  );
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
});

it("tracks promise success and rejection without adding a second notification", async () => {
  const manager = createToastManager();
  render(<Toaster toastManager={manager} timeout={0} />);
  let resolve!: (value: string) => void;
  const request = new Promise<string>((done) => {
    resolve = done;
  });
  let handled!: Promise<string>;
  act(() => {
    handled = manager.promise(request, {
      loading: "Creating project",
      success: (name) => ({ title: `${name} created`, timeout: 0 }),
      error: "Could not create project",
    });
  });
  const pending = (await screen.findByText("Creating project")).closest(
    '[data-slot="toast"]',
  );
  await act(async () => {
    resolve("Website");
    await expect(handled).resolves.toBe("Website");
  });
  expect(await screen.findByRole("dialog", { name: "Website created" })).toBe(
    pending,
  );
  act(() => manager.close());
  await waitFor(() => expect(screen.queryAllByRole("dialog")).toHaveLength(0));
  let reject!: (reason: Error) => void;
  const failure = new Promise<string>((_, fail) => {
    reject = fail;
  });
  let caught!: Promise<void>;
  act(() => {
    caught = manager
      .promise(failure, {
        loading: "Retrying",
        success: "Created",
        error: (error) => ({ title: error.message, timeout: 0 }),
      })
      .then(
        () => undefined,
        () => undefined,
      );
  });
  await screen.findByText("Retrying");
  await act(async () => {
    reject(new Error("Connection lost"));
    await caught;
  });
  const failed = await screen.findByRole("dialog", { name: "Connection lost" });
  expect(failed.getAttribute("data-type")).toBe("error");
  expect(screen.getAllByRole("dialog")).toHaveLength(1);
});

it("preserves custom portal destinations, refs, state classes, and translated close labels", async () => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const manager = createToastManager();
  const root = createRef<HTMLDivElement>();
  const title = createRef<HTMLHeadingElement>();
  const viewport = createRef<HTMLDivElement>();
  const close = createRef<HTMLButtonElement>();
  function List() {
    const { toasts } = useToastManager();
    return toasts.map((item) => (
      <Toast
        key={item.id}
        toast={item}
        ref={root}
        className={(state) =>
          state.type === "info" ? "custom-toast" : undefined
        }
      >
        <ToastContent>
          <ToastTitle ref={title} />
          <ToastDescription />
          <ToastAction />
          <ToastClose ref={close} aria-label="Dismiss notification" />
        </ToastContent>
      </Toast>
    ));
  }
  const view = render(
    <ToastProvider toastManager={manager} timeout={0}>
      <ToastPortal container={container}>
        <ToastViewport ref={viewport} aria-label="Project notifications">
          <List />
        </ToastViewport>
      </ToastPortal>
    </ToastProvider>,
  );
  act(() => {
    manager.add({ title: "Project shared", type: "info" });
  });
  const notification = await screen.findByRole("dialog", {
    name: "Project shared",
  });
  expect(container.contains(notification)).toBe(true);
  expect(root.current).toBe(notification);
  expect(title.current).toBe(
    screen.getByRole("heading", { name: "Project shared" }),
  );
  expect(viewport.current).toBe(
    screen.getByRole("region", { name: "Project notifications" }),
  );
  expect(notification.classList.contains("custom-toast")).toBe(true);
  await userEvent.hover(notification);
  const dismiss = within(notification).getByRole("button", {
    name: "Dismiss notification",
  });
  expect(close.current).toBe(dismiss);
  await userEvent.click(dismiss);
  await waitFor(() =>
    expect(screen.queryByRole("dialog", { name: "Project shared" })).toBeNull(),
  );
  view.unmount();
  container.remove();
});

it("supports isolated managers and the scoped hook beneath Toaster", async () => {
  const first = createToastManager();
  const second = createToastManager();
  function Trigger() {
    const manager = useToastManager<{ project: string }>();
    return (
      <button
        onClick={() =>
          manager.add({
            title: "Local notification",
            data: { project: "Website" },
          })
        }
      >
        Notify locally
      </button>
    );
  }
  render(
    <>
      <Toaster toastManager={first} timeout={0}>
        <Trigger />
      </Toaster>
      <Toaster toastManager={second} timeout={0} />
    </>,
  );
  await userEvent.click(screen.getByRole("button", { name: "Notify locally" }));
  expect(
    await screen.findByRole("dialog", { name: "Local notification" }),
  ).toBeTruthy();
  act(() => {
    second.add({ title: "Other scope" });
  });
  expect(
    await screen.findByRole("dialog", { name: "Other scope" }),
  ).toBeTruthy();
  act(() => first.close());
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Local notification" }),
    ).toBeNull(),
  );
  expect(screen.getByRole("dialog", { name: "Other scope" })).toBeTruthy();
});

it("dismisses timed notifications while keeping timeout zero persistent", async () => {
  const manager = createToastManager();
  render(<Toaster toastManager={manager} timeout={150} />);
  act(() => {
    manager.add({ title: "Timed notification" });
    manager.add({ title: "Persistent notification", timeout: 0 });
  });
  await screen.findByRole("dialog", { name: "Timed notification" });
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Timed notification" }),
    ).toBeNull(),
  );
  expect(
    screen.getByRole("dialog", { name: "Persistent notification" }),
  ).toBeTruthy();
});

it("keeps limited notifications in the manager and preserves F6 keyboard access", async () => {
  const manager = createToastManager();
  render(
    <Toaster toastManager={manager} timeout={0} limit={1}>
      <button>Previous control</button>
    </Toaster>,
  );
  act(() => {
    manager.add({ title: "Older notification" });
    manager.add({ title: "Newest notification" });
  });
  await screen.findByRole("dialog", { name: "Newest notification" });
  const older = screen
    .getByText("Older notification")
    .closest('[data-slot="toast"]');
  expect(older?.hasAttribute("data-limited")).toBe(true);
  const previous = screen.getByRole("button", { name: "Previous control" });
  previous.focus();
  fireEvent.keyDown(previous, { key: "F6" });
  await waitFor(() =>
    expect(document.activeElement).toBe(
      screen.getByRole("region", { name: "Notifications" }),
    ),
  );
});

it("scopes rich colors to each provider and follows status changes in place", async () => {
  const richManager = createToastManager();
  const plainManager = createToastManager();
  render(
    <>
      <Toaster richColors toastManager={richManager} timeout={0} />
      <Toaster toastManager={plainManager} timeout={0} />
    </>,
  );
  let id = "";
  act(() => {
    id = richManager.add({ title: "Rich success", type: "success" });
    plainManager.add({ title: "Plain warning", type: "warning" });
  });
  const rich = await screen.findByRole("dialog", { name: "Rich success" });
  expect(rich.getAttribute("data-rich-colors")).toBe("true");
  expect(
    (await screen.findByRole("dialog", { name: "Plain warning" })).getAttribute(
      "data-rich-colors",
    ),
  ).toBe("false");
  act(() => {
    richManager.update(id, { title: "Rich error", type: "error" });
  });
  expect(await screen.findByRole("dialog", { name: "Rich error" })).toBe(rich);
  expect(rich.getAttribute("data-rich-colors")).toBe("true");
  act(() => {
    richManager.update(id, { title: "Loading", type: "loading" });
  });
  await screen.findByRole("dialog", { name: "Loading" });
  expect(rich.getAttribute("data-rich-colors")).toBe("false");
});

it("allows custom renderers to override the provider's rich color mode", async () => {
  const manager = createToastManager();
  function List() {
    const { toasts } = useToastManager();
    return (
      <ToastPortal>
        <ToastViewport>
          {toasts.map((item) => (
            <Toast key={item.id} toast={item} richColors={false}>
              <ToastContent>
                <ToastTitle />
              </ToastContent>
            </Toast>
          ))}
        </ToastViewport>
      </ToastPortal>
    );
  }
  render(
    <ToastProvider richColors toastManager={manager}>
      <List />
    </ToastProvider>,
  );
  act(() => {
    manager.add({ title: "Plain override", type: "success" });
  });
  expect(
    (
      await screen.findByRole("dialog", { name: "Plain override" })
    ).getAttribute("data-rich-colors"),
  ).toBe("false");
});
