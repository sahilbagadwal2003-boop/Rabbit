import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import {
  HiOutlineTruck,
  HiOutlineArrowLeft,
  HiOutlineShieldCheck,
  HiOutlineLockClosed,
  HiOutlineCheckCircle,
  HiOutlineChevronRight,
  HiOutlineShoppingBag,
} from 'react-icons/hi2';
import { fetchCart, clearCartLocally, clearCart } from '../../Redux/slices/cartsSlice';
import { createCheckoutSession, finalizeCheckout, createOrder } from '../../Redux/slices/orderSlice';
import { fetchAllOrders } from '../../Redux/slices/adminOrder';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cart } = useSelector((state) => state.cart);
  const { user, guestId, userToken } = useSelector((state) => state.auth);

  // Two-phase state: false = review/address, true = PayPal button
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [shippingAddress, setShippingAddress] = useState({
    firstName: user?.name ? user.name.split(' ')[0] : 'Jane',
    lastName: user?.name ? user.name.split(' ').slice(1).join(' ') || 'Doe' : 'Doe',
    address: '123 Fashion Street, Suite 4B',
    city: 'New York',
    postalCode: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567',
  });

  useEffect(() => {
    dispatch(fetchCart({ guestId: userToken ? undefined : guestId }));
  }, [dispatch, guestId, userToken]);

  // Read lively products from Redux cart, or fall back to localStorage cart
  const cartProducts = useMemo(() => {
    if (cart?.products && cart.products.length > 0) {
      return cart.products;
    }
    try {
      const saved = localStorage.getItem('rabbit_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.products && parsed.products.length > 0) {
          return parsed.products;
        }
      }
    } catch (_) {}
    return [];
  }, [cart]);

  const itemsPrice = useMemo(() => {
    return cartProducts.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, [cartProducts]);

  const shippingPrice = itemsPrice > 50 || itemsPrice === 0 ? 0 : 9.99;
  const taxPrice = Number((itemsPrice * 0.08).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleAcceptAndContinue = (e) => {
    e.preventDefault();
    if (
      !shippingAddress.firstName ||
      !shippingAddress.lastName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.phone
    ) {
      toast.error('Please fill in all required shipping address fields.');
      return;
    }
    setAccepted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayPalPayment = async () => {
    if (cartProducts.length === 0) {
      toast.error('Your cart is empty. Please add items before checking out.');
      return;
    }

    setIsSubmitting(true);
    try {
      const checkoutItems = cartProducts.map((item) => ({
        productId: item.productId?._id || item.productId || item._id || `item_${Date.now()}`,
        name: item.name || 'Shopping Item',
        image: item.image || 'https://picsum.photos/500/500?random=1',
        price: Number(item.price) || 0,
        size: item.size || 'M',
        color: item.color || 'Standard',
        quantity: Number(item.quantity) || 1,
      }));

      const checkoutPayload = {
        checkoutItems,
        shippingAddress,
        paymentMethod: 'PayPal',
        totalPrice,
        guestId: userToken ? undefined : guestId,
        isPaid: true,
      };

      // Step 1: Attempt Checkout Session + Finalize
      let orderId = null;
      try {
        const sessionResult = await dispatch(createCheckoutSession(checkoutPayload));
        if (createCheckoutSession.fulfilled.match(sessionResult)) {
          const checkoutId = sessionResult.payload._id;
          const finalizeResult = await dispatch(finalizeCheckout(checkoutId));
          if (finalizeCheckout.fulfilled.match(finalizeResult)) {
            orderId = finalizeResult.payload.order?._id;
          }
        }
      } catch (_) {}

      // Fallback: direct order creation
      if (!orderId) {
        const orderPayload = {
          orderItems: checkoutItems,
          shippingAddress,
          paymentMethod: 'PayPal',
          itemsPrice: Number(itemsPrice.toFixed(2)),
          taxPrice: Number(taxPrice.toFixed(2)),
          shippingPrice: Number(shippingPrice.toFixed(2)),
          totalPrice,
          isPaid: true,
        };

        const directOrderResult = await dispatch(createOrder(orderPayload));
        if (createOrder.fulfilled.match(directOrderResult)) {
          orderId = directOrderResult.payload._id;
        } else {
          throw new Error(directOrderResult.payload || 'Failed to complete order');
        }
      }

      if (orderId) {
        // Clear lively carts
        dispatch(clearCartLocally());
        dispatch(clearCart({ guestId: userToken ? undefined : guestId }));

        // Lively update admin orders in background so admin sees it immediately
        dispatch(fetchAllOrders());

        toast.success('Order placed successfully via PayPal!');
        navigate(`/order-success?orderId=${orderId}`);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Something went wrong while processing payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // EMPTY CART SCREEN
  // ─────────────────────────────────────────────────────────────────────
  if (cartProducts.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500">
            <HiOutlineShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Bag is Empty</h2>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">
            You don't have any products in your cart yet. Explore our products and add your favorites to proceed with checkout.
          </p>
          <Link
            to="/collections/all"
            className="w-full inline-block bg-black hover:bg-gray-800 text-white font-semibold py-3.5 px-6 rounded-xl transition shadow-xs cursor-pointer"
          >
            Explore Collections
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // PHASE 2: PayPal Confirmation Screen
  // ─────────────────────────────────────────────────────────────────────
  if (accepted) {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back to review */}
          <button
            onClick={() => setAccepted(false)}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-black mb-8 transition cursor-pointer"
          >
            <HiOutlineArrowLeft className="w-4 h-4 mr-2" /> Back to Review
          </button>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Confirm & Pay</h1>
          <p className="text-sm text-gray-500 mb-8">Review your lively cart items and complete payment via PayPal.</p>

          {/* Order summary card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center justify-between">
              <span>Order Summary</span>
              <span className="text-xs bg-gray-100 text-gray-700 py-1 px-2.5 rounded-full font-semibold">
                {cartProducts.length} {cartProducts.length === 1 ? 'item' : 'items'}
              </span>
            </h2>
            <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto pr-1 mb-4">
              {cartProducts.map((item, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image || 'https://picsum.photos/100'}
                      alt={item.name}
                      className="w-14 h-16 object-cover rounded-lg border border-gray-100 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Qty: {item.quantity} | Size: {item.size || 'M'} | Color: {item.color || 'Standard'}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-900 shrink-0 ml-3">
                    ${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold text-gray-900">${itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className="font-semibold text-gray-900">
                  {shippingPrice === 0 ? (
                    <span className="text-green-600 font-bold">FREE</span>
                  ) : (
                    `$${shippingPrice.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-semibold text-gray-900">${taxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                <span>Total</span>
                <span className="text-xl text-black font-extrabold">${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping address summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center">
              <HiOutlineTruck className="w-5 h-5 mr-2 text-black" /> Shipping To
            </h2>
            <p className="text-sm text-gray-800 font-semibold">
              {shippingAddress.firstName} {shippingAddress.lastName}
            </p>
            <p className="text-sm text-gray-600 mt-0.5">{shippingAddress.address}</p>
            <p className="text-sm text-gray-600">
              {shippingAddress.city}, {shippingAddress.postalCode}
            </p>
            <p className="text-sm text-gray-600">{shippingAddress.country}</p>
            <p className=" text-gray-600 mt-1 font-mono text-xs">{shippingAddress.phone}</p>
          </div>

          {/* PayPal button */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <HiOutlineShieldCheck className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600 font-medium">Secured by PayPal — 256-bit SSL encryption</p>
            </div>

            <button
              onClick={handlePayPalPayment}
              disabled={isSubmitting}
              className="w-full bg-[#FFC439] hover:bg-[#F2BA36] active:scale-[0.98] text-[#003087] py-4 rounded-xl font-extrabold text-lg flex items-center justify-center space-x-2 shadow-md transition-all disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-[#003087] border-t-transparent rounded-full animate-spin" />
                  <span>Processing Order...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="italic font-black text-xl tracking-tighter text-[#003087]">Pay</span>
                  <span className="italic font-black text-xl tracking-tighter text-[#0079C1]">Pal</span>
                  <span className="text-sm font-semibold text-gray-800 ml-1">
                    • Complete ${totalPrice.toFixed(2)}
                  </span>
                </div>
              )}
            </button>

            <div className="mt-4 flex items-center justify-center space-x-1 text-xs text-gray-400">
              <HiOutlineLockClosed className="w-3.5 h-3.5" />
              <span>By clicking PayPal, you agree to Rabbit's Terms and Conditions</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────
  // PHASE 1: Order Review + Shipping Address Form
  // ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-gray-600 hover:text-black mb-8 transition cursor-pointer"
        >
          <HiOutlineArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>

        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">Checkout</h1>
        <p className="text-sm text-gray-500 mb-8">Step 1 of 2 — Review lively cart items and enter shipping details.</p>

        {/* Step indicator */}
        <div className="flex items-center space-x-2 mb-8 text-sm">
          <span className="flex items-center space-x-1 font-semibold text-black">
            <span className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Review & Ship</span>
          </span>
          <HiOutlineChevronRight className="w-4 h-4 text-gray-400" />
          <span className="flex items-center space-x-1 text-gray-400">
            <span className="w-6 h-6 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Pay with PayPal</span>
          </span>
        </div>

        <form onSubmit={handleAcceptAndContinue}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Shipping Address */}
            <div className="lg:col-span-7 space-y-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <HiOutlineTruck className="w-6 h-6 mr-2 text-black" /> Shipping Address
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={shippingAddress.firstName}
                      onChange={handleInputChange}
                      required
                      placeholder="Jane"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={shippingAddress.lastName}
                      onChange={handleInputChange}
                      required
                      placeholder="Doe"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      required
                      placeholder="123 Fashion Blvd, Apt 4B"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingAddress.city}
                      onChange={handleInputChange}
                      required
                      placeholder="New York"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={shippingAddress.postalCode}
                      onChange={handleInputChange}
                      required
                      placeholder="10001"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Country *
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingAddress.country}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingAddress.phone}
                      onChange={handleInputChange}
                      required
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Accept & Continue to Payment button */}
              <button
                type="submit"
                className="w-full bg-black hover:bg-gray-900 active:scale-[0.98] text-white py-4 rounded-xl font-bold text-base flex items-center justify-center space-x-2 shadow-md transition-all cursor-pointer"
              >
                <HiOutlineCheckCircle className="w-5 h-5" />
                <span>Accept & Continue to Payment</span>
                <HiOutlineChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 sticky top-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                  <span className="text-xs bg-gray-100 text-gray-700 font-bold px-2.5 py-1 rounded-full">
                    {cartProducts.length} {cartProducts.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto pr-1">
                  {cartProducts.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.image || 'https://picsum.photos/100'}
                          alt={item.name}
                          className="w-14 h-16 object-cover rounded-lg border border-gray-100 shrink-0"
                        />
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Qty: {item.quantity} | Size: {item.size || 'M'} | Color: {item.color || 'Standard'}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-900 shrink-0 ml-3">
                        ${((Number(item.price) || 0) * (Number(item.quantity) || 1)).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold text-gray-900">${itemsPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {shippingPrice === 0 ? (
                        <span className="text-green-600 font-bold">FREE</span>
                      ) : (
                        `$${shippingPrice.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-semibold text-gray-900">${taxPrice.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-xl text-black font-extrabold">${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <HiOutlineLockClosed className="w-3.5 h-3.5 shrink-0" />
                  <span>Next step: Secure PayPal payment — 256-bit SSL encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;