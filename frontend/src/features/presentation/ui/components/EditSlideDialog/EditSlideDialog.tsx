import { Box, Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { layoutOptions } from "../../../lib";
import { PlateSlide } from "../../../../../shared/types";
import { renderMiniLayout } from "../../lib";

interface EditSlideDialogProps {
  slideEditing: boolean;
  setSlideEditing: (open: boolean) => void;
  selectedLayout: PlateSlide["layout"];
  setSelectedLayout: (s: PlateSlide["layout"]) => void;
  handleChangeSlide: (layout: PlateSlide["layout"]) => void;
}

function EditSlideDialog({
  slideEditing,
  setSlideEditing,
  selectedLayout,
  setSelectedLayout,
  handleChangeSlide,
}: EditSlideDialogProps) {
  return (
    <Dialog open={slideEditing} onClose={() => setSlideEditing(false)}>
      <DialogTitle sx={{ width: "fit-content" }}>
        Изменить шаблон слайда
      </DialogTitle>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "center",
          gap: 1,
          flexWrap: "wrap",
          width: "fit-content",
        }}
      >
        {layoutOptions.map((layout) => {
          const isSelected = selectedLayout === layout;

          return (
            <Box
              key={layout}
              onClick={() => setSelectedLayout(layout)}
              sx={{
                width: 100,
                height: 60,
                border: 2,
                borderColor: isSelected ? "primary.main" : "grey.400",
                borderRadius: 1,
                cursor: "pointer",
                overflow: "hidden",
                transition: "all 0.1s",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              {renderMiniLayout(layout)}
            </Box>
          );
        })}
      </Box>
      <DialogActions>
        <Button onClick={() => setSlideEditing(false)}>Отмена</Button>
        <Button
          variant="contained"
          onClick={() => handleChangeSlide(selectedLayout)}
        >
          Изменить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditSlideDialog;
