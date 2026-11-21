import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { Leaf, Lock, Mail, User, MapPin } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register({
        name,
        email,
        password,
        preferredLanguage,
        location: { city, country: 'India' },
      });
      navigate('/onboarding');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-forest-800 text-white mx-auto flex items-center justify-center shadow-soft">
          <Leaf className="w-6 h-6 text-forest-300" />
        </div>
        <h1 className="text-2xl font-bold text-forest-900 dark:text-white tracking-tight">
          Create Nirmal Account
        </h1>
        <p className="text-xs text-forest-700/60 dark:text-forest-300/60">
          Personalized clean air routines, simulations, and community impact
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
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-forest-600/60 absolute left-3 top-2.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aarav Sharma"
                required
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

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
                placeholder="Minimum 6 characters"
                required
                minLength={6}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                Primary City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              >
                <option value="New Delhi">New Delhi</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Pune">Pune</option>
                <option value="Bengaluru">Bengaluru</option>
                <option value="Kolkata">Kolkata</option>
                <option value="Chennai">Chennai</option>
                <option value="Hyderabad">Hyderabad</option>
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Lucknow">Lucknow</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-forest-900 dark:text-white block mb-1">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-forest-50 dark:bg-forest-900/30 border border-forest-100 dark:border-white/10 text-forest-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-forest-500/20"
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mr">मराठी (Marathi)</option>
              </select>
            </div>
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full mt-2 font-bold"
          >
            Create Account & Continue
          </Button>
        </form>

        <p className="text-center text-xs text-forest-700/70 dark:text-forest-300/70 mt-6">
          Already have an account?{' '}
          <NavLink to="/login" className="font-bold text-forest-800 dark:text-forest-200 hover:underline">
            Sign In Here
          </NavLink>
        </p>
      </Card>
    </div>
  );
}
