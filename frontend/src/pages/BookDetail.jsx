import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, Tag, FileText, ArrowLeft, Book as BookIcon, Edit, Loader2, X, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const getBookCover = (book) => {
  if (book.thumbnail_url) return book.thumbnail_url;
  if (book.image_url) return book.image_url;
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
  return null;
};

const COVER_COLORS = [
  'from-indigo-400 to-violet-500', 'from-blue-400 to-cyan-500',
  'from-violet-400 to-purple-600', 'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500', 'from-amber-400 to-orange-500',
];

const BookCoverDetail = ({ book }) => {
  const [src, setSrc] = useState(null);
  const [imgLoading, setImgLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const colorClass = COVER_COLORS[(book.title?.charCodeAt(0) || 0) % COVER_COLORS.length];
  const fillStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%' };

  useEffect(() => {
    const direct = getBookCover(book);
    if (direct) {
      setSrc(direct);
      setImgLoading(false);
      return;
    }
    const query = encodeURIComponent(book.title);
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`)
      .then(r => r.json())
      .then(data => {
        const thumb = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (thumb) setSrc(thumb.replace('http://', 'https://'));
        else setFailed(true);
      })
      .catch(() => setFailed(true))
      .finally(() => setImgLoading(false));
  }, [book.id]);

  if (imgLoading) return <div style={fillStyle} className="shimmer" />;

  if (failed || !src) {
    return (
      <div style={fillStyle} className={`bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center gap-3 p-6`}>
        <BookIcon size={48} className="text-white/70" />
        <span className="text-sm font-black text-white text-center leading-tight">{book.title}</span>
        <span className="text-xs text-white/70 font-bold text-center">{book.author}</span>
      </div>
    );
  }

  return <img src={src} alt={book.title} style={fillStyle} className="object-cover" onError={() => setFailed(true)} />;
};

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editData, setEditData] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const openEdit = () => { setEditData({ ...book }); setEditOpen(true); };
  const handleEditChange = (e) => setEditData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleEditSave = async () => {
    setEditLoading(true);
    try {
      await api.put(`/books/${id}`, editData);
      toast.success('Book updated!');
      setBook({ ...book, ...editData });
      setEditOpen(false);
    } catch {
      toast.error('Failed to update book');
    } finally {
      setEditLoading(false);
    }
  };

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        setBook(response.data);
      } catch (error) {
        toast.error('Book not found');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [id, navigate]);

  const handleIssue = async () => {
    if (!user) {
      toast.error('Please login to issue a book');
      return;
    }
    setIssuing(true);
    try {
      await api.post('/loans/issue', {
        user_id: user.uid,
        book_id: id
      });
      toast.success('Book issued successfully!');
      // Update local state
      setBook({ ...book, available_copies: book.available_copies - 1 });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to issue book');
    } finally {
      setIssuing(false);
    }
  };

  const handleReserve = async () => {
    if (!user) {
      toast.error('Please login to reserve a book');
      return;
    }
    try {
      await api.post('/reservations', {
        user_id: user.uid,
        book_id: id
      });
      toast.success('Reservation successful!');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reserve');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)'}}>
        <Navbar />
        <div className="flex flex-col justify-center items-center h-64 gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)'}}>
      <Navbar />
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-indigo-600 mb-8 transition-all font-bold group">
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Library
        </button>

        <div className="glass rounded-[2.5rem] overflow-hidden">
          {/* Hero Banner */}
          <div className="relative h-48 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '60px 60px'}}></div>
            <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -top-8 -left-8 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-4 left-8">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg ${
                book.available_copies > 0 ? 'bg-emerald-400 text-white' : 'bg-red-400 text-white'
              }`}>
                {book.available_copies > 0 ? `✓ ${book.available_copies} Available` : '✗ Out of Stock'}
              </span>
            </div>
            {/* Admin Edit Button in banner */}
            {isAdmin && (
              <button
                onClick={openEdit}
                className="absolute top-4 right-6 flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-xl font-black text-sm transition-all border border-white/30"
              >
                <Edit size={16} /> Edit Book
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-0">
            {/* Book Cover */}
            <div className="md:w-64 flex-shrink-0 flex justify-center md:justify-start px-6 sm:px-8 -mt-20 pb-6 md:pb-0">
              <div className="w-40 h-56 md:w-48 md:h-64 rounded-2xl overflow-hidden shadow-2xl shadow-indigo-900/30 border-4 border-white float relative">
                <BookCoverDetail book={book} />
              </div>
            </div>

            {/* Book Details */}
            <div className="flex-1 p-8 pt-4 md:pt-8 flex flex-col justify-between">
              <div>
                <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">ISBN: {book.isbn || 'N/A'}</span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 mt-2 mb-2 leading-tight">{book.title}</h1>
                <p className="text-xl text-gray-500 flex items-center mb-6 font-semibold">
                  <User size={18} className="mr-2 text-indigo-400" /> {book.author}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="glass p-4 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-xl"><Tag size={16} className="text-indigo-500" /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Category</p>
                      <p className="font-bold text-gray-800 text-sm">{book.category}</p>
                    </div>
                  </div>
                  <div className="glass p-4 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-violet-50 rounded-xl"><BookOpen size={16} className="text-violet-500" /></div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Total Copies</p>
                      <p className="font-bold text-gray-800 text-sm">{book.total_copies}</p>
                    </div>
                  </div>
                </div>

                <div className="text-gray-600 leading-relaxed mb-6 text-sm">
                  {book.description || 'No description available for this book yet.'}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-100">
                {book.available_copies > 0 ? (
                  <button
                    onClick={handleIssue}
                    disabled={issuing}
                    className="flex-1 btn-glow bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-3.5 rounded-2xl font-black hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-200"
                  >
                    {issuing ? 'Processing...' : '📖 Issue Book Now'}
                  </button>
                ) : (
                  <button
                    onClick={handleReserve}
                    className="flex-1 btn-glow bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3.5 rounded-2xl font-black hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg shadow-orange-200"
                  >
                    🔔 Reserve for Later
                  </button>
                )}
                
                {book.pdf_url && (
                  <a
                    href={book.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-glow flex items-center justify-center bg-gray-900 text-white px-6 py-3.5 rounded-2xl font-black hover:bg-gray-800 transition-all shadow-lg"
                  >
                    <FileText size={18} className="mr-2" /> Read PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)'}}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-8 py-6 text-white flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">Edit Book</h2>
                <p className="text-indigo-100 text-sm font-medium mt-0.5">Update the details below and save</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-5 max-h-[65vh] overflow-y-auto">
              {/* Cover + QR */}
              <div className="flex items-center justify-center gap-6">
                {editData.thumbnail_url && (
                  <img src={editData.thumbnail_url} alt="cover" className="h-28 rounded-2xl shadow-md object-cover" />
                )}
                <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-100">
                    <QRCodeSVG
                      value={`${window.location.origin}/books/${id}`}
                      size={90}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[['title','Title'],['author','Author'],['isbn','ISBN'],['category','Category']].map(([field, label]) => (
                  <div key={field}>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">{label}</label>
                    <input name={field} value={editData[field] || ''} onChange={handleEditChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all" />
                  </div>
                ))}
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Total Copies</label>
                  <input name="total_copies" type="number" min="1" value={editData.total_copies || 1} onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all" />
                </div>
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Cover Image URL</label>
                  <input name="thumbnail_url" value={editData.thumbnail_url || ''} onChange={handleEditChange}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all"
                    placeholder="https://..." />
                </div>
              </div>
              <div>
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Description</label>
                <textarea name="description" rows={4} value={editData.description || ''} onChange={handleEditChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white outline-none font-medium text-gray-900 transition-all resize-none" />
              </div>
            </div>

            <div className="flex gap-3 px-8 pb-8">
              <button onClick={() => setEditOpen(false)}
                className="flex-1 py-3 rounded-2xl font-black text-gray-600 bg-gray-100 hover:bg-gray-200 transition-all">
                Cancel
              </button>
              <button onClick={handleEditSave} disabled={editLoading}
                className="flex-1 py-3 rounded-2xl font-black text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-60 flex items-center justify-center gap-2">
                {editLoading ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
