import React from "react";
import { Paper, Box, IconButton, Typography } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { RenderBlock } from "../../../blocks/RenderBlock/components";
import { PlateSlide, RichTextPart } from "../../../../../shared/types";
import { motion } from "framer-motion";
import { useSortableSlide } from "../../hooks";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../app/store";

interface Props {
  slide: PlateSlide;
  index: number;
  onEditSlide: (
    slideId: string,
    blockId: string,
    textOrItems: string | string[],
    richParts?: RichTextPart[][]
  ) => void;
  initial?: { opacity: number; y: number };
  animate?: { opacity: number; y: number };
  transitionA?: { duration: number; delay: number };
}

export const SortableSlide: React.FC<Props> = ({
  slide,
  index,
  onEditSlide,
  initial,
  animate,
  transitionA,
}) => {
  const {
    attributes,
    listeners,
    style,
    handleEdit,
    setNodeRef,
    editingBlockId,
    handleStartEditing,
    handleStopEditing,
  } = useSortableSlide({ slide, onEditSlide });

  const { generating } = useSelector((state: RootState) => state.prompt);

  return (
    <motion.div initial={initial} animate={animate} transition={transitionA}>
      <Paper
        ref={setNodeRef}
        style={style}
        sx={{
          mt: 2,
          boxShadow: 0,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
          <IconButton
            disabled={generating}
            {...listeners}
            {...attributes}
            sx={{ cursor: "grab", touchAction: "none" }}
            size="small"
          >
            <DragIndicatorIcon />
          </IconButton>
          <Typography sx={{ ml: 1, fontWeight: "bold" }}>
            {index + 1}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }}>
          {slide.content.map((block) => (
            <RenderBlock
              key={block.id}
              block={block}
              onEdit={handleEdit}
              isEditing={editingBlockId === block.id}
              startEditing={() => handleStartEditing(block.id)}
              stopEditing={handleStopEditing}
            />
          ))}
        </Box>
      </Paper>
    </motion.div>
  );
};
