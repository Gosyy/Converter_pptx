import React from "react";
import { Box } from "@mui/material";
import EditableWrapper from "../EditableWrapper";
import TextEditor from "../TextEditor";
import { HeadingBlockProps } from "../HeadingBlock/HeadingBlock";
import { useTextBlocksEditor } from "../../hooks";

const CodeBlock: React.FC<HeadingBlockProps> = ({
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
    >
      <Box
        component="pre"
        sx={{
          backgroundColor: theme?.colors.paragraph + "20" || "#f5f5f5",
          p: 2,

          minWidth: 105,
          lineHeight: 1,
          borderRadius: 1,

          overflowX: "auto",
          fontFamily:
            block.style?.fontFamily || theme?.fonts.paragraph || "Arial",
          fontSize: block.style?.fontSize || 14,
          color: block.style?.color || theme?.colors.paragraph || "#000",
        }}
      >
        <code
          style={{
            display: "flex",
            alignItems: "center",
            minHeight: 10,
          }}
        >
          {block.text}
        </code>
      </Box>
    </EditableWrapper>
  );
};

export default CodeBlock;
