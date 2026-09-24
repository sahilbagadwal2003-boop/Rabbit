import React from 'react';
import { HiOutlineAdjustmentsHorizontal, HiXMark } from 'react-icons/hi2';

const categories = ['All', 'Top Wear', 'Bottom Wear'];
const genders = ['All', 'Men', 'Women'];
const colors = [
  'Black',
  'White',
  'Blue',
  'Red',
  'Green',
  'Beige',
  'Gray',
  'Navy',
  'Pink',
  'Yellow',
];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const materials = ['All', 'Organic Cotton', 'French Linen', 'Cotton Denim', 'Wool Blend', 'Polyester'];
const brands = ['Urban Threads', 'Street Style', 'ChicStyle', 'Modern Fit', 'Beach Breeze'];

const FilterSidebar = ({
  filters = {},
  onFilterChange = () => {},
  onResetFilters = () => {},
  isMobileModalOpen = false,
  closeMobileModal = () => {},
}) => {
  const currentMaxPrice = filters?.maxPrice ?? 250;
  const selectedBrands = filters?.brand ? filters.brand.split(',').filter(Boolean) : [];

  const handleBrandToggle = (brand) => {
    let updatedBrands;
    if (selectedBrands.includes(brand)) {
      updatedBrands = selectedBrands.filter((b) => b !== brand);
    } else {
      updatedBrands = [...selectedBrands, brand];
    }
    onFilterChange('brand', updatedBrands.join(','));
  };

  const content = (
    <div className="space-y-6">
      {/* Header for desktop */}
      <div className="hidden lg:flex items-center justify-between pb-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <HiOutlineAdjustmentsHorizontal className="w-5 h-5" /> Filters
        </h3>
        <button
          onClick={onResetFilters}
          className="text-xs font-semibold text-gray-500 hover:text-black underline uppercase"
        >
          Reset All
        </button>
      </div>

      {/* Gender Filter */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
          Gender
        </h4>
        <div className="space-y-2">
          {genders.map((gender) => (
            <label
              key={gender}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-black"
            >
              <input
                type="radio"
                name="gender"
                checked={filters?.gender === gender || (gender === 'All' && !filters?.gender)}
                onChange={() => onFilterChange('gender', gender === 'All' ? '' : gender)}
                className="w-4 h-4 text-black focus:ring-black border-gray-300"
              />
              <span>{gender}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
          Category
        </h4>
        <div className="space-y-2">
          {categories.map((category) => (
            <label
              key={category}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-black"
            >
              <input
                type="radio"
                name="category"
                checked={filters?.category === category || (category === 'All' && !filters?.category)}
                onChange={() => onFilterChange('category', category === 'All' ? '' : category)}
                className="w-4 h-4 text-black focus:ring-black border-gray-300"
              />
              <span>{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Max Price
          </h4>
          <span className="text-sm font-bold text-gray-900">${currentMaxPrice}</span>
        </div>
        <input
          type="range"
          min="20"
          max="250"
          step="5"
          value={currentMaxPrice}
          onChange={(e) => onFilterChange('maxPrice', Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>$20</span>
          <span>$250</span>
        </div>
      </div>

      {/* Color Filter */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Color
          </h4>
          {filters?.color && (
            <button
              onClick={() => onFilterChange('color', '')}
              className="text-xs text-gray-500 hover:text-black"
            >
              Clear
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => {
            const isSelected = filters?.color?.toLowerCase() === color.toLowerCase();
            return (
              <button
                key={color}
                type="button"
                onClick={() => onFilterChange('color', isSelected ? '' : color)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  isSelected
                    ? 'bg-black text-white border-black ring-2 ring-offset-1 ring-black'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {color}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size Filter */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Size
          </h4>
          {filters?.size && (
            <button
              onClick={() => onFilterChange('size', '')}
              className="text-xs text-gray-500 hover:text-black"
            >
              Clear
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => {
            const isSelected = filters?.size === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onFilterChange('size', isSelected ? '' : size)}
                className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* Material Filter */}
      <div className="pt-4 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">
          Material
        </h4>
        <div className="space-y-2">
          {materials.map((material) => (
            <label
              key={material}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-black"
            >
              <input
                type="radio"
                name="material"
                checked={filters?.material === material || (material === 'All' && !filters?.material)}
                onChange={() => onFilterChange('material', material === 'All' ? '' : material)}
                className="w-4 h-4 text-black focus:ring-black border-gray-300"
              />
              <span>{material}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
            Brand
          </h4>
          {selectedBrands.length > 0 && (
            <button
              onClick={() => onFilterChange('brand', '')}
              className="text-xs text-gray-500 hover:text-black"
            >
              Clear
            </button>
          )}
        </div>
        <div className="space-y-2">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-black"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => handleBrandToggle(brand)}
                className="w-4 h-4 rounded text-black focus:ring-black border-gray-300"
              />
              <span>{brand}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-full bg-white p-5 rounded-2xl border border-gray-200 shadow-sm self-start">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileModalOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={closeMobileModal}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          />
          <div className="relative ml-auto w-4/5 max-w-sm h-full bg-white shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10">
            <div>
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <HiOutlineAdjustmentsHorizontal className="w-5 h-5" /> Filters
                </h3>
                <button
                  onClick={closeMobileModal}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <HiXMark className="w-6 h-6" />
                </button>
              </div>
              {content}
            </div>

            <div className="pt-6 border-t border-gray-200 mt-6 flex gap-3">
              <button
                onClick={onResetFilters}
                className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                onClick={closeMobileModal}
                className="flex-1 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterSidebar;
