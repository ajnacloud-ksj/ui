import type { ReactNode } from "react";

export interface PageShellProps {
  title: string;
  description?: ReactNode;
  eyebrow?: ReactNode;
  count?: number;
  actions?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
}

export function PageShell({
  title,
  description,
  eyebrow,
  count,
  actions,
  navigation,
  children,
}: PageShellProps) {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 py-7 text-ajna-foreground sm:px-8 sm:py-9">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          {eyebrow && (
            <div className="text-xs font-medium text-ajna-muted-foreground">
              {eyebrow}
            </div>
          )}
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {count !== undefined && (
              <span className="text-sm text-ajna-muted-foreground tabular-nums">
                {count}
              </span>
            )}
          </div>
          {description && (
            <p className="max-w-2xl text-sm leading-6 text-ajna-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </header>
      {navigation}
      {children}
    </section>
  );
}
