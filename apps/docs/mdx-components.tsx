import { TypeTable } from "fumadocs-ui/components/type-table";
import defaultComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { ComponentPreview } from "./components/component-preview";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return { ...defaultComponents, TypeTable, ComponentPreview, ...components };
}
export const useMDXComponents = getMDXComponents;
