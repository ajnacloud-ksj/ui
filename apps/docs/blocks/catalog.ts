const inventoryFiles = [
  "page-shell/page-shell.tsx",
  "view-switcher/view-switcher.tsx",
  "confirmation/confirm-action.tsx",
  "collection-page/records.ts",
  "collection-page/collection-page.tsx",
  "record-form/record-form.tsx",
  "collection-page/collection-page-example.tsx",
];

export const blocks = [
  {
    slug: "app-shell",
    title: "App Shell",
    category: "Layouts",
    description:
      "A workspace with desktop and mobile navigation, command search, and an account menu.",
    files: [
      "app-shell/app-shell.tsx",
      "app-shell/app-shell-example.tsx",
      ...inventoryFiles,
      "login-page/login-page.tsx",
    ],
    usage:
      'import { AppShellExample } from "./blocks/app-shell/app-shell-example";\n\nexport default function App() {\n  return <AppShellExample />;\n}',
    features: [
      "Collapsible desktop sidebar and swipeable mobile navigation",
      "Command search with Ctrl/⌘ K",
      "Product creation, editing, and bulk archiving",
      "Profile settings, theme switching, and account actions",
    ],
    notes: [
      "AppShell accepts navigation, header, account, and content. Replace the example's local navigation with your router.",
      "The main panel owns scrolling. Sidebar navigation remains available as the content grows.",
      "Authentication in the example is local preview state. Connect account actions to your session provider.",
    ],
  },
  {
    slug: "page-shell",
    title: "Page Shell",
    category: "Layouts",
    description:
      "Consistent headings, actions, tabs, and content spacing for application pages.",
    files: ["page-shell/page-shell.tsx", "page-shell/page-shell-example.tsx"],
    usage:
      'import { PageShell } from "./blocks/page-shell/page-shell";\nimport { Button } from "@ajnacloud/ui";\n\nexport default function WorkspacePage() {\n  return (\n    <PageShell title="Workspace" description="Manage your team and settings." actions={<Button>Invite member</Button>}>\n      <p>Your page content.</p>\n    </PageShell>\n  );\n}',
    features: [
      "Heading, description, optional count, and action slots",
      "Optional navigation slot for tabs or sub-navigation",
      "Responsive action wrapping and consistent content width",
      "Workspace details, team, and billing examples",
    ],
    notes: [
      "Use one PageShell inside your application's main content region. It supplies a section and an h1.",
      "Pass your own controls through actions and navigation; page-specific state stays with the page.",
    ],
  },
  {
    slug: "collection-page",
    title: "Collection Page",
    category: "Pages",
    description:
      "An inventory page with search, filters, grid and table views, selection, and pagination.",
    files: inventoryFiles,
    usage:
      'import { CollectionPageExample } from "./blocks/collection-page/collection-page-example";\n\nexport default function ProductsPage() {\n  return <CollectionPageExample />;\n}',
    features: [
      "Search and controlled FilterBar with category and status filters",
      "Grid and table views sharing the same records and selection",
      "Sortable headers, one-based pagination, and page-size selection",
      "Bulk archiving with confirmation, plus loading, empty, and error states",
    ],
    notes: [
      "CollectionPage accepts records and create, edit, archive, and retry callbacks. The included example stores records in memory.",
      "Search and filter changes reset the page and selection. Switching between grid and table preserves both.",
      "The header checkbox selects the current page. Selected records can span pages; the action bar reports the full selected count.",
      "Filtering, sorting, and pagination operate on the supplied records. For a server-paginated catalog, adapt the state to your query layer before slicing data.",
    ],
  },
  {
    slug: "login-page",
    title: "Login Page",
    category: "Pages",
    description:
      "A split sign-in screen with organization branding, password visibility, and optional artwork.",
    files: ["login-page/login-page.tsx", "login-page/login-page-example.tsx"],
    usage:
      'import { LoginPageExample } from "./blocks/login-page/login-page-example";\n\nexport default function SignInPage() {\n  return <LoginPageExample />;\n}',
    features: [
      "Organization identity and replaceable artwork",
      "Username and password fields with appropriate autocomplete",
      "Pending submission and inline authentication errors",
      "A single-column mobile layout that keeps the form accessible",
    ],
    notes: [
      "Connect onSignIn to your authentication client. Rejections are displayed inline; passwords are not stored or logged by the block.",
      "The example accepts valid form input and changes local preview state. It does not authenticate against a service.",
      "Use logo, artwork, and help slots to supply your application's identity and access instructions.",
    ],
  },
  {
    slug: "record-form",
    title: "Create & Edit Form",
    category: "Pages",
    description:
      "A product form with grouped fields, native validation, error feedback, and shared create/edit behavior.",
    files: [...inventoryFiles, "record-form/record-form-example.tsx"],
    usage:
      'import { RecordFormExample } from "./blocks/record-form/record-form-example";\n\nexport default function ProductPage() {\n  return <RecordFormExample />;\n}',
    features: [
      "Product details and inventory cards with aligned fields and actions",
      "NumberInput controls for unit price and stock quantity",
      "Create and edit variants with initial values",
      "Required fields, numeric bounds, duplicate-SKU feedback, and form reset",
      "Asynchronous submit callbacks with pending and error states",
    ],
    notes: [
      "Pass record to edit an existing product; omit it to create one. Use a record ID as the React key when changing the record being edited.",
      "onSubmit receives normalized ProductValues. Return a promise to keep the form pending, and throw an Error to display a message.",
      "This version uses native form validation and FormData. React Hook Form and Yup are not dependencies of this block.",
      "The example saves to local memory and returns to the collection. Your application owns loading records, navigation, and persistence.",
    ],
  },
  {
    slug: "view-switcher",
    title: "View Switcher",
    category: "Patterns",
    description: "A joined table and grid control with one selected view.",
    files: [
      "view-switcher/view-switcher.tsx",
      "view-switcher/view-switcher-example.tsx",
    ],
    usage:
      '"use client";\n\nimport { useState } from "react";\nimport { ViewSwitcher, type ViewSwitcherValue } from "./blocks/view-switcher/view-switcher";\n\nexport function DocumentViews() {\n  const [view, setView] = useState<ViewSwitcherValue>("table");\n  return <ViewSwitcher value={view} onValueChange={setView} aria-label="Document view" />;\n}',
    features: [
      "Joined outline buttons with a visible selected state",
      "Controlled table/grid value and disabled state",
      "Named controls and pressed states for assistive technology",
      "Reusable inside FilterBar actions or another toolbar",
    ],
    notes: [
      "ViewSwitcher controls only the view choice. Render your records as a table or grid using the same value.",
      "The selection remains active when pressed again. Each button is reachable with Tab and activated with Enter or Space.",
    ],
  },
  {
    slug: "confirmation",
    title: "Confirmation",
    category: "Patterns",
    description:
      "A reusable asynchronous confirmation with an optional exact-text check for sensitive actions.",
    files: [
      "confirmation/confirm-action.tsx",
      "confirmation/confirmation-example.tsx",
      "page-shell/page-shell.tsx",
    ],
    usage:
      '"use client";\n\nimport { Button } from "@ajnacloud/ui";\nimport { ConfirmAction } from "./blocks/confirmation/confirm-action";\n\nexport function DeleteWorkspace({ onDelete }: { onDelete: () => Promise<void> }) {\n  return (\n    <ConfirmAction\n      trigger={<Button variant="destructive">Delete workspace</Button>}\n      title="Delete Greenhouse?"\n      description="This permanently deletes the workspace and its data."\n      confirmationText="Greenhouse"\n      confirmLabel="Delete workspace"\n      destructive\n      onConfirm={onDelete}\n    />\n  );\n}',
    features: [
      "Regular or exact-text confirmation through one component",
      "Application-provided synchronous or asynchronous action",
      "Pending state that prevents duplicate submission and dismissal",
      "Errors stay inside the dialog; focus returns to the trigger",
    ],
    notes: [
      "Omit confirmationText for a standard confirmation. When supplied, matching is exact and case-sensitive.",
      "The dialog closes after onConfirm succeeds. Throw an Error to keep it open with a message.",
      "The typed phrase is a UI safeguard. Authorization and the destructive operation belong on your server.",
    ],
  },
] as const;

export type Block = (typeof blocks)[number];
export type BlockSlug = Block["slug"];
export const getBlock = (slug: string) =>
  blocks.find((block) => block.slug === slug);
