import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { BookOpen, User, Tag, CheckCircle, XCircle, FileText, Calendar, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);

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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-blue-600 mb-6 transition">
          <ArrowLeft size={20} className="mr-2" /> Back to Library
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Book Image */}
            <div className="md:w-1/3 bg-gray-200 aspect-[2/3] relative">
              {book.thumbnail_url ? (
                <img src={book.thumbnail_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 italic text-center p-8">
                  No Thumbnail Available
                </div>
              )}
            </div>

            {/* Book Details */}
            <div className="md:w-2/3 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${book.available_copies > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {book.available_copies > 0 ? `${book.available_copies} Copies Available` : 'Currently Out of Stock'}
                  </span>
                  <span className="text-gray-400 text-sm font-medium">ISBN: {book.isbn || 'N/A'}</span>
                </div>

                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{book.title}</h1>
                <p className="text-xl text-gray-600 flex items-center mb-6">
                  <User size={20} className="mr-2 text-blue-500" /> {book.author}
                </p>

                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="flex items-center text-gray-700">
                    <Tag size={20} className="mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Category</p>
                      <p className="font-medium">{book.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <BookOpen size={20} className="mr-3 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold">Total Copies</p>
                      <p className="font-medium">{book.total_copies}</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-blue text-gray-600 max-w-none mb-8">
                  <p>{book.description || "No description available for this book yet."}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-100">
                {book.available_copies > 0 ? (
                  <button
                    onClick={handleIssue}
                    disabled={issuing}
                    className="flex-1 bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition transform hover:-translate-y-1 active:scale-95 disabled:opacity-50"
                  >
                    {issuing ? 'Processing...' : 'Issue Book Now'}
                  </button>
                ) : (
                  <button
                    onClick={handleReserve}
                    className="flex-1 bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition transform hover:-translate-y-1 active:scale-95"
                  >
                    Reserve for Later
                  </button>
                )}
                
                {book.pdf_url && (
                  <a
                    href={book.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-gray-800 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-900 transition transform hover:-translate-y-1 active:scale-95"
                  >
                    <FileText size={20} className="mr-2" /> Read PDF
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BookDetail;
