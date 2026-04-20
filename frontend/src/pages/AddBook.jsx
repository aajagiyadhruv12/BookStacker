import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, User, Hash, FileText, Image as ImageIcon, Plus, ArrowLeft, Loader2, Search, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const AddBook = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [coverSearching, setCoverSearching] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const titleDebounce = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    thumbnail_url: '',
    total_copies: 1
  });

  useEffect(() => {
    if (!isAdmin) navigate('/dashboard');
  }, [isAdmin, navigate]);

  const fetchCoverFromGoogle = async (title, author) => {
    if (!title) return;
    setCoverSearching(true);
    try {
      const q = encodeURIComponent(`${title} ${author}`.trim());
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`);
      const data = await res.json();
      const item = data?.items?.[0];
      const thumb = item?.volumeInfo?.imageLinks?.thumbnail;
      const desc = item?.volumeInfo?.description;
      if (thumb) {
        const url = thumb.replace('http://', 'https://');
        setCoverPreview(url);
        setFormData(prev => ({ ...prev, thumbnail_url: url }));
      }
      if (desc && !formData.description) {
        setFormData(prev => ({ ...prev, description: desc }));
      }
    } catch {}
    finally { setCoverSearching(false); }
  };

  if (!isAdmin) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fetch cover when title changes (debounced)
    if (name === 'title') {
      clearTimeout(titleDebounce.current);
      titleDebounce.current = setTimeout(() => {
        fetchCoverFromGoogle(value, formData.author);
      }, 800);
    }
    if (name === 'thumbnail_url') {
      setCoverPreview(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/books', formData);
      toast.success('Book added successfully!');
      navigate('/books');
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error(error.response?.data?.error || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-medium text-gray-900";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors";

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)'}}>
      <Navbar />
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center text-gray-500 font-bold hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft size={20} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </motion.button>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 sm:px-10 py-12 text-white relative overflow-hidden">
            <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
            <h1 className="text-4xl font-black tracking-tight relative z-10">Add New Book</h1>
            <p className="mt-2 text-indigo-100 font-medium relative z-10">Register a new addition to the library's collection.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Title */}
              <div className="space-y-2 group">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Book Title</label>
                <div className="relative">
                  <BookOpen className={iconClasses} size={20} />
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="The Great Gatsby"
                  />
                </div>
              </div>

              {/* Author */}
              <div className="space-y-2 group">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Author Name</label>
                <div className="relative">
                  <User className={iconClasses} size={20} />
                  <input
                    type="text"
                    name="author"
                    required
                    value={formData.author}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="F. Scott Fitzgerald"
                  />
                </div>
              </div>

              {/* ISBN */}
              <div className="space-y-2 group">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">ISBN Number</label>
                <div className="relative">
                  <Hash className={iconClasses} size={20} />
                  <input
                    type="text"
                    name="isbn"
                    required
                    value={formData.isbn}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="978-0743273565"
                  />
                </div>
              </div>

              {/* Total Copies */}
              <div className="space-y-2 group">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Total Copies</label>
                <div className="relative">
                  <Plus className={iconClasses} size={20} />
                  <input
                    type="number"
                    name="total_copies"
                    required
                    min="1"
                    value={formData.total_copies}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 group">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-6 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <textarea
                  name="description"
                  required
                  rows="4"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClasses} pl-12 pt-5 resize-none`}
                  placeholder="Enter a brief summary of the book..."
                />
              </div>
            </div>

            {/* Cover Preview + Image URL side by side */}
            <div className="space-y-2 group">
              <div className="flex items-center justify-between ml-1 mb-2">
                <label className="text-sm font-black text-gray-400 uppercase tracking-widest">Cover Image</label>
                <button
                  type="button"
                  onClick={() => fetchCoverFromGoogle(formData.title, formData.author)}
                  disabled={coverSearching || !formData.title}
                  className="flex items-center gap-1.5 text-xs font-black text-indigo-500 hover:text-indigo-700 disabled:opacity-40 transition-all"
                >
                  {coverSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                  Auto-fetch from Google Books
                </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* Preview box */}
                <div className="w-24 h-32 rounded-2xl overflow-hidden flex-shrink-0 border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center mx-auto sm:mx-0">
                  {coverSearching ? (
                    <Loader2 size={20} className="text-indigo-400 animate-spin" />
                  ) : coverPreview ? (
                    <img src={coverPreview} alt="cover" className="w-full h-full object-cover" onError={() => setCoverPreview('')} />
                  ) : (
                    <ImageIcon size={24} className="text-gray-300" />
                  )}
                </div>
                {/* URL input */}
                <div className="relative flex-1">
                  <ImageIcon className={iconClasses} size={20} />
                  <input
                    type="url"
                    name="thumbnail_url"
                    value={formData.thumbnail_url}
                    onChange={handleChange}
                    className={inputClasses}
                    placeholder="Paste image URL or auto-fetch above"
                  />
                  {formData.thumbnail_url && (
                    <button
                      type="button"
                      onClick={() => { setFormData(prev => ({ ...prev, thumbnail_url: '' })); setCoverPreview(''); }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-400 transition-colors text-lg font-black"
                    >✕</button>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            className="w-full btn-glow bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} />
                  Processing...
                </>
              ) : (
                'Add Book to Collection'
              )}
            </motion.button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddBook;
