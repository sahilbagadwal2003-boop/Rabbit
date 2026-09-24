import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateCartItemQuantity, removeFromCart } from '../../Redux/slices/cartsSlice';
import { RiDeleteBin3Line } from 'react-icons/ri';

const Cartcontent = () => {
  const dispatch = useDispatch();
  const { cart, loading } = useSelector((state) => state.cart);
  const { guestId, userToken } = useSelector((state) => state.auth);

  const cartProducts = cart?.products || [];

  const handleQuantityChange = (item, delta) => {
    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      dispatch(
        removeFromCart({
          productId: item.productId,
          size: item.size,
          color: item.color,
          guestId: userToken ? undefined : guestId,
        })
      );
    } else {
      dispatch(
        updateCartItemQuantity({
          productId: item.productId,
          quantity: newQty,
          size: item.size,
          color: item.color,
          guestId: userToken ? undefined : guestId,
        })
      );
    }
  };

  const handleRemove = (item) => {
    dispatch(
      removeFromCart({
        productId: item.productId,
        size: item.size,
        color: item.color,
        guestId: userToken ? undefined : guestId,
      })
    );
  };

  if (cartProducts.length === 0) {
    return (
      <div className="py-12 text-center text-gray-500">
        <p className="text-base font-medium">Your cart is empty.</p>
        <p className="text-xs text-gray-400 mt-1">Add items from the store to see them here.</p>
      </div>
    );
  }

  return (
    <div>
      {cartProducts.map((product, index) => (
        <div
          key={`${product.productId}-${product.size}-${product.color}-${index}`}
          className="flex items-start justify-between py-4 border-b border-gray-100"
        >
          <div className="flex items-start">
            <img
              src={product.image || 'https://picsum.photos/100'}
              alt={product.name}
              className="w-16 h-20 object-cover mr-3 rounded-lg border border-gray-100 shrink-0"
            />
            <div>
              <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">{product.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Size: <span className="font-medium text-gray-700">{product.size}</span> | Color:{' '}
                <span className="font-medium text-gray-700">{product.color}</span>
              </p>
              <div className="flex items-center mt-2">
                <button
                  onClick={() => handleQuantityChange(product, -1)}
                  className="border border-gray-300 rounded-md w-6 h-6 flex items-center justify-center text-xs font-semibold hover:bg-gray-100 transition"
                >
                  -
                </button>
                <span className="mx-3 text-xs font-semibold text-gray-800">{product.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(product, 1)}
                  className="border border-gray-300 rounded-md w-6 h-6 flex items-center justify-center text-xs font-semibold hover:bg-gray-100 transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0 ml-2">
            <p className="font-bold text-gray-900 text-sm">
              ${((product.price || 0) * product.quantity).toFixed(2)}
            </p>
            <button
              onClick={() => handleRemove(product)}
              className="text-red-500 hover:text-red-700 mt-2 p-1 hover:bg-red-50 rounded transition"
              title="Remove item"
            >
              <RiDeleteBin3Line className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Cartcontent;