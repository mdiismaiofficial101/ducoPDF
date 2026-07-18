'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User as UserIcon, Shield, Zap, History, Key, 
  Sparkles, CheckCircle2, Clipboard, ArrowRight, 
  Trash2, FileText, Layers, Scissors, Settings, Clock, AlertCircle, ArrowLeft 
} from 'lucide-react';
import { getLoggedInUser, getProcessingHistory, logoutUser, HistoryItem, User } from '@/lib/auth';
import AnimatedIcon from '@/components/AnimatedIcon';

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultTab = searchParams ? searchParams.get('tab') : 'overview';

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState(defaultTab || 'overview');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Sync state on load and state change
  useEffect(() => {
    const activeUser = getLoggedInUser();
    const historyData = getProcessingHistory();

    const timer = setTimeout(() => {
      setUser(activeUser);
      setHistory(historyData);
    }, 0);

    const syncState = () => {
      setUser(getLoggedInUser());
      setHistory(getProcessingHistory());
    };

    window.addEventListener('auth-state-change', syncState);
    window.addEventListener('history-updated', syncState);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('auth-state-change', syncState);
      window.removeEventListener('history-updated', syncState);
    };
  }, []);

  const handleCopyToken = () => {
    if (!user) return;
    navigator.clipboard.writeText(user.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    const code = `curl -X POST "https://api.omnipdf.com/v1/merge" \\
  -H "Authorization: Bearer ${user?.apiKey || 'YOUR_TOKEN'}" \\
  -F "files=@document1.pdf" \\
  -F "files=@document2.pdf"`;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear your local processing history?')) {
      localStorage.setItem('omnitemp_history', JSON.stringify([]));
      setHistory([]);
      window.dispatchEvent(new Event('history-updated'));
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push('/');
  };

  // GATEWAY REDIRECT IF NOT LOGGED IN
  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl"
        >
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Workspace Locked</h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Please log in or register a free account to enter your private PDF processing dashboard workspace.
          </p>
          <div className="flex flex-col space-y-3">
            <Link 
              href="/login" 
              className="w-full text-center py-3 bg-[#1A237E] hover:bg-[#151D65] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all"
            >
              Sign In to Workspace
            </Link>
            <Link 
              href="/signup" 
              className="w-full text-center py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
            >
              Register Free Pro Account
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      
      <button onClick={() => router.push('/')} className="inline-flex items-center space-x-2 text-sm font-bold text-slate-600 hover:text-[#1A237E] transition cursor-pointer mb-4">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home</span>
      </button>

      {/* PROFILE WELCOME CARD */}
      <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden">
        {/* Glowing blur ball */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-amber-400/10 rounded-full blur-[80px]" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 z-10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
              {user.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">{user.name}</h1>
                <span className="flex items-center space-x-1 px-2.5 py-0.5 text-xs bg-amber-400 text-slate-900 font-bold rounded-full shadow-sm animate-pulse">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pro</span>
                </span>
              </div>
              <p className="text-indigo-200/80 text-sm mt-0.5">{user.email} &bull; Member since {user.joinedDate}</p>
            </div>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 gap-4 border-t border-indigo-400/20 pt-4 md:pt-0 md:border-none">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[120px] border border-white/5">
              <div className="text-xs text-indigo-200 font-medium">Files Processed</div>
              <div className="text-2xl font-extrabold mt-1">{history.length}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 min-w-[120px] border border-white/5">
              <div className="text-xs text-indigo-200 font-medium">Daily Limit</div>
              <div className="text-2xl font-extrabold mt-1 text-emerald-400">Unlimited</div>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS CONTAINER */}
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* TABS SELECTOR (LEFT SIDEBAR) */}
        <div className="w-full md:w-64 flex-shrink-0 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible border-b md:border-b-0 md:border-r border-slate-200 gap-1 pb-2 md:pb-0 pr-0 md:pr-4">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'overview' 
                ? 'bg-[#1A237E] text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'history' 
                ? 'bg-[#1A237E] text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Activity History</span>
            {history.length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${activeTab === 'history' ? 'bg-amber-400 text-slate-900' : 'bg-indigo-50 text-indigo-800'}`}>
                {history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('developer')}
            className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm transition text-left whitespace-nowrap cursor-pointer ${
              activeTab === 'developer' 
                ? 'bg-[#1A237E] text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Developer API Key</span>
          </button>
          
          <div className="hidden md:block border-t border-slate-200 my-4" />
          
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center space-x-3 px-4 py-3 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
            <span>Logout Account</span>
          </button>
        </div>

        {/* TAB CONTENTS (RIGHT PANEL) */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            
            {/* 1. OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Workspace Launchers</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link href="/merge" className="group p-5 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-indigo-50/30 hover:border-indigo-200 transition text-center flex flex-col items-center">
                      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-700 group-hover:scale-110 transition-transform mb-3">
                        <AnimatedIcon name="Merge PDF" color="text-indigo-700" className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">Merge PDFs</span>
                      <p className="text-xs text-slate-500 mt-1">Combine multi files</p>
                    </Link>
                    <Link href="/split" className="group p-5 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-amber-50/30 hover:border-amber-200 transition text-center flex flex-col items-center">
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-700 group-hover:scale-110 transition-transform mb-3">
                        <AnimatedIcon name="Split PDF" color="text-amber-700" className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">Split PDF</span>
                      <p className="text-xs text-slate-500 mt-1">Extract specific sheets</p>
                    </Link>
                    <Link href="/rotate" className="group p-5 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-emerald-50/30 hover:border-emerald-200 transition text-center flex flex-col items-center">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 group-hover:scale-110 transition-transform mb-3">
                        <AnimatedIcon name="Rotate PDF" color="text-emerald-700" className="w-6 h-6" />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">Rotate PDF</span>
                      <p className="text-xs text-slate-500 mt-1">Change visual orientation</p>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                    <h4 className="font-bold text-slate-900 mb-2">Subscription & Tier</h4>
                    <p className="text-sm text-slate-500 mb-4 leading-relaxed">
                      You are currently using <strong>DocuPDF Premium Pro</strong> (complimentary). Enjoy infinite file sizes, parallel server compression, and instant conversion rates.
                    </p>
                    <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-center space-x-2.5 text-xs text-amber-800 font-semibold">
                      <Sparkles className="w-4 h-4 text-[#FF6F00] flex-shrink-0" />
                      <span>Complimentary Developer Access fully active!</span>
                    </div>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 mb-2">Workspace History Overview</h4>
                      <p className="text-sm text-slate-500 leading-relaxed mb-4">
                        You have {history.length} active documents in your secure local sandbox space. Access logs from the sidebar.
                      </p>
                    </div>
                    <button 
                      onClick={() => setActiveTab('history')}
                      className="inline-flex items-center space-x-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900 transition mt-2 text-left cursor-pointer"
                    >
                      <span>View full activity records</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. ACTIVITY HISTORY TAB */}
            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Activity Log</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Secure sandbox processing log (stored strictly on your machine)</p>
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Logs</span>
                    </button>
                  )}
                </div>

                {history.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h4 className="font-bold text-slate-700 mb-1">No Processing History</h4>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Any PDFs you merge, split, or rotate in this session will display a dynamic secure log item right here.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 font-medium text-xs uppercase">
                          <th className="py-3 px-4 font-bold">Operation</th>
                          <th className="py-3 px-4 font-bold">File Name</th>
                          <th className="py-3 px-4 font-bold">Date</th>
                          <th className="py-3 px-4 font-bold text-right">Size</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 text-slate-700">
                        {history.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 px-4">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                                item.action.includes('Merge') 
                                  ? 'bg-indigo-50 text-indigo-700' 
                                  : item.action.includes('Split') 
                                  ? 'bg-amber-50 text-amber-700' 
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {item.action}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-slate-950 truncate max-w-[180px] sm:max-w-xs">
                              {item.fileName}
                            </td>
                            <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                              {item.date}
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-500 font-mono text-xs">
                              {item.size}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. DEVELOPER API KEY TAB */}
            {activeTab === 'developer' && (
              <motion.div
                key="developer"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-6"
              >
                {/* Token Display widget */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Developer Credentials</h3>
                  <p className="text-xs text-slate-500 mb-6">Integrate DocuPDF merging and splitting engines directly in your Node/Python applications.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                        Client API Token
                      </label>
                      <div className="flex max-w-md items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden pr-1.5 py-1.5 pl-3">
                        <code className="text-xs font-mono text-indigo-700 select-all truncate flex-1 pr-4">
                          {user.apiKey}
                        </code>
                        <button
                          onClick={handleCopyToken}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                        >
                          <Clipboard className="w-3.5 h-3.5" />
                          <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* CURL sample documentation */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl overflow-hidden relative">
                  <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[40px]" />
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-xs font-mono text-slate-400">cURL REST request</span>
                    <button
                      onClick={handleCopyCode}
                      className="text-xs flex items-center space-x-1 text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>{copiedCode ? 'Copied Code!' : 'Copy snippet'}</span>
                    </button>
                  </div>
                  
                  <pre className="text-xs font-mono text-amber-300 leading-relaxed overflow-x-auto py-2">
                    {`curl -X POST "https://api.omnipdf.com/v1/merge" \\
  -H "Authorization: Bearer ${user.apiKey}" \\
  -F "files=@document1.pdf" \\
  -F "files=@document2.pdf"`}
                  </pre>
                  
                  <div className="border-t border-slate-800 mt-4 pt-4 text-[11px] text-slate-400">
                    Response payload will return a JSON containing the output compiled binary URL instantly.
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
