import React from "react";
import {
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useEditableImage } from "../../../hooks";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  slideId: string;
  blockId: string;
}

const EditableImage: React.FC<Props> = ({ slideId, blockId }) => {
  const {
    slide,
    hover,
    setHover,
    block,
    theme,
    setOpen,
    open,
    tempUrl,
    setTempUrl,
    setDragOver,
    handleDrop,
    handleFileChange,
    handleSave,
    fileInputRef,
    dragOver,
    tapped,
    isMobile,
    handleTap,
  } = useEditableImage({ slideId, blockId });

  const showIcons = (!isMobile && hover) || (isMobile && tapped);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
      data-block-id={"true"}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={isMobile ? handleTap : undefined}
    >
      <Box
        component="img"
        src={block!.url}
        alt="Image"
        sx={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <AnimatePresence>
        {showIcons && (
          <motion.div
            key="edit-icon"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              top: 4,
              left:
                slide?.layout === "right-image" || slide?.layout === "top-image"
                  ? 4
                  : undefined,
              right:
                slide?.layout !== "right-image" && slide?.layout !== "top-image"
                  ? 4
                  : undefined,
              zIndex: 10,
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
              onClick={() => setOpen(true)}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Image</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            label="Image URL"
            fullWidth
            value={tempUrl}
            onChange={(e) => setTempUrl(e.target.value)}
          />
          <Box
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${dragOver ? "#1976d2" : "#ccc"}`,
              borderRadius: 2,
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              textAlign: "center",
              transition: "border-color 0.2s",
              bgcolor: dragOver ? "#f0f7ff" : "transparent",
            }}
          >
            <CloudUploadIcon fontSize="large" sx={{ mb: 1 }} />
            <Typography variant="body2" color="textSecondary">
              Drag & Drop an image here, or click to select
            </Typography>
            <input
              type="file"
              hidden
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </Box>

          {tempUrl && (
            <Box sx={{ width: "100%", height: 200, mt: 2 }}>
              <Box
                component="img"
                src={tempUrl}
                alt="Preview"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  border: "1px solid #ccc",
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              setTempUrl(block!.url);
            }}
          >
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EditableImage;
