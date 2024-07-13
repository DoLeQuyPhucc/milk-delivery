import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { callApi } from "@/hooks/useAxios";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  productImage: string;
  brandID: {
    name: string;
  };
}

interface ProductDetailState {
  product: Product | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: ProductDetailState = {
  product: null,
  status: "idle",
  error: null,
};

export const fetchProductById = createAsyncThunk(
  "productDetail/fetchProductById",
  async (productId: string) => {
    try {
      const data = await callApi("GET", `/api/products/${productId}`);
      return data;
    } catch (error) {
      throw error;
    }
  }
);

const productDetailSlice = createSlice({
  name: "productDetail",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.product = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message ?? null;
      });
  },
});

export default productDetailSlice.reducer;
