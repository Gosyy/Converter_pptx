import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../app/store";
import { SlideBlock } from "../../../../shared/types";
import { updateBlock } from "../../../../app/store/slices/editorSlice";

interface useSortableBlockProps {
  block: SlideBlock;
  slideId: string;
}

export const useSortableBlock = ({ block, slideId }: useSortableBlockProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const handleDragEnd = () => {
    const blockEl = document.getElementById(block.id);
    const slideEl = document.getElementById(slideId);
    if (!blockEl || !slideEl) return;

    const blockRect = blockEl.getBoundingClientRect();
    const slideRect = slideEl.getBoundingClientRect();

    const xPercent =
      ((blockRect.left - slideRect.left) / slideRect.width) * 100;
    const yPercent = ((blockRect.top - slideRect.top) / slideRect.height) * 100;

    dispatch(
      updateBlock({
        id: block.id,
        newBlock: {
          ...block,
          xPercent,
          yPercent,
        },
      })
    );
  };

  return {
    handleDragEnd,
  };
};
