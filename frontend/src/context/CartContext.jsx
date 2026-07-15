import React, { createContext, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  addToCart as addToCartAction,
  removeFromCart as removeFromCartAction,
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
  selectCartItems,
  selectCartCount,
  selectCartTotal
} from "../redux/slices/cartSlice.js";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const dispatch = useDispatch();
  const cart = useSelector(selectCartItems);
  const cartCount = useSelector(selectCartCount);
  const cartTotal = useSelector(selectCartTotal);

  const addToCart = React.useCallback((product, quantity = 1, size = null, price = null) => {
    dispatch(addToCartAction({ product, quantity, size, price }));
  }, [dispatch]);

  const removeFromCart = React.useCallback((productId, size = null) => {
    dispatch(removeFromCartAction({ productId, size }));
  }, [dispatch]);

  const updateQuantity = React.useCallback((productId, size = null, quantity) => {
    dispatch(updateQuantityAction({ productId, size, quantity }));
  }, [dispatch]);

  const clearCart = React.useCallback(() => {
    dispatch(clearCartAction());
  }, [dispatch]);

  const contextValue = React.useMemo(() => ({
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount,
  }), [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount]);

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
export default CartContext;
