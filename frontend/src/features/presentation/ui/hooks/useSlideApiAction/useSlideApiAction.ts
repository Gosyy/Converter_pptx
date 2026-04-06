import { useDispatch } from "react-redux";
import { AppDispatch } from "../../../../../app/store";
import { updateSlideContent } from "../../../../../app/store/slices/editorSlice";
import { markdownToSlides } from "../../../../../shared/utils/markdownToSlides";
import { useState } from "react";
import { PlateSlide } from "../../../../../shared/types";
import { editSlide } from "../../../../../entities";

export const useSlideApiAction = (currentSlide: PlateSlide) => {
  const dispatch = useDispatch<AppDispatch>();
  const [editing, setEditing] = useState(false);
  const [textValue, setTextValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBtn, setSelectedBtn] = useState<string | null>(null);

  const handleSave = async (currentSlide: PlateSlide) => {
    setLoading(true);
    try {
      const markdownString = await editSlide({
        slide: {
          slide_id: currentSlide.id,
          title: currentSlide.title || "",
          content: currentSlide.content || "",
        },
        text: textValue,
      });

      const parsedSlides = markdownToSlides(markdownString);
      const updatedBlocks = parsedSlides[0]?.content || [];

      dispatch(
        updateSlideContent({
          slideId: currentSlide.id,
          newContent: updatedBlocks,
        })
      );

      setEditing(false);
    } catch (err) {
      setError("Ошибка отправки запроса");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (attribute: string) => {
    setSelectedBtn(attribute);
    setTextValue(attribute);
  };
  return {
    loading,
    handleSave,
    handleChange,
    editing,
    error,
    selectedBtn,
    setSelectedBtn,
    textValue,
    setTextValue,
    setEditing,
    setError,
  };
};
