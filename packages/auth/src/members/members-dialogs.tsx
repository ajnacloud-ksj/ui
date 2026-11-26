import { Button } from "@ajnacloud/ui/button";
import { CopyButton } from "@ajnacloud/ui/copy-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@ajnacloud/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@ajnacloud/ui/field";
import { Input } from "@ajnacloud/ui/input";
import { type FormEvent, useId, useState } from "react";

import type { InviteBody, RoleOption } from "./members-api";

const nativeSelect =
  "h-9 w-full rounded-md border border-ajna-border bg-ajna-background px-3 text-sm text-ajna-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ajna-ring";

interface InviteDialogProps {
  open: boolean;
  roles: RoleOption[];
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (body: InviteBody) => void;
}

export function InviteDialog({
  open,
  roles,
  pending,
  onOpenChange,
  onSubmit,
}: InviteDialogProps) {
  const id = useId();
  const [noEmail, setNoEmail] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("display_name") ?? "").trim();
    const role = String(data.get("role") ?? roles[0]?.id ?? "");
    const optionalName = name ? { display_name: name } : {};
    if (noEmail) {
      const handle = String(data.get("login_handle") ?? "")
        .trim()
        .toLowerCase();
      if (!/^[a-z0-9]+(\.[a-z0-9]+)*$/.test(handle))
        return setError("Enter a Login ID: letters, numbers and dots.");
      setError("");
      onSubmit({ no_email: true, login_handle: handle, ...optionalName, role });
      return;
    }
    const email = String(data.get("email") ?? "").trim();
    if (!email.includes("@")) return setError("Enter an email address.");
    setError("");
    onSubmit({ email, ...optionalName, role });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to this app</DialogTitle>
          <DialogDescription>
            The person gets an email to join, unless they have no email.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit} noValidate>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={noEmail}
              onChange={(e) => setNoEmail(e.target.checked)}
            />
            This person has no email
          </label>
          {noEmail ? (
            <Field>
              <FieldLabel htmlFor={`${id}-handle`}>Login ID</FieldLabel>
              <Input
                id={`${id}-handle`}
                name="login_handle"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              <FieldDescription>
                They sign in with this ID on your organisation's page.
              </FieldDescription>
            </Field>
          ) : (
            <Field>
              <FieldLabel htmlFor={`${id}-email`}>Email</FieldLabel>
              <Input
                id={`${id}-email`}
                name="email"
                type="email"
                autoComplete="off"
              />
            </Field>
          )}
          <Field>
            <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
            <Input id={`${id}-name`} name="display_name" autoComplete="off" />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-role`}>Role</FieldLabel>
            <select
              id={`${id}-role`}
              name="role"
              className={nativeSelect}
              defaultValue={roles[0]?.id}
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
          {error && (
            <FieldError data-testid="members-dialog-error">{error}</FieldError>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={pending}
              data-testid="members-invite-submit"
            >
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ReasonDialogProps {
  open: boolean;
  name: string;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (reason: string) => void;
}

export function SuspendDialog({
  open,
  name,
  pending,
  onOpenChange,
  onSubmit,
}: ReasonDialogProps) {
  const id = useId();
  const [error, setError] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspend {name}</DialogTitle>
          <DialogDescription>
            They lose access to this app. Their other apps are not affected.
          </DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            const reason = String(
              new FormData(event.currentTarget).get("reason") ?? "",
            ).trim();
            if (!reason) return setError("Give a reason.");
            setError("");
            onSubmit(reason);
          }}
        >
          <Field>
            <FieldLabel htmlFor={`${id}-reason`}>Reason</FieldLabel>
            <Input
              id={`${id}-reason`}
              name="reason"
              maxLength={200}
              autoComplete="off"
            />
          </Field>
          {error && (
            <FieldError data-testid="members-dialog-error">{error}</FieldError>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              loading={pending}
              data-testid="members-suspend-submit"
            >
              Suspend
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  name: string;
  pending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RemoveDialog({
  open,
  name,
  pending,
  onOpenChange,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {name} from this app?</DialogTitle>
          <DialogDescription>
            They lose access to this app. Their other apps are not affected.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            loading={pending}
            onClick={onConfirm}
            data-testid="members-remove-submit"
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export interface ShownSecret {
  name: string;
  loginId?: string;
  password: string;
}

interface SecretDialogProps {
  secret: ShownSecret | null;
  onDone: () => void;
}

/** A temporary password, shown ONCE. It lives only in this dialog's props and is dropped on Done. */
export function SecretDialog({ secret, onDone }: SecretDialogProps) {
  return (
    <Dialog open={secret !== null} onOpenChange={(open) => !open && onDone()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Temporary password for {secret?.name}</DialogTitle>
          <DialogDescription>
            Give it to them in person. They must change it at their first
            sign-in. It is not shown again.
          </DialogDescription>
        </DialogHeader>
        {secret && (
          <div className="space-y-3 text-sm" data-testid="members-secret">
            {secret.loginId && (
              <p>
                Login ID:{" "}
                <code className="bg-ajna-muted rounded px-1">
                  {secret.loginId}
                </code>
              </p>
            )}
            <p className="flex items-center gap-2">
              Password:{" "}
              <code className="bg-ajna-muted rounded px-1">
                {secret.password}
              </code>
              <CopyButton
                value={secret.password}
                aria-label="Copy the temporary password"
                variant="ghost"
              />
            </p>
          </div>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="primary"
            onClick={onDone}
            data-testid="members-secret-done"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
