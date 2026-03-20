import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { BookOpen, Users, Clock, Calendar, Plus, ChevronRight, Activity, TrendingUp, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAdmin, userData } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = isAdmin ? '/api/dashboard/admin' : `/api/dashboard/user/${user.uid}`;
        const response = await axios.get(endpoint);
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.uid, isAdmin]);

  const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-2xl ${color} text-white shadow-lg`}>
          <Icon size={24} />
        </div>
        <div className="flex flex-col items-end">
          <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">
            <TrendingUp size={12} className="mr-1" /> +12%
          </span>
        </div>
      </div>
      <div className="mt-6">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-black text-gray-900 mt-1">{value}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-black text-gray-900 tracking-tight"
            >
              Hello, {userData?.name?.split(' ')[0] || 'User'}! 👋
            </motion.h1>
            <p className="text-gray-500 mt-2 font-medium">Welcome back to your library command center.</p>
          </div>
          
          {isAdmin && (
            <motion.button
              onClick={() => navigate('/admin/add-book')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
            >
              <Plus size={20} className="mr-2" /> Add New Book
            </motion.button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative w-16 h-16">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {isAdmin ? (
                <>
                  <StatCard icon={BookOpen} label="Total Inventory" value={stats?.total_books || 0} color="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.1} />
                  <StatCard icon={Users} label="Active Members" value={stats?.total_users || 0} color="bg-gradient-to-br from-indigo-500 to-indigo-600" delay={0.2} />
                  <StatCard icon={Clock} label="Books Out" value={stats?.active_loans || 0} color="bg-gradient-to-br from-orange-500 to-orange-600" delay={0.3} />
                  <StatCard icon={Calendar} label="Reserved" value={stats?.pending_reservations || 0} color="bg-gradient-to-br from-purple-500 to-purple-600" delay={0.4} />
                </>
              ) : (
                <>
                  <StatCard icon={Clock} label="Currently Reading" value={stats?.active_loans || 0} color="bg-gradient-to-br from-blue-500 to-blue-600" delay={0.1} />
                  <StatCard icon={Calendar} label="On My Waitlist" value={stats?.pending_reservations || 0} color="bg-gradient-to-br from-purple-500 to-purple-600" delay={0.2} />
                  <StatCard icon={Activity} label="Activity Score" value="94" color="bg-gradient-to-br from-green-500 to-green-600" delay={0.3} />
                  <StatCard icon={TrendingUp} label="Points" value="1.2k" color="bg-gradient-to-br from-pink-500 to-pink-600" delay={0.4} />
                </>
              )}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
                    <button className="text-blue-600 font-bold text-sm hover:underline">View All</button>
                  </div>
                  <div className="space-y-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mr-4">
                          <Activity size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">Atomic Habits was issued</p>
                          <p className="text-xs text-gray-400 font-medium">2 hours ago • Action by {isAdmin ? 'Member #23' : 'You'}</p>
                        </div>
                        <ChevronRight size={16} className="text-gray-300" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2">Pro Tip! 💡</h2>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed">
                      Did you know you can reserve books even when they are out of stock? We'll notify you as soon as they return!
                    </p>
                    <button className="mt-6 bg-white text-blue-600 px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all">
                      Learn More
                    </button>
                  </div>
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                  <h2 className="text-xl font-black text-gray-900 mb-6">Quick Actions</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Link to="/books" className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group">
                      <Search size={24} className="mb-2 text-gray-400 group-hover:text-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">Browse</span>
                    </Link>
                    <button className="flex flex-col items-center p-4 rounded-2xl bg-gray-50 hover:bg-blue-50 hover:text-blue-600 transition-all group">
                      <Calendar size={24} className="mb-2 text-gray-400 group-hover:text-blue-600" />
                      <span className="text-xs font-bold uppercase tracking-wider">Reserve</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
