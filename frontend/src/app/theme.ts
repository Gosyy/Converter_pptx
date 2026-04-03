import { createTheme, PaletteMode } from "@mui/material/styles";

export const getAppTheme = (mode: PaletteMode) =>
  createTheme({
    typography: {
      fontFamily: "'JetBrains Mono', monospace",
      h1: { fontFamily: "'JetBrains Mono', monospace" },
      h2: { fontFamily: "'JetBrains Mono', monospace" },
      h3: { fontFamily: "'JetBrains Mono', monospace" },
      h4: { fontFamily: "'JetBrains Mono', monospace" },
      h5: { fontFamily: "'JetBrains Mono', monospace" },
      h6: { fontFamily: "'JetBrains Mono', monospace" },
      body1: { fontFamily: "'JetBrains Mono', monospace" },
      body2: { fontFamily: "'JetBrains Mono', monospace" },
      button: { fontFamily: "'JetBrains Mono', monospace" },
      caption: { fontFamily: "'JetBrains Mono', monospace" },
    },
    palette: {
      mode,
      primary: {
        main: mode === "light" ? "#2e2e2e" : "#e4e4e4",
      },
      background: {
        default: mode === "light" ? "#f7f8fa" : "#121417",
        paper: mode === "light" ? "#ffffff" : "#1b1f24",
      },
    },
  });
