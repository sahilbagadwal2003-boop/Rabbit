import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllOrders,
  updateOrderStatus,
  deleteOrder,
  bulkUpdateOrders,
  bulkDeleteOrders,
} from '../../Redux/slices/adminOrder';
import { toast } from 'sonner';
import {
  HiOutlineShoppingBag,
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineXMark,
  HiOutlineMagnifyingGlass,
  HiOutlineTrash,
  HiOutlineEye,
  HiOutlineCurrencyDollar,
  HiOutlineArrowPath,
} from 'react-icons/hi2';

const AdminOrders = () => {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((state) => state.adminOrders);

  // Active filter tab: 'all' | 'selected' | 'delivered' | 'unpaid' | 'Processing' | 'Shipped' | 'Cancelled'
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState(new Set());
  const [detailOrder, setDetailOrder] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const ordersList = useMemo(() => (Array.isArray(orders) ? orders : []), [orders]);

  // Counts for tabs
  const counts = useMemo(() => {
    return {
      all: ordersList.length,
      selected: selectedOrderIds.size,
      delivered: ordersList.filter(
        (o) => o.status === 'Delivered' || o.isDelivered === true
      ).length,
      unpaid: ordersList.filter((o) => !o.isPaid).length,
      processing: ordersList.filter((o) => (o.status || 'Processing') === 'Processing').length,
      shipped: ordersList.filter((o) => o.status === 'Shipped').length,
      cancelled: ordersList.filter((o) => o.status === 'Cancelled').length,
    };
  }, [ordersList, selectedOrderIds]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return ordersList.filter((order) => {
      // Tab filter
      if (activeTab === 'selected') {
        if (!selectedOrderIds.has(order._id)) return false;
      } else if (activeTab === 'delivered') {
        if (order.status !== 'Delivered' && !order.isDelivered) return false;
      } else if (activeTab === 'unpaid') {
        if (order.isPaid) return false;
      } else if (activeTab === 'Processing') {
        if ((order.status || 'Processing') !== 'Processing') return false;
      } else if (activeTab === 'Shipped') {
        if (order.status !== 'Shipped') return false;
      } else if (activeTab === 'Cancelled') {
        if (order.status !== 'Cancelled') return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const orderId = (order._id || '').toLowerCase();
        const customerName = (
          order.user?.name ||
          `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`
        ).toLowerCase();
        const customerEmail = (order.user?.email || '').toLowerCase();
        const productsMatch = (order.orderItems || []).some((item) =>
          (item.name || '').toLowerCase().includes(query)
        );

        return (
          orderId.includes(query) ||
          customerName.includes(query) ||
          customerEmail.includes(query) ||
          productsMatch
        );
      }

      return true;
    });
  }, [ordersList, activeTab, selectedOrderIds, searchTerm]);

  // Handle single order selection
  const toggleSelectOrder = (orderId) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
      } else {
        next.add(orderId);
      }
      return next;
    });
  };

  // Handle Select All (for current filtered view)
  const isAllFilteredSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedOrderIds.has(o._id));

  const toggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        filteredOrders.forEach((o) => next.delete(o._id));
        return next;
      });
    } else {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        filteredOrders.forEach((o) => next.add(o._id));
        return next;
      });
    }
  };

  // Status change handler
  const handleStatusChange = async (orderId, newStatus) => {
    const isDelivered = newStatus === 'Delivered';
    const result = await dispatch(
      updateOrderStatus({ id: orderId, status: newStatus, isDelivered })
    );
    if (updateOrderStatus.fulfilled.match(result)) {
      toast.success(`Order status updated to ${newStatus}`);
      if (detailOrder && detailOrder._id === orderId) {
        setDetailOrder((prev) => ({ ...prev, status: newStatus, isDelivered }));
      }
    } else {
      toast.error(result.payload || 'Failed to update status');
    }
  };

  // Toggle payment status
  const handleTogglePayment = async (order) => {
    const newIsPaid = !order.isPaid;
    const result = await dispatch(
      updateOrderStatus({ id: order._id, isPaid: newIsPaid })
    );
    if (updateOrderStatus.fulfilled.match(result)) {
      toast.success(`Order marked as ${newIsPaid ? 'Paid' : 'Unpaid'}`);
      if (detailOrder && detailOrder._id === order._id) {
        setDetailOrder((prev) => ({ ...prev, isPaid: newIsPaid }));
      }
    } else {
      toast.error(result.payload || 'Failed to update payment');
    }
  };

  // Mark single as delivered
  const handleMarkDelivered = async (orderId) => {
    const result = await dispatch(
      updateOrderStatus({ id: orderId, status: 'Delivered', isDelivered: true })
    );
    if (updateOrderStatus.fulfilled.match(result)) {
      toast.success('Order marked as Delivered');
      if (detailOrder && detailOrder._id === orderId) {
        setDetailOrder((prev) => ({ ...prev, status: 'Delivered', isDelivered: true }));
      }
    } else {
      toast.error(result.payload || 'Failed to update delivery');
    }
  };

  // Delete single order
  const handleDelete = async (orderId) => {
    if (!window.confirm('Delete this order permanently?')) return;
    const result = await dispatch(deleteOrder(orderId));
    if (deleteOrder.fulfilled.match(result)) {
      toast.success('Order removed');
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
      });
      if (detailOrder && detailOrder._id === orderId) {
        setDetailOrder(null);
      }
    } else {
      toast.error(result.payload || 'Failed to delete order');
    }
  };

  // Bulk actions
  const handleBulkStatus = async (status, isDelivered) => {
    const ids = Array.from(selectedOrderIds);
    if (ids.length === 0) return;
    const result = await dispatch(bulkUpdateOrders({ orderIds: ids, status, isDelivered }));
    if (bulkUpdateOrders.fulfilled.match(result)) {
      toast.success(`Updated ${ids.length} orders to ${status}`);
    } else {
      toast.error('Bulk update failed');
    }
  };

  const handleBulkPayment = async (isPaid) => {
    const ids = Array.from(selectedOrderIds);
    if (ids.length === 0) return;
    const result = await dispatch(bulkUpdateOrders({ orderIds: ids, isPaid }));
    if (bulkUpdateOrders.fulfilled.match(result)) {
      toast.success(`Marked ${ids.length} orders as ${isPaid ? 'Paid' : 'Unpaid'}`);
    } else {
      toast.error('Bulk payment update failed');
    }
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedOrderIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${ids.length} selected orders?`)) return;
    const result = await dispatch(bulkDeleteOrders(ids));
    if (bulkDeleteOrders.fulfilled.match(result)) {
      toast.success(`Deleted ${ids.length} orders`);
      setSelectedOrderIds(new Set());
    } else {
      toast.error('Bulk delete failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Order Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor, filter, and manage lively customer orders and shopped items.
          </p>
        </div>
        <button
          onClick={() => dispatch(fetchAllOrders())}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <HiOutlineArrowPath className="w-4 h-4" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Filter Tabs & Search Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>All Orders</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-white text-gray-700'}`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('selected')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'selected'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <span>Selected</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'selected' ? 'bg-white/20 text-white' : 'bg-blue-200 text-blue-800'}`}>
              {counts.selected}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('delivered')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'delivered'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>Delivered</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'delivered' ? 'bg-white/20 text-white' : 'bg-emerald-200 text-emerald-800'}`}>
              {counts.delivered}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('unpaid')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'unpaid'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>Unpaid</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'unpaid' ? 'bg-white/20 text-white' : 'bg-amber-200 text-amber-900'}`}>
              {counts.unpaid}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Processing')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'Processing'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <span>Processing</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'Processing' ? 'bg-white/20 text-white' : 'bg-indigo-200 text-indigo-800'}`}>
              {counts.processing}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Shipped')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'Shipped'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            <span>Shipped</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'Shipped' ? 'bg-white/20 text-white' : 'bg-purple-200 text-purple-800'}`}>
              {counts.shipped}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('Cancelled')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center space-x-2 ${
              activeTab === 'Cancelled'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span>Cancelled</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'Cancelled' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-800'}`}>
              {counts.cancelled}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <HiOutlineMagnifyingGlass className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID, customer, product..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
            >
              <HiOutlineXMark className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bulk Action Bar (when orders are selected) */}
      {selectedOrderIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <span className="font-bold text-sm text-blue-900">
              {selectedOrderIds.size} {selectedOrderIds.size === 1 ? 'order' : 'orders'} selected
            </span>
            {activeTab !== 'selected' && (
              <button
                onClick={() => setActiveTab('selected')}
                className="text-xs text-blue-700 hover:text-blue-900 underline font-semibold cursor-pointer"
              >
                View selected only
              </button>
            )}
            <button
              onClick={() => setSelectedOrderIds(new Set())}
              className="text-xs text-gray-500 hover:text-gray-800 underline cursor-pointer"
            >
              Deselect all
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleBulkStatus('Delivered', true)}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1"
            >
              <HiOutlineCheckCircle className="w-4 h-4" />
              <span>Mark Delivered</span>
            </button>

            <button
              onClick={() => handleBulkPayment(true)}
              className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1"
            >
              <HiOutlineCurrencyDollar className="w-4 h-4" />
              <span>Mark Paid</span>
            </button>

            <button
              onClick={() => handleBulkStatus('Processing', false)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1"
            >
              <HiOutlineTruck className="w-4 h-4" />
              <span>Mark Processing</span>
            </button>

            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer flex items-center space-x-1"
            >
              <HiOutlineTrash className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Orders Table Container */}
      {loading ? (
        <div className="flex justify-center py-24 bg-white rounded-2xl border border-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllFilteredSelected}
                      onChange={toggleSelectAllFiltered}
                      className="w-4 h-4 rounded text-black focus:ring-black border-gray-300 cursor-pointer"
                    />
                  </th>
                  <th className="py-3.5 px-4">Order Details</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Products Shopped</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Delivery Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => {
                    const isSelected = selectedOrderIds.has(order._id);
                    const customerName =
                      order.user?.name ||
                      `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`.trim() ||
                      'Guest Customer';
                    const customerEmail =
                      order.user?.email || order.shippingAddress?.phone || 'No email';
                    const status = order.status || 'Processing';
                    const isDelivered = status === 'Delivered' || order.isDelivered === true;
                    const items = order.orderItems || [];
                    const itemCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);

                    return (
                      <tr
                        key={order._id}
                        className={`transition hover:bg-gray-50/80 ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        {/* Checkbox */}
                        <td className="py-4 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOrder(order._id)}
                            className="w-4 h-4 rounded text-black focus:ring-black border-gray-300 cursor-pointer"
                          />
                        </td>

                        {/* Order ID & Date */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => setDetailOrder(order)}
                            className="text-xs font-mono font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
                          >
                            #{order._id.substring(order._id.length - 8)}
                          </button>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-4">
                          <p className="font-semibold text-gray-900 text-sm line-clamp-1">
                            {customerName}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1">{customerEmail}</p>
                          {order.shippingAddress?.city && (
                            <p className="text-[11px] text-gray-400">
                              {order.shippingAddress.city}, {order.shippingAddress.country}
                            </p>
                          )}
                        </td>

                        {/* Products Shopped Column */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            {/* Product Thumbnails */}
                            <div className="flex -space-x-2 overflow-hidden">
                              {items.slice(0, 3).map((item, idx) => (
                                <img
                                  key={idx}
                                  src={item.image || 'https://picsum.photos/100'}
                                  alt={item.name}
                                  title={`${item.name} (Qty: ${item.quantity})`}
                                  className="inline-block h-10 w-9 rounded-md object-cover ring-2 ring-white border border-gray-200 shrink-0"
                                />
                              ))}
                              {items.length > 3 && (
                                <div className="h-10 w-9 rounded-md bg-gray-100 ring-2 ring-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                                  +{items.length - 3}
                                </div>
                              )}
                            </div>

                            {/* Details text & trigger */}
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-gray-800 line-clamp-1 max-w-[150px]">
                                {items[0]?.name || 'Shopping Item'}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {itemCount} {itemCount === 1 ? 'item' : 'items'}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Total Price */}
                        <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                          ${(order.totalPrice || 0).toFixed(2)}
                        </td>

                        {/* Payment Status with Toggle Button */}
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold inline-flex items-center space-x-1 ${
                                order.isPaid
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <span>{order.isPaid ? 'Paid' : 'Unpaid'}</span>
                            </span>
                            <button
                              onClick={() => handleTogglePayment(order)}
                              title={order.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                              className="text-[11px] font-medium text-gray-500 hover:text-black underline cursor-pointer"
                            >
                              Toggle
                            </button>
                          </div>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-4 px-4">
                          <select
                            value={status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold outline-none cursor-pointer transition ${
                              isDelivered
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                : status === 'Shipped'
                                ? 'bg-purple-50 text-purple-800 border-purple-300'
                                : status === 'Cancelled'
                                ? 'bg-rose-50 text-rose-800 border-rose-300'
                                : 'bg-gray-50 text-gray-800 border-gray-300'
                            }`}
                          >
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* View Full Order Modal */}
                            <button
                              onClick={() => setDetailOrder(order)}
                              title="View Order Details"
                              className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition cursor-pointer"
                            >
                              <HiOutlineEye className="w-4 h-4" />
                            </button>

                            {/* Quick Mark Delivered */}
                            <button
                              onClick={() => handleMarkDelivered(order._id)}
                              disabled={isDelivered}
                              title="Mark as Delivered"
                              className={`p-1.5 rounded-lg transition cursor-pointer ${
                                isDelivered
                                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                              }`}
                            >
                              <HiOutlineCheckCircle className="w-4 h-4" />
                            </button>

                            {/* Delete Order */}
                            <button
                              onClick={() => handleDelete(order._id)}
                              title="Delete Order"
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition cursor-pointer"
                            >
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-gray-400 text-sm">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <HiOutlineShoppingBag className="w-8 h-8 text-gray-300" />
                        <p className="font-semibold text-gray-600">No matching orders found</p>
                        <p className="text-xs text-gray-400">
                          Try changing your search term or active tab filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* ORDER DETAILS MODAL / DRAWER (Complete Product Shopping Details)  */}
      {/* ───────────────────────────────────────────────────────────────── */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900">
                  Order #{detailOrder._id}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {new Date(detailOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setDetailOrder(null)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 hover:text-black transition cursor-pointer"
              >
                <HiOutlineXMark className="w-5 h-5" />
              </button>
            </div>

            {/* Shopped Products List */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center">
                <HiOutlineShoppingBag className="w-4 h-4 mr-2" />
                Products Shopped ({detailOrder.orderItems?.length || 0})
              </h4>
              <div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 overflow-hidden bg-gray-50/50">
                {(detailOrder.orderItems || []).map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between bg-white">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || 'https://picsum.photos/100'}
                        alt={item.name}
                        className="w-14 h-16 object-cover rounded-lg border border-gray-100"
                      />
                      <div>
                        <h5 className="text-sm font-semibold text-gray-900 line-clamp-1">
                          {item.name}
                        </h5>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Size: <span className="font-semibold text-gray-800">{item.size || 'M'}</span> | Color:{' '}
                          <span className="font-semibold text-gray-800">{item.color || 'Standard'}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Qty: <span className="font-semibold text-gray-800">{item.quantity}</span> × ${Number(item.price || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      ${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Breakdown */}
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">
                  ${(detailOrder.itemsPrice || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">
                  ${(detailOrder.shippingPrice || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-gray-900">
                  ${(detailOrder.taxPrice || 0).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-sm text-gray-900">
                <span>Total Amount</span>
                <span className="text-base text-black font-extrabold">
                  ${(detailOrder.totalPrice || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Customer & Shipping Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Customer Info</h5>
                <p className="text-sm font-bold text-gray-900">
                  {detailOrder.user?.name ||
                    `${detailOrder.shippingAddress?.firstName || ''} ${detailOrder.shippingAddress?.lastName || ''}`}
                </p>
                <p className="text-xs text-gray-600 mt-1">{detailOrder.user?.email || 'N/A'}</p>
                <p className="text-xs text-gray-600 font-mono mt-0.5">
                  {detailOrder.shippingAddress?.phone || 'No phone'}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-4">
                <h5 className="text-xs font-bold uppercase text-gray-500 mb-2">Shipping Address</h5>
                <p className="text-xs text-gray-800">
                  {detailOrder.shippingAddress?.address}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {detailOrder.shippingAddress?.city}, {detailOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-xs text-gray-600">{detailOrder.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Status & Payment Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleTogglePayment(detailOrder)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    detailOrder.isPaid
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  }`}
                >
                  {detailOrder.isPaid ? '✓ Marked Paid (Click to change)' : '⚠ Unpaid (Click to mark Paid)'}
                </button>

                <button
                  onClick={() => handleMarkDelivered(detailOrder._id)}
                  disabled={detailOrder.status === 'Delivered' || detailOrder.isDelivered}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition disabled:opacity-50 cursor-pointer"
                >
                  {detailOrder.status === 'Delivered' ? 'Delivered' : 'Mark Delivered'}
                </button>
              </div>

              <button
                onClick={() => setDetailOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
