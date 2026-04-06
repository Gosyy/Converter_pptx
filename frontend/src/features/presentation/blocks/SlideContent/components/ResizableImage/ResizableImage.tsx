import React, { useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import EditableImage from "./EditableImage";
import { useResizeImage } from "../../hooks";

interface Props {
  slideId: string;
  blockId: string;
  horizontal?: boolean;
  inverted?: boolean;
}

const ResizableImage: React.FC<Props> = ({
  slideId,
  blockId,
  horizontal = false,
  inverted = false,
}) => {
  const { sizeValue, sliderStyle, startResize, block, theme, dragging } =
    useResizeImage({
      slideId,
      blockId,
      horizontal,
      inverted,
    });

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        position: "relative",
        flex: horizontal ? `0 0 ${sizeValue}%` : undefined,
        width: horizontal ? undefined : "100%",
        height: horizontal ? (isMobile ? undefined : "100%") : `${sizeValue}%`,
        userSelect: dragging ? "none" : undefined,
        overflow: "hidden",
      }}
    >
      <EditableImage blockId={block!.id} slideId={slideId} />
      <Box
        sx={{
          touchAction: horizontal ? "none" : "none",
          cursor: horizontal ? "col-resize" : "row-resize",
          position: "absolute",
          zIndex: 10,
          bgcolor: isMobile ? theme?.colors.heading : "rgba(0, 0, 0, 0)",
          transition: "all 0.2s",
          "&:hover": { bgcolor: theme?.colors.heading },
          ...sliderStyle,
        }}
        onMouseDown={startResize}
        onTouchStart={startResize}
      />
    </Box>
  );
};

export default ResizableImage;
