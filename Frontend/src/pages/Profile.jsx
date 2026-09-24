import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout, updateUserProfile, getUserProfile } from '../Redux/slices/authSlice';
import MyOrdersPage from './MyOrdersPage';
import { toast } from 'sonner';
import { HiOutlinePencilSquare, HiOutlineXMark } from 'react-icons/hi2';

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, userToken, loading } = useSelector((state) => state.auth);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!userToken) {
      navigate('/login');
      return;
    }
    dispatch(getUserProfile());
  }, [dispatch, userToken, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '',
      });
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    toast.info('Logged out successfully');
    navigate('/login');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
      };
      if (formData.password) {
        payload.password = formData.password;
      }

      const resAction = await dispatch(updateUserProfile(payload));
      if (updateUserProfile.fulfilled.match(resAction)) {
        toast.success('Profile updated successfully!');
        setIsEditModalOpen(false);
      } else {
        toast.error(resAction.payload || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating profile');
    }
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-[70vh] bg-gray-50 py-10">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column: User Profile Info */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold">
                  {initial}
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{user?.name || 'User'}</h1>
                  <p className="text-xs text-gray-500">{user?.email || ''}</p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-gray-100 text-gray-700">
                    {user?.role || 'Customer'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="w-full flex items-center justify-center border border-gray-300 text-gray-800 py-2.5 px-4 rounded-xl font-medium hover:bg-gray-50 transition"
                >
                  <HiOutlinePencilSquare className="w-4 h-4 mr-2" /> Edit Profile
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full bg-red-500 text-white py-2.5 px-4 rounded-xl font-medium hover:bg-red-600 transition"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Orders Section */}
          <div className="w-full md:w-2/3 lg:w-3/4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-2 sm:p-6">
              <MyOrdersPage />
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Edit Profile</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-black"
              >
                <HiOutlineXMark className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
