import { PlateSlide, SlideBlock } from "../../../../../shared/types";
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import SlideContent from "../../../blocks/SlideContent";
import { RenderBlock } from "../../../blocks/RenderBlock";
import { motion } from "framer-motion";
import { useMiniSlidesActions } from "../../hooks";

const MiniSlides: React.FC<{ slides: PlateSlide[] }> = ({ slides }) => {
  const { currentIndex, containerRef, handleSlideClick, theme } =
    useMiniSlidesActions(slides);

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const slideWidth = isMobile ? 500 : 1100;
  const slideHeight = isMobile ? 700 : 618;

  return (
    <Box
      ref={containerRef}
      sx={{
        maxWidth: isMobile ? "100vw" : 145,
        height: isMobile ? "auto" : "95vh",
        overflowX: isMobile ? "auto" : "hidden",
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        gap: isMobile ? 1 : 0.5,
        justifyContent: isMobile ? "flex-start" : "center",
        userSelect: "none",
        position: "fixed",
        zIndex: isMobile ? 13 : undefined,
        p: isMobile ? 1 : 0,
      }}
    >
      <Box
        sx={{
          borderRight: isMobile ? "none" : "5px solid #ccc",
          display: "flex",
          height: isMobile ? undefined : "80vh",
          flexDirection: isMobile ? "row" : "column",
          overflowY: "auto",
          justifyContent: isMobile ? "center" : "space-between",
          gap: 1,
          borderRadius: isMobile ? undefined : 1,
          flexWrap: isMobile ? "wrap" : undefined,
        }}
      >
        {slides.map((slide, i) => (
          <Box
            component={motion.div}
            key={slide.id}
            onClick={() => handleSlideClick(slide.id, i)}
            layout
            initial={false}
            animate={{
              borderColor:
                i === currentIndex ? theme?.colors.heading : "rgba(0,0,0,0)",
            }}
            whileHover={{ borderColor: theme?.colors.paragraph }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            sx={{
              width: isMobile ? "auto" : "100%",
              minWidth: isMobile ? 30 : undefined,
              boxSizing: "border-box",
              boxShadow: 1,
              minHeight: isMobile ? 30 : 80,
              borderRadius: isMobile ? "50%" : 0.7,
              overflow: "hidden",
              borderStyle: "solid",
              borderWidth: 1,
              cursor: "pointer",
              position: "relative",
              background: theme?.colors.background || "#fff",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              id={`mini-${slide.id}`}
              sx={{
                zoom: 0.13,
                transformOrigin: "top left",
                width: slideWidth,
                height: "100%",
                maxHeight: slideHeight,
                pointerEvents: "none",
                overflow: "hidden",
                position: isMobile ? "absolute" : "relative",
                top: isMobile ? -9999 : 0,
                left: isMobile ? -9999 : 0,
              }}
            >
              <SlideContent
                isMini={true}
                slide={slide}
                setSlideContent={() => {}}
                renderBlock={(block: SlideBlock) => (
                  <Box data-block-id={block.id} sx={{ width: "100%" }}>
                    <RenderBlock
                      key={block.id}
                      block={block}
                      id={block.id}
                      slideId={slide.id}
                      editingBlock={null}
                      editValue={[]}
                      setEditValue={() => {}}
                      setEditingBlock={() => {}}
                      isMini={true}
                    />
                  </Box>
                )}
              />
            </Box>

            {!isMobile ? (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bgcolor: "rgba(255, 255, 255, 1)",
                  borderBottom: "1px solid #ccc",
                  borderRight: "1px solid #ccc",
                  width: 25,
                  display: "flex",
                  borderBottomRightRadius: 7,
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: theme?.colors.heading,
                    fontWeight: "bold",
                    px: 1,
                  }}
                >
                  {i + 1}
                </Typography>
              </Box>
            ) : (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme?.colors.heading,
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  {i + 1}
                </Typography>
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default MiniSlides;
