import React from "react";
import { Box, Button, lighten, useMediaQuery, useTheme } from "@mui/material";
import { ReactComponent as LogoPC } from "../../../shared/assets/logo/logo-pc.svg";
import { ReactComponent as LogoPhone } from "../../../shared/assets/logo/logo-phone.svg";

import LanguageIcon from "@mui/icons-material/Language";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

export const Footer: React.FC = () => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const location = useLocation();

  const theme = useSelector((s: RootState) =>
    s.editor.availableThemes.find((t) => t.id === s.editor.globalThemeId)
  );

  const { loading } = useSelector((state: RootState) => state.prompt);

  if (loading) return null;

  return (
    <Box
      bgcolor={
        location.pathname !== "/"
          ? lighten(theme?.colors.background || "#ffffff", 0.3)
          : "#FCFCFC"
      }
      sx={{
        py: isMobile ? 2 : 8,
        display: "flex",
        flexDirection: "column",
        height: isMobile ? 300 : 200,
        justifyContent: "center",
        alignItems: "center",
        gap: isMobile ? 2 : 6,
        transition: "all 0.2s",
      }}
    >
      {isMobile ? <LogoPhone /> : <LogoPC />}

      <Box
        sx={{
          display: "flex",
          gap: isMobile ? 1.5 : 2.5,
          alignItems: "center",
          flexDirection: isMobile ? "column" : "row",
          flexWrap: "wrap",
          justifyContent: "center",
          width: isMobile ? "100%" : "auto",
          px: isMobile ? 2 : 0,
          boxSizing: "border-box",
        }}
      >
        <Button
          component="a"
          href="https://aifixed.onrender.com"
          target="_blank"
          rel="noopener noreferrer"
          variant="outlined"
          fullWidth={isMobile}
          sx={{
            minWidth: 180,
            height: 50,
            textTransform: "none",
            borderRadius: 2,
            gap: 1,
          }}
        >
          <LanguageIcon />
          Website
        </Button>
      </Box>
    </Box>
  );
};
