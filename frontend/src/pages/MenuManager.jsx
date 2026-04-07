import { useState, useEffect } from 'react';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, Upload, X } from 'lucide-react';

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState({
    category: '', name: '', description: '', price: '', isVeg: false,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadMenu(); }, []);

  const loadMenu = async () => {
    try {
      const res = await api.get('/menu');
      setMenuItems(res.data.data.items);
    } catch (err) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await api.put(`/menu/items/${editingItem._id}`, {
          ...form, price: parseFloat(form.price),
        });
        toast.success('Menu item updated!');
      } else {
        await api.post('/menu/items', {
          ...form, price: parseFloat(form.price),
        });
        toast.success('Menu item added!');
      }
      closeModal();
      loadMenu();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    }
  };

  const deleteItem = async (id) => {
    if (!confirm('Delete this menu item?')) return;
    try {
      await api.delete(`/menu/items/${id}`);
      toast.success('Item deleted');
      loadMenu();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await api.post('/menu/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('File uploaded!');
      loadMenu();
    } catch (err) {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      category: item.category, name: item.name,
      description: item.description || '', price: item.price.toString(),
      isVeg: item.isVeg,
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditingItem(null);
    setForm({ category: '', name: '', description: '', price: '', isVeg: false });
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingItem(null); };

  const grouped = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = [...new Set(menuItems.map(i => i.category))];

  return (
    <div className="page-content" id="menu-manager-page">
      <div className="page-header">
        <div>
          <h1>Menu Manager</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            {menuItems.length} items across {categories.length} categories
          </p>
        </div>
        <div className="page-header-actions">
          <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Upload PDF/Image'}
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button className="btn btn-primary" onClick={openAddModal} id="btn-add-menu-item">
            <Plus size={18} /> Add Item
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div className="spinner"></div>
        </div>
      ) : menuItems.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🍽️</div>
            <h3>No menu items yet</h3>
            <p>Start by adding items or uploading a PDF</p>
            <button className="btn btn-primary" onClick={openAddModal} style={{ marginTop: '1rem' }}>
              <Plus size={18} /> Add First Item
            </button>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginBottom: '2rem' }}>
            <h3 style={{
              fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.05em', color: 'var(--color-primary)',
              marginBottom: '0.75rem', paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-color)',
            }}>
              {category} ({items.length})
            </h3>
            <div className="menu-grid">
              {items.map(item => (
                <div className="menu-item-card" key={item._id}>
                  <div className="menu-item-info">
                    <h4>
                      <span style={{
                        width: 10, height: 10, borderRadius: 2,
                        border: `2px solid ${item.isVeg ? 'var(--color-success)' : 'var(--color-error)'}`,
                        display: 'inline-block', marginRight: 4,
                      }} />
                      {item.name}
                      {!item.isAvailable && (
                        <span style={{
                          fontSize: '0.65rem', color: 'var(--color-error)',
                          background: 'rgba(239,68,68,0.1)', padding: '2px 6px',
                          borderRadius: 'var(--radius-full)', marginLeft: 8,
                        }}>Unavailable</span>
                      )}
                    </h4>
                    {item.description && <p>{item.description}</p>}
                    <div className="menu-item-price">₹{item.price}</div>
                  </div>
                  <div className="menu-item-actions">
                    <button className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => openEditModal(item)} title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button className="btn btn-ghost btn-icon btn-sm"
                      onClick={() => deleteItem(item._id)} title="Delete"
                      style={{ color: 'var(--color-error)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={closeModal}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <input className="form-input" required placeholder="e.g., Starters"
                    value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    list="cat-list" />
                  <datalist id="cat-list">
                    {categories.map(c => <option key={c} value={c} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label className="form-label">Item Name *</label>
                  <input className="form-input" required placeholder="e.g., Goan Fish Curry"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" placeholder="Brief description"
                    value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (₹) *</label>
                    <input type="number" className="form-input" required min={0}
                      placeholder="350" value={form.price}
                      onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dietary</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 0' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input type="checkbox" checked={form.isVeg}
                          onChange={e => setForm({ ...form, isVeg: e.target.checked })}
                          style={{ accentColor: 'var(--color-success)' }} />
                        🟢 Vegetarian
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
