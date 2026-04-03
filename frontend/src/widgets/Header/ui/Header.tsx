import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Button,
  Switch,
  Tooltip,
} from "@mui/material";
import { ReactComponent as Logo } from "../../../shared/assets/logo/logo-cut.svg";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SlideNavigationToolbar from "../../../features/presentation/ui/components/SlideNavigationToolbar";
import { useHeader } from "../hooks";
import WbSunnyRoundedIcon from "@mui/icons-material/WbSunnyRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import { ColorModeContext } from "../../../app/ColorModeContext";

const MotionAppBar = motion(AppBar);

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { controls, location } = useHeader();
  const { mode, toggleMode } = React.useContext(ColorModeContext);

  const theme = useTheme();

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <MotionAppBar
      position="fixed"
      color="transparent"
      animate={controls}
      sx={{
        backgroundColor: "transparent",
        borderBottom: "1px solid transparent",
        boxShadow: "none",
        top: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: isMobile ? 0 : 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <IconButton
            onClick={() => navigate("/")}
            sx={{
              width: 51,
              height: 51,
            }}
          >
            <Logo sx={{ color: "primary.main" }} />
          </IconButton>
          {(!isMobile || location.pathname !== "/editor") && (
            <Typography
              variant={isMobile ? "subtitle2" : "h6"}
              component="div"
              sx={{ color: "text.primary" }}
            >
              AIFixed
            </Typography>
          )}
        </Box>
        {location.pathname === "/editor" && <SlideNavigationToolbar />}

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip
            title={
              mode === "light" ? "Светлая тема (солнце)" : "Тёмная тема (луна)"
            }
          >
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <WbSunnyRoundedIcon
                sx={{ mr: 0.5, color: mode === "light" ? "warning.main" : "text.disabled" }}
              />
              <Switch
                checked={mode === "dark"}
                onChange={toggleMode}
                color="default"
                sx={{
                  "& .MuiSwitch-switchBase": {
                    transitionDuration: "250ms",
                  },
                }}
              />
              <DarkModeRoundedIcon
                sx={{ ml: 0.5, color: mode === "dark" ? "info.main" : "text.disabled" }}
              />
            </Box>
          </Tooltip>

          {location.pathname === "/" && (
            <Button
              variant="contained"
              sx={{ textTransform: "none" }}
              onClick={() => navigate("/projects")}
            >
              Мои презентации
            </Button>
          )}
        </Box>
      </Toolbar>
    </MotionAppBar>
  );
};
