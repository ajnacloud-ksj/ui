import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import {
  type Member,
  type MembersApi,
  type MembersCapabilities,
  MembersError,
} from "./members-api";
import { MembersBlock } from "./members-block";

const CAPS: MembersCapabilities = {
  can_manage: true,
  can_invite: true,
  invites_enabled: true,
  is_org_admin: false,
  roles: [
    { id: "user", label: "User" },
    { id: "admin", label: "Admin" },
  ],
};

const MEMBERS: Member[] = [
  {
    sub: "s-ravi",
    email: "ravi@example.com",
    display_name: "Ravi",
    role: "admin",
    status: "active",
  },
  {
    sub: "s-inv",
    email: "new@example.com",
    display_name: "New Person",
    role: "user",
    status: "invited",
    invited_by: "Ravi",
    invited_at: "2026-11-25T10:00:00Z",
  },
  {
    sub: "s-pick",
    email: "picker07.acme@users.invalid",
    display_name: "Picker",
    role: "user",
    status: "active",
    no_email: true,
  },
  {
    sub: "s-susp",
    email: "gone@example.com",
    display_name: "Gone",
    role: "user",
    status: "suspended",
  },
];

function fakeApi(overrides: Partial<MembersApi> = {}): MembersApi {
  return {
    list: vi.fn(async () => ({ members: MEMBERS, next_cursor: null })),
    capabilities: vi.fn(async () => CAPS),
    invite: vi.fn(async () => ({
      result: "invited" as const,
      email: "sent" as const,
    })),
    changeRole: vi.fn(async () => ({ changed: true })),
    suspend: vi.fn(async () => ({ status: "suspended" as const })),
    restore: vi.fn(async () => ({ status: "active" as const })),
    remove: vi.fn(async () => ({ removed: true })),
    resend: vi.fn(async () => ({ sent: true })),
    cancelInvite: vi.fn(async () => ({ cancelled: true })),
    resetPassword: vi.fn(async () => ({ sent: true })),
    temporaryPassword: vi.fn(async () => ({
      temporary_password: "Tmp-Pass-9xQ!",
      expires_in_days: 7,
    })),
    ...overrides,
  };
}

async function renderBlock(api: MembersApi = fakeApi()) {
  const user = userEvent.setup();
  render(<MembersBlock api={api} />);
  await screen.findByTestId("members-row-s-ravi");
  return { user, api };
}

const row = (sub: string) => within(screen.getByTestId(`members-row-${sub}`));

describe("the list", () => {
  it("shows each member's name, email, role and status", async () => {
    await renderBlock();
    expect(row("s-ravi").getByText("Ravi")).toBeTruthy();
    expect(row("s-ravi").getByText("ravi@example.com")).toBeTruthy();
    expect(row("s-inv").getByText("Invited")).toBeTruthy();
    expect(row("s-susp").getByText("Suspended")).toBeTruthy();
  });

  it("marks a no-email account and hides its placeholder address", async () => {
    await renderBlock();
    expect(row("s-pick").getByText("No email")).toBeTruthy();
    expect(row("s-pick").queryByText("picker07.acme@users.invalid")).toBeNull();
  });

  it("loads the next page with the cursor", async () => {
    const list = vi
      .fn()
      .mockResolvedValueOnce({
        members: MEMBERS.slice(0, 1),
        next_cursor: "c2",
      })
      .mockResolvedValueOnce({
        members: MEMBERS.slice(1, 2),
        next_cursor: null,
      });
    const { user } = await renderBlock(fakeApi({ list }));
    await user.click(screen.getByTestId("members-more"));
    await screen.findByTestId("members-row-s-inv");
    expect(list).toHaveBeenLastCalledWith(
      expect.objectContaining({ cursor: "c2" }),
    );
    expect(screen.queryByTestId("members-more")).toBeNull();
  });

  it("explains calmly when member management is not switched on", async () => {
    render(
      <MembersBlock
        api={fakeApi({
          capabilities: vi.fn(async () =>
            Promise.reject(new MembersError("members_not_enabled", 404)),
          ),
        })}
      />,
    );
    expect((await screen.findByTestId("members-notice")).textContent).toContain(
      "not switched on",
    );
  });
});

describe("invite", () => {
  it("is not offered to someone who cannot invite", async () => {
    await renderBlock(
      fakeApi({
        capabilities: vi.fn(async () => ({ ...CAPS, can_invite: false })),
      }),
    );
    expect(screen.queryByTestId("members-invite")).toBeNull();
  });

  it("is shown disabled, with the reason, when the organisation does not allow it", async () => {
    await renderBlock(
      fakeApi({
        capabilities: vi.fn(async () => ({ ...CAPS, invites_enabled: false })),
      }),
    );
    const button = screen.getByTestId("members-invite") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(screen.getByTestId("members-invite-reason").textContent).toContain(
      "does not allow app admins to invite",
    );
  });

  it("invites by email with a role, one idempotency key, then reloads", async () => {
    const { user, api } = await renderBlock();
    await user.click(screen.getByTestId("members-invite"));
    await user.type(screen.getByLabelText("Email"), "sam@example.com");
    await user.type(screen.getByLabelText("Name"), "Sam");
    await user.selectOptions(screen.getByLabelText("Role"), "admin");
    await user.click(screen.getByTestId("members-invite-submit"));
    await waitFor(() =>
      expect(api.invite).toHaveBeenCalledWith(
        { email: "sam@example.com", display_name: "Sam", role: "admin" },
        { idempotencyKey: expect.stringMatching(/^[0-9a-f-]{36}$/) },
      ),
    );
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
  });

  it("invites a person with no email by Login ID and shows the temporary password once", async () => {
    const invite = vi.fn(async () => ({
      result: "invited" as const,
      login_id: "worker1.acme@users.invalid",
      temporary_password: "First-Pass-7k!",
    }));
    const { user } = await renderBlock(fakeApi({ invite }));
    await user.click(screen.getByTestId("members-invite"));
    await user.click(screen.getByLabelText("This person has no email"));
    await user.type(screen.getByLabelText("Login ID"), "worker1");
    await user.click(screen.getByTestId("members-invite-submit"));
    await waitFor(() =>
      expect(invite).toHaveBeenCalledWith(
        { no_email: true, login_handle: "worker1", role: "user" },
        expect.objectContaining({ idempotencyKey: expect.any(String) }),
      ),
    );
    expect((await screen.findByTestId("members-secret")).textContent).toContain(
      "First-Pass-7k!",
    );
    expect(screen.getByTestId("members-secret").textContent).toContain(
      "worker1.acme@users.invalid",
    );
    await user.click(screen.getByTestId("members-secret-done"));
    await waitFor(() =>
      expect(screen.queryByText("First-Pass-7k!")).toBeNull(),
    );
  });

  it("shows the server's reason when an invite is refused", async () => {
    const { user } = await renderBlock(
      fakeApi({
        invite: vi.fn(async () =>
          Promise.reject(new MembersError("org_invite_cap", 429)),
        ),
      }),
    );
    await user.click(screen.getByTestId("members-invite"));
    await user.type(screen.getByLabelText("Email"), "sam@example.com");
    await user.click(screen.getByTestId("members-invite-submit"));
    expect((await screen.findByTestId("members-error")).textContent).toContain(
      "daily number of invitations",
    );
  });
});

describe("row actions", () => {
  it("changes a role, and puts it back with the reason when the server refuses", async () => {
    const changeRole = vi.fn(async () =>
      Promise.reject(new MembersError("target_outranks_caller", 403)),
    );
    const { user } = await renderBlock(fakeApi({ changeRole }));
    const select = row("s-inv").getByLabelText(
      "Role for New Person",
    ) as HTMLSelectElement;
    await user.selectOptions(select, "admin");
    expect(changeRole).toHaveBeenCalledWith("s-inv", "admin", {
      idempotencyKey: expect.any(String),
    });
    expect((await screen.findByTestId("members-error")).textContent).toContain(
      "higher role than you",
    );
    expect(select.value).toBe("user");
  });

  it("asks for a reason before suspending", async () => {
    const { user, api } = await renderBlock();
    await user.click(row("s-ravi").getByRole("button", { name: "Suspend" }));
    await user.click(screen.getByTestId("members-suspend-submit"));
    expect(api.suspend).not.toHaveBeenCalled();
    expect(screen.getByTestId("members-dialog-error").textContent).toContain(
      "Give a reason.",
    );
    await user.type(screen.getByLabelText("Reason"), "Left the team");
    await user.click(screen.getByTestId("members-suspend-submit"));
    await waitFor(() =>
      expect(api.suspend).toHaveBeenCalledWith("s-ravi", "Left the team", {
        idempotencyKey: expect.any(String),
      }),
    );
  });

  it("asks before removing someone from the app", async () => {
    const { user, api } = await renderBlock();
    await user.click(row("s-ravi").getByRole("button", { name: "Remove" }));
    expect(api.remove).not.toHaveBeenCalled();
    await user.click(screen.getByTestId("members-remove-submit"));
    await waitFor(() =>
      expect(api.remove).toHaveBeenCalledWith("s-ravi", {
        idempotencyKey: expect.any(String),
      }),
    );
  });

  it("offers resend and cancel only while invited", async () => {
    await renderBlock();
    expect(row("s-inv").getByRole("button", { name: "Resend" })).toBeTruthy();
    expect(
      row("s-inv").getByRole("button", { name: "Cancel invite" }),
    ).toBeTruthy();
    expect(row("s-ravi").queryByRole("button", { name: "Resend" })).toBeNull();
    expect(
      row("s-ravi").queryByRole("button", { name: "Cancel invite" }),
    ).toBeNull();
  });

  it("restores a suspended member", async () => {
    const { user, api } = await renderBlock();
    await user.click(row("s-susp").getByRole("button", { name: "Restore" }));
    await waitFor(() =>
      expect(api.restore).toHaveBeenCalledWith("s-susp", undefined, {
        idempotencyKey: expect.any(String),
      }),
    );
  });

  it("sends a reset email to an email account, and a temporary password for a no-email account", async () => {
    const { user, api } = await renderBlock();
    await user.click(
      row("s-ravi").getByRole("button", { name: "Send password reset" }),
    );
    await waitFor(() =>
      expect(api.resetPassword).toHaveBeenCalledWith("s-ravi", {
        idempotencyKey: expect.any(String),
      }),
    );
    expect(
      row("s-ravi").queryByRole("button", { name: "Temporary password" }),
    ).toBeNull();

    await user.click(
      row("s-pick").getByRole("button", { name: "Temporary password" }),
    );
    await waitFor(() => expect(api.temporaryPassword).toHaveBeenCalled());
    expect((await screen.findByTestId("members-secret")).textContent).toContain(
      "Tmp-Pass-9xQ!",
    );
    expect(
      row("s-pick").queryByRole("button", { name: "Send password reset" }),
    ).toBeNull();
  });

  it("says the change may have been made when the outcome is unknown, and offers a refresh", async () => {
    const remove = vi.fn(async () =>
      Promise.reject(new MembersError("outcome_unknown", 202)),
    );
    const { user, api } = await renderBlock(fakeApi({ remove }));
    await user.click(row("s-ravi").getByRole("button", { name: "Remove" }));
    await user.click(screen.getByTestId("members-remove-submit"));
    expect((await screen.findByTestId("members-error")).textContent).toContain(
      "may have been made",
    );
    await user.click(screen.getByTestId("members-refresh"));
    await waitFor(() => expect(api.list).toHaveBeenCalledTimes(2));
  });

  it("shows no write action to someone who cannot manage", async () => {
    await renderBlock(
      fakeApi({
        capabilities: vi.fn(async () => ({
          ...CAPS,
          can_manage: false,
          can_invite: false,
        })),
      }),
    );
    expect(row("s-ravi").queryByRole("button")).toBeNull();
    expect(row("s-ravi").queryByRole("combobox")).toBeNull();
  });
});
