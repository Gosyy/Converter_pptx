import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { visitParents } from "unist-util-visit-parents";
import { nanoid } from "nanoid";
import { parseChartBlock } from "./parseChartBlock";

import { PlateSlide, RichTextPart } from "../types/markdownTypes";

export function markdownToSlides(markdown: string): PlateSlide[] {
  const tree: any = unified().use(remarkParse).use(remarkGfm).parse(markdown);
  const slides: PlateSlide[] = [];
  let currentSlide: PlateSlide | null = null;
  let lastLayout: "left-image" | "right-image" | "top-image" | "bottom-image" =
    "left-image";

  const rawSlides = markdown
    .split(/^#\s+/gm)
    .filter((part) => part.trim())
    .map((part) => "# " + part.trim());

  let slideIndex = -1;

  function extractInlineParts(children: any[]): RichTextPart[] {
    const parts: RichTextPart[] = [];

    const push = (text: string, style: Partial<RichTextPart> = {}) => {
      if (!text) return;
      parts.push({ text, ...style });
    };

    for (const child of children) {
      switch (child.type) {
        case "text":
          push(child.value);
          break;
        case "strong":
          push(child.children.map((c: any) => c.value || "").join(""), {
            bold: true,
          });
          break;
        case "emphasis":
          push(child.children.map((c: any) => c.value || "").join(""), {
            italic: true,
          });
          break;
        case "inlineCode":
          push(child.value, { code: true });
          break;
        default:
          push(child.children?.map((c: any) => c.value || "").join("") || "");
      }
    }

    return parts;
  }

  visitParents(tree, (node, parents: any[]) => {
    node.parent = parents[parents.length - 1] || null;
    switch (node.type) {
      case "heading":
        const headingText = node.children
          .map((n: any) => n.value || "")
          .join("");
        const richParts = [
          headingText.split("").map((char: string) => ({
            text: char,
            bold: true,
            italic: false,
            code: false,
          })),
        ];

        if (node.depth === 1) {
          if (currentSlide) slides.push(currentSlide);
          slideIndex++;
          const titleText = node.children
            .map((n: any) => n.value || "")
            .join("");
          currentSlide = {
            id: nanoid(),
            title: titleText,
            layout: "text-only",
            markdownText: rawSlides[slideIndex] || "",
            content: [
              {
                type: "heading",
                text: titleText,
                id: nanoid(),
                style: { fontWeight: 700, fontSize: 28 },
                richParts,
              },
            ],
          };
        } else if (node.depth >= 2 && currentSlide) {
          currentSlide.content.push({
            id: nanoid(),
            type: "heading",
            text: node.children.map((n: any) => n.value || "").join(""),
            style: { fontWeight: 700, fontSize: 28 },
            richParts,
          });
        }
        break;

      case "paragraph":
        if (
          !node.parent ||
          (node.parent.type !== "listItem" && node.parent.type !== "blockquote")
        )
          if (currentSlide) {
            const inline = extractInlineParts(node.children);
            currentSlide.content.push({
              id: nanoid(),
              type: "paragraph",
              text: inline.map((p) => p.text).join(""),
              richParts: [inline],
            });
          }
        break;

      case "list":
        if (currentSlide) {
          const richParts: RichTextPart[][] = node.children.map((li: any) => {
            const paragraph = li.children.find(
              (c: any) => c.type === "paragraph"
            );
            return paragraph ? extractInlineParts(paragraph.children) : [];
          });
          currentSlide.content.push({
            id: nanoid(),
            type: node.ordered ? "ordered-list" : "list",
            items: richParts.map((r) => r.map((p) => p.text).join("")),
            richParts,
          });
        }
        break;

      case "image":
        if (currentSlide) {
          currentSlide.content.push({
            type: "image",
            url: node.url,
            id: nanoid(),
          });

          if (currentSlide.layout === "text-only") {
            currentSlide.layout = lastLayout;

            switch (lastLayout) {
              case "left-image":
                lastLayout = "right-image";
                break;
              case "right-image":
                lastLayout = "bottom-image";
                break;
              case "bottom-image":
                lastLayout = "top-image";
                break;
              case "top-image":
                lastLayout = "left-image";
                break;
            }
          }
        }
        break;

      case "blockquote":
        if (currentSlide) {
          const text = node.children
            .map((n: any) => n.children.map((c: any) => c.value || "").join(""))
            .join("\n");
          currentSlide.content.push({ type: "quote", text, id: nanoid() });
        }
        break;

      case "code":
        if (currentSlide) {
          if (node.lang === "chart") {
            const chart = parseChartBlock(node.value);
            currentSlide.content.push({ type: "chart", chart, id: nanoid() });
          } else {
            currentSlide.content.push({
              id: nanoid(),
              type: "code",
              text: node.value,
              language: node.lang,
            });
          }
        }
        break;

      case "table":
        if (currentSlide) {
          const headers =
            node.children[0]?.children.map((cell: any) =>
              cell.children.map((n: any) => n.value || "").join("")
            ) || [];

          const rows = node.children
            .slice(1)
            .map((row: any) =>
              row.children.map((cell: any) =>
                cell.children.map((n: any) => n.value || "").join("")
              )
            );

          currentSlide.content.push({
            type: "table",
            table: { headers, rows },
            id: nanoid(),
          });
        }
        break;
    }
  });

  if (currentSlide) slides.push(currentSlide);
  return slides;
}
