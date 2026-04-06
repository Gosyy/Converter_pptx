import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  userId: number | null;
  email: string | null;
  name: string | null;
  isVerified: boolean;
  isLoggedIn: boolean;
  isChecked: boolean;
  provider?: string;
  avatar?: string;
}

const initialState: AuthState = {
  userId: null,
  email: null,
  name: null,
  isVerified: false,
  isLoggedIn: false,
  isChecked: false,
  provider: undefined,
  avatar: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<AuthState>>) => {
      Object.assign(state, action.payload, {
        isLoggedIn: true,
        isChecked: true,
      });
    },
    logout: (state) => {
      Object.assign(state, { ...initialState, isChecked: true });
    },
    setChecked: (state, action: PayloadAction<Partial<AuthState>>) => {
      Object.assign(state, action.payload, { isChecked: true });
    },
    setCurrentUser: (state, action: PayloadAction<Partial<AuthState>>) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setUser, logout, setChecked, setCurrentUser } =
  authSlice.actions;
export default authSlice.reducer;
