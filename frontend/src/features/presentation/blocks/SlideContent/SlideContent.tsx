import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import SortableBlock from "../SortableBlock";
import ImageColumnLayout from "./components/ImageColumnLayout";
import ImageRowLayout from "./components/ImageRowLayout";
import Grid2x2Layout from "./components/Grid2x2Layout";
import GridTextTopTwoBottomLayout from "./components/GridTextTopTwoBottomLayout";
import { PlateSlide, SlideBlock } from "../../../../shared/types";
import { Cell } from "./lib/types/Cell";
import { useGridCreator } from "./hooks";

interface Props {
  isMini?: boolean;
  slide: PlateSlide;
  setSlideContent?: (blocks: SlideBlock[]) => void;
  renderBlock: (block: SlideBlock) => React.ReactNode;
}

export const SlideContent: React.FC<Props> = ({ slide, renderBlock }) => {
  const {
    verticalBlocks,
    firstImage,
    getGridCells,
    handleVerticalDragEnd,
    handleGridDragEnd,
  } = useGridCreator(slide);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: isMobile
        ? { delay: 150, tolerance: 5 }
        : undefined,
    })
  );

  const renderVerticalBlocks = () => (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleVerticalDragEnd}
    >
      <SortableContext
        items={verticalBlocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {verticalBlocks.map((block, idx) => (
          <SortableBlock
            key={block.id}
            idx={idx}
            slideId={slide.id}
            block={block}
            renderBlock={renderBlock}
          />
        ))}
      </SortableContext>
    </DndContext>
  );

  const renderGridCells = (cells: Cell[]) => {
    const allBlockIds = cells.flatMap((c) => c.blocks.map((b) => b.id));

    const GridCell: React.FC<{ cell: Cell }> = ({ cell }) => {
      const { setNodeRef, isOver } = useDroppable({ id: cell.id });

      return (
        <Box
          ref={setNodeRef}
          key={cell.id}
          sx={{
            minHeight: 150,
            border: "2px dashed",
            borderColor: isOver ? "#597ad3" : "#ccc",
            backgroundColor: isOver ? "rgba(89, 122, 211, 0.1)" : "transparent",
            p: 1,
            borderRadius: 1,
            mb: 1,
            transition: "border-color 120ms ease",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {cell.blocks.length === 0 ? (
            <Box
              sx={{ minHeight: 48, display: "flex", alignItems: "center" }}
            ></Box>
          ) : (
            cell.blocks.map((block, idx) => (
              <SortableBlock
                key={block.id}
                idx={idx}
                slideId={slide.id}
                block={block}
                renderBlock={renderBlock}
              />
            ))
          )}
        </Box>
      );
    };

    return (
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleGridDragEnd}
      >
        <SortableContext items={allBlockIds} strategy={rectSortingStrategy}>
          {cells.map((cell) => (
            <GridCell key={cell.id} cell={cell} />
          ))}
        </SortableContext>
      </DndContext>
    );
  };

  switch (slide.layout) {
    case "left-image":
    case "right-image":
      if (!firstImage) return renderVerticalBlocks();
      return (
        <ImageColumnLayout
          slide={slide}
          slideId={slide.id}
          blockId={firstImage.id}
          layout={slide.layout}
        >
          {renderVerticalBlocks()}
        </ImageColumnLayout>
      );

    case "top-image":
    case "bottom-image":
      if (!firstImage) {
        return renderVerticalBlocks();
      }
      return (
        <ImageRowLayout
          slide={slide}
          slideId={slide.id}
          blockId={firstImage.id}
          layout={slide.layout}
        >
          {renderVerticalBlocks()}
        </ImageRowLayout>
      );

    case "grid-2x2": {
      const cells = getGridCells();
      return (
        <Grid2x2Layout slide={slide}>{renderGridCells(cells)}</Grid2x2Layout>
      );
    }

    case "center":
    case "text-only":
    default:
      return (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
            height: "100%",
            boxSizing: "border-box",
            p: isMobile ? 3 : 4,
            overflowY: "auto",
            justifyContent: slide.alignItems,
          }}
        >
          {renderVerticalBlocks()}
        </Box>
      );
  }
};
