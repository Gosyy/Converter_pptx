import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { PlateSlide } from "../../../../../../shared/types";

interface Props {
  slide: PlateSlide;
  children: React.ReactNode;
}

const Grid2x2Layout: React.FC<Props> = ({ children }) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: 2,
        p: isMobile ? 2 : 4,
        width: "100%",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </Box>
  );
};

export default Grid2x2Layout;
