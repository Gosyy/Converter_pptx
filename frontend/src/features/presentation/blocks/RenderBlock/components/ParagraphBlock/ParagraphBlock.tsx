import React from "react";
import { Typography } from "@mui/material";
import EditableWrapper from "../EditableWrapper";
import TextEditor from "../TextEditor";
import { RichTextPart, SlideBlock } from "../../../../../../shared/types";
import { useTextBlocksEditor } from "../../hooks";

interface ParagraphBlockProps {
  block: SlideBlock;
  id: string;
  slideId: string;
  editingBlock: SlideBlock;
  editValue: RichTextPart[][];
  setEditValue: (val: RichTextPart[][]) => void;
  setEditingBlock: (val: any) => void;
}

const ParagraphBlock: React.FC<ParagraphBlockProps> = ({
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
      <Typography
        variant="body1"
        sx={{
          lineHeight: 1.6,
          minHeight: 40,
          minWidth: 105,
          fontFamily:
            block.style?.fontFamily || theme?.fonts.paragraph || "Arial",
          fontSize: block.style?.fontSize || 16,
          color: block.style?.color || theme?.colors.paragraph || "#000",
          textAlign: block.justifyContent === "flex-end" ? "end" : "start",
          display: "flex",
          alignItems: "center",
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
    </EditableWrapper>
  );
};

export default ParagraphBlock;
