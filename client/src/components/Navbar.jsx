import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, role, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleDemoSignIn = async (targetRole) => {
    try {
      await demoLogin(targetRole);
      setDemoDropdownOpen(false);
      if (targetRole === 'admin') navigate('/admin');
      else if (targetRole === 'hospital') navigate('/hospital-dashboard');
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
    return '/donor-dashboard';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-medical-600 to-rose-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 fill-white stroke-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-navy-900">PULSE</span>
                <span className="font-extrabold text-xl tracking-tight text-medical-600">GRID</span>
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'text-medical-600 bg-medical-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Request Blood Quick CTA */}
            <Link
              to="/request-blood"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <AlertCircle className="w-3.5 h-3.5 text-medical-600" />
              <span>Request Blood</span>
            </Link>

            {/* Demo Switcher Dropdown (helpful for project evaluators) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                title="Quick demo access for examiner testing"
              >
                <span>Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant Demo Login
                  </div>
                  <button
                    onClick={() => handleDemoSignIn('admin')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Demo Administrator</span>
                  </button>
                  <button
                    onClick={() => handleDemoSignIn('hospital')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Building2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Demo Hospital / Bank</span>
                  </button>
                  <button
                    onClick={() => handleDemoSignIn('donor')}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                  >
                    <Heart className="w-3.5 h-3.5 text-medical-600" />
                    <span>Demo Blood Donor</span>
                  </button>
                </div>
              )}
            </div>

            {/* Auth Actions */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to={getDashboardPath()}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold bg-navy-900 text-white hover:bg-navy-800 transition shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                  <span className="text-[10px] bg-white/20 text-white uppercase px-1.5 py-0.5 rounded font-mono font-bold">
                    {role}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-navy-900 hover:bg-slate-100 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-medical-600 text-white hover:bg-medical-700 shadow-sm shadow-medical-600/20 transition"
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
              className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-md"
            >
              Request
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
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
                  className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-navy-900 text-white"
                >
                  Go to Dashboard ({role})
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-center py-2 rounded-lg text-sm font-medium text-rose-600 bg-rose-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 rounded-lg text-sm font-semibold bg-medical-600 text-white"
                >
                  Register
                </Link>
              </div>
            )}
            
            {/* Quick Demo Logins in Mobile Menu */}
            <div className="pt-2 text-xs text-slate-500 font-medium">Demo Testing Logins:</div>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => { handleDemoSignIn('admin'); setMobileMenuOpen(false); }}
                className="py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-medium"
              >
                Admin
              </button>
              <button
                onClick={() => { handleDemoSignIn('hospital'); setMobileMenuOpen(false); }}
                className="py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-medium"
              >
                Hospital
              </button>
              <button
                onClick={() => { handleDemoSignIn('donor'); setMobileMenuOpen(false); }}
                className="py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-medium"
              >
                Donor
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
