// redux/slices/addressSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Address {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface AddressState {
  selectedAddress: Address | null;
}

const initialState: AddressState = {
  selectedAddress: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    setSelectedAddress(state, action: PayloadAction<Address>) {
      state.selectedAddress = action.payload;
    },
    clearSelectedAddress(state) {
      state.selectedAddress = null;
    },
  },
});

export const { setSelectedAddress, clearSelectedAddress } =
  addressSlice.actions;

export default addressSlice.reducer;
