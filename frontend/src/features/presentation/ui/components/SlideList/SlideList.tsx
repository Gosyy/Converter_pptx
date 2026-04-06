import React from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { PlateSlide, Theme } from "../../../../../shared/types";
import { AppDispatch } from "../../../../../app/store";
import SlideItem from "../SlideItem";
import MiniSlides from "../MiniSlides";
import SlideToolbar from "../SlideToolbar";

interface SlideListProps {
  slides: PlateSlide[];
  currentSlide: PlateSlide;
  containerRef: React.RefObject<HTMLDivElement | null>;
  theme?: Theme;
  bgImage: string;
  dispatch: AppDispatch;
}

export const SlideList: React.FC<SlideListProps> = ({
  slides,
  currentSlide,
  containerRef,
  theme,
  bgImage,
  dispatch,
}) => {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        flexDirection: isMobile ? "column" : "row",
        width: "100%",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: isMobile ? "auto" : 145,
          overflowX: isMobile ? "auto" : undefined,
          display: "flex",
          flexDirection: isMobile ? "row" : "column",
          gap: isMobile ? 1 : 2,
          borderRadius: 2,
          p: 1,
          height: isMobile ? undefined : "90vh",
          justifyContent: "center",
        }}
      >
        <MiniSlides slides={slides} />
      </Box>

      <Box>
        <Box
          ref={containerRef}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 0 : 4,
            mt: isMobile ? 8 : 16,
            width: isMobile ? "95%" : "100%",
            paddingX: isMobile ? 1 : undefined,
          }}
        >
          {slides.map((slide, index) => (
            <motion.div
              key={slide.id}
              id={`slide-${index}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ width: "100%" }}
            >
              <SlideItem
                slide={slide}
                theme={theme}
                bgImage={bgImage}
                dispatch={dispatch}
              />
            </motion.div>
          ))}
        </Box>
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          minWidth: 40,
          overflowY: "auto",
          height: "90vh",
          display: isMobile ? "none" : "flex",
          position: isMobile ? "fixed" : undefined,
          alignItems: "center",
          p: 1,
        }}
      >
        
      </Box>
    </Box>
  );
};
