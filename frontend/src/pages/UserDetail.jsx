import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { motion } from 'framer-motion';
import { Mail, Calendar, BookMarked, RotateCcw, BookCheck, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returningId, setReturningId] = useState(null);
  const [tab, setTab] = useState('issued');

  useEffect(() => { fetchAll(); }, [userId]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [userRes, loansRes, resRes] = await Promise.all([
        api.get(`/users/${userId}`),
        api.get(`/loans/user/${userId}`),
        api.get(`/reservations/user/${userId}`)
      ]);
      setUser(userRes.data);
      setLoans(loansRes.data);
      setReservations(resRes.data);
    } catch {
      toast.error('Failed to fetch user details');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (loanId) => {
    setReturningId(loanId);
    try {
      await api.post(`/loans/return/${loanId}`);
      toast.success('Book returned successfully!');
      // Refresh loans so issued/returned counts update
      const loansRes = await api.get(`/loans/user/${userId}`);
      setLoans(loansRes.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  const issuedBooks   = loans.filter(l => l.status === 'active');
  const returnedBooks = loans.filter(l => l.status === 'returned');

  if (loading) return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
      <Navbar />
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
          <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading user...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
      <Navbar />
      <main className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* Back */}
        <button onClick={() => navigate('/admin/users')}
          className="flex items-center text-sm font-black text-gray-400 hover:text-indigo-600 mb-6 transition-colors group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Users
        </button>

        {/* Profile card */}
        {user && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-black text-3xl shadow-lg shadow-indigo-200">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="flex items-center text-sm text-gray-400 font-bold">
                    <Mail size={14} className="mr-1" />{user.email}
                  </span>
                  <span className="flex items-center text-sm text-gray-400 font-bold">
                    <Calendar size={14} className="mr-1" />
                    Joined: {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="bg-orange-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-orange-500">{issuedBooks.length}</p>
                <p className="text-xs font-black text-orange-400 uppercase tracking-widest mt-1">Issued</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-green-600">{returnedBooks.length}</p>
                <p className="text-xs font-black text-green-400 uppercase tracking-widest mt-1">Returned</p>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 text-center">
                <p className="text-3xl font-black text-purple-600">{reservations.length}</p>
                <p className="text-xs font-black text-purple-400 uppercase tracking-widest mt-1">Reservations</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit">
          <button onClick={() => setTab('issued')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${tab === 'issued' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <BookMarked size={16} /> Issued ({issuedBooks.length})
          </button>
          <button onClick={() => setTab('returned')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${tab === 'returned' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <RotateCcw size={16} /> Returned ({returnedBooks.length})
          </button>
          <button onClick={() => setTab('reservations')}
            className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${tab === 'reservations' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-400 hover:text-gray-600'}`}>
            <BookCheck size={16} /> Reservations ({reservations.length})
          </button>
        </div>

        {/* ── Issued Books ── */}
        {tab === 'issued' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">#</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Book Name</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Issue Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {issuedBooks.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400 font-medium">No issued books.</td></tr>
                ) : issuedBooks.map((loan, i) => {
                  const daysLeft = Math.ceil((new Date(loan.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysLeft < 0;
                  const isReturning = returningId === loan.id;
                  return (
                    <motion.tr key={loan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-orange-50/30 transition-colors">
                      <td className="px-8 py-5 text-sm font-black text-gray-400">{i + 1}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <BookMarked size={14} className="text-orange-500" />
                          </div>
                          <span className="font-black text-gray-900">{loan.book_title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500">{new Date(loan.issue_date).toLocaleDateString()}</td>
                      <td className="px-8 py-5 text-sm">
                        <span className={isOverdue ? 'text-red-500 font-bold' : 'text-gray-500'}>
                          {new Date(loan.due_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {isOverdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => handleReturn(loan.id)}
                          disabled={isReturning}
                          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-black rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-60 flex items-center gap-1.5 ml-auto">
                          {isReturning
                            ? <><Loader2 size={12} className="animate-spin" /> Returning...</>
                            : <><RotateCcw size={12} /> Mark Returned</>}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Returned Books ── */}
        {tab === 'returned' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">#</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Book Name</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Issue Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Return Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {returnedBooks.length === 0 ? (
                  <tr><td colSpan={5} className="px-8 py-12 text-center text-gray-400 font-medium">No returned books.</td></tr>
                ) : returnedBooks.map((loan, i) => {
                  const wasLate = loan.return_date && new Date(loan.return_date) > new Date(loan.due_date);
                  return (
                    <motion.tr key={loan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="hover:bg-green-50/30 transition-colors">
                      <td className="px-8 py-5 text-sm font-black text-gray-400">{i + 1}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                            <RotateCcw size={14} className="text-green-600" />
                          </div>
                          <span className="font-black text-gray-900">{loan.book_title}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-500">{new Date(loan.issue_date).toLocaleDateString()}</td>
                      <td className="px-8 py-5 text-sm text-gray-500">
                        {loan.return_date ? new Date(loan.return_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-lg text-xs font-black ${wasLate ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {wasLate ? 'Late Return' : 'On Time'}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Reservations ── */}
        {tab === 'reservations' && (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">#</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Book Name</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Reserved On</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reservations.length === 0 ? (
                  <tr><td colSpan={4} className="px-8 py-12 text-center text-gray-400 font-medium">No reservations.</td></tr>
                ) : reservations.map((res, i) => (
                  <motion.tr key={res.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="hover:bg-purple-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-black text-gray-400">{i + 1}</td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <BookCheck size={14} className="text-purple-600" />
                        </div>
                        <span className="font-black text-gray-900">{res.book_title}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm text-gray-500">{new Date(res.created_at).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                        res.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        res.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {res.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
};

export default UserDetail;
