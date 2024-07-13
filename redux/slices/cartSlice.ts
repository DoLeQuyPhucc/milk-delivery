import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import Toast from "react-native-toast-message";
import { RootState } from "@/redux/store/store";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  productImage?: string;
}

interface CartState {
  userID: string;
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

const getInitialCartState = (userID: string): CartState => {
  const cookieCart = Cookies.get(`cart_${userID}`);
  if (cookieCart) {
    return JSON.parse(cookieCart);
  }
  return {
    userID,
    items: [],
    totalQuantity: 0,
    totalPrice: 0,
  };
};

const saveCartToCookies = (state: CartState) => {
  Cookies.set(`cart_${state.userID}`, JSON.stringify(state), {
    expires: 99999999999,
  });
};

const initialState: CartState = {
  userID: "",
  items: [],
  totalQuantity: 0,
  totalPrice: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setUserID(state, action: PayloadAction<string>) {
      state.userID = action.payload;
      const initialState = getInitialCartState(state.userID);
      state.items = initialState.items;
      state.totalQuantity = initialState.totalQuantity;
      state.totalPrice = initialState.totalPrice;
    },
    addToCart(state, action: PayloadAction<CartItem>) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        state.items.push({ ...newItem, quantity: newItem.quantity });
      }
      state.totalQuantity += newItem.quantity;
      state.totalPrice = state.items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      saveCartToCookies(state);
      Toast.show({
        type: "success",
        text1: `Thêm ${newItem.name} thành công`,
      });
    },
    removeFromCart(state, action: PayloadAction<string>) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        state.items = state.items.filter((item) => item.id !== id);
        state.totalQuantity -= existingItem.quantity;
        state.totalPrice = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        saveCartToCookies(state);
      }
    },
    updateCartQuantity(
      state,
      action: PayloadAction<{ id: string; quantity: number }>
    ) {
      const { id, quantity } = action.payload;
      const existingItem = state.items.find((item) => item.id === id);
      if (existingItem) {
        state.totalQuantity += quantity - existingItem.quantity;
        state.totalPrice = state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
        existingItem.quantity = quantity;
        saveCartToCookies(state);
      }
    },
    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalPrice = 0;
      Cookies.remove(`cart_${state.userID}`);
    },
  },
});

export const {
  setUserID,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
