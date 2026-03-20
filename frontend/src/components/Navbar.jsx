import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { Book, LogOut, User, LayoutDashboard, Search, Bell, Settings, Users as UsersIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, isAdmin, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Browse Books', path: '/books', icon: Search, show: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: !!user },
    { name: 'Manage Users', path: '/admin/users', icon: UsersIcon, show: isAdmin },
    { name: 'My Profile', path: '/profile', icon: User, show: !!user },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to="/dashboard" className="flex items-center space-x-2">
                <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                  <Book className="text-white" size={20} />
                </div>
                <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
                  BookStacker
                </span>
              </Link>
            </motion.div>
            
            <div className="hidden md:flex items-center ml-10 space-x-1">
              {navLinks.filter(link => link.show).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    location.pathname === link.path
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <link.icon size={16} />
                  <span>{link.name}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-gray-100 mx-2"></div>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-sm font-bold text-gray-800">{userData?.name || 'User'}</span>
                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{userData?.role || 'Member'}</span>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="bg-gray-50 text-gray-500 p-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200"
                title="Logout"
              >
                <LogOut size={20} />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
