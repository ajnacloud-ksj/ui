import { type ReactNode, useEffect, useState } from "react";

import { Badge } from "@/components/badge";
import { Banner } from "@/components/banner";
import { Button } from "@/components/button";
import { Table } from "@/components/table";

import {
  type InviteBody,
  type Member,
  type MembersApi,
  type MembersCapabilities,
  MembersError,
  type MembersErrorCode,
  membersErrorMessage,
  type MemberStatus,
} from "./members-api";
import {
  InviteDialog,
  RemoveDialog,
  SecretDialog,
  type ShownSecret,
  SuspendDialog,
} from "./members-dialogs";

export interface MembersBlockProps {
  /** The app's member routes; usually `membersApi()`. Every rule is the server's. */
  api: MembersApi;
  /** The heading above the list. */
  title?: ReactNode;
}

const STATUS: Readonly<
  Record<
    MemberStatus,
    { label: string; variant: "success" | "info" | "warning" | "secondary" }
  >
> = {
  active: { label: "Active", variant: "success" },
  invited: { label: "Invited", variant: "info" },
  invite_expired: { label: "Invite expired", variant: "warning" },
  suspended: { label: "Suspended", variant: "secondary" },
};

const NOTICE_CODES: ReadonlySet<MembersErrorCode> = new Set([
  "members_not_enabled",
  "not_admin",
  "managed_by_cockpit",
]);
const nativeSelect =
  "h-8 rounded-md border border-ajna-border bg-ajna-background px-2 text-sm text-ajna-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ajna-ring";

const codeOf = (err: unknown): MembersErrorCode =>
  err instanceof MembersError ? err.code : "unavailable";
const key = (): { idempotencyKey: string } => ({
  idempotencyKey: crypto.randomUUID(),
});

type Dialogs =
  | { kind: "invite" }
  | { kind: "suspend"; member: Member }
  | { kind: "remove"; member: Member }
  | null;

export function MembersBlock({ api, title = "Members" }: MembersBlockProps) {
  const [caps, setCaps] = useState<MembersCapabilities | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [notice, setNotice] = useState<MembersErrorCode | null>(null);
  const [error, setError] = useState<MembersErrorCode | null>(null);
  const [dialog, setDialog] = useState<Dialogs>(null);
  const [secret, setSecret] = useState<ShownSecret | null>(null);
  const [pending, setPending] = useState(false);
  // Bumped to reload the first page (after a change, or by Refresh).
  const [generation, setGeneration] = useState(0);
  const reload = () => setGeneration((n) => n + 1);

  useEffect(() => {
    let live = true;
    Promise.all([api.capabilities(), api.list({ limit: 50 })]).then(
      ([capabilities, page]) => {
        if (!live) return;
        setCaps(capabilities);
        setMembers(page.members);
        setCursor(page.next_cursor);
        setNotice(null);
      },
      (err: unknown) => {
        if (!live) return;
        const code = codeOf(err);
        if (NOTICE_CODES.has(code)) setNotice(code);
        else setError(code);
      },
    );
    return () => {
      live = false;
    };
  }, [api, generation]);

  async function loadMore() {
    if (!cursor) return;
    try {
      const page = await api.list({ limit: 50, cursor });
      setMembers((prev) => [...prev, ...page.members]);
      setCursor(page.next_cursor);
    } catch (err: unknown) {
      setError(codeOf(err));
    }
  }

  /** Run one write; on success reload, on failure show the server's reason. */
  async function act(
    write: () => Promise<unknown>,
    after?: (result: unknown) => void,
  ): Promise<boolean> {
    setPending(true);
    setError(null);
    try {
      const result = await write();
      after?.(result);
      setDialog(null);
      reload();
      return true;
    } catch (err: unknown) {
      setError(codeOf(err));
      return false;
    } finally {
      setPending(false);
    }
  }

  function invite(body: InviteBody) {
    void act(
      () => api.invite(body, key()),
      (result) => {
        const r = result as { temporary_password?: string; login_id?: string };
        if (r.temporary_password) {
          setSecret({
            name:
              body.display_name ||
              ("login_handle" in body ? body.login_handle : ""),
            loginId: r.login_id,
            password: r.temporary_password,
          });
        }
      },
    );
  }

  async function changeRole(
    member: Member,
    role: string,
    select: HTMLSelectElement,
  ) {
    const ok = await act(() => api.changeRole(member.sub, role, key()));
    if (!ok) select.value = member.role;
  }

  if (notice) {
    return (
      <Banner
        variant="info"
        data-testid="members-notice"
        title={membersErrorMessage(notice)}
      />
    );
  }

  const canManage = caps?.can_manage === true;
  const roleLabel = (id: string) =>
    caps?.roles.find((r) => r.id === id)?.label ?? id;

  return (
    <section className="space-y-4" aria-label="Members">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">{title}</h2>
        {caps?.can_invite && (
          <div className="flex items-center gap-3">
            {!caps.invites_enabled && (
              <span
                className="text-xs text-ajna-muted-foreground"
                data-testid="members-invite-reason"
              >
                {membersErrorMessage("invites_disabled")}
              </span>
            )}
            <Button
              variant="primary"
              disabled={!caps.invites_enabled}
              onClick={() => setDialog({ kind: "invite" })}
              data-testid="members-invite"
            >
              Invite
            </Button>
          </div>
        )}
      </header>

      {error && (
        <Banner
          variant="destructive"
          data-testid="members-error"
          title={membersErrorMessage(error)}
          action={
            error === "outcome_unknown" || error === "change_applied" ? (
              <Button
                variant="secondary"
                onClick={reload}
                data-testid="members-refresh"
              >
                Refresh
              </Button>
            ) : undefined
          }
        />
      )}

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>Person</Table.Head>
            <Table.Head>Role</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Invited</Table.Head>
            {canManage && <Table.Head>Actions</Table.Head>}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {members.map((m) => (
            <Table.Row key={m.sub} data-testid={`members-row-${m.sub}`}>
              <Table.Cell>
                <div className="font-medium">{m.display_name || "—"}</div>
                {m.no_email ? (
                  <Badge variant="outline">No email</Badge>
                ) : (
                  <div className="text-xs text-ajna-muted-foreground">
                    {m.email}
                  </div>
                )}
              </Table.Cell>
              <Table.Cell>
                {canManage ? (
                  <select
                    aria-label={`Role for ${m.display_name || m.email}`}
                    className={nativeSelect}
                    defaultValue={m.role}
                    disabled={pending}
                    onChange={(e) =>
                      void changeRole(m, e.target.value, e.currentTarget)
                    }
                  >
                    {(caps?.roles ?? []).map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  roleLabel(m.role)
                )}
              </Table.Cell>
              <Table.Cell>
                <Badge variant={STATUS[m.status].variant}>
                  {STATUS[m.status].label}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <span className="text-xs text-ajna-muted-foreground">
                  {m.invited_by ? `${m.invited_by}` : ""}
                  {m.invited_at
                    ? ` · ${new Date(m.invited_at).toLocaleDateString()}`
                    : ""}
                </span>
              </Table.Cell>
              {canManage && (
                <Table.Cell>
                  <div className="flex flex-wrap gap-2">
                    {m.status === "suspended" ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() =>
                          void act(() => api.restore(m.sub, undefined, key()))
                        }
                      >
                        Restore
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() =>
                          setDialog({ kind: "suspend", member: m })
                        }
                      >
                        Suspend
                      </Button>
                    )}
                    {(m.status === "invited" ||
                      m.status === "invite_expired") &&
                      !m.no_email && (
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={pending}
                          onClick={() =>
                            void act(() => api.resend(m.sub, key()))
                          }
                        >
                          Resend
                        </Button>
                      )}
                    {(m.status === "invited" ||
                      m.status === "invite_expired") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() =>
                          void act(() => api.cancelInvite(m.sub, key()))
                        }
                      >
                        Cancel invite
                      </Button>
                    )}
                    {m.status === "active" && !m.no_email && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() =>
                          void act(() => api.resetPassword(m.sub, key()))
                        }
                      >
                        Send password reset
                      </Button>
                    )}
                    {m.no_email && m.status !== "suspended" && (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={pending}
                        onClick={() =>
                          void act(
                            () => api.temporaryPassword(m.sub, key()),
                            (r) =>
                              setSecret({
                                name: m.display_name,
                                password: (r as { temporary_password: string })
                                  .temporary_password,
                              }),
                          )
                        }
                      >
                        Temporary password
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={pending}
                      onClick={() => setDialog({ kind: "remove", member: m })}
                    >
                      Remove
                    </Button>
                  </div>
                </Table.Cell>
              )}
            </Table.Row>
          ))}
          {caps && members.length === 0 && (
            <Table.EmptyRow colSpan={canManage ? 5 : 4}>
              No members yet.
            </Table.EmptyRow>
          )}
        </Table.Body>
      </Table>

      {cursor && (
        <Button
          variant="secondary"
          onClick={() => void loadMore()}
          data-testid="members-more"
        >
          Show more
        </Button>
      )}

      <InviteDialog
        open={dialog?.kind === "invite"}
        roles={caps?.roles ?? []}
        pending={pending}
        onOpenChange={(open) => !open && setDialog(null)}
        onSubmit={invite}
      />
      <SuspendDialog
        open={dialog?.kind === "suspend"}
        name={dialog?.kind === "suspend" ? dialog.member.display_name : ""}
        pending={pending}
        onOpenChange={(open) => !open && setDialog(null)}
        onSubmit={(reason) =>
          dialog?.kind === "suspend" &&
          void act(() => api.suspend(dialog.member.sub, reason, key()))
        }
      />
      <RemoveDialog
        open={dialog?.kind === "remove"}
        name={dialog?.kind === "remove" ? dialog.member.display_name : ""}
        pending={pending}
        onOpenChange={(open) => !open && setDialog(null)}
        onConfirm={() =>
          dialog?.kind === "remove" &&
          void act(() => api.remove(dialog.member.sub, key()))
        }
      />
      <SecretDialog secret={secret} onDone={() => setSecret(null)} />
    </section>
  );
}
