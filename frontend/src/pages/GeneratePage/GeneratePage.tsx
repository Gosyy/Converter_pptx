import { Box, lighten } from "@mui/material";
import { BlockGeneration } from "../../features/setupSlides";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";

function GeneratePage() {
  const theme = useSelector((s: RootState) =>
    s.editor.availableThemes.find((t) => t.id === s.editor.globalThemeId)
  );
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        bgcolor: lighten(theme?.colors.background || "#ffffff", 0.3),
        transition: "all 0.2s",
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <BlockGeneration />
      </Box>
    </Box>
  );
}

export default GeneratePage;
