import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../app/store";
import { PlateSlide, RichTextPart } from "../../../../../shared/types";
import { useEffect, useState } from "react";
import {
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import {
  reorderSlides,
  updateSlideContent,
} from "../../../../../app/store/slices/editorSlice";

export const useSlidesList = () => {
  const { generating } = useSelector((state: RootState) => state.prompt);
  const dispatch = useDispatch<AppDispatch>();
  const slides = useSelector(
    (state: RootState) => state.editor.slides
  ) as PlateSlide[];

  const [localSlides, setLocalSlides] = useState<PlateSlide[]>([]);

  useEffect(() => {
    setLocalSlides(slides);
  }, [slides]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    if (generating) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = localSlides.findIndex((s) => s.id === active.id);
      const newIndex = localSlides.findIndex((s) => s.id === over.id);

      const newSlides = arrayMove(localSlides, oldIndex, newIndex);
      setLocalSlides(newSlides);

      dispatch(reorderSlides({ oldIndex, newIndex }));
    }
  };

  const handleEditSlide = (
    slideId: string,
    blockId: string,
    textOrItems: string | string[],
    richParts?: RichTextPart[][]
  ) => {
    if (generating) return;

    setLocalSlides((prev) =>
      prev.map((s) => {
        if (s.id !== slideId) return s;

        const newContent = s.content.map((block) => {
          if (block.id !== blockId) return block;

          if (block.type === "list") {
            return {
              ...block,
              items: Array.isArray(textOrItems) ? textOrItems : [textOrItems],
              richParts,
            };
          } else {
            return {
              ...block,
              text:
                typeof textOrItems === "string"
                  ? textOrItems
                  : textOrItems.join(" "),
              richParts,
            };
          }
        });

        return { ...s, content: newContent };
      })
    );

    const slide = slides.find((s) => s.id === slideId);
    if (!slide) return;

    const newContent = slide.content.map((block) => {
      if (block.id !== blockId) return block;

      if (block.type === "list") {
        return {
          ...block,
          items: Array.isArray(textOrItems) ? textOrItems : [textOrItems],
          richParts,
        };
      } else {
        return {
          ...block,
          text:
            typeof textOrItems === "string"
              ? textOrItems
              : textOrItems.join(" "),
          richParts,
        };
      }
    });

    dispatch(updateSlideContent({ slideId, newContent }));
  };

  return {
    sensors,
    handleEditSlide,
    handleDragEnd,
    localSlides,
  };
};
