import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../../app/store";
import { useRef, useState } from "react";
import { Theme } from "../../../../../../shared/types";
import {
  pushHistory,
  updateBlock,
} from "../../../../../../app/store/slices/editorSlice";
import { useMediaQuery, useTheme } from "@mui/material";

export const useEditableImage = ({
  slideId,
  blockId,
}: {
  slideId: string;
  blockId: string;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const block = useSelector((state: RootState) => {
    const slide = state.editor.slides.find((s) => s.id === slideId);
    return slide?.content.find((b) => b.id === blockId);
  });

  const slide = useSelector((state: RootState) =>
    state.editor.slides.find((s) => s.id === slideId)
  );

  const [hover, setHover] = useState(false);
  const [open, setOpen] = useState(false);
  const [tempUrl, setTempUrl] = useState(block?.url);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const theme: Theme | undefined = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [tapped, setTapped] = useState(false);

  const showIcons = (!isMobile && hover) || (isMobile && tapped);

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    setTapped((prev) => !prev);
  };

  if (!block) {
    return {
      slide: undefined,
      hover: false,
      setHover: () => {},
      block: undefined,
      theme: undefined,
      setOpen: () => {},
      open: false,
      tempUrl: undefined,
      setTempUrl: () => {},
      setDragOver: () => {},
      handleDrop: () => {},
      handleFileChange: () => {},
      handleSave: () => {},
      fileInputRef,
      dragOver: false,
    };
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setTempUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") setTempUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    dispatch(
      updateBlock({ id: block.id, newBlock: { ...block, url: tempUrl } })
    );
    dispatch(pushHistory());
    setOpen(false);
  };

  return {
    slide,
    hover,
    setHover,
    block,
    theme,
    setOpen,
    open,
    tempUrl,
    setTempUrl,
    setDragOver,
    handleDrop,
    handleFileChange,
    handleSave,
    fileInputRef,
    dragOver,
    tapped,
    setTapped,
    isMobile,
    handleTap,
  };
};
