import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Search, Book as BookIcon, ChevronRight, Grid, List as ListIcon, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const getBookCover = (book) => {
  if (book.thumbnail_url) return book.thumbnail_url;
  if (book.image_url) return book.image_url;
  if (book.isbn) return `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`;
  return null;
};

const COVER_COLORS = [
  'from-indigo-400 to-violet-500',
  'from-blue-400 to-cyan-500',
  'from-violet-400 to-purple-600',
  'from-emerald-400 to-teal-500',
  'from-rose-400 to-pink-500',
  'from-amber-400 to-orange-500',
];

// Deterministic fake rating from book title (so it's consistent per book)
const getBookRating = (title) => {
  const seed = (title || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return 3.5 + (seed % 15) / 10; // 3.5 – 4.9
};

const StarRating = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={10}
          className={i <= full ? 'text-amber-400 fill-amber-400' : i === full + 1 && half ? 'text-amber-400 fill-amber-200' : 'text-gray-200 fill-gray-200'}
        />
      ))}
      <span className="text-[10px] font-black text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </div>
  );
};

const BookCover = ({ book }) => {
  const [src, setSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const direct = getBookCover(book);
    if (direct) { setSrc(direct); setLoading(false); return; }
    const query = encodeURIComponent(book.title);
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=1`)
      .then(r => r.json())
      .then(data => {
        const thumb = data?.items?.[0]?.volumeInfo?.imageLinks?.thumbnail;
        if (thumb) setSrc(thumb.replace('http://', 'https://'));
        else setFailed(true);
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [book.id]);

  const colorClass = COVER_COLORS[(book.title?.charCodeAt(0) || 0) % COVER_COLORS.length];
  const fillStyle = { position: 'absolute', inset: 0, width: '100%', height: '100%' };

  if (loading) return <div style={fillStyle} className="shimmer" />;
  if (failed || !src) {
    return (
      <div style={fillStyle} className={`bg-gradient-to-br ${colorClass} flex flex-col items-center justify-center gap-2 p-4`}>
        <BookIcon size={36} className="text-white/70" />
        <span className="text-[11px] font-black text-white text-center leading-tight line-clamp-3 px-1">{book.title}</span>
        <span className="text-[10px] text-white/70 font-bold text-center line-clamp-1">{book.author}</span>
      </div>
    );
  }
  return <img src={src} alt={book.title} style={fillStyle} className="object-cover" loading="lazy" onError={() => setFailed(true)} />;
};

// ── Empty State ──────────────────────────────────────────────────────────────
const EmptyBooks = ({ searchTerm, activeCategory }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-24 px-8"
  >
    {/* SVG illustration */}
    <div className="relative mb-8">
      <div className="w-40 h-40 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-[3rem] flex items-center justify-center shadow-xl shadow-indigo-100">
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
          <rect x="10" y="15" width="28" height="38" rx="4" fill="#6366f1" opacity="0.2"/>
          <rect x="14" y="11" width="28" height="38" rx="4" fill="#6366f1" opacity="0.4"/>
          <rect x="18" y="7" width="28" height="38" rx="4" fill="#6366f1"/>
          <rect x="22" y="14" width="16" height="2" rx="1" fill="white" opacity="0.7"/>
          <rect x="22" y="19" width="12" height="2" rx="1" fill="white" opacity="0.5"/>
          <rect x="22" y="24" width="14" height="2" rx="1" fill="white" opacity="0.5"/>
          <circle cx="58" cy="52" r="14" fill="#e0e7ff"/>
          <circle cx="58" cy="52" r="10" fill="white" stroke="#6366f1" strokeWidth="2"/>
          <line x1="65" y1="59" x2="72" y2="66" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="54" y1="52" x2="62" y2="52" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
          <line x1="58" y1="48" x2="58" y2="56" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg">
        <Sparkles size={16} className="text-white" />
      </div>
    </div>
    <h3 className="text-2xl font-black text-gray-900 mb-2">No books found</h3>
    <p className="text-gray-400 font-medium text-center max-w-xs leading-relaxed">
      {searchTerm
        ? `No results for "${searchTerm}". Try a different title or author.`
        : activeCategory !== 'All'
        ? `No books in the "${activeCategory}" category yet.`
        : 'The library is empty. Ask an admin to add some books!'}
    </p>
  </motion.div>
);

// ── Category chips ────────────────────────────────────────────────────────────
const CATEGORIES = ['All', 'Fiction', 'Science', 'History', 'Technology', 'Biography', 'Fantasy', 'Mystery', 'Self-Help', 'Romance'];

const BookList = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => { fetchBooks(); }, []);

  const fetchBooks = async () => {
    try {
      const response = await api.get('/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      activeCategory === 'All' ||
      (book.category || '').toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="max-w-2xl">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-3"
            >
              Discover Your Next{' '}
              <span className="gradient-text">Great Read</span>
            </motion.h1>
            <p className="text-gray-500 text-base sm:text-lg font-medium leading-relaxed">
              Explore our curated collection — from timeless classics to modern bestsellers.
            </p>
          </div>

          {/* View toggle */}
          <div className="bg-white p-1 rounded-2xl shadow-sm border border-gray-100 flex self-start md:self-auto">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
              <ListIcon size={18} />
            </button>
          </div>
        </div>

        {/* Search bar */}
        <div className="bg-white p-3 rounded-[2rem] shadow-sm border border-gray-100 mb-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by title or author..."
              className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-400 outline-none text-gray-900 font-medium placeholder:text-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map(cat => (
            <motion.button
              key={cat}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-sm font-black transition-all duration-200 border ${
                activeCategory === cat
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                  : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              {cat}
            </motion.button>
          ))}
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
            {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'} found
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin" />
            </div>
            <p className="text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Curating Library...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <EmptyBooks searchTerm={searchTerm} activeCategory={activeCategory} />
        ) : (
          <AnimatePresence mode="popLayout">
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6'
              : 'space-y-4'}>
              {filteredBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25, delay: index * 0.03 }}
                >
                  {viewMode === 'grid' ? (
                    <Link to={`/books/${book.id}`} className="group block">
                      <div className="relative aspect-[2/3] rounded-[1.75rem] overflow-hidden shadow-md group-hover:shadow-2xl group-hover:shadow-indigo-200/60 group-hover:-translate-y-3 transition-all duration-500">
                        <BookCover book={book} />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 flex flex-col justify-end p-4">
                          <span className="text-white text-xs font-black uppercase tracking-widest">View Details →</span>
                        </div>
                        {/* Stock badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg backdrop-blur-sm ${book.available_copies > 0 ? 'bg-emerald-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
                            {book.available_copies > 0 ? 'In Stock' : 'OOS'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-3 px-1">
                        <h3 className="font-black text-gray-900 text-sm leading-tight line-clamp-2 group-hover:text-indigo-600 transition-colors">{book.title}</h3>
                        <p className="text-[11px] text-gray-400 font-bold mt-0.5 uppercase tracking-tighter line-clamp-1">{book.author}</p>
                        <div className="mt-1.5">
                          <StarRating rating={getBookRating(book.title)} />
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <Link to={`/books/${book.id}`}
                      className="flex items-center p-4 bg-white rounded-3xl border border-gray-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50 transition-all duration-300 group">
                      <div className="w-14 h-20 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 shadow-md relative">
                        <BookCover book={book} />
                      </div>
                      <div className="flex-1 ml-5">
                        <h3 className="font-black text-gray-900 text-lg group-hover:text-indigo-600 transition-colors leading-tight">{book.title}</h3>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <p className="text-gray-400 font-bold uppercase tracking-tighter text-xs">{book.author}</p>
                          {book.category && (
                            <>
                              <span className="w-1 h-1 bg-gray-200 rounded-full" />
                              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-500 rounded-lg text-[10px] font-black uppercase tracking-widest">{book.category}</span>
                            </>
                          )}
                        </div>
                        <div className="mt-2">
                          <StarRating rating={getBookRating(book.title)} />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pr-2">
                        <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${book.available_copies > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                          {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                        </span>
                        <ChevronRight className="text-gray-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" size={20} />
                      </div>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>
    </div>
  );
};

export default BookList;
