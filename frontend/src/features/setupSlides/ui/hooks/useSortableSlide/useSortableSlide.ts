import { useSortable } from "@dnd-kit/sortable";
import { PlateSlide, RichTextPart } from "../../../../../shared/types";
import { darken, useTheme } from "@mui/material";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../app/store";
import { useState } from "react";

interface useSortableSlideProps {
  slide: PlateSlide;
  onEditSlide: (
    slideId: string,
    blockId: string,
    textOrItems: string | string[],
    richParts?: RichTextPart[][]
  ) => void;
}

export const useSortableSlide = ({
  slide,
  onEditSlide,
}: useSortableSlideProps) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: slide.id });

  const { generating } = useSelector((state: RootState) => state.prompt);

  const theme = useTheme();

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    marginBottom: 16,
    padding: 16,
    backgroundColor: darken(theme.palette.background.default, 0.05),
    display: "flex",
    alignItems: "flex-start",
  };

  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);

  const handleStartEditing = (blockId: string) => {
    setEditingBlockId(blockId);
  };

  const handleStopEditing = () => {
    setEditingBlockId(null);
  };

  const handleEdit = (
    blockId: string,
    textOrItems: string | string[],
    richParts?: RichTextPart[][]
  ) => {
    if (generating) return;

    const newContent = slide.content.map((b) =>
      b.id === blockId
        ? {
            ...b,
            ...(Array.isArray(textOrItems)
              ? { items: textOrItems }
              : { text: textOrItems }),
            ...(richParts ? { richParts } : {}),
          }
        : b
    );

    onEditSlide(slide.id, blockId, textOrItems, richParts);
  };

  return {
    attributes,
    listeners,
    style,
    handleEdit,
    setNodeRef,
    editingBlockId,
    handleStartEditing,
    handleStopEditing,
  };
};
