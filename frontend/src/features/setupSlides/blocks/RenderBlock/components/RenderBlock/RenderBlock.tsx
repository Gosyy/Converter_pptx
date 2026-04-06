import React, { useMemo } from "react";
import { RichTextPart, SlideBlock } from "../../../../../../shared/types";
import {
  Box,
  Typography,
  List,
  ListItem,
  InputBase,
  darken,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useRenderBlock } from "../../hooks";
import { RootState } from "../../../../../../app/store";
import { useSelector } from "react-redux";
import { Editable, Slate, withReact } from "slate-react";
import {
  BaseText,
  createEditor,
  Descendant,
  Element as SlateElement,
  Text,
} from "slate";

interface RenderBlockProps {
  block: SlideBlock;
  onEdit: (
    id: string,
    textOrItems: string | string[],
    richParts?: RichTextPart[][]
  ) => void;
  startEditing: () => void;
  stopEditing: () => void;
  isEditing: boolean;
}

export interface CustomText extends BaseText {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

export interface CustomElement {
  type: string;
  children: CustomText[];
}

export const RenderBlock: React.FC<RenderBlockProps> = ({
  block,
  onEdit,
  startEditing,
  stopEditing,
  isEditing,
}) => {
  const { handleBlur, value, setValue } = useRenderBlock({
    block,
    onEdit,
    stopEditing,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { generating } = useSelector((state: RootState) => state.prompt);

  const editor = useMemo(() => withReact(createEditor()), []);

  const initialValue: Descendant[] = (
    block.richParts?.length
      ? block.richParts.map((line) => ({
          type: block.type,
          children: line.map((p) => ({
            text: p.text,
            bold: p.bold,
            italic: p.italic,
            code: p.code,
          })),
        }))
      : [{ type: block.type, children: [{ text: value as string }] }]
  ) as Descendant[];

  const renderLeaf = (props: any) => {
    const { leaf, attributes, children } = props;
    return (
      <span
        {...attributes}
        style={{
          fontWeight: block.type === "heading" ? 700 : leaf.bold ? 700 : 400,
          fontStyle: leaf.italic ? "italic" : "normal",
          fontFamily: leaf.code ? "'JetBrains Mono', monospace" : undefined,
        }}
      >
        {children}
      </span>
    );
  };

  if (isEditing) {
    return (
      <Slate
        editor={editor}
        initialValue={initialValue}
        onChange={(newVal) => {
          const richParts: RichTextPart[][] = (newVal as CustomElement[]).map(
            (el) =>
              el.children.map((child) => ({
                text: child.text,
                bold: child.bold,
                italic: child.italic,
                code: child.code,
              }))
          );

          const textValue = richParts
            .map((line) => line.map((p) => p.text).join(""))
            .join("\n");

          setValue(textValue);
          onEdit(block.id, textValue, richParts);
        }}
      >
        <Editable
          renderLeaf={renderLeaf}
          onBlur={handleBlur}
          style={{
            border: "1px solid #ccc",
            borderRadius: 4,
            fontSize: block.type === "heading" ? "1.25rem" : "1rem",
            fontWeight: 700,
            fontFamily: "'JetBrains Mono',monospace",
            lineHeight: block.type === "paragraph" ? 1.5 : 1.6,
            paddingLeft: block.type === "list" ? 16 : 0,
            paddingRight: block.type === "list" ? 16 : 0,
            paddingTop: block.type === "list" ? 8 : 0,
            paddingBottom: block.type === "list" ? 8 : 0,
            marginBottom: 8,
          }}
        />
      </Slate>
    );
  }

  const handleClick = () => {
    if (generating) return;
    startEditing();
  };

  switch (block.type) {
    case "heading":
      return (
        <Typography
          variant="h6"
          sx={{
            mb: 1,
            cursor: generating ? undefined : "pointer",
            fontWeight: "bold",
          }}
          onClick={handleClick}
        >
          {block.text}
        </Typography>
      );
    case "paragraph":
      return (
        <Typography
          variant="body1"
          sx={{ mb: 1, cursor: generating ? undefined : "pointer" }}
          onClick={handleClick}
        >
          {block.richParts?.[0]?.map((p, i) => (
            <span
              key={i}
              style={{
                fontWeight: p.bold ? 700 : 400,
                fontStyle: p.italic ? "italic" : "normal",
                fontFamily: p.code ? "monospace" : undefined,
              }}
            >
              {p.text}
            </span>
          )) || block.text}
        </Typography>
      );
    case "list":
    case "ordered-list":
      return (
        <List
          sx={{ mb: 1, cursor: generating ? undefined : "pointer" }}
          onClick={handleClick}
        >
          {block.richParts?.map((lineParts, i) => (
            <ListItem key={i} sx={{ pl: 2, py: 0, display: "list-item" }}>
              <Typography component="span" sx={{ lineHeight: 1.6 }}>
                {lineParts.map((p, j) => (
                  <span
                    key={j}
                    style={{
                      fontWeight: p.bold ? 700 : 400,
                      fontStyle: p.italic ? "italic" : "normal",
                      fontFamily: p.code ? "monospace" : undefined,
                    }}
                  >
                    {p.text}
                  </span>
                ))}
              </Typography>
            </ListItem>
          ))}
        </List>
      );
    case "quote":
      return (
        <Typography
          sx={{
            mb: 1,
            pl: 2,
            borderLeft: "4px solid gray",
            fontStyle: "italic",
            cursor: generating ? undefined : "pointer",
          }}
          onClick={handleClick}
        >
          {block.text}
        </Typography>
      );
    case "code":
      return (
        <Box
          sx={{
            mb: 1,
            p: 1,
            backgroundColor: darken("#f5f5f5", 0.05),
            fontFamily: "monospace",
            wordBreak: isMobile ? "break-all" : undefined,
            whiteSpace: isMobile ? "pre-line" : "pre",
            cursor: generating ? undefined : "pointer",
            width: isMobile ? "95%" : undefined,
          }}
          onClick={handleClick}
        >
          {block.text}
        </Box>
      );
    case "table":
      return (
        <Typography sx={{ mb: 1, fontStyle: "italic" }}>Таблица</Typography>
      );
    case "chart":
      return (
        <Typography sx={{ mb: 1, fontStyle: "italic" }}>График</Typography>
      );
    default:
      return <Typography>{block.text}</Typography>;
  }
};
