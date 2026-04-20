import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, BookOpen, Clock, Edit2, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [displayName, setDisplayName] = useState(userData?.name || '');

  const startEditing = () => {
    setEditName(userData?.name || displayName);
    setIsEditing(true);
  };

  const saveProfile = async () => {
    try {
      await api.put(`/users/${user.uid}`, { name: editName });
      setDisplayName(editName);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    }
  };

  const infoItems = [
    { icon: User, label: 'Full Name', value: displayName || userData?.name || 'N/A' },
    { icon: Mail, label: 'Email Address', value: user?.email || 'N/A' },
    { icon: Shield, label: 'Account Role', value: userData?.role || 'Member', isBadge: true },
    { icon: Calendar, label: 'Member Since', value: userData?.created_at ? new Date(userData.created_at).toLocaleDateString() : 'N/A' },
  ];

  return (
    <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #f0f4ff 0%, #faf5ff 50%, #f0fdf4 100%)'}}>
      <Navbar />
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your personal information and account settings.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center"
          >
            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-5xl font-black mb-6 shadow-xl shadow-blue-200">
              {userData?.name?.charAt(0).toUpperCase()}
            </div>
            {isEditing ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-gray-900 text-center text-lg font-bold w-48 focus:ring-2 focus:ring-blue-400 outline-none"
                  autoFocus
                />
                <button onClick={saveProfile} className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors">
                  <Check size={18} />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors">
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-gray-900">{displayName || userData?.name}</h2>
                <button onClick={startEditing} className="text-gray-400 hover:text-blue-500 transition-colors p-1" title="Edit Profile">
                  <Edit2 size={18} />
                </button>
              </div>
            )}
            <p className="text-blue-500 font-bold uppercase tracking-widest text-xs mt-2">{userData?.role}</p>
            <div className="w-full h-px bg-gray-50 my-8"></div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="p-4 bg-gray-50 rounded-2xl">
                <BookOpen className="text-blue-500 mx-auto mb-2" size={20} />
                <p className="text-2xl font-black text-gray-900">{userData?.stats?.read || 0}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Read</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl">
                <Clock className="text-indigo-500 mx-auto mb-2" size={20} />
                <p className="text-2xl font-black text-gray-900">{userData?.stats?.active || 0}</p>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:col-span-2 bg-white p-10 rounded-[2.5rem] shadow-sm border border-gray-100"
          >
            <h3 className="text-xl font-black text-gray-900 mb-8">Account Details</h3>
            <div className="space-y-8">
              {infoItems.map((item, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <item.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                    {item.isBadge ? (
                      <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                        {item.value}
                      </span>
                    ) : (
                      <p className="text-lg font-bold text-gray-900">{item.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;