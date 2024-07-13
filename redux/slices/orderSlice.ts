import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { RootState } from "@/redux/store/store";
import { callApi } from "@/hooks/useAxios";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  productImage: string;
}

interface Package {
  _id: string;
  products: { product: Product; quantity: number }[];
  totalPrice: number;
}

interface Tracking {
  _id: string;
  trackingNumber: string;
  isDelivered: boolean;
  deliveredAt: string;
  status: string;
  isPaid: boolean;
}

interface CircleShipment {
  tracking: Tracking[];
  numberOfShipment: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface Order {
  _id: string;
  package: Package;
  shippingAddress: ShippingAddress;
  circleShipment: CircleShipment;
  paymentMethod: string;
  user: string;
  isPaid: boolean;
  paidAt: string | null;
  deliveredAt: string;
  status: string;
  __v: number;
}

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  loading: false,
  error: null,
};

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (userId: string) => {
    try {
      const data = await callApi("GET", `/api/orders/user/${userId}`);
      console.log("API response data:", data); // Log dữ liệu trả về từ API
      return data as Order[];
    } catch (error) {
      console.log("API error:", error); // Log lỗi trả về từ API
      throw error;
    }
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        if (action.error.message === "Request failed with status code 404") {
          state.error = "No orders found for this user";
        } else {
          state.error = action.error.message ?? "Failed to fetch orders";
        }
      });
  },
});

export const selectOrders = (state: RootState) => state.orders.orders;
export const selectOrdersLoading = (state: RootState) => state.orders.loading;
export const selectOrdersError = (state: RootState) => state.orders.error;

export const makeSelectOrdersByStatus = (status: string) =>
  createSelector([selectOrders], (orders) =>
    orders.filter((order) => order.status === status)
  );

export default ordersSlice.reducer;
