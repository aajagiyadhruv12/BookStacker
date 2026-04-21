import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Book, Mail, Lock, User, ArrowRight, Star, Zap, Shield } from 'lucide-react';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role: 'member',
        created_at: new Date().toISOString()
      });
      toast.success('Welcome to BookStacker! 🎉');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    { icon: Star,   text: 'Access 10,000+ books instantly' },
    { icon: Zap,    text: 'Real-time availability tracking' },
    { icon: Shield, text: 'Reserve books before they run out' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">

      {/* ── Left Panel ── */}
      <div className="hidden md:flex md:w-1/2 p-12 flex-col justify-between text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 40%, #4f46e5 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-20 w-72 h-72 bg-violet-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-14">
            <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl shadow-lg">
              <Book size={28} />
            </div>
            <span className="text-2xl font-black tracking-tight">BookStacker</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl font-black leading-tight mb-5">
              Start your<br />
              <span className="text-violet-200 text-6xl italic">reading journey.</span>
            </h1>
            <p className="text-lg text-violet-100 font-medium max-w-sm leading-relaxed mb-10">
              Join thousands of readers. Create your free account and unlock the full library experience.
            </p>

            {/* Perks list */}
            <div className="space-y-4">
              {perks.map(({ icon: Icon, text }, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.12 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={16} />
                  </div>
                  <span className="text-violet-100 font-semibold text-sm">{text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom stats */}
        <div className="relative z-10 flex items-center space-x-10 opacity-60">
          {[['10k+', 'Books'], ['5k+', 'Members'], ['Free', 'Forever']].map(([val, label]) => (
            <div key={label} className="flex flex-col">
              <span className="text-2xl font-black">{val}</span>
              <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center min-h-screen bg-white px-6 py-12 sm:px-10">
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-2 mb-8">
            <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2 rounded-xl shadow-lg">
              <Book size={20} className="text-white" />
            </div>
            <span className="text-xl font-black"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              BookStacker
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-1">Create Account</h2>
            <p className="text-gray-500 font-medium text-sm">Fill in your details to get started for free.</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-violet-400 focus:bg-white outline-none text-gray-900 font-medium transition-all text-sm"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-violet-400 focus:bg-white outline-none text-gray-900 font-medium transition-all text-sm"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-black text-gray-600 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-violet-400 focus:bg-white outline-none text-gray-900 font-medium transition-all text-sm"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all mt-2 ${
                loading
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-violet-200'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>Create Account <ArrowRight size={20} /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-8">
            <div className="w-full h-px bg-gray-100" />
            <span className="absolute bg-white px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
              Already a member?
            </span>
          </div>

          <Link to="/login"
            className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-gray-100 rounded-2xl font-black text-gray-700 hover:border-violet-200 hover:text-violet-600 hover:bg-violet-50 transition-all">
            Sign In Instead
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
