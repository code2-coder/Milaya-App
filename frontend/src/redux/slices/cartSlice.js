import { createSlice } from "@reduxjs/toolkit";

const getStoredCart = () => {
  try {
    const storedCart = localStorage.getItem("milaya_cart");
    return storedCart ? JSON.parse(storedCart) : [];
  } catch (error) {
    console.error("Failed to parse stored cart:", error);
    return [];
  }
};

const persistCart = (cart) => {
  try {
    localStorage.setItem("milaya_cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to persist cart:", error);
  }
};

const initialState = {
  cartItems: getStoredCart()
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, size = null, price = null } = action.payload;
      const pId = product._id || product.id;
      const itemPrice = price !== null ? price : product.price;

      const existingItem = state.cartItems.find(
        (item) => (item.product._id || item.product.id) === pId && item.size === size
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        state.cartItems.push({ product, quantity, size, price: itemPrice });
      }
      persistCart(state.cartItems);
    },
    removeFromCart: (state, action) => {
      const { productId, size = null } = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => !((item.product._id || item.product.id) === productId && item.size === size)
      );
      persistCart(state.cartItems);
    },
    updateQuantity: (state, action) => {
      const { productId, size = null, quantity } = action.payload;
      const existingItem = state.cartItems.find(
        (item) => (item.product._id || item.product.id) === productId && item.size === size
      );

      if (existingItem) {
        if (quantity <= 0) {
          state.cartItems = state.cartItems.filter(
            (item) => !((item.product._id || item.product.id) === productId && item.size === size)
          );
        } else {
          existingItem.quantity = quantity;
        }
      }
      persistCart(state.cartItems);
    },
    clearCart: (state) => {
      state.cartItems = [];
      persistCart(state.cartItems);
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

// Selectors for calculated state
export const selectCartItems = (state) => state.cart.cartItems;
export const selectCartCount = (state) =>
  state.cart.cartItems.reduce((count, item) => count + item.quantity, 0);
export const selectCartTotal = (state) =>
  state.cart.cartItems.reduce(
    (total, item) => total + (item.price !== undefined ? item.price : item.product.price) * item.quantity,
    0
  );

export default cartSlice.reducer;
