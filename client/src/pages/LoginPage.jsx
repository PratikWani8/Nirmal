import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Leaf, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    setError('');
    try {
      await demoLogin();
      navigate('/dashboard');
    } catch (err) {
      setError('Demo login failed. Please register a new account.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white mx-auto flex items-center justify-center shadow-soft">
          <Leaf className="w-6 h-6 text-forest-300" />
        </div>
        <h1 className="text-2xl font-bold text-forest-900 dark:text-white tracking-tight">
          Welcome to Nirmal
        </h1>
        <p className="text-xs text-forest-700/60 dark:text-forest-300/60">
          Sign in to your Environmental Intelligence Workspace
        </p>
      </div>

      <Card padding="p-6 sm:p-8">
        {error && (
          <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-forest-600/60 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-forest-600/60 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full mt-2 font-bold"
          >
            Sign In
          </Button>

          <div className="relative my-4 text-center">
            <span className="bg-white dark:bg-[#1D2421] px-2 text-[10px] text-gray-400 uppercase tracking-wider relative z-10">
              or quick access
            </span>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-forest-100 dark:border-white/10" />
            </div>
          </div>

          <Button
            variant="secondary"
            onClick={handleDemo}
            loading={demoLoading}
            icon={Sparkles}
            className="w-full font-semibold"
          >
            Instant 1-Click Demo Login
          </Button>
        </form>

        <p className="text-center text-xs text-forest-700/70 dark:text-forest-300/70 mt-6">
          Don't have an account?{' '}
          <NavLink to="/register" className="font-bold text-forest-800 dark:text-forest-200 hover:underline">
            Register Here
          </NavLink>
        </p>
      </Card>
    </div>
  );
}
