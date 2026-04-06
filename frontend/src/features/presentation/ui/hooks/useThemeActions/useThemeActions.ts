import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../app/store";
import { useState } from "react";
import {
  pushHistory,
  setCustomTheme,
  setGlobalTheme,
} from "../../../../../app/store/slices/editorSlice";

export const useThemeActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [open, setOpen] = useState(false);

  const [customColors, setCustomColors] = useState({
    background: "#ececec",
    heading: "#000000",
    paragraph: "#333333",
  });

  const handleThemeSelect = (themeId: string) => {
    dispatch(setGlobalTheme(themeId));
    dispatch(pushHistory());
    setOpen(false);
  };

  const handleColorChange = (key: keyof typeof customColors, color: any) => {
    setCustomColors((prev) => ({ ...prev, [key]: color.hex }));
  };

  const applyCustomTheme = () => {
    dispatch(
      setCustomTheme({
        background: customColors.background,
        heading: customColors.heading,
        paragraph: customColors.paragraph,
      })
    );
    dispatch(setGlobalTheme("custom"));
    dispatch(pushHistory());
    setOpen(false);
  };

  return {
    open,
    handleThemeSelect,
    handleColorChange,
    applyCustomTheme,
    setOpen,
    customColors,
  };
};
