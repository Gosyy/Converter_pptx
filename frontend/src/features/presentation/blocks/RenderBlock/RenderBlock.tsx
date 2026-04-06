import React, { useEffect, useRef } from "react";
import { RichTextPart, SlideBlock } from "../../../../shared/types";
import HeadingBlock from "./components/HeadingBlock";
import ParagraphBlock from "./components/ParagraphBlock";
import ListBlock from "./components/ListBlock";
import QuoteBlock from "./components/QuoteBlock";
import CodeBlock from "./components/CodeBlock";
import TableBlockWrapper from "./components/TableBlockWrapper";
import ChartBlockWrapper from "./components/ChartBlockWrapper";
import { Box } from "@mui/material";

interface RenderBlockProps {
  block: SlideBlock;
  id: string;
  slideId: string;
  editingBlock: any;
  editValue: RichTextPart[][];
  setEditValue: (val: RichTextPart[][]) => void;
  setEditingBlock: (val: any) => void;
  isMini?: boolean;
}

export const RenderBlock: React.FC<RenderBlockProps> = (props) => {
  const { block, slideId } = props;
  const blockRef = useRef<HTMLDivElement>(null);

  const BlockComponent = (() => {
    switch (block.type) {
      case "heading":
        return HeadingBlock;
      case "paragraph":
        return ParagraphBlock;
      case "list":
      case "ordered-list":
        return ListBlock;
      case "quote":
        return QuoteBlock;
      case "code":
        return CodeBlock;
      case "table":
        return TableBlockWrapper;
      case "chart":
        return ChartBlockWrapper;
      default:
        return null;
    }
  })();

  if (!BlockComponent) return null;

  return (
    <Box
      ref={blockRef}
      key={block.id + "-" + block.text}
      sx={{
        display:
          block.type !== "table" && block.type !== "chart" ? "flex" : undefined,
        justifyContent: block.justifyContent,
      }}
    >
      <BlockComponent {...props} />
    </Box>
  );
};
