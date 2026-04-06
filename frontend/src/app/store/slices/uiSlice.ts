import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isMiniPreview: boolean;
  useDatabase: boolean;
}

const envAdminDefault =
  String(process.env.REACT_APP_ADMIN_USE_DATABASE || "false").toLowerCase() ===
  "true";
const cachedDbToggle = localStorage.getItem("admin_use_database");

const initialState: UIState = {
  isMiniPreview: false,
  useDatabase:
    cachedDbToggle === null
      ? envAdminDefault
      : cachedDbToggle.toLowerCase() === "true",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setMiniPreview(state, action: PayloadAction<boolean>) {
      state.isMiniPreview = action.payload;
    },
    setUseDatabase(state, action: PayloadAction<boolean>) {
      state.useDatabase = action.payload;
      localStorage.setItem("admin_use_database", String(action.payload));
    },
  },
});

export const { setMiniPreview, setUseDatabase } = uiSlice.actions;
export default uiSlice.reducer;
