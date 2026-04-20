import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Bookmark, Calendar, XCircle, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyReservations = ({ tab }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-8"
  >
    <div className="relative mb-8">
      <div className="w-36 h-36 bg-gradient-to-br from-purple-100 to-violet-100 rounded-[3rem] flex items-center justify-center shadow-xl shadow-purple-100">
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <rect x="12" y="8" width="30" height="42" rx="5" fill="#8b5cf6" opacity="0.15"/>
          <rect x="16" y="4" width="30" height="42" rx="5" fill="#8b5cf6" opacity="0.35"/>
          <rect x="20" y="0" width="30" height="42" rx="5" fill="#8b5cf6"/>
          <rect x="26" y="8" width="16" height="2.5" rx="1.25" fill="white" opacity="0.8"/>
          <rect x="26" y="14" width="12" height="2" rx="1" fill="white" opacity="0.5"/>
          <rect x="26" y="19" width="14" height="2" rx="1" fill="white" opacity="0.5"/>
          {/* Bookmark ribbon */}
          <path d="M48 38v20l-6-5-6 5V38a4 4 0 018 0z" fill="#c4b5fd" stroke="#8b5cf6" strokeWidth="1.5"/>
        </svg>
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
        <Sparkles size={14} className="text-white" />
      </div>
    </div>
    <h3 className="text-2xl font-black text-gray-900 mb-2">
      {tab === 'pending' ? 'No pending reservations' : 'Nothing here yet'}
    </h3>
    <p className="text-gray-400 font-medium text-center max-w-xs leading-relaxed">
      {tab === 'pending'
        ? "You haven't reserved any books. When a book is out of stock, you can reserve it and we'll notify you!"
        : 'Cancelled or fulfilled reservations will appear here.'}
    </p>
    {tab === 'pending' && (
      <a href="/books"
        className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-200 hover:from-purple-700 hover:to-violet-700 transition-all">
        Browse Books →
      </a>
    )}
  </motion.div>
);

const statusConfig = {
  pending:   { bg: 'bg-amber-100',  text: 'text-amber-600',  label: 'Pending' },
  cancelled: { bg: 'bg-red-100',    text: 'text-red-500',    label: 'Cancelled' },
  fulfilled: { bg: 'bg-green-100',  text: 'text-green-600',  label: 'Fulfilled' },
};

const MyReservations = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  useEffect(() => { fetchReservations(); }, []);

  const fetchReservations = async () => {
    try {
      const res = await api.get(`/reservations/user/${user.uid}`);
      setReservations(res.data);
    } catch {
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    try {
      await api.post(`/reservations/${id}/cancel`);
      toast.success('Reservation cancelled');
      fetchReservations();
    } catch {
      toast.error('Failed to cancel reservation');
    }
  };

  const pending = reservations.filter(r => r.status === 'pending');
  const others  = reservations.filter(r => r.status !== 'pending');
  const displayed = tab === 'pending' ? pending : others;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
      <Navbar />
      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-1">My Reservations</h1>
          <p className="text-gray-500 font-medium">Books you have reserved and their status.</p>
        </motion.div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
              <Clock size={22} className="text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{pending.length}</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pending</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center">
              <XCircle size={22} className="text-gray-400" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{others.length}</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Others</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
          <button onClick={() => setTab('pending')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'pending' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <div className="flex items-center gap-2"><Clock size={16} /> Pending ({pending.length})</div>
          </button>
          <button onClick={() => setTab('others')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'others' ? 'bg-gray-700 text-white shadow-lg shadow-gray-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <div className="flex items-center gap-2"><XCircle size={16} /> Others ({others.length})</div>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 border-4 border-purple-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-purple-600 rounded-full border-t-transparent animate-spin" />
            </div>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <EmptyReservations tab={tab} />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {displayed.map((res, i) => {
                const cfg = statusConfig[res.status] || statusConfig.pending;
                return (
                  <motion.div
                    key={res.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-[1.75rem] border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-lg hover:border-purple-100 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Bookmark size={22} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg leading-tight">{res.book_title}</p>
                        <span className="flex items-center text-xs text-gray-400 font-bold gap-1 mt-1.5">
                          <Calendar size={11} /> Reserved: {new Date(res.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                      {res.status === 'pending' && (
                        <button onClick={() => handleCancel(res.id)}
                          className="px-5 py-2.5 bg-red-50 text-red-600 text-xs font-black rounded-xl hover:bg-red-100 hover:shadow-md transition-all">
                          Cancel
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default MyReservations;
