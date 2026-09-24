import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

const initialState = {
  products: [],
  selectedProduct: null,
  similarProducts: [],
  loading: false,
  error: null,
  filters: {
    category: '',
    size: '',
    color: '',
    gender: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    sortBy: '',
    search: '',
    collection: '',
  },
};

// Async thunk: Fetch products by query filters
export const fetchProductsByFilters = createAsyncThunk(
  'products/fetchProductsByFilters',
  async (filterParams = {}, { rejectWithValue }) => {
    try {
      const query = new URLSearchParams();

      Object.entries(filterParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          query.append(key, value);
        }
      });

      const response = await axios.get(`${BACKEND_URL}/api/products?${query.toString()}`);
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

// Async thunk: Fetch product details by ID
export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/products/${productId}`);
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

// Async thunk: Fetch similar products
export const fetchSimilarProducts = createAsyncThunk(
  'products/fetchSimilarProducts',
  async ({ category, currentId }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/products?category=${encodeURIComponent(category || '')}&limit=5`
      );
      const items = response.data.filter((item) => item._id !== currentId);
      return items.slice(0, 4);
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
      state.similarProducts = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products by filters
      .addCase(fetchProductsByFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductsByFilters.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProductsByFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch product details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch similar products
      .addCase(fetchSimilarProducts.fulfilled, (state, action) => {
        state.similarProducts = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
