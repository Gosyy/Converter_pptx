import { Editor } from "slate";

export type TextMark = "bold" | "italic" | "code";

export const isMarkActive = (editor: Editor, mark: TextMark) => {
  const marks = Editor.marks(editor) as Partial<
    Record<TextMark, boolean>
  > | null;
  return !!marks?.[mark];
};

export const toggleMark = (editor: Editor, mark: TextMark) => {
  const isActive = isMarkActive(editor, mark);

  if (isActive) {
    Editor.removeMark(editor, mark);
  } else {
    Editor.addMark(editor, mark, true);
  }
};
