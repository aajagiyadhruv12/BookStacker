import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { BookOpen, User, Hash, FileText, Image as ImageIcon, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const AddBook = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    description: '',
    image_url: '',
    total_copies: 1
  });

  if (!isAdmin) {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
    <div className="min-h-screen bg-[#F8FAFC]">
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
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-10 py-12 text-white">
            <h1 className="text-4xl font-black tracking-tight">Add New Book</h1>
            <p className="mt-2 text-blue-100 font-medium">Register a new addition to the library's collection.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

            {/* Image URL */}
            <div className="space-y-2 group">
              <label className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">Cover Image URL</label>
              <div className="relative">
                <ImageIcon className={iconClasses} size={20} />
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className={inputClasses}
                  placeholder="https://example.com/book-cover.jpg"
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
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
