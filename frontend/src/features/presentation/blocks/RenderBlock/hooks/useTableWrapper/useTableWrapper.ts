import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../../app/store";
import { SlideBlock } from "../../../../../../shared/types";
import {
  deleteBlock,
  pushHistory,
  updateBlock,
} from "../../../../../../app/store/slices/editorSlice";

interface useTableWrapperProps {
  block: SlideBlock;
  id: string;
  slideId: string;
  editingBlock: SlideBlock;
  setEditingBlock: (val: any) => void;
}

export const useTableWrapper = ({
  editingBlock,
  block,
  setEditingBlock,
  id,
  slideId,
}: useTableWrapperProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEditing = editingBlock?.id === id;

  const theme = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  const handleEdit = () => setEditingBlock({ type: "table", id, slideId });

  const handleSave = (newTable: NonNullable<typeof block.table>) => {
    dispatch(
      updateBlock({ id: block.id, newBlock: { ...block, table: newTable } })
    );
    dispatch(pushHistory());
    setEditingBlock(null);
  };

  const handleCancel = () => setEditingBlock(null);

  const handleDelete = () => {
    dispatch(deleteBlock({ slideId, blockId: block.id }));
  };

  return {
    isEditing,
    handleCancel,
    handleEdit,
    handleDelete,
    handleSave,
    theme,
  };
};
