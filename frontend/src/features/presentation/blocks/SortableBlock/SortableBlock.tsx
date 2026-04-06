import { useSortable } from "@dnd-kit/sortable";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { SlideBlock } from "../../../../shared/types";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { useSelector } from "react-redux";
import { RootState } from "../../../../app/store";
import { useSortableBlock } from "../../hooks";

const SortableBlock: React.FC<{
  block: SlideBlock;
  idx: number;
  renderBlock: (b: SlideBlock, i: number) => React.ReactNode;
  slideId: string;
}> = ({ block, idx, renderBlock, slideId }) => {
  const theme = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const { handleDragEnd } = useSortableBlock({ block, slideId });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        position: "relative",
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        transition,
        willChange: "transform",
        display: "block",
        minHeight: "40px",
      }}
      onMouseUp={handleDragEnd}
    >
      <Box sx={{ width: "100%" }}>
        <Box
          {...listeners}
          {...attributes}
          sx={{
            touchAction: "none",
            position: "absolute",
            top: 0,
            left:
              block.justifyContent === "flex-start" || !block.justifyContent
                ? isMobile
                  ? -24
                  : -28
                : undefined,
            right:
              block.justifyContent === "flex-end"
                ? isMobile
                  ? -24
                  : -28
                : undefined,
            width: 24,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            zIndex: 10,
            opacity: isMobile ? 1 : 0,
            transition: isDragging ? "all 0.2s" : "all 0s",
            "&:hover": {
              opacity: isMobile ? 1 : 1,
            },
          }}
        >
          <Box key={theme?.id}>
            <DragIndicatorIcon
              fontSize="small"
              sx={{ color: theme?.colors.heading, zIndex: 1000 }}
            />
          </Box>
        </Box>

        {renderBlock(block, idx)}
      </Box>
    </Box>
  );
};

export default SortableBlock;
