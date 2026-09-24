import React from 'react';
import { Link } from 'react-router-dom';
import { TbBrandMeta } from 'react-icons/tb';
import { IoLogoInstagram } from 'react-icons/io';
import { RiTwitterXLine } from 'react-icons/ri';
import { FiPhoneCall } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="border-t py-12 bg-white">
      <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 px-6 sm:px-8 lg:px-12 xl:px-16">
        {/* Newsletter */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Newsletter</h3>
          <p className="text-gray-500 text-sm">
            Be the first to hear about new products, exclusive events, and online offers.
          </p>
          <p className="font-medium text-sm text-gray-600">
            Sign up and get 10% off your first order.
          </p>

          <form className="flex w-full max-w-sm">
            <input
              type="email"
              placeholder="Enter your email"
              className="p-3 w-full text-sm border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              required
            />
            <button
              type="submit"
              className="bg-black text-white px-5 py-3 text-sm font-medium rounded-r-md hover:bg-gray-800 transition-all shrink-0"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Shop Links */}
        <div className="md:pl-6 lg:pl-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Shop</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="#" className="hover:text-black transition-colors">
                Men's Top Wear
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-black transition-colors">
                Women's Top Wear
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-black transition-colors">
                Men's Bottom Wear
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-black transition-colors">
                Women's Bottom Wear
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Links */}
        <div className="md:pl-6 lg:pl-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Support</h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>
              <Link to="#" className="hover:text-black transition-colors">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-black transition-colors">
                About Us
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-black transition-colors">
                FAQs
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-black transition-colors">
                Features
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow Us & Call Us */}
        <div className="md:pl-4 lg:pl-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Follow Us</h3>
          <div className="flex items-center space-x-4 mb-6">
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors"
            >
              <TbBrandMeta className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors"
            >
              <IoLogoInstagram className="h-5 w-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-black transition-colors"
            >
              <RiTwitterXLine className="h-4 w-4" />
            </a>
          </div>
          <p className="text-gray-500 text-sm mb-1">Call Us</p>
          <p className="text-sm font-medium text-gray-800">
            <FiPhoneCall className="inline-block mr-2" />
            +18 (224) 777-67
          </p>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="container mx-auto mt-12 px-6 sm:px-8 lg:px-12 xl:px-16 border-t border-gray-200 pt-6">
        <p className="text-gray-500 text-sm tracking-tight text-center">
          © {new Date().getFullYear()}, Rabbit. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;