import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import SettingsForm from "../../entities/user/ui/components/SettingsForm";

function SettingsPage() {
  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));
  return (
    <Box
      sx={{
        p: isMobile ? 2 : 4,
        height: "95vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: isMobile ? undefined : "center",
          height: "100%",
          gap: 5,
        }}
      >
        <SettingsForm />
      </Box>
    </Box>
  );
}

export default SettingsPage;
