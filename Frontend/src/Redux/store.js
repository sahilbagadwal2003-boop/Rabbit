import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartsSlice';
import orderReducer from './slices/orderSlice';
import adminReducer from './slices/AdminSlice';
import adminOrderReducer from './slices/adminOrder';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    admin: adminReducer,
    adminOrders: adminOrderReducer,
  },
});

export default store;
