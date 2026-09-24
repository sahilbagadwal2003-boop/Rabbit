import React, { useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails } from '../Redux/slices/orderSlice';
import { toast } from 'sonner';
import {
  HiOutlineCheckCircle,
  HiOutlineTruck,
  HiOutlineArrowLeft,
  HiOutlineCreditCard,
} from 'react-icons/hi2';

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orderDetails: order, loading, error } = useSelector((state) => state.orders);
  const { userToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userToken) {
      toast.error('Please log in to view this order.');
      navigate('/login');
      return;
    }

    if (id) {
      dispatch(fetchOrderDetails(id));
    }
  }, [id, userToken, navigate, dispatch]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent" />
      </div>
    );
  }

  if (!order || error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">We could not locate this order in our system.</p>
        <Link
          to="/profile"
          className="bg-black text-white px-6 py-2.5 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          Return to Profile & Orders
        </Link>
      </div>
    );
  }

  const shippingAddress = order.shippingAddress || {};
  const orderItems = order.orderItems || [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/profile"
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-black mb-6 transition"
        >
          <HiOutlineArrowLeft className="w-4 h-4 mr-2" /> Back to Profile & Orders
        </Link>

        {/* Success Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <HiOutlineCheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Order #{order._id}</h1>
              <p className="text-sm text-gray-500">
                Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'} at{' '}
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                order.status === 'Delivered'
                  ? 'bg-green-100 text-green-700'
                  : order.status === 'Cancelled'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {order.status || 'Processing'}
            </span>
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {order.isPaid ? 'Paid' : 'Payment Pending'}
            </span>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <HiOutlineTruck className="w-5 h-5 mr-2 text-gray-600" /> Delivery Address
            </h3>
            <p className="text-sm font-semibold text-gray-800">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p className="text-sm text-gray-600 mt-1">{shippingAddress.address}</p>
            <p className="text-sm text-gray-600">
              {shippingAddress.city}, {shippingAddress.postalCode}
            </p>
            <p className="text-sm text-gray-600">{shippingAddress.country}</p>
            {shippingAddress.phone && (
              <p className="text-sm text-gray-600 mt-2">Phone: {shippingAddress.phone}</p>
            )}
          </div>

          {/* Payment Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center">
              <HiOutlineCreditCard className="w-5 h-5 mr-2 text-gray-600" /> Payment Information
            </h3>
            <p className="text-sm text-gray-600">
              Method: <span className="font-semibold text-gray-900">{order.paymentMethod || 'Cash on Delivery'}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Payment Status:{' '}
              <span className={`font-semibold ${order.isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                {order.isPaid
                  ? `Paid on ${order.paidAt ? new Date(order.paidAt).toLocaleDateString() : 'N/A'}`
                  : 'Pending (COD / Unpaid)'}
              </span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Fulfillment:{' '}
              <span className="font-semibold text-gray-900">
                {order.isDelivered
                  ? `Delivered on ${order.deliveredAt ? new Date(order.deliveredAt).toLocaleDateString() : 'N/A'}`
                  : 'In Transit / Processing'}
              </span>
            </p>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <h3 className="font-bold text-gray-900 mb-6">Ordered Items ({orderItems.length})</h3>

          <div className="divide-y divide-gray-100">
            {orderItems.map((item, index) => (
              <div key={index} className="py-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.image || 'https://picsum.photos/100'}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-lg border border-gray-100"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Size: <span className="font-medium text-gray-700">{item.size || 'N/A'}</span> | Color:{' '}
                      <span className="font-medium text-gray-700">{item.color || 'N/A'}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Qty: {item.quantity || 1} × ${(item.price || 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold text-gray-900">
                    ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 mt-6 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal</span>
              <span className="font-medium text-gray-900">${(order.itemsPrice || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping Fee</span>
              <span className="font-medium text-gray-900">
                {order.shippingPrice === 0 ? 'FREE' : `$${(order.shippingPrice || 0).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Estimated Tax</span>
              <span className="font-medium text-gray-900">${(order.taxPrice || 0).toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
              <span>Total Paid</span>
              <span className="text-xl text-black">${(order.totalPrice || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
