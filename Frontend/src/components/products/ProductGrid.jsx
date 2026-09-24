import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../Redux/slices/cartsSlice';
import { toast } from 'sonner';
import { HiOutlineShoppingBag, HiCheck } from 'react-icons/hi2';

const defaultProducts = [
  {
    _id: '1',
    name: 'Stylish Jacket',
    price: 120,
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Blue'],
    images: [
      {
        url: 'https://picsum.photos/500/500?random=1',
        altText: 'Stylish Jacket',
      },
    ],
  },
  {
    _id: '2',
    name: 'Casual Denim Shirt',
    price: 65,
    sizes: ['M', 'L', 'XL'],
    colors: ['Blue'],
    images: [
      {
        url: 'https://picsum.photos/500/500?random=2',
        altText: 'Casual Denim Shirt',
      },
    ],
  },
  {
    _id: '3',
    name: 'Printed Summer Dress',
    price: 90,
    sizes: ['XS', 'S', 'M'],
    colors: ['Floral', 'Pink'],
    images: [
      {
        url: 'https://picsum.photos/500/500?random=3',
        altText: 'Printed Summer Dress',
      },
    ],
  },
  {
    _id: '4',
    name: 'Classic Trench Coat',
    price: 180,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Beige'],
    images: [
      {
        url: 'https://picsum.photos/500/500?random=4',
        altText: 'Classic Trench Coat',
      },
    ],
  },
];

const ProductGrid = ({ products }) => {
  const dispatch = useDispatch();
  const { userToken, guestId } = useSelector((state) => state.auth);
  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const displayProducts = products !== undefined ? products : defaultProducts;

  const handleQuickAdd = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();

    const productId = product._id || product.id || `prod_${Date.now()}`;
    const selectedSize = (product.sizes && product.sizes.length > 0) ? product.sizes[0] : 'M';
    const selectedColor = (product.colors && product.colors.length > 0) ? product.colors[0] : 'Standard';
    const price = product.discountPrice || product.price || 50;
    const image = product.images?.[0]?.url || 'https://picsum.photos/500/500';

    setAddingId(productId);

    try {
      await dispatch(
        addToCart({
          productId,
          name: product.name,
          price: Number(price),
          image,
          quantity: 1,
          size: selectedSize,
          color: selectedColor,
          guestId: userToken ? undefined : guestId,
        })
      );

      toast.success(`"${product.name}" added to cart!`);
      setAddedId(productId);
      setTimeout(() => setAddedId(null), 2000);
    } catch (err) {
      console.error('Error adding to cart:', err);
      toast.error('Failed to add product to cart.');
    } finally {
      setAddingId(null);
    }
  };

  if (displayProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
        <p className="text-lg font-semibold text-gray-800 mb-1">No products found</p>
        <p className="text-sm text-gray-500 max-w-md">
          We couldn't find any products matching your current filters. Try changing or clearing some filters to see more results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayProducts.map((product) => {
        const isAdding = addingId === product._id;
        const isAdded = addedId === product._id;

        return (
          <div
            key={product._id}
            className="group relative flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-xs hover:shadow-md transition-all duration-300"
          >
            {/* Clickable Image Container */}
            <Link
              to={`/product/${product._id}`}
              className="block relative w-full h-80 rounded-xl overflow-hidden bg-gray-100 mb-3"
            >
              <img
                src={product.images?.[0]?.url || 'https://picsum.photos/500/500'}
                alt={product.images?.[0]?.altText || product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Quick Add Overlay on Hover (Desktop) */}
              <div className="absolute inset-x-3 bottom-3 hidden lg:flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(e, product)}
                  disabled={isAdding}
                  className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wider uppercase flex items-center justify-center space-x-2 shadow-lg backdrop-blur-md transition-all duration-200 cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black/90 hover:bg-black text-white hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <HiCheck className="w-4 h-4" />
                      <span>Added to Bag</span>
                    </>
                  ) : isAdding ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <HiOutlineShoppingBag className="w-4 h-4" />
                      <span>Quick Add</span>
                    </>
                  )}
                </button>
              </div>
            </Link>

            {/* Product Meta */}
            <div className="flex-1 flex flex-col justify-between pt-1">
              <div>
                <Link to={`/product/${product._id}`}>
                  <h3 className="text-sm font-semibold text-gray-800 hover:text-black line-clamp-1 transition">
                    {product.name}
                  </h3>
                </Link>
                {product.category && (
                  <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>
                )}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-900 font-extrabold text-base">
                    ${(product.discountPrice || product.price || 0).toFixed ? (product.discountPrice || product.price || 0).toFixed(2) : (product.discountPrice || product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-xs text-gray-400 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Mobile / Always-visible Add to Cart Button */}
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(e, product)}
                  disabled={isAdding}
                  title="Add to Cart"
                  className={`lg:hidden px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-black text-white hover:bg-gray-800'
                  }`}
                >
                  {isAdded ? (
                    <HiCheck className="w-3.5 h-3.5" />
                  ) : isAdding ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <HiOutlineShoppingBag className="w-3.5 h-3.5" />
                  )}
                  <span>{isAdded ? 'Added' : 'Add'}</span>
                </button>
              </div>

              {/* Desktop inline Add to Cart secondary button */}
              <button
                type="button"
                onClick={(e) => handleQuickAdd(e, product)}
                disabled={isAdding}
                className={`mt-3 w-full hidden sm:flex lg:hidden py-2 px-3 rounded-lg text-xs font-bold items-center justify-center space-x-1.5 border transition cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-gray-50 hover:bg-black hover:text-white border-gray-200 text-gray-800'
                }`}
              >
                {isAdded ? (
                  <>
                    <HiCheck className="w-3.5 h-3.5" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <HiOutlineShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ProductGrid;