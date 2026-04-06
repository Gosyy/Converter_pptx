import { Box, Button, Dialog, DialogActions, DialogTitle } from "@mui/material";
import { layoutOptions } from "../../../lib";
import { PlateSlide } from "../../../../../shared/types";
import { renderMiniLayout } from "../../lib";

interface AddSlideDialogProps {
  addDialogOpen: boolean;
  setAddDialogOpen: (open: boolean) => void;
  selectedLayout: PlateSlide["layout"];
  setSelectedLayout: (s: PlateSlide["layout"]) => void;
  handleAddSlide: () => void;
}

function AddSlideDialog({
  addDialogOpen,
  setAddDialogOpen,
  selectedLayout,
  setSelectedLayout,
  handleAddSlide,
}: AddSlideDialogProps) {
  return (
    <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
      <DialogTitle sx={{ width: "fit-content" }}>
        Выберите шаблон слайда
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
        <Button onClick={() => setAddDialogOpen(false)}>Отмена</Button>
        <Button variant="contained" onClick={handleAddSlide}>
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddSlideDialog;
