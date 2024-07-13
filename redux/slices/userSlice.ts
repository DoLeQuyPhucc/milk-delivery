import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  _id: string;
  firstName: string;
  lastName: string;
  userName: string;
  avartaImage: string;
  email: string;
  phoneNumber: string;
  role: string;
  address: string;
}

const initialState: UserState = {
  _id: "",
  firstName: "",
  lastName: "",
  userName: "",
  avartaImage: "",
  email: "",
  phoneNumber: "",
  role: "",
  address: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState>) => {
      return { ...state, ...action.payload };
    },
    clearUser: () => initialState,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
