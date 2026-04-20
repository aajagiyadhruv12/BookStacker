import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import {
  Book, LogOut, User, LayoutDashboard, Search, Bell, Users as UsersIcon,
  BookOpen, Bookmark, CheckCheck, Clock, RotateCcw, QrCode, Menu, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';

const Navbar = () => {
  const { user, isAdmin, userData } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/user/${user.uid}`);
      setNotifications(res.data);
    } catch (e) {
      console.error('Notifications fetch error:', e?.response?.data || e.message);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post(`/notifications/mark-all-read/${user.uid}`);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch {}
  };

  const markRead = async (id) => {
    try {
      await api.post(`/notifications/mark-read/${id}`);
      // Optimistic update — immediately remove unread dot and re-count badge
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const deleteNotif = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch {}
  };

  const notifIcon = (type) => {
    if (type === 'return') return <RotateCcw size={14} className="text-green-500" />;
    if (type === 'issue') return <BookOpen size={14} className="text-indigo-500" />;
    return <Bell size={14} className="text-gray-400" />;
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/login');
  };

  const navLinks = [
    { name: 'Browse Books', path: '/books', icon: Search, show: true },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, show: !!user && !isAdmin },
    { name: 'My Loans', path: '/my-loans', icon: BookOpen, show: !!user && !isAdmin },
    { name: 'Reservations', path: '/my-reservations', icon: Bookmark, show: !!user && !isAdmin },
    { name: 'Manage Users', path: '/admin/users', icon: UsersIcon, show: isAdmin },
    { name: 'My Profile', path: '/profile', icon: User, show: !!user },
  ];

  const visibleLinks = navLinks.filter(l => l.show);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-indigo-100/60"
        style={{ boxShadow: '0 1px 0 rgba(99,102,241,0.1), 0 4px 24px rgba(99,102,241,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            {/* Logo */}
            <div className="flex items-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/dashboard" className="flex items-center space-x-2">
                  <div className="bg-gradient-to-tr from-indigo-600 via-violet-600 to-blue-600 p-2 rounded-xl shadow-lg shadow-indigo-300/50">
                    <Book className="text-white" size={20} />
                  </div>
                  <span className="text-xl font-extrabold tracking-tight"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                    BookStacker
                  </span>
                </Link>
              </motion.div>

              {/* Desktop nav links */}
              <div className="hidden md:flex items-center ml-10 space-x-1">
                {visibleLinks.map((link) => (
                  <Link key={link.path} to={link.path}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center space-x-2 ${
                      location.pathname === link.path
                        ? 'bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-100'
                        : 'text-gray-500 hover:bg-indigo-50/50 hover:text-indigo-600'
                    }`}>
                    <link.icon size={16} />
                    <span>{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-2">
              {/* Admin QR Scanner */}
              {isAdmin && (
                <button onClick={() => navigate('/admin/scanner')}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200"
                  title="QR Scanner">
                  <QrCode size={20} />
                </button>
              )}

              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(o => !o)}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 relative">
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white text-white text-[9px] font-black flex items-center justify-center badge-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl shadow-indigo-100/50 border border-gray-100 z-50 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                        <span className="font-black text-gray-900 text-sm">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="flex items-center gap-1 text-xs font-bold text-indigo-500 hover:text-indigo-700 transition-colors">
                            <CheckCheck size={14} /> Mark all read
                          </button>
                        )}
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="py-10 text-center">
                            <Bell size={28} className="mx-auto text-gray-200 mb-2" />
                            <p className="text-xs text-gray-400 font-bold">No notifications yet</p>
                          </div>
                        ) : notifications.map(n => (
                          <div key={n.id}
                            className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-gray-50 ${!n.read ? 'bg-indigo-50/50' : ''}`}>
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${n.type === 'return' ? 'bg-green-100' : 'bg-indigo-100'}`}>
                              {notifIcon(n.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs font-black ${!n.read ? 'text-gray-900' : 'text-gray-500'}`}>{n.title}</p>
                              <p className="text-xs text-gray-400 font-medium mt-0.5 leading-relaxed">{n.message}</p>
                              <p className="text-[10px] text-gray-300 font-bold mt-1 flex items-center gap-1">
                                <Clock size={10} />{new Date(n.created_at).toLocaleString()}
                              </p>
                              {!n.read && (
                                <button
                                  onClick={() => markRead(n.id)}
                                  className="mt-1.5 flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-700 transition-colors">
                                  <CheckCheck size={10} /> Mark as read
                                </button>
                              )}
                            </div>
                            {!n.read && <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Desktop: user info + logout */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="h-8 w-px bg-gray-100 mx-1" />
                <div className="flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-800">{userData?.name || 'User'}</span>
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{userData?.role || 'Member'}</span>
                </div>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="bg-gray-50 text-gray-500 p-2 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:shadow-md hover:shadow-red-100"
                  title="Logout">
                  <LogOut size={20} />
                </motion.button>
              </div>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(o => !o)}
                className="md:hidden p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all ml-1">
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
            />
            {/* Drawer */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed top-16 left-0 right-0 z-40 md:hidden bg-white border-b border-indigo-100/60 shadow-2xl shadow-indigo-100/40 rounded-b-3xl overflow-hidden">

              {/* User info strip */}
              <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-indigo-100/50">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-lg">
                  {userData?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="font-black text-gray-900 text-sm">{userData?.name || 'User'}</p>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{userData?.role || 'Member'}</p>
                </div>
              </div>

              {/* Nav links */}
              <div className="px-3 py-3 space-y-1">
                {visibleLinks.map((link, i) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}>
                    <Link to={link.path}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                        location.pathname === link.path
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                          : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}>
                      <link.icon size={18} />
                      {link.name}
                      {location.pathname === link.path && (
                        <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />
                      )}
                    </Link>
                  </motion.div>
                ))}

                {isAdmin && (
                  <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: visibleLinks.length * 0.04 }}>
                    <button onClick={() => navigate('/admin/scanner')}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                      <QrCode size={18} /> QR Scanner
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Logout */}
              <div className="px-3 pb-4 pt-1">
                <button onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
