import React from "react";
import { Box, Typography } from "@mui/material";
import EditableWrapper from "../EditableWrapper";
import TextEditor from "../TextEditor";
import { RichTextPart, SlideBlock } from "../../../../../../shared/types";
import { useTextBlocksEditor } from "../../hooks";

export interface HeadingBlockProps {
  block: SlideBlock;
  id: string;
  slideId: string;
  editingBlock: SlideBlock;
  editValue: RichTextPart[][];
  setEditValue: (val: RichTextPart[][]) => void;
  setEditingBlock: (val: any) => void;
}

const HeadingBlock: React.FC<HeadingBlockProps> = ({
  block,
  id,
  slideId,
  editingBlock,
  editValue,
  setEditValue,
  setEditingBlock,
}) => {
  const {
    isEditing,
    handleBlur,
    handleDelete,
    handleEdit,
    handleSettingsChange,
    theme,
  } = useTextBlocksEditor({
    editingBlock,
    block,
    editValue,
    setEditingBlock,
    setEditValue,
    id,
    slideId,
  });

  return isEditing ? (
    <TextEditor
      value={editValue}
      onChange={setEditValue}
      onBlur={handleBlur}
      block={block}
    />
  ) : (
    <EditableWrapper
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSettingsChange={handleSettingsChange}
      block={block}
    >
      <Box
        sx={{
          minHeight: 40,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontFamily:
              block.style?.fontFamily || theme?.fonts.heading || "Arial",
            fontSize: block.style?.fontSize || "2rem",
            color: block.style?.color || theme?.colors.heading || "#000",
            textAlign: block.justifyContent === "flex-end" ? "end" : "start",
            lineHeight: 1.2,
          }}
        >
          {block.richParts?.[0]?.map((part, i) => (
            <span
              key={i}
              style={{
                fontWeight: part.bold ? 700 : 400,
                fontStyle: part.italic ? "italic" : "normal",
                fontFamily: part.code
                  ? "monospace"
                  : block.style?.fontFamily || theme?.fonts.paragraph,
              }}
            >
              {part.text}
            </span>
          ))}
        </Typography>
      </Box>
    </EditableWrapper>
  );
};

export default HeadingBlock;
