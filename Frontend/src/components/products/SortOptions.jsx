import React from 'react';
import { HiArrowsUpDown } from 'react-icons/hi2';

const SortOptions = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort-select" className="text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:inline">
        Sort By:
      </label>
      <div className="relative">
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none bg-white border border-gray-200 text-gray-800 text-sm font-medium py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-black cursor-pointer shadow-sm hover:border-gray-400 transition"
        >
          <option value="">Default</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDsc">Price: High to Low</option>
          <option value="Popularity">Popularity</option>
        </select>
        <HiArrowsUpDown className="w-4 h-4 text-gray-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    </div>
  );
};

export default SortOptions;
