import { Box, Button, Container, useMediaQuery, useTheme } from "@mui/material";
import { SlidesList } from "./components/SlidesList/SlidesList";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate } from "react-router-dom";
import { ThemeCardSelector } from "./components/ThemeCardSelector/ThemeCardSelector";
import { AnimatePresence, motion } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";

const MotionBox = motion(Box);
const MotionButton = motion(Button);
const MotionContainer = motion(Container);

export const BlockGeneration = () => {
  const navigate = useNavigate();
  const { generating } = useSelector((state: RootState) => state.prompt);

  const handleProceed = () => {
    if (generating) return;
    navigate("/editor");
  };
  const handleBack = () => navigate(-1);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <MotionContainer
      sx={{
        p: isMobile ? 1 : 4,
        position: "relative",
        pb: 12,
        transition: "all 0.2s",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 1,
        }}
      >
        {[
          { top: "5%", left: "70%", bgcolor: "secondary.light", blur: 120 },
          { top: "20%", left: "10%", bgcolor: "primary.light", blur: 100 },
          { top: "50%", left: "70%", bgcolor: "secondary.light", blur: 120 },
          { top: "70%", left: "10%", bgcolor: "primary.light", blur: 80 },
        ].map((b, i) => (
          <Box
            key={i}
            sx={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              bgcolor: b.bgcolor,
              opacity: 0.15,
              top: b.top,
              left: b.left,
              filter: `blur(${b.blur}px)`,
            }}
          />
        ))}
      </Box>

      <MotionButton
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={handleBack}
        startIcon={isMobile ? undefined : <ArrowBackIcon />}
        sx={{
          position: "fixed",
          top: 84,
          left: isMobile ? undefined : 24,
          right: isMobile ? 12 : undefined,
          bgcolor: "grey.100",
          color: "primary.main",
          borderRadius: "12px",
          textTransform: "none",
          "&:hover": { bgcolor: "grey.200" },
          zIndex: 10,
        }}
      >
        {isMobile ? <ArrowBackIcon /> : "Назад"}
      </MotionButton>

      <AnimatePresence mode="popLayout">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
        >
          <SlidesList />
        </MotionBox>
      </AnimatePresence>

      <AnimatePresence mode="popLayout">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2, delay: 0.2 }}
          sx={{ mt: 4 }}
        >
          <ThemeCardSelector />
        </MotionBox>
      </AnimatePresence>

      <Box
        sx={{
          position: "fixed",
          bottom: isMobile ? 60 : 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 10,
        }}
      >
        <AnimatePresence mode="sync">
          <MotionButton
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={handleProceed}
            variant="contained"
            startIcon={<PlayArrowIcon />}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            }}
            sx={{
              height: 50,
              width: isMobile ? 250 : undefined,
              borderRadius: "12px",
              bgcolor: "primary.main",
              color: "white",
              px: isMobile ? 1 : 4,
              "&:hover": { bgcolor: "primary.main" },
            }}
            disabled={generating}
          >
            Перейти к Презентации
          </MotionButton>
        </AnimatePresence>
      </Box>
    </MotionContainer>
  );
};
