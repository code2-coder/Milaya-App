import React, { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchProfile, setAuthCredentials, logoutUser as logoutThunk } from "../store/slices/authSlice.js";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  const loginUser = React.useCallback((userData, token, refreshToken) => {
    dispatch(setAuthCredentials({ user: userData, token, refreshToken }));
  }, [dispatch]);

  const logout = React.useCallback(async () => {
    try {
      await dispatch(logoutThunk()).unwrap();
    } catch (error) {
      console.error("Logout thunk failed", error);
    }
  }, [dispatch]);

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";
  const isStaffOrAdmin = isAdmin || isStaff;

  const setUser = React.useCallback((userData) => {
    const token = localStorage.getItem("token") || "";
    dispatch(setAuthCredentials({ user: userData, token }));
  }, [dispatch]);

  const contextValue = React.useMemo(() => ({
    user,
    setUser,
    loginUser,
    logout,
    isAdmin,
    isStaff,
    isStaffOrAdmin,
    loading
  }), [user, setUser, loginUser, logout, isAdmin, isStaff, isStaffOrAdmin, loading]);

  const hasToken = !!localStorage.getItem("token");

  // Show spinner only when validating an existing token — not on fresh visits
  if (loading && hasToken) {
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-800 rounded-full animate-spin" />
            <p className="text-sm text-stone-500 font-medium tracking-wide">Loading your session...</p>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
export default AuthContext;
