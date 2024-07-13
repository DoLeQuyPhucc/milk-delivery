import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callApi } from "@/hooks/useAxios";

interface Brand {
  _id: string;
  name: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  productImage: string;
  brandID: Brand;
}

interface PackageDetail {
  _id: string;
  products: { product: Product; quantity: number }[];
  totalAmount: number;
  totalPrice: number;
}

interface PackageDetailState {
  package: PackageDetail | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: PackageDetailState = {
  package: null,
  status: "idle",
  error: null,
};

export const fetchPackageById = createAsyncThunk(
  "packageDetail/fetchPackageById",
  async (packageId: string) => {
    try {
      const data = await callApi("GET", `/api/packages/${packageId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }
);

const packageDetailSlice = createSlice({
  name: "packageDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackageById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPackageById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.package = action.payload;
      })
      .addCase(fetchPackageById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export default packageDetailSlice.reducer;
