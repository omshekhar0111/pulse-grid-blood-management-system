import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Droplet, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  ShieldCheck, 
  Building2, 
  Heart,
  Users
} from 'lucide-react';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const redirectAfterLogin = (role) => {
    if (location.state?.from) {
      navigate(location.state.from);
      return;
    }
    if (role === 'admin') navigate('/admin');
    else if (role === 'hospital') navigate('/hospital-dashboard');
    else if (role === 'requester') navigate('/requester-dashboard');
    else navigate('/donor-dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        redirectAfterLogin(res.user.role);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async (role) => {
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await demoLogin(role);
      if (res.success) {
        redirectAfterLogin(res.user.role);
      }
    } catch (err) {
      setErrorMsg('Demo sign-in failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
        
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center mx-auto shadow-md shadow-red-600/30">
            <Droplet className="w-6 h-6 fill-white" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Sign In to PULSE GRID
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Secure role-based access for Donors, Requesters, Hospitals, and Admins
          </p>
        </div>

        {/* Demo Quick Logins Box (Great for examiners & testing) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider text-center">
            One-Click Evaluator Logins
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoSignIn('admin')}
              className="py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 transition"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('hospital')}
              className="py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 transition"
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Hospital</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('requester')}
              className="py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 transition"
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Requester</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoSignIn('donor')}
              className="py-2 px-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 flex items-center justify-center gap-1.5 transition"
            >
              <Heart className="w-4 h-4 text-red-600" />
              <span>Donor</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Registered Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 text-xs text-slate-500">
          <span>Don't have an account yet? </span>
          <Link to="/register" className="font-bold text-red-600 hover:underline">
            Register Here
          </Link>
        </div>

      </div>
    </div>
  );
}
