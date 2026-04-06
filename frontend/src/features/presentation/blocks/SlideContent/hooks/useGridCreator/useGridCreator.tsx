import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../../app/store";
import {
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { Cell } from "../../lib/types/Cell";
import { PlateSlide } from "../../../../../../shared/types";
import { arrayMove } from "@dnd-kit/sortable";
import { updateSlideContent } from "../../../../../../app/store/slices/editorSlice";

export const useGridCreator = (slide: PlateSlide) => {
  const dispatch = useDispatch<AppDispatch>();

  const imageBlocks = slide.content.filter((b) => b.type === "image");
  const firstImage = imageBlocks[0];
  const verticalBlocks = slide.content.filter((b) => b.id !== firstImage?.id);

  const getGridCells = (): Cell[] => {
    const cells: Cell[] = [
      { id: "cell-1", blocks: [] },
      { id: "cell-2", blocks: [] },
      { id: "cell-3", blocks: [] },
      { id: "cell-4", blocks: [] },
    ];

    slide.content.forEach((b, idx) => {
      const cellIndex = b.cellId
        ? cells.findIndex((c) => c.id === b.cellId)
        : idx % 4;
      cells[cellIndex].blocks.push({ ...b, cellId: cells[cellIndex].id });
    });

    return cells;
  };

  const handleVerticalDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = slide.content.findIndex((b) => b.id === active.id);
    const newIndex = slide.content.findIndex((b) => b.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const newContent = arrayMove([...slide.content], oldIndex, newIndex);

    dispatch(updateSlideContent({ slideId: slide.id, newContent }));
  };

  const handleGridDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const cells = getGridCells();

    const fromCell = cells.find((c) =>
      c.blocks.some((b) => b.id === active.id)
    );
    if (!fromCell) return;

    const fromIndex = fromCell.blocks.findIndex((b) => b.id === active.id);
    if (fromIndex === -1) return;

    if (fromCell.blocks.some((b) => b.id === over.id)) {
      const toIndex = fromCell.blocks.findIndex((b) => b.id === over.id);

      if (fromIndex === toIndex) return;

      const newBlocks = arrayMove(fromCell.blocks, fromIndex, toIndex);

      const newCells = cells.map((cell) =>
        cell.id === fromCell.id ? { ...cell, blocks: newBlocks } : cell
      );

      const newContent = newCells.flatMap((cell) =>
        cell.blocks.map((b) => ({ ...b, cellId: cell.id }))
      );

      dispatch(updateSlideContent({ slideId: slide.id, newContent }));
      return;
    }

    const toCell =
      cells.find((c) => c.id === over.id) ||
      cells.find((c) => c.blocks.some((b) => b.id === over.id));
    if (!toCell) return;

    const draggedBlock = fromCell.blocks[fromIndex];

    const newCells = cells.map((cell) => {
      if (cell.id === fromCell.id) {
        return {
          ...cell,
          blocks: cell.blocks.filter((b) => b.id !== active.id),
        };
      }
      if (cell.id === toCell.id) {
        const overIndex = cell.blocks.findIndex((b) => b.id === over.id);
        const insertIndex = overIndex >= 0 ? overIndex : cell.blocks.length;
        const newBlocks = [...cell.blocks];
        newBlocks.splice(insertIndex, 0, draggedBlock);
        return { ...cell, blocks: newBlocks };
      }
      return cell;
    });

    const newContent = newCells.flatMap((cell) =>
      cell.blocks.map((b) => ({ ...b, cellId: cell.id }))
    );

    dispatch(updateSlideContent({ slideId: slide.id, newContent }));
  };

  return {
    verticalBlocks,
    firstImage,
    getGridCells,
    handleVerticalDragEnd,
    handleGridDragEnd,
  };
};
