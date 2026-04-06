import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface StateProps {
  markdown: string;
}

const initialState: StateProps = {
  markdown:
    "# Привет\n\nЭто мой слайд\n\n## Второй слайд\n\nТекст второго слайда",
};

const markdownSlice = createSlice({
  name: "markdown",
  initialState,
  reducers: {
    setMarkdown: (state, action: PayloadAction<string>) => {
      state.markdown = action.payload;
    },
  },
});

export const { setMarkdown } = markdownSlice.actions;
export default markdownSlice.reducer;
