import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSlides } from "../../../../app/store/slices/editorSlice";
import { usePresentations } from "../../../../features/presentation/ui/hooks";
import { LoadingOverlay } from "../../../../shared/components";

const MyPresentations: React.FC = () => {
  const {
    presentations,
    loading,
    deleteTarget,
    setDeleteTarget,
    deletePresentation,
  } = usePresentations();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleOpenPresentation = (presentation: any) => {
    dispatch(setSlides(presentation.content));
    navigate("/editor");
  };

  if (loading) return <LoadingOverlay title="Подождите" />;

  if (!presentations.length)
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        <Typography textAlign={"center"}>У вас пока нет презентаций</Typography>
        <Button variant="contained" sx={{ px: 3, py: 1 }} onClick={() => navigate("/")}>
          Создать презентацию
        </Button>
      </Box>
    );

  return (
    <Box>
      <Typography variant="h5" mb={2}>
        Мои презентации
      </Typography>
      <List>
        {presentations.map((pres) => (
          <ListItem
            key={pres.id}
            disablePadding
            secondaryAction={
              <IconButton edge="end" onClick={() => setDeleteTarget(pres)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton onClick={() => handleOpenPresentation(pres)}>
              <ListItemText
                primary={pres.title}
                secondary={`Слайды: ${pres.content.length}`}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Удаление презентации</DialogTitle>
        <DialogContent>
          <Typography>
            Вы точно хотите удалить презентацию "{deleteTarget?.title}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Отмена</Button>
          <Button color="error" onClick={deletePresentation}>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyPresentations;
