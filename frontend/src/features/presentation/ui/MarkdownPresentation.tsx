import React, { useEffect, useRef } from "react";
import { Box, lighten, useMediaQuery, useTheme } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { useSlideScroll } from "../hooks";
import { getSlideBackground } from "../lib/utils/getSlideBackground";
import EmptyState from "./components/EmptyState";
import SlideList from "./components/SlideList";
import SlideToolbar from "./components/SlideToolbar";
import { useSavePresentation } from "../../../shared/hooks";
import { LoadingOverlay } from "../../../shared/components";

export const MarkdownPresentation: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const containerRef = useRef<HTMLDivElement>(null);

  const slides = useSelector((s: RootState) => s.editor.slides);
  const currentIndex = useSelector((s: RootState) => s.editor.currentIndex);
  const theme = useSelector((s: RootState) =>
    s.editor.availableThemes.find((t) => t.id === s.editor.globalThemeId)
  );

  const generating = useSelector((state: RootState) => state.prompt.generating);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const currentSlide = slides[currentIndex];
  const bgImage = getSlideBackground(theme, currentIndex);

  useSlideScroll(
    containerRef,
    slides.length,
    currentIndex,
    dispatch,
    currentSlide
  );

  const { save } = useSavePresentation();

  useEffect(() => {
    const interval = setInterval(() => {
      if (slides.length > 0) {
        save();
      }
    }, 180000);

    return () => clearInterval(interval);
  }, [slides, save]);

  return (
    <Box
      sx={{
        borderRadius: 4,
        bgcolor: lighten(theme?.colors.background || "#ffffff", 0.3),
        width: "100%",
        transition: "all 0.2s",
      }}
    >
      <AnimatePresence mode="wait">
        {generating ? (
          <LoadingOverlay />
        ) : !currentSlide ? (
          <EmptyState theme={theme} />
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              pb: isMobile ? 0 : 16,
              bgcolor: lighten(theme?.colors.background || "#ffffff", 0.3),
              transition: "all 0.2s",
            }}
          >
            <SlideList
              slides={slides}
              currentSlide={currentSlide}
              containerRef={containerRef}
              theme={theme}
              bgImage={bgImage}
              dispatch={dispatch}
            />
            <SlideToolbar slideId={currentSlide.id} />{" "}
          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};
