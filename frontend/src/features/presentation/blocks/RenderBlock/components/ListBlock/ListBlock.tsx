import React from "react";
import { Box } from "@mui/material";
import EditableWrapper from "../EditableWrapper";
import TextEditor from "../TextEditor";
import { HeadingBlockProps } from "../HeadingBlock/HeadingBlock";
import { useTextBlocksEditor } from "../../hooks";
import { SlideBlock, RichTextPart } from "../../../../../../shared/types";

const ListBlock: React.FC<HeadingBlockProps> = ({
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

  const renderPart = (part: RichTextPart) => (
    <span
      style={{
        fontWeight: part.bold ? 700 : 400,
        fontStyle: part.italic ? "italic" : "normal",
        fontFamily: part.code
          ? "monospace"
          : block.style?.fontFamily || theme?.fonts.paragraph || "Arial",
        fontSize: block.style?.fontSize || 16,
        color: block.style?.color || theme?.colors.paragraph || "#000",
      }}
    >
      {part.text}
    </span>
  );

  return isEditing ? (
    <TextEditor
      value={editValue}
      onChange={setEditValue}
      onBlur={handleBlur}
      block={block as SlideBlock}
    />
  ) : (
    <EditableWrapper
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSettingsChange={handleSettingsChange}
      block={block as SlideBlock}
    >
      <Box
        component={block.type === "ordered-list" ? "ol" : "ul"}
        sx={{
          pl: 4,
          m: 0,
          minHeight: 40,
          minWidth: 75,
          fontFamily:
            block.style?.fontFamily || theme?.fonts.paragraph || "Arial",
          fontSize: block.style?.fontSize || 16,
          color: block.style?.color || theme?.colors.paragraph || "#000",
        }}
      >
        {block.richParts?.map((itemParts, i) => (
          <li key={i}>
            {itemParts.map((part, j) => (
              <React.Fragment key={j}>{renderPart(part)}</React.Fragment>
            ))}
          </li>
        ))}
      </Box>
    </EditableWrapper>
  );
};

export default ListBlock;
