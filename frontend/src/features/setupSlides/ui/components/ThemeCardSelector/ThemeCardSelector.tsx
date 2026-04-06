import {
  Box,
  Typography,
  Paper,
  Container,
  useTheme,
  lighten,
  useMediaQuery,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../../../../app/store";
import { setGlobalTheme } from "../../../../../app/store/slices/editorSlice";
import { themes } from "../../../../../shared/constants";
import { motion, AnimatePresence } from "framer-motion";

const MotionPaper = motion(Paper);

export const ThemeCardSelector = () => {
  const dispatch = useDispatch<AppDispatch>();
  const themeMui = useTheme();
  const isMobile = useMediaQuery(themeMui.breakpoints.down("md"));
  const currentThemeId = useSelector(
    (state: RootState) => state.editor.globalThemeId
  );

  const theme = useSelector((s: RootState) =>
    s.editor.availableThemes.find((t) => t.id === s.editor.globalThemeId)
  );

  return (
    <Container
      component={Paper}
      sx={{
        position: "relative",
        maxWidth: "1000px !important",
        p: isMobile ? 1 : 4,
        borderRadius: 2,
        boxShadow: 0,
        bgcolor: lighten(theme?.colors.background || "#ffffff", 0.3),
        transition: "all 0.2s",
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        Выбор Темы
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mt: 4,
          justifyContent: "center",
        }}
      >
        <AnimatePresence mode="sync">
          {themes.map((theme, index) => {
            const isActive = currentThemeId === theme.id;

            return (
              <MotionPaper
                key={theme.id}
                initial={{ opacity: 0, y: 0 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  boxShadow: isActive
                    ? `0 0 15px ${themeMui.palette.primary.main}40`
                    : "0 2px 6px rgba(0,0,0,0.1)",
                  borderColor: isActive
                    ? themeMui.palette.primary.main
                    : themeMui.palette.divider,
                }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{
                  scale: 1.01,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.15)",
                }}
                transition={{
                  opacity: { duration: 0.15, delay: index * 0.05 },
                  y: { duration: 0.15, delay: index * 0.05 },
                  scale: { duration: 0.1 },
                  boxShadow: { duration: 0.15 },
                  borderColor: { duration: 0.15 },
                }}
                onClick={() => dispatch(setGlobalTheme(theme.id))}
                sx={{
                  cursor: "pointer",
                  width: isMobile ? "100%" : 250,
                  p: 2,
                  border: "2px solid",
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: "bold", mb: 2 }}
                >
                  {theme.name}
                </Typography>

                <Box sx={{ display: "flex", mb: 1, gap: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: theme.colors.background,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: theme.colors.heading,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: "50%",
                      backgroundColor: theme.colors.paragraph,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: theme.fonts.heading }}
                  >
                    <span style={{ fontFamily: "Arial" }}>Heading: </span>{" "}
                    {theme.fonts.heading.split(",")[0].trim()}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: theme.fonts.paragraph }}
                  >
                    <span style={{ fontFamily: "Arial" }}>Paragraph: </span>
                    {theme.fonts.paragraph.split(",")[0].trim()}
                  </Typography>
                </Box>
              </MotionPaper>
            );
          })}
        </AnimatePresence>
      </Box>
    </Container>
  );
};
