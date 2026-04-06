import React from "react";
import {
  Box,
  Button,
  IconButton,
  lighten,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import UndoIcon from "@mui/icons-material/Undo";
import RedoIcon from "@mui/icons-material/Redo";
import ArrowBack from "@mui/icons-material/ArrowBackIos";
import ArrowForward from "@mui/icons-material/ArrowForwardIos";
import UploadIcon from "@mui/icons-material/UploadOutlined";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../app/store";
import {
  redo,
  setCurrentIndex,
  undo,
} from "../../../../../app/store/slices/editorSlice";
import { exportToPptx } from "../../../lib";
import { useSlideActions } from "../../hooks";
import AddSlideDialog from "../AddSlideDialog";
import { useSavePresentation } from "../../../../../shared/hooks";

const SlideNavigationToolbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const theme = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  const {
    handleAddSlide,
    handleDeleteSlide,
    setSelectedLayout,
    setAddDialogOpen,
    addDialogOpen,
    slides,
    currentIndex,
    historyIndex,
    historyLength,
    selectedLayout,
  } = useSlideActions();

  const { save } = useSavePresentation();

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      {!isMobile && (
        <Box>
          <IconButton
            size={isMobile ? "small" : "medium"}
            color="primary"
            onClick={() =>
              dispatch(setCurrentIndex(Math.max(currentIndex - 1, 0)))
            }
            disabled={currentIndex === 0}
          >
            <ArrowBack />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() =>
              dispatch(
                setCurrentIndex(Math.min(currentIndex + 1, slides.length - 1))
              )
            }
            disabled={currentIndex === slides.length - 1}
          >
            <ArrowForward />
          </IconButton>
          <IconButton
            color="primary"
            onClick={() => setAddDialogOpen(true)}
            sx={{ ml: "auto" }}
          >
            <AddIcon color="primary" />
          </IconButton>
        </Box>
      )}

      <IconButton
        onClick={handleDeleteSlide}
        color="primary"
        size={isMobile ? "small" : "medium"}
      >
        <DeleteIcon />
      </IconButton>

      <IconButton
        size={isMobile ? "small" : "medium"}
        color="primary"
        onClick={() => dispatch(undo())}
        disabled={historyIndex <= 0}
      >
        <UndoIcon />
      </IconButton>
      <IconButton
        size={isMobile ? "small" : "medium"}
        color="primary"
        onClick={() => dispatch(redo())}
        disabled={historyIndex >= historyLength - 1}
      >
        <RedoIcon />
      </IconButton>

      <Button
        onClick={() => {
          exportToPptx(slides, theme!);
          save();
        }}
        sx={{
          ml: 1,
          color: "primary.main",
          bgcolor: "rgba(0,0,0,0)",
          border: `1px solid`,
          borderColor: "primary.main",
          transition: "all 0.2s",
          "&:hover": {
            bgcolor: lighten(muiTheme.palette.primary.main, 0.95),
          },
        }}
      >
        Export
        {!isMobile && <UploadIcon />}
      </Button>

      <AddSlideDialog
        addDialogOpen={addDialogOpen}
        handleAddSlide={handleAddSlide}
        selectedLayout={selectedLayout}
        setAddDialogOpen={setAddDialogOpen}
        setSelectedLayout={setSelectedLayout}
      />
    </Box>
  );
};

export default SlideNavigationToolbar;
