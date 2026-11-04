"use client";

import {
  Avatar,
  AvatarFallback,
  Button,
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DropdownMenu,
  Field,
  FieldLabel,
  Input,
  Kbd,
  useSidebar,
} from "@ajnacloud/ui";
import {
  Activity,
  ChevronDown,
  Leaf,
  Package,
  Plus,
  Search,
  Settings,
  SunMoon,
} from "lucide-react";
import { useEffect, useId, useState } from "react";

import {
  InventoryScreen,
  useInventoryExample,
} from "@/blocks/collection-page/collection-page-example";
import { LoginPage } from "@/blocks/login-page/login-page";
import { PageShell } from "@/blocks/page-shell/page-shell";

import { AppShell } from "./app-shell";

type Section = "products" | "activity" | "settings";

function AccountMenu({
  name,
  onSettings,
  onSignOut,
}: {
  name: string;
  onSettings: () => void;
  onSignOut: () => void;
}) {
  const { state, isMobile } = useSidebar();
  const compact = state === "collapsed" && !isMobile;
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        render={
          <Button
            variant="ghost"
            className={
              compact
                ? "h-[2.125rem] w-full justify-center px-0 text-ajna-sidebar-foreground [&:hover:not(:disabled)]:bg-ajna-sidebar-accent"
                : "w-full justify-start text-ajna-sidebar-foreground [&:hover:not(:disabled)]:bg-ajna-sidebar-accent"
            }
            aria-label="Account menu"
          />
        }
      >
        <Avatar size="sm" aria-hidden="true">
          <AvatarFallback>
            {name
              .split(" ")
              .map((part) => part[0])
              .slice(0, 2)
              .join("")}
          </AvatarFallback>
        </Avatar>
        {!compact && (
          <>
            <span className="min-w-0 flex-1 truncate text-start">{name}</span>
            <ChevronDown aria-hidden="true" className="size-3.5" />
          </>
        )}
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="top" align="start">
        <DropdownMenu.Group>
          <DropdownMenu.Label>Personal account</DropdownMenu.Label>
          <DropdownMenu.Item onClick={onSettings}>
            Profile settings
          </DropdownMenu.Item>
          <DropdownMenu.Separator />
          <DropdownMenu.Item onClick={onSignOut}>Sign out</DropdownMenu.Item>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

export function AppShellExample() {
  const [section, setSection] = useState<Section>("products");
  const [name, setName] = useState("Alex Rivera");
  const [commandOpen, setCommandOpen] = useState(false);
  const [signedIn, setSignedIn] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const inventory = useInventoryExample();
  const id = useId();
  useEffect(() => {
    if (!signedIn) return;
    function shortcut(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k" &&
        !event.repeat
      ) {
        event.preventDefault();
        setCommandOpen((open) => !open);
      }
    }
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [signedIn]);

  if (!signedIn)
    return (
      <LoginPage
        organization="Greenhouse"
        application="Inventory and operations"
        onSignIn={() => setSignedIn(true)}
      />
    );

  function navigate(next: string) {
    setSection(
      next === "#activity"
        ? "activity"
        : next === "#settings"
          ? "settings"
          : "products",
    );
    setCommandOpen(false);
  }

  return (
    <AppShell
      name="Greenhouse"
      subtitle="Inventory and operations"
      navigation={[
        {
          label: "Products",
          href: "#products",
          icon: <Package />,
          active: section === "products",
        },
        {
          label: "Activity",
          href: "#activity",
          icon: <Activity />,
          active: section === "activity",
        },
      ]}
      secondaryNavigation={[
        {
          label: "Settings",
          href: "#settings",
          icon: <Settings />,
          active: section === "settings",
        },
      ]}
      onNavigate={(item) => navigate(item.href)}
      account={
        <AccountMenu
          name={name}
          onSettings={() => navigate("#settings")}
          onSignOut={() => {
            setSignedIn(false);
            setCommandOpen(false);
          }}
        />
      }
      header={
        <>
          <span className="text-sm text-ajna-muted-foreground">
            Workspace <span className="mx-2 text-ajna-border">/</span>
            <span className="font-medium text-ajna-foreground capitalize">
              {section}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setCommandOpen(true)}
              aria-label="Search workspace"
              className="gap-2"
            >
              <Search aria-hidden="true" className="size-4" />
              <span className="hidden text-xs text-ajna-muted-foreground sm:inline">
                Search workspace
              </span>
              <Kbd className="hidden sm:inline-flex">⌘ K</Kbd>
            </Button>
            <Button
              variant="ghost"
              shape="square"
              aria-label="Toggle color theme"
              icon={<SunMoon />}
              onClick={() => document.documentElement.classList.toggle("dark")}
            />
          </div>
        </>
      }
    >
      {section === "products" && <InventoryScreen inventory={inventory} />}
      {section === "activity" && (
        <PageShell
          title="Activity"
          description="Recent changes to your workspace."
        >
          <div className="divide-y divide-ajna-border rounded-lg border border-ajna-border bg-ajna-card">
            {[
              {
                title: "Catalog reviewed",
                detail: `${inventory.records.length} products in your workspace.`,
                icon: <Package />,
              },
              {
                title: "Stock check completed",
                detail: `${inventory.records.filter((record) => record.status === "Low stock").length} products need replenishing.`,
                icon: <Leaf />,
              },
              ...(inventory.message
                ? [
                    {
                      title: inventory.message,
                      detail: "Latest inventory update",
                      icon: <Activity />,
                    },
                  ]
                : []),
            ].map((event) => (
              <div key={event.title} className="flex items-start gap-4 p-5">
                <span className="rounded-full bg-ajna-muted p-2 text-ajna-muted-foreground">
                  {event.icon}
                </span>
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="mt-1 text-xs text-ajna-muted-foreground">
                    {event.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PageShell>
      )}
      {section === "settings" && (
        <PageShell
          title="Settings"
          description="Manage your profile and workspace preferences."
        >
          <form
            className="max-w-xl space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              const next = String(data.get("name") ?? "").trim();
              if (next) {
                setName(next);
                setSettingsSaved(true);
              }
            }}
          >
            <Field>
              <FieldLabel htmlFor={`${id}-name`}>Display name</FieldLabel>
              <Input
                id={`${id}-name`}
                name="name"
                required
                defaultValue={name}
                autoComplete="name"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor={`${id}-email`}>Email address</FieldLabel>
              <Input
                id={`${id}-email`}
                type="email"
                defaultValue="alex@example.com"
                readOnly
              />
            </Field>
            <div className="flex items-center justify-between border-t border-ajna-border pt-5">
              <span role="status" className="text-sm text-ajna-success">
                {settingsSaved ? "Profile updated." : ""}
              </span>
              <Button type="submit" variant="primary">
                Save profile
              </Button>
            </div>
          </form>
        </PageShell>
      )}
      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title="Search workspace"
        description="Navigate to a page or create a product."
      >
        <Command label="Search workspace commands">
          <CommandInput placeholder="Search pages and actions…" />
          <CommandList>
            <CommandEmpty>No matching commands.</CommandEmpty>
            <CommandGroup heading="Workspace">
              <CommandItem
                value="products catalog"
                onSelect={() => navigate("#products")}
              >
                <Package aria-hidden="true" className="size-4" />
                Products
              </CommandItem>
              <CommandItem
                value="activity updates"
                onSelect={() => navigate("#activity")}
              >
                <Activity aria-hidden="true" className="size-4" />
                Activity
              </CommandItem>
              <CommandItem
                value="settings profile"
                onSelect={() => navigate("#settings")}
              >
                <Settings aria-hidden="true" className="size-4" />
                Settings
              </CommandItem>
              <CommandItem
                value="create add product"
                onSelect={() => {
                  navigate("#products");
                  inventory.create();
                }}
              >
                <Plus aria-hidden="true" className="size-4" />
                Add product
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </AppShell>
  );
}
