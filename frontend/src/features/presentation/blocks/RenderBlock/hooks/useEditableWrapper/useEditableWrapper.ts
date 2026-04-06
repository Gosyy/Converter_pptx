import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../../app/store";
import { useState } from "react";
import { SlideBlock } from "../../../../../../shared/types";

interface useEditableWrapperProps {
  block?: SlideBlock;
  onSettingsChange?: (settings: {
    fontFamily: string;
    fontSize: number;
  }) => void;
}

export const useEditableWrapper = ({
  block,
  onSettingsChange,
}: useEditableWrapperProps) => {
  const [hovered, setHovered] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [fontSize, setFontSize] = useState(16);

  const theme = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  const [tapped, setTapped] = useState(false);

  const openSettings = () => {
    setFontFamily((block?.style?.fontFamily || "Arial").split(",")[0].trim());
    setFontSize(block?.style?.fontSize || 16);
    setSettingsOpen(true);
  };

  const handleSettingsSave = () => {
    onSettingsChange?.({ fontFamily, fontSize });
    setSettingsOpen(false);
  };

  return {
    hovered,
    settingsOpen,
    setSettingsOpen,
    theme,
    openSettings,
    handleSettingsSave,
    setHovered,
    fontFamily,
    setFontFamily,
    fontSize,
    setFontSize,
    tapped,
    setTapped,
  };
};
