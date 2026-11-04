import { replaceSource } from "fumadocs-core/mdx-plugins/stringifier";

type Node = Parameters<typeof replaceSource>[1];

export function remarkComponentPreview() {
  return (tree: Node, file: Parameters<typeof replaceSource>[0]) => {
    function visit(parent: Node) {
      const children = "children" in parent ? parent.children : undefined;
      if (!children) return;

      for (let index = 0; index < children.length; index++) {
        const node = children[index];
        const next = children[index + 1];

        if (
          node.type === "mdxJsxFlowElement" &&
          node.name === "ComponentPreview" &&
          next?.type === "code" &&
          (next.lang === "tsx" || next.lang === "jsx")
        ) {
          // Keep preview-only JSX out of the Markdown export.
          replaceSource(file, node, "");
          node.children.push({
            type: "mdxJsxFlowElement",
            name: "div",
            attributes: [
              { type: "mdxJsxAttribute", name: "data-preview-code", value: "" },
            ],
            children: [next],
          });
          children.splice(index + 1, 1);
        }

        visit(node);
      }
    }

    visit(tree);
  };
}
