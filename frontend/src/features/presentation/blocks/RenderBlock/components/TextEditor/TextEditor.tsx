import React, { useMemo, useState, useCallback } from "react";
import { createEditor, Descendant, BaseText } from "slate";
import { Slate, Editable, withReact, ReactEditor } from "slate-react";
import { SlideBlock, RichTextPart } from "../../../../../../shared/types";
import Toolbar from "../Toolbar";
import { Box } from "@mui/material";

interface TextEditorProps {
  block: SlideBlock;
  value: RichTextPart[][];
  onChange: (val: RichTextPart[][]) => void;
  onBlur: () => void;
}

interface CustomText extends BaseText {
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
}

interface CustomElement {
  type: string;
  children: CustomText[];
}

const TextEditor: React.FC<TextEditorProps> = ({
  block,
  value,
  onChange,
  onBlur,
}) => {
  const editor = useMemo(() => withReact(createEditor() as ReactEditor), []);

  const [focused, setFocused] = useState(false);

  const [slateValue, setSlateValue] = useState<Descendant[]>(() => {
    if (block.type === "list" || block.type === "ordered-list") {
      return value.map((item) => ({
        type: "list-item",
        children: item.map((part) => ({
          text: part.text,
          bold: part.bold,
          italic: part.italic,
          code: part.code,
        })),
      }));
    } else {
      const parts = value[0] || [];
      return [
        {
          type: "paragraph",
          children: parts.map((part) => ({
            text: part.text,
            bold: part.bold,
            italic: part.italic,
            code: part.code,
          })),
        },
      ];
    }
  });

  const renderLeaf = useCallback(
    (props: any) => {
      const { leaf, attributes, children } = props;

      let content = children;
      if (leaf.bold) content = <>{content}</>;
      if (leaf.italic) content = <em>{content}</em>;
      if (leaf.code) content = <code>{content}</code>;

      return (
        <span
          {...attributes}
          style={{
            fontWeight: leaf.bold ? 700 : 400,
            fontStyle: leaf.italic ? "italic" : "normal",
            fontFamily: block.style?.fontFamily || "inherit",
            fontSize: block.style?.fontSize
              ? `${block.style.fontSize}px`
              : undefined,
            lineHeight:
              block.type === "heading" ? 1.2 : block.style?.lineHeight,
            color: block.style?.color,
            outline: leaf.selected ? "2px solid #2e2e2e" : "none",
          }}
        >
          {content}
        </span>
      );
    },
    [block.style]
  );

  return (
    <Box>
      <Toolbar editor={editor} />
      <Slate
        editor={editor}
        initialValue={slateValue}
        onChange={(newValue) => {
          setSlateValue(newValue);

          if (block.type === "list" || block.type === "ordered-list") {
            const richItems: RichTextPart[][] = newValue.map((node: any) =>
              node.children.map((child: CustomText) => ({
                text: child.text,
                bold: child.bold ?? false,
                italic: child.italic ?? false,
                code: child.code ?? false,
              }))
            );
            onChange(richItems);
          } else {
            const richText: RichTextPart[][] = newValue.flatMap((node: any) =>
              node.children.map((child: CustomText) => ({
                text: child.text,
                bold: child.bold ?? false,
                italic: child.italic ?? false,
                code: child.code ?? false,
              }))
            );
            onChange(richText);
          }
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: 40,
            padding: block.type === "list" ? "0 0 0 32px" : "0",
          }}
        >
          <Editable
            renderLeaf={renderLeaf}
            onBlur={onBlur}
            onFocus={() => setFocused(true)}
            spellCheck
            autoFocus
            style={{
              fontFamily: block.style?.fontFamily,
              fontSize: block.style?.fontSize
                ? `${block.style.fontSize}px`
                : undefined,
              lineHeight:
                block.type === "paragraph"
                  ? 1.6
                  : block.type === "heading"
                  ? 1.2
                  : block.style?.lineHeight,
              color: block.style?.color,
              // fontWeight: block.style?.fontWeight,
              minHeight: 40,
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              outline: focused ? "2px solid #2e2e2e" : "none",
              outlineOffset: -2,
            }}
          />
        </div>
      </Slate>
    </Box>
  );
};

export default TextEditor;
