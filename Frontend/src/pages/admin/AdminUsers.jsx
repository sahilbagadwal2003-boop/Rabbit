import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAdminUsers,
  updateUserRole,
  deleteUser,
} from '../../Redux/slices/AdminSlice';
import {
  HiOutlineTrash,
  HiOutlineMagnifyingGlass,
  HiOutlineShieldCheck,
  HiOutlineUser,
} from 'react-icons/hi2';
import { toast } from 'sonner';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((state) => state.admin);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAdminUsers());
  }, [dispatch]);

  const handleRoleToggle = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'customer' : 'admin';
    try {
      const resultAction = await dispatch(
        updateUserRole({ id: userId, role: newRole })
      );
      if (updateUserRole.fulfilled.match(resultAction)) {
        toast.success(`Role updated to ${newRole}`);
      } else {
        toast.error(resultAction.payload || 'Failed to update role');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating user role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser?._id) {
      toast.error('You cannot delete your own admin account');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const resultAction = await dispatch(deleteUser(userId));
      if (deleteUser.fulfilled.match(resultAction)) {
        toast.success('User deleted');
      } else {
        toast.error(resultAction.payload || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting user');
    }
  };

  const userList = Array.isArray(users) ? users : [];
  const filteredUsers = userList.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Users Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage user accounts and administrative roles.</p>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-center">
        <HiOutlineMagnifyingGlass className="w-5 h-5 text-gray-400 mr-3" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search users by name, email, or role..."
          className="w-full text-sm outline-none bg-transparent text-gray-900 placeholder-gray-400"
        />
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-black border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 border-b border-gray-100 font-semibold">
                <tr>
                  <th className="py-3 px-6">User</th>
                  <th className="py-3 px-6">Email</th>
                  <th className="py-3 px-6">Role</th>
                  <th className="py-3 px-6">Joined Date</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => {
                    const isSelf = user._id === currentUser?._id;
                    const isAdmin = user.role?.toLowerCase() === 'admin';

                    return (
                      <tr key={user._id} className="hover:bg-gray-50 transition">
                        <td className="py-4 px-6 flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-sm shrink-0">
                            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.name} {isSelf && <span className="text-xs text-blue-600 font-normal">(You)</span>}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-700 font-medium">{user.email}</td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => handleRoleToggle(user._id, user.role)}
                            disabled={isSelf}
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              isAdmin
                                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                            title={isSelf ? 'Cannot change own role' : 'Click to toggle role'}
                          >
                            {isAdmin ? (
                              <>
                                <HiOutlineShieldCheck className="w-3.5 h-3.5 mr-1" /> Admin
                              </>
                            ) : (
                              <>
                                <HiOutlineUser className="w-3.5 h-3.5 mr-1" /> Customer
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            disabled={isSelf}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isSelf ? 'Cannot delete self' : 'Delete User'}
                          >
                            <HiOutlineTrash className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
