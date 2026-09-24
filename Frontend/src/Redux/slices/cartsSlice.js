import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:9000';

const loadSavedCart = () => {
  try {
    const saved = localStorage.getItem('rabbit_cart');
    if (saved) return JSON.parse(saved);
  } catch (_) {}
  return { products: [], totalPrice: 0 };
};

const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('rabbit_cart', JSON.stringify(cart));
  } catch (_) {}
};

const initialState = {
  cart: loadSavedCart(),
  loading: false,
  error: null,
};

// Helper to configure auth headers
const getAuthConfig = (getState) => {
  const { auth } = getState();
  const config = { headers: {} };
  if (auth.userToken) {
    config.headers.Authorization = `Bearer ${auth.userToken}`;
  }
  return config;
};

// Async thunk: Fetch cart
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async ({ guestId } = {}, { getState, rejectWithValue }) => {
    try {
      const config = getAuthConfig(getState);
      const gid = guestId || localStorage.getItem('guestId') || 'guest_default';
      const guestQuery = `?guestId=${gid}`;
      const response = await axios.get(`${BACKEND_URL}/api/cart${guestQuery}`, config);
      if (response.data && response.data.products && response.data.products.length > 0) {
        saveCartToStorage(response.data);
        return response.data;
      }
      return loadSavedCart();
    } catch (error) {
      return loadSavedCart();
    }
  }
);

// Async thunk: Add item to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async (
    { productId, quantity, size, color, name, image, price, guestId },
    { getState }
  ) => {
    const gid = guestId || localStorage.getItem('guestId') || 'guest_default';
    const payload = {
      productId,
      quantity: Number(quantity) || 1,
      size: size || 'M',
      color: color || 'Standard',
      name: name || 'Stylish Product',
      image: image || 'https://picsum.photos/500/500?random=1',
      price: Number(price) || 50,
      guestId: gid,
    };

    try {
      const config = getAuthConfig(getState);
      const response = await axios.post(`${BACKEND_URL}/api/cart`, payload, config);
      if (response.data && response.data.products) {
        saveCartToStorage(response.data);
        return response.data;
      }
    } catch (_) {}

    // Fallback Redux local update
    const currentCart = loadSavedCart();
    const existingIndex = currentCart.products.findIndex(
      (p) =>
        (p.productId === productId || p._id === productId) &&
        p.size === payload.size &&
        p.color === payload.color
    );

    if (existingIndex > -1) {
      currentCart.products[existingIndex].quantity += payload.quantity;
    } else {
      currentCart.products.push(payload);
    }

    currentCart.totalPrice = currentCart.products.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1),
      0
    );

    saveCartToStorage(currentCart);
    return currentCart;
  }
);

// Async thunk: Update cart item quantity
export const updateCartItemQuantity = createAsyncThunk(
  'cart/updateCartItemQuantity',
  async ({ productId, quantity, size, color, guestId }, { getState }) => {
    const gid = guestId || localStorage.getItem('guestId') || 'guest_default';
    try {
      const config = getAuthConfig(getState);
      const response = await axios.put(
        `${BACKEND_URL}/api/cart`,
        { productId, quantity, size, color, guestId: gid },
        config
      );
      if (response.data && response.data.products) {
        saveCartToStorage(response.data);
        return response.data;
      }
    } catch (_) {}

    const currentCart = loadSavedCart();
    const itemIndex = currentCart.products.findIndex(
      (p) =>
        (p.productId === productId || p._id === productId) &&
        p.size === size &&
        p.color === color
    );

    if (itemIndex > -1) {
      if (Number(quantity) <= 0) {
        currentCart.products.splice(itemIndex, 1);
      } else {
        currentCart.products[itemIndex].quantity = Number(quantity);
      }
      currentCart.totalPrice = currentCart.products.reduce(
        (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1),
        0
      );
      saveCartToStorage(currentCart);
    }
    return currentCart;
  }
);

// Async thunk: Remove item from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ productId, size, color, guestId }, { getState }) => {
    const gid = guestId || localStorage.getItem('guestId') || 'guest_default';
    try {
      const config = getAuthConfig(getState);
      config.data = { productId, size, color, guestId: gid };
      const response = await axios.delete(`${BACKEND_URL}/api/cart`, config);
      if (response.data && response.data.products) {
        saveCartToStorage(response.data);
        return response.data;
      }
    } catch (_) {}

    const currentCart = loadSavedCart();
    currentCart.products = currentCart.products.filter(
      (p) =>
        !(
          (p.productId === productId || p._id === productId) &&
          p.size === size &&
          p.color === color
        )
    );
    currentCart.totalPrice = currentCart.products.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1),
      0
    );
    saveCartToStorage(currentCart);
    return currentCart;
  }
);

// Async thunk: Clear entire cart
export const clearCart = createAsyncThunk(
  'cart/clearCart',
  async ({ guestId } = {}, { getState }) => {
    const emptyCart = { products: [], totalPrice: 0 };
    saveCartToStorage(emptyCart);
    try {
      const config = getAuthConfig(getState);
      const gid = guestId || localStorage.getItem('guestId');
      await axios.delete(
        `${BACKEND_URL}/api/cart/clear${gid ? `?guestId=${gid}` : ''}`,
        config
      );
    } catch (_) {}
    return emptyCart;
  }
);

// Async thunk: Merge guest cart on login
export const mergeCart = createAsyncThunk(
  'cart/mergeCart',
  async ({ guestId }, { getState }) => {
    try {
      const config = getAuthConfig(getState);
      const response = await axios.post(
        `${BACKEND_URL}/api/cart/merge`,
        { guestId },
        config
      );
      if (response.data && response.data.products) {
        saveCartToStorage(response.data);
        return response.data;
      }
    } catch (_) {}
    return loadSavedCart();
  }
);

const cartsSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartLocally: (state) => {
      state.cart = { products: [], totalPrice: 0 };
      saveCartToStorage(state.cart);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload || { products: [], totalPrice: 0 };
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })
      .addCase(clearCart.fulfilled, (state) => {
        state.cart = { products: [], totalPrice: 0 };
      })
      .addCase(mergeCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      });
  },
});

export const { clearCartLocally } = cartsSlice.actions;
export default cartsSlice.reducer;
