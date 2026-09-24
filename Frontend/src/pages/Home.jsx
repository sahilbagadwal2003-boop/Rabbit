import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../Redux/slices/productSlice';
import Hero from '../components/layout/Hero';
import Gendercollection from '../components/products/Gendercollection';
import Newarrivals from '../components/products/Newarrivals';
import ProductDetails from '../components/products/productdetails';
import featuredImage from '../assets/featured.webp';
import { HiOutlineShoppingBag, HiOutlineArrowPath, HiOutlineShieldCheck } from 'react-icons/hi2';
import ProductGrid from '../components/products/ProductGrid';

const placeholderProducts = [
  {
    _id: '1',
    name: 'Classic White Tee',
    price: 35,
    images: [{ url: 'https://picsum.photos/500/500?random=11', altText: 'Classic White Tee' }],
  },
  {
    _id: '2',
    name: 'Floral Print Blouse',
    price: 55,
    images: [{ url: 'https://picsum.photos/500/500?random=12', altText: 'Floral Print Blouse' }],
  },
  {
    _id: '3',
    name: 'Oversized Knit Cardigan',
    price: 75,
    images: [{ url: 'https://picsum.photos/500/500?random=13', altText: 'Oversized Knit Cardigan' }],
  },
  {
    _id: '4',
    name: 'Sleeveless Summer Top',
    price: 40,
    images: [{ url: 'https://picsum.photos/500/500?random=14', altText: 'Sleeveless Summer Top' }],
  },
  {
    _id: '5',
    name: 'Striped Cotton Shirt',
    price: 60,
    images: [{ url: 'https://picsum.photos/500/500?random=15', altText: 'Striped Cotton Shirt' }],
  },
  {
    _id: '6',
    name: 'Casual V-Neck Sweater',
    price: 70,
    images: [{ url: 'https://picsum.photos/500/500?random=16', altText: 'Casual V-Neck Sweater' }],
  },
  {
    _id: '7',
    name: 'Boho Embroidered Top',
    price: 65,
    images: [{ url: 'https://picsum.photos/500/500?random=17', altText: 'Boho Embroidered Top' }],
  },
  {
    _id: '8',
    name: 'Linen Button-Down',
    price: 80,
    images: [{ url: 'https://picsum.photos/500/500?random=18', altText: 'Linen Button-Down' }],
  },
];

const Home = () => {
  const dispatch = useDispatch();
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProductsByFilters({ limit: 8 }));
  }, [dispatch]);

  const displayProducts = products && products.length > 0 ? products : placeholderProducts;

  return (
    <div>
      {/* Hero Section */}
      <Hero />

      {/* Gender Collections */}
      <Gendercollection />

      {/* New Arrivals Carousel */}
      <Newarrivals />

      {/* Best Seller Section */}
      <section className="py-12 bg-gray-50">
        <h2 className="text-3xl text-center font-bold mb-4 tracking-tight">
          BEST SELLER
        </h2>
        <p className="text-center text-gray-500 mb-8 max-w-xl mx-auto px-4">
          Our most loved piece of the season. Handpicked for its timeless style, versatility, and everyday comfort.
        </p>
        <ProductDetails productId={products && products[0] ? products[0]._id : undefined} />
      </section>

      {/* Top Wears for Women / Featured Products */}
      <section className="py-16 px-4 lg:px-0 container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Top Trending Collection
        </h2>
        <p className="text-center text-gray-600 mb-10 max-w-xl mx-auto">
          Explore the best selling tops, bottoms, and outerwear handpicked for effortless daily looks.
        </p>
        <ProductGrid products={displayProducts} />
      </section>

      {/* Featured Collection Banner */}
      <section className="py-16 px-4 lg:px-0">
        <div className="container mx-auto flex flex-col-reverse lg:flex-row items-center bg-green-50 rounded-3xl overflow-hidden">
          {/* Left Content */}
          <div className="lg:w-1/2 p-8 lg:p-16 text-center lg:text-left">
            <h4 className="text-sm uppercase font-semibold text-gray-500 tracking-wider mb-2">
              Comfort and Style
            </h4>
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Apparel made for your everyday life
            </h2>
            <p className="text-gray-600 mb-8 text-base lg:text-lg">
              Discover high-quality, comfortable clothing that effortlessly blends fashion with function. Designed to keep you looking and feeling your best.
            </p>
            <Link
              to="/collections/all"
              className="inline-block bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Shop Collection
            </Link>
          </div>

          {/* Right Image */}
          <div className="lg:w-1/2 w-full">
            <img
              src={featuredImage}
              alt="Featured Collection"
              className="w-full h-[400px] lg:h-[550px] object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-gray-200">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 text-center">
          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <HiOutlineShoppingBag className="w-8 h-8 text-gray-800" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2 uppercase">
              Free International Shipping
            </h3>
            <p className="text-gray-500 text-sm">
              On all orders over $50.00
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <HiOutlineArrowPath className="w-8 h-8 text-gray-800" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2 uppercase">
              45 Days Return
            </h3>
            <p className="text-gray-500 text-sm">
              Money back guarantee
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="p-4 bg-gray-100 rounded-full mb-4">
              <HiOutlineShieldCheck className="w-8 h-8 text-gray-800" />
            </div>
            <h3 className="font-semibold text-lg text-gray-900 mb-2 uppercase">
              Secure Checkout
            </h3>
            <p className="text-gray-500 text-sm">
              100% secured checkout process
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
