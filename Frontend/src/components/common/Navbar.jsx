import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiOutlineUser,
  HiOutlineShoppingBag,
  HiBars3BottomRight,
} from 'react-icons/hi2';
import { IoMdClose } from 'react-icons/io';
import SearchBar from './SearchBar';
import CartDrawer from '../layout/CartDrawer';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);

  const { cart } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const cartItemCount =
    cart?.products?.reduce((total, item) => total + (item.quantity || 1), 0) || 0;

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen);
  };

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isAdmin = user && user.role?.toLowerCase() === 'admin';

  return (
    <>
      <nav className='container mx-auto flex items-center justify-between py-4 px-6'>
        {/* Left - Logo */}
        <div>
          <Link to="/" className='text-2xl font-medium'>
            Rabbit
          </Link>
        </div>

        {/* Center - Navigation Links (Desktop) */}
        <div className='hidden md:flex space-x-6'>
          <Link
            to="/collections/all?gender=men"
            className='text-gray-700 hover:text-black text-sm font-medium uppercase'
          >
            Men
          </Link>
          <Link
            to="/collections/all?gender=women"
            className='text-gray-700 hover:text-black text-sm font-medium uppercase'
          >
            Women
          </Link>
          <Link
            to="/collections/all?category=Top+Wear"
            className='text-gray-700 hover:text-black text-sm font-medium uppercase'
          >
            Top Wear
          </Link>
          <Link
            to="/collections/all?category=Bottom+Wear"
            className='text-gray-700 hover:text-black text-sm font-medium uppercase'
          >
            Bottom Wear
          </Link>
        </div>

        {/* Right - Icons */}
        <div className='flex items-center space-x-4'>
          <Link
            to="/admin"
            className='block bg-black px-2.5 py-1 rounded-md text-xs font-semibold text-white uppercase tracking-wider hover:bg-gray-800 transition'
          >
            Admin
          </Link>

          <Link to={user ? "/profile" : "/login"} className='hover:text-black'>
            <HiOutlineUser className='h-6 w-6 text-gray-700' />
          </Link>

          <button
            onClick={toggleCartDrawer}
            className='relative hover:text-black p-1'
          >
            <HiOutlineShoppingBag className='h-6 w-6 text-gray-700' />
            {cartItemCount > 0 && (
              <span className='absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center'>
                {cartItemCount}
              </span>
            )}
          </button>

          <SearchBar />

          <button onClick={toggleNavDrawer} className="md:hidden">
            <HiBars3BottomRight className='h-6 w-6 text-gray-700' />
          </button>
        </div>
      </nav>

      {/* Cart Drawer */}
      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer} />

      {/* Mobile Navigation Backdrop */}
      {navDrawerOpen && (
        <div
          onClick={toggleNavDrawer}
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        />
      )}

      {/* Mobile Navigation */}
      <div
        className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full bg-white shadow-xl transform transition-transform duration-300 z-50 ${
          navDrawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close Button */}
        <div className='flex justify-end p-4'>
          <button onClick={toggleNavDrawer} className="p-1 rounded-md hover:bg-gray-100 transition-colors">
            <IoMdClose className='h-6 w-6 text-gray-600' />
          </button>
        </div>

        {/* Menu Navigation Links */}
        <div className='p-4'>
          <h2 className='text-xl font-semibold mb-4'>Menu</h2>
          <nav className='space-y-4'>
            <Link
              to="/collections/all?gender=men"
              onClick={toggleNavDrawer}
              className='block text-gray-600 hover:text-black text-base'
            >
              Men
            </Link>
            <Link
              to="/collections/all?gender=women"
              onClick={toggleNavDrawer}
              className='block text-gray-600 hover:text-black text-base'
            >
              Women
            </Link>
            <Link
              to="/collections/all?category=Top+Wear"
              onClick={toggleNavDrawer}
              className='block text-gray-600 hover:text-black text-base'
            >
              Top Wear
            </Link>
            <Link
              to="/collections/all?category=Bottom+Wear"
              onClick={toggleNavDrawer}
              className='block text-gray-600 hover:text-black text-base'
            >
              Bottom Wear
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;