import React from "react";
import {
  Box,
  Button,
  TextField,
  Paper,
  List,
  ListItem,
  Typography,
  darken,
  Snackbar,
  Alert,
  lighten,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import FileIcon from "@mui/icons-material/FileOpen";
import SendIcon from "@mui/icons-material/Send";
import { useGeneration } from "../../../../../shared/hooks";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../app/store";
import { Theme } from "../../../../../shared/types";
import { LoadingOverlay } from "../../../../../shared/components";

export const AiChat: React.FC = () => {
  const {
    inputText,
    setInputText,
    messages,
    fileInputRef,
    handleFileChange,
    handleSubmit,
    fileStatus,
    error,
    setError,
    loading,
  } = useGeneration();

  const theme: Theme | undefined = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  if (loading) return <LoadingOverlay />;

  return (
    <AnimatePresence mode="wait">
      <Box
        component={motion.div}
        sx={{
          display: "flex",
          flexDirection: "column",
          borderRadius: 4,
          height: "100%",
          bgcolor: "white",
        }}
      >
        <Box
          sx={{
            p: 1,
            height: 40,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <AutoAwesomeIcon sx={{ color: "primary.main" }} />
          <Typography sx={{ color: "primary.main" }}>
            <strong>AI Generate</strong>
          </Typography>
        </Box>
        <Paper
          elevation={3}
          sx={{
            height: "100%",
            overflowY: "auto",
            boxShadow: "none",
            borderTop: `1px solid`,
            borderBottom: `1px solid`,
            borderRadius: 0,
            p: 1,
          }}
        >
          <List sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <ListItem
                    style={{
                      display: "flex",
                      padding: 0,
                      justifyContent:
                        msg.type === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: "75%",
                        borderRadius: 2,
                        bgcolor:
                          msg.type === "user"
                            ? "#2e2e2e"
                            : lighten("#2e2e2e", 0.9),
                        color:
                          msg.type === "user"
                            ? lighten("#2e2e2e", 0.9)
                            : "#2e2e2e",
                        p: 1.5,
                        wordBreak: "break-word",
                        whiteSpace: "pre-wrap",
                        transition: "all 0.2s",
                      }}
                    >
                      <Typography variant="body1">{msg.content}</Typography>
                      {msg.file && (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            bgcolor: darken("#2e2e2e", 0.1),
                            borderRadius: 1,
                            mt: 0.5,
                            p: 0.5,
                          }}
                        >
                          <FileIcon fontSize="small" />
                          <Typography
                            variant="caption"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              ml: 0.5,
                            }}
                          >
                            {msg.file.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </AnimatePresence>
          </List>
        </Paper>

        <form onSubmit={handleSubmit} style={{ padding: "8px 8px" }}>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              size="small"
              label="Prompt"
              placeholder="Введите сообщение..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  pr: 1,
                },
              }}
              InputProps={{
                endAdornment: (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: "none" }}
                      accept=".pdf,.docx,.pptx,.txt,.md"
                      onChange={handleFileChange}
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Upload file"
                      sx={{
                        minWidth: 28,
                        borderRadius: "50%",
                        p: 0.5,
                        color: "#2e2e2e",
                        "&:hover": { bgcolor: lighten("#2e2e2e", 0.95) },
                      }}
                    >
                      {fileStatus?.converted ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : (
                        <UploadFileIcon fontSize="small" />
                      )}
                    </Button>
                  </>
                ),
              }}
            />
            <Button
              variant="contained"
              type="submit"
              aria-label="Send"
              sx={{
                color: "#2e2e2e",
                bgcolor: "rgba(0,0,0,0)",
                border: `1px solid #2e2e2e`,
                transition: "all 0.2s",
                borderRadius: "8px",
                p: 0.5,
                minWidth: 50,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: lighten("#2e2e2e", 0.95),
                  color: "#2e2e2e",
                  boxShadow: "none",
                },
              }}
            >
              <SendIcon />
            </Button>
          </Box>
        </form>
      </Box>
      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </AnimatePresence>
  );
};
