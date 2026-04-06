import { createSlice, current, PayloadAction } from "@reduxjs/toolkit";
import { SlideBlock, PlateSlide, Theme } from "../../../shared/types";
import { themes } from "../../../shared/constants";

interface HistorySnapshot {
  slides: PlateSlide[];
  currentSlideIndex: number;
}

interface EditorState {
  slides: PlateSlide[];
  currentIndex: number;
  history: HistorySnapshot[];
  historyIndex: number;
  visitedSlides: string[];
  revision: number;
  availableThemes: Theme[];
  globalThemeId: string;
  customTheme: {
    background?: string;
    heading?: string;
    paragraph?: string;
  };
}

const initialState: EditorState = {
  slides: [],
  currentIndex: 0,
  history: [],
  historyIndex: -1,
  visitedSlides: [],
  revision: 0,
  availableThemes: themes,
  globalThemeId: "eclipse",
  customTheme: {
    background: undefined,
    heading: undefined,
    paragraph: undefined,
  },
};

const editorSlice = createSlice({
  name: "editor",
  initialState,
  reducers: {
    pushHistory(state) {
      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({
        slides: state.slides.map((slide) => ({
          ...slide,
          content: [...slide.content],
        })),
        currentSlideIndex: state.currentIndex,
      });
      state.historyIndex = state.history.length - 1;
      state.revision++;
    },

    undo(state) {
      if (state.historyIndex > 0) {
        state.historyIndex--;
        const snapshot = state.history[state.historyIndex];
        state.slides = JSON.parse(JSON.stringify(snapshot.slides));
        state.currentIndex = Math.min(
          snapshot.currentSlideIndex,
          state.slides.length - 1
        );
        state.revision++;
      }
    },

    redo(state) {
      if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const snapshot = state.history[state.historyIndex];
        state.slides = JSON.parse(JSON.stringify(snapshot.slides));
        state.currentIndex = Math.min(
          snapshot.currentSlideIndex,
          state.slides.length - 1
        );
        state.revision++;
      }
    },
    setSlides(state, action: PayloadAction<PlateSlide[]>) {
      const slides = action.payload;
      const theme = state.availableThemes.find(
        (t) => t.id === state.globalThemeId
      );
      if (!theme) {
        state.slides = slides;
        return;
      }

      state.slides = slides.map((slide) => ({
        ...slide,
        content: slide.content.map((block) => {
          const isHeading = block.type === "heading";
          return {
            ...block,
            style: {
              ...block.style,
              fontFamily: isHeading
                ? theme.fonts.heading
                : theme.fonts.paragraph,
              fontSize: isHeading ? 24 : 16,
              fontWeight: isHeading ? 700 : 400,
              color: isHeading ? theme.colors.heading : theme.colors.paragraph,
            },
          };
        }),
      }));
    },
    updateBlock(
      state,
      action: PayloadAction<{ id: string; newBlock: SlideBlock }>
    ) {
      const { id, newBlock } = action.payload;
      state.slides.forEach((slide) => {
        slide.content = slide.content.map((b) => (b.id === id ? newBlock : b));
      });

      console.log(
        "UPDATED BLOCK:",
        current(state)
          .slides.flatMap((s) => s.content)
          .find((b) => b.id === id)
      );
    },
    setCurrentIndex(state, action: PayloadAction<number>) {
      state.currentIndex = action.payload;

      const currentSlide = state.slides[state.currentIndex];
      if (!currentSlide) return;

      if (!state.visitedSlides.includes(currentSlide.id)) {
        state.visitedSlides.push(currentSlide.id);
      }
    },
    markSlideVisited(state, action: PayloadAction<number>) {
      const slide = state.slides[action.payload];
      if (!slide) return;

      if (!state.visitedSlides.includes(slide.id)) {
        state.visitedSlides.push(slide.id);
      }
    },
    resetVisitedSlides(state) {
      state.visitedSlides = [];
    },
    updateSlideContent(
      state,
      action: PayloadAction<{
        slideId: string;
        newContent: SlideBlock[];
        alignItems?: "flex-start" | "flex-end" | "center";
      }>
    ) {
      const { slideId, newContent, alignItems } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      slide.content = newContent;
      slide.alignItems = alignItems;
      state.revision++;
    },
    deleteBlock: (
      state,
      action: PayloadAction<{ slideId: string; blockId: string }>
    ) => {
      const { slideId, blockId } = action.payload;
      const slide = state.slides.find((s) => s.id === slideId);
      if (!slide) return;
      slide.content = slide.content.filter((b) => b.id !== blockId);
      state.revision++;
    },
    setGlobalTheme: (state, action: PayloadAction<string>) => {
      const themeId = action.payload;

      if (themeId === "custom" && state.customTheme) {
        state.slides.forEach((slide) => {
          slide.content = slide.content.map((block) => {
            const isHeading = block.type === "heading";
            return {
              ...block,
              style: {
                ...block.style,

                color: isHeading
                  ? state.customTheme.heading
                  : state.customTheme.paragraph,
                background: state.customTheme.background,
              },
            };
          });
        });
        state.globalThemeId = "custom";
      } else {
        const theme = state.availableThemes.find((t) => t.id === themeId);
        if (!theme) return;

        state.slides.forEach((slide) => {
          slide.content = slide.content.map((block) => {
            const isHeading = block.type === "heading";
            return {
              ...block,
              style: {
                ...block.style,
                fontFamily: isHeading
                  ? theme.fonts.heading
                  : theme.fonts.paragraph,
                fontSize: isHeading ? 24 : 16,
                fontWeight: isHeading ? 700 : 400,
                color: isHeading
                  ? theme.colors.heading
                  : theme.colors.paragraph,
              },
            };
          });
        });
        state.globalThemeId = themeId;
      }

      state.history = state.history.slice(0, state.historyIndex + 1);
      state.history.push({
        slides: JSON.parse(JSON.stringify(state.slides)),
        currentSlideIndex: state.currentIndex,
      });
      state.historyIndex = state.history.length - 1;
      state.revision++;
    },
    setCustomTheme: (
      state,
      action: PayloadAction<{
        background?: string;
        heading?: string;
        paragraph?: string;
      }>
    ) => {
      state.customTheme = { ...state.customTheme, ...action.payload };
    },
    reorderSlides(
      state,
      action: PayloadAction<{ oldIndex: number; newIndex: number }>
    ) {
      const { oldIndex, newIndex } = action.payload;
      const newSlides = Array.from(state.slides);
      const [moved] = newSlides.splice(oldIndex, 1);
      newSlides.splice(newIndex, 0, moved);
      state.slides = newSlides;
      state.revision++;
    },
  },
});

export const {
  setSlides,
  updateBlock,
  setCurrentIndex,
  updateSlideContent,
  deleteBlock,
  pushHistory,
  undo,
  redo,
  markSlideVisited,
  resetVisitedSlides,
  setGlobalTheme,
  setCustomTheme,
  reorderSlides,
} = editorSlice.actions;
export default editorSlice.reducer;
