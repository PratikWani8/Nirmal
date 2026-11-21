import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { notificationsAPI } from '../services/api';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import {
  Bell,
  AlertTriangle,
  Info,
  CalendarCheck,
  CheckCheck,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationsAPI.getAll();
      if (res.data?.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load notifications:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.warn('Error marking read:', err.message);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.warn('Error marking all read:', err.message);
    }
  };

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'warning') return n.severity === 'warning' || n.severity === 'critical';
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#1D2421] border border-forest-100 dark:border-white/10 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-forest-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-forest-700 dark:text-forest-300" />
            Environmental Alerts & Notifications
          </h1>
          <p className="text-xs text-forest-700/60 dark:text-forest-300/60 mt-0.5">
            Real-time smog warnings, ventilation window alerts, and community incident updates.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleMarkAllRead}
          icon={CheckCheck}
        >
          Mark All as Read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'all'
              ? 'bg-forest-800 text-white dark:bg-forest-700'
              : 'bg-white dark:bg-[#1D2421] text-forest-800 dark:text-gray-300 border border-forest-100 dark:border-white/10'
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'unread'
              ? 'bg-forest-800 text-white dark:bg-forest-700'
              : 'bg-white dark:bg-[#1D2421] text-forest-800 dark:text-gray-300 border border-forest-100 dark:border-white/10'
          }`}
        >
          Unread
        </button>
        <button
          onClick={() => setFilter('warning')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'warning'
              ? 'bg-forest-800 text-white dark:bg-forest-700'
              : 'bg-white dark:bg-[#1D2421] text-forest-800 dark:text-gray-300 border border-forest-100 dark:border-white/10'
          }`}
        >
          Warnings & Smog Alerts
        </button>
      </div>

      {/* List */}
      <Card padding="p-2 sm:p-3">
        <div className="divide-y divide-forest-100/60 dark:divide-white/5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-forest-700/60 dark:text-forest-300/60">
              No notifications matching this filter.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item._id}
                onClick={() => handleMarkRead(item._id)}
                className={`p-4 rounded-xl transition flex items-start justify-between gap-4 cursor-pointer ${
                  item.read
                    ? 'hover:bg-forest-50/50 dark:hover:bg-white/5 opacity-80'
                    : 'bg-forest-50/40 dark:bg-forest-900/20 hover:bg-forest-50/80 font-medium'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.severity === 'warning' || item.severity === 'critical'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                        : 'bg-forest-100 text-forest-700 dark:bg-forest-800 dark:text-forest-300'
                    }`}
                  >
                    {item.severity === 'warning' ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-forest-900 dark:text-white">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-forest-600" />
                      )}
                    </div>
                    <p className="text-xs text-forest-700/80 dark:text-forest-300/80 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-gray-400 block pt-0.5">
                      {new Date(item.createdAt).toLocaleDateString()} at{' '}
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {item.link && (
                  <NavLink
                    to={item.link}
                    className="shrink-0 p-1.5 rounded-lg text-forest-700 hover:text-forest-900 dark:text-forest-300 hover:bg-forest-100/60 transition"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </NavLink>
                )}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
