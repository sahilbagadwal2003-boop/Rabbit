import React, { useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import Cartcontent from '../cart/Cartcontent';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCart } from '../../Redux/slices/cartsSlice';

const CartDrawer = ({ drawerOpen, toggleCartDrawer }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);
  const { guestId, userToken } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchCart({ guestId: userToken ? undefined : guestId }));
  }, [dispatch, guestId, userToken]);

  const handleCheckout = () => {
    toggleCartDrawer();
    navigate('/checkout');
  };

  const totalPrice = cart?.totalPrice || 0;
  const itemCount = cart?.products?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <>
      {/* Backdrop overlay */}
      {drawerOpen && (
        <div
          onClick={toggleCartDrawer}
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        />
      )}

      {/* Cart Drawer Panel */}
      <div
        className={`fixed top-0 right-0 w-3/4 sm:w-1/2 md:w-[26rem] h-full bg-white shadow-2xl transform transition-transform duration-300 flex flex-col z-50 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">
            Shopping Cart ({itemCount})
          </h2>
          <button
            onClick={toggleCartDrawer}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <IoMdClose className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Cart Content */}
        <div className="flex-grow p-4 overflow-y-auto">
          <Cartcontent />
        </div>

        {/* Checkout Button & Footer */}
        <div className="p-4 bg-white border-t border-gray-200 sticky bottom-0 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold text-gray-900">
            <span>Subtotal:</span>
            <span className="text-base">${totalPrice.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition shadow-sm cursor-pointer"
          >
            Checkout {totalPrice > 0 ? `• $${totalPrice.toFixed(2)}` : ''}
          </button>
          <p className="text-[11px] text-gray-400 text-center">
            Shipping, taxes, and discount codes calculated at checkout.
          </p>
        </div>
      </div>
    </>
  );
};

export default CartDrawer;