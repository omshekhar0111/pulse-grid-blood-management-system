import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { isSupabaseConfigured } from '../utils/supabaseClient';
import { 
  Heart, 
  Droplet, 
  MapPin, 
  Users, 
  Search, 
  Menu, 
  X, 
  UserCheck, 
  LogOut, 
  LayoutDashboard, 
  AlertCircle,
  Building2,
  ShieldCheck,
  ChevronDown,
  Bell,
  Check,
  Database,
  Info,
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, role, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [dbModalOpen, setDbModalOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();
  const navigate = useNavigate();
  const notifRef = useRef(null);

  // Fetch notifications
  const loadNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await api.get('/notifications');
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Graceful silence if unauthenticated or offline
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 15000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  // Mark single as read
  const handleMarkSingleRead = async (id, link) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (link) {
        setNotifDropdownOpen(false);
        navigate(link);
      }
    } catch (err) {
      console.error('Mark single read error:', err);
    }
  };

  const handleDemoSignIn = async (targetRole) => {
    try {
      await demoLogin(targetRole);
      setDemoDropdownOpen(false);
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'hospital') navigate('/hospital-dashboard');
      else if (targetRole === 'requester') navigate('/requester-dashboard');
      else navigate('/donor-dashboard');
    } catch (err) {
      alert('Demo login failed: ' + err.message);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Find Blood', path: '/find-blood' },
    { name: 'Donors', path: '/donors' },
    { name: 'Blood Banks', path: '/blood-banks' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin';
    if (role === 'hospital') return '/hospital-dashboard';
    if (role === 'requester') return '/requester-dashboard';
    return '/donor-dashboard';
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
                <Droplet className="w-5 h-5 fill-white stroke-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900">PULSE</span>
                  <span className="font-extrabold text-xl tracking-tight text-red-600">GRID</span>
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold -mt-1">
                  Blood Management
                </p>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => {
                const active = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                      active
                        ? 'text-red-600 bg-red-50 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden lg:flex items-center space-x-2.5">
              
              {/* Backend Mode Pill */}
              <button
                type="button"
                onClick={() => setDbModalOpen(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border transition ${
                  isSupabaseConfigured
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
                title="Click to view database architecture status"
              >
                <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Demo Mode (Local SQLite)'}</span>
              </button>

              {/* Request Blood Quick CTA */}
              <Link
                to="/request-blood"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-red-700 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                <span>Request Blood</span>
              </Link>

              {/* Demo Switcher Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                  title="Switch instant evaluator accounts"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Demo Switcher</span>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </button>

                {demoDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-3.5 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Instant Evaluation Logins
                    </div>
                    <button
                      onClick={() => handleDemoSignIn('admin')}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Administrator</div>
                        <div className="text-[10px] text-slate-400">admin@pulsegrid.org</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDemoSignIn('hospital')}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Hospital / Blood Bank</div>
                        <div className="text-[10px] text-slate-400">apollo@hospital.org</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDemoSignIn('requester')}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Users className="w-4 h-4 text-amber-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Patient / Requester</div>
                        <div className="text-[10px] text-slate-400">requester@pulsegrid.org</div>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDemoSignIn('donor')}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                    >
                      <Heart className="w-4 h-4 text-red-600 shrink-0" />
                      <div>
                        <div className="font-bold text-slate-900">Voluntary Donor</div>
                        <div className="text-[10px] text-slate-400">priya.verma@donor.org</div>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* In-App Notifications Bell (When Authenticated) */}
              {isAuthenticated && (
                <div className="relative" ref={notifRef}>
                  <button
                    type="button"
                    onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                    className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                    title="View notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="flex items-center justify-between px-4 pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-red-600" />
                          <span className="font-extrabold text-xs text-slate-900">Notifications</span>
                          {unreadCount > 0 && (
                            <span className="bg-red-50 text-red-700 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                              {unreadCount} unread
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-[11px] font-semibold text-red-600 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 px-1">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 8).map((n) => (
                            <div
                              key={n.id}
                              onClick={() => handleMarkSingleRead(n.id, n.link)}
                              className={`p-3 rounded-xl cursor-pointer transition text-left flex items-start gap-2.5 ${
                                !n.is_read ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                                !n.is_read ? 'bg-red-600' : 'bg-transparent'
                              }`} />
                              <div className="flex-1 space-y-0.5">
                                <div className="text-xs font-bold text-slate-900">{n.title}</div>
                                <p className="text-[11px] text-slate-600 leading-snug line-clamp-2">{n.message}</p>
                                <span className="text-[10px] text-slate-400 font-mono block pt-0.5">
                                  {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'Just now'}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Auth Actions */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                    <span className="text-[10px] bg-white/20 text-white uppercase px-1.5 py-0.5 rounded font-mono font-bold">
                      {role}
                    </span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                  <Link
                    to="/login"
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/20 transition"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-2">
              <Link
                to="/request-blood"
                className="px-2.5 py-1 text-xs font-bold text-red-700 bg-red-50 border border-red-200 rounded-lg"
              >
                Request
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                {link.name}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-200 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to={getDashboardPath()}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center py-2.5 rounded-xl text-xs font-bold bg-slate-900 text-white"
                  >
                    Go to Dashboard ({role})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-center py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center py-2.5 rounded-xl text-xs font-bold bg-red-600 text-white"
                  >
                    Register
                  </Link>
                </div>
              )}
              
              {/* Quick Demo Logins in Mobile Menu */}
              <div className="pt-2 text-[11px] text-slate-500 font-bold uppercase tracking-wider">Demo Evaluator Logins:</div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { handleDemoSignIn('admin'); setMobileMenuOpen(false); }}
                  className="py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
                >
                  Admin
                </button>
                <button
                  onClick={() => { handleDemoSignIn('hospital'); setMobileMenuOpen(false); }}
                  className="py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
                >
                  Hospital
                </button>
                <button
                  onClick={() => { handleDemoSignIn('requester'); setMobileMenuOpen(false); }}
                  className="py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
                >
                  Requester
                </button>
                <button
                  onClick={() => { handleDemoSignIn('donor'); setMobileMenuOpen(false); }}
                  className="py-2 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
                >
                  Donor
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Database Mode Details Modal */}
      {dbModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-red-600" />
                <h3 className="font-extrabold text-base text-slate-900">PULSE GRID Database Architecture</h3>
              </div>
              <button
                onClick={() => setDbModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-800 block">Current Operating Mode:</span>
                <span className="font-mono font-extrabold text-sm text-red-600">
                  {isSupabaseConfigured ? 'Connected to Supabase Cloud PostgreSQL' : 'Local SQLite & REST Engine (Demo Mode)'}
                </span>
              </div>

              <p>
                <strong>Supabase Ready:</strong> The full PostgreSQL schema with Row Level Security (RLS) policies, foreign keys, check constraints, and stored procedure <code className="bg-slate-100 px-1 py-0.5 rounded text-red-600 font-mono">issue_blood_units</code> is available in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">supabase/migrations/20261024_pulsegrid_init.sql</code> and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">supabase_schema.sql</code>.
              </p>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-blue-900 space-y-1">
                <span className="font-bold block">How to enable Supabase Cloud:</span>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Create a free project at supabase.com</li>
                  <li>Run <code className="font-mono">supabase_schema.sql</code> in the Supabase SQL Editor</li>
                  <li>Add <code className="font-mono">VITE_SUPABASE_URL</code> and <code className="font-mono">VITE_SUPABASE_ANON_KEY</code> to <code className="font-mono">client/.env</code></li>
                </ol>
              </div>

              <p className="text-[11px] text-slate-400">
                While credentials are not provided, Pulse Grid runs with complete full-stack functionality via its embedded relational engine and SQLite driver.
              </p>
            </div>

            <button
              onClick={() => setDbModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
            >
              Close Information
            </button>
          </div>
        </div>
      )}
    </>
  );
}
