import { Box } from "@mui/material";
import { PlateSlide } from "../../../../../shared/types";

export const renderMiniLayout = (layout: PlateSlide["layout"]) => {
  switch (layout) {
    case "left-image":
      return (
        <Box sx={{ display: "flex", height: "100%" }}>
          <Box sx={{ flex: 1, bgcolor: "grey.400", mr: 0.5 }} />
          <Box sx={{ flex: 1, bgcolor: "grey.200" }} />
        </Box>
      );
    case "right-image":
      return (
        <Box sx={{ display: "flex", height: "100%" }}>
          <Box sx={{ flex: 1, bgcolor: "grey.200", mr: 0.5 }} />
          <Box sx={{ flex: 1, bgcolor: "grey.400" }} />
        </Box>
      );
    case "top-image":
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box sx={{ flex: 1, bgcolor: "grey.400", mb: 0.5 }} />
          <Box sx={{ flex: 1, bgcolor: "grey.200" }} />
        </Box>
      );
    case "bottom-image":
      return (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <Box sx={{ flex: 1, bgcolor: "grey.200", mb: 0.5 }} />
          <Box sx={{ flex: 1, bgcolor: "grey.400" }} />
        </Box>
      );
    case "grid-2x2":
      return (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridTemplateRows: "1fr 1fr",
            gap: 0.5,
            height: "100%",
          }}
        >
          {[...Array(4)].map((_, i) => (
            <Box key={i} sx={{ bgcolor: "grey.200" }} />
          ))}
        </Box>
      );

    case "center":
    case "text-only":
    default:
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            bgcolor: "grey.200",
          }}
        />
      );
  }
};
