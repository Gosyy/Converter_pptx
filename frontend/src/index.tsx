import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app/App";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { ThemeProvider } from "@mui/material/styles";
import { getAppTheme } from "./app/theme";
import { ColorModeContext } from "./app/ColorModeContext";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

const Root = () => {
  const [mode, setMode] = React.useState<"light" | "dark">(() => {
    const cached = localStorage.getItem("app_theme_mode");
    return cached === "dark" ? "dark" : "light";
  });

  const colorMode = React.useMemo(
    () => ({
      mode,
      toggleMode: () => {
        setMode((prev) => {
          const next = prev === "light" ? "dark" : "light";
          localStorage.setItem("app_theme_mode", next);
          return next;
        });
      },
    }),
    [mode]
  );

  const theme = React.useMemo(() => getAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <App />
        </Provider>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

root.render(<Root />);
