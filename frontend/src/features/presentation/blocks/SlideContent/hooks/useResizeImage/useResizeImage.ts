import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../../app/store";
import { useState, useRef, useCallback } from "react";
import {
  pushHistory,
  updateBlock,
} from "../../../../../../app/store/slices/editorSlice";

interface useResizeImageProps {
  slideId: string;
  blockId: string;
  horizontal?: boolean;
  inverted?: boolean;
}

export const useResizeImage = ({
  slideId,
  blockId,
  horizontal,
  inverted,
}: useResizeImageProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const block = useSelector((state: RootState) => {
    const slide = state.editor.slides.find((s) => s.id === slideId);
    return slide?.content.find((b) => b.id === blockId);
  });

  const theme = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  const [dragging, setDragging] = useState(false);
  const [tempSize, setTempSize] = useState<number | null>(null);
  const tempSizeRef = useRef<number | null>(null);

  const startResize = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (!block) return;
      e.preventDefault();
      setDragging(true);

      const startPos =
        "touches" in e
          ? horizontal
            ? e.touches[0].clientX
            : e.touches[0].clientY
          : horizontal
          ? e.clientX
          : e.clientY;
      const startSize = horizontal
        ? block.widthPercent ?? 45
        : block.heightPercent ?? 20;
      const sensitivity = horizontal ? 0.0907 : 0.161;

      console.log("horizontal:", horizontal, "inverted:", inverted, "startPos:", startPos);

      const onMove = (moveEvent: MouseEvent | TouchEvent) => {
        const currentPos =
          "touches" in moveEvent
            ? horizontal
              ? moveEvent.touches[0].clientX
              : moveEvent.touches[0].clientY
            : horizontal
            ? (moveEvent as MouseEvent).clientX
            : (moveEvent as MouseEvent).clientY;

        let delta = currentPos - startPos;
        if (inverted) delta = -delta;

        const newSize = Math.min(
          Math.max(startSize + delta * sensitivity, 10),
          90
        );

        tempSizeRef.current = newSize;
        setTempSize(newSize);
        console.log("delta", delta, "newSize", newSize);
      };

      const onEnd = () => {
        setDragging(false);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onEnd);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend", onEnd);

        const finalSize = tempSizeRef.current ?? startSize;

        dispatch(
          updateBlock({
            id: block.id,
            newBlock: horizontal
              ? { ...block, widthPercent: finalSize }
              : { ...block, heightPercent: finalSize },
          })
        );
        dispatch(pushHistory());
        setTempSize(null);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchmove", onMove, { passive: false });
      window.addEventListener("touchend", onEnd);
    },
    [block, horizontal, inverted, dispatch]
  );

  if (!block) {
    return {
      sizeValue: 0,
      sliderStyle: { top: 0, left: 0, width: 0, height: 0 },
      startResize,
      block: undefined,
      theme,
      dragging: false,
    };
  }

  const sizeValue =
    tempSize ??
    (horizontal ? block.widthPercent ?? 45 : block.heightPercent ?? 20);

  const sliderStyle = horizontal
    ? inverted
      ? { top: 0, left: 0, width: 6, height: "100%" }
      : { top: 0, right: 0, width: 6, height: "100%" }
    : inverted
    ? { top: 0, left: 0, width: "100%", height: 6 }
    : { bottom: 0, left: 0, width: "100%", height: 6 };

  return {
    sizeValue,
    sliderStyle,
    startResize,
    block,
    theme,
    dragging,
  };
};
