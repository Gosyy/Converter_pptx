import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/ChatOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import GridViewIcon from "@mui/icons-material/GridView";
import { AnimatePresence, motion } from "framer-motion";
import ThemeSelector from "../ThemeSelector";
import { useBlockActions } from "../../hooks";
import { settingsIcons } from "../../lib";
import { AiChat } from "../../../blocks/AiChat";
import { useNavigate } from "react-router-dom";

interface Props {
  slideId: string;
}

const iconMotion = {
  initial: { opacity: 0, scale: 0.6, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.6, y: 12 },
};

const SlideToolbar: React.FC<Props> = ({ slideId }) => {
  const { addBlock, setJustifyContent, setSlideAlignItems } = useBlockActions({
    slideId,
  });

  const navigate = useNavigate();

  const [isChatOpen, setChatOpen] = useState(false);
  const [isSettingsOpen, setSettingsOpen] = useState(false);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const handleIconClick = (action: string) => {
    switch (action) {
      case "add-heading":
        return addBlock("heading");
      case "add-paragraph":
        return addBlock("paragraph");
      case "add-code":
        return addBlock("code");
      case "add-quote":
        return addBlock("quote");
      case "add-table":
        return addBlock("table");
      case "add-list":
        return addBlock("list");
      case "add-chart":
        return addBlock("chart");
      case "justify-start":
        return setJustifyContent("flex-start");
      case "justify-end":
        return setJustifyContent("flex-end");
      case "align-start":
        return setSlideAlignItems("flex-start");
      case "align-center":
        return setSlideAlignItems("center");
      case "align-end":
        return setSlideAlignItems("flex-end");
      default:
        return;
    }
  };

  return (
    <>
      <Box
        sx={{
          position: "fixed",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 80,
          height: 200,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
          zIndex: 11,
        }}
      >
        <Tooltip title="Первичная настройка" placement="left">
          <IconButton
            onClick={() => navigate("/generate")}
            color="primary"
            size="large"
          >
            <GridViewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Чат с ИИ" placement="left">
          <IconButton
            onClick={() => setChatOpen(true)}
            color="primary"
            size="large"
          >
            <ChatIcon />
          </IconButton>
        </Tooltip>
        <motion.div
          key={isSettingsOpen ? "close" : "settings"}
          initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <Tooltip title="Редактор слайда" placement="left">
            <IconButton
              onClick={() => setSettingsOpen((s) => !s)}
              color="primary"
              size="large"
            >
              {isSettingsOpen ? <CloseIcon /> : <SettingsIcon />}
            </IconButton>
          </Tooltip>
        </motion.div>

        <ThemeSelector />
      </Box>

      <Drawer
        anchor="right"
        open={isChatOpen}
        onClose={() => setChatOpen(false)}
        sx={{ zIndex: 1401 }}
      >
        <Box sx={{ width: isMobile ? 300 : 350, height: "100%", zIndex: 1401 }}>
          <AiChat />
        </Box>
      </Drawer>

      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.28 }}
            style={{
              position: "fixed",
              right: 70,
              top: 0,
              bottom: 0,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: 5,
            }}
          >
            {settingsIcons.map((meta, idx) => (
              <motion.div
                key={meta.id}
                variants={iconMotion}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ delay: 0.04 * idx, duration: 0.18 }}
              >
                <Tooltip title={meta.title} placement="left">
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => handleIconClick(meta.action)}
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      bgcolor: "background.paper",
                      boxShadow: 3,
                      "&:hover": {
                        bgcolor: "primary.main",
                        color: "#fff",
                      },
                      transition: "all 0.18s ease",
                    }}
                  >
                    {meta.icon}
                  </IconButton>
                </Tooltip>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SlideToolbar;
