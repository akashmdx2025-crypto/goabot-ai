import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    businessName: '',
    businessType: 'restaurant',
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(form);
        toast.success('Account created! Welcome aboard 🎉');
      } else {
        await login(form.email, form.password);
        toast.success('Welcome back! 👋');
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-bg-gradient"></div>
        <div className="login-bg-gradient"></div>
      </div>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <MessageCircle size={32} />
          </div>
          <h2>GoaBot AI</h2>
          <p>WhatsApp Assistant for your business</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" id="login-form">
          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Your Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Ravi Naik"
                  value={form.name}
                  onChange={handleChange}
                  required
                  id="input-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input
                  type="text"
                  name="businessName"
                  className="form-input"
                  placeholder="Sunset Beach Shack"
                  value={form.businessName}
                  onChange={handleChange}
                  required
                  id="input-business-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Business Type</label>
                <select
                  name="businessType"
                  className="form-select"
                  value={form.businessType}
                  onChange={handleChange}
                  id="input-business-type"
                >
                  <option value="restaurant">Restaurant</option>
                  <option value="cafe">Cafe</option>
                  <option value="shack">Beach Shack</option>
                  <option value="homestay">Homestay</option>
                  <option value="bar">Bar</option>
                  <option value="resort">Resort</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@business.com"
              value={form.email}
              onChange={handleChange}
              required
              id="input-email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                className="form-input"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                id="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
            id="btn-login-submit"
          >
            {loading ? (
              <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
            ) : (
              isRegister ? 'Create Account' : 'Sign In'
            )}
          </button>
        </form>

        <div className="login-footer">
          {isRegister ? (
            <>Already have an account?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(false); }}>
                Sign in
              </a>
            </>
          ) : (
            <>New to GoaBot?{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsRegister(true); }}>
                Create account
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
