import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserOrders } from '../Redux/slices/orderSlice';

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.orders);
  const { userToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userToken) {
      dispatch(fetchUserOrders());
    }
  }, [dispatch, userToken]);

  const ordersList = Array.isArray(orders) ? orders : [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">
        My Orders
      </h2>
      <div className="relative shadow-sm border border-gray-200 sm:rounded-lg overflow-x-auto">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent" />
          </div>
        ) : (
          <table className="min-w-full text-left text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Image</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Shipping Address</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {ordersList.length > 0 ? (
                ordersList.map((order) => (
                  <tr
                    key={order._id}
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4">
                      <img
                        src={order.orderItems && order.orderItems[0]?.image ? order.orderItems[0]?.image : 'https://picsum.photos/100'}
                        alt={order.orderItems && order.orderItems[0]?.name ? order.orderItems[0]?.name : 'Product'}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                    </td>
                    <td className="py-4 px-4 font-mono text-xs font-medium text-gray-900 whitespace-nowrap">
                      #{order._id?.substring(order._id.length - 8)}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {order.shippingAddress
                        ? `${order.shippingAddress.city || ''}, ${order.shippingAddress.country || ''}`
                        : 'N/A'}
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {order.orderItems?.length || 1}
                    </td>
                    <td className="py-4 px-4 text-sm font-semibold text-gray-900">
                      ${(order.totalPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          order.isPaid
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {order.isPaid ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 px-4 text-center text-gray-500 text-sm"
                  >
                    You have no orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
