import {
  Container,
  Box,
  Button,
  Paper,
  Typography,
  Select,
  MenuItem,
  useTheme,
  lighten,
  useMediaQuery,
} from "@mui/material";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableSlide } from "../SortableSlide/SortableSlide";
import { AnimatePresence, motion } from "framer-motion";
import { useGeneration } from "../../../../../shared/hooks";
import { LoadingOverlay } from "../../../../../shared/components";
import { useSlidesList } from "../../hooks";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../app/store";

const MotionButton = motion(Button);

export const SlidesList = () => {
  const { model, setModel, regenerateSlides, loading } = useGeneration();
  const themeMui = useTheme();
  const { sensors, handleEditSlide, handleDragEnd, localSlides } =
    useSlidesList();

  const theme = useSelector((s: RootState) =>
    s.editor.availableThemes.find((t) => t.id === s.editor.globalThemeId)
  );

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  if (loading) return <LoadingOverlay />;

  return (
    <Container
      component={Paper}
      sx={{
        maxWidth: "1000px !important",
        p: isMobile ? 1 : 4,
        boxShadow: 0,
        borderRadius: 2,
        bgcolor: lighten(theme?.colors.background || "#ffffff", 0.3),
        transition: "all 0.2s",
      }}
    >
      <Typography variant="h5" fontWeight={700} mb={3}>
        Первичная Настройка
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <MotionButton
          variant="contained"
          onClick={regenerateSlides}
          whileHover={{ scale: 1.05, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
          sx={{
            borderRadius: "8px",
            bgcolor: "primary.main",
            color: "white",
            "&:hover": { bgcolor: "primary.main" },
            textTransform: isMobile ? "none" : undefined,
          }}
        >
          {isMobile ? "Сгенерировать" : "Перегенерировать"}
        </MotionButton>

        <Select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          sx={{
            height: 40,
            ml: 2,
            maxWidth: 200,
            borderRadius: "8px",
            color: "text.primary",
            bgcolor: "background.paper",
            border: `1px solid ${themeMui.palette.primary.main}`,
            textTransform: "none",
            fontSize: 15,
            "& .MuiSelect-select": {
              display: "flex",
              alignItems: "center",
              pl: 2,
              pr: 4,
            },
            "& .MuiOutlinedInput-notchedOutline": {
              border: "none",
            },
            "& .MuiSelect-icon": {
              color: "primary.main",
              right: 10,
            },
            "&:hover": {
              bgcolor: "action.hover",
            },
          }}
        >
          <MenuItem value="GigaChat-2">GigaChat-2</MenuItem>
          <MenuItem value="GigaChat-2-Pro">GigaChat-2-Pro</MenuItem>
          <MenuItem value="GigaChat-2-Max">GigaChat-2-Max</MenuItem>
        </Select>
      </Box>
      <AnimatePresence mode="popLayout">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={localSlides.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {localSlides.map((slide, i) => (
                <SortableSlide
                  key={slide.id}
                  slide={slide}
                  index={i}
                  onEditSlide={handleEditSlide}
                />
              ))}
            </SortableContext>
          </DndContext>
        </motion.div>
      </AnimatePresence>
    </Container>
  );
};
