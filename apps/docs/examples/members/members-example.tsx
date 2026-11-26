"use client";

import {
  type Member,
  type MembersApi,
  MembersBlock,
  type MembersCapabilities,
} from "@ajnacloud/ui";
import { useMemo } from "react";

const capabilities: MembersCapabilities = {
  can_manage: true,
  can_invite: true,
  invites_enabled: true,
  is_org_admin: false,
  roles: [
    { id: "user", label: "User" },
    { id: "admin", label: "Admin" },
  ],
};

const seed: Member[] = [
  {
    sub: "1",
    email: "asha@example.com",
    display_name: "Asha Rao",
    role: "admin",
    status: "active",
  },
  {
    sub: "2",
    email: "ben@example.com",
    display_name: "Ben Ito",
    role: "user",
    status: "invited",
    invited_by: "Asha Rao",
    invited_at: "2026-11-20T09:00:00Z",
  },
  {
    sub: "3",
    email: "picker07.acme@users.invalid",
    display_name: "Picker 07",
    role: "user",
    status: "active",
    no_email: true,
  },
];

// The docs preview runs on an in-memory API; an app passes membersApi() instead.
function memoryApi(): MembersApi {
  let members = [...seed];
  const ok = async <T,>(value: T) => value;
  return {
    list: () => ok({ members, next_cursor: null }),
    capabilities: () => ok(capabilities),
    invite: async (body) => {
      const sub = String(members.length + 1);
      const noEmail = "no_email" in body;
      members = [
        ...members,
        {
          sub,
          email: noEmail
            ? `${body.login_handle}.acme@users.invalid`
            : body.email,
          display_name: body.display_name ?? "",
          role: body.role,
          status: noEmail ? "active" : "invited",
          no_email: noEmail,
        },
      ];
      return noEmail
        ? {
            result: "invited",
            login_id: `${body.login_handle}.acme@users.invalid`,
            temporary_password: "Example-Only-1!",
          }
        : { result: "invited", email: "sent" };
    },
    changeRole: async (sub, role) => {
      members = members.map((m) => (m.sub === sub ? { ...m, role } : m));
      return { changed: true };
    },
    suspend: async (sub) => {
      members = members.map((m) =>
        m.sub === sub ? { ...m, status: "suspended" } : m,
      );
      return { status: "suspended" };
    },
    restore: async (sub) => {
      members = members.map((m) =>
        m.sub === sub ? { ...m, status: "active" } : m,
      );
      return { status: "active" };
    },
    remove: async (sub) => {
      members = members.filter((m) => m.sub !== sub);
      return { removed: true };
    },
    resend: () => ok({ sent: true }),
    cancelInvite: async (sub) => {
      members = members.filter((m) => m.sub !== sub);
      return { cancelled: true };
    },
    resetPassword: () => ok({ sent: true }),
    temporaryPassword: () =>
      ok({ temporary_password: "Example-Only-2!", expires_in_days: 7 }),
  };
}

export function MembersExample() {
  const api = useMemo(() => memoryApi(), []);
  return <MembersBlock api={api} />;
}
