import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../app/store";
import {
  pushHistory,
  updateSlideContent,
} from "../../../../../app/store/slices/editorSlice";
import { SlideBlock } from "../../../../../shared/types";
import { v4 as uuidv4 } from "uuid";

interface useBlockProps {
  slideId: string;
}

export const useBlockActions = ({ slideId }: useBlockProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const slide = useSelector((state: RootState) =>
    state.editor.slides.find((s) => s.id === slideId)
  );

  const theme = useSelector((state: RootState) =>
    state.editor.availableThemes.find(
      (t) => t.id === state.editor.globalThemeId
    )
  );
  if (!slide) {
    return {
      addBlock: () => {},
      setJustifyContent: () => {},
      setSlideAlignItems: () => {},
    };
  }

  const addBlock = (type: SlideBlock["type"]) => {
    let text: string | undefined;
    let items: string[] | undefined;

    switch (type) {
      case "heading":
        text = "Заголовок";
        break;
      case "paragraph":
        text = "Текст";
        break;
      case "code":
        text = "// Ваш код";
        break;
      case "quote":
        text = "Цитата";
        break;
      case "list":
        items = ["Элемент 1", "Элемент 2"];
        break;
      default:
        text = undefined;
    }

    const newBlock: SlideBlock = {
      id: uuidv4(),
      type,
      text,
      items,
      table:
        type === "table"
          ? {
              headers: ["Header 1", "Header 2"],
              rows: [
                ["", ""],
                ["", ""],
              ],
            }
          : undefined,
      chart:
        type === "chart"
          ? {
              type: "bar",
              labels: ["Label 1"],
              values: [0],
              colors: ["#4bc0c0"],
            }
          : undefined,
      style:
        type === "heading"
          ? { fontWeight: 700, fontSize: 28, color: theme?.colors.heading }
          : { fontWeight: 400, fontSize: 16, color: theme?.colors.paragraph },
      richParts:
        type === "list"
          ? items?.map((item) => [
              { text: item, bold: false, italic: false, code: false },
            ])
          : [[{ text: text || "", bold: false, italic: false, code: false }]],
    };

    dispatch(
      updateSlideContent({
        slideId: slide.id,
        newContent: [...slide.content, newBlock],
      })
    );
  };

  const setJustifyContent = (align: "flex-start" | "flex-end") => {
    if (!slide) return;
    const newContent = slide.content.map((b) => ({
      ...b,
      justifyContent: align,
    }));

    dispatch(
      updateSlideContent({
        slideId: slide.id,
        newContent,
      })
    );
    dispatch(pushHistory());
  };

  const setSlideAlignItems = (align: "flex-start" | "flex-end" | "center") => {
    if (!slide) return;
    dispatch(
      updateSlideContent({
        slideId: slide.id,
        newContent: slide.content,
        alignItems: align,
      })
    );
    dispatch(pushHistory());
  };

  return {
    addBlock,
    setJustifyContent,
    setSlideAlignItems,
  };
};
