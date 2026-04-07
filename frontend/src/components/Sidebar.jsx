import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, CalendarCheck, UtensilsCrossed,
  Settings, MessageSquareMore, LogOut, MessageCircle,
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard', section: 'main' },
  { path: '/bookings', icon: CalendarCheck, label: 'Bookings', section: 'main' },
  { path: '/menu', icon: UtensilsCrossed, label: 'Menu Manager', section: 'main' },
  { path: '/reviews', icon: MessageSquareMore, label: 'Review Responder', section: 'tools' },
  { path: '/settings', icon: Settings, label: 'Settings', section: 'settings' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, business, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  };

  const mainItems = navItems.filter(i => i.section === 'main');
  const toolItems = navItems.filter(i => i.section === 'tools');
  const settingsItems = navItems.filter(i => i.section === 'settings');

  return (
    <aside className="sidebar" id="sidebar-nav">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <MessageCircle size={22} />
        </div>
        <div>
          <h1>GoaBot AI</h1>
          <span>WhatsApp Assistant</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Main</div>
        </div>
        {mainItems.map(item => (
          <button
            key={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}

        <div className="sidebar-section">
          <div className="sidebar-section-title">AI Tools</div>
        </div>
        {toolItems.map(item => (
          <button
            key={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}

        <div className="sidebar-section">
          <div className="sidebar-section-title">Configuration</div>
        </div>
        {settingsItems.map(item => (
          <button
            key={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
            id={`nav-${item.label.toLowerCase().replace(/\s/g, '-')}`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{getInitials(user?.name)}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name || 'User'}</div>
            <div className="sidebar-user-role">{business?.name || 'Business'}</div>
          </div>
        </div>
        <button
          className="sidebar-link"
          onClick={handleLogout}
          id="btn-logout"
          style={{ marginTop: '0.5rem', color: 'var(--color-error)' }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
