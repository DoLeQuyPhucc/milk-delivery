// src/redux/slices/packageSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callApi } from "@/hooks/useAxios";

// Fetch all packages
export const fetchPackages = createAsyncThunk(
  "packages/fetchPackages",
  async (_, { rejectWithValue }) => {
    try {
      const data = await callApi("GET", "/api/packages/getAllPackages");
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Fetch packages by brand
export const fetchPackagesByBrandId = createAsyncThunk(
  "packages/fetchPackagesByBrandId",
  async (brandID: string, { rejectWithValue }) => {
    try {
      const data = await callApi(
        "GET",
        `/api/packages/getPackagesByBrandId/${brandID}`
      );
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const packageSlice = createSlice({
  name: "packages",
  initialState: {
    packages: [] as any[],
    status: "idle" as "idle" | "loading" | "succeeded" | "failed",
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        console.log("Fetching all packages: pending");
        state.status = "loading";
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        console.log("Fetching all packages: succeeded");
        state.status = "succeeded";
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        console.log("Fetching all packages: failed", action.payload);
        state.status = "failed";
        state.error = action.payload as string;
      })
      .addCase(fetchPackagesByBrandId.pending, (state) => {
        console.log("Fetching packages by brand: pending");
        state.status = "loading";
      })
      .addCase(fetchPackagesByBrandId.fulfilled, (state, action) => {
        console.log("Fetching packages by brand: succeeded");
        state.status = "succeeded";
        state.packages = action.payload;
      })
      .addCase(fetchPackagesByBrandId.rejected, (state, action) => {
        console.log("Fetching packages by brand: failed", action.payload);
        state.status = "failed";
        state.error = action.payload as string;
      });
  },
});

export default packageSlice.reducer;
