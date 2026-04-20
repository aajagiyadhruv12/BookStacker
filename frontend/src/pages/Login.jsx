import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Book, Mail, Lock, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back to BookStacker! 👋');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row">
      {/* Left Side: Branding/Intro */}
      <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-12">
            <div className="bg-white/20 backdrop-blur-md p-2 rounded-xl">
              <Book size={32} />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">BookStacker</span>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-black leading-tight mb-6">
              The Modern way to <br />
              <span className="text-blue-200 text-7xl italic">Manage Knowledge.</span>
            </h1>
            <p className="text-xl text-blue-100 font-medium max-w-md leading-relaxed">
              Streamline your library operations with real-time tracking, advanced analytics, and a beautiful user experience.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 flex items-center space-x-8 opacity-50">
          <div className="flex flex-col">
            <span className="text-2xl font-black">10k+</span>
            <span className="text-xs font-bold uppercase tracking-widest">Books</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black">5k+</span>
            <span className="text-xs font-bold uppercase tracking-widest">Readers</span>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-black">99.9%</span>
            <span className="text-xs font-bold uppercase tracking-widest">Uptime</span>
          </div>
        </div>

        {/* Decorative Circles */}
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-60 h-60 bg-blue-400/20 rounded-full blur-3xl"></div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-white">
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-4xl font-black text-gray-900 mb-2">Login</h2>
            <p className="text-gray-500 font-medium">Enter your credentials to access your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-gray-700 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 font-medium transition-all"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-black text-gray-700 uppercase tracking-widest">Password</label>
                <Link to="#" className="text-xs font-bold text-blue-600 hover:underline">Forgot Password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-400 outline-none text-gray-900 font-medium transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className={`w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 shadow-xl shadow-gray-200 hover:bg-gray-800 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              {!loading && <ArrowRight size={20} />}
            </motion.button>
          </form>

          <p className="mt-10 text-center text-gray-500 font-medium">
            Don't have an account? <Link to="/register" className="text-blue-600 font-black hover:underline ml-1">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
