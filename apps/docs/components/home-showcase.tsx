"use client";

import {
  Badge,
  Button,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  DateInput,
  DropdownMenu,
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
  FilterBar,
  Input,
  Select,
  Switch,
  Table,
  type TableSortDirection,
  Textarea,
  toast,
} from "@ajnacloud/ui";
import {
  ArrowRight,
  CircleHelp,
  Ellipsis,
  FileText,
  SlidersHorizontal,
  SquareMousePointer,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useId, useState } from "react";

const projects = [
  { name: "Website redesign", status: "In progress", owner: "Alex Morgan" },
  { name: "Component library", status: "In progress", owner: "Sam Lee" },
  { name: "Customer portal", status: "Planned", owner: "Jules Chen" },
  { name: "Release planning", status: "Complete", owner: "Alex Morgan" },
];

function Showcase({
  title,
  links,
  children,
  className,
}: {
  title: string;
  links: { label: string; slug: string }[];
  children: ReactNode;
  className: string;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className={`min-w-0 ${className}`}>
      <div className="h-full overflow-hidden rounded-xl border border-fd-border bg-[hsl(var(--ajna-background))] text-[hsl(var(--ajna-foreground))]">
        <div className="border-b border-fd-border px-5 py-4 sm:px-6">
          <h2 id={id} className="text-sm font-medium">
            {title}
          </h2>
        </div>
        {children}
        <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-fd-border px-5 py-3 text-xs text-fd-muted-foreground sm:px-6">
          {links.map(({ label, slug }) => (
            <Link
              key={slug}
              href={`/docs/components/${slug}`}
              className="inline-flex items-center gap-1 rounded-sm hover:text-fd-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-fd-primary"
            >
              {label} <ArrowRight aria-hidden="true" className="size-3" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsShowcase() {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState<{ status: string | null }>({
    status: null,
  });
  const [sort, setSort] = useState<TableSortDirection>(false);
  const visible = projects
    .filter(
      (project) =>
        project.name.toLowerCase().includes(query.toLowerCase()) &&
        (!value.status || project.status === value.status),
    )
    .sort((a, b) =>
      sort ? a.name.localeCompare(b.name) * (sort === "asc" ? 1 : -1) : 0,
    );

  return (
    <Showcase
      title="Projects"
      className="lg:col-span-7"
      links={[
        { label: "Table", slug: "table" },
        { label: "Filter Bar", slug: "filter-bar" },
        { label: "Dropdown Menu", slug: "dropdown-menu" },
      ]}
    >
      <div className="p-5 sm:p-6">
        <FilterBar
          value={value}
          resetValue={{ status: null }}
          onValueChange={setValue}
          search={{
            value: query,
            onValueChange: setQuery,
            placeholder: "Search projects…",
            "aria-label": "Search projects",
          }}
          filters={[
            {
              id: "status",
              type: "select",
              label: "Status",
              options: ["Planned", "In progress", "Complete"].map((status) => ({
                label: status,
                value: status,
              })),
            },
          ]}
        />
      </div>
      <div className="overflow-x-auto">
        <Table aria-label="Example projects" className="min-w-[480px]">
          <Table.Header variant="compact">
            <Table.Row>
              <Table.SortHead sortDirection={sort} onSortChange={setSort}>
                Project
              </Table.SortHead>
              <Table.Head>Status</Table.Head>
              <Table.Head>Owner</Table.Head>
              <Table.Head>
                <span className="sr-only">Actions</span>
              </Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {visible.map((project) => (
              <Table.Row key={project.name}>
                <Table.Cell>{project.name}</Table.Cell>
                <Table.Cell>
                  <Badge variant="outline">{project.status}</Badge>
                </Table.Cell>
                <Table.Cell>{project.owner}</Table.Cell>
                <Table.Cell>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger
                      render={
                        <Button
                          variant="ghost"
                          size="sm"
                          shape="square"
                          aria-label={`Actions for ${project.name}`}
                        />
                      }
                    >
                      <Ellipsis aria-hidden="true" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content align="end">
                      <DropdownMenu.Item
                        onClick={() =>
                          toast.add({
                            title: project.name,
                            description: `${project.status} · ${project.owner}`,
                          })
                        }
                      >
                        View details
                      </DropdownMenu.Item>
                      <DropdownMenu.LinkItem href="/docs/components/table">
                        Table documentation
                      </DropdownMenu.LinkItem>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>
              </Table.Row>
            ))}
            {visible.length === 0 && (
              <Table.EmptyRow colSpan={4}>
                No projects match your filters.
              </Table.EmptyRow>
            )}
          </Table.Body>
          <Table.Caption>
            {visible.length} of {projects.length} projects
          </Table.Caption>
        </Table>
      </div>
    </Showcase>
  );
}

function FormShowcase() {
  const id = useId();
  return (
    <Showcase
      title="Project settings"
      className="lg:col-span-5"
      links={[
        { label: "Field", slug: "field" },
        { label: "Select", slug: "select" },
        { label: "Button", slug: "button" },
      ]}
    >
      <form
        className="p-5 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          toast.add({
            title: "Preview submitted",
            description: `${String(data.get("name"))} · ${String(data.get("visibility"))}`,
            type: "success",
          });
        }}
      >
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${id}-name`}>Project name</FieldLabel>
            <Input
              id={`${id}-name`}
              name="name"
              defaultValue="Component library"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-visibility`}>Visibility</FieldLabel>
            <Select
              id={`${id}-visibility`}
              name="visibility"
              defaultValue="team"
              options={[
                { label: "Team", value: "team" },
                { label: "Private", value: "private" },
                { label: "Public", value: "public" },
              ]}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-description`}>Description</FieldLabel>
            <Textarea
              id={`${id}-description`}
              name="description"
              rows={2}
              defaultValue="Shared components for our applications."
            />
          </Field>
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="reset" variant="outline">
              Reset
            </Button>
            <Button type="submit" variant="primary">
              Save changes
            </Button>
          </div>
        </FieldGroup>
      </form>
    </Showcase>
  );
}

function CommandShowcase() {
  const router = useRouter();
  return (
    <Showcase
      title="Find a component"
      className="lg:col-span-5"
      links={[{ label: "Command", slug: "command" }]}
    >
      <div className="p-5 sm:p-6">
        <Command label="Find component documentation">
          <CommandInput placeholder="Search documentation…" />
          <CommandList>
            <CommandEmpty>No components found.</CommandEmpty>
            <CommandGroup heading="Components">
              <CommandItem
                value="button"
                onSelect={() => router.push("/docs/components/button")}
              >
                <SquareMousePointer aria-hidden="true" />
                Button
              </CommandItem>
              <CommandItem
                value="field form"
                onSelect={() => router.push("/docs/components/field")}
              >
                <FileText aria-hidden="true" />
                Field
              </CommandItem>
              <CommandItem
                value="filter bar"
                onSelect={() => router.push("/docs/components/filter-bar")}
              >
                <SlidersHorizontal aria-hidden="true" />
                Filter Bar
              </CommandItem>
              <CommandItem
                value="tooltip help"
                onSelect={() => router.push("/docs/components/tooltip")}
              >
                <CircleHelp aria-hidden="true" />
                Tooltip
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </Showcase>
  );
}

function PreferencesShowcase() {
  const id = useId();
  return (
    <Showcase
      title="Notifications"
      className="lg:col-span-7"
      links={[
        { label: "Switch", slug: "switch" },
        { label: "Date Input", slug: "date-input" },
      ]}
    >
      <div className="p-5 sm:p-6">
        <FieldGroup>
          <Field orientation="horizontal">
            <div className="flex-1">
              <FieldLabel htmlFor={`${id}-updates`}>Project updates</FieldLabel>
              <FieldDescription id={`${id}-updates-description`}>
                Get notified when a project changes.
              </FieldDescription>
            </div>
            <Switch
              id={`${id}-updates`}
              defaultChecked
              aria-describedby={`${id}-updates-description`}
            />
          </Field>
          <Field orientation="horizontal">
            <div className="flex-1">
              <FieldLabel htmlFor={`${id}-digest`}>Weekly summary</FieldLabel>
              <FieldDescription id={`${id}-digest-description`}>
                A weekly email with your team's activity.
              </FieldDescription>
            </div>
            <Switch
              id={`${id}-digest`}
              aria-describedby={`${id}-digest-description`}
            />
          </Field>
          <Field>
            <FieldTitle id={`${id}-reminder`}>Reminder date</FieldTitle>
            <DateInput
              aria-labelledby={`${id}-reminder`}
              locale="en-GB"
              clearable
            />
          </Field>
        </FieldGroup>
      </div>
    </Showcase>
  );
}

export function HomeShowcase() {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <ProjectsShowcase />
      <FormShowcase />
      <CommandShowcase />
      <PreferencesShowcase />
    </div>
  );
}
