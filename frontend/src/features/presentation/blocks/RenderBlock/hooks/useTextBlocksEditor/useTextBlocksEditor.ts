import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../../app/store";
import {
  deleteBlock,
  pushHistory,
  updateBlock,
} from "../../../../../../app/store/slices/editorSlice";
import { RichTextPart, SlideBlock } from "../../../../../../shared/types";

interface useTextBlocksEditorProps {
  block: SlideBlock;
  id: string;
  slideId: string;
  editingBlock: SlideBlock | null;
  editValue: RichTextPart[][];
  setEditValue: (val: RichTextPart[][]) => void;
  setEditingBlock: (val: SlideBlock | null) => void;
}

export const useTextBlocksEditor = ({
  editingBlock,
  block,
  editValue,
  setEditingBlock,
  setEditValue,
  id,
  slideId,
}: useTextBlocksEditorProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const isEditing = editingBlock?.id === id;

  const theme = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );

  const handleBlur = () => {
    debugger;

    if (!editValue || !Array.isArray(editValue)) return;

    const richParts: RichTextPart[][] = Array.isArray(editValue[0])
      ? (editValue as RichTextPart[][])
      : ([editValue] as unknown as RichTextPart[][]);

    const flatRichParts: RichTextPart[] =
      richParts.flat() as unknown as RichTextPart[];

    let text = "";

    if (block.type === "list" || block.type === "ordered-list") {
      const items = richParts.map((line) => line.map((p) => p.text).join(""));
      text = items.join("\n");

      dispatch(
        updateBlock({
          id: block.id,
          newBlock: { ...block, items, richParts },
        })
      );
    } else {
      text = flatRichParts.map((p) => p.text).join("");

      dispatch(
        updateBlock({
          id: block.id,
          newBlock: { ...block, text, richParts: [flatRichParts] },
        })
      );
    }

    dispatch(pushHistory());
    setEditingBlock(null);
  };

  const handleEdit = () => {
    setEditingBlock({ ...block, id, type: block.type });

    if (block.richParts?.length) {
      setEditValue(block.richParts);
    } else if (block.type === "list" || block.type === "ordered-list") {
      const items = block.items || [];
      setEditValue(
        items.map((item) => [
          {
            text: item,
            bold: false,
            italic: false,
            code: false,
          },
        ])
      );
    } else {
      setEditValue([
        [
          {
            text: block.text || "",
            bold: false,
            italic: false,
            code: false,
          },
        ],
      ]);
    }
  };

  const handleDelete = () => {
    dispatch(deleteBlock({ slideId, blockId: block.id }));
  };

  const handleSettingsChange = (settings: {
    fontFamily: string;
    fontSize: number;
  }) => {
    dispatch(
      updateBlock({
        id: block.id,
        newBlock: {
          ...block,
          style: {
            ...block.style,
            ...settings,
          },
        },
      })
    );
  };

  return {
    isEditing,
    handleBlur,
    handleDelete,
    handleEdit,
    handleSettingsChange,
    theme,
  };
};
