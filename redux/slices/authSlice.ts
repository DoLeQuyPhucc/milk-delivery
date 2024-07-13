import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callApi } from "@/hooks/useAxios";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: { userName: string; password: string }) => {
    try {
      const data = await callApi("POST", "/api/auth/signin", credentials);
      return data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || "Login failed");
      }
      throw error;
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null as any | null,
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export default authSlice.reducer;
