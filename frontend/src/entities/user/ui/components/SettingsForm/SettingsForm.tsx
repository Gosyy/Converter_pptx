import React from "react";
import {
  Box,
  TextField,
  Button,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useSettings } from "../../hooks";
import { ReactComponent as LogoPC } from "../../../../../shared/assets/logo/logo-pc.svg";
import { ReactComponent as LogoPhone } from "../../../../../shared/assets/logo/logo-phone.svg";

export const SettingsForm: React.FC = () => {
  const { name, setName, email, setEmail, save, loading, error } =
    useSettings();

  const isMobile = useMediaQuery(useTheme().breakpoints.down("md"));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: 500,
        width: "100%",
        height: "fit-content",
        justifyContent: "center",
        alignItems: "center",
        boxShadow: isMobile ? 0 : 3,
        p: isMobile ? 2 : 4,
        borderRadius: 2,
      }}
    >
      {isMobile ? <LogoPhone /> : <LogoPC />}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
        }}
      >
        <Typography variant="h4" mb={3}>
          Настройки пользователя
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <Button variant="contained" onClick={save} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : "Сохранить"}
        </Button>
      </Box>
    </Box>
  );
};
