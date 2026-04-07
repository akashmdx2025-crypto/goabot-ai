import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import {
  CalendarCheck, Users, MessageSquare, TrendingUp,
  ArrowRight, Clock, User, UsersRound,
} from 'lucide-react';

export default function Dashboard() {
  const { business } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalBookings: 0,
    todayBookings: 0,
    totalCustomers: 0,
    activeBookings: 0,
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, bookingsRes] = await Promise.all([
        api.get('/business/stats'),
        api.get('/bookings?limit=5'),
      ]);
      setStats(statsRes.data.data);
      setRecentBookings(bookingsRes.data.data.bookings);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page-content" id="dashboard-page">
      {/* Welcome */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.25rem' }}>
          Welcome back! 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Here's what's happening at <strong style={{ color: 'var(--color-primary)' }}>{business?.name || 'your business'}</strong> today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card" id="stat-total-bookings">
          <div className="stat-icon primary">
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Bookings</h3>
            <div className="stat-value">{stats.totalBookings}</div>
          </div>
        </div>

        <div className="stat-card" id="stat-today-bookings">
          <div className="stat-icon accent">
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>Today's Bookings</h3>
            <div className="stat-value">{stats.todayBookings}</div>
          </div>
        </div>

        <div className="stat-card" id="stat-total-customers">
          <div className="stat-icon info">
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Customers</h3>
            <div className="stat-value">{stats.totalCustomers}</div>
          </div>
        </div>

        <div className="stat-card" id="stat-active-bookings">
          <div className="stat-icon success">
            <MessageSquare size={24} />
          </div>
          <div className="stat-info">
            <h3>Active Bookings</h3>
            <div className="stat-value">{stats.activeBookings}</div>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: '1.25rem',
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Bookings</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/bookings')}
            id="btn-view-all-bookings"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <div className="empty-state">
            <CalendarCheck size={48} />
            <h3>No bookings yet</h3>
            <p>Bookings from WhatsApp will appear here automatically</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(booking => (
                  <tr key={booking._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 600, color: 'white', flexShrink: 0,
                        }}>
                          {booking.customerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                            {booking.customerName}
                          </div>
                          {booking.customerPhone && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              +{booking.customerPhone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CalendarCheck size={14} style={{ color: 'var(--text-muted)' }} />
                        {formatDate(booking.date)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} style={{ color: 'var(--text-muted)' }} />
                        {formatTime(booking.time)}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <UsersRound size={14} style={{ color: 'var(--text-muted)' }} />
                        {booking.peopleCount}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${booking.status}`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <button
          className="card"
          onClick={() => navigate('/menu')}
          style={{ cursor: 'pointer', textAlign: 'left' }}
          id="quick-action-menu"
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>🍽️</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Update Menu</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Add or edit your dishes
          </div>
        </button>

        <button
          className="card"
          onClick={() => navigate('/settings')}
          style={{ cursor: 'pointer', textAlign: 'left' }}
          id="quick-action-settings"
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚙️</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Business Settings</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Update hours, location, contact
          </div>
        </button>

        <button
          className="card"
          onClick={() => navigate('/reviews')}
          style={{ cursor: 'pointer', textAlign: 'left' }}
          id="quick-action-reviews"
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>💬</div>
          <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Review Responder</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Generate AI replies to reviews
          </div>
        </button>
      </div>
    </div>
  );
}
