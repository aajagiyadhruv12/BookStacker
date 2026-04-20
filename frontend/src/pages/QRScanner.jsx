import React, { useEffect, useRef, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, BookOpen, RotateCcw, BookMarked, ShieldCheck, X, Camera, CheckCircle, AlertCircle, Calendar, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const QRScanner = () => {
  const { isAdmin } = useAuth();
  const html5QrRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [tab, setTab] = useState('details');
  const [returningId, setReturningId] = useState(null);

  useEffect(() => () => stopScanner(), []);

  const startScanner = async () => {
    if (html5QrRef.current) return;
    try {
      const html5Qr = new Html5Qrcode('qr-reader');
      html5QrRef.current = html5Qr;
      await html5Qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        onScanSuccess,
        () => {}
      );
      setScanning(true);
    } catch {
      toast.error('Camera access denied or not available');
    }
  };

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try { await html5QrRef.current.stop(); } catch {}
      html5QrRef.current = null;
    }
    setScanning(false);
  };

  const loadBookData = async (bookId) => {
    setLoadingResult(true);
    try {
      const [bookRes, loansRes, usersRes] = await Promise.all([
        api.get(`/books/${bookId}`),
        api.get('/loans'),
        api.get('/users'),
      ]);
      const bookLoans = loansRes.data.filter(l => l.book_id === bookId);
      // Build user map id -> name
      const userMap = {};
      usersRes.data.forEach(u => { userMap[u.id] = u.name || u.email; });
      setResult({ book: bookRes.data, loans: bookLoans, userMap });
      setTab('details');
    } catch {
      toast.error('Book not found');
    } finally {
      setLoadingResult(false);
    }
  };

  const onScanSuccess = async (decodedText) => {
    await stopScanner();
    const match = decodedText.match(/\/books\/([a-zA-Z0-9]+)/);
    if (!match) {
      toast.error('Invalid QR — not a BookStacker book');
      return;
    }
    await loadBookData(match[1]);
  };

  const handleReturn = async (loanId, bookId) => {
    setReturningId(loanId);
    try {
      await api.post(`/loans/return/${loanId}`);
      toast.success('Book returned successfully!');
      await loadBookData(bookId);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to return book');
    } finally {
      setReturningId(null);
    }
  };

  const issuedLoans = result?.loans.filter(l => l.status === 'active') || [];
  const returnedLoans = result?.loans.filter(l => l.status === 'returned') || [];

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)'}}>
        <div className="text-center p-12 glass rounded-[2rem] shadow-xl">
          <ShieldCheck size={64} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-black text-gray-900 mb-2">Admin Only</h1>
          <p className="text-gray-500 font-medium">QR Scanner is only available to administrators.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)'}}>
      <Navbar />
      <main className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
            <QrCode size={36} className="text-indigo-600" /> QR Book Scanner
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Scan a book QR to view details, loans and return books instantly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-4 text-white">
              <h2 className="font-black text-lg flex items-center gap-2"><Camera size={20} /> Camera Scanner</h2>
            </div>
            <div className="p-6">
              {/* Scanner viewport */}
              <div className="relative w-full rounded-2xl overflow-hidden bg-gray-50" style={{minHeight: 260}}>
                <div id="qr-reader" className="w-full" />
                {!scanning && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                    <QrCode size={52} className="text-gray-200 mb-3" />
                    <p className="text-gray-400 font-bold text-sm">Camera is off</p>
                    <p className="text-gray-300 text-xs mt-1">Press Start to activate camera</p>
                  </div>
                )}
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-indigo-400 rounded-2xl opacity-60" />
                  </div>
                )}
              </div>

              <div className="mt-4 flex gap-3">
                {!scanning ? (
                  <button onClick={startScanner}
                    className="flex-1 py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-200">
                    <Camera size={18} /> Start Scanning
                  </button>
                ) : (
                  <button onClick={stopScanner}
                    className="flex-1 py-3.5 bg-red-500 text-white rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg shadow-red-200">
                    <X size={18} /> Stop Scanner
                  </button>
                )}
                {result && (
                  <button onClick={() => setResult(null)}
                    className="px-5 py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">
                    Clear
                  </button>
                )}
              </div>

              {scanning && (
                <p className="text-center text-xs text-indigo-500 font-bold mt-3 animate-pulse">
                  📷 Point camera at a book QR code...
                </p>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between">
              <h2 className="font-black text-lg flex items-center gap-2"><BookOpen size={20} /> Scan Result</h2>
              {result && (
                <button onClick={() => loadBookData(result.book.id)} className="p-1.5 hover:bg-white/20 rounded-xl transition-all" title="Refresh">
                  <RefreshCw size={16} />
                </button>
              )}
            </div>
            <div className="p-6">
              {loadingResult ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest animate-pulse">Loading...</p>
                </div>
              ) : !result ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <QrCode size={52} className="text-gray-200 mb-3" />
                  <p className="text-gray-400 font-bold">No scan result yet</p>
                  <p className="text-gray-300 text-xs mt-1">Start scanner and scan a book QR code</p>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    {/* Tabs */}
                    <div className="flex gap-1 mb-5 bg-gray-50 p-1 rounded-2xl">
                      {[
                        { key: 'details', label: 'Book Info', icon: BookOpen },
                        { key: 'issued', label: `Issued (${issuedLoans.length})`, icon: BookMarked },
                        { key: 'returned', label: `Returned (${returnedLoans.length})`, icon: RotateCcw },
                      ].map(t => (
                        <button key={t.key} onClick={() => setTab(t.key)}
                          className={`flex-1 py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all ${
                            tab === t.key ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                          }`}>
                          <t.icon size={12} /> {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Book Details Tab */}
                    {tab === 'details' && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 bg-indigo-50 rounded-2xl">
                          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <BookOpen size={22} className="text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-gray-900 text-lg leading-tight truncate">{result.book.title}</p>
                            <p className="text-sm text-gray-500 font-bold truncate">{result.book.author}</p>
                          </div>
                        </div>
                        {[
                          ['ISBN', result.book.isbn || 'N/A'],
                          ['Category', result.book.category || 'N/A'],
                          ['Total Copies', result.book.total_copies],
                          ['Available', result.book.available_copies],
                        ].map(([label, value]) => (
                          <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{label}</span>
                            <span className="font-bold text-gray-800 text-sm">{value}</span>
                          </div>
                        ))}
                        <div className="pt-1">
                          <span className={`inline-block px-3 py-1.5 rounded-xl text-xs font-black uppercase ${
                            result.book.available_copies > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {result.book.available_copies > 0 ? `✓ ${result.book.available_copies} In Stock` : '✗ Out of Stock'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Issued Tab */}
                    {tab === 'issued' && (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {issuedLoans.length === 0 ? (
                          <div className="text-center py-10">
                            <CheckCircle size={36} className="mx-auto text-gray-200 mb-2" />
                            <p className="text-gray-400 font-bold text-sm">No active loans</p>
                          </div>
                        ) : issuedLoans.map(loan => {
                          const overdue = new Date(loan.due_date) < new Date();
                          const daysLeft = Math.ceil((new Date(loan.due_date) - new Date()) / (1000 * 60 * 60 * 24));
                          const userName = result.userMap[loan.user_id] || loan.user_id;
                          return (
                            <div key={loan.id} className={`p-4 rounded-2xl border ${overdue ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'}`}>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div className="min-w-0">
                                  <p className="font-black text-gray-900 text-sm truncate">{userName}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                      <Calendar size={9} /> {new Date(loan.issue_date).toLocaleDateString()}
                                    </span>
                                    <span className={`flex items-center gap-1 text-[10px] font-bold ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                                      <AlertCircle size={9} /> Due: {new Date(loan.due_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ${
                                  overdue ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                }`}>
                                  {overdue ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                                </span>
                              </div>
                              <button
                                onClick={() => handleReturn(loan.id, result.book.id)}
                                disabled={returningId === loan.id}
                                className="w-full py-2 bg-indigo-600 text-white text-xs font-black rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 mt-1"
                              >
                                {returningId === loan.id
                                  ? <><span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Returning...</>
                                  : <><RotateCcw size={12} /> Mark as Returned</>
                                }
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Returned Tab */}
                    {tab === 'returned' && (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {returnedLoans.length === 0 ? (
                          <div className="text-center py-10">
                            <RotateCcw size={36} className="mx-auto text-gray-200 mb-2" />
                            <p className="text-gray-400 font-bold text-sm">No returned loans yet</p>
                          </div>
                        ) : returnedLoans.map(loan => {
                          const userName = result.userMap[loan.user_id] || loan.user_id;
                          const wasLate = loan.return_date && new Date(loan.return_date) > new Date(loan.due_date);
                          return (
                            <div key={loan.id} className="p-4 bg-green-50 border border-green-100 rounded-2xl">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="font-black text-gray-900 text-sm truncate">{userName}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                                      <Calendar size={9} /> {new Date(loan.issue_date).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold">
                                      <CheckCircle size={9} /> {loan.return_date ? new Date(loan.return_date).toLocaleDateString() : 'N/A'}
                                    </span>
                                  </div>
                                </div>
                                <span className={`text-[10px] font-black px-2 py-1 rounded-lg flex-shrink-0 ${
                                  wasLate ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-600'
                                }`}>
                                  {wasLate ? 'Late' : 'On Time'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default QRScanner;
