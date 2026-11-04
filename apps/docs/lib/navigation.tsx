import type { Folder, Root } from "fumadocs-core/page-tree";
import { BookOpen, LayoutGrid } from "lucide-react";

export function createDocsTree(tree: Root): Root {
  const docs: Folder = {
    type: "folder",
    name: "Docs",
    icon: <BookOpen />,
    defaultOpen: true,
    children: [],
  };
  const components: Folder = {
    type: "folder",
    name: "Components",
    icon: <LayoutGrid />,
    defaultOpen: true,
    children: [],
  };
  let section: Folder | undefined;

  for (const item of tree.children) {
    if (item.type === "separator") {
      section = {
        type: "folder",
        name: item.name,
        defaultOpen: true,
        children: [],
      };
      components.children.push(section);
    } else {
      (section ?? docs).children.push(item);
    }
  }

  return { ...tree, children: [docs, components] };
}
