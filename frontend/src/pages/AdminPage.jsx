import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, BookOpen, ShieldCheck, Mail, Calendar, Trash2, Edit, Plus, Clock, BookMarked, RotateCcw, Search, BookCheck, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const AdminPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [loans, setLoans] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setSearchTerm('');
    setStatusFilter('all');
    if (isAdmin) {
      if (activeTab === 'users') fetchUsers();
      else if (activeTab === 'books') fetchBooks();
      else if (activeTab === 'loans' || activeTab === 'issued' || activeTab === 'returned') fetchLoans();
      else if (activeTab === 'reservations') fetchReservations();
    }
  }, [isAdmin, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/loans');
      setLoans(response.data);
    } catch (error) {
      console.error('Fetch loans error:', error?.response?.data || error.message);
      toast.error(`Failed to fetch loans: ${error?.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // helper: display name
  const userName = (item) => item.user_name || item.user_id || 'Unknown';

  // Filter issued books
  const filteredIssuedBooks = loans
    .filter(l => l.status === 'active')
    .filter(loan => {
      const matchesSearch = loan.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           userName(loan).toLowerCase().includes(searchTerm.toLowerCase());
      const isOverdue = new Date(loan.due_date) < new Date();
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'overdue' && isOverdue) ||
                           (statusFilter === 'ontime' && !isOverdue);
      return matchesSearch && matchesStatus;
    });

  // Filter returned books
  const filteredReturnedBooks = loans
    .filter(l => l.status === 'returned')
    .filter(loan => 
      loan.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName(loan).toLowerCase().includes(searchTerm.toLowerCase())
    );

  const handleReturnBook = async (loanId) => {
    try {
      await api.post(`/loans/return/${loanId}`);
      toast.success('Book returned successfully!');
      fetchLoans();
    } catch (error) {
      toast.error('Failed to return book');
    }
  };

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reservations');
      setReservations(response.data);
    } catch (error) {
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editBook, setEditBook] = useState(null);  // holds book being edited
  const [editLoading, setEditLoading] = useState(false);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditBook(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await api.put(`/books/${editBook.id}`, editBook);
      toast.success('Book updated successfully!');
      setEditBook(null);
      fetchBooks();
    } catch (error) {
      toast.error('Failed to update book');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await api.delete(`/books/${bookId}`);
      toast.success('Book deleted successfully!');
      setDeleteConfirm(null);
      fetchBooks();
    } catch (error) {
      toast.error('Failed to delete book');
    }
  };

  const handleCancelReservation = async (reservationId) => {
    try {
      await api.post(`/reservations/${reservationId}/cancel`);
      toast.success('Reservation cancelled!');
      fetchReservations();
    } catch (error) {
      toast.error('Failed to cancel reservation');
    }
  };

  const filteredReservations = reservations.filter(r =>
    r.book_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userName(r).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, booksRes] = await Promise.all([
        api.get('/users'),
        api.get('/books')
      ]);
      setUsers(usersRes.data);
      setBooks(booksRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)'}}>
        <div className="text-center p-12 glass rounded-[2rem] shadow-xl border border-red-100">
          <ShieldCheck size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-500 font-medium">You do not have administrative privileges.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)'}}>
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Admin Console</h1>
            <p className="text-gray-500 mt-2 font-medium">Manage library members, books, and loans.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-full md:w-auto overflow-x-auto no-scrollbar">
            <div className="flex min-w-max">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="flex items-center"><Users size={18} className="mr-2" /> Users</div>
              </button>
              <button
                onClick={() => setActiveTab('books')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'books' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="flex items-center"><BookOpen size={18} className="mr-2" /> Books</div>
              </button>
              <button
                onClick={() => setActiveTab('loans')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'loans' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="flex items-center"><Clock size={18} className="mr-2" /> Loans</div>
              </button>
              <button
                onClick={() => setActiveTab('issued')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'issued' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="flex items-center"><BookMarked size={18} className="mr-2" /> Issued</div>
              </button>
              <button
                onClick={() => setActiveTab('returned')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'returned' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="flex items-center"><RotateCcw size={18} className="mr-2" /> Returned</div>
              </button>
              <button
                onClick={() => setActiveTab('reservations')}
                className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${activeTab === 'reservations' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <div className="flex items-center"><BookCheck size={18} className="mr-2" /> Reservations</div>
              </button>
            </div>
            <div className="h-8 w-px bg-gray-100 hidden sm:block"></div>
            <button
              onClick={() => navigate('/admin/add-book')}
              className="px-6 py-2.5 rounded-xl text-sm font-black bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all flex items-center"
            >
              <Plus size={18} className="mr-2" /> Add Book
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : activeTab === 'users' ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">User Details</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Joined Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-black mr-4">{user.name?.charAt(0).toUpperCase()}</div>
                        <div>
                          <p className="font-black text-gray-900">{user.name}</p>
                          <div className="flex items-center text-xs text-gray-400 font-bold mt-1"><Mail size={12} className="mr-1" /> {user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{user.role}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm text-gray-500 font-medium"><Calendar size={14} className="mr-2 opacity-40" /> {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => navigate(`/admin/users/${user.id}`)} className="px-4 py-2 bg-blue-50 text-blue-600 text-xs font-black rounded-xl hover:bg-blue-100 transition-all">View</button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 transition-all"><Edit size={18} /></button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-gray-100 transition-all"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </div>
          </div>
        ) : activeTab === 'books' ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Book Details</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {books.map((book) => (
                  <motion.tr key={book.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center">
                        <div className="w-12 h-16 rounded-lg bg-gray-100 overflow-hidden mr-4 flex-shrink-0">
                          {book.thumbnail_url ? <img src={book.thumbnail_url} alt={book.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen size={20} /></div>}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-tight">{book.title}</p>
                          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-tighter">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest">{book.category}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm font-bold">
                        <span className={book.available_copies > 0 ? 'text-green-600' : 'text-red-600'}>{book.available_copies}</span>
                        <span className="text-gray-300 mx-1">/</span>
                        <span className="text-gray-400">{book.total_copies}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditBook({ ...book })}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl shadow-sm border border-transparent hover:border-indigo-100 transition-all"
                        ><Edit size={18} /></button>
                        <button
                          onClick={() => setDeleteConfirm(book)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl shadow-sm border border-transparent hover:border-red-100 transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ) : activeTab === 'loans' ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Loan Details</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loans.map((loan) => (
                  <motion.tr key={loan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <p className="font-black text-gray-900 leading-tight">{loan.book_title}</p>
                        <p className="text-xs text-gray-400 font-bold mt-1 flex items-center gap-1"><Users size={11} /> {userName(loan)}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm text-gray-500 font-medium"><Calendar size={14} className="mr-2 opacity-40" /> {new Date(loan.due_date).toLocaleDateString()}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${loan.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>{loan.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {loan.status === 'active' && (
                        <button onClick={() => handleReturnBook(loan.id)} className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">Mark Returned</button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ) : activeTab === 'issued' ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center"><BookMarked size={20} className="mr-2 text-orange-500" /> Issued Books</h2>
                <span className="px-3 py-1 rounded-lg bg-orange-100 text-orange-600 text-xs font-black">{filteredIssuedBooks.length} Active</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by book name or user ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="ontime">On Time</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">#</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Book Name</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Member</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Issue Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Due Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Days Left</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredIssuedBooks.length === 0 ? (
                  <tr><td colSpan={7} className="px-8 py-12 text-center text-gray-400 font-medium">No issued books found.</td></tr>
                ) : (
                  filteredIssuedBooks.map((loan, index) => {
                    const daysLeft = Math.ceil((new Date(loan.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                    const isOverdue = daysLeft < 0;
                    return (
                      <motion.tr key={loan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-orange-50/30 transition-colors">
                        <td className="px-8 py-6 text-sm font-black text-gray-400">{index + 1}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center mr-3"><BookMarked size={16} className="text-orange-500" /></div>
                            <p className="font-black text-gray-900">{loan.book_title}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-xs flex-shrink-0">{userName(loan).charAt(0).toUpperCase()}</div>
                            <span className="text-sm font-bold text-gray-700">{userName(loan)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center text-sm text-gray-500 font-medium"><Calendar size={14} className="mr-2 opacity-40" />{new Date(loan.issue_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center text-sm font-medium">
                            <Calendar size={14} className="mr-2 opacity-40" />
                            <span className={isOverdue ? 'text-red-500' : 'text-gray-500'}>
                              {new Date(loan.due_date).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-lg text-xs font-black ${isOverdue ? 'bg-red-100 text-red-600' : daysLeft <= 3 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                            {isOverdue ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button onClick={() => handleReturnBook(loan.id)} className="px-4 py-2 bg-orange-500 text-white text-xs font-black rounded-xl hover:bg-orange-600 transition-all shadow-lg shadow-orange-200">Mark Returned</button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
        ) : activeTab === 'reservations' ? (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center"><BookCheck size={20} className="mr-2 text-purple-600" /> Reservations</h2>
                <span className="px-3 py-1 rounded-lg bg-purple-100 text-purple-600 text-xs font-black">{filteredReservations.length} Total</span>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by book name or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">#</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Book Name</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Member</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Reserved On</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReservations.length === 0 ? (
                  <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-400 font-medium">No reservations found.</td></tr>
                ) : (
                  filteredReservations.map((res, index) => (
                    <motion.tr key={res.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-purple-50/30 transition-colors">
                      <td className="px-8 py-6 text-sm font-black text-gray-400">{index + 1}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center mr-3"><BookCheck size={16} className="text-purple-600" /></div>
                          <p className="font-black text-gray-900">{res.book_title}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-black text-xs flex-shrink-0">{userName(res).charAt(0).toUpperCase()}</div>
                          <span className="text-sm font-bold text-gray-700">{userName(res)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center text-sm text-gray-500 font-medium"><Calendar size={14} className="mr-2 opacity-40" />{new Date(res.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          res.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                          res.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-green-100 text-green-600'
                        }`}>{res.status}</span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {res.status === 'pending' && (
                          <button onClick={() => handleCancelReservation(res.id)} className="px-4 py-2 bg-red-500 text-white text-xs font-black rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-200">Cancel</button>
                        )}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-gray-900 flex items-center"><RotateCcw size={20} className="mr-2 text-green-600" /> Returned Books</h2>
                <span className="px-3 py-1 rounded-lg bg-green-100 text-green-600 text-xs font-black">{filteredReturnedBooks.length} Returned</span>
              </div>
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by book name or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">#</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Book Name</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Member</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Issue Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Return Date</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Duration</th>
                  <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReturnedBooks.length === 0 ? (
                  <tr><td colSpan={7} className="px-8 py-12 text-center text-gray-400 font-medium">No returned books found.</td></tr>
                ) : (
                  filteredReturnedBooks.map((loan, index) => {
                    const daysUsed = Math.ceil((new Date(loan.return_date) - new Date(loan.issue_date)) / (1000 * 60 * 60 * 24));
                    const wasLate = new Date(loan.return_date) > new Date(loan.due_date);
                    return (
                      <motion.tr key={loan.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-green-50/30 transition-colors">
                        <td className="px-8 py-6 text-sm font-black text-gray-400">{index + 1}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center mr-3"><RotateCcw size={16} className="text-green-600" /></div>
                            <p className="font-black text-gray-900">{loan.book_title}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-xl bg-green-100 flex items-center justify-center text-green-600 font-black text-xs flex-shrink-0">{userName(loan).charAt(0).toUpperCase()}</div>
                            <span className="text-sm font-bold text-gray-700">{userName(loan)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center text-sm text-gray-500 font-medium"><Calendar size={14} className="mr-2 opacity-40" />{new Date(loan.issue_date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center text-sm text-gray-500 font-medium"><Calendar size={14} className="mr-2 opacity-40" />{loan.return_date ? new Date(loan.return_date).toLocaleDateString() : 'N/A'}</div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-600 text-xs font-black">{daysUsed} days</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${wasLate ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                            {wasLate ? 'Late Return' : 'On Time'}
                          </span>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </main>

      {/* Edit Book Modal */}
      {editBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)'}}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-8 py-6 text-white relative overflow-hidden">
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <h2 className="text-2xl font-black relative z-10">Edit Book</h2>
              <p className="text-indigo-100 text-sm font-medium mt-1 relative z-10">Update the book details below</p>
            </div>

            <div className="p-8 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Cover preview + QR Code */}
              <div className="flex items-center justify-center gap-6">
                {editBook.thumbnail_url && (
                  <img src={editBook.thumbnail_url} alt="cover" className="h-32 rounded-2xl shadow-md object-cover" />
                )}
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-100">
                    <QRCodeSVG
                      value={`${window.location.origin}/books/${editBook.id}`}
                      size={100}
                      bgColor="#ffffff"
                      fgColor="#4f46e5"
                      level="M"
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                    <QrCode size={10} /> Book QR Code
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Title</label>
                  <input name="title" value={editBook.title || ''} onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Author</label>
                  <input name="author" value={editBook.author || ''} onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">ISBN</label>
                  <input name="isbn" value={editBook.isbn || ''} onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Category</label>
                  <input name="category" value={editBook.category || ''} onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Total Copies</label>
                  <input name="total_copies" type="number" min="1" value={editBook.total_copies || 1} onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Cover Image URL</label>
                  <input name="thumbnail_url" value={editBook.thumbnail_url || ''} onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all"
                    placeholder="https://..." />
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Description</label>
                <textarea name="description" rows={4} value={editBook.description || ''} onChange={handleEditChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all resize-none" />
              </div>
            </div>

            <div className="flex gap-3 px-8 pb-8">
              <button onClick={() => setEditBook(null)}
                className="flex-1 py-3 rounded-2xl font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editLoading}
                className="flex-1 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2">
                {editLoading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)'}}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full border border-red-100"
          >
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Trash2 size={28} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 text-center mb-2">Delete Book?</h2>
            <p className="text-gray-500 text-center font-medium mb-2">
              You are about to permanently delete
            </p>
            <p className="text-center font-black text-gray-900 text-lg mb-6">"{deleteConfirm.title}"</p>
            <p className="text-xs text-red-400 text-center font-bold mb-8 uppercase tracking-widest">This action cannot be undone</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-3 rounded-2xl font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteBook(deleteConfirm.id)}
                className="flex-1 py-3 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-200"
              >
                Yes, Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;