import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { Search, Filter, Book as BookIcon, ChevronRight, Grid, List as ListIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-8">
          <div className="max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-5xl font-black text-gray-900 tracking-tight mb-4"
            >
              Discover Your Next <span className="text-blue-600">Great Read</span>
            </motion.h1>
            <p className="text-gray-500 text-lg font-medium leading-relaxed">
              Explore our curated collection of thousands of books, from timeless classics to modern bestsellers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid size={20} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListIcon size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title, author, or genre..."
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 font-medium placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all">
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Curating Library...</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8" : "space-y-4"}>
            <AnimatePresence>
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {viewMode === 'grid' ? (
                    <Link to={`/books/${book.id}`} className="group block h-full">
                      <div className="relative aspect-[2/3] rounded-[2rem] overflow-hidden bg-gray-200 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2 transition-all duration-500">
                        {book.thumbnail_url ? (
                          <img src={book.thumbnail_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 italic p-6 text-center">
                            <BookIcon size={40} className="mb-2 opacity-20" />
                            <span className="text-xs font-bold uppercase tracking-tighter">No Preview</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                          <span className="text-white text-xs font-black uppercase tracking-widest mb-1">View Details</span>
                        </div>
                        <div className="absolute top-4 right-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${book.available_copies > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            {book.available_copies > 0 ? 'In Stock' : 'OOS'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4 px-2">
                        <h3 className="font-black text-gray-900 text-lg leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">{book.title}</h3>
                        <p className="text-sm text-gray-400 font-bold mt-1 uppercase tracking-tighter">{book.author}</p>
                      </div>
                    </Link>
                  ) : (
                    <Link to={`/books/${book.id}`} className="flex items-center p-4 bg-white rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                      <div className="w-16 h-24 rounded-xl overflow-hidden bg-gray-100 mr-6 flex-shrink-0">
                        {book.thumbnail_url ? (
                          <img src={book.thumbnail_url} alt={book.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <BookIcon size={20} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-gray-900 text-xl group-hover:text-blue-600 transition-colors">{book.title}</h3>
                        <div className="flex items-center gap-4 mt-1">
                          <p className="text-gray-400 font-bold uppercase tracking-tighter text-sm">{book.author}</p>
                          <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                          <p className="text-gray-400 font-bold uppercase tracking-tighter text-sm">{book.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 pr-4">
                        <span className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest ${book.available_copies > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                          {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                        </span>
                        <ChevronRight className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" size={20} />
                      </div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default BookList;
