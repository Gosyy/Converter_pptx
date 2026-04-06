import { useEffect, useState } from "react";
import { RichTextPart, SlideBlock } from "../../../../../../shared/types";

interface useRenderBlockProps {
  block: SlideBlock;
  onEdit: (
    id: string,
    textOrItems: string | string[],
    richParts?: RichTextPart[][]
  ) => void;
  stopEditing: () => void;
}

let activeEditingId: string | null = null;

export const useRenderBlock = ({
  block,
  onEdit,
  stopEditing,
}: useRenderBlockProps) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(block.text || "");

  useEffect(() => {
    if (block.richParts && block.richParts.length > 0) {
      if (block.type === "list") {
        setValue(
          block.richParts
            .map((line) => line.map((p) => p.text).join(""))
            .join("\n")
        );
      } else {
        setValue(block.richParts[0].map((p) => p.text).join(""));
      }
    } else if (
      (block.type === "list" || block.type === "table") &&
      block.items
    ) {
      setValue(block.items.join("\n"));
    } else {
      setValue(block.text || "");
    }
  }, [block]);

  const handleBlur = () => {
    stopEditing();
    setEditing(false);

    const richParts: RichTextPart[][] =
      block.richParts && block.richParts.length > 0
        ? block.richParts
        : ((block.type === "list" || block.type === "table"
            ? value.split("\n").map((line) => [{ text: line }])
            : [[{ text: value }]]) as RichTextPart[][]);

    if (block.type === "list" || block.type === "table") {
      const lines = value.split("\n").map((v) => v.trim());
      onEdit(block.id, lines, richParts);
    } else {
      onEdit(block.id, value, richParts);
    }
  };

  return {
    editing,
    setEditing,
    handleBlur,
    value,
    setValue,
  };
};
