import { useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { savePresentation } from "../../../entities";
import { exportToPptx } from "../../../features/presentation/lib/utils/exportToPptx";
import { themes } from "../../constants/themes";

export const useSavePresentation = () => {
  const slides = useSelector((state: RootState) => state.editor.slides);
  const currentIndex = useSelector((state: RootState) => state.editor.currentIndex);
  const useDatabase = useSelector((state: RootState) => state.ui.useDatabase);

  const saveLocally = async () => {
    const jsonBlob = new Blob([JSON.stringify(slides, null, 2)], {
      type: "application/json",
    });

    const jsonLink = document.createElement("a");
    jsonLink.href = URL.createObjectURL(jsonBlob);
    jsonLink.download = "presentation-local.json";
    jsonLink.click();
    URL.revokeObjectURL(jsonLink.href);

    const firstTheme = themes[0];
    exportToPptx(slides, firstTheme);
  };

  const save = async () => {
    if (!useDatabase) {
      await saveLocally();
      return { message: "saved_local" };
    }

    const currentSlide = slides[currentIndex];
    if (!currentSlide) return;

    return savePresentation({
      id: currentSlide.id,
      title: currentSlide.title,
      content: slides,
      theme: currentSlide.theme || null,
    });
  };

  return { save };
};
