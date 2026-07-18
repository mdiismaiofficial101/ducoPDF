'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Bell, Shield, Palette, Globe, ChevronRight } from 'lucide-react';
import { getLoggedInUser, User as UserType } from '@/lib/auth';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    setUser(getLoggedInUser());
    const sync = () => setUser(getLoggedInUser());
    window.addEventListener('auth-state-change', sync);
    return () => window.removeEventListener('auth-state-change', sync);
  }, []);

  const sections = [
    { icon: User, label: 'Profile', desc: 'Name, email, avatar' },
    { icon: Bell, label: 'Notifications', desc: 'Email and push preferences' },
    { icon: Shield, label: 'Privacy & Security', desc: 'Password, 2FA, sessions' },
    { icon: Palette, label: 'Appearance', desc: 'Theme, language, layout' },
    { icon: Globe, label: 'Regional', desc: 'Timezone, date format' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={() => router.push('/')} className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer mb-8">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      <h1 className="text-3xl font-bold text-[#1A237E] mb-2">Settings</h1>
      <p className="text-slate-500 mb-8">Manage your account preferences and configuration.</p>

      {!user && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 text-sm text-amber-800">
          <strong>Note:</strong> Sign in to save your settings across sessions.
        </div>
      )}

      <div className="space-y-3">
        {sections.map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all cursor-pointer group">
            <div className="flex items-center space-x-4">
              <div className="p-2.5 bg-slate-100 rounded-xl text-slate-600 group-hover:bg-indigo-50 group-hover:text-[#1A237E] transition-colors">
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{s.label}</h3>
                <p className="text-xs text-slate-500">{s.desc}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1A237E] transition-colors" />
          </div>
        ))}
      </div>
    </div>
  );
}
