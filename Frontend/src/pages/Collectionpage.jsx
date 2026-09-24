import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductsByFilters } from '../Redux/slices/productSlice';
import { FaFilter } from 'react-icons/fa';
import { HiXMark } from 'react-icons/hi2';
import FilterSidebar from '../components/products/FilterSidebar';
import SortOptions from '../components/products/SortOptions';
import ProductGrid from '../components/products/ProductGrid';

const ALL_PRODUCTS = [
  {
    _id: '1',
    name: 'Classic White Tee',
    price: 35,
    gender: 'Men',
    category: 'Top Wear',
    color: 'White',
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Organic Cotton',
    brand: 'Urban Threads',
    popularity: 95,
    createdAt: '2026-03-01',
    images: [{ url: 'https://picsum.photos/500/500?random=11', altText: 'Classic White Tee' }],
    description: 'A timeless staple made from 100% certified organic cotton.',
  },
  {
    _id: '2',
    name: 'Floral Print Blouse',
    price: 55,
    gender: 'Women',
    category: 'Top Wear',
    color: 'Pink',
    sizes: ['XS', 'S', 'M', 'L'],
    material: 'French Linen',
    brand: 'ChicStyle',
    popularity: 88,
    createdAt: '2026-03-05',
    images: [{ url: 'https://picsum.photos/500/500?random=12', altText: 'Floral Print Blouse' }],
    description: 'Charming floral blouse designed for comfortable all-day wear.',
  },
  {
    _id: '3',
    name: 'Oversized Knit Cardigan',
    price: 75,
    gender: 'Women',
    category: 'Top Wear',
    color: 'Beige',
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Wool Blend',
    brand: 'Modern Fit',
    popularity: 92,
    createdAt: '2026-02-20',
    images: [{ url: 'https://picsum.photos/500/500?random=13', altText: 'Oversized Knit Cardigan' }],
    description: 'Cozy and relaxed fit cardigan knitted with premium soft yarn.',
  },
  {
    _id: '4',
    name: 'Sleeveless Summer Top',
    price: 40,
    gender: 'Women',
    category: 'Top Wear',
    color: 'Yellow',
    sizes: ['XS', 'S', 'M'],
    material: 'Organic Cotton',
    brand: 'Beach Breeze',
    popularity: 80,
    createdAt: '2026-03-10',
    images: [{ url: 'https://picsum.photos/500/500?random=14', altText: 'Sleeveless Summer Top' }],
    description: 'Lightweight and breathable top ideal for sunny getaways.',
  },
  {
    _id: '5',
    name: 'Striped Cotton Shirt',
    price: 60,
    gender: 'Men',
    category: 'Top Wear',
    color: 'Blue',
    sizes: ['M', 'L', 'XL', 'XXL'],
    material: 'Organic Cotton',
    brand: 'Street Style',
    popularity: 85,
    createdAt: '2026-02-15',
    images: [{ url: 'https://picsum.photos/500/500?random=15', altText: 'Striped Cotton Shirt' }],
    description: 'Crisp button-down shirt with modern vertical stripe detailing.',
  },
  {
    _id: '6',
    name: 'Casual V-Neck Sweater',
    price: 70,
    gender: 'Men',
    category: 'Top Wear',
    color: 'Navy',
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Wool Blend',
    brand: 'Urban Threads',
    popularity: 90,
    createdAt: '2026-01-25',
    images: [{ url: 'https://picsum.photos/500/500?random=16', altText: 'Casual V-Neck Sweater' }],
    description: 'Classic V-neck sweater crafted from lightweight, warm wool blend.',
  },
  {
    _id: '7',
    name: 'Boho Embroidered Top',
    price: 65,
    gender: 'Women',
    category: 'Top Wear',
    color: 'Red',
    sizes: ['S', 'M', 'L'],
    material: 'French Linen',
    brand: 'ChicStyle',
    popularity: 78,
    createdAt: '2026-03-08',
    images: [{ url: 'https://picsum.photos/500/500?random=17', altText: 'Boho Embroidered Top' }],
    description: 'Bohemian inspired embroidered top with intricate neckline detail.',
  },
  {
    _id: '8',
    name: 'Linen Button-Down',
    price: 80,
    gender: 'Men',
    category: 'Top Wear',
    color: 'White',
    sizes: ['M', 'L', 'XL'],
    material: 'French Linen',
    brand: 'Beach Breeze',
    popularity: 94,
    createdAt: '2026-03-12',
    images: [{ url: 'https://picsum.photos/500/500?random=18', altText: 'Linen Button-Down' }],
    description: 'Airy pure linen button-down shirt for effortless relaxed style.',
  },
  {
    _id: '9',
    name: 'Slim Fit Denim Jeans',
    price: 95,
    gender: 'Men',
    category: 'Bottom Wear',
    color: 'Blue',
    sizes: ['S', 'M', 'L', 'XL'],
    material: 'Cotton Denim',
    brand: 'Street Style',
    popularity: 97,
    createdAt: '2026-02-10',
    images: [{ url: 'https://picsum.photos/500/500?random=19', altText: 'Slim Fit Denim Jeans' }],
    description: 'Durable stretch denim jeans with a modern tailored slim cut.',
  },
  {
    _id: '10',
    name: 'High-Waist Wide Leg Trousers',
    price: 85,
    gender: 'Women',
    category: 'Bottom Wear',
    color: 'Black',
    sizes: ['XS', 'S', 'M', 'L'],
    material: 'Polyester',
    brand: 'Modern Fit',
    popularity: 91,
    createdAt: '2026-03-02',
    images: [{ url: 'https://picsum.photos/500/500?random=20', altText: 'High-Waist Wide Leg Trousers' }],
    description: 'Elegant wide-leg trousers that elongate and flatter your silhouette.',
  },
  {
    _id: '11',
    name: 'Relaxed Cargo Pants',
    price: 70,
    gender: 'Men',
    category: 'Bottom Wear',
    color: 'Green',
    sizes: ['M', 'L', 'XL', 'XXL'],
    material: 'Organic Cotton',
    brand: 'Urban Threads',
    popularity: 89,
    createdAt: '2026-02-28',
    images: [{ url: 'https://picsum.photos/500/500?random=21', altText: 'Relaxed Cargo Pants' }],
    description: 'Functional multi-pocket utility cargo pants with adjustable ankles.',
  },
  {
    _id: '12',
    name: 'Pleated Midi Skirt',
    price: 65,
    gender: 'Women',
    category: 'Bottom Wear',
    color: 'Beige',
    sizes: ['XS', 'S', 'M', 'L'],
    material: 'Polyester',
    brand: 'ChicStyle',
    popularity: 86,
    createdAt: '2026-03-04',
    images: [{ url: 'https://picsum.photos/500/500?random=22', altText: 'Pleated Midi Skirt' }],
    description: 'Flowing accordion pleats with a comfortable elastic waistband.',
  },
];

const Collectionpage = () => {
  const { collection } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Extract filter parameters from URL
  const genderParam = searchParams.get('gender') || (collection === 'men' ? 'Men' : collection === 'women' ? 'Women' : '');
  const categoryParam = searchParams.get('category') || (collection === 'top-wear' ? 'Top Wear' : collection === 'bottom-wear' ? 'Bottom Wear' : '');
  const colorParam = searchParams.get('color') || '';
  const sizeParam = searchParams.get('size') || '';
  const materialParam = searchParams.get('material') || '';
  const brandParam = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : 0;
  const maxPriceParam = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : 250;
  const sortByParam = searchParams.get('sortBy') || 'popular';
  const searchParam = searchParams.get('search') || '';

  const filters = {
    gender: genderParam,
    category: categoryParam,
    color: colorParam,
    size: sizeParam,
    material: materialParam,
    brand: brandParam,
    minPrice: minPriceParam,
    maxPrice: maxPriceParam,
  };

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === '' || value === null || value === undefined || value === 'All') {
      newParams.delete(key);
    } else {
      newParams.set(key, value.toString());
    }
    setSearchParams(newParams);
  };

  const handleResetFilters = () => {
    setSearchParams({});
  };

  const handleSortChange = (newSort) => {
    handleFilterChange('sortBy', newSort === 'popular' ? '' : newSort);
  };

  const dispatch = useDispatch();
  const { products: reduxProducts, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(
      fetchProductsByFilters({
        gender: genderParam === 'All' ? '' : genderParam,
        category: categoryParam === 'All' ? '' : categoryParam,
        color: colorParam,
        size: sizeParam,
        brand: brandParam,
        minPrice: minPriceParam || '',
        maxPrice: maxPriceParam || '',
        sortBy: sortByParam,
        search: searchParam,
      })
    );
  }, [
    dispatch,
    genderParam,
    categoryParam,
    colorParam,
    sizeParam,
    brandParam,
    minPriceParam,
    maxPriceParam,
    sortByParam,
    searchParam,
  ]);

  // Filter and sort products based on active params (merging API products and catalog)
  const products = useMemo(() => {
    const sourceProducts = reduxProducts && reduxProducts.length > 0 ? reduxProducts : ALL_PRODUCTS;
    return sourceProducts.filter((product) => {
      // Gender filter
      if (genderParam && genderParam !== 'All') {
        if (!product.gender || product.gender.toLowerCase() !== genderParam.toLowerCase()) {
          return false;
        }
      }

      // Category filter
      if (categoryParam && categoryParam !== 'All') {
        if (product.category.toLowerCase() !== categoryParam.toLowerCase()) {
          return false;
        }
      }

      // Color filter
      if (colorParam) {
        if (product.color.toLowerCase() !== colorParam.toLowerCase()) {
          return false;
        }
      }

      // Size filter
      if (sizeParam) {
        if (!product.sizes.includes(sizeParam)) {
          return false;
        }
      }

      // Material filter
      if (materialParam && materialParam !== 'All') {
        if (product.material.toLowerCase() !== materialParam.toLowerCase()) {
          return false;
        }
      }

      // Brand filter (supports comma-separated multi-brand)
      if (brandParam) {
        const selectedBrands = brandParam.split(',').map((b) => b.trim().toLowerCase());
        if (!selectedBrands.includes(product.brand.toLowerCase())) {
          return false;
        }
      }

      // Price filter
      if (product.price < minPriceParam || product.price > maxPriceParam) {
        return false;
      }

      // Search query filter
      if (searchParam) {
        const query = searchParam.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesBrand = product.brand.toLowerCase().includes(query);
        const matchesCategory = product.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesBrand && !matchesCategory) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortByParam === 'price-low') return a.price - b.price;
      if (sortByParam === 'price-high') return b.price - a.price;
      if (sortByParam === 'name-asc') return a.name.localeCompare(b.name);
      if (sortByParam === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      return (b.popularity || 0) - (a.popularity || 0);
    });
  }, [
    genderParam,
    categoryParam,
    colorParam,
    sizeParam,
    materialParam,
    brandParam,
    minPriceParam,
    maxPriceParam,
    searchParam,
    sortByParam,
  ]);

  // Compute page heading title
  const getPageTitle = () => {
    if (searchParam) {
      return `Search Results for "${searchParam}"`;
    }
    if (collection === 'men' || genderParam === 'Men') {
      return "Men's Collection";
    }
    if (collection === 'women' || genderParam === 'Women') {
      return "Women's Collection";
    }
    if (collection === 'top-wear' || categoryParam === 'Top Wear') {
      return 'Top Wear Collection';
    }
    if (collection === 'bottom-wear' || categoryParam === 'Bottom Wear') {
      return 'Bottom Wear Collection';
    }
    if (collection && collection !== 'all') {
      return `${collection.charAt(0).toUpperCase() + collection.slice(1)} Collection`;
    }
    return 'All Products';
  };

  // Active filter count for mobile badge
  const activeFiltersCount = [
    genderParam,
    categoryParam,
    colorParam,
    sizeParam,
    materialParam,
    brandParam,
    maxPriceParam < 250 ? maxPriceParam : null,
    searchParam,
  ].filter(Boolean).length;

  return (
    <div className="container mx-auto p-4 sm:p-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-gray-900">
            {getPageTitle()}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mobile Filter Trigger Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden border border-gray-300 rounded-lg py-2 px-3.5 flex items-center gap-2 text-sm font-medium hover:bg-gray-50 shadow-sm"
          >
            <FaFilter className="text-gray-600 text-xs" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="bg-black text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort Options Component */}
          <SortOptions sortBy={sortByParam} onSortChange={handleSortChange} />
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs font-semibold text-gray-500 uppercase">Active Filters:</span>
          {genderParam && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Gender: {genderParam}
              <button onClick={() => handleFilterChange('gender', '')} className="hover:text-black">
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {categoryParam && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Category: {categoryParam}
              <button onClick={() => handleFilterChange('category', '')} className="hover:text-black">
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {colorParam && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Color: {colorParam}
              <button onClick={() => handleFilterChange('color', '')} className="hover:text-black">
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {sizeParam && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Size: {sizeParam}
              <button onClick={() => handleFilterChange('size', '')} className="hover:text-black">
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {materialParam && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Material: {materialParam}
              <button onClick={() => handleFilterChange('material', '')} className="hover:text-black">
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {brandParam && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Brand: {brandParam}
              <button onClick={() => handleFilterChange('brand', '')} className="hover:text-black">
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {maxPriceParam < 250 && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Max Price: ${maxPriceParam}
              <button onClick={() => handleFilterChange('maxPrice', '')} className="hover:text-black">
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {searchParam && (
            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-full">
              Search: {searchParam}
              <button onClick={() => handleFilterChange('search', '')} className="hover:text-black">
                <HiXMark className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={handleResetFilters}
            className="text-xs text-red-600 hover:text-red-800 font-semibold underline ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar / Mobile Drawer */}
        <div className="hidden lg:block w-64 shrink-0">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Mobile Filter Drawer */}
        <div className="lg:hidden">
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            isMobileModalOpen={isSidebarOpen}
            closeMobileModal={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Products Grid Area */}
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} />
        </div>
      </div>
    </div>
  );
};

export default Collectionpage;