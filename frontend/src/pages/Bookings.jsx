import { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import {
  CalendarCheck, Clock, Users, Search,
  Filter, Check, X, Plus, ChevronLeft, ChevronRight,
} from 'lucide-react';

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBooking, setNewBooking] = useState({
    customerName: '', customerPhone: '', date: '', time: '', peopleCount: 2, notes: '',
  });

  useEffect(() => { loadBookings(); }, [statusFilter, dateFilter, pagination.page]);

  const loadBookings = async () => {
    try {
      const params = new URLSearchParams({ page: pagination.page, limit: 15 });
      if (statusFilter) params.set('status', statusFilter);
      if (dateFilter) params.set('date', dateFilter);

      const res = await api.get(`/bookings?${params}`);
      setBookings(res.data.data.bookings);
      setPagination(prev => ({ ...prev, ...res.data.data.pagination }));
    } catch (err) {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/bookings/${id}`, { status });
      toast.success(`Booking ${status}`);
      loadBookings();
    } catch (err) {
      toast.error('Failed to update booking');
    }
  };

  const cancelBooking = async (id) => {
    try {
      await api.delete(`/bookings/${id}`);
      toast.success('Booking cancelled');
      loadBookings();
    } catch (err) {
      toast.error('Failed to cancel booking');
    }
  };

  const createBooking = async (e) => {
    e.preventDefault();
    try {
      await api.post('/bookings', newBooking);
      toast.success('Booking created!');
      setShowCreateModal(false);
      setNewBooking({ customerName: '', customerPhone: '', date: '', time: '', peopleCount: 2, notes: '' });
      loadBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short',
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

  return (
    <div className="page-content" id="bookings-page">
      <div className="page-header">
        <h1>Bookings</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          id="btn-create-booking"
        >
          <Plus size={18} /> New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          id="filter-status"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no-show">No Show</option>
        </select>

        <input
          type="date"
          className="form-input"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          id="filter-date"
        />

        {(statusFilter || dateFilter) && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setStatusFilter(''); setDateFilter(''); }}
            id="btn-clear-filters"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <CalendarCheck size={48} />
            <h3>No bookings found</h3>
            <p>Try adjusting your filters or create a new booking</p>
          </div>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Guests</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.customerName}</div>
                      {b.customerPhone && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>+{b.customerPhone}</div>
                      )}
                    </td>
                    <td>{formatDate(b.date)}</td>
                    <td>{formatTime(b.time)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={14} /> {b.peopleCount}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-full)',
                        background: b.source === 'whatsapp' ? 'rgba(37, 211, 102, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                        color: b.source === 'whatsapp' ? 'var(--color-whatsapp)' : 'var(--color-info)',
                        fontWeight: 600,
                      }}>
                        {b.source === 'whatsapp' ? '💬 WhatsApp' : '🖥️ Dashboard'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${b.status}`}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        {b.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => updateStatus(b._id, 'confirmed')}
                            title="Confirm"
                          >
                            <Check size={14} />
                          </button>
                        )}
                        {['pending', 'confirmed'].includes(b.status) && (
                          <>
                            <button
                              className="btn btn-sm btn-ghost"
                              onClick={() => updateStatus(b._id, 'completed')}
                              title="Complete"
                            >
                              ✓
                            </button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => cancelBooking(b._id)}
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              gap: '1rem', marginTop: '1.5rem',
            }}>
              <button
                className="btn btn-ghost btn-sm"
                disabled={pagination.page <= 1}
                onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              >
                <ChevronLeft size={16} /> Prev
              </button>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={pagination.page >= pagination.pages}
                onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowCreateModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>New Booking</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createBooking}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer Name *</label>
                  <input
                    className="form-input" required
                    value={newBooking.customerName}
                    onChange={e => setNewBooking({ ...newBooking, customerName: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    value={newBooking.customerPhone}
                    onChange={e => setNewBooking({ ...newBooking, customerPhone: e.target.value })}
                    placeholder="919876543210"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date *</label>
                    <input
                      type="date" className="form-input" required
                      value={newBooking.date}
                      onChange={e => setNewBooking({ ...newBooking, date: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Time *</label>
                    <input
                      type="time" className="form-input" required
                      value={newBooking.time}
                      onChange={e => setNewBooking({ ...newBooking, time: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Guests *</label>
                  <input
                    type="number" className="form-input" required min={1} max={50}
                    value={newBooking.peopleCount}
                    onChange={e => setNewBooking({ ...newBooking, peopleCount: parseInt(e.target.value) })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea
                    className="form-textarea"
                    value={newBooking.notes}
                    onChange={e => setNewBooking({ ...newBooking, notes: e.target.value })}
                    placeholder="Special requests, dietary needs..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
