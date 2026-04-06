import React from "react";
import MyPresentations from "../../entities/presentation/ui/MyPresentations";
import { Box, useMediaQuery, useTheme } from "@mui/material";

function MyPresentationsPage() {
  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));
  return (
    <Box
      sx={{
        p: isMobile ? 2 : 4,
      }}
    >
      <MyPresentations />
    </Box>
  );
}

export default MyPresentationsPage;
