import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import toast from 'react-hot-toast';
import { Save, MapPin, Clock, Phone, Globe } from 'lucide-react';

export default function BusinessSettings() {
  const { business, updateBusiness } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'restaurant', description: '', phone: '',
    location: { address: '', googleMapsUrl: '' },
    contact: { email: '', phone: '', instagram: '', website: '' },
    timings: {},
    whatsappPhoneNumberId: '', whatsappAccessToken: '',
    geminiApiKey: '', systemPrompt: '',
  });

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name || '',
        type: business.type || 'restaurant',
        description: business.description || '',
        phone: business.phone || '',
        location: {
          address: business.location?.address || '',
          googleMapsUrl: business.location?.googleMapsUrl || '',
        },
        contact: {
          email: business.contact?.email || '',
          phone: business.contact?.phone || '',
          instagram: business.contact?.instagram || '',
          website: business.contact?.website || '',
        },
        timings: business.timings || {},
        whatsappPhoneNumberId: business.whatsappPhoneNumberId || '',
        whatsappAccessToken: business.whatsappAccessToken || '',
        geminiApiKey: business.geminiApiKey || '',
        systemPrompt: business.systemPrompt || '',
      });
    }
  }, [business]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await api.put('/business', form);
      updateBusiness(res.data.data);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const toggleChatbot = async () => {
    try {
      const res = await api.patch('/business/chatbot-toggle');
      updateBusiness({ ...business, chatbotEnabled: res.data.data.chatbotEnabled });
      toast.success(res.data.message);
    } catch (err) {
      toast.error('Failed to toggle chatbot');
    }
  };

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const updateTiming = (day, field, value) => {
    setForm(prev => ({
      ...prev,
      timings: {
        ...prev.timings,
        [day]: { ...prev.timings[day], [field]: value },
      },
    }));
  };

  return (
    <div className="page-content" id="settings-page">
      <div className="page-header">
        <h1>Business Settings</h1>
        <button className="btn btn-primary" onClick={handleSave} disabled={loading} id="btn-save-settings">
          <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Chatbot Toggle */}
      <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>WhatsApp Chatbot</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {business?.chatbotEnabled ? 'Bot is responding to messages' : 'Bot is paused'}
          </p>
        </div>
        <label className="toggle-switch">
          <input type="checkbox" checked={business?.chatbotEnabled || false} onChange={toggleChatbot} />
          <span className="toggle-slider"></span>
        </label>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="settings-section">
          <h3><MapPin size={18} style={{ display: 'inline', marginRight: 8 }} />Business Info</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Business Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="restaurant">Restaurant</option>
                <option value="cafe">Cafe</option>
                <option value="shack">Beach Shack</option>
                <option value="homestay">Homestay</option>
                <option value="bar">Bar</option>
                <option value="resort">Resort</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Address</label>
              <input className="form-input" value={form.location.address} onChange={e => setForm({...form, location: {...form.location, address: e.target.value}})} />
            </div>
            <div className="form-group">
              <label className="form-label">Google Maps URL</label>
              <input className="form-input" value={form.location.googleMapsUrl} onChange={e => setForm({...form, location: {...form.location, googleMapsUrl: e.target.value}})} />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3><Phone size={18} style={{ display: 'inline', marginRight: 8 }} />Contact</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.contact.phone} onChange={e => setForm({...form, contact: {...form.contact, phone: e.target.value}})} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" value={form.contact.email} onChange={e => setForm({...form, contact: {...form.contact, email: e.target.value}})} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Instagram</label>
              <input className="form-input" value={form.contact.instagram} onChange={e => setForm({...form, contact: {...form.contact, instagram: e.target.value}})} />
            </div>
            <div className="form-group">
              <label className="form-label">Website</label>
              <input className="form-input" value={form.contact.website} onChange={e => setForm({...form, contact: {...form.contact, website: e.target.value}})} />
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h3><Clock size={18} style={{ display: 'inline', marginRight: 8 }} />Operating Hours</h3>
          {days.map(day => (
            <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <span style={{ width: 80, fontSize: '0.85rem', fontWeight: 600, textTransform: 'capitalize' }}>{day}</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.timings[day]?.closed || false} onChange={e => updateTiming(day, 'closed', e.target.checked)} />
                Closed
              </label>
              {!form.timings[day]?.closed && (
                <>
                  <input type="time" className="form-input" style={{ width: 130, padding: '0.4rem 0.6rem' }} value={form.timings[day]?.open || '09:00'} onChange={e => updateTiming(day, 'open', e.target.value)} />
                  <span style={{ color: 'var(--text-muted)' }}>to</span>
                  <input type="time" className="form-input" style={{ width: 130, padding: '0.4rem 0.6rem' }} value={form.timings[day]?.close || '23:00'} onChange={e => updateTiming(day, 'close', e.target.value)} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API Settings */}
      <div className="card">
        <div className="settings-section">
          <h3><Globe size={18} style={{ display: 'inline', marginRight: 8 }} />API Configuration</h3>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">WhatsApp Phone Number ID</label>
              <input className="form-input" value={form.whatsappPhoneNumberId} onChange={e => setForm({...form, whatsappPhoneNumberId: e.target.value})} placeholder="From Meta Developer Dashboard" />
            </div>
            <div className="form-group">
              <label className="form-label">WhatsApp Access Token</label>
              <input className="form-input" type="password" value={form.whatsappAccessToken} onChange={e => setForm({...form, whatsappAccessToken: e.target.value})} placeholder="Permanent access token" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Gemini API Key (optional override)</label>
            <input className="form-input" type="password" value={form.geminiApiKey} onChange={e => setForm({...form, geminiApiKey: e.target.value})} placeholder="AIza..." />
          </div>
          <div className="form-group">
            <label className="form-label">Custom System Prompt</label>
            <textarea className="form-textarea" value={form.systemPrompt} onChange={e => setForm({...form, systemPrompt: e.target.value})} rows={4} placeholder="Leave empty to use default prompt" />
          </div>
        </div>
      </div>
    </div>
  );
}
