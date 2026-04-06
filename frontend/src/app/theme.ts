import { createTheme, PaletteMode } from "@mui/material/styles";

export const getAppTheme = (mode: PaletteMode) => {
  const isDark = mode === "dark";

  return createTheme({
    typography: {
      fontFamily: "'Inter', 'JetBrains Mono', monospace",
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { fontWeight: 600, textTransform: "none" },
    },
    palette: {
      mode,
      primary: {
        main: isDark ? "#7C9BFF" : "#3A63F3",
      },
      secondary: {
        main: isDark ? "#45D0BC" : "#1DAA94",
      },
      background: {
        default: isDark ? "#0B1220" : "#F5F7FB",
        paper: isDark ? "#111A2B" : "#FFFFFF",
      },
      text: {
        primary: isDark ? "#EAF0FF" : "#101828",
        secondary: isDark ? "#AAB6D4" : "#475467",
      },
      divider: isDark ? "rgba(124, 155, 255, 0.22)" : "rgba(58, 99, 243, 0.16)",
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundImage: isDark
              ? "radial-gradient(circle at 12% 10%, rgba(124,155,255,0.18), transparent 40%), radial-gradient(circle at 88% 0%, rgba(69,208,188,0.14), transparent 34%)"
              : "none",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            border: isDark ? "1px solid rgba(124, 155, 255, 0.14)" : undefined,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            boxShadow: "none",
          },
          containedPrimary: {
            boxShadow: isDark
              ? "0 10px 24px rgba(58, 99, 243, 0.35)"
              : "0 8px 20px rgba(58, 99, 243, 0.24)",
          },
        },
      },
    },
  });
};
