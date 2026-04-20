import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Clock, CheckCircle, AlertCircle, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyLoans = ({ tab }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 px-8"
  >
    <div className="relative mb-8">
      <div className="w-36 h-36 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-[3rem] flex items-center justify-center shadow-xl shadow-blue-100">
        {tab === 'active' ? (
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <rect x="8" y="12" width="26" height="36" rx="4" fill="#3b82f6" opacity="0.15"/>
            <rect x="12" y="8" width="26" height="36" rx="4" fill="#3b82f6" opacity="0.35"/>
            <rect x="16" y="4" width="26" height="36" rx="4" fill="#3b82f6"/>
            <rect x="20" y="11" width="14" height="2" rx="1" fill="white" opacity="0.8"/>
            <rect x="20" y="16" width="10" height="2" rx="1" fill="white" opacity="0.5"/>
            <rect x="20" y="21" width="12" height="2" rx="1" fill="white" opacity="0.5"/>
            <circle cx="52" cy="52" r="14" fill="#dbeafe"/>
            <path d="M46 52l4 4 8-8" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <rect x="10" y="14" width="26" height="36" rx="4" fill="#10b981" opacity="0.15"/>
            <rect x="14" y="10" width="26" height="36" rx="4" fill="#10b981" opacity="0.35"/>
            <rect x="18" y="6" width="26" height="36" rx="4" fill="#10b981"/>
            <rect x="22" y="13" width="14" height="2" rx="1" fill="white" opacity="0.8"/>
            <rect x="22" y="18" width="10" height="2" rx="1" fill="white" opacity="0.5"/>
            <path d="M44 48l6-6M44 42l6 6" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="47" cy="45" r="12" stroke="#10b981" strokeWidth="2" fill="#d1fae5"/>
            <path d="M43 45l3 3 6-6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg">
        <Sparkles size={14} className="text-white" />
      </div>
    </div>
    <h3 className="text-2xl font-black text-gray-900 mb-2">
      {tab === 'active' ? 'No active loans' : 'No returned books yet'}
    </h3>
    <p className="text-gray-400 font-medium text-center max-w-xs leading-relaxed">
      {tab === 'active'
        ? 'You have no books checked out right now. Browse the library to find your next read!'
        : "Books you've returned will appear here with their history."}
    </p>
    {tab === 'active' && (
      <a href="/books"
        className="mt-6 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition-all">
        Browse Books →
      </a>
    )}
  </motion.div>
);

const MyLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('active');

  useEffect(() => { fetchLoans(); }, []);

  const fetchLoans = async () => {
    try {
      const res = await api.get(`/loans/user/${user.uid}`);
      setLoans(res.data);
    } catch {
      toast.error('Failed to fetch loans');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    try {
      await api.post(`/loans/return/${loanId}`);
      toast.success('Book returned successfully!');
      fetchLoans();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Failed to return book');
    }
  };

  const active = loans.filter(l => !l.returned && l.status !== 'returned');
  const returned = loans.filter(l => l.returned || l.status === 'returned');
  const displayed = tab === 'active' ? active : returned;
  const isOverdue = (due_date) => new Date(due_date) < new Date();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
      <Navbar />
      <main className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 mb-1">My Loans</h1>
          <p className="text-gray-500 font-medium">Track your issued and returned books.</p>
        </motion.div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
              <Clock size={22} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{active.length}</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Active</p>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center">
              <CheckCircle size={22} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-black text-gray-900">{returned.length}</p>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Returned</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
          <button onClick={() => setTab('active')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <div className="flex items-center gap-2"><Clock size={16} /> Active ({active.length})</div>
          </button>
          <button onClick={() => setTab('returned')}
            className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${tab === 'returned' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <div className="flex items-center gap-2"><CheckCircle size={16} /> Returned ({returned.length})</div>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin" />
            </div>
          </div>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <EmptyLoans tab={tab} />
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-4">
              {displayed.map((loan, i) => (
                <motion.div
                  key={loan.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: i * 0.05 }}
                  className={`bg-white rounded-[1.75rem] border shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-lg ${
                    !loan.returned && isOverdue(loan.due_date)
                      ? 'border-red-100 hover:border-red-200'
                      : 'border-gray-100 hover:border-indigo-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                      loan.returned ? 'bg-green-50 text-green-600' :
                      isOverdue(loan.due_date) ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-600'
                    }`}>
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg leading-tight">{loan.book_title}</p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="flex items-center text-xs text-gray-400 font-bold gap-1">
                          <Calendar size={11} /> Issued: {new Date(loan.issue_date).toLocaleDateString()}
                        </span>
                        <span className={`flex items-center text-xs font-bold gap-1 ${isOverdue(loan.due_date) && !loan.returned ? 'text-red-500' : 'text-gray-400'}`}>
                          <AlertCircle size={11} /> Due: {new Date(loan.due_date).toLocaleDateString()}
                        </span>
                        {loan.returned && loan.return_date && (
                          <span className="flex items-center text-xs text-green-500 font-bold gap-1">
                            <CheckCircle size={11} /> Returned: {new Date(loan.return_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {!loan.returned ? (
                      <>
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase ${isOverdue(loan.due_date) ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {isOverdue(loan.due_date) ? 'Overdue' : 'Active'}
                        </span>
                        <button onClick={() => handleReturn(loan.id)}
                          className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200">
                          Return
                        </button>
                      </>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-black uppercase bg-gray-100 text-gray-500">Returned</span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default MyLoans;
