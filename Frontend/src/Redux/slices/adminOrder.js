import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

const initialState = {
  orders: [],
  loading: false,
  error: null,
};

// Helper for admin auth config
const getAdminConfig = (getState) => {
  const { auth } = getState();
  const config = { headers: {} };
  if (auth && auth.userToken) {
    config.headers.Authorization = `Bearer ${auth.userToken}`;
  }
  return config;
};

// Async thunk: Fetch All Orders for Admin
export const fetchAllOrders = createAsyncThunk(
  'adminOrders/fetchAllOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      const response = await axios.get(`${BACKEND_URL}/api/admin/orders`, config);
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

// Async thunk: Update Order Status / Payment / Delivery
export const updateOrderStatus = createAsyncThunk(
  'adminOrders/updateOrderStatus',
  async ({ id, status, isPaid, isDelivered }, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      const response = await axios.put(
        `${BACKEND_URL}/api/admin/orders/${id}`,
        { status, isPaid, isDelivered },
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

// Async thunk: Bulk Update Orders
export const bulkUpdateOrders = createAsyncThunk(
  'adminOrders/bulkUpdateOrders',
  async ({ orderIds, status, isPaid, isDelivered }, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      const response = await axios.put(
        `${BACKEND_URL}/api/admin/orders/bulk`,
        { orderIds, status, isPaid, isDelivered },
        config
      );
      return response.data.orders;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Async thunk: Bulk Delete Orders
export const bulkDeleteOrders = createAsyncThunk(
  'adminOrders/bulkDeleteOrders',
  async (orderIds, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      await axios.post(
        `${BACKEND_URL}/api/admin/orders/bulk-delete`,
        { orderIds },
        config
      );
      return orderIds;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Async thunk: Delete Order
export const deleteOrder = createAsyncThunk(
  'adminOrders/deleteOrder',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const config = getAdminConfig(getState);
      await axios.delete(`${BACKEND_URL}/api/admin/orders/${orderId}`, config);
      return orderId;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const adminOrderSlice = createSlice({
  name: 'adminOrders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch All Orders
      .addCase(fetchAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map((order) =>
          order._id === action.payload._id ? action.payload : order
        );
      })

      // Bulk Update Orders
      .addCase(bulkUpdateOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
      })

      // Bulk Delete Orders
      .addCase(bulkDeleteOrders.fulfilled, (state, action) => {
        state.orders = state.orders.filter(
          (order) => !action.payload.includes(order._id)
        );
      })

      // Delete Order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.orders = state.orders.filter((order) => order._id !== action.payload);
      });
  },
});

export default adminOrderSlice.reducer;
