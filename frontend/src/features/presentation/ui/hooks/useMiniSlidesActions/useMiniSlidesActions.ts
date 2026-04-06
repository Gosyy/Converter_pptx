import { useEffect, useRef } from "react";
import { setMiniPreview } from "../../../../../app/store/slices/uiSlice";
import { RootState } from "../../../../../app/store";
import { useDispatch, useSelector } from "react-redux";
import { PlateSlide, Theme } from "../../../../../shared/types";
import {
  setCurrentIndex,
  updateBlock,
} from "../../../../../app/store/slices/editorSlice";

export const useMiniSlidesActions = (slides: PlateSlide[]) => {
  const dispatch = useDispatch();
  const { currentIndex, revision } = useSelector(
    (state: RootState) => state.editor
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(setMiniPreview(true));
    return () => {
      dispatch(setMiniPreview(false));
    };
  }, []);

  const theme: Theme | undefined = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const updateAllBlocks = () => {
      slides.forEach((slide) => {
        const slideEl = document.getElementById(`mini-${slide.id}`);
        if (!slideEl) {
          return;
        }

        slide.content.forEach((block) => {
          const blockEl = slideEl.querySelector(
            `[data-block-id="${block.id}"]`
          );
          if (!blockEl) return;

          const blockRect = blockEl.getBoundingClientRect();
          const slideRect = slideEl.getBoundingClientRect();

          const xPercent =
            ((blockRect.left - slideRect.left) / slideRect.width) * 100;
          const yPercent =
            ((blockRect.top - slideRect.top) / slideRect.height) * 100;
          const widthPercent = (blockRect.width / slideRect.width) * 100;
          const heightPercent = (blockRect.height / slideRect.height) * 100;

          if (
            block.xPercent !== xPercent ||
            block.yPercent !== yPercent ||
            block.widthPercent !== widthPercent ||
            block.heightPercent !== heightPercent
          ) {
            dispatch(
              updateBlock({
                id: block.id,
                newBlock: {
                  ...block,
                  xPercent,
                  yPercent,
                  widthPercent,
                  heightPercent,
                },
              })
            );
          }
        });
      });
    };

    updateAllBlocks();
  }, [dispatch, revision]);

  const handleSlideClick = (slideId: string, index: number) => {
    dispatch(setCurrentIndex(index));

    const element = document.getElementById(slideId);
    if (element) {
      const elementTop = element.getBoundingClientRect().top + window.scrollY;
      const elementHeight = element.offsetHeight;
      const windowHeight = window.innerHeight;

      const scrollPosition =
        elementTop - (windowHeight / 2 - elementHeight / 2);

      window.scrollTo({
        top: scrollPosition - 20,
        behavior: "smooth",
      });
    }
  };
  return {
    currentIndex,
    containerRef,
    handleSlideClick,
    revision,
    theme,
  };
};
