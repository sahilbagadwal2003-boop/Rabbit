import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductDetails, fetchSimilarProducts } from '../../Redux/slices/productSlice';
import { addToCart } from '../../Redux/slices/cartsSlice';
import { toast } from 'sonner';
import ProductGrid from './ProductGrid';

const fallbackProduct = {
  name: 'Stylish Jacket',
  price: 120,
  originalPrice: 150,
  description:
    'This is a stylish jacket perfect for any occasion. Crafted with high quality materials for a refined look and comfortable everyday wear.',
  brand: 'FashionBrand',
  material: '100% Cotton Blend',
  sizes: ['S', 'M', 'L', 'XL'],
  colors: ['Red', 'Black'],
  images: [
    {
      url: 'https://picsum.photos/500/500?random=1',
      altText: 'Stylish Jacket 1',
    },
    {
      url: 'https://picsum.photos/500/500?random=2',
      altText: 'Stylish Jacket 2',
    },
  ],
};

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const currentProductId = productId || id;

  const { selectedProduct, similarProducts, loading } = useSelector((state) => state.products);
  const { guestId, userToken } = useSelector((state) => state.auth);

  const product = selectedProduct || fallbackProduct;

  const [mainImage, setMainImage] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    if (currentProductId) {
      dispatch(fetchProductDetails(currentProductId));
    }
  }, [dispatch, currentProductId]);

  useEffect(() => {
    if (product?.images?.length > 0) {
      setMainImage(product.images[0].url);
    }
    if (product?.sizes?.length > 0) {
      setSelectedSize(product.sizes[0]);
    }
    if (product?.colors?.length > 0) {
      setSelectedColor(product.colors[0]);
    }
    if (product?.category) {
      dispatch(
        fetchSimilarProducts({
          category: product.category,
          currentId: product._id,
        })
      );
    }
  }, [product, dispatch]);

  const handleQuantityChange = (action) => {
    if (action === 'plus') setQuantity((prev) => prev + 1);
    if (action === 'minus' && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select a size and color before adding to cart.');
      return;
    }

    setIsButtonDisabled(true);

    try {
      await dispatch(
        addToCart({
          productId: product._id || currentProductId || 'mock_1',
          name: product.name || 'Stylish Jacket',
          image: mainImage || (product.images && product.images[0]?.url) || 'https://picsum.photos/500/500?random=1',
          price: product.discountPrice || product.price || 120,
          quantity,
          size: selectedSize || 'M',
          color: selectedColor || 'Standard',
          guestId: userToken ? undefined : guestId,
        })
      );

      toast.success('Product added to cart successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Could not add to cart. Please try again.');
    } finally {
      setIsButtonDisabled(false);
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm">
        {/* Main Product Layout */}
        <div className="flex flex-col md:flex-row">
          {/* Left Thumbnails (Desktop) */}
          <div className="hidden md:flex flex-col space-y-3 mr-6">
            {product.images &&
              product.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index}`}
                  onClick={() => setMainImage(image.url)}
                  className={`w-16 h-20 object-cover rounded-lg cursor-pointer border-2 transition-all ${
                    mainImage === image.url ? 'border-black' : 'border-gray-200 hover:border-gray-400'
                  }`}
                />
              ))}
          </div>

          {/* Main Image */}
          <div className="md:w-1/2">
            <div className="mb-4">
              <img
                src={mainImage || product.images?.[0]?.url || 'https://picsum.photos/500'}
                alt={product.name}
                className="w-full h-[450px] object-cover rounded-xl border border-gray-100 shadow-sm"
              />
            </div>
            {/* Mobile Thumbnails */}
            <div className="md:hidden flex space-x-3 mb-4 overflow-x-auto pb-2">
              {product.images &&
                product.images.map((image, index) => (
                  <img
                    key={index}
                    src={image.url}
                    alt={image.altText || `Thumbnail ${index}`}
                    onClick={() => setMainImage(image.url)}
                    className={`w-16 h-20 object-cover rounded-lg cursor-pointer border-2 shrink-0 ${
                      mainImage === image.url ? 'border-black' : 'border-gray-200'
                    }`}
                  />
                ))}
            </div>
          </div>

          {/* Right Side - Product Details */}
          <div className="md:w-1/2 md:ml-10 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase font-bold text-gray-400 tracking-wider">
                {product.brand || 'Rabbit Exclusive'}
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center space-x-3 mb-4">
                <p className="text-2xl text-gray-900 font-extrabold">
                  ${product.price?.toFixed ? product.price.toFixed(2) : product.price}
                </p>
                {product.discountPrice && (
                  <p className="text-base text-gray-400 line-through">
                    ${product.discountPrice.toFixed(2)}
                  </p>
                )}
              </div>

              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {product.description}
              </p>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="mb-5">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Color: <span className="text-black font-semibold">{selectedColor}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setSelectedColor(color)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition ${
                          selectedColor === color
                            ? 'border-black bg-black text-white'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Size: <span className="text-black font-semibold">{selectedSize}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-3.5 py-2 rounded-lg border text-xs font-semibold transition ${
                          selectedSize === size
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Quantity:</p>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange('minus')}
                    className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    -
                  </button>
                  <span className="text-base font-bold text-gray-900 w-8 text-center">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange('plus')}
                    className="w-9 h-9 border border-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 hover:bg-gray-100 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isButtonDisabled}
                className="w-full bg-black text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-gray-800 transition duration-300 disabled:opacity-50 shadow-sm"
              >
                {isButtonDisabled ? 'Adding to Cart...' : 'Add to Cart'}
              </button>
            </div>

            {/* Characteristics */}
            <div className="mt-8 border-t border-gray-100 pt-4 text-xs text-gray-600 space-y-1">
              {product.material && (
                <p>
                  <span className="font-semibold text-gray-800">Material:</span> {product.material}
                </p>
              )}
              {product.collections && (
                <p>
                  <span className="font-semibold text-gray-800">Collection:</span> {product.collections}
                </p>
              )}
              {product.sku && (
                <p>
                  <span className="font-semibold text-gray-800">SKU:</span> {product.sku}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* You May Also Like Section */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-10">
            <h2 className="text-2xl text-center font-bold text-gray-900 mb-8">
              You May Also Like
            </h2>
            <ProductGrid products={similarProducts} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
