import React from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import CodeIcon from "@mui/icons-material/Code";
import { ReactEditor } from "slate-react";
import { isMarkActive, toggleMark } from "../../lib";
import { Editor } from "slate";

interface ToolbarProps {
  editor: ReactEditor;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  return (
    <Box
      sx={{
        position: "absolute",
        top: -40,
        left: 50,
        zIndex: 20,
        display: "flex",
        gap: 1,
        backgroundColor: "background.paper",
        borderRadius: 1,
        boxShadow: 2,
      }}
    >
      <ToggleButtonGroup exclusive={false} size="small">
        <ToggleButton
          value="bold"
          selected={isMarkActive(editor as Editor, "bold")}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(editor as Editor, "bold");
          }}
        >
          <FormatBoldIcon fontSize="small" />
        </ToggleButton>

        <ToggleButton
          value="italic"
          selected={isMarkActive(editor as Editor, "italic")}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(editor as Editor, "italic");
          }}
        >
          <FormatItalicIcon fontSize="small" />
        </ToggleButton>

        <ToggleButton
          value="code"
          selected={isMarkActive(editor as Editor, "code")}
          onMouseDown={(e) => {
            e.preventDefault();
            toggleMark(editor as Editor, "code");
          }}
        >
          <CodeIcon fontSize="small" />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default Toolbar;
