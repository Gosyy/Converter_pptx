import React, { useState } from "react";
import {
  Box,
  IconButton,
  darken,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  Theme,
  SlideBlock,
  PlateSlide,
  RichTextPart,
} from "../../../../../shared/types";
import { AppDispatch } from "../../../../../app/store";
import {
  updateBlock,
  updateSlideContent,
} from "../../../../../app/store/slices/editorSlice";
import SlideEditPrompt from "../SlideEditPrompt";
import { RenderBlock } from "../../../blocks/RenderBlock";
import AddSlideDialog from "../AddSlideDialog";
import { useSlideActions } from "../../hooks";

interface SlideItemProps {
  slide: PlateSlide;
  theme?: Theme;
  bgImage: string;
  dispatch: AppDispatch;
}

export const SlideItem: React.FC<SlideItemProps> = ({
  slide,
  theme,
  bgImage,
  dispatch,
}) => {
  const [editingBlock, setEditingBlock] = useState<{
    type: string;
    id: string;
  } | null>(null);
  const [editValue, setEditValue] = useState<RichTextPart[][]>([]);

  const setSlideContent = (blocks: SlideBlock[]) => {
    dispatch(
      updateSlideContent({
        slideId: slide.id,
        newContent: blocks,
      })
    );
  };

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const slideWidth = 900;
  const slideHeight = 518;

  const {
    handleAddNext,
    setSelectedLayout,
    setAddDialogOpen,
    addDialogOpen,
    selectedLayout,
  } = useSlideActions();

  const renderBlock = (block: SlideBlock) => (
    <RenderBlock
      key={block.id}
      block={block}
      id={block.id}
      slideId={slide.id}
      editingBlock={editingBlock}
      editValue={editValue}
      setEditValue={setEditValue}
      setEditingBlock={setEditingBlock}
      isMini={false}
    />
  );

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          alignItems: "flex-start",
          justifyContent: "space-between",
          boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
          borderRadius: 2,
          transition: "all 0.2s",
        }}
      >
        <Box
          id={slide.id}
          sx={{
            position: "relative",
            width: isMobile ? "100%" : slideWidth,
            maxWidth: 1100,
            aspectRatio: isMobile ? undefined : "16/9",
            display: "flex",
            flexDirection: "column",
            borderRadius: 2,
            overflow: "hidden",
            background: bgImage,
            transition: "all 0.2s",
            "&:hover": {
              boxShadow: `0 0 0 2px ${theme?.colors.heading}`,
              "& .hoverIcon": {
                opacity: 1,
                transform: "translateY(0)",
              },
            },
          }}
        >
          <SlideEditPrompt
            currentSlide={slide}
            renderBlock={renderBlock}
            setSlideContent={setSlideContent}
            slideHeight={slideHeight}
            theme={theme}
          />
        </Box>
      </Box>

      <Box textAlign="center">
        <IconButton
          size="large"
          onClick={() => setAddDialogOpen(true)}
          sx={{
            boxShadow: "0 3px 6px rgba(0,0,0,0.11)",
            border: `1px solid #ccc`,
            bgcolor: "white",
            transform: "translateY(-50%)",
            transition: "all 0.2s",
            zIndex: 11,
            "&:hover": {
              bgcolor: darken("#ffffff", 0.04),
              border: `1px solid ${theme?.colors.heading}`,
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Box>
      <AddSlideDialog
        addDialogOpen={addDialogOpen}
        handleAddSlide={handleAddNext}
        selectedLayout={selectedLayout}
        setAddDialogOpen={setAddDialogOpen}
        setSelectedLayout={setSelectedLayout}
      />
    </>
  );
};
