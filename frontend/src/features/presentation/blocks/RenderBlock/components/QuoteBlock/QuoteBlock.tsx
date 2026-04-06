import React from "react";
import { Typography } from "@mui/material";
import EditableWrapper from "../EditableWrapper";
import TextEditor from "../TextEditor";
import { HeadingBlockProps } from "../HeadingBlock/HeadingBlock";
import { useTextBlocksEditor } from "../../hooks";

const QuoteBlock: React.FC<HeadingBlockProps> = ({
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
        variant="body2"
        sx={{
          fontStyle: "italic",
          minHeight: 20,
          minWidth: 75,
          borderLeft:
            block.justifyContent === "flex-start" || !block.justifyContent
              ? `3px solid ${theme?.colors.paragraph || "#ccc"}`
              : undefined,
          borderRight:
            block.justifyContent === "flex-end"
              ? `3px solid ${theme?.colors.paragraph || "#ccc"}`
              : undefined,
          px: 2,
          py: 1.2,
          fontFamily:
            block.style?.fontFamily || theme?.fonts.paragraph || "Arial",
          fontSize: block.style?.fontSize || 16,
          color: block.style?.color || theme?.colors.paragraph || "#000",
          textAlign: block.justifyContent === "flex-end" ? "end" : "start",
          display: "flex",
          alignItems: "center",
        }}
      >
        {block.text}
      </Typography>
    </EditableWrapper>
  );
};

export default QuoteBlock;
