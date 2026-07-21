import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../api/axios";

// Async thunks for authentication operations
export const loginUser = createAsyncThunk(
  "auth/login",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/login", { email, password });
      if (response.data.success) {
        // sendResponse spreads at top-level: { success, message, user, token }
        const token = response.data.token;
        const refreshToken = response.data.refreshToken;
        const user = response.data.user;
        if (token) localStorage.setItem("token", token);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        return { user, token, refreshToken };
      }
      return rejectWithValue(response.data.message || "Login failed");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid credentials"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async ({ name, email, password, phoneNumber }, { rejectWithValue }) => {
    try {
      const response = await api.post("/register", { name, email, password, phoneNumber });
      if (response.data.success) {
        return response.data.data;
      }
      return rejectWithValue(response.data.message || "Registration failed");
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to register"
      );
    }
  }
);

export const fetchProfile = createAsyncThunk(
  "auth/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      
      const response = await api.get("/me");
      if (response.data.success) {
        // sendResponse spreads data at top-level: { success, message, user }
        // NOT nested under .data.user — that was the logout-on-refresh bug
        return response.data.user ?? response.data.data?.user ?? null;
      }
      return null;
    } catch (error) {
      // Only remove token on confirmed 401 (unauthorized), not on network errors
      // This prevents logout on temporary connectivity issues or server restarts
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        return rejectWithValue("SESSION_EXPIRED");
      }
      // For network/500 errors keep the token — don't log out
      return rejectWithValue("NETWORK_ERROR");
    }
  }
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return null;
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  isAuthenticated: !!localStorage.getItem("token"),
  loading: true,
  error: null
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthCredentials: (state, action) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = !!user;
      state.loading = false;
      if (token) localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload?.user;
        state.token = action.payload?.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Profile
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.user = action.payload;
          state.isAuthenticated = true;
        } else {
          // null payload = no token in localStorage = not logged in
          state.user = null;
          state.isAuthenticated = false;
          state.token = null;
        }
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        if (action.payload === "SESSION_EXPIRED") {
          // Confirmed 401 — properly logged out
          state.user = null;
          state.token = null;
          state.isAuthenticated = false;
        }
        // NETWORK_ERROR or other — keep existing auth state, don't log out
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
      });
  }
});

export const { setAuthCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;
