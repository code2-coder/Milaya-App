import React, { createContext, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleWishlist as toggleWishlistAction,
  removeFromWishlist as removeFromWishlistAction,
  clearWishlist as clearWishlistAction,
  selectWishlistItems
} from "../store/slices/wishlistSlice.js";

const WishlistContext = createContext(undefined);

export function WishlistProvider({ children }) {
  const dispatch = useDispatch();
  const wishlist = useSelector(selectWishlistItems);

  const toggleWishlist = React.useCallback((product) => {
    dispatch(toggleWishlistAction(product));
  }, [dispatch]);

  const removeFromWishlist = React.useCallback((productId) => {
    dispatch(removeFromWishlistAction(productId));
  }, [dispatch]);

  const clearWishlist = React.useCallback(() => {
    dispatch(clearWishlistAction());
  }, [dispatch]);

  const isInWishlist = React.useCallback((productId) => {
    const pId = productId?._id || productId?.id || productId;
    return wishlist.some((item) => (item._id || item.id) === pId);
  }, [wishlist]);

  const contextValue = React.useMemo(() => ({
    wishlist,
    wishlistCount: wishlist?.length || 0,
    toggleWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist
  }), [wishlist, toggleWishlist, removeFromWishlist, clearWishlist, isInWishlist]);

  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
export default WishlistContext;
