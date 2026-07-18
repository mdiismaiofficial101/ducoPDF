'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Calendar, Key, Shield } from 'lucide-react';
import { getLoggedInUser, User as UserType } from '@/lib/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    setUser(getLoggedInUser());
    const sync = () => setUser(getLoggedInUser());
    window.addEventListener('auth-state-change', sync);
    return () => window.removeEventListener('auth-state-change', sync);
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign in required</h2>
          <p className="text-slate-500 text-sm mb-6">Please log in to view your profile.</p>
          <button onClick={() => router.push('/login')}
            className="w-full py-3 bg-[#1A237E] hover:bg-[#151D65] text-white rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => router.push('/')} className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] text-white rounded-3xl p-8 shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-[80px]" />
        <div className="relative z-10 flex items-center space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">{user.name}</h1>
            <p className="text-indigo-200/80 text-sm mt-1">
              <Shield className="w-3.5 h-3.5 inline mr-1" />
              {user.tier}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2 text-[#1A237E]" />
            Account Details
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <User className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Full Name</p>
                <p className="font-medium text-slate-900">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Email</p>
                <p className="font-medium text-slate-900">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <Calendar className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">Member Since</p>
                <p className="font-medium text-slate-900">{user.joinedDate}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
              <Key className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-xs text-slate-500">API Key</p>
                <p className="font-medium text-slate-900 font-mono text-sm">{user.apiKey}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button onClick={() => router.push('/dashboard')}
              className="w-full text-left p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer">
              <span className="font-bold text-slate-900">Go to Dashboard</span>
              <p className="text-xs text-slate-500 mt-0.5">View activity history and developer tools</p>
            </button>
            <button onClick={() => router.push('/settings')}
              className="w-full text-left p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer">
              <span className="font-bold text-slate-900">Account Settings</span>
              <p className="text-xs text-slate-500 mt-0.5">Manage preferences and configuration</p>
            </button>
            <button onClick={() => router.push('/dashboard?tab=developer')}
              className="w-full text-left p-4 bg-slate-50 hover:bg-indigo-50 rounded-xl border border-slate-100 hover:border-indigo-200 transition-all cursor-pointer">
              <span className="font-bold text-slate-900">API Keys</span>
              <p className="text-xs text-slate-500 mt-0.5">Manage your developer credentials</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
