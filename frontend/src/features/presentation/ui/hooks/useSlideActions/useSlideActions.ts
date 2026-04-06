import { PlateSlide } from "../../../../../shared/types";
import { useEffect, useState } from "react";
import {
  markSlideVisited,
  pushHistory,
  resetVisitedSlides,
  setCurrentIndex,
  setSlides,
} from "../../../../../app/store/slices/editorSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../../../app/store";
import { createSlide } from "../../lib";

import { v4 as uuidv4 } from "uuid";

export const useSlideActions = () => {
  const [selectedLayout, setSelectedLayout] =
    useState<PlateSlide["layout"]>("text-only");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [slideEditing, setSlideEditing] = useState(false);

  const dispatch = useDispatch<AppDispatch>();
  const slides = useSelector((state: RootState) => state.editor.slides);

  const currentIndex = useSelector(
    (state: RootState) => state.editor.currentIndex
  );

  const visitedSlides = useSelector(
    (state: RootState) => state.editor.visitedSlides
  );

  const visitedAll = visitedSlides.length === slides.length;

  const historyIndex = useSelector(
    (state: RootState) => state.editor.historyIndex
  );
  const historyLength = useSelector(
    (state: RootState) => state.editor.history.length
  );

  useEffect(() => {
    const currentSlide = slides[currentIndex];
    if (currentSlide && !visitedSlides.includes(currentSlide.id)) {
      dispatch(markSlideVisited(currentIndex));
    }
  }, [currentIndex, slides, visitedSlides, dispatch]);

  useEffect(() => {
    if (slides.length && historyIndex === -1) {
      dispatch(pushHistory());
    }
  }, [slides, historyIndex, dispatch]);

  const handleAddSlide = () => {
    const newSlide = createSlide(selectedLayout!);

    console.log("Блоки нового слайда:", newSlide.content);

    const updatedSlides = [...slides, newSlide];
    dispatch(setSlides(updatedSlides));
    dispatch(setCurrentIndex(updatedSlides.length - 1));
    setAddDialogOpen(false);
  };

  const handleDeleteSlide = () => {
    if (!slides[currentIndex]) return;

    const deletedSlideId = slides[currentIndex].id;

    const newSlides = slides.filter((_, i) => i !== currentIndex);

    const newVisitedSlides = visitedSlides.filter(
      (id) => id !== deletedSlideId
    );

    dispatch(setSlides(newSlides));
    dispatch(setCurrentIndex(Math.max(currentIndex - 1, 0)));
    dispatch(resetVisitedSlides());
    newVisitedSlides.forEach((id, index) => {
      const slideIndex = newSlides.findIndex((s) => s.id === id);
      if (slideIndex !== -1) dispatch(markSlideVisited(slideIndex));
    });
    dispatch(pushHistory());
  };

  const handleAddNext = () => {
    const newSlide = createSlide(selectedLayout!);

    const updatedSlides = [
      ...slides.slice(0, currentIndex + 1),
      newSlide,
      ...slides.slice(currentIndex + 1),
    ];

    dispatch(setSlides(updatedSlides));
    dispatch(setCurrentIndex(currentIndex + 1));
    setAddDialogOpen(false);
  };

  const handleUpdateSlideLayout = (layout: PlateSlide["layout"]) => {
    if (!slides[currentIndex]) return;

    const currentSlide = slides[currentIndex];

    let updatedContent = [...currentSlide.content];

    if (
      layout &&
      ["left-image", "right-image", "top-image", "bottom-image"].includes(
        layout
      ) &&
      !updatedContent.some((block) => block.type === "image")
    ) {
      let imgCoords = {
        xPercent: 0,
        yPercent: 0,
        widthPercent: 50,
        heightPercent: 50,
      };

      switch (layout) {
        case "left-image":
          imgCoords = {
            xPercent: 0,
            yPercent: 0,
            widthPercent: 50,
            heightPercent: 100,
          };
          break;
        case "right-image":
          imgCoords = {
            xPercent: 50,
            yPercent: 0,
            widthPercent: 50,
            heightPercent: 100,
          };
          break;
        case "top-image":
          imgCoords = {
            xPercent: 0,
            yPercent: 0,
            widthPercent: 100,
            heightPercent: 25,
          };
          break;
        case "bottom-image":
          imgCoords = {
            xPercent: 0,
            yPercent: 75,
            widthPercent: 100,
            heightPercent: 25,
          };
          break;
      }

      updatedContent = [
        {
          id: uuidv4(),
          type: "image",
          url: "https://via.placeholder.com/400x300?text=Image",
          ...imgCoords,
        },
        ...updatedContent,
      ];
    }

    const updatedSlides = slides.map((slide, index) =>
      index === currentIndex
        ? { ...slide, layout, content: updatedContent }
        : slide
    );

    dispatch(setSlides(updatedSlides));
    setSelectedLayout(layout);
    setSlideEditing(false);
  };
  return {
    handleAddSlide,
    handleDeleteSlide,
    setSelectedLayout,
    setAddDialogOpen,
    handleAddNext,
    handleUpdateSlideLayout,
    addDialogOpen,
    slides,
    currentIndex,
    visitedSlides,
    visitedAll,
    historyIndex,
    historyLength,
    selectedLayout,

    setSlideEditing,
    slideEditing,
  };
};
