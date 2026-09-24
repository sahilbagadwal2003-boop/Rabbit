import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

const initialState = {
  products: [],
  users: [],
  stats: {
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    recentOrders: [],
  },
  loading: false,
  error: null,
};

// Helper for admin auth headers
const getAdminConfig = (getState) => {
  const { auth } = getState();
  return {
    headers: {
      Authorization: `Bearer ${auth.userToken}`,
    },
  };
};

// Async thunk: Fetch Dashboard Stats
export const fetchAdminStats = createAsyncThunk(
  'admin/fetchAdminStats',
  async (_, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      const response = await axios.get(`${BACKEND_URL}/api/admin/stats`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Async thunk: Fetch All Products for Admin
export const fetchAdminProducts = createAsyncThunk(
  'admin/fetchAdminProducts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Async thunk: Create Product
export const createProduct = createAsyncThunk(
  'admin/createProduct',
  async (productData, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      const response = await axios.post(
        `${BACKEND_URL}/api/products`,
        productData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Async thunk: Update Product
export const updateProduct = createAsyncThunk(
  'admin/updateProduct',
  async ({ id, productData }, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      const response = await axios.put(
        `${BACKEND_URL}/api/products/${id}`,
        productData,
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Async thunk: Delete Product
export const deleteProduct = createAsyncThunk(
  'admin/deleteProduct',
  async (productId, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      await axios.delete(`${BACKEND_URL}/api/products/${productId}`, config);
      return productId;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Async thunk: Fetch Admin Users
export const fetchAdminUsers = createAsyncThunk(
  'admin/fetchAdminUsers',
  async (_, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      const response = await axios.get(`${BACKEND_URL}/api/admin/users`, config);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Async thunk: Update User Role
export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ id, role, name, email }, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      const response = await axios.put(
        `${BACKEND_URL}/api/admin/users/${id}`,
        { role, name, email },
        config
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Async thunk: Delete User
export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (userId, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      await axios.delete(`${BACKEND_URL}/api/admin/users/${userId}`, config);
      return userId;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const AdminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Products
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.products = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.products = state.products.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p._id !== action.payload);
      })

      // Users
      .addCase(fetchAdminUsers.fulfilled, (state, action) => {
        state.users = action.payload;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u
        );
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      });
  },
});

export default AdminSlice.reducer;
