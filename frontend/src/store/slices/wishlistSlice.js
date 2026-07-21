import { createSlice } from "@reduxjs/toolkit";

const getStoredWishlist = () => {
  try {
    const stored = localStorage.getItem("milaya_wishlist");
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to parse wishlist:", error);
    return [];
  }
};

const persistWishlist = (items) => {
  try {
    localStorage.setItem("milaya_wishlist", JSON.stringify(items));
  } catch (error) {
    console.error("Failed to persist wishlist:", error);
  }
};

const initialState = {
  items: getStoredWishlist()
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const pId = product._id || product.id;
      const exists = state.items.some((item) => (item._id || item.id) === pId);

      if (exists) {
        state.items = state.items.filter((item) => (item._id || item.id) !== pId);
      } else {
        state.items.push(product);
      }
      persistWishlist(state.items);
    },
    removeFromWishlist: (state, action) => {
      const pId = action.payload;
      state.items = state.items.filter((item) => (item._id || item.id) !== pId);
      persistWishlist(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      persistWishlist(state.items);
    }
  }
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsInWishlist = (state, productId) =>
  state.wishlist.items.some((item) => (item._id || item.id) === productId);

export default wishlistSlice.reducer;
