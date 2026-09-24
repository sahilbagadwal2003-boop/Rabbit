import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminStats } from '../../Redux/slices/AdminSlice';
import {
  HiOutlineBanknotes,
  HiOutlineShoppingBag,
  HiOutlineClipboardDocumentList,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi2';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  const dashboardStats = stats || {
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    deliveredOrdersCount: 0,
    unpaidOrdersCount: 0,
    recentOrders: [],
  };

  const metricCards = [
    {
      title: 'Total Revenue',
      value: `$${(dashboardStats.totalSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: HiOutlineBanknotes,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      title: 'Total Orders',
      value: dashboardStats.totalOrders || 0,
      icon: HiOutlineClipboardDocumentList,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Delivered Orders',
      value: dashboardStats.deliveredOrdersCount || 0,
      icon: HiOutlineCheckCircle,
      color: 'bg-teal-50 text-teal-600',
    },
    {
      title: 'Unpaid / Pending',
      value: dashboardStats.unpaidOrdersCount || 0,
      icon: HiOutlineExclamationCircle,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  if (loading && !dashboardStats.totalProducts && !dashboardStats.totalOrders) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-black border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time overview of store transactions, shopping, and fulfillment.</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  {card.title}
                </p>
                <h3 className="text-2xl font-extrabold text-gray-900">{card.value}</h3>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section with Shopped Products */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Customer Orders</h2>
            <p className="text-xs text-gray-500 mt-0.5">Lively orders placed with complete shopped items breakdown</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-black hover:underline"
          >
            Manage all orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-gray-500">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-100 font-semibold">
              <tr>
                <th className="py-3 px-6">Order ID</th>
                <th className="py-3 px-6">Customer</th>
                <th className="py-3 px-6">Products Shopped</th>
                <th className="py-3 px-6">Date</th>
                <th className="py-3 px-6">Amount</th>
                <th className="py-3 px-6">Payment</th>
                <th className="py-3 px-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboardStats.recentOrders && dashboardStats.recentOrders.length > 0 ? (
                dashboardStats.recentOrders.map((order) => {
                  const items = order.orderItems || [];
                  const itemCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
                  const isDelivered = order.status === 'Delivered' || order.isDelivered;

                  return (
                    <tr key={order._id} className="hover:bg-gray-50/80 transition">
                      {/* Order ID */}
                      <td className="py-4 px-6 font-semibold text-gray-900 whitespace-nowrap">
                        <Link to="/admin/orders" className="hover:text-blue-600 font-mono">
                          #{order._id.substring(order._id.length - 8)}
                        </Link>
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-6">
                        <p className="font-semibold text-gray-900 text-sm">
                          {order.user?.name ||
                            `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() ||
                            'Guest Customer'}
                        </p>
                        <p className="text-xs text-gray-400">{order.user?.email || order.shippingAddress?.phone || 'No email'}</p>
                      </td>

                      {/* Products Shopped */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2 overflow-hidden">
                            {items.slice(0, 3).map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image || 'https://picsum.photos/100'}
                                alt={item.name}
                                title={`${item.name} (Qty: ${item.quantity})`}
                                className="inline-block h-9 w-8 rounded-md object-cover ring-2 ring-white border border-gray-200 shrink-0"
                              />
                            ))}
                            {items.length > 3 && (
                              <div className="h-9 w-8 rounded-md bg-gray-100 ring-2 ring-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                                +{items.length - 3}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-[140px]">
                              {items[0]?.name || 'Shopped Item'}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              {itemCount} {itemCount === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-gray-600 text-xs">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-6 font-extrabold text-gray-900 whitespace-nowrap">
                        ${(order.totalPrice || 0).toFixed(2)}
                      </td>

                      {/* Payment */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            order.isPaid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'Cancelled'
                              ? 'bg-rose-100 text-rose-800'
                              : order.status === 'Shipped'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status || 'Processing'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <HiOutlineShoppingBag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-700">No orders placed yet</p>
                    <p className="text-xs text-gray-400">New customer orders will appear lively here.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
