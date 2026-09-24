import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails } from '../Redux/slices/orderSlice';
import { fetchAllOrders } from '../Redux/slices/adminOrder';
import {
  HiOutlineCheckBadge,
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineArrowRight,
  HiOutlineClipboardDocumentList,
} from 'react-icons/hi2';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { orderDetails, loading } = useSelector((state) => state.orders);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    // Trigger success animation on mount
    setTimeout(() => setShowAnimation(true), 100);

    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
      // Refresh admin orders so the new order appears immediately
      dispatch(fetchAllOrders());
    }
  }, [dispatch, orderId]);

  const order = orderDetails && (orderDetails._id === orderId || !orderId) ? orderDetails : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-gray-50 flex items-center justify-center py-16 px-4">
      <div className="max-w-lg w-full">
        {/* Success Icon Animation */}
        <div className="flex justify-center mb-8">
          <div
            className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-700 ease-out ${
              showAnimation
                ? 'bg-green-100 scale-100 opacity-100'
                : 'bg-green-50 scale-50 opacity-0'
            }`}
          >
            <HiOutlineCheckBadge
              className={`text-green-500 transition-all duration-500 delay-300 ${
                showAnimation ? 'w-16 h-16 opacity-100' : 'w-8 h-8 opacity-0'
              }`}
            />
          </div>
        </div>

        {/* Title */}
        <div
          className={`text-center mb-8 transition-all duration-500 delay-200 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Order Placed! 🎉</h1>
          <p className="text-gray-500 text-base">
            Thank you for your purchase. Your PayPal payment was successful.
          </p>
          {orderId && (
            <p className="text-xs text-gray-400 mt-2 font-mono">
              Order ID: <span className="text-gray-600 font-semibold">{orderId}</span>
            </p>
          )}
        </div>

        {/* Order Details Card */}
        {order && (
          <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6 transition-all duration-500 delay-300 ${
              showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center">
              <HiOutlineShoppingBag className="w-5 h-5 mr-2 text-black" />
              Items Ordered
            </h2>

            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto pr-1 mb-4">
              {(order.orderItems || []).map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image || 'https://picsum.photos/100'}
                      alt={item.name}
                      className="w-12 h-14 object-cover rounded-lg border border-gray-100"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        Qty: {item.quantity} | {item.size || 'M'} / {item.color || 'Default'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    ${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price summary */}
            <div className="border-t border-gray-100 pt-3 space-y-1.5 text-sm">
              {order.itemsPrice !== undefined && (
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${Number(order.itemsPrice).toFixed(2)}</span>
                </div>
              )}
              {order.shippingPrice !== undefined && (
                <div className="flex justify-between text-gray-500">
                  <span>Shipping</span>
                  <span>
                    {Number(order.shippingPrice) === 0 ? (
                      <span className="text-green-600 font-bold">FREE</span>
                    ) : (
                      `$${Number(order.shippingPrice).toFixed(2)}`
                    )}
                  </span>
                </div>
              )}
              {order.taxPrice !== undefined && (
                <div className="flex justify-between text-gray-500">
                  <span>Tax</span>
                  <span>${Number(order.taxPrice).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                <span>Total Paid</span>
                <span className="text-lg text-black font-extrabold">
                  ${Number(order.totalPrice).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Shipping info */}
        {order?.shippingAddress && (
          <div
            className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-5 mb-6 transition-all duration-500 delay-400 ${
              showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <h2 className="text-sm font-bold text-gray-900 mb-2 flex items-center">
              <HiOutlineTruck className="w-4 h-4 mr-2 text-black" /> Shipping To
            </h2>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="text-sm text-gray-500">{order.shippingAddress.address}</p>
            <p className="text-sm text-gray-500">
              {order.shippingAddress.city}, {order.shippingAddress.postalCode},{' '}
              {order.shippingAddress.country}
            </p>
          </div>
        )}

        {/* Status badge */}
        <div
          className={`flex items-center justify-center space-x-2 mb-8 transition-all duration-500 delay-500 ${
            showAnimation ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
            ✓ Payment Confirmed via PayPal
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
            🚚 Processing
          </span>
        </div>

        {/* Action buttons */}
        <div
          className={`space-y-3 transition-all duration-500 delay-500 ${
            showAnimation ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {orderId && (
            <Link
              to={`/order/${orderId}`}
              className="w-full bg-black hover:bg-gray-900 text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
            >
              <HiOutlineClipboardDocumentList className="w-5 h-5" />
              <span>View Order Details</span>
              <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition cursor-pointer"
          >
            <HiOutlineShoppingBag className="w-5 h-5" />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
