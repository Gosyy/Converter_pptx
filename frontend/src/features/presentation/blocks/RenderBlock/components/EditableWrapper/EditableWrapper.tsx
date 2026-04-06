import React from "react";
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteIcon from "@mui/icons-material/Delete";
import { defaultFonts } from "../../../../../../shared/constants";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../../app/store";
import { pushHistory } from "../../../../../../app/store/slices/editorSlice";
import { SlideBlock } from "../../../../../../shared/types";
import { useEditableWrapper } from "../../hooks";

interface EditableWrapperProps {
  children: React.ReactNode;
  onEdit: () => void;
  onDelete?: () => void;
  onSettingsChange?: (settings: {
    fontFamily: string;
    fontSize: number;
  }) => void;
  block?: SlideBlock;
}

const EditableWrapper: React.FC<EditableWrapperProps> = ({
  children,
  onEdit,
  onDelete,
  onSettingsChange,
  block,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    hovered,
    settingsOpen,
    setSettingsOpen,
    theme,
    openSettings,
    handleSettingsSave,
    setHovered,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    tapped,
    setTapped,
  } = useEditableWrapper({ block, onSettingsChange });

  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));

  return (
    <Box
      sx={{
        position: "relative",
        border: hovered || tapped ? "1px dashed #bbb" : "1px solid transparent",
        borderRadius: 1,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: "#999",
          backgroundColor: theme?.colors.background || "#fff",
        },
      }}
      onMouseEnter={() => !isMobile && setHovered(true)}
      onMouseLeave={() => !isMobile && setHovered(false)}
      onClick={() => isMobile && setTapped(!tapped)}
      data-block-id={"true"}
    >
      {children}

      <Box
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          display: "flex",
          gap: 0.5,
          opacity: hovered || tapped ? 1 : 0,
          pointerEvents: hovered || tapped ? "auto" : "none",
          transition: "opacity 0.2s",
        }}
      >
        <IconButton
          size="small"
          sx={{
            bgcolor: "white",
            boxShadow: 1,
            "&:hover": { bgcolor: "#eee" },
            color: theme?.colors.heading,
          }}
          onClick={onEdit}
        >
          <EditIcon fontSize="small" />
        </IconButton>

        {onSettingsChange && (
          <IconButton
            size="small"
            sx={{
              bgcolor: "white",
              boxShadow: 1,
              "&:hover": { bgcolor: "#eee" },
              color: theme?.colors.heading,
            }}
            onClick={openSettings}
          >
            <SettingsIcon fontSize="small" />
          </IconButton>
        )}

        {onDelete && (
          <IconButton
            size="small"
            sx={{
              bgcolor: "white",
              boxShadow: 1,
              "&:hover": { bgcolor: "#eee" },
              color: theme?.colors.heading,
            }}
            onClick={() => {
              onDelete();
              dispatch(pushHistory());
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)}>
        <DialogTitle>Настройки текста</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
        >
          <TextField
            select
            label="Шрифт"
            variant="standard"
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
          >
            {defaultFonts.map((font) => (
              <MenuItem key={font} value={font}>
                {font}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Размер"
            variant="standard"
            value={block?.style?.fontSize || fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
          >
            {[12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
              <MenuItem key={size} value={size}>
                {size}px
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Отмена</Button>
          <Button
            variant="contained"
            onClick={() => {
              handleSettingsSave();
              dispatch(pushHistory());
            }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditableWrapper;
