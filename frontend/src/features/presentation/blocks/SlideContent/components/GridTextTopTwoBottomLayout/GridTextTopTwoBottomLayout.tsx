import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { PlateSlide } from "../../../../../../shared/types";

interface Props {
  slide: PlateSlide;
  children: React.ReactNode;
}

const GridTextTopTwoBottomLayout: React.FC<Props> = ({ children }) => {
  const topBlock = React.Children.toArray(children)[0];
  const bottomBlocks = React.Children.toArray(children).slice(1, 3);

    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateRows: "auto 1fr",
        gap: 2,
        p: isMobile ? 2 : 4,
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 2,
          p: 2,
          textAlign: "center",
        }}
      >
        {topBlock}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 2,
          height: "100%",
        }}
      >
        {bottomBlocks.map((block, i) => (
          <Box
            key={i}
            sx={{
              borderRadius: 2,
              p: 2,
              display: "flex",
              textAlign: "center",
            }}
          >
            {block}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default GridTextTopTwoBottomLayout;
