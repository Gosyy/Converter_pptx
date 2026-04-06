import React from "react";
import UploadFileIcon from "@mui/icons-material/AddCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  MenuItem,
  Select,
  Snackbar,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useGeneration } from "../../../shared/hooks";
import { useNavigate } from "react-router-dom";
import { LoadingOverlay } from "../../../shared/components";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../app/store";
import { setUseDatabase } from "../../../app/store/slices/uiSlice";

export const PromptSend: React.FC = () => {
  const {
    inputText,
    setInputText,
    fileInputRef,
    fileStatus,
    handleFileChange,
    handleSubmit,
    loading,
    error,
    setError,
    model,
    setModel,
    progressEvents,
  } = useGeneration();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch<AppDispatch>();
  const useDatabase = useSelector((s: RootState) => s.ui.useDatabase);

  const [guestMsg, setGuestMsg] = React.useState<string | null>(null);
  const [preset, setPreset] = React.useState<"strict" | "report">("strict");
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e);
    navigate("/generate");
  };

  const loginAsGuest = async () => {
    try {
      const resp = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "guest@example.com", password: "guest", guest: true }),
      });
      if (!resp.ok) {
        throw new Error("guest_login_failed");
      }
      localStorage.setItem("guest_mode", "enabled");
      setGuestMsg("Гостевой режим включён");
    } catch {
      setGuestMsg("Не удалось включить гостевой режим");
    }
  };

  if (loading) return <LoadingOverlay />;

  return (
    <Box
      sx={{
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        p: 2,
        flexDirection: "column",
      }}
    >
      <Box
        textAlign="center"
        sx={{
          maxWidth: 1200,
          mb: 4,
        }}
      >
        <Typography
          variant={isMobile ? "h4" : "h2"}
          fontWeight="bold"
          sx={{
            m: 0,
            color: "text.primary",
            maxWidth: 1000,
          }}
        >
          Создавайте презентации без усилий за короткое время
        </Typography>
        <Typography
          variant={isMobile ? "subtitle1" : "h5"}
          sx={{
            margin: 0,
            mt: 2,
            color: "text.secondary",
            maxWidth: 1000,
          }}
        >
          Трансформируйте свои идеи в профессиональные презентации. Просто
          напишите свои мысли и ИИ сделает всё остальное.
        </Typography>
      </Box>

      <form
        onSubmit={onSubmit}
        style={{
          padding: "8px 8px",
          maxWidth: isMobile ? "100%" : "1000px",
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            transition: "all .25s ease",
          }}
        >
          <Button
            variant="text"
            startIcon={<PersonOutlineRoundedIcon />}
            onClick={loginAsGuest}
            sx={{ textTransform: "none" }}
          >
            Войти как гость
          </Button>
          <FormControlLabel
            control={
              <Switch
                checked={useDatabase}
                onChange={(e) => dispatch(setUseDatabase(e.target.checked))}
                color="primary"
                sx={{
                  "& .MuiSwitch-switchBase": {
                    transitionDuration: "250ms",
                  },
                }}
              />
            }
            label={
              useDatabase
                ? "Сохранять в БД: включено"
                : "Сохранять в БД: отключено"
            }
            sx={{
              mr: 0,
              "& .MuiFormControlLabel-label": {
                fontSize: 14,
                color: "text.secondary",
                transition: "color .25s ease",
              },
            }}
          />
        </Box>

        <TextField
          fullWidth
          multiline
          minRows={6}
          maxRows={10}
          size="small"
          placeholder="Прикрепите файл и введите в поле то, что хотите получить от ИИ в презентации."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              pr: 1,
              boxShadow: 4,
              backgroundColor: "background.paper",
              color: "text.primary",
            },
          }}
        />

        <Box
          mt={2}
          display="flex"
          alignItems="center"
          flexDirection={isMobile ? "column" : "row"}
          justifyContent="space-between"
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept=".pdf,.docx,.pptx,.txt,.md"
            onChange={handleFileChange}
          />

          <Box
            width={isMobile ? "100%" : undefined}
            display={"flex"}
            justifyContent={"space-between"}
            mb={isMobile ? 2 : undefined}
          >
            <Button
              onClick={() => fileInputRef.current?.click()}
              startIcon={
                fileStatus?.converted ? <CheckCircleIcon /> : <UploadFileIcon />
              }
              variant="outlined"
              sx={{
                height: 40,
                borderRadius: "8px",
                color: "primary.main",
                borderColor: "primary.main",
                maxWidth: isMobile ? "100%" : 200,
                px: 2,
                justifyContent: "flex-start",
                textTransform: "none",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                {fileStatus?.name || "Прикрепить файл"}
              </Box>
            </Button>

            <Select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              sx={{
                height: 40,
                ml: 2,
                maxWidth: isMobile ? "100%" : 200,
                borderRadius: "8px",
                color: "text.primary",
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.primary.main}`,
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
              <MenuItem value="GigaChat-2">GigaChat 2.0</MenuItem>
            </Select>

            <Select
              value={preset}
              onChange={(e) => setPreset(e.target.value as "strict" | "report")}
              title={
                preset === "strict"
                  ? "Строгий: шаблонный фон, графики, таблицы, списки, текст"
                  : "Доклад: всё из строгого + изображения"
              }
              sx={{
                height: 40,
                ml: 2,
                maxWidth: isMobile ? "100%" : 260,
                borderRadius: "8px",
                color: "text.primary",
                bgcolor: "background.paper",
                border: `1px solid ${theme.palette.primary.main}`,
                fontSize: 14,
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
            >
              <MenuItem
                value="strict"
                title="Шаблонный фон, графики, таблицы, списки, текст"
              >
                KPI preset: Строгий
              </MenuItem>
              <MenuItem
                value="report"
                title="Шаблонный фон, графики, таблицы, списки, текст + изображения"
              >
                KPI preset: Доклад
              </MenuItem>
            </Select>
          </Box>

          <Button
            type="submit"
            variant="contained"
            startIcon={<PlayArrowIcon />}
            sx={{
              height: 50,
              borderRadius: "12px",
              bgcolor: "primary.main",
              textTransform: "none",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
              width: isMobile ? "100%" : undefined,
            }}
          >
            Сгенерировать
          </Button>
        </Box>
      </form>

      {progressEvents.length > 0 && (
        <Box sx={{ mt: 2, width: "100%", maxWidth: isMobile ? "100%" : "1000px" }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: "text.secondary" }}>
            Прогресс генерации:
          </Typography>
          {progressEvents.map((event, idx) => (
            <Typography key={`${event}-${idx}`} variant="caption" display="block">
              • {event}
            </Typography>
          ))}
        </Box>
      )}

      <Snackbar
        open={!!error}
        autoHideDuration={5000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        sx={{ zIndex: 2000 }}
      >
        <Alert
          onClose={() => setError(null)}
          severity="error"
          sx={{
            width: "100%",
            color: "error.contrastText",
            bgcolor: "error.main",
            zIndex: 1101,
          }}
        >
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!guestMsg}
        autoHideDuration={3000}
        onClose={() => setGuestMsg(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setGuestMsg(null)}
          severity={guestMsg?.includes("Не удалось") ? "warning" : "success"}
          sx={{ width: "100%" }}
        >
          {guestMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};
