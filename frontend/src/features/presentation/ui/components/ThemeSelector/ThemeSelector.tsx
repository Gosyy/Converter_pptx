import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
  Button,
  Divider,
  Drawer,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { TwitterPicker } from "react-color";
import PaletteIcon from "@mui/icons-material/PaletteOutlined";
import { themes } from "../../../../../shared/constants";
import { useThemeActions } from "../../hooks";

function ThemeSelector() {
  const {
    open,
    handleThemeSelect,
    handleColorChange,
    applyCustomTheme,
    setOpen,
    customColors,
  } = useThemeActions();

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <Box>
      <Tooltip title="Сменить тему" placement="left">
        <IconButton onClick={() => setOpen((prev) => !prev)} color="primary">
          <PaletteIcon />
        </IconButton>
      </Tooltip>

      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{ zIndex: 1401, minWidth: 300 }}
      >
        <Box sx={{ px: 2, mb: 2 }}>
          <Typography fontWeight="bold" my={1}>
            Custom Theme
          </Typography>
          <Box mb={2}>
            <Typography mb={0.5}>Heading</Typography>
            <Box boxShadow={2} borderRadius={"4px"} overflow={"hidden"}>
              <Box height={20} bgcolor={customColors.heading}></Box>
              <TwitterPicker
                color={customColors.heading}
                onChangeComplete={(color) =>
                  handleColorChange("heading", color)
                }
                triangle="hide"
                styles={{
                  default: {
                    card: {
                      borderRadius: "0px",
                      boxShadow: "none",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          <Box mb={2}>
            <Typography mb={0.5}>Paragraph</Typography>
            <Box boxShadow={2} borderRadius={"4px"} overflow={"hidden"}>
              <Box height={20} bgcolor={customColors.paragraph}></Box>
              <TwitterPicker
                color={customColors.paragraph}
                onChangeComplete={(color) =>
                  handleColorChange("paragraph", color)
                }
                triangle="hide"
                styles={{
                  default: {
                    card: {
                      borderRadius: "0px",
                      boxShadow: "none",
                    },
                  },
                }}
              />
            </Box>
          </Box>

          <Button variant="contained" fullWidth onClick={applyCustomTheme}>
            Apply Custom Theme
          </Button>
        </Box>

        <Box mb={1}>
          {themes.map((theme) => (
            <MenuItem
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  {[
                    theme.colors.background,
                    theme.colors.heading,
                    theme.colors.paragraph,
                  ].map((color, i) => (
                    <Box
                      key={i}
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        background: color,
                        border: "1px solid #ccc",
                      }}
                    />
                  ))}
                </Box>
                <Box sx={{ ml: 1 }}>
                  <Typography fontWeight="bold">{theme.name}</Typography>
                </Box>
              </Box>
            </MenuItem>
          ))}
        </Box>
      </Drawer>
    </Box>
  );
}

export default ThemeSelector;
