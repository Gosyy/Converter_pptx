import { useEffect, RefObject } from "react";
import { AppDispatch } from "../../../../app/store";
import { PlateSlide } from "../../../../shared/types";

export const useSlideScroll = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  slidesLength: number,
  currentIndex: number,
  dispatch: AppDispatch,
  currentSlide: PlateSlide
) => {
  useEffect(() => {
    if (!currentSlide) return;
    const el = document.getElementById(currentSlide.id);

    if (el) {
      const elementTop = el.getBoundingClientRect().top + window.scrollY;
      const scrollPosition =
        elementTop - (window.innerHeight / 2 - el.offsetHeight / 2);
      window.scrollTo({ top: scrollPosition - 20, behavior: "smooth" });
    }
  }, [currentSlide]);

  useEffect(() => {
    if (!containerRef.current) return;

    const handleWheel = (e: WheelEvent) => {
      if (
        !(e.target instanceof HTMLElement) ||
        !containerRef.current?.contains(e.target)
      )
        return;
      e.preventDefault();

      let newIndex = currentIndex;
      if (e.deltaY > 0) newIndex = Math.min(currentIndex + 1, slidesLength - 1);
      else if (e.deltaY < 0) newIndex = Math.max(currentIndex - 1, 0);

      if (newIndex !== currentIndex) {
        dispatch({ type: "editor/setCurrentIndex", payload: newIndex });
        const el = document.getElementById(`slide-${newIndex}`);
        if (el) {
          const elementTop = el.getBoundingClientRect().top + window.scrollY;
          const scrollPosition =
            elementTop - (window.innerHeight / 2 - el.offsetHeight / 2);
          window.scrollTo({ top: scrollPosition - 40, behavior: "smooth" });
        }
      }
    };

    const ref = containerRef.current;
    ref.addEventListener("wheel", handleWheel, { passive: false });
    return () => ref.removeEventListener("wheel", handleWheel);
  }, [containerRef, currentIndex, slidesLength, dispatch]);
};
