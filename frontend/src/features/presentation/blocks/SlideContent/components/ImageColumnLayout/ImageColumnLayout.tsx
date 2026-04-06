import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import ResizableImage from "../ResizableImage";
import { PlateSlide } from "../../../../../../shared/types";

interface Props {
  slide: PlateSlide;
  slideId: string;
  blockId: string;
  layout: "left-image" | "right-image";
  children: React.ReactNode;
}

const ImageColumnLayout: React.FC<Props> = ({
  slide,
  slideId,
  blockId,
  layout,
  children,
}) => {
  const inverted = layout === "right-image";

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flex: 1,
        overflow: "hidden",
        height: "100%",
        width: "100%",
      }}
    >
      {layout === "left-image" && (
        <ResizableImage
          slideId={slideId}
          blockId={blockId}
          horizontal
          inverted={inverted}
        />
      )}
      <Box
        sx={{
          flex: 1,
          p: isMobile ? 3 : 4,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          overflowY: "auto",
        }}
      >
        {children}
      </Box>
      {layout === "right-image" && (
        <ResizableImage
          slideId={slideId}
          blockId={blockId}
          horizontal
          inverted={inverted}
        />
      )}
    </Box>
  );
};

export default ImageColumnLayout;
