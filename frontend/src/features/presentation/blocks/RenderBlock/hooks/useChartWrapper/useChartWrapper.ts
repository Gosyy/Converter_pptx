import { useDispatch, useSelector } from "react-redux";
import {
  deleteBlock,
  pushHistory,
  updateBlock,
} from "../../../../../../app/store/slices/editorSlice";
import { AppDispatch, RootState } from "../../../../../../app/store";
import { SlideBlock } from "../../../../../../shared/types";

interface useChartWrapperProps {
  block: SlideBlock;
  id: string;
  slideId: string;
  editingBlock: SlideBlock;
  setEditingBlock: (val: any) => void;
}

export const useChartWrapper = ({
  block,
  id,
  slideId,
  editingBlock,
  setEditingBlock,
}: useChartWrapperProps) => {
  const dispatch = useDispatch<AppDispatch>();

  const theme = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  const isEditing = editingBlock?.id === id;

  const handleEdit = () => setEditingBlock({ type: "chart", id, slideId });

  const handleSave = (newChart: NonNullable<typeof block.chart>) => {
    const chartCopy = {
      ...newChart,
      labels: [...newChart.labels],
      values: [...newChart.values],
      colors: Array.isArray(newChart.colors)
        ? [...newChart.colors]
        : newChart.colors,
    };
    dispatch(
      updateBlock({ id: block.id, newBlock: { ...block, chart: chartCopy } })
    );
    dispatch(pushHistory());
    setEditingBlock(null);
  };

  const handleCancel = () => setEditingBlock(null);

  const handleDelete = () => {
    dispatch(deleteBlock({ slideId, blockId: block.id }));
  };

  const type = block.chart?.type;

  return {
    type,
    handleCancel,
    handleDelete,
    handleEdit,
    handleSave,
    isEditing,
    theme,
  };
};
