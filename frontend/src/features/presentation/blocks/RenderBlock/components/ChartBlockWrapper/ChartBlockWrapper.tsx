import React from "react";
import { Box } from "@mui/material";
import EditableWrapper from "../EditableWrapper";
import ChartBlock from "../ChartBlock";
import ChartEditor from "../ChartEditor";
import { themes } from "../../../../../../shared/constants";
import { RichTextPart, SlideBlock } from "../../../../../../shared/types";
import { useChartWrapper } from "../../hooks";

export interface ChartBlockWrapperProps {
  block: SlideBlock;
  id: string;
  slideId: string;
  editingBlock: SlideBlock;
  editValue: RichTextPart[][];
  setEditValue: (val: RichTextPart[][]) => void;
  setEditingBlock: (val: any) => void;
  isMini?: boolean;
}

const ChartBlockWrapper: React.FC<ChartBlockWrapperProps> = ({
  block,
  id,
  slideId,
  editingBlock,
  setEditingBlock,
  isMini,
}) => {
  const {
    type,
    handleCancel,
    handleDelete,
    handleEdit,
    handleSave,
    isEditing,
    theme,
  } = useChartWrapper({
    block,
    id,
    slideId,
    editingBlock,
    setEditingBlock,
  });

  return (
    <>
      <EditableWrapper onEdit={handleEdit} onDelete={handleDelete}>
        <Box
          sx={{
            width: "100%",
            mx:
              type === "pie" || type === "doughnut" || type === "polarArea"
                ? undefined
                : "auto",
            fontFamily: theme?.fonts.paragraph || "Inter, sans-serif",
            color: theme?.colors.paragraph || "#000",
          }}
        >
          {block.chart && (
            <ChartBlock
              chart={block.chart}
              theme={theme ?? themes[0]}
              isMini={isMini}
            />
          )}
        </Box>
      </EditableWrapper>

      {block.chart && (
        <ChartEditor
          open={isEditing}
          initialChart={block.chart}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </>
  );
};

export default ChartBlockWrapper;
