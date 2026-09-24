import React, { useEffect, useRef, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../Redux/slices/cartsSlice';
import { toast } from 'sonner';
import { HiOutlineShoppingBag, HiCheck } from 'react-icons/hi2';

const fallbackArrivals = [
  {
    _id: '1',
    name: 'Stylish Jacket',
    price: 120,
    sizes: ['S', 'M', 'L'],
    colors: ['Black'],
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
    sizes: ['M', 'L'],
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
    sizes: ['S', 'M'],
    colors: ['Pink'],
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
    sizes: ['M', 'L', 'XL'],
    colors: ['Beige'],
    images: [
      {
        url: 'https://picsum.photos/500/500?random=4',
        altText: 'Classic Trench Coat',
      },
    ],
  },
  {
    _id: '5',
    name: 'Oversized Hoodie',
    price: 75,
    sizes: ['S', 'M', 'L'],
    colors: ['Grey'],
    images: [
      {
        url: 'https://picsum.photos/500/500?random=5',
        altText: 'Oversized Hoodie',
      },
    ],
  },
  {
    _id: '6',
    name: 'Slim Fit Chinos',
    price: 55,
    sizes: ['30', '32', '34'],
    colors: ['Khaki'],
    images: [
      {
        url: 'https://picsum.photos/500/500?random=6',
        altText: 'Slim Fit Chinos',
      },
    ],
  },
  {
    _id: '7',
    name: 'Ribbed Knit Sweater',
    price: 85,
    sizes: ['S', 'M'],
    colors: ['Cream'],
    images: [
      {
        url: 'https://picsum.photos/500/500?random=7',
        altText: 'Ribbed Knit Sweater',
      },
    ],
  },
  {
    _id: '8',
    name: 'Cargo Joggers',
    price: 70,
    sizes: ['M', 'L'],
    colors: ['Olive'],
    images: [
      {
        url: 'https://picsum.photos/500/500?random=8',
        altText: 'Cargo Joggers',
      },
    ],
  },
];

const Newarrivals = () => {
  const scrollRef = useRef(null);
  const dispatch = useDispatch();
  const { products: storeProducts } = useSelector((state) => state.products);
  const { userToken, guestId } = useSelector((state) => state.auth);

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const [addingId, setAddingId] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const newArrivals = (storeProducts && storeProducts.length > 0) ? storeProducts.slice(0, 8) : fallbackArrivals;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const scroll = (direction) => {
    const scrollAmount = direction === 'left' ? -320 : 320;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const updateScrollButtons = () => {
    const container = scrollRef.current;
    if (container) {
      const leftScroll = container.scrollLeft;
      const rightScrollable =
        container.scrollWidth > leftScroll + container.clientWidth + 5;
      setCanScrollLeft(leftScroll > 5);
      setCanScrollRight(rightScrollable);
    }
  };

  const handleAddToCart = async (e, product) => {
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
      toast.error('Could not add to cart.');
    } finally {
      setAddingId(null);
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollButtons);
      updateScrollButtons();
      return () => container.removeEventListener('scroll', updateScrollButtons);
    }
  }, []);

  return (
    <section className="py-16 px-4 lg:px-0">
      <div className="container mx-auto text-center mb-10 relative">
        <h2 className="text-3xl font-bold mb-4">Explore New Arrivals</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover the latest styles straight off the runway, freshly added to
          keep your wardrobe on the cutting edge of fashion.
        </p>

        {/* Scroll Buttons */}
        <div className="absolute right-0 bottom-[-30px] flex space-x-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous"
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              canScrollLeft
                ? 'bg-white text-black hover:bg-gray-100 shadow-xs'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Next"
            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
              canScrollRight
                ? 'bg-white text-black hover:bg-gray-100 shadow-xs'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'
            }`}
          >
            <FiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      {/* Scrollable Products List */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        className={`container mx-auto flex space-x-6 overflow-x-auto scrollbar-none cursor-grab ${
          isDragging ? 'cursor-grabbing select-none' : ''
        }`}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {newArrivals.map((product) => {
          const isAdding = addingId === product._id;
          const isAdded = addedId === product._id;

          return (
            <div
              key={product._id}
              className="min-w-[100%] sm:min-w-[50%] lg:min-w-[30%] relative rounded-2xl overflow-hidden group shadow-sm bg-gray-100 shrink-0"
            >
              <img
                src={product.images?.[0]?.url || 'https://picsum.photos/500/500'}
                alt={product.images?.[0]?.altText || product.name}
                className="w-full h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
                draggable="false"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-5 text-white">
                <div className="flex items-end justify-between">
                  <Link to={`/product/${product._id}`} className="block flex-1 pr-3">
                    <h4 className="font-semibold text-lg line-clamp-1">{product.name}</h4>
                    <p className="mt-1 font-bold text-white text-base">
                      ${(product.discountPrice || product.price || 0).toFixed ? (product.discountPrice || product.price || 0).toFixed(2) : (product.discountPrice || product.price)}
                    </p>
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={isAdding}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5 shadow-md transition-all active:scale-95 cursor-pointer ${
                      isAdded
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white text-black hover:bg-gray-100'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <HiCheck className="w-4 h-4 text-white" />
                        <span>Added</span>
                      </>
                    ) : isAdding ? (
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <HiOutlineShoppingBag className="w-4 h-4" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Newarrivals;
