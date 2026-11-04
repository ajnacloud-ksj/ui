import { source } from "@/lib/source";

export async function GET() {
  const pages = source.getPages();

  const scanned: string[] = [];

  scanned.push("# Docs");
  scanned.push("");
  scanned.push("## Pages");
  scanned.push("");
  for (const page of pages) {
    scanned.push(
      `- [${page.data.title}](${page.url}): ${page.data.description ?? ""}`,
    );
  }
  scanned.push("");

  for (const page of pages) {
    const content = await page.data.getText("processed");
    if (!content) continue;
    scanned.push(`# ${page.data.title} (${page.url})`);
    scanned.push("");
    scanned.push(content);
    scanned.push("");
  }

  return new Response(scanned.join("\n"), {
    headers: {
      "Content-Type": "text/markdown",
    },
  });
}
