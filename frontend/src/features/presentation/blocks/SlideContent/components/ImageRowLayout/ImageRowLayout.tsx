import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import ResizableImage from "../ResizableImage";
import { PlateSlide } from "../../../../../../shared/types";

interface Props {
  slide: PlateSlide;
  slideId: string;
  blockId: string;
  layout: "top-image" | "bottom-image";
  children: React.ReactNode;
}

const ImageRowLayout: React.FC<Props> = ({
  slide,
  slideId,
  blockId,
  layout,
  children,
}) => {
  const inverted = layout === "bottom-image";

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
        width: "100%",
        height: isMobile ? "70vh" : "100%",
        justifyContent: slide.alignItems,
      }}
    >
      {layout === "top-image" && (
        <ResizableImage
          slideId={slideId}
          blockId={blockId}
          horizontal={false}
          inverted={inverted}
        />
      )}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          p: isMobile ? 3 : 4,
          overflowY: "hidden",
        }}
      >
        {children}
      </Box>
      {layout === "bottom-image" && (
        <ResizableImage
          slideId={slideId}
          blockId={blockId}
          horizontal={false}
          inverted={inverted}
        />
      )}
    </Box>
  );
};

export default ImageRowLayout;
